import { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import {
  FileText, Download, FileUp, Search, X,
  CheckCircle2, ChevronDown, ChevronUp, Edit2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/backend/firebase';
import { collection, doc, setDoc, onSnapshot, addDoc } from 'firebase/firestore';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { useStatementStore } from '@/stores/statementStore';
import {
  getStatementTotal,
} from '@/data/statementMockData';
import { formatPeso } from '@/data/mockData';
import type { StatementRecord } from '@/types';

// ── Excel parser ──────────────────────────────────────────────────
function parseStatementExcel(file: File): Promise<StatementRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });

        // Auto-detect header row
        let headerIdx = 0;
        for (let i = 0; i < Math.min(rows.length, 8); i++) {
          const joined = rows[i].map(c => String(c).toUpperCase()).join('|');
          if (joined.includes('CLASSIFICATION') || joined.includes('APPROPRIATION')) {
            headerIdx = i;
            break;
          }
        }

        const headers = rows[headerIdx].map(h => String(h).toUpperCase().trim());
        const colIdx = (kw: string) => headers.findIndex(h => h.includes(kw));

        const classCol  = colIdx('CLASSIFICATION') >= 0 ? colIdx('CLASSIFICATION') : 0;
        const appropCol = colIdx('APPROPRIATION')  >= 0 ? colIdx('APPROPRIATION')  : 1;
        const allotCol  = colIdx('ALLOTMENT')       >= 0 ? colIdx('ALLOTMENT')       : 2;
        const obligCol  = colIdx('OBLIGATION')      >= 0 ? colIdx('OBLIGATION')
                        : colIdx('OBLIG')           >= 0 ? colIdx('OBLIG')            : 3;

        // Prefer reading these directly from the Excel file if the columns exist.
        // The Excel already has correct computed values.
        // "BALANCE OF APPROPRIATION" = appropriation - allotment (unallotted)
        // "BALANCE OF ALLOTMENT"     = allotment - obligation    (unutilized)
        const bAppropCol = colIdx('BALANCE OF APPRO') >= 0 ? colIdx('BALANCE OF APPRO')
                         : colIdx('BAL. OF APPRO')    >= 0 ? colIdx('BAL. OF APPRO')    : -1;
        const bAllotCol  = colIdx('BALANCE OF ALLO')  >= 0 ? colIdx('BALANCE OF ALLO')
                         : colIdx('BAL. OF ALLO')     >= 0 ? colIdx('BAL. OF ALLO')     : -1;
        const utilCol    = colIdx('UTILIZATION')      >= 0 ? colIdx('UTILIZATION')      : -1;
        const accCol     = colIdx('ACCOUNT')           >= 0 ? colIdx('ACCOUNT')           : 7;

        const num = (v: unknown) =>
          parseFloat(String(v ?? 0).replace(/[,%₱\s]/g, '').trim()) || 0;

        const records: StatementRecord[] = rows
          .slice(headerIdx + 1)
          .filter(row => row[classCol] && String(row[classCol]).trim())
          .map((row, i) => {
            const appropriation = num(row[appropCol]);
            const allotment     = num(row[allotCol]);
            const obligation    = num(row[obligCol]);

            // ── Use Excel value if column found; otherwise compute correctly ──
            // Balance of Appropriation = Appropriation - Allotment  (how much of the budget was NOT yet allotted)
            const balanceOfAppropriation = bAppropCol >= 0 && num(row[bAppropCol]) !== 0
              ? num(row[bAppropCol])
              : appropriation - allotment;

            // Balance of Allotment = Allotment - Obligation  (how much of the allotment was NOT yet obligated)
            const balanceOfAllotment = bAllotCol >= 0 && num(row[bAllotCol]) !== 0
              ? num(row[bAllotCol])
              : allotment - obligation;

            // Utilization Rate = Obligation / Appropriation × 100  (read from Excel or compute)
            const rawUtil = utilCol >= 0 ? num(row[utilCol]) : 0;
            const utilizationRate = rawUtil > 0
              ? (rawUtil > 1 ? rawUtil : rawUtil * 100)   // handle both 14.83 and 0.1483 formats
              : (appropriation > 0 ? (obligation / appropriation) * 100 : 0);

            return {
              id: `stmt_${i}`,
              expensesClassification: String(row[classCol] ?? '').trim(),
              appropriation,
              allotment,
              obligation,
              balanceOfAppropriation,
              balanceOfAllotment,
              utilizationRate,
              accountCode: String(row[accCol] ?? '').trim(),
            };
          });

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Util ──────────────────────────────────────────────────────────
function utilColor(rate: number) {
  if (rate === 0) return 'text-slate-400';
  if (rate >= 75)  return 'text-red-600';
  if (rate >= 50)  return 'text-amber-600';
  return 'text-emerald-600';
}

