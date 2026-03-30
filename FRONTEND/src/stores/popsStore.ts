import { create } from 'zustand';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc,
  query, orderBy,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/backend/firebase';

// ── POPS sub-offices ────────────────────────────────────────────────
export const POPS_OFFICES = [
  { key: 'mbda',    label: 'MBDA',    fullName: 'Municipal/Barangay Drug Abuse' },
  { key: 'bjmp',    label: 'BJMP',    fullName: 'Bureau of Jail Management & Penology' },
  { key: 'pdea',    label: 'PDEA',    fullName: 'Philippine Drug Enforcement Agency' },
  { key: 'pnp',     label: 'PNP',     fullName: 'Philippine National Police' },
  { key: 'soco',    label: 'SOCO',    fullName: 'Scene of the Crime Operatives' },
  { key: 'ppdo',    label: 'PPDO',    fullName: 'Provincial Planning & Development Office' },
  { key: 'vgo',     label: 'VGO',     fullName: "Vice Governor's Office" },
  { key: 'pdrrmo',  label: 'PDRRMO',  fullName: 'Provincial Disaster Risk Reduction and Management Office' },
  { key: 'nbi',     label: 'NBI',     fullName: 'National Bureau of Investigation' },
] as const;

export type POPSOfficeKey = typeof POPS_OFFICES[number]['key'];

// ── Record shape ────────────────────────────────────────────────────
export interface POPSRecord {
  id: string;
  date: string;
  prNumber: string;
  obrNumber: string;
  particulars: string;
  prAmount: number;
  pdAmount: number;
  dvAmount: number;
  balanceSavings: number;
  remarks: string;
  officeKey: string;
  createdAt?: string;
}

// ── Firestore collection path helper ───────────────────────────────
// Each office gets its own sub-collection: pops_records/{officeKey}/entries
const colRef = (officeKey: string) =>
  collection(db, 'pops_records', officeKey, 'entries');

// ── Store ────────────────────────────────────────────────────────────
interface POPSState {
  records: Record<string, POPSRecord[]>;
  loading: boolean;
  // Subscribe to a specific office's records live
  subscribeOffice: (officeKey: string) => Unsubscribe;
  // Subscribe to ALL offices at once (for dashboard aggregates)
  subscribeAll: () => Unsubscribe;
  addRecord: (officeKey: string, record: Omit<POPSRecord, 'id'>) => Promise<void>;
  updateRecord: (officeKey: string, record: POPSRecord) => Promise<void>;
  deleteRecord: (officeKey: string, recordId: string) => Promise<void>;
}

export const usePOPSStore = create<POPSState>()((set) => ({
  records: {},
  loading: false,

  subscribeOffice: (officeKey: string) => {
    set(s => ({ loading: true, records: { ...s.records, [officeKey]: s.records[officeKey] ?? [] } }));
    const q = query(colRef(officeKey), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as POPSRecord));
      set(s => ({
        loading: false,
        records: { ...s.records, [officeKey]: docs },
      }));
    }, () => set({ loading: false }));
    return unsub;
  },

  subscribeAll: () => {
    const unsubscribers: Unsubscribe[] = [];
    set({ loading: true });

    for (const office of POPS_OFFICES) {
      const q = query(colRef(office.key), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as POPSRecord));
        set(s => ({
          loading: false,
          records: { ...s.records, [office.key]: docs },
        }));
      }, () => set({ loading: false }));
      unsubscribers.push(unsub);
    }

    return () => unsubscribers.forEach(u => u());
  },

  addRecord: async (officeKey, record) => {
    await addDoc(colRef(officeKey), {
      ...record,
      officeKey,
      createdAt: new Date().toISOString(),
    });
  },

  updateRecord: async (officeKey, record) => {
    const { id, ...data } = record;
    await updateDoc(doc(db, 'pops_records', officeKey, 'entries', id), data);
  },

  deleteRecord: async (officeKey, recordId) => {
    await deleteDoc(doc(db, 'pops_records', officeKey, 'entries', recordId));
  },
}));
