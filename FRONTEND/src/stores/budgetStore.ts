import { create } from 'zustand';
import type { BudgetRecord } from '@/types';

interface BudgetState {
  importedRecords: BudgetRecord[];
  importedFileName: string | null;
  isImported: boolean;
  setImportedData: (records: BudgetRecord[], fileName: string) => void;
  clearImport: () => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  importedRecords: [],
  importedFileName: null,
  isImported: false,

  setImportedData: (records, fileName) =>
    set({ importedRecords: records, importedFileName: fileName, isImported: true }),

  clearImport: () =>
    set({ importedRecords: [], importedFileName: null, isImported: false }),
}));
