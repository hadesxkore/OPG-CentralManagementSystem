import { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LayoutList, Download, FileUp, Search, X, CheckCircle2, ChevronUp, ChevronDown, Edit2, Trash2, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { usePPAStore } from '@/stores/ppaStore';
import { db } from '@/backend/firebase';
import { doc, setDoc, onSnapshot, deleteDoc, collection, addDoc } from 'firebase/firestore';
import { getPPATotal } from '@/data/ppaMockData';
import { formatPeso } from '@/data/mockData';
import type { PPARecord } from '@/types';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from '@/components/ui/pagination';
import { usePagination, buildPageList } from '@/hooks/usePagination';

// ── Excel parser ──────────────────────────────────────────────────────────────
function parsePPAExcel(file: File): Promise<PPARecord[]> {
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
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const joined = rows[i].map(c => String(c).toUpperCase()).join('|');
          if (joined.includes('FPP') || joined.includes('PROGRAM') || joined.includes('PROJECT')) {
            headerIdx = i;
            break;
          }
        }

        const headers = rows[headerIdx].map(h => String(h).toUpperCase().trim());
        const colIdx  = (kw: string) => headers.findIndex(h => h.includes(kw));

        const fppCol     = colIdx('FPP')           >= 0 ? colIdx('FPP')         : 0;
        const ppaCol     = colIdx('PROGRAM')        >= 0 ? colIdx('PROGRAM')
                         : colIdx('ACTIVITY')       >= 0 ? colIdx('ACTIVITY')    : 1;
        const appropCol  = colIdx('APPROPRIATION')  >= 0 ? colIdx('APPROPRIATION') : 2;
        const allotCol   = colIdx('ALLOTMENT')      >= 0 ? colIdx('ALLOTMENT')     : 3;
        const obligCol   = colIdx('OBLIGATION')     >= 0 ? colIdx('OBLIGATION')
                         : colIdx('OBLIG')          >= 0 ? colIdx('OBLIG')         : 4;
        const bAppropCol = colIdx('BALANCE OF APPRO') >= 0 ? colIdx('BALANCE OF APPRO') : -1;
        const bAllotCol  = colIdx('BALANCE OF ALLO')  >= 0 ? colIdx('BALANCE OF ALLO')  : -1;
        const utilCol    = colIdx('UTILIZATION')    >= 0 ? colIdx('UTILIZATION')    : -1;

        const num = (v: unknown) =>
          parseFloat(String(v ?? 0).replace(/[,%₱\s]/g, '').trim()) || 0;

        const groupName = file.name.replace(/\.[^/.]+$/, '').trim();

        const records: PPARecord[] = rows
          .slice(headerIdx + 1)
          .filter(row => row[fppCol] || row[ppaCol])
          .filter(row => String(row[fppCol] ?? '').trim() || String(row[ppaCol] ?? '').trim())
          .map((row, i) => {
            const appropriation = num(row[appropCol]);
            const allotment     = num(row[allotCol]);
            const obligation    = num(row[obligCol]);

            const ppaText = String(row[ppaCol] ?? '').trim();
            const fppText = String(row[fppCol]  ?? '').trim();

            // Detect section header: has label text but all numeric columns are zero/empty
            const isHeader = !fppText && ppaText.length > 0 &&
              appropriation === 0 && allotment === 0 && obligation === 0;

            if (isHeader) {
              return {
                id: `header_${i}`,
                fppCode: '',
                programProjectActivity: ppaText,
                appropriation: 0,
                allotment: 0,
                obligation: 0,
                balanceOfAppropriation: 0,
                balanceOfAllotment: 0,
                utilizationRate: 0,
                sourceGroup: groupName,
                isHeader: true,
              };
            }

            const balanceOfAppropriation = bAppropCol >= 0 && num(row[bAppropCol]) !== 0
              ? num(row[bAppropCol])
              : appropriation - allotment;

            const balanceOfAllotment = bAllotCol >= 0 && num(row[bAllotCol]) !== 0
              ? num(row[bAllotCol])
              : allotment - obligation;

            const rawUtil = utilCol >= 0 ? num(row[utilCol]) : 0;
            const utilizationRate = rawUtil > 0
              ? (rawUtil > 1 ? rawUtil : rawUtil * 100)
              : (appropriation > 0 ? (obligation / appropriation) * 100 : 0);

            return {
              id: `ppa_${i}`,
              fppCode:                fppText,
              programProjectActivity: ppaText,
              appropriation,
              allotment,
              obligation,
              balanceOfAppropriation,
              balanceOfAllotment,
              utilizationRate,
              sourceGroup: groupName,
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

// ── Util ──────────────────────────────────────────────────────────────────────
function utilBadgeClass(rate: number) {
  if (rate === 0)  return 'text-slate-400';
  if (rate >= 75)  return 'text-red-600';
  if (rate >= 50)  return 'text-amber-600';
  return 'text-emerald-600';
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PPAPage() {
  const { user } = useAuthStore();
  const isAdmin  = user?.role === 'admin';
  const { importedRecords, importedFileName, isImported, setImportedData, clearImport } = usePPAStore();

  const [search,    setSearch]    = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('All');
  const [importing, setImporting] = useState(false);
  const [isConfirmClear, setConfirmClear] = useState(false);
  const [sortCol,   setSortCol]   = useState<keyof PPARecord | null>(null);
  const [sortAsc,   setSortAsc]   = useState(true);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printSearch, setPrintSearch] = useState('');
  const [printSelectedIds, setPrintSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef              = useRef<HTMLInputElement>(null);

  // Firestore Sync Listener
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'finance', 'ppa_summary'), 
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setImportedData(data.records || [], data.fileName || 'Cloud DB');
        } else {
          clearImport();
        }
      },
      (error) => {
        console.error("Firestore hook error:", error);
        sileo.error({ title: "Database Locked", description: "Firebase blocked access. Please set Firestore SEC RULES to 'allow read, write: if true'." });
      }
    );
    return () => unsub();
  }, [setImportedData, clearImport]);

  const baseRecords = isImported ? importedRecords : [];
  const totals = getPPATotal(isImported ? importedRecords : []);

  // Dynamically detect section groups from isHeader rows in the parsed data
  const detectedSections = baseRecords
    .filter(r => r.isHeader)
    .map(r => ({ key: r.programProjectActivity, label: r.programProjectActivity }));

  const SECTION_FILTERS = [
    { key: 'All', label: 'All' },
    ...detectedSections,
  ];

  // Filter by section: slice records between matching header and next header
  const sectionFiltered = (() => {
    if (sectionFilter === 'All') return baseRecords;
    const headerIdx = baseRecords.findIndex(
      r => r.isHeader && r.programProjectActivity === sectionFilter
    );
    if (headerIdx === -1) return baseRecords;
    const nextHeaderIdx = baseRecords.findIndex((r, i) => i > headerIdx && r.isHeader);
    return baseRecords.slice(headerIdx, nextHeaderIdx === -1 ? undefined : nextHeaderIdx);
  })();

  const filtered = sectionFiltered.filter(r =>
    r.programProjectActivity.toLowerCase().includes(search.toLowerCase()) ||
    r.fppCode.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        if (a.isHeader) return -1;
        if (b.isHeader) return 1;
        const av = a[sortCol] as number | string;
        const bv = b[sortCol] as number | string;
        return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      })
    : filtered;

  const { paged, page, totalPages, goTo } = usePagination(sorted, 25);

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

    // Real-time Firestore deduction 
    const patchId = editTarget.rowId;
    const newRecords = baseRecords.map((r) => {
       if (r.id !== patchId) return r;
       const updated = { ...r, [editTarget.field]: newPreview };
       if (!updated.isHeader) {
          const bal_approp = updated.appropriation - updated.allotment;
          const bal_allot  = updated.allotment     - updated.obligation;
          const util_rate  = updated.appropriation > 0
             ? (updated.obligation / updated.appropriation) * 100
             : 0;
          return {
             ...updated,
             balanceOfAppropriation: bal_approp,
             balanceOfAllotment: bal_allot,
             utilizationRate: util_rate
          };
       }
       return updated;
    });

    sileo.promise(setDoc(doc(db, 'finance', 'ppa_summary'), { records: newRecords }, { merge: true }), {
      loading: { title: 'Syncing deduction...' },
      success: { title: 'Synced', description: 'Real-time deduction applied.' },
      error: { title: 'Error', description: 'Failed to apply deduction.' }
    });

    setEditTarget(null);
  };

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSort = (col: keyof PPARecord) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    const importTask = new Promise<number>(async (resolve, reject) => {
      try {
         const records = await parsePPAExcel(file);
         if (records.length === 0) throw new Error('No valid rows found.');
         
         const groupName = file.name.replace(/\.[^/.]+$/, '').trim();
         
         // In a multi-file PPA database system, we filter out ONLY the old records belonging to this specific file group,
         // allowing MOOE.xlsx and 20%.xlsx to coexist instead of wiping each other out!
         const otherExistingRecords = baseRecords ? baseRecords.filter(r => r.sourceGroup !== groupName) : [];
         const mergedRecords = [...otherExistingRecords, ...records];

         // Auto-Archive existing data if present
         if (baseRecords && baseRecords.length > 0) {
            await setDoc(doc(collection(db, 'budget_trash')), {
               type: 'ppa_summary',
               fileName: importedFileName || 'Legacy_PPA_File',
               records: baseRecords,
               clearedAt: new Date().toISOString(),
               clearedBy: user?.name || user?.email || 'Auto-Archiver',
               originalPath: 'finance/ppa_summary',
               status: 'Auto-Archived'
            });
         }

         await setDoc(doc(db, 'finance', 'ppa_summary'), {
            records: mergedRecords,
            fileName: 'Multiple Source DB',
            updatedAt: new Date().toISOString()
         });

         // Notify users
         await addDoc(collection(db, 'notifications'), {
           title: 'PPA Summary Updated',
           message: `Admin imported new latest data from ${file.name}`,
           createdAt: new Date().toISOString(),
           type: 'import'
         });

        resolve(records.length);
      } catch (err) {
        reject(err);
      } finally {
        setImporting(false);
      }
    });

    sileo.promise(importTask, {
      loading: { title: 'Pushing data to Firebase...' },
      success: (len) => ({ title: 'Import Synced', description: `${len} PPA rows secured to cloud.` }),
      error: (err) => ({ title: 'Import Failed', description: String(err) })
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleClearData = () => {
    setConfirmClear(true);
  };

  const confirmClearData = () => {
    // Stage exactly what gets moved natively to the cloud Trash collection shielding Admins from permanent failure routes globally
    const snapshotPayload = {
       type: 'ppa_summary',
       fileName: importedFileName,
       records: baseRecords,
       clearedAt: new Date().toISOString(),
       clearedBy: user?.name || 'Authorized Admin',
       originalPath: 'finance/ppa_summary',
       status: 'Archived'
    };

    sileo.promise(new Promise(async (resolve, reject) => {
      try {
        // Drop payload to designated Trash block
        await setDoc(doc(collection(db, 'budget_trash')), snapshotPayload);
        // Explicitly clear main record
        await deleteDoc(doc(db, 'finance', 'ppa_summary'));
        clearImport(); 
        resolve(true);
      } catch (e: any) {
        reject(e.message);
      }
    }), {
      loading: { title: 'Moving to Archive...' },
      success: () => {
        setConfirmClear(false);
        return { title: 'Archived to Trash', description: 'Data successfully migrated securing previous values gracefully.' };
      },
      error: (err) => ({ title: 'Failed to Archive', description: String(err) })
    });
  };

  const handleExport = () => {
    const title = [
      ['SUMMARY OF PROGRAM / PROJECT / ACTIVITY (PPA)'],
      [`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`],
      [] // Blank separator
    ];

    const headers = [[
      'FPP CODE',
      'PROGRAM / PROJECT / ACTIVITY',
      'APPROPRIATION',
      'ALLOTMENT',
      'OBLIGATION',
      'BALANCE OF APPROPRIATION',
      'BALANCE OF ALLOTMENT',
      'UTILIZATION RATE (%)'
    ]];

    const dataRows = baseRecords.filter(r => !r.isHeader).map(r => [
      r.fppCode,
      r.programProjectActivity,
      r.appropriation,
      r.allotment,
      r.obligation,
      r.balanceOfAppropriation,
      r.balanceOfAllotment,
      r.utilizationRate / 100
    ]);

    const totalRow = [[
      '',
      'GRAND TOTAL',
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
      { wch: 15 }, // FPP
      { wch: 45 }, // PPA
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
    XLSX.utils.book_append_sheet(wb, ws, 'PPA Summary');
    const fn = `PPA_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fn);
    sileo.success({ title: 'Export ready', description: `${fn} has been downloaded` });
  };

  const printFiltered = baseRecords.filter(r => !r.isHeader).filter(r => 
     r.programProjectActivity.toLowerCase().includes(printSearch.toLowerCase()) ||
     r.fppCode.toLowerCase().includes(printSearch.toLowerCase())
  );

  const togglePrintSelection = (id: string) => {
    setPrintSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePrintSelected = () => {
    if (printSelectedIds.size === 0) {
      return sileo.error({ title: 'Select PPAs to print' });
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'legal' });
    
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text("SUMMARY OF PROGRAM / PROJECT / ACTIVITY (PPA)", 40, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 40, 55);

    const headers = [[
      'FPP CODE',
      'PROGRAM / PROJECT / ACTIVITY',
      'APPROPRIATION',
      'ALLOTMENT',
      'OBLIGATION',
      'BALANCE OF APPROPRIATION',
      'BALANCE OF ALLOTMENT',
      'UTIL RATE'
    ]];

    const formatPdfNum = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const printRows = baseRecords
       .filter(r => !r.isHeader && printSelectedIds.has(r.id))
       .map(r => [
          r.fppCode,
          r.programProjectActivity,
          formatPdfNum(r.appropriation),
          formatPdfNum(r.allotment),
          formatPdfNum(r.obligation),
          formatPdfNum(r.balanceOfAppropriation),
          formatPdfNum(r.balanceOfAllotment),
          r.utilizationRate.toFixed(2) + '%'
       ]);

    autoTable(doc, {
      startY: 70,
      head: headers,
      body: printRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4, textColor: [50, 50, 50], lineColor: [220, 220, 220], lineWidth: 0.5 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 260 },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
      },
      margin: { left: 40, right: 40 }
    });

    const pdfURL = doc.output('bloburl');
    window.open(pdfURL, '_blank');
    setPrintModalOpen(false);
  };

  // ── Sortable TH helper ───────────────────────────────────────────────
  const SortTh = ({ col, label, right = false, wide = false }: {
    col: keyof PPARecord; label: string; right?: boolean; wide?: boolean;
  }) => (
    <th
      onClick={() => handleSort(col)}
      className={`
        py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider
        cursor-pointer select-none hover:text-blue-600 transition-colors whitespace-nowrap
        ${right ? 'text-right' : 'text-left'}
        ${wide  ? 'min-w-[260px]' : ''}
      `}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortCol === col
          ? sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          : <span className="w-3" />}
      </span>
    </th>
  );

  // Count non-header rows
  const dataCount = baseRecords.filter(r => !r.isHeader).length;

  return (
    <div className="space-y-5">

      {/* Page header */}
      <PageHeader
        title="Summary of Program / Project / Activity (PPA)"
        description="FPP-coded budget breakdown per program, project, and activity"
        icon={LayoutList}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8" onClick={() => setPrintModalOpen(true)}>
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
            {isAdmin && (
              <>
                <Button
                  size="sm"
                  className="gap-2 text-xs h-8 text-white"
                  style={{ background: '#1D4ED8' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing
                    ? <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Importing…
                      </span>
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
              <span className="font-semibold">{importedRecords.filter(r => !r.isHeader).length} PPA rows</span> imported from{' '}
              <span className="font-mono text-xs bg-emerald-100 px-1.5 py-0.5 rounded">{importedFileName}</span>
            </p>
            <button
              onClick={handleClearData}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors px-2 py-1 rounded hover:bg-emerald-100"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Appropriation',     value: formatPeso(totals.appropriation),          color: 'text-blue-700',    bar: 'bg-blue-500' },
          { label: 'Total Allotment',          value: formatPeso(totals.allotment),              color: 'text-cyan-700',    bar: 'bg-cyan-500' },
          { label: 'Total Obligation',         value: formatPeso(totals.obligation),             color: 'text-violet-700',  bar: 'bg-violet-500' },
          { label: 'Balance of Aprop.',        value: formatPeso(totals.balanceOfAppropriation), color: 'text-emerald-700', bar: 'bg-emerald-500' },
          { label: 'Utilization Rate',         value: `${totals.utilizationRate.toFixed(2)}%`,  color: 'text-amber-700',   bar: 'bg-amber-400' },
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

      {/* Table */}
      <Card className="shadow-sm border-slate-100 flex flex-col min-h-[75vh]">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="text-base font-semibold flex-1">
                PPA Records
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {dataCount} programs/projects
                  {isImported && <span className="ml-1 text-emerald-600">· Imported</span>}
                </span>
              </CardTitle>
              <div className="relative sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Search by FPP code or project name…"
                  className="pl-9 h-8 text-xs"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Section Filter Pills — shown only if headers detected in Excel */}
            {isImported && SECTION_FILTERS.length > 1 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Filter by Section:</span>
                {SECTION_FILTERS.map(sec => (
                  <button
                    key={sec.key}
                    onClick={() => { setSectionFilter(sec.key); goTo(1); }}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-all ${
                      sectionFilter === sec.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col">
          {!isImported ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <LayoutList className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No PPA data imported yet</p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Import an Excel file with FPP Code, Program/Project/Activity, Appropriation, Allotment, Obligation, and Utilization Rate columns.
              </p>
              {isAdmin && (
                <Button size="sm" className="gap-2 text-xs h-8 text-white" style={{ background: '#1D4ED8' }} onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="w-3.5 h-3.5" /> Import Excel
                </Button>
              )}
            </div>
          ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs min-w-[960px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <SortTh col="fppCode"                label="FPP Code"            />
                  <SortTh col="programProjectActivity" label="Program/Project/Activity" wide />
                  <SortTh col="appropriation"          label="Appropriation"        right />
                  <SortTh col="allotment"              label="Allotment"            right />
                  <SortTh col="obligation"             label="Obligation"           right />
                  <SortTh col="balanceOfAppropriation" label="Bal. of Approp."      right />
                  <SortTh col="balanceOfAllotment"     label="Bal. of Allotment"    right />
                  <SortTh col="utilizationRate"        label="Util. Rate"           right />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                  {paged.map(row => {
                  // Section header row
                  if (row.isHeader) {
                    return (
                      <tr key={row.id} className="bg-gradient-to-r from-blue-600/10 to-blue-500/5">
                        <td
                          colSpan={8}
                          className="py-2 px-3 text-[11px] font-bold text-blue-800 uppercase tracking-widest"
                        >
                          {row.programProjectActivity}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/20 transition-colors group"
                    >
                      {/* FPP Code */}
                      <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold whitespace-nowrap text-[11px]">
                        {row.fppCode}
                      </td>
                      {/* Program/Project/Activity */}
                      <td className="py-2.5 px-3 text-slate-700 font-medium max-w-[300px]">
                        <p className="leading-snug line-clamp-2" title={row.programProjectActivity}>
                          {row.programProjectActivity}
                        </p>
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
                      {/* Balance of Appropriation — AUTO */}
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums whitespace-nowrap">
                        <span title="Auto-computed: Appropriation − Allotment">
                          {formatPeso(row.balanceOfAppropriation)}
                        </span>
                      </td>
                      {/* Balance of Allotment — AUTO */}
                      <td className="py-2.5 px-3 text-right font-mono text-teal-700 tabular-nums whitespace-nowrap">
                        <span title="Auto-computed: Allotment − Obligation">
                          {formatPeso(row.balanceOfAllotment)}
                        </span>
                      </td>
                      {/* Utilization Rate — AUTO */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className={`font-bold font-mono ${utilBadgeClass(row.utilizationRate)}`}
                          title="Auto-computed: Obligation ÷ Appropriation × 100">
                          {row.utilizationRate.toFixed(2)}%
                        </span>
                        <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className={`h-1 rounded-full transition-all ${
                              row.utilizationRate >= 75 ? 'bg-red-400' :
                              row.utilizationRate >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(row.utilizationRate, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* ── GRAND TOTAL ── */}
              <tfoot>
                <tr className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
                  <td className="py-3 px-3 text-[11px] font-extrabold text-white uppercase tracking-wider">
                    –
                  </td>
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
                </tr>
              </tfoot>
            </table>
          </div>
          )}{/* end overflow or empty state */}

          {/* ── Pagination ── */}
          {isImported && totalPages > 1 && (
            <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing <strong>{(page - 1) * 25 + 1}–{Math.min(page * 25, sorted.length)}</strong> of <strong>{sorted.length}</strong> entries
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

      {/* Format hint — admin only */}
      {isAdmin && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
          <LayoutList className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Excel Format:</span> Columns should include{' '}
            {['FPP CODE', 'PROGRAM PROJECT ACTIVITY', 'APPROPRIATION', 'ALLOTMENT', 'OBLIGATION', 'BALANCE OF APPROPRIATION', 'BALANCE OF ALLOTMENT', 'UTILIZATION RATE'].map(c => (
              <span key={c} className="font-mono bg-blue-100 px-1 rounded mx-0.5">{c}</span>
            ))}. Headers auto-detected. Balance and utilization computed automatically if missing.
          </p>
        </div>
      )}
      {/* ── DEDUCT MODAL ──────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-sm w-full p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
            <DialogTitle className="text-white font-bold flex items-center gap-2 text-base">
              <Edit2 className="w-4 h-4" />
              Adjust {editTarget?.label}
            </DialogTitle>
            <p className="text-blue-100 text-xs mt-0.5">Enter the amount to deduct from the current value</p>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Current {editTarget?.label}</p>
              <p className="text-xl font-bold font-mono text-slate-800">
                {editTarget ? formatPeso(editTarget.currentValue) : '—'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Amount to Deduct <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">₱</span>
                <Input
                  className="h-11 pl-7 text-sm font-mono text-right border-blue-300"
                  placeholder="0.00"
                  value={deductInput}
                  autoFocus
                  onChange={e => setDeductInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') applyDeduct(); }}
                />
              </div>
            </div>

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
              className="flex-1 h-10 text-sm font-semibold text-white"
              style={{ background: '#1D4ED8' }}
              disabled={deductNum <= 0}
              onClick={applyDeduct}
            >
              Apply Changes
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
               Are you certain you want to clear the active <strong className="text-slate-900">PPA Summary</strong>? 
               This will sweep <strong>{baseRecords.length}</strong> live cloud mappings directly into the Trash repository immediately locking its availability across global destinations securely!
             </p>
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex items-center justify-end gap-2">
            <Button variant="ghost" className="h-9 text-xs font-semibold" onClick={() => setConfirmClear(false)}>Cancel</Button>
            <Button onClick={confirmClearData} className="h-9 text-xs font-bold text-white px-6 bg-red-600 hover:bg-red-700">
              Yes, Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ── PRINT SELECTION MODAL ────────────────────────────────────── */}
      <Dialog open={printModalOpen} onOpenChange={(v) => { setPrintModalOpen(v); if(!v) setPrintSelectedIds(new Set()); }}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-lg shadow-2xl">
          <DialogHeader className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex flex-row items-center justify-between">
            <div>
               <DialogTitle className="text-blue-800 font-bold flex items-center gap-2 text-base">
                 <Printer className="w-5 h-5 text-blue-600" /> Print Summary Report
               </DialogTitle>
               <p className="text-blue-600 text-[11px] mt-1">Select the specific FPP and PPA items below that you wish to include in your formal printout.</p>
            </div>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-9 h-10 text-[13px] border-slate-200"
                  placeholder="Search to filter FPPs or Projects..."
                  value={printSearch}
                  onChange={e => setPrintSearch(e.target.value)}
                />
              </div>
              <Button
                 variant="secondary"
                 className="h-10 text-xs px-5 border border-slate-200 bg-white"
                 onClick={() => {
                    if (printSelectedIds.size === printFiltered.length && printFiltered.length > 0) {
                      setPrintSelectedIds(new Set());
                    } else {
                      setPrintSelectedIds(new Set(printFiltered.map(r => r.id)));
                    }
                 }}
              >
                 {printSelectedIds.size === printFiltered.length && printFiltered.length > 0 
                   ? 'Deselect View' 
                   : 'Select All in View'}
              </Button>
            </div>
            
            <div className="flex bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider py-2 px-3 rounded-none border-y border-slate-200 gap-3">
               <div className="w-8 shrink-0 text-center">Sel</div>
               <div className="w-24 shrink-0">FPP Code</div>
               <div className="flex-1">PPA Description</div>
            </div>
            <div className="max-h-[350px] overflow-y-auto space-y-0 pb-2 divide-y divide-slate-100 pr-1">
              {printFiltered.length === 0 ? (
                 <div className="text-center py-6 text-slate-400 text-sm">No items found matching your filter.</div>
              ) : (
                printFiltered.map(ppa => {
                   const isSel = printSelectedIds.has(ppa.id);
                   return (
                     <div 
                       key={ppa.id} 
                       className={`flex items-start gap-3 py-2 px-3 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${isSel ? 'bg-blue-50/50' : ''}`}
                       onClick={() => togglePrintSelection(ppa.id)}
                     >
                       <div className="w-8 shrink-0 flex justify-center pt-0.5">
                         <input 
                           type="checkbox" 
                           checked={isSel} 
                           onChange={() => {}} 
                           className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                         />
                       </div>
                       <div className="w-24 shrink-0 font-mono text-[11px] font-semibold text-slate-700">{ppa.fppCode}</div>
                       <div className="flex-1 text-[12px] text-slate-600 font-medium leading-tight pr-2">{ppa.programProjectActivity}</div>
                     </div>
                   );
                })
              )}
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
               <span className="text-blue-600 font-bold">{printSelectedIds.size}</span> item(s) currently staged for printing
            </div>
            <div className="flex gap-2">
               <Button variant="ghost" className="h-9 text-xs" onClick={() => setPrintModalOpen(false)}>Cancel</Button>
               <Button 
                  onClick={handlePrintSelected} 
                  className="h-9 text-xs font-bold text-white px-8"
                  style={{ background: '#1D4ED8' }}
                  disabled={printSelectedIds.size === 0}
               >
                 Generate PDF Document
               </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
