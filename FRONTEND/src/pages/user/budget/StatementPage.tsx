import { useState, useEffect, useMemo } from 'react';
import { FileText, Search, Download, ChevronDown, Filter, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { sileo } from 'sileo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useStatementStore } from '@/stores/statementStore';
import { db } from '@/backend/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { getStatementTotal } from '@/data/statementMockData';
import { formatPeso } from '@/data/mockData';
import type { StatementRecord } from '@/types';
import * as XLSX from 'xlsx-js-style';

function utilColor(rate: number) {
  if (rate === 0) return 'text-slate-400';
  if (rate >= 75)  return 'text-red-600';
  if (rate >= 50)  return 'text-amber-600';
  return 'text-emerald-600';
}

export default function UserStatementPage() {
  const { user } = useAuthStore();
  const { importedRecords, isImported, setImportedData, clearImport } = useStatementStore();
  const [search, setSearch] = useState('');
  const [selectedFundFilter, setSelectedFundFilter] = useState<string>('All');
  // null = no restriction (show all), string[] = specific fund types
  const [allowedFundTypes, setAllowedFundTypes] = useState<string[] | null>(null);

  // ── 1. Fetch this user's allowedFundTypes from Firestore (live source of truth) ──
  useEffect(() => {
    if (!user?.id) return;
    getDoc(doc(db, 'users', user.id)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setAllowedFundTypes(data.allowedFundTypes ?? null);
      }
    });
  }, [user?.id]);

  // ── 2. Live Firestore listener for statement data (read-only) ───────────────
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'finance', 'statement'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setImportedData(data.records || [], data.fileName || 'Cloud DB');
        } else {
          clearImport();
        }
      },
      (err) => {
        console.error('Firestore Statement listener error:', err);
        sileo.error({ title: 'Connection Error', description: 'Could not load statement data.' });
      }
    );
    return () => unsub();
  }, [setImportedData, clearImport]);

  const isAdmin = user?.role === 'admin';
  const hasRestriction = !isAdmin && allowedFundTypes !== null && allowedFundTypes.length > 0;

  // ── 3. Filter statement records directly by expensesClassification ──────────
  // Statement data is FLAT (no isHeader rows) — each row is e.g. "A. PS", "G. 20%", "H. 5%".
  // Match each row against allowedFundTypes bidirectionally (same as BudgetReleasePage).
  const baseRecords: StatementRecord[] = useMemo(() => {
    if (!isImported) return [];
    if (!hasRestriction) return importedRecords;

    return importedRecords.filter(r => {
      const rawLabel = (r.expensesClassification ?? '').trim();
      // Derive shortLabel by stripping leading "X." prefix (e.g. "G. 20%" → "20%")
      const parts = rawLabel.split('.');
      const shortLabel = parts.length > 1 ? parts.slice(1).join('.').trim() : rawLabel;

      return allowedFundTypes!.some(allowed => {
        const a = allowed.toUpperCase();
        const l = rawLabel.toUpperCase();
        const s = shortLabel.toUpperCase();
        // Bidirectional match: row contains allowed key OR allowed key contains row label/shortLabel
        return l.includes(a) || a.includes(l) || s.includes(a) || a.includes(s);
      });
    });
  }, [isImported, importedRecords, hasRestriction, allowedFundTypes]);

  // ── 4. Build dropdown options: strip "X." prefix so "B. MOOE"→"MOOE", "G. 20%"→"20%" ──
  const fundTypeOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const r of baseRecords) {
      if (r.isHeader) continue;
      const raw = (r.expensesClassification ?? '').trim();
      const parts = raw.split('.');
      // Strip "X." prefix if present, keeping "20%" and "5%" correct
      const short = parts.length > 1 ? parts.slice(1).join('.').trim() : raw;
      if (short) seen.add(short);
    }
    return Array.from(seen);
  }, [baseRecords]);

  // ── 5. Filter records by the selected short-label fund type ──────────────────
  const fundFiltered = useMemo(() => {
    if (selectedFundFilter === 'All') return baseRecords;
    return baseRecords.filter(r => {
      if (r.isHeader) return false;
      const raw = (r.expensesClassification ?? '').trim();
      const parts = raw.split('.');
      const short = parts.length > 1 ? parts.slice(1).join('.').trim() : raw;
      return short === selectedFundFilter;
    });
  }, [baseRecords, selectedFundFilter]);

  const totals = getStatementTotal(fundFiltered.filter(r => !r.isHeader));

  const filtered = fundFiltered.filter(r =>
    r.expensesClassification.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['STATEMENT OF APPROPRIATIONS, ALLOTMENTS, OBLIGATIONS & BALANCES'],
      [`Office: ${user?.office || '—'}  |  Fund Types: ${allowedFundTypes?.join(', ') || 'All'}  |  Generated: ${new Date().toLocaleDateString()}`],
      [],
      ['EXPENSES CLASSIFICATION', 'ACCOUNT CODE', 'APPROPRIATION', 'ALLOTMENT', 'OBLIGATION', 'BAL. OF APPROP.', 'BAL. OF ALLOTMENT', 'UTIL. RATE (%)'],
      ...baseRecords.filter(r => !r.isHeader).map(r => [
        r.expensesClassification, r.accountCode,
        r.appropriation, r.allotment, r.obligation,
        r.balanceOfAppropriation, r.balanceOfAllotment,
        r.utilizationRate / 100,
      ]),
    ]);
    ws['!cols'] = [{ wch: 45 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statement');
    XLSX.writeFile(wb, `Statement_${new Date().toISOString().slice(0, 10)}.xlsx`);
    sileo.success({ title: 'Export ready', description: 'Statement downloaded.' });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Statement of Appropriations, Allotments, Obligations & Balances"
        description={
          hasRestriction
            ? `Showing sections for: ${allowedFundTypes!.join(', ')}`
            : 'Per-office breakdown by expense classification'
        }
        icon={FileText}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
          </div>
        }
      />

      {/* Access scope badge */}
      {hasRestriction && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Your Access Scope:</span>{' '}
            Displaying classification sections scoped to{' '}
            {allowedFundTypes!.map(ft => (
              <span key={ft} className="font-mono bg-blue-100 px-1.5 py-0.5 rounded mx-0.5 text-blue-800">{ft}</span>
            ))}
          </p>
        </div>
      )}

      {/* KPI strip */}
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

      {/* Table */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <CardTitle className="text-base font-semibold flex-1">
              Statement Records
              <span className="ml-2 text-xs font-normal text-slate-400">
                {filtered.filter(r => !r.isHeader).length} rows
                {selectedFundFilter !== 'All' && (
                  <span className="ml-1 text-blue-600 font-medium">· {selectedFundFilter}</span>
                )}
              </span>
            </CardTitle>

            {/* Fund Type Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline" size="sm"
                  className={`h-8 text-xs gap-1.5 font-medium transition-all ${
                    selectedFundFilter !== 'All'
                      ? 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100'
                      : 'text-slate-600 hover:text-blue-700 hover:border-blue-300'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {selectedFundFilter === 'All' ? 'All Fund Types' : selectedFundFilter}
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg">
                <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Filter by Classification
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={`text-xs cursor-pointer gap-2 ${
                    selectedFundFilter === 'All' ? 'text-blue-700 font-semibold bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedFundFilter('All')}
                >
                  {selectedFundFilter === 'All' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  <span className={selectedFundFilter === 'All' ? '' : 'ml-5'}>Show All</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {fundTypeOptions.map(ft => (
                  <DropdownMenuItem
                    key={ft}
                    className={`text-xs cursor-pointer gap-2 ${
                      selectedFundFilter === ft ? 'text-blue-700 font-semibold bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedFundFilter(ft)}
                  >
                    {selectedFundFilter === ft
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      : <span className="w-3.5" />}
                    <span className="truncate">{ft}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative sm:w-64">
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
              <p className="text-sm font-semibold text-slate-700 mb-1">No statement data available</p>
              <p className="text-xs text-slate-400 max-w-sm">
                The administrator has not imported any statement data yet.
              </p>
            </div>
          ) : baseRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No records for your assigned fund types</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Your account is assigned to:{' '}
                <span className="font-semibold text-blue-600">{allowedFundTypes?.join(', ') || '—'}</span>.
                Contact your administrator if this is incorrect.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[960px]">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    {['Expenses Classification', 'Appropriation', 'Allotment', 'Obligation', 'Balance of Approp.', 'Balance of Allotment', 'Util. Rate', 'Account Code'].map((h, i) => (
                      <th key={h} className={`py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${i >= 1 && i <= 6 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(row => {
                    if (row.isHeader) {
                      return (
                        <tr key={row.id} className="bg-blue-50/60">
                          <td colSpan={8} className="py-2.5 px-3 text-[11px] font-bold text-blue-800 uppercase tracking-wide">
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
                        className="hover:bg-blue-50/20 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-slate-700 font-medium max-w-[260px] leading-snug">{row.expensesClassification}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">{formatPeso(row.appropriation)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-cyan-700 tabular-nums whitespace-nowrap">{formatPeso(row.allotment)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-violet-700 tabular-nums whitespace-nowrap">{formatPeso(row.obligation)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums whitespace-nowrap">{formatPeso(row.balanceOfAppropriation)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-teal-700 tabular-nums whitespace-nowrap">{formatPeso(row.balanceOfAllotment)}</td>
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
                {/* Grand Total */}
                <tfoot>
                  <tr className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <td className="py-3 px-3 text-[11px] font-extrabold text-white uppercase tracking-wider">Grand Total</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.appropriation)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.allotment)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.obligation)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.balanceOfAppropriation)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.balanceOfAllotment)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs tabular-nums whitespace-nowrap">{totals.utilizationRate.toFixed(2)}%</td>
                    <td className="py-3 px-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
