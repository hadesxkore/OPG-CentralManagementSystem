import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StatementRecord } from '@/types';

interface StatementState {
  importedRecords: StatementRecord[];
  importedFileName: string;
  isImported: boolean;
  setImportedData: (records: StatementRecord[], fileName: string) => void;
  updateRecord: (id: string, patch: Partial<StatementRecord>) => void;
  clearImport: () => void;
}

export const useStatementStore = create<StatementState>()(
  persist(
    (set) => ({
      importedRecords: [],
      importedFileName: '',
      isImported: false,

      setImportedData: (records, fileName) =>
        set({ importedRecords: records, importedFileName: fileName, isImported: true }),

      // Update a single record and re-derive computed columns
      updateRecord: (id, patch) =>
        set((state) => ({
          importedRecords: state.importedRecords.map((r) => {
            if (r.id !== id) return r;
            const updated = { ...r, ...patch };
            if (!updated.isHeader) {
              // Re-derive computed columns on every edit
              const bal_approp = updated.appropriation - updated.allotment;
              const bal_allot  = updated.allotment     - updated.obligation;
              const util_rate  = updated.appropriation > 0
                ? (updated.obligation / updated.appropriation) * 100
                : 0;
              return {
                ...updated,
                balanceOfAppropriation: bal_approp,
                balanceOfAllotment:     bal_allot,
                utilizationRate:        util_rate,
              };
            }
            return updated;
          }),
        })),

      clearImport: () =>
        set({ importedRecords: [], importedFileName: '', isImported: false }),
    }),
    { name: 'opg-statement-store' }
  )
);
