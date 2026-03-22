import type { StatementRecord } from '@/types';

// ── Helper: correct formulas ──────────────────────────────────────────────────
// Balance of Appropriation = Appropriation - Allotment   (unallotted)
// Balance of Allotment     = Allotment     - Obligation  (unutilized allotment)
// Utilization Rate         = Obligation    / Appropriation × 100
function makeRow(
  id: string,
  expensesClassification: string,
  appropriation: number,
  allotment: number,
  obligation: number,
  accountCode: string,
  isHeader = false,
): StatementRecord {
  return {
    id,
    expensesClassification,
    appropriation,
    allotment,
    obligation,
    balanceOfAppropriation: appropriation - allotment,
    balanceOfAllotment:     allotment     - obligation,
    utilizationRate:        appropriation > 0 ? (obligation / appropriation) * 100 : 0,
    accountCode,
    isHeader,
  };
}

// ── Mock data ─────────────────────────────────────────────────────────────────
export const MOCK_STATEMENT_RECORDS: StatementRecord[] = [
  makeRow('s001', 'A. PERSONAL SERVICES (PS)', 0, 0, 0, '', true),
  makeRow('s002', '   Salaries and Wages – Regular',           42_500_000, 38_200_000, 12_611_245.99, '701'),
  makeRow('s003', '   PERA',                                    7_200_000,  6_480_000,  1_020_000.00, '711'),
  makeRow('s004', '   Clothing/Uniform Allowance',                848_000,    763_200,    212_000.00, '715'),
  makeRow('s005', '   Productivity Enhancement Incentive',        636_000,    572_400,    159_000.00, '717'),
  makeRow('s006', '   Year End Bonus',                          3_541_667,  3_187_500,          0.00, '723'),
  makeRow('s007', '   Cash Gift',                                 636_000,    572_400,          0.00, '724'),
  makeRow('s008', '   Personnel Economic Relief Allowance',     3_600_000,  3_240_000,    609_000.00, '711'),
  makeRow('s009', '   Retirement & Life Insurance Premium',     5_100_000,  4_590_000,  1_513_349.00, '731'),
  makeRow('s010', '   PAG-IBIG Contribution',                     212_500,    191_250,     60_400.00, '732'),
  makeRow('s011', '   PHILHEALTH Contribution',                   850_000,    765_000,    253_250.00, '733'),
  makeRow('s012', '   ECC Contribution',                          212_500,    191_250,     73_001.00, '734'),
  makeRow('s013', '   Overtime & Night Differential Pay',         850_000,    765_000,    100_000.00, '723'),
  makeRow('s014', 'SUB-TOTAL A. PS', 85_028_490, 65_535_271, 12_611_245.99, '', true),

  makeRow('s015', 'B. MAINTENANCE AND OTHER OPERATING EXPENSES (MOOE)', 0, 0, 0, '', true),
  makeRow('s016', '   Traveling Expenses – Local',            1_500_000, 1_350_000,   285_000.00, '751'),
  makeRow('s017', '   Training & Scholarship Expenses',         800_000,   720_000,   120_000.00, '753'),
  makeRow('s018', '   Office Supplies Expenses',              1_200_000, 1_080_000,   350_000.00, '755'),
  makeRow('s019', '   Fuel, Oil & Lubricants',                  600_000,   540_000,    95_000.00, '761'),
  makeRow('s020', '   Postage & Courier Services',              150_000,   135_000,    15_000.00, '771'),
  makeRow('s021', '   Telephone Expenses – Mobile',             240_000,   216_000,    60_000.00, '772'),
  makeRow('s022', '   Internet Subscription',                   180_000,   162_000,    45_000.00, '774'),
  makeRow('s023', '   Water Expenses',                          120_000,   108_000,    22_500.00, '775'),
  makeRow('s024', '   Electricity Expenses',                    480_000,   432_000,    90_000.00, '776'),
  makeRow('s025', '   Repairs & Maintenance – Buildings',       500_000,   450_000,         0.00, '811'),
  makeRow('s026', '   Repairs & Maintenance – Equipment',       300_000,   270_000,    45_000.00, '821'),
  makeRow('s027', '   Printing & Publication',                  200_000,   180_000,    35_000.00, '781'),
  makeRow('s028', 'SUB-TOTAL B. MOOE', 6_270_000, 5_643_000, 1_162_500.00, '', true),

  makeRow('s029', 'C. CAPITAL OUTLAY (CO)', 0, 0, 0, '', true),
  makeRow('s030', '   Office Equipment',             500_000, 450_000, 180_000.00, '221'),
  makeRow('s031', '   IT Equipment and Software',    800_000, 720_000,       0.00, '223'),
  makeRow('s032', '   Furniture & Fixtures',         300_000, 270_000,       0.00, '222'),
  makeRow('s033', 'SUB-TOTAL C. CO', 1_600_000, 1_440_000, 180_000.00, '', true),
];

/** Compute GRAND TOTAL — Utilization = Obligation / Appropriation × 100 */
export function getStatementTotal(records: StatementRecord[]): Omit<StatementRecord, 'id' | 'expensesClassification' | 'accountCode' | 'isHeader'> {
  const dataRows      = records.filter(r => !r.isHeader);
  const appropriation = dataRows.reduce((s, r) => s + r.appropriation, 0);
  const allotment     = dataRows.reduce((s, r) => s + r.allotment,     0);
  const obligation    = dataRows.reduce((s, r) => s + r.obligation,    0);
  return {
    appropriation,
    allotment,
    obligation,
    balanceOfAppropriation: appropriation - allotment,
    balanceOfAllotment:     allotment     - obligation,
    utilizationRate:        appropriation > 0 ? (obligation / appropriation) * 100 : 0,
  };
}
