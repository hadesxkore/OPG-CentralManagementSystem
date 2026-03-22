import type {
  AuthUser,
  AppropriationRecord,
  ObligationRecord,
  ERequest,
  SystemUser,
  Office,
  MonthlyUtilization,
  ChartDataPoint,
  OfficeBalance,
  BalanceSummary,
  BudgetRecord,
} from '../types';

// ============================================================
// MOCK CREDENTIALS
// ============================================================
export const MOCK_CREDENTIALS = [
  {
    email: 'admin@opg.gov.ph',
    password: 'Admin@2025',
    user: {
      id: 'usr_admin_001',
      name: 'Maria Santos',
      email: 'admin@opg.gov.ph',
      role: 'admin' as const,
      office: 'Office of the Provincial Governor',
      position: 'Budget Officer III',
      employeeId: 'EMP-001',
    } satisfies AuthUser,
  },
  {
    email: 'juan.delacruz@opg.gov.ph',
    password: 'User@2025',
    user: {
      id: 'usr_001',
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@opg.gov.ph',
      role: 'user' as const,
      office: "Provincial Administrator's Office",
      position: 'Administrative Officer II',
      employeeId: 'EMP-002',
    } satisfies AuthUser,
  },
  {
    email: 'ana.reyes@opg.gov.ph',
    password: 'User@2025',
    user: {
      id: 'usr_002',
      name: 'Ana Reyes',
      email: 'ana.reyes@opg.gov.ph',
      role: 'user' as const,
      office: 'Provincial Health Office',
      position: 'Nurse II',
      employeeId: 'EMP-003',
    } satisfies AuthUser,
  },
  {
    email: 'pops@opg.gov.ph',
    password: 'Pops@2025',
    user: {
      id: 'usr_pops_001',
      name: 'Ricardo Bautista',
      email: 'pops@opg.gov.ph',
      role: 'pops' as const,
      office: 'Peace and Order / Public Safety Division',
      position: 'POPS Division Head',
      employeeId: 'EMP-POPS-001',
      division: 'POPS',
    } satisfies AuthUser,
  },
];

// ============================================================
// OFFICES
// ============================================================
export const MOCK_OFFICES: Office[] = [
  { code: 'OPG', name: 'Office of the Provincial Governor', head: 'Gov. Roberto Dela Cruz' },
  { code: 'PAO', name: "Provincial Administrator's Office", head: 'Admin. Teresa Lim' },
  { code: 'PHO', name: 'Provincial Health Office', head: 'Dr. Antonio Ramos' },
  { code: 'PEO', name: 'Provincial Engineering Office', head: 'Engr. Mario Santos' },
  { code: 'PSO', name: 'Provincial Social Welfare Office', head: 'Maria Flores' },
  { code: 'PTO', name: "Provincial Treasurer's Office", head: 'Estrella Bautista' },
  { code: 'PAG', name: 'Provincial Agriculture Office', head: 'Renato Aquino' },
  { code: 'HRMO', name: 'Human Resource Management Office', head: 'Cynthia Valdez' },
];

