// ============================================================
// AUTHENTICATION
// ============================================================
export type UserRole = 'admin' | 'user' | 'pops';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  office: string;
  position: string;
  employeeId: string;
  avatar?: string;
  division?: string;              // e.g. 'POPS' for Peace & Order division
}

// ============================================================
// BUDGET RECORD — matches Excel format:
// OFFICE | APPROPRIATION | OBLIGATION | BALANCES | UTILIZATION
// ============================================================
export interface BudgetRecord {
  id: string;
  office: string;
  appropriation: number;
  obligation: number;
  balance: number;
  utilization: number;   // e.g. 12.20 means 12.20%
}

// ============================================================
// STATEMENT OF APPROPRIATIONS, ALLOTMENTS, OBLIGATIONS & BALANCES
// Columns: EXPENSES CLASSIFICATION | APPROPRIATION | ALLOTMENT |
//          OBLIGATION | BALANCE OF APPROPRIATION |
//          BALANCE OF ALLOTMENT | UTILIZATION RATE | ACCOUNT CODE
// ============================================================
export interface StatementRecord {
  id: string;
  expensesClassification: string;   // e.g. "A. PS", "B. MOOE", "C. CO"
  appropriation: number;
  allotment: number;
  obligation: number;
  balanceOfAppropriation: number;   // appropriation - obligation
  balanceOfAllotment: number;       // allotment - obligation
  utilizationRate: number;          // percentage, e.g. 14.83
  accountCode: string;              // e.g. "16"
  isHeader?: boolean;               // true for group header rows (no numbers)
}

// ============================================================
// SUMMARY OF PROGRAM / PROJECT / ACTIVITY (PPA)
// Columns: FPP CODE | PROGRAM PROJECT ACTIVITY |
//          APPROPRIATION | ALLOTMENT | OBLIGATION |
//          BALANCE OF APPROPRIATION | BALANCE OF ALLOTMENT |
//          UTILIZATION RATE
// ============================================================
export interface PPARecord {
  id: string;
  fppCode: string;                  // e.g. "6000-1-6.7"
  programProjectActivity: string;   // e.g. "Construction of Material Recovery Facility..."
  appropriation: number;
  allotment: number;
  obligation: number;
  balanceOfAppropriation: number;   // appropriation - allotment
  balanceOfAllotment: number;       // allotment - obligation
  utilizationRate: number;          // obligation / allotment × 100
  sourceGroup?: string;             // to uniquely map files to fund types (e.g. "20%")
  isHeader?: boolean;
}

// ============================================================
// BUDGET
// ============================================================
export interface AppropriationRecord {
  id: string;
  office: string;
  officeCode: string;
  fundSource: string;
  ps: number;
  mooe: number;
  co: number;
  total: number;
  year: number;
  quarter: number;
}

export interface ObligationRecord {
  id: string;
  obrNo: string;
  date: string;
  particulars: string;
  amount: number;
  objectCode: string;
  objectType: 'PS' | 'MOOE' | 'CO';
  office: string;
  status: 'Approved' | 'Pending' | 'Cancelled';
  payee: string;
}

export interface BalanceSummary {
  totalAppropriation: number;
  totalObligations: number;
  balance: number;
  utilizationRate: number;
}

export interface MonthlyUtilization {
  month: string;
  appropriation: number;
  obligations: number;
  balance: number;
  utilizationRate: number;
}

export interface OfficeBalance {
  officeCode: string;
  office: string;
  appropriation: number;
  obligations: number;
  balance: number;
  utilizationRate: number;
}

// ============================================================
// E-REQUESTS
// ============================================================
export type RequestType = 'DTR' | 'ATR' | 'Leave' | 'OBR Signature' | 'Purchase Request';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'For Review';

export interface ERequest {
  id: string;
  referenceNo: string;
  type: RequestType;
  employeeId: string;
  employeeName: string;
  office: string;
  dateFiled: string;
  description: string;
  status: RequestStatus;
  remarks?: string;
  attachments?: string[];
  // DTR / Leave / ATR shared
  fromDate?: string;
  toDate?: string;
  // Leave specific
  leaveType?: string;
  // ATR specific
  destination?: string;
  purpose?: string;
  // PR specific
  totalAmount?: number;
  items?: string;
}

// ============================================================
// USERS
// ============================================================
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  office: string;
  position: string;
  employeeId: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Office {
  code: string;
  name: string;
  head: string;
}

// ============================================================
// CHART DATA
// ============================================================
export interface ChartDataPoint {
  office: string;
  officeName: string;
  PS: number;
  MOOE: number;
  CO: number;
  Total: number;
  Obligations: number;
  Balance: number;
}

// ============================================================
// BUDGET RELEASE / UTILIZATION TRANSACTIONS
// ============================================================
export type FundType = 'PS' | 'MOOE' | 'CO';

export interface BudgetRelease {
  id: string;
  fundType: FundType;               // PS | MOOE | CO
  fppCode: string;                  // FPP Code from PPA Summary
  department: string;               // Office/Department
  amount: number;                   // Amount released/utilized
  accountCode: string;              // GL / Account Code
  purpose: string;                  // Description / purpose
  payee?: string;                   // Payee name
  submittedBy: string;              // User name
  submittedById: string;            // User UID
  office: string;                   // User office
  createdAt: string;                // ISO timestamp
}
