import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  X,
  CheckCircle2,
  FileUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import {
  getBudgetSummaryFromRecords,
  formatPeso,
} from '@/data/mockData';
import type { BudgetRecord } from '@/types';

// ── Util helpers ──────────────────────────────────────────────
function utilizationColor(rate: number) {
  if (rate >= 75) return { text: 'text-red-600',   bg: 'bg-red-50   border-red-200' };
  if (rate >= 50) return { text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
  if (rate > 0)   return { text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
  return           { text: 'text-slate-400',     bg: 'bg-slate-50  border-slate-200' };
}

// ── Excel parser ──────────────────────────────────────────────
function parseExcelFile(file: File): Promise<BudgetRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // Convert to array-of-arrays (raw rows)
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });

        // Find header row (contains "OFFICE" or "APPROPRIATION")
        let headerIdx = 0;
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
          const rowStr = rows[i].map(c => String(c).toUpperCase()).join('|');
          if (rowStr.includes('OFFICE') || rowStr.includes('APPROPRIATION')) {
            headerIdx = i;
            break;
          }
        }

        // Map headers → column indices
        const headers = rows[headerIdx].map(h => String(h).toUpperCase().trim());
        const col = (keyword: string) =>
          headers.findIndex(h => h.includes(keyword));

        const officeCol     = col('OFFICE')       >= 0 ? col('OFFICE')       : 0;
        const appropCol     = col('APPROPRIATION') >= 0 ? col('APPROPRIATION') : 1;
        const obligCol      = col('OBLIGATION')    >= 0 ? col('OBLIGATION')    : col('OBLIG') >= 0 ? col('OBLIG') : 2;
        const balanceCol    = col('BALANCE')       >= 0 ? col('BALANCE')       : 3;
        const utilizCol     = col('UTILIZATION')   >= 0 ? col('UTILIZATION')   : 4;

        const records: BudgetRecord[] = rows
          .slice(headerIdx + 1)
          .filter(row => row[officeCol] && String(row[officeCol]).trim())
          .map((row, i) => {
            const rawUtil = String(row[utilizCol] ?? '').replace('%', '').trim();
            return {
              id: `imported_${i}`,
              office:        String(row[officeCol] ?? '').trim(),
              appropriation: parseFloat(String(row[appropCol] ?? '0').replace(/,/g, '')) || 0,
              obligation:    parseFloat(String(row[obligCol]  ?? '0').replace(/,/g, '')) || 0,
              balance:       parseFloat(String(row[balanceCol]?? '0').replace(/,/g, '')) || 0,
              utilization:   parseFloat(rawUtil) || 0,
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

// ── Component ─────────────────────────────────────────────────
export default function AppropriationPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { importedRecords, importedFileName, isImported, setImportedData, clearImport } = useBudgetStore();

  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active dataset: imported records only
  const activeRecords: BudgetRecord[] = importedRecords;
  const { totalAppropriation, totalObligation, totalBalance, avgUtilization } =
    getBudgetSummaryFromRecords(activeRecords);

  const filtered = activeRecords.filter(r =>
    r.office.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers ──────────────────────────────────────────────
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const records = await parseExcelFile(file);
      if (records.length === 0) throw new Error('No valid rows found in the file.');
      setImportedData(records, file.name);
      sileo.success({
        title: 'Import successful',
        description: `${records.length} records loaded from ${file.name}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file.';
      sileo.error({ title: 'Import failed', description: msg });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    const exportData = activeRecords.map(r => ({
      OFFICE: r.office,
      APPROPRIATION: r.appropriation,
      OBLIGATION: r.obligation,
      BALANCES: r.balance,
      'UTILIZATION (%)': r.utilization,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Budget Data');
    const fileName = `Budget_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    sileo.success({ title: 'Export ready', description: `${fileName} downloaded` });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Appropriation & Budget Summary"
        description="Office-level appropriation, obligation, balance, and utilization"
        icon={FileSpreadsheet}
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
                  onClick={handleImportClick}
                  disabled={importing}
                >
                  {importing ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Importing…
                    </span>
                  ) : (
                    <>
                      <FileUp className="w-3.5 h-3.5" /> Import Excel
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
        }
      />

      {/* Import success banner — persistent, shows file name + clear button */}
      <AnimatePresence>
        {isImported && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 flex-1">
              <span className="font-semibold">{importedRecords.length} records</span> imported from{' '}
              <span className="font-mono text-xs bg-emerald-100 px-1.5 py-0.5 rounded">{importedFileName}</span>
            </p>
            <button
              onClick={() => { clearImport(); sileo.info({ title: 'Import cleared', description: 'Data cleared. Import a new file to view records.' }); }}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors px-2 py-1 rounded hover:bg-emerald-100"
            >
              <X className="w-3 h-3" /> Clear import
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Total Appropriation', value: formatPeso(totalAppropriation), accent: '#1D4ED8', bar: 'bg-blue-500' },
          { label: 'Total Obligation',    value: formatPeso(totalObligation),    accent: '#7C3AED', bar: 'bg-violet-500' },
          { label: 'Total Balance',       value: formatPeso(totalBalance),       accent: '#16A34A', bar: 'bg-emerald-500' },
          { label: 'Avg Utilization',     value: `${avgUtilization.toFixed(2)}%`, accent: '#D97706', bar: 'bg-amber-500' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100 overflow-hidden">
            <CardContent className="p-4">
              <div className={`w-10 h-1 rounded-full mb-3 ${s.bar}`} />
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-base font-bold font-mono text-slate-900 leading-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data table */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold">
                Budget Records
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {filtered.length} of {activeRecords.length} records
                  {isImported && <span className="ml-1 text-emerald-600 font-medium">· Imported</span>}
                </span>
              </CardTitle>
            </div>
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search office name…"
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
                <Upload className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No data imported yet</p>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Import an Excel file to view budget records. The file should contain columns for Office, Appropriation, Obligation, Balances, and Utilization.
              </p>
              {isAdmin && (
                <Button size="sm" className="gap-2 text-xs h-8 text-white" style={{ background: '#1D4ED8' }} onClick={handleImportClick}>
                  <FileUp className="w-3.5 h-3.5" /> Import Excel
                </Button>
              )}
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 w-8">#</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Office</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Appropriation</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Obligation</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Balance</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filtered.map((row, i) => {
                    const uc = utilizationColor(row.utilization);
                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12, delay: i * 0.02 }}
                        className="hover:bg-blue-50/30 transition-colors cursor-default"
                      >
                        <td className="py-3 px-4 text-xs text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="py-3 px-4">
                          <p className="text-xs font-medium text-slate-800 leading-snug max-w-[420px]">
                            {row.office}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-mono text-slate-700 tabular-nums">
                          {formatPeso(row.appropriation)}
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-mono text-violet-700 tabular-nums">
                          {formatPeso(row.obligation)}
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-mono text-emerald-700 tabular-nums">
                          {formatPeso(row.balance)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${uc.bg} ${uc.text}`}>
                            {row.utilization.toFixed(2)}%
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                      No records found for "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
              {/* Grand Total Footer */}
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="py-3 px-4" />
                    <td className="py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      GRAND TOTAL
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-mono font-bold text-slate-800 tabular-nums">
                      {formatPeso(filtered.reduce((s, r) => s + r.appropriation, 0))}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-mono font-bold text-violet-700 tabular-nums">
                      {formatPeso(filtered.reduce((s, r) => s + r.obligation, 0))}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-mono font-bold text-emerald-700 tabular-nums">
                      {formatPeso(filtered.reduce((s, r) => s + r.balance, 0))}
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-mono font-bold text-slate-700">
                      {filtered.length > 0
                        ? `${((filtered.reduce((s, r) => s + r.obligation, 0) / filtered.reduce((s, r) => s + r.appropriation, 0)) * 100).toFixed(2)}%`
                        : '—'}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          )}

        </CardContent>
      </Card>

      {/* Format hint for admins */}
      {isAdmin && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
          <FileSpreadsheet className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <span className="font-semibold">Excel Format:</span> Your file should have columns:{' '}
            <span className="font-mono bg-blue-100 px-1 rounded">OFFICE</span>{' '}
            <span className="font-mono bg-blue-100 px-1 rounded">APPROPRIATION</span>{' '}
            <span className="font-mono bg-blue-100 px-1 rounded">OBLIGATION</span>{' '}
            <span className="font-mono bg-blue-100 px-1 rounded">BALANCES</span>{' '}
            <span className="font-mono bg-blue-100 px-1 rounded">UTILIZATION</span>.
            Headers can be in any row. Supports .xlsx, .xls, .csv
          </div>
        </div>
      )}
    </div>
  );
}