// ============================================================
// REAL BUDGET RECORDS — from staff-provided Excel
// Columns: OFFICE | APPROPRIATION | OBLIGATION | BALANCES | UTILIZATION %
// ============================================================
export const MOCK_BUDGET_RECORDS: BudgetRecord[] = [
  { id: 'bgt_001', office: 'OFFICE of the PROVINCIAL GOVERNOR',                                                         appropriation: 2579333628.00, obligation: 314661637.65, balance: 2264671990.35, utilization: 12.20 },
  { id: 'bgt_002', office: 'OFFICE of the PROVINCIAL GOVERNOR - Iskolar ng Bataan (ISKOLAR)',                            appropriation:  143418521.00, obligation:  19206838.00, balance:  124211683.00, utilization: 13.39 },
  { id: 'bgt_003', office: 'OFFICE of the PROVINCIAL GOVERNOR - Health Promotion Board (HPB)',                           appropriation:   29174387.00, obligation:   8906580.00, balance:   20267807.00, utilization: 30.53 },
  { id: 'bgt_004', office: 'OFFICE of the PROVINCIAL GOVERNOR - Agricultural and Biosystems Engineering (ABE)',          appropriation:    1814125.00, obligation:   1249885.00, balance:     564240.00, utilization: 68.90 },
  { id: 'bgt_005', office: 'OFFICE of the PROVINCIAL GOVERNOR - Special Assistance Program (SAP)',                       appropriation:    1049035.00, obligation:    119564.84, balance:     929470.16, utilization: 11.40 },
  { id: 'bgt_006', office: 'OFFICE of the PROVINCIAL GOVERNOR - Internal Audit Service (IAS)',                           appropriation:     462000.00, obligation:      1425.00, balance:     460575.00, utilization:  0.31 },
  { id: 'bgt_007', office: 'OFFICE of the PROVINCIAL GOVERNOR - Provincial Disability Affairs Office (PDAO)',            appropriation:     415300.00, obligation:     27675.00, balance:     387625.00, utilization:  6.66 },
  { id: 'bgt_008', office: 'OFFICE of the PROVINCIAL GOVERNOR - Bids and Awards Committee (BAC)',                        appropriation:     206925.00, obligation:     23750.00, balance:     183175.00, utilization: 11.48 },
  { id: 'bgt_009', office: 'OFFICE of the PROVINCIAL GOVERNOR - Office of the Strategy Management (OSM)',                appropriation:     163100.00, obligation:         0.00, balance:     163100.00, utilization:  0.00 },
  { id: 'bgt_010', office: 'METRO BATAAN DEVELOPMENT AUTHORITY',                                                         appropriation:    4152831.00, obligation:    360830.72, balance:    3792000.28, utilization:  8.69 },
  { id: 'bgt_011', office: 'BATAAN PUBLIC-PRIVATE PARTNERSHIP AND INVESTMENT CENTER',                                    appropriation:   11587090.00, obligation:   1641056.89, balance:    9946033.11, utilization: 14.16 },
  { id: 'bgt_012', office: 'OFFICE of the VICE-GOVERNOR',                                                                appropriation:   14732942.00, obligation:   1894052.37, balance:   12838889.63, utilization: 12.86 },
  { id: 'bgt_013', office: 'OFFICE of the MEMBERS OF THE SANGGUNIANG PANLALAWIGAN',                                     appropriation:   75531078.00, obligation:   9171841.12, balance:   66359236.88, utilization: 12.14 },
];

export const getBudgetSummaryFromRecords = (records: BudgetRecord[]) => {
  const totalAppropriation = records.reduce((s, r) => s + r.appropriation, 0);
  const totalObligation    = records.reduce((s, r) => s + r.obligation,    0);
  const totalBalance       = records.reduce((s, r) => s + r.balance,       0);
  const avgUtilization     = totalAppropriation > 0 ? (totalObligation / totalAppropriation) * 100 : 0;
  return { totalAppropriation, totalObligation, totalBalance, avgUtilization };
};


