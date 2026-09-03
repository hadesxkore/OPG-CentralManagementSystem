// ============================================================
// AUTHENTICATION
// ============================================================
export type UserRole = 'admin' | 'user' | 'pops' | 'restricted';

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

// ============================================================
// RECORD OF TRANSACTION ENCODING
// ============================================================
export interface TransactionRecord {
  id: string;
  no?: string;                         // Record / Item No.
  dtn?: string;                        // Document Tracking Number
  receivedDateTime?: string;           // Received Date & Time
  preparedDateTime?: string;           // Prepared Date & Time
  requestorContact?: string;           // Name of Requestor / Contact No.
  barangay?: string;                   // Barangay
  municipality?: string;               // Municipality
  particulars?: string;                // Particulars / Description
  payee?: string;                      // Payee Name
  amount?: number;                     // Amount (₱)
  dateProcessed?: string;              // Date Processed
  receivedByNameSignature?: string;    // Received By (Name / Signature)
  receivedByDateTime?: string;         // Received By Date & Time
  remarks?: string;                    // Remarks if any
  createdAt?: string;                  // ISO timestamp of encoding
// ============================================================
// POPS PR / DV TRANSACTION ENCODING
// ============================================================
export interface DvEntry {
  id: string;
  dvNo?: string;
  dvAmount?: number;
  payee?: string;
}

export interface PopsTransactionRecord {
  id: string;
  no?: string;                         // Record / Item No.
  dateTime?: string;                   // Date and Time (e.g. 1/9/2026 1:55)
  prNo?: string;                       // PR No. (e.g. PR: 2026-01-0008B)
  obrNo?: string;                      // OBR No. (e.g. OBR: 100-26-01-00053)
  particulars?: string;                // Particulars / Description
  prAmount?: number;                   // PR Amount (Total amount for the PR)
  dvEntries?: DvEntry[];               // DV Sub-rows (1 or more DVs per PR Amount)
  status?: string;                     // Status (e.g. "For cheque released 2/25/26", "Cancelled 1/15/2026")
  dateReleased?: string;               // Date Released
  remarks?: string;                    // Remarks (e.g. "PNP")
  createdAt?: string;                  // ISO timestamp of encoding
  encodedBy?: string;                  // Name of encoder
  encodedById?: string;                // User ID of encoder
  office?: string;                     // Encoder's Office
// ============================================================
// OBR & SUPPLIER TRANSACTION ENCODING
// ============================================================
export interface ObrSupplierRecord {
  id: string;
  cNo?: string;                         // C. NO.
  dateReleased?: string;               // DATE RELEASED
  obrNo?: string;                      // OBR NO.
  particulars?: string;                // PARTICULARS
  dateOfEvent?: string;                // DATE OF EVENT
  obrAmount?: number;                  // OBR AMOUNT (₱)
  receivedBy1?: string;                // RECEIVED BY (PRINTED NAME WITH SIGNATURE) - 1st
  dateTime1?: string;                  // DATE AND TIME - 1st
  documentReturnDate?: string;         // DOCUMENT RETURN DATE
  payee?: string;                      // PAYEE
  voucherAmount?: number;              // VOUCHER AMOUNT (₱)
  receivedBy2?: string;                // RECEIVED BY (PRINTED NAME WITH SIGNATURE) - 2nd
  dateTime2?: string;                  // DATE AND TIME - 2nd
  createdAt?: string;                  // ISO timestamp of encoding
  encodedBy?: string;                  // Name of encoder
  encodedById?: string;                // User ID of encoder
  office?: string;                     // Encoder's Office
}


