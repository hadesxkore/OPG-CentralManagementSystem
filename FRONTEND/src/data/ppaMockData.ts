import type { PPARecord } from '@/types';

// ── Helper: correct formulas ──────────────────────────────────────────────────
// Balance of Appropriation = Appropriation - Allotment   (unallotted)
// Balance of Allotment     = Allotment     - Obligation  (unutilized allotment)
// Utilization Rate         = Obligation    / Appropriation × 100
function makeRow(
  id: string,
  fppCode: string,
  programProjectActivity: string,
  appropriation: number,
  allotment: number,
  obligation: number,
  isHeader = false,
): PPARecord {
  return {
    id,
    fppCode,
    programProjectActivity,
    appropriation,
    allotment,
    obligation,
    balanceOfAppropriation: appropriation - allotment,
    balanceOfAllotment:     allotment - obligation,
    utilizationRate:        appropriation > 0 ? (obligation / appropriation) * 100 : 0,
    isHeader,
  };
}

// ── Mock PPA data ─────────────────────────────────────────────────────────────
export const MOCK_PPA_RECORDS: PPARecord[] = [
  makeRow('p-h1', '', 'INFRASTRUCTURE PROJECTS', 0, 0, 0, true),
  makeRow('p001', '6000-1-6.7',  'Construction of Material Recovery Facility in 1Bataan',            5_800_000, 0, 0),
  makeRow('p002', '6000-1-6.4',  'Installation of Security Cameras (CCTV) in 1Bataan',              5_000_000, 0, 0),
  makeRow('p003', '6000-1-6.33', 'Construction of Shedded Walk Path in 1Bataan Village',            2_000_000, 0, 0),
  makeRow('p004', '6000-1-6.32', 'Construction of 50 Dwelling Units at 1Bataan Village',           27_500_000, 0, 0),
  makeRow('p005', '6000-1-6.31', 'Construction of Livelihood Center at 1Bataan Village',            3_500_000, 0, 0),
  makeRow('p006', '6000-1-5.2',  'Construction of Multi-Purpose Building – Balanga City',           8_200_000, 7_380_000, 2_500_000),
  makeRow('p007', '6000-1-5.1',  'Rehabilitation of Provincial Road – National Highway',          12_000_000, 10_800_000, 4_200_000),
  makeRow('p008', '6000-1-4.8',  'Construction of Health Center – Mariveles',                       6_500_000, 5_850_000, 1_950_000),
  makeRow('p009', '6000-1-4.3',  'Installation of Streetlights – Dinalupihan',                     3_200_000, 2_880_000,   960_000),
  makeRow('p010', '6000-1-3.9',  'Flood Control and Drainage Improvement – Orani River',          15_000_000, 13_500_000, 5_250_000),

  makeRow('p-h2', '', 'SOCIAL PROTECTION PROGRAMS', 0, 0, 0, true),
  makeRow('p011', '5000-2-1.1',  'Bataan Emergency Assistance Program (BEAP)',                     10_000_000, 9_000_000, 5_400_000),
  makeRow('p012', '5000-2-1.2',  'Scholarship Program for Deserving Bataeños',                    25_000_000, 22_500_000, 11_250_000),
  makeRow('p013', '5000-2-1.3',  'Senior Citizens Assistance and Support Program',                  5_000_000, 4_500_000, 2_250_000),
  makeRow('p014', '5000-2-1.4',  'Persons with Disability (PWD) Livelihood Assistance',            3_000_000, 2_700_000, 1_080_000),
  makeRow('p015', '5000-2-2.1',  '4Ps Supplemental Nutrition Program',                             8_500_000, 7_650_000, 3_825_000),

  makeRow('p-h3', '', 'AGRICULTURE AND ENVIRONMENT', 0, 0, 0, true),
  makeRow('p016', '4000-3-1.1',  'Bataan Integrated Agriculture Program',                         12_000_000, 10_800_000, 4_320_000),
  makeRow('p017', '4000-3-1.2',  'Distribution of Agricultural Inputs to Farmers',                 6_000_000, 5_400_000, 2_700_000),
  makeRow('p018', '4000-3-2.1',  'Coastal Resource Management Program',                            4_500_000, 4_050_000, 1_215_000),
  makeRow('p019', '4000-3-2.2',  'Mangrove Reforestation and Marine Sanctuary Protection',         3_000_000, 2_700_000,   810_000),
  makeRow('p020', '4000-3-3.1',  'Solid Waste Management and Eco-Park Development',                5_500_000, 4_950_000, 1_485_000),

  makeRow('p-h4', '', 'HEALTH AND SANITATION', 0, 0, 0, true),
  makeRow('p021', '3000-4-1.1',  'Provincial Health Office Programs and Services',                18_000_000, 16_200_000, 8_100_000),
  makeRow('p022', '3000-4-1.2',  'Purchase of Medical Supplies and Pharmaceuticals',              12_000_000, 10_800_000, 5_400_000),
  makeRow('p023', '3000-4-1.3',  'Bataan Provincial Hospital Operations',                        45_000_000, 40_500_000, 20_250_000),
  makeRow('p024', '3000-4-2.1',  'Rural Health Unit (RHU) Enhancement Program',                    8_000_000, 7_200_000, 3_600_000),

  makeRow('p-h5', '', 'ECONOMIC ENTERPRISE AND TOURISM', 0, 0, 0, true),
  makeRow('p025', '7000-5-1.1',  'Bataan Tourism Promotion and Development Fund',                  5_000_000, 4_500_000, 1_350_000),
  makeRow('p026', '7000-5-1.2',  'Bataan Economic Zone (BEZ) Infrastructure Support',             20_000_000, 18_000_000, 5_400_000),
  makeRow('p027', '7000-5-2.1',  'Small and Medium Enterprise (SME) Development Program',          4_500_000, 4_050_000, 1_215_000),
];

/** Compute GRAND TOTAL — Utilization = Obligation / Appropriation × 100 */
export function getPPATotal(records: PPARecord[]): Omit<PPARecord, 'id' | 'fppCode' | 'programProjectActivity' | 'isHeader'> {
  const rows          = records.filter(r => !r.isHeader);
  const appropriation = rows.reduce((s, r) => s + r.appropriation, 0);
  const allotment     = rows.reduce((s, r) => s + r.allotment,     0);
  const obligation    = rows.reduce((s, r) => s + r.obligation,    0);
  return {
    appropriation,
    allotment,
    obligation,
    balanceOfAppropriation: appropriation - allotment,
    balanceOfAllotment:     allotment     - obligation,
    utilizationRate:        appropriation > 0 ? (obligation / appropriation) * 100 : 0,
  };
}