// ============================================================
// APPROPRIATION
// ============================================================
export const MOCK_APPROPRIATION: AppropriationRecord[] = [
  { id: 'app_001', office: 'Office of the Provincial Governor', officeCode: 'OPG', fundSource: 'General Fund', ps: 8500000, mooe: 3200000, co: 1500000, total: 13200000, year: 2025, quarter: 1 },
  { id: 'app_002', office: "Provincial Administrator's Office", officeCode: 'PAO', fundSource: 'General Fund', ps: 4200000, mooe: 1800000, co: 500000, total: 6500000, year: 2025, quarter: 1 },
  { id: 'app_003', office: 'Provincial Health Office', officeCode: 'PHO', fundSource: 'General Fund', ps: 12000000, mooe: 5500000, co: 2000000, total: 19500000, year: 2025, quarter: 1 },
  { id: 'app_004', office: 'Provincial Engineering Office', officeCode: 'PEO', fundSource: 'General Fund', ps: 6800000, mooe: 2200000, co: 8500000, total: 17500000, year: 2025, quarter: 1 },
  { id: 'app_005', office: 'Provincial Social Welfare Office', officeCode: 'PSO', fundSource: 'General Fund', ps: 3500000, mooe: 1200000, co: 300000, total: 5000000, year: 2025, quarter: 1 },
  { id: 'app_006', office: "Provincial Treasurer's Office", officeCode: 'PTO', fundSource: 'General Fund', ps: 5200000, mooe: 1500000, co: 200000, total: 6900000, year: 2025, quarter: 1 },
  { id: 'app_007', office: 'Provincial Agriculture Office', officeCode: 'PAG', fundSource: 'General Fund', ps: 4000000, mooe: 2800000, co: 1200000, total: 8000000, year: 2025, quarter: 1 },
  { id: 'app_008', office: 'Human Resource Management Office', officeCode: 'HRMO', fundSource: 'General Fund', ps: 2800000, mooe: 900000, co: 100000, total: 3800000, year: 2025, quarter: 1 },
];

// ============================================================
// OBLIGATIONS
// ============================================================
export const MOCK_OBLIGATIONS: ObligationRecord[] = [
  { id: 'obl_001', obrNo: 'OBR-2025-0001', date: '2025-01-10', particulars: 'Salaries and Wages – January 2025', amount: 8500000, objectCode: '5-01-01-010', objectType: 'PS', office: 'OPG', status: 'Approved', payee: 'Various Personnel' },
  { id: 'obl_002', obrNo: 'OBR-2025-0002', date: '2025-01-15', particulars: 'Office Supplies – Q1 2025', amount: 125000, objectCode: '5-02-03-010', objectType: 'MOOE', office: 'OPG', status: 'Approved', payee: 'ABC Office Supply Corp.' },
  { id: 'obl_003', obrNo: 'OBR-2025-0003', date: '2025-01-20', particulars: 'Medical Supplies and Equipment', amount: 850000, objectCode: '5-02-03-080', objectType: 'MOOE', office: 'PHO', status: 'Approved', payee: 'PhilHealth Med Supply' },
  { id: 'obl_004', obrNo: 'OBR-2025-0004', date: '2025-01-22', particulars: 'Road Repair Materials – Brgy. Santo Niño', amount: 2500000, objectCode: '1-07-05-990', objectType: 'CO', office: 'PEO', status: 'Approved', payee: 'Delco Builders Inc.' },
  { id: 'obl_005', obrNo: 'OBR-2025-0005', date: '2025-01-25', particulars: 'Training Expenses – Q1 Seminar', amount: 85000, objectCode: '5-02-01-020', objectType: 'MOOE', office: 'HRMO', status: 'Approved', payee: 'CSC Training Center' },
  { id: 'obl_006', obrNo: 'OBR-2025-0006', date: '2025-02-05', particulars: 'Fuel and Lubricants – Feb 2025', amount: 95000, objectCode: '5-02-03-090', objectType: 'MOOE', office: 'PEO', status: 'Pending', payee: 'Petron Station' },
  { id: 'obl_007', obrNo: 'OBR-2025-0007', date: '2025-02-10', particulars: 'Subsistence Allowance – Field Personnel', amount: 45000, objectCode: '5-02-01-040', objectType: 'MOOE', office: 'PAG', status: 'Approved', payee: 'Various Personnel' },
  { id: 'obl_008', obrNo: 'OBR-2025-0008', date: '2025-02-12', particulars: 'Community Health Program – Feb 2025', amount: 320000, objectCode: '5-02-16-110', objectType: 'MOOE', office: 'PHO', status: 'Pending', payee: 'Various Suppliers' },
  { id: 'obl_009', obrNo: 'OBR-2025-0009', date: '2025-02-18', particulars: 'Office Equipment – Laptop Units', amount: 180000, objectCode: '1-07-05-020', objectType: 'CO', office: 'PAO', status: 'Approved', payee: 'Future Tech Corp.' },
  { id: 'obl_010', obrNo: 'OBR-2025-0010', date: '2025-02-20', particulars: 'Social Welfare Assistance – Beneficiaries', amount: 250000, objectCode: '5-02-16-990', objectType: 'MOOE', office: 'PSO', status: 'Cancelled', payee: 'Various Beneficiaries' },
  { id: 'obl_011', obrNo: 'OBR-2025-0011', date: '2025-03-01', particulars: 'Printing and Publication – Q1 Reports', amount: 35000, objectCode: '5-02-02-010', objectType: 'MOOE', office: 'OPG', status: 'Pending', payee: 'Print Masters Inc.' },
  { id: 'obl_012', obrNo: 'OBR-2025-0012', date: '2025-03-05', particulars: 'Agricultural Inputs Distribution Program', amount: 1200000, objectCode: '5-02-16-200', objectType: 'MOOE', office: 'PAG', status: 'Approved', payee: 'DA Regional Office' },
];

