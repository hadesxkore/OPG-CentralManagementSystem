import { create } from 'zustand';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc,
  query, orderBy, writeBatch, where,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/backend/firebase';
import type { ObrSupplierRecord } from '@/types';

// Per-user localStorage key
const getLocalKey = (userId: string) => `opg_obr_supplier_tx_${userId}`;

const loadLocalRecords = (userId: string): ObrSupplierRecord[] => {
  try {
    const raw = localStorage.getItem(getLocalKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load local OBR & Supplier records', e);
    return [];
  }
};

const saveLocalRecords = (userId: string, records: ObrSupplierRecord[]) => {
  try {
    localStorage.setItem(getLocalKey(userId), JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save local OBR & Supplier records', e);
  }
};

interface ObrSupplierState {
  records: ObrSupplierRecord[];
  loading: boolean;
  subscribeTransactions: (userId: string) => Unsubscribe;
  addTransaction: (record: Omit<ObrSupplierRecord, 'id'>) => Promise<void>;
  bulkAddTransactions: (records: Omit<ObrSupplierRecord, 'id'>[]) => Promise<void>;
  updateTransaction: (record: ObrSupplierRecord) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearAllTransactions: (userId: string) => Promise<void>;
}

export const useObrSupplierStore = create<ObrSupplierState>()((set, get) => ({
  records: [],
  loading: false,

  subscribeTransactions: (userId: string) => {
    set({ loading: true, records: loadLocalRecords(userId) });
    try {
      const q = query(
        collection(db, 'obr_supplier_records'),
        where('encodedById', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const unsub = onSnapshot(q, (snap) => {
        const firestoreDocs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ObrSupplierRecord));
        set({ records: firestoreDocs, loading: false });
        saveLocalRecords(userId, firestoreDocs);
      }, (err) => {
        console.warn('Firestore subscription fallback to local storage:', err);
        set({ loading: false });
      });
      return unsub;
    } catch (e) {
      console.warn('Using local OBR & Supplier store (offline or firestore disabled)', e);
      set({ loading: false });
      return () => {};
    }
  },

  addTransaction: async (recordData) => {
    const newId = `obr-tx-${Date.now()}`;
    const newRecord: ObrSupplierRecord = {
      ...recordData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...get().records];
    set({ records: updated });
    saveLocalRecords(recordData.encodedById || '', updated);

    try {
      await addDoc(collection(db, 'obr_supplier_records'), {
        ...recordData,
        createdAt: newRecord.createdAt,
      });
    } catch (e) {
      console.warn('Added record to local storage (Firestore sync skipped)', e);
    }
  },

  bulkAddTransactions: async (recordsData) => {
    const now = new Date().toISOString();
    const newRecords: ObrSupplierRecord[] = recordsData.map((r, i) => ({
      ...r,
      id: `obr-tx-${Date.now()}-${i}`,
      createdAt: now,
    }));

    const updated = [...newRecords, ...get().records];
    set({ records: updated });
    const userId = recordsData[0]?.encodedById || '';
    saveLocalRecords(userId, updated);

    try {
      const chunkSize = 450;
      for (let i = 0; i < recordsData.length; i += chunkSize) {
        const chunk = recordsData.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(recordData => {
          const newDocRef = doc(collection(db, 'obr_supplier_records'));
          batch.set(newDocRef, { ...recordData, createdAt: now });
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('Bulk added to local storage (Firestore batch sync skipped)', e);
    }
  },

  updateTransaction: async (record) => {
    const updated = get().records.map(r => r.id === record.id ? record : r);
    set({ records: updated });
    saveLocalRecords(record.encodedById || '', updated);

    try {
      const { id, ...data } = record;
      await updateDoc(doc(db, 'obr_supplier_records', id), data);
    } catch (e) {
      console.warn('Updated record in local storage (Firestore sync skipped)', e);
    }
  },

  deleteTransaction: async (id) => {
    const userId = get().records.find(r => r.id === id)?.encodedById || '';
    const updated = get().records.filter(r => r.id !== id);
    set({ records: updated });
    saveLocalRecords(userId, updated);

    try {
      await deleteDoc(doc(db, 'obr_supplier_records', id));
    } catch (e) {
      console.warn('Deleted record from local storage (Firestore sync skipped)', e);
    }
  },

  clearAllTransactions: async (userId: string) => {
    const current = get().records;
    set({ records: [] });
    saveLocalRecords(userId, []);

    try {
      const chunkSize = 450;
      for (let i = 0; i < current.length; i += chunkSize) {
        const chunk = current.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(r => {
          batch.delete(doc(db, 'obr_supplier_records', r.id));
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('Cleared local storage records (Firestore batch clear skipped)', e);
    }
  },
}));
