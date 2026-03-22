import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── POPS sub-offices ────────────────────────────────────────────────
export const POPS_OFFICES = [
  { key: 'mbda', label: 'MBDA', fullName: 'Municipal/Barangay Drug Abuse' },
  { key: 'bjmp', label: 'BJMP', fullName: 'Bureau of Jail Management & Penology' },
  { key: 'pdea', label: 'PDEA', fullName: 'Philippine Drug Enforcement Agency' },
  { key: 'pnp', label: 'PNP', fullName: 'Philippine National Police' },
  { key: 'soco', label: 'SOCO', fullName: 'Scene of the Crime Operatives' },
  { key: 'ppdo', label: 'PPDO', fullName: 'Provincial Planning & Development Office' },
  { key: 'vgo', label: 'VGO', fullName: "Vice Governor's Office" },
  { key: 'pdrrmo', label: 'PDRRMO', fullName: 'Provincial Disaster Risk Reduction and Management Office' },
  { key: 'nbi', label: 'NBI', fullName: 'National Bureau of Investigation' },
] as const;

export type POPSOfficeKey = typeof POPS_OFFICES[number]['key'];

// ── Record shape ────────────────────────────────────────────────────
export interface POPSRecord {
  id: string;
  date: string;            // ISO date string
  prNumber: string;        // PR#
  obrNumber: string;       // OBR#
  particulars: string;
  prAmount: number;        // PR Amount
  pdAmount: number;        // P.D Amount
  dvAmount: number;        // D.V Amount
  balanceSavings: number;  // Balances/Savings
  remarks: string;
}

// ── Store ────────────────────────────────────────────────────────────
interface POPSState {
  // key = office key (e.g. 'mbda'), value = records for that office
  records: Record<string, POPSRecord[]>;
  addRecord: (office: string, record: POPSRecord) => void;
  deleteRecord: (office: string, recordId: string) => void;
  updateRecord: (office: string, record: POPSRecord) => void;
}

export const usePOPSStore = create<POPSState>()(
  persist(
    (set) => ({
      records: {},

      addRecord: (office, record) =>
        set((state) => ({
          records: {
            ...state.records,
            [office]: [...(state.records[office] || []), record],
          },
        })),

      deleteRecord: (office, recordId) =>
        set((state) => ({
          records: {
            ...state.records,
            [office]: (state.records[office] || []).filter((r) => r.id !== recordId),
          },
        })),

      updateRecord: (office, record) =>
        set((state) => ({
          records: {
            ...state.records,
            [office]: (state.records[office] || []).map((r) =>
              r.id === record.id ? record : r
            ),
          },
        })),
    }),
    { name: 'opg-pops-store' }
  )
);