// ============================================================
// E-REQUESTS
// ============================================================
export const MOCK_REQUESTS: ERequest[] = [
  { id: 'req_001', referenceNo: 'REQ-2025-DTR-001', type: 'DTR', employeeId: 'EMP-002', employeeName: 'Juan Dela Cruz', office: "Provincial Administrator's Office", dateFiled: '2025-03-01', description: 'Daily Time Record for March 2025', status: 'Pending', fromDate: '2025-03-01', toDate: '2025-03-31' },
  { id: 'req_002', referenceNo: 'REQ-2025-LVE-001', type: 'Leave', employeeId: 'EMP-002', employeeName: 'Juan Dela Cruz', office: "Provincial Administrator's Office", dateFiled: '2025-02-10', description: 'Vacation Leave – Holy Week', status: 'Approved', leaveType: 'Vacation Leave', fromDate: '2025-04-17', toDate: '2025-04-18', remarks: 'Approved. Enjoy your vacation!' },
  { id: 'req_003', referenceNo: 'REQ-2025-ATR-001', type: 'ATR', employeeId: 'EMP-003', employeeName: 'Ana Reyes', office: 'Provincial Health Office', dateFiled: '2025-02-28', description: 'DOH Regional Conference – Manila', status: 'Approved', destination: 'Manila, NCR', purpose: 'Attend DOH Regional Health Conference 2025', fromDate: '2025-03-10', toDate: '2025-03-12' },
  { id: 'req_004', referenceNo: 'REQ-2025-OBR-001', type: 'OBR Signature', employeeId: 'EMP-002', employeeName: 'Juan Dela Cruz', office: "Provincial Administrator's Office", dateFiled: '2025-03-05', description: 'OBR for Office Supplies Q2 2025', status: 'For Review', remarks: 'Under review by Budget Officer' },
  { id: 'req_005', referenceNo: 'REQ-2025-PR-001', type: 'Purchase Request', employeeId: 'EMP-003', employeeName: 'Ana Reyes', office: 'Provincial Health Office', dateFiled: '2025-03-01', description: 'Medical Equipment – Community Health Center', status: 'Rejected', totalAmount: 450000, items: 'Blood Pressure Monitor x10, Pulse Oximeter x20, Digital Thermometer x50', remarks: 'Budget insufficient for Q1. Please resubmit in Q2.' },
  { id: 'req_006', referenceNo: 'REQ-2025-DTR-002', type: 'DTR', employeeId: 'EMP-003', employeeName: 'Ana Reyes', office: 'Provincial Health Office', dateFiled: '2025-03-05', description: 'Daily Time Record for February 2025', status: 'Approved', fromDate: '2025-02-01', toDate: '2025-02-28' },
  { id: 'req_007', referenceNo: 'REQ-2025-LVE-002', type: 'Leave', employeeId: 'EMP-002', employeeName: 'Juan Dela Cruz', office: "Provincial Administrator's Office", dateFiled: '2025-03-10', description: 'Sick Leave – Flu / Fever', status: 'Approved', leaveType: 'Sick Leave', fromDate: '2025-03-11', toDate: '2025-03-12', remarks: 'Approved. Get well soon!' },
  { id: 'req_008', referenceNo: 'REQ-2025-PR-002', type: 'Purchase Request', employeeId: 'EMP-002', employeeName: 'Juan Dela Cruz', office: "Provincial Administrator's Office", dateFiled: '2025-03-08', description: 'Office Furniture – Admin Office Renovation', status: 'Pending', totalAmount: 85000, items: 'Executive Chair x5, 4-Drawer Filing Cabinet x3' },
  { id: 'req_009', referenceNo: 'REQ-2025-ATR-002', type: 'ATR', employeeId: 'EMP-002', employeeName: 'Juan Dela Cruz', office: "Provincial Administrator's Office", dateFiled: '2025-03-09', description: 'Budget Forum – Pasay City', status: 'Pending', destination: 'Pasay City, Metro Manila', purpose: 'Attend Local Budget Forum 2025', fromDate: '2025-03-20', toDate: '2025-03-21' },
];

