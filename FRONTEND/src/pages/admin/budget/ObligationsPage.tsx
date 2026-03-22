import { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
type DateRange = { from: Date | undefined; to?: Date | undefined };
import { format } from 'date-fns';
import {
  ScrollText, Download, FileUp, Search, X, CheckCircle2, CalendarIcon, Trash2
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatPeso } from '@/data/mockData';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from '@/components/ui/pagination';
import { usePagination, buildPageList } from '@/hooks/usePagination';

// ── Record type ────────────────────────────────────────────────────────────────
interface ObligationRecord {
  id: string;
  obrDate: string;
  obrNo: string;
  payee: string;
  particulars: string;
  accountCode: string;
  netApprovedAmount: number;
  payment: number;
}

// ── Zustand store (with persistence) ──────────────────────────────────────────
interface ObligationStoreState {
  records: ObligationRecord[];
  fileName: string;
  isImported: boolean;
  setData: (records: ObligationRecord[], fileName: string) => void;
  clearData: () => void;
}

export const useObligationStore = create<ObligationStoreState>()(
  persist(
    (set) => ({
      records: [],
      fileName: '',
      isImported: false,
      setData: (records, fileName) => set({ records, fileName, isImported: true }),
      clearData: () => set({ records: [], fileName: '', isImported: false }),
    }),
    { name: 'opg-obligations-store' }
  )
);

// ── Excel parser ───────────────────────────────────────────────────────────────
function parseObligationsExcel(file: File): Promise<ObligationRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });

        // Auto-detect header row
        let headerIdx = 0;
        for (let i = 0; i < Math.min(rows.length, 8); i++) {
          const joined = rows[i].map(c => String(c).toUpperCase()).join('|');
          if (joined.includes('OBR') || joined.includes('PAYEE') || joined.includes('PARTICULARS')) {
            headerIdx = i;
            break;
          }
        }

        const headers = rows[headerIdx].map(h => String(h).toUpperCase().trim());
        const col = (kw: string) => headers.findIndex(h => h.includes(kw));

        const dateCol    = col('DATE')    >= 0 ? col('DATE')    : 0;
        const obrNoCol   = col('OBR NO')  >= 0 ? col('OBR NO')
                         : col('OBR')     >= 0 ? col('OBR')     : 1;
        const payeeCol   = col('PAYEE')   >= 0 ? col('PAYEE')   : 2;
        const particCol  = col('PARTICULARS') >= 0 ? col('PARTICULARS') : 3;
        const accCol     = col('ACCOUNT') >= 0 ? col('ACCOUNT') : 4;
        const netAmtCol  = col('NET APPROVED') >= 0 ? col('NET APPROVED')
                         : col('NET AMT')      >= 0 ? col('NET AMT')
                         : col('AMOUNT')        >= 0 ? col('AMOUNT')       : 5;
        const paymentCol = col('PAYMENT') >= 0 ? col('PAYMENT') : 6;

        const num = (v: unknown) =>
          parseFloat(String(v ?? 0).replace(/[,%₱\s]/g, '').trim()) || 0;

        const parsedDate = (v: unknown): string => {
          const raw = String(v ?? '').trim();
          if (!raw) return '';
          // XLSX sometimes gives a serial number for dates
          const n = Number(raw);
          if (!isNaN(n) && n > 1000) {
            const d = XLSX.SSF.parse_date_code(n);
            if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
          }
          return raw;
        };

        const records: ObligationRecord[] = rows
          .slice(headerIdx + 1)
          .filter(row => row[obrNoCol] && String(row[obrNoCol]).trim())
          .map((row, i) => ({
            id:                `obr_${i}`,
            obrDate:           parsedDate(row[dateCol]),
            obrNo:             String(row[obrNoCol] ?? '').trim(),
            payee:             String(row[payeeCol]  ?? '').trim(),
            particulars:       String(row[particCol] ?? '').trim(),
            accountCode:       String(row[accCol]    ?? '').trim(),
            netApprovedAmount: num(row[netAmtCol]),
            payment:           num(row[paymentCol]),
          }));

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ObligationsPage() {
  const { user } = useAuthStore();
  const isAdmin  = user?.role === 'admin';
  const { records, fileName, isImported, setData, clearData } = useObligationStore();

  const [search,    setSearch]    = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  // ── Export Modal State ──────────────────────────────────────────────────────
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isConfirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'finance', 'obligations'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setData(data.records || [], data.fileName || 'Cloud DB');
      } else {
        clearData();
      }
    });
    return () => unsub();
  }, [setData, clearData]);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const totalNetAmount = records.reduce((s, r) => s + r.netApprovedAmount, 0);
  const totalPayment   = records.reduce((s, r) => s + r.payment, 0);
  const totalUnpaid    = Math.max(0, totalNetAmount - totalPayment);

  // ── Filter + Pagination ──────────────────────────────────────────────────
  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return (
      r.obrNo.toLowerCase().includes(q) ||
      r.payee.toLowerCase().includes(q) ||
      r.particulars.toLowerCase().includes(q) ||
      r.accountCode.toLowerCase().includes(q)
    );
  });

  const { paged, page, totalPages, goTo } = usePagination(filtered, 25);

  // ── Import handler ──────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    
    sileo.promise(new Promise(async (resolve, reject) => {
       try {
         const parsed = await parseObligationsExcel(file);
         if (parsed.length === 0) throw new Error('No valid rows found in the file.');
         
         // Auto-Archive existing data if present
         if (records && records.length > 0) {
            await setDoc(doc(collection(db, 'budget_trash')), {
               type: 'obligations',
               fileName: fileName || 'Legacy_Obligations_File',
               records: records,
               clearedAt: new Date().toISOString(),
               clearedBy: user?.name || user?.email || 'Auto-Archiver',
               status: 'Auto-Archived',
               originalPath: 'finance/obligations'
            });
         }

         await setDoc(doc(db, 'finance', 'obligations'), {
           records: parsed,
           fileName: file.name,
           updatedAt: new Date().toISOString()
         });

         // Notify users
         await addDoc(collection(db, 'notifications'), {
           title: 'Obligations Updated',
           message: `Admin imported new latest data from ${file.name}`,
           createdAt: new Date().toISOString(),
           type: 'import'
         });

         resolve(parsed.length);
       } catch (err: any) {
         reject(err.message || 'Unknown error');
       }
    }), {
       loading: { title: 'Uploading to Cloud...' },
       success: (len) => {
         setImporting(false);
         if (fileInputRef.current) fileInputRef.current.value = '';
         return { title: 'Import successful', description: `${len} obligation records loaded globally` };
       },
       error: (err) => {
         setImporting(false);
         return { title: 'Import failed', description: String(err) };
       }
    });
  };

  const handleConfirmClear = async () => {
    const payload = {
      type: 'obligations',
      fileName: fileName,
      records: records,
      clearedAt: new Date().toISOString(),
      clearedBy: user?.name || 'Administrator',
      status: 'Archived',
      originalPath: 'offline/obligations'
    };

    sileo.promise(new Promise(async (resolve, reject) => {
      try {
        await setDoc(doc(collection(db, 'budget_trash')), payload);
        clearData();
        resolve(true);
      } catch (err: any) {
        reject(err.message || 'Archiving failed');
      }
    }), {
      loading: { title: 'Moving to Archive...' },
      success: () => {
        setConfirmClear(false);
        return { title: 'Archived to Trash', description: 'Obligation records successfully migrated to the cloud repository.' };
      },
      error: (e) => ({ title: 'Failed to Archive', description: String(e) })
    });
  };

  // ── Export handler ──────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!isImported || records.length === 0) return;

    // Filter by selected date range if provided
    let exportRecords = records;
    if (dateRange?.from || dateRange?.to) {
      exportRecords = records.filter(r => {
        const d = new Date(r.obrDate);
        if (isNaN(d.getTime())) return true; // keep empty/invalid dates

        // Force local midnight for safe comparison
        d.setHours(0, 0, 0, 0);
        
        // Input dates format 'YYYY-MM-DD'. Appending T00:00:00 forces local time parsing
        const start = dateRange?.from ? new Date(dateRange.from) : null;
        if (start) start.setHours(0, 0, 0, 0);
        
        const end = dateRange?.to ? new Date(dateRange.to) : null;
        if (end) end.setHours(23, 59, 59, 999); // Inclusive of entire end day

        if (start && d.getTime() < start.getTime()) return false;
        if (end && d.getTime() > end.getTime()) return false;
        
        return true;
      });
    }

    if (exportRecords.length === 0) {
      sileo.error({ title: 'Export Failed', description: 'No records match the selected date range.' });
      setExportModalOpen(false);
      return;
    }

    const title = [
      ['OBLIGATIONS TRANSACTIONS'],
      [`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`],
      dateRange?.from || dateRange?.to 
        ? [`Filtered Range: ${dateRange?.from ? format(dateRange.from, 'MMM dd, yyyy') : 'Start'} to ${dateRange?.to ? format(dateRange.to, 'MMM dd, yyyy') : 'Present'}`] 
        : [] // Blank separator
    ];

    const headers = [[
      'OBR DATE',
      'OBR NO.',
      'PAYEE',
      'PARTICULARS',
      'ACCOUNT CODE',
      'NET APPROVED AMOUNT',
      'PAYMENT'
    ]];

    const dataRows = exportRecords.map(r => [
      r.obrDate,
      r.obrNo,
      r.payee,
      r.particulars,
      r.accountCode,
      r.netApprovedAmount,
      r.payment
    ]);

    const totalRow = [[
      '',
      '',
      '',
      'GRAND TOTAL',
      '',
      exportRecords.reduce((s, r) => s + r.netApprovedAmount, 0),
      exportRecords.reduce((s, r) => s + r.payment, 0)
    ]];

    const wsData = [...title, ...headers, ...dataRows, ...totalRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge title cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }
    ];

    // Set user-friendly column widths
    ws['!cols'] = [
      { wch: 15 }, // OBR DATE
      { wch: 20 }, // OBR NO
      { wch: 35 }, // PAYEE
      { wch: 50 }, // PARTICULARS
      { wch: 20 }, // ACCOUNT CODE
      { wch: 25 }, // NET APPROVED AMOUNT
      { wch: 20 }  // PAYMENT
    ];

    // Apply granular styles and professional number formatting with color coding
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:G1');
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
        
        // Metadata / Date row (Row 1 & 2)
        if ((R === 1 || R === 2) && C === 0) {
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
          // Numbers formatting (Cols 5 and 6)
          if (C >= 5 && C <= 6 && typeof cell.v === 'number') {
            cell.z = '#,##0.00';
            cell.s = { alignment: { horizontal: "right" } };
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
          if (C >= 5 && C <= 6 && typeof cell.v === 'number') {
            cell.z = '#,##0.00';
            cell.s.alignment = { horizontal: "right", vertical: "center" };
          }
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Obligations');
    const fn = `Obligations_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fn);
    sileo.success({ title: 'Export ready', description: `${fn} has been downloaded` });
    setExportModalOpen(false); // Close modal on success
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Obligations"
        description="OBR transactions charged against the appropriation"
        icon={ScrollText}
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  size="sm"
                  className="gap-2 text-xs h-8 text-white"
                  style={{ background: '#1D4ED8' }}
                  disabled={importing}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {importing 
                    ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Importing…</span>
                    : <><FileUp className="w-3.5 h-3.5" /> Import Excel</>}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs h-8"
              disabled={!isImported}
              onClick={() => setExportModalOpen(true)}
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
          </div>
        }
      />

      {/* ── Imported file banner ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isAdmin && isImported && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Showing <strong>{records.length}</strong> records from <strong className="font-mono text-[10px] bg-emerald-100 px-1 py-0.5 rounded">{fileName}</strong></span>
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors px-2 py-1 rounded hover:bg-emerald-100"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Records',          value: records.length,  isCount: true,  color: '#1D4ED8', bar: 'bg-blue-500' },
          { label: 'Net Approved Amount',    value: totalNetAmount,  isCount: false, color: '#16A34A', bar: 'bg-emerald-500' },
          { label: 'Total Payments Made',    value: totalPayment,    isCount: false, color: '#0891B2', bar: 'bg-cyan-500' },
          { label: 'Outstanding (Unpaid)',   value: totalUnpaid,     isCount: false, color: '#D97706', bar: 'bg-amber-500' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100">
            <CardContent className="p-4">
              <div className={`w-8 h-1 rounded-full mb-3 ${s.bar}`} />
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold font-mono text-slate-900">
                {s.isCount ? `${s.value} records` : formatPeso(s.value as number)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main table ────────────────────────────────────────────────────── */}
      <Card className="shadow-sm border-slate-100 flex flex-col min-h-[75vh]">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold flex-1">
              Obligation Records
              <span className="ml-2 text-xs font-normal text-slate-400">
                {filtered.length} entries
                {isImported && <span className="ml-1 text-emerald-600">· Imported</span>}
              </span>
            </CardTitle>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search OBR No., payee, particulars…"
                className="pl-9 h-8 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col">
          {!isImported ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <ScrollText className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No obligation data imported yet</p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Import an Excel file with columns: OBR DATE, OBR NO., PAYEE, PARTICULARS, ACCOUNT CODE, NET APPROVED AMOUNT, PAYMENT.
              </p>
              {isAdmin && (
                <Button
                  size="sm"
                  className="gap-2 text-xs h-8 text-white"
                  style={{ background: '#1D4ED8' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="w-3.5 h-3.5" /> Import Excel
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    {[
                      { label: 'OBR DATE',           cls: '' },
                      { label: 'OBR NO.',            cls: '' },
                      { label: 'PAYEE',              cls: '' },
                      { label: 'PARTICULARS',        cls: '' },
                      { label: 'ACCOUNT CODE',       cls: '' },
                      { label: 'NET APPROVED AMOUNT',cls: 'text-right' },
                      { label: 'PAYMENT',            cls: 'text-right' },
                    ].map(h => (
                      <th
                        key={h.label}
                        className={`py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${h.cls}`}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map(row => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {row.obrDate}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold whitespace-nowrap">
                        {row.obrNo}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-[180px] truncate" title={row.payee}>
                        {row.payee}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-[240px]">
                        <p className="leading-snug line-clamp-2" title={row.particulars}>
                          {row.particulars}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {row.accountCode}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                        {formatPeso(row.netApprovedAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-cyan-700 tabular-nums whitespace-nowrap">
                        {row.payment > 0 ? formatPeso(row.payment) : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Grand Total row */}
                <tfoot>
                  <tr className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <td colSpan={5} className="py-3 px-3 text-[11px] font-extrabold text-white uppercase tracking-wider">
                      Grand Total
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs tabular-nums whitespace-nowrap">
                      {formatPeso(filtered.reduce((s, r) => s + r.netApprovedAmount, 0))}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">
                      {formatPeso(filtered.reduce((s, r) => s + r.payment, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No records found</div>
              )}
            </div>
          )}

          {/* ── Pagination ── */}
          {isImported && totalPages > 1 && (
            <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing <strong>{(page - 1) * 25 + 1}–{Math.min(page * 25, filtered.length)}</strong> of <strong>{filtered.length}</strong> records
              </p>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => goTo(page - 1)} disabled={page === 1} />
                  </PaginationItem>
                  {buildPageList(page, totalPages).map((p, i) =>
                    p === '…' ? (
                      <PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink isActive={p === page} onClick={() => goTo(p as number)}>{p}</PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext onClick={() => goTo(page + 1)} disabled={page === totalPages} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Format hint */}
      {isAdmin && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
          <ScrollText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Excel Format:</span> Columns should include{' '}
            {['OBR DATE', 'OBR NO.', 'PAYEE', 'PARTICULARS', 'ACCOUNT CODE', 'NET APPROVED AMOUNT', 'PAYMENT'].map(c => (
              <span key={c} className="font-mono bg-blue-100 px-1 rounded mx-0.5">{c}</span>
            ))}. Headers are auto-detected.
          </p>
        </div>
      )}

      {/* ── EXPORT DATE RANGE MODAL ──────────────────────────────────────────── */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="max-w-sm w-full p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
            <DialogTitle className="text-white font-bold flex items-center gap-2 text-base">
              <Download className="w-4 h-4" />
              Export Options
            </DialogTitle>
            <p className="text-blue-100 text-xs mt-0.5">Filter by OBR date range before downloading.</p>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-sm font-semibold text-slate-700">Select Date Range (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal border-slate-200 h-10 text-sm",
                      !dateRange && "text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {dateRange?.from && (
              <p className="text-xs text-slate-500 bg-blue-50 p-2.5 rounded-lg border border-blue-100 mt-2">
                Only records with an <strong className="font-semibold text-blue-700">OBR Date</strong> inside this range will be exported to Excel.
              </p>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-slate-50 flex-row gap-2">
            <Button variant="outline" className="flex-1 h-10 text-sm" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 h-10 text-sm font-semibold text-white gap-2"
              style={{ background: '#1D4ED8' }}
              onClick={handleExport}
            >
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ARHIVE CONFIRMATION MODAL ────────────────────────────────────── */}
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
               Are you certain you want to clear the active <strong className="text-slate-900">Obligation Transactions</strong>? 
               This will sweep <strong>{records.length}</strong> cached records natively into the Unified Cloud Trash repository permanently!
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