// ── Component ─────────────────────────────────────────────────────
export default function StatementPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { importedRecords, importedFileName, isImported, setImportedData, clearImport, updateRecord } = useStatementStore();

  const [search, setSearch]       = useState('');
  const [importing, setImporting] = useState(false);
  const [isConfirmClear, setConfirmClear] = useState(false);
  const [sortCol, setSortCol]     = useState<keyof StatementRecord | null>(null);
  const [sortAsc, setSortAsc]     = useState(true);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'finance', 'statement'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setImportedData(data.records || [], data.fileName || 'Cloud DB');
      } else {
        clearImport();
      }
    });
    return () => unsub();
  }, [setImportedData, clearImport]);

  const baseRecords = isImported ? importedRecords : [];
  const totals = getStatementTotal(isImported ? importedRecords : []);

  // Search filter — skip headers, highlight matches
  const filtered = baseRecords.filter(r =>
    r.expensesClassification.toLowerCase().includes(search.toLowerCase())
  );

  // Sort (non-header rows only)
  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        if (a.isHeader) return -1;
        if (b.isHeader) return 1;
        const av = a[sortCol] as number | string;
        const bv = b[sortCol] as number | string;
        return sortAsc
          ? (av > bv ? 1 : -1)
          : (av < bv ? 1 : -1);
      })
    : filtered;

  // ── Edit modal state ────────────────────────────────────────────
  type EditTarget = {
    rowId: string;
    field: 'allotment' | 'obligation';
    label: string;
    currentValue: number;
  };
  const [editTarget,  setEditTarget]  = useState<EditTarget | null>(null);
  const [deductInput, setDeductInput] = useState('');

  const deductNum   = parseFloat(deductInput.replace(/[,₱\s]/g, '')) || 0;
  const newPreview  = editTarget ? Math.max(0, editTarget.currentValue - deductNum) : 0;

  const openEditModal = (rowId: string, field: 'allotment' | 'obligation', currentValue: number, label: string) => {
    if (!isAdmin) return;
    setDeductInput('');
    setEditTarget({ rowId, field, label, currentValue });
  };

  const applyDeduct = () => {
    if (!editTarget) return;
    updateRecord(editTarget.rowId, { [editTarget.field]: newPreview });
    setEditTarget(null);
  };

  // ── Handlers ──────────────────────────────────────────────────

  const handleSort = (col: keyof StatementRecord) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
      
    sileo.promise(new Promise(async (resolve, reject) => {
      try {
        const records = await parseStatementExcel(file);
        if (records.length === 0) throw new Error('No valid rows found in the file.');
        
        // Auto-Archive existing data if present
        if (baseRecords && baseRecords.length > 0) {
           await setDoc(doc(collection(db, 'budget_trash')), {
              type: 'statements',
              fileName: importedFileName || 'Legacy_Statement_File',
              records: baseRecords,
              clearedAt: new Date().toISOString(),
              clearedBy: user?.name || user?.email || 'Auto-Archiver',
              status: 'Auto-Archived',
              originalPath: 'finance/statement'
           });
        }

        await setDoc(doc(db, 'finance', 'statement'), {
          records: records,
          fileName: file.name,
          updatedAt: new Date().toISOString()
        });

        // Notify users
        await addDoc(collection(db, 'notifications'), {
          title: 'Statements Updated',
          message: `Admin imported new latest data from ${file.name}`,
          createdAt: new Date().toISOString(),
          type: 'import'
        });

        resolve(records.length);
      } catch (err: any) {
        reject(err.message || 'Unknown error');
      }
    }), {
      loading: { title: 'Uploading to Cloud...' },
      success: (len) => {
         setImporting(false);
         if (fileInputRef.current) fileInputRef.current.value = '';
         return { title: 'Import successful', description: `${len} statement rows loaded globally` };
      },
      error: (e) => {
         setImporting(false);
         return { title: 'Import failed', description: String(e) };
      }
    });
  };

  const handleConfirmClear = async () => {
    const payload = {
      type: 'statements',
      fileName: importedFileName,
      records: baseRecords,
      clearedAt: new Date().toISOString(),
      clearedBy: user?.name || 'Administrator',
      status: 'Archived',
      originalPath: 'offline/statements'
    };

    sileo.promise(new Promise(async (resolve, reject) => {
      try {
        await setDoc(doc(collection(db, 'budget_trash')), payload);
        clearImport();
        resolve(true);
      } catch (err: any) {
        reject(err.message || 'Archiving failed');
      }
    }), {
      loading: { title: 'Moving to Archive...' },
      success: () => {
        setConfirmClear(false);
        return { title: 'Archived to Trash', description: 'Statement records successfully migrated to the cloud repository.' };
      },
      error: (e) => ({ title: 'Failed to Archive', description: String(e) })
    });
  };

  const handleExport = () => {
    const title = [
      ['STATEMENT OF APPROPRIATIONS, ALLOTMENTS, OBLIGATIONS & BALANCES'],
      [`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`],
      [] // Blank separator
    ];

    const headers = [[
      'EXPENSES CLASSIFICATION',
      'ACCOUNT CODE',
      'APPROPRIATION',
      'ALLOTMENT',
      'OBLIGATION',
      'BALANCE OF APPROPRIATION',
      'BALANCE OF ALLOTMENT',
      'UTILIZATION RATE (%)'
    ]];

    const dataRows = baseRecords.filter(r => !r.isHeader).map(r => [
      r.expensesClassification,
      r.accountCode,
      r.appropriation,
      r.allotment,
      r.obligation,
      r.balanceOfAppropriation,
      r.balanceOfAllotment,
      r.utilizationRate / 100
    ]);

    const totalRow = [[
      'GRAND TOTAL',
      '',
      totals.appropriation,
      totals.allotment,
      totals.obligation,
      totals.balanceOfAppropriation,
      totals.balanceOfAllotment,
      totals.utilizationRate / 100
    ]];

    const wsData = [...title, ...headers, ...dataRows, ...totalRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge title cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
    ];

    // Set user-friendly column widths
    ws['!cols'] = [
      { wch: 45 }, // CLASSIFICATION
      { wch: 15 }, // ACCOUNT
      { wch: 18 }, // Approp
      { wch: 18 }, // Allot
      { wch: 18 }, // Oblig
      { wch: 22 }, // Bal Approp
      { wch: 22 }, // Bal Allot
      { wch: 18 }  // Util
    ];

    // Apply granular styles and professional number formatting with color coding
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:H1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        let cell = ws[cellRef];
        if (!cell) continue;

        cell.s = cell.s || {};

        // Title row (Row 0)
        if (R === 0 && C === 0) {
          cell.s = {
            font: { bold: true, sz: 14, color: { rgb: "1E3A8A" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
        
        // Metadata / Date row (Row 1)
        if (R === 1 && C === 0) {
          cell.s = { font: { italic: true, color: { rgb: "64748B" } } };
        }

        // Header row (Row 3)
        if (R === 3) {
          cell.s = {
            fill: { fgColor: { rgb: "1D4ED8" } },
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }

        // Data Rows formatting (Row 4 to end-1)
        if (R > 3 && R < range.e.r) {
          // Numbers formatting (Appropriation to Bal of Allotment) => Cols 2 to 6
          if (C >= 2 && C <= 6 && typeof cell.v === 'number') {
            cell.z = '#,##0.00';
            cell.s = { alignment: { horizontal: "right" } };
          }
          // Utilization Rate (%) => Col 7
          if (C === 7 && typeof cell.v === 'number') {
            cell.z = '0.00%';
            let color = "059669"; // Emerald (good)
            if (cell.v >= 0.75) color = "DC2626"; // Red (high)
            else if (cell.v >= 0.50) color = "D97706"; // Amber (medium)
            cell.s = { 
              font: { color: { rgb: color }, bold: true },
              alignment: { horizontal: "right" }
            };
          }
        }

        // Grand Total row (last row)
        if (R === range.e.r) {
          cell.s = {
            fill: { fgColor: { rgb: "EFF6FF" } },
            font: { bold: true, color: { rgb: "1E3A8A" }, sz: 11 },
            border: { top: { style: 'medium', color: { rgb: "3B82F6" } } },
            alignment: { vertical: "center" }
          };
          if (C >= 2 && C <= 6 && typeof cell.v === 'number') {
            cell.z = '#,##0.00';
            cell.s.alignment = { horizontal: "right", vertical: "center" };
          }
          if (C === 7 && typeof cell.v === 'number') {
            cell.z = '0.00%';
            cell.s.alignment = { horizontal: "right", vertical: "center" };
          }
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statement');
    const fileName = `Statement_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    sileo.success({ title: 'Export ready', description: `${fileName} has been downloaded` });
  };

  // ── Column header helper ────────────────────────────────────
  const SortTh = ({ col, label, right = false }: {
    col: keyof StatementRecord; label: string; right?: boolean;
  }) => (
    <th
      className={`py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600 transition-colors whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortCol === col
          ? sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          : <span className="w-3" />}
      </span>
    </th>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Statement of Appropriations, Allotments, Obligations & Balances"
        description="Per-office breakdown by expense classification"
        icon={FileText}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
            {isAdmin && (
              <>
                <Button
                  size="sm"
                  className="gap-2 text-xs h-8"
                  style={{ background: '#1D4ED8' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing
                    ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Importing…</span>
                    : <><FileUp className="w-3.5 h-3.5" /> Import Excel</>}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleImport}
                />
              </>
            )}
          </div>
        }
      />

      {/* Import success banner */}
      <AnimatePresence>
        {isAdmin && isImported && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 flex-1">
              <span className="font-semibold">{importedRecords.length} rows</span> imported from{' '}
              <span className="font-mono text-xs bg-emerald-100 px-1.5 py-0.5 rounded">{importedFileName}</span>
            </p>
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors px-2 py-1 rounded hover:bg-emerald-100"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Appropriation',      value: formatPeso(totals.appropriation),          color: 'text-blue-700',    bar: 'bg-blue-500' },
          { label: 'Allotment',          value: formatPeso(totals.allotment),              color: 'text-cyan-700',    bar: 'bg-cyan-500' },
          { label: 'Obligation',         value: formatPeso(totals.obligation),             color: 'text-violet-700',  bar: 'bg-violet-500' },
          { label: 'Balance of Approp.', value: formatPeso(totals.balanceOfAppropriation), color: 'text-emerald-700', bar: 'bg-emerald-500' },
          { label: 'Utilization Rate',   value: `${totals.utilizationRate.toFixed(2)}%`,  color: 'text-amber-700',   bar: 'bg-amber-400' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100 overflow-hidden">
            <CardContent className="p-4">
              <div className={`w-8 h-1 rounded-full mb-2 ${s.bar}`} />
              <p className="text-[11px] text-slate-400 leading-tight mb-1">{s.label}</p>
              <p className={`text-xs font-bold font-mono leading-tight ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main table */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold flex-1">
              Statement Records
              <span className="ml-2 text-xs font-normal text-slate-400">
                {filtered.length} rows
                {isImported && <span className="ml-1 text-emerald-600">· Imported</span>}
              </span>
            </CardTitle>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search expense classification…"
                className="pl-9 h-8 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!isImported ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No statement data imported yet</p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Import an Excel file containing the Statement of Appropriations, Allotments, Obligations &amp; Balances.
              </p>
              {isAdmin && (
                <Button size="sm" className="gap-2 text-xs h-8 text-white" style={{ background: '#1D4ED8' }} onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="w-3.5 h-3.5" /> Import Excel
                </Button>
              )}
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[960px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <SortTh col="expensesClassification" label="Expenses Classification" />
                  <SortTh col="appropriation"          label="Appropriation"           right />
                  <SortTh col="allotment"              label="Allotment"               right />
                  <SortTh col="obligation"             label="Obligation"              right />
                  <SortTh col="balanceOfAppropriation" label="Balance of Approp."      right />
                  <SortTh col="balanceOfAllotment"     label="Balance of Allotment"    right />
                  <SortTh col="utilizationRate"        label="Util. Rate"              right />
                  <SortTh col="accountCode"            label="Account Code"            />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map(row => {
                  if (row.isHeader) {
                    return (
                      <tr key={row.id} className="bg-blue-50/60">
                        <td
                          colSpan={8}
                          className="py-2.5 px-3 text-[11px] font-bold text-blue-800 uppercase tracking-wide"
                        >
                          {row.expensesClassification}
                          {row.appropriation > 0 && (
                            <span className="ml-4 font-mono font-semibold text-blue-700 normal-case tracking-normal">
                              ₱{row.appropriation.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-blue-50/20 transition-colors group"
                    >
                      {/* Classification */}
                      <td className="py-2.5 px-3 text-slate-700 font-medium max-w-[260px]">
                        <p className="leading-snug">{row.expensesClassification}</p>
                      </td>

                      {/* Appropriation — read-only */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {formatPeso(row.appropriation)}
                      </td>

                      {/* Allotment — click to deduct */}
                      <td
                        className={`py-2.5 px-3 text-right font-mono text-cyan-700 tabular-nums whitespace-nowrap ${
                          isAdmin ? 'cursor-pointer hover:bg-cyan-50 group/cell' : ''
                        }`}
                        onClick={() => openEditModal(row.id, 'allotment', row.allotment, 'Allotment')}
                        title={isAdmin ? 'Click to adjust Allotment' : undefined}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {formatPeso(row.allotment)}
                          {isAdmin && <Edit2 className="w-3 h-3 opacity-0 group-hover/cell:opacity-40 text-cyan-500 transition-opacity" />}
                        </span>
                      </td>

                      {/* Obligation — click to deduct */}
                      <td
                        className={`py-2.5 px-3 text-right font-mono text-violet-700 tabular-nums whitespace-nowrap ${
                          isAdmin ? 'cursor-pointer hover:bg-violet-50 group/cell' : ''
                        }`}
                        onClick={() => openEditModal(row.id, 'obligation', row.obligation, 'Obligation')}
                        title={isAdmin ? 'Click to adjust Obligation' : undefined}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {formatPeso(row.obligation)}
                          {isAdmin && <Edit2 className="w-3 h-3 opacity-0 group-hover/cell:opacity-40 text-violet-500 transition-opacity" />}
                        </span>
                      </td>

                      {/* Computed — AUTO */}
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums whitespace-nowrap">
                        {formatPeso(row.balanceOfAppropriation)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-teal-700 tabular-nums whitespace-nowrap">
                        {formatPeso(row.balanceOfAllotment)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                        <span className={`font-bold font-mono ${utilColor(row.utilizationRate)}`}>
                          {row.utilizationRate.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-500">{row.accountCode}</td>
                    </motion.tr>
                  );
                })}
              </tbody>

              {/* ── GRAND TOTAL ROW ── */}
              <tfoot>
                <tr className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
                  <td className="py-3 px-3 text-[11px] font-extrabold text-white uppercase tracking-wider">
                    GRAND TOTAL
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs tabular-nums whitespace-nowrap">
                    {formatPeso(totals.appropriation)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">
                    {formatPeso(totals.allotment)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">
                    {formatPeso(totals.obligation)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">
                    {formatPeso(totals.balanceOfAppropriation)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">
                    {formatPeso(totals.balanceOfAllotment)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs tabular-nums whitespace-nowrap">
                    {totals.utilizationRate.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3" />
                </tr>
              </tfoot>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Format hint for admin */}
      {isAdmin && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Excel Format:</span> Columns should include{' '}
            {['EXPENSES CLASSIFICATION', 'APPROPRIATION', 'ALLOTMENT', 'OBLIGATION', 'BALANCE OF APPROPRIATION', 'BALANCE OF ALLOTMENT', 'UTILIZATION RATE', 'ACCOUNT CODE'].map(c => (
              <span key={c} className="font-mono bg-blue-100 px-1 rounded mx-0.5">{c}</span>
            ))}. Headers auto-detected. Balances computed automatically.
          </p>
        </div>
      )}

      {/* ── DEDUCT MODAL ──────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-sm w-full p-0 overflow-hidden gap-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
            <DialogTitle className="text-white font-bold flex items-center gap-2 text-base">
              <Edit2 className="w-4 h-4" />
              Adjust {editTarget?.label}
            </DialogTitle>
            <p className="text-blue-100 text-xs mt-0.5">Enter the amount to deduct from the current value</p>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            {/* Current value */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Current {editTarget?.label}</p>
              <p className="text-xl font-bold font-mono text-slate-800">
                {editTarget ? formatPeso(editTarget.currentValue) : '—'}
              </p>
            </div>

            {/* Deduct input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                Amount to Deduct
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">₱</span>
                <Input
                  className="h-11 pl-7 text-sm font-mono text-right border-blue-300 focus:border-blue-500"
                  placeholder="0.00"
                  value={deductInput}
                  autoFocus
                  onChange={e => setDeductInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') applyDeduct(); }}
                />
              </div>
            </div>

            {/* Preview */}
            <div className={`rounded-xl p-4 border ${
              deductNum > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">New Value (Preview)</p>
              <p className={`text-xl font-bold font-mono ${
                deductNum > 0 ? 'text-emerald-700' : 'text-slate-400'
              }`}>
                {editTarget ? formatPeso(newPreview) : '—'}
              </p>
              {deductNum > 0 && editTarget && (
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {formatPeso(editTarget.currentValue)} − {formatPeso(deductNum)} = {formatPeso(newPreview)}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-slate-50 flex-row gap-2">
            <Button variant="outline" className="flex-1 h-10 text-sm" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1 h-10 text-sm font-semibold text-white gap-2"
              style={{ background: '#1D4ED8' }}
              disabled={deductNum <= 0}
              onClick={applyDeduct}
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ── ARCHIVE CONFIRMATION MODAL ─────────────────────────────────── */}
      <Dialog open={isConfirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-red-50 border-b border-red-100">
            <DialogTitle className="text-red-700 font-bold flex items-center gap-2 text-base">
              <Trash2 className="w-5 h-5 text-red-500" />
              Confirm Data Revocation
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5">
             <p className="text-sm text-slate-600 leading-relaxed">
               Are you certain you want to clear the active <strong className="text-slate-900">Statements Overview</strong>? 
               This will sweep <strong>{baseRecords.length}</strong> cached records natively into the Unified Cloud Trash repository permanently!
             </p>
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex items-center justify-end gap-2">
            <Button variant="ghost" className="h-9 text-xs font-semibold" onClick={() => setConfirmClear(false)}>Cancel</Button>
            <Button onClick={handleConfirmClear} className="h-9 text-xs font-bold text-white px-6 bg-red-600 hover:bg-red-700">
              Yes, Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