// ============================================================
// SYSTEM USERS
// ============================================================
export const MOCK_USERS: SystemUser[] = [
  { id: 'usr_admin_001', name: 'Maria Santos', email: 'admin@opg.gov.ph', role: 'admin', office: 'Office of the Provincial Governor', position: 'Budget Officer III', employeeId: 'EMP-001', status: 'Active', createdAt: '2024-01-15' },
  { id: 'usr_001', name: 'Juan Dela Cruz', email: 'juan.delacruz@opg.gov.ph', role: 'user', office: "Provincial Administrator's Office", position: 'Administrative Officer II', employeeId: 'EMP-002', status: 'Active', createdAt: '2024-01-20' },
  { id: 'usr_002', name: 'Ana Reyes', email: 'ana.reyes@opg.gov.ph', role: 'user', office: 'Provincial Health Office', position: 'Nurse II', employeeId: 'EMP-003', status: 'Active', createdAt: '2024-02-01' },
  { id: 'usr_003', name: 'Roberto Gabriel', email: 'roberto.gabriel@opg.gov.ph', role: 'user', office: 'Provincial Engineering Office', position: 'Engineer I', employeeId: 'EMP-004', status: 'Active', createdAt: '2024-02-10' },
  { id: 'usr_004', name: 'Cynthia Valdez', email: 'cynthia.valdez@opg.gov.ph', role: 'user', office: 'Human Resource Management Office', position: 'HRMO II', employeeId: 'EMP-005', status: 'Active', createdAt: '2024-02-15' },
  { id: 'usr_005', name: 'Pedro Gonzales', email: 'pedro.gonzales@opg.gov.ph', role: 'user', office: 'Provincial Agriculture Office', position: 'Agricultural Technologist', employeeId: 'EMP-006', status: 'Inactive', createdAt: '2024-03-01' },
];

// ============================================================
// MONTHLY UTILIZATION TREND
// ============================================================
export const MOCK_MONTHLY_UTILIZATION: MonthlyUtilization[] = [
  { month: 'Jan', appropriation: 80400000, obligations: 11350000, balance: 69050000, utilizationRate: 14.1 },
  { month: 'Feb', appropriation: 80400000, obligations: 16235000, balance: 64165000, utilizationRate: 20.2 },
  { month: 'Mar', appropriation: 80400000, obligations: 25180000, balance: 55220000, utilizationRate: 31.3 },
  { month: 'Apr', appropriation: 80400000, obligations: 32450000, balance: 47950000, utilizationRate: 40.4 },
  { month: 'May', appropriation: 80400000, obligations: 41200000, balance: 39200000, utilizationRate: 51.2 },
  { month: 'Jun', appropriation: 80400000, obligations: 48600000, balance: 31800000, utilizationRate: 60.4 },
  { month: 'Jul', appropriation: 80400000, obligations: 0, balance: 80400000, utilizationRate: 0 },
  { month: 'Aug', appropriation: 80400000, obligations: 0, balance: 80400000, utilizationRate: 0 },
  { month: 'Sep', appropriation: 80400000, obligations: 0, balance: 80400000, utilizationRate: 0 },
  { month: 'Oct', appropriation: 80400000, obligations: 0, balance: 80400000, utilizationRate: 0 },
  { month: 'Nov', appropriation: 80400000, obligations: 0, balance: 80400000, utilizationRate: 0 },
  { month: 'Dec', appropriation: 80400000, obligations: 0, balance: 80400000, utilizationRate: 0 },
];

// ============================================================
// COMPUTED HELPERS
// ============================================================
export const getBalanceSummary = (): BalanceSummary => {
  const totalAppropriation = MOCK_APPROPRIATION.reduce((s, r) => s + r.total, 0);
  const totalObligations = MOCK_OBLIGATIONS.filter(o => o.status === 'Approved').reduce((s, o) => s + o.amount, 0);
  const balance = totalAppropriation - totalObligations;
  const utilizationRate = (totalObligations / totalAppropriation) * 100;
  return { totalAppropriation, totalObligations, balance, utilizationRate };
};

export const getAppropriationChartData = (): ChartDataPoint[] => {
  const obligationMap: Record<string, number> = {};
  MOCK_OBLIGATIONS.filter(o => o.status === 'Approved').forEach(o => {
    obligationMap[o.office.slice(0, 4).toUpperCase()] = (obligationMap[o.office.slice(0, 4).toUpperCase()] || 0) + o.amount;
  });
  return MOCK_APPROPRIATION.map(item => ({
    office: item.officeCode,
    officeName: item.office,
    PS: item.ps,
    MOOE: item.mooe,
    CO: item.co,
    Total: item.total,
    Obligations: obligationMap[item.officeCode] || 0,
    Balance: item.total - (obligationMap[item.officeCode] || 0),
  }));
};

export const getOfficeBalances = (): OfficeBalance[] => {
  const obligationMap: Record<string, number> = {};
  MOCK_OBLIGATIONS.filter(o => o.status === 'Approved').forEach(o => {
    obligationMap[o.office] = (obligationMap[o.office] || 0) + o.amount;
  });
  return MOCK_APPROPRIATION.map(item => {
    const obligations = obligationMap[item.office] || 0;
    const balance = item.total - obligations;
    return {
      officeCode: item.officeCode,
      office: item.office,
      appropriation: item.total,
      obligations,
      balance,
      utilizationRate: (obligations / item.total) * 100,
    };
  });
};

export const getBudgetByType = () => {
  const ps = MOCK_APPROPRIATION.reduce((s, r) => s + r.ps, 0);
  const mooe = MOCK_APPROPRIATION.reduce((s, r) => s + r.mooe, 0);
  const co = MOCK_APPROPRIATION.reduce((s, r) => s + r.co, 0);
  return [
    { name: 'Personnel Services (PS)', value: ps, fill: '#1D4ED8' },
    { name: 'MOOE', value: mooe, fill: '#0EA5E9' },
    { name: 'Capital Outlay (CO)', value: co, fill: '#7C3AED' },
  ];
};

export const formatPeso = (amount: number): string =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);

export const formatNumber = (amount: number): string =>
  new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
