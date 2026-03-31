import { useState, useEffect, useMemo } from 'react';
import { LayoutList, Search, Download, ChevronDown, Filter, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { sileo } from 'sileo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { usePPAStore } from '@/stores/ppaStore';
import { db } from '@/backend/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { getPPATotal } from '@/data/ppaMockData';
import { formatPeso } from '@/data/mockData';
import { ppaFundMapping } from '@/data/ppaFundMapping';
import type { PPARecord } from '@/types';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx-js-style';

function utilBadgeClass(rate: number) {
  if (rate === 0)  return 'text-slate-400';
  if (rate >= 75)  return 'text-red-600';
  if (rate >= 50)  return 'text-amber-600';
  return 'text-emerald-600';
}

export default function UserPPAPage() {
  const { user } = useAuthStore();
  const { importedRecords, isImported, setImportedData, clearImport } = usePPAStore();
  const [search, setSearch] = useState('');
  const [selectedFundFilter, setSelectedFundFilter] = useState<string>('All');
  // null = no restriction (show all), [] = no types assigned yet
  const [allowedFundTypes, setAllowedFundTypes] = useState<string[] | null>(null);

  // ── 1. Fetch this user's allowedFundTypes from Firestore (live source of truth) ──
  useEffect(() => {
    if (!user?.id) return;
    getDoc(doc(db, 'users', user.id)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        // null means no restriction; array = specific types
        setAllowedFundTypes(data.allowedFundTypes ?? null);
      }
    });
  }, [user?.id]);

  // ── 2. Live Firestore listener for PPA data ──────────────────────────────────
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
        console.error('Firestore PPA listener error:', error);
        sileo.error({ title: 'Connection Error', description: 'Could not load PPA data.' });
      }
    );
    return () => unsub();
  }, [setImportedData, clearImport]);

  const isAdmin = user?.role === 'admin';
  const hasRestriction = !isAdmin && allowedFundTypes !== null && allowedFundTypes.length > 0;

  // ── 3. Build set of allowed FPP codes from ppaFundMapping for the user's fund types ──
  const allowedFppCodes = useMemo<Set<string>>(() => {
    if (!hasRestriction || !allowedFundTypes) return new Set();
    const codes = new Set<string>();
    for (const ft of allowedFundTypes) {
      // Match against ppaFundMapping keys (case-insensitive)
      for (const [key, ppas] of Object.entries(ppaFundMapping)) {
        if (
          key.toUpperCase().includes(ft.toUpperCase()) ||
          ft.toUpperCase().includes(key.toUpperCase())
        ) {
          ppas.forEach(p => codes.add(p.fppCode));
        }
      }
    }
    return codes;
  }, [hasRestriction, allowedFundTypes]);

  // ── 4. Filter records by allowed FPP codes + keep headers that have visible children ──
  const baseRecords: PPARecord[] = useMemo(() => {
    if (!isImported) return [];
    if (!hasRestriction) return importedRecords;

    const result: PPARecord[] = [];
    let pendingHeader: PPARecord | null = null;
    let pendingHeaderIncluded = false;

    for (const r of importedRecords) {
      if (r.isHeader) {
        pendingHeader = r;
        pendingHeaderIncluded = false;
      } else {
        // Show this row if its fppCode is in the allowed set,
        // OR if no ppaFundMapping entries exist for the chosen fund types (fall back to sourceGroup match)
        const codeAllowed = allowedFppCodes.size > 0
          ? allowedFppCodes.has(r.fppCode)
          : allowedFundTypes!.some(ft =>
              (r.sourceGroup ?? '').toUpperCase().includes(ft.toUpperCase()) ||
              ft.toUpperCase().includes((r.sourceGroup ?? '').toUpperCase())
            );

        if (codeAllowed) {
          if (pendingHeader && !pendingHeaderIncluded) {
            result.push(pendingHeader);
            pendingHeaderIncluded = true;
          }
          result.push(r);
        }
      }
    }
    return result;
  }, [isImported, importedRecords, hasRestriction, allowedFppCodes, allowedFundTypes]);

  // ── 4. Reverse-map fppCode → fund type key using ppaFundMapping ───────────────
  const fppToFundType = useMemo(() => {
    const map = new Map<string, string>();
    for (const [key, ppas] of Object.entries(ppaFundMapping)) {
      for (const p of ppas) map.set(p.fppCode, key);
    }
    return map;
  }, []);

  // ── 5. Derive available fund type options from visible records ───────────────
  const fundTypeOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const r of baseRecords) {
      if (r.isHeader || !r.fppCode) continue;
      const ft = fppToFundType.get(r.fppCode);
      if (ft) seen.add(ft);
      // Fall back to sourceGroup if fppCode not in mapping
      else if (r.sourceGroup) seen.add(r.sourceGroup);
    }
    return Array.from(seen).sort();
  }, [baseRecords, fppToFundType]);

  // ── 6. Filter records by selected fund type ─────────────────────────────
  const fundFiltered = useMemo(() => {
    if (selectedFundFilter === 'All') return baseRecords;
    // Build set of fppCodes for the selected fund type
    const allowedCodes = new Set(
      (ppaFundMapping[selectedFundFilter] ?? []).map(p => p.fppCode)
    );
    const result: typeof baseRecords = [];
    let pendingHeader: typeof baseRecords[0] | null = null;
    let pendingIncluded = false;
    for (const r of baseRecords) {
      if (r.isHeader) {
        pendingHeader = r;
        pendingIncluded = false;
      } else {
        const belongs = allowedCodes.size > 0
          ? allowedCodes.has(r.fppCode)
          : r.sourceGroup === selectedFundFilter;
        if (belongs) {
          if (pendingHeader && !pendingIncluded) {
            result.push(pendingHeader);
            pendingIncluded = true;
          }
          result.push(r);
        }
      }
    }
    return result;
  }, [baseRecords, selectedFundFilter, fppToFundType]);

  const totals = getPPATotal(fundFiltered.filter(r => !r.isHeader));
  const dataCount = fundFiltered.filter(r => !r.isHeader).length;

  const filtered = fundFiltered.filter(r =>
    r.programProjectActivity.toLowerCase().includes(search.toLowerCase()) ||
    r.fppCode.toLowerCase().includes(search.toLowerCase())
  );

  const { paged, page, totalPages, goTo } = usePagination(filtered, 25);

  const handleExport = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['SUMMARY OF PROGRAM / PROJECT / ACTIVITY (PPA)'],
      [`Office: ${user?.office || '—'}  |  Fund Types: ${allowedFundTypes?.join(', ') || 'All'}  |  Generated: ${new Date().toLocaleDateString()}`],
      [],
      ['FPP CODE', 'PROGRAM / PROJECT / ACTIVITY', 'APPROPRIATION', 'ALLOTMENT', 'OBLIGATION', 'BAL. OF APPROP.', 'BAL. OF ALLOTMENT', 'UTIL. RATE (%)'],
      ...baseRecords.filter(r => !r.isHeader).map(r => [
        r.fppCode, r.programProjectActivity,
        r.appropriation, r.allotment, r.obligation,
        r.balanceOfAppropriation, r.balanceOfAllotment,
        r.utilizationRate / 100,
      ]),
    ]);
    ws['!cols'] = [{ wch: 14 }, { wch: 45 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PPA Summary');
    XLSX.writeFile(wb, `PPA_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
    sileo.success({ title: 'Export ready', description: 'PPA Summary downloaded.' });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Summary of Program / Project / Activity (PPA)"
        description={
          hasRestriction
            ? `Showing FPP codes for: ${allowedFundTypes!.join(', ')}`
            : 'FPP-coded budget breakdown per program, project, and activity'
        }
        icon={LayoutList}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
          </div>
        }
      />

      {/* Fund type scope badge */}
      {hasRestriction && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
          <LayoutList className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Your Access Scope:</span>{' '}
            Displaying FPP codes assigned to{' '}
            {allowedFundTypes!.map(ft => (
              <span key={ft} className="font-mono bg-blue-100 px-1.5 py-0.5 rounded mx-0.5 text-blue-800">{ft}</span>
            ))}
          </p>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Appropriation',   value: formatPeso(totals.appropriation),           color: 'text-blue-700',    bar: 'bg-blue-500' },
          { label: 'Total Allotment',        value: formatPeso(totals.allotment),               color: 'text-cyan-700',    bar: 'bg-cyan-500' },
          { label: 'Total Obligation',       value: formatPeso(totals.obligation),              color: 'text-violet-700',  bar: 'bg-violet-500' },
          { label: 'Balance of Approp.',     value: formatPeso(totals.balanceOfAppropriation),  color: 'text-emerald-700', bar: 'bg-emerald-500' },
          { label: 'Utilization Rate',       value: `${totals.utilizationRate.toFixed(2)}%`,   color: 'text-amber-700',   bar: 'bg-amber-400' },
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <CardTitle className="text-base font-semibold flex-1">
              PPA Records
              <span className="ml-2 text-xs font-normal text-slate-400">
                {dataCount} programs/projects
                {selectedFundFilter !== 'All' && (
                  <span className="ml-1 text-blue-600 font-medium">· {selectedFundFilter}</span>
                )}
              </span>
            </CardTitle>

            {/* Fund Type Filter Dropdown */}
            {fundTypeOptions.length > 0 && (
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
                    Filter by Fund Type
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={`text-xs cursor-pointer gap-2 ${
                      selectedFundFilter === 'All' ? 'text-blue-700 font-semibold bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedFundFilter('All')}
                  >
                    {selectedFundFilter === 'All'
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      : <span className="w-3.5" />}
                    <span>Show All</span>
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
            )}

            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search by FPP code or project name…"
                className="pl-9 h-8 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col">
          {!isImported ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <LayoutList className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No PPA data available</p>
              <p className="text-xs text-slate-400 max-w-sm">
                The administrator has not imported any PPA data yet. Check back later.
              </p>
            </div>
          ) : baseRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                <LayoutList className="w-7 h-7 text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No FPP codes for your assigned fund types</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Your account is assigned to:{' '}
                <span className="font-semibold text-blue-600">{allowedFundTypes?.join(', ') || '—'}</span>.
                Contact your administrator if you believe this is incorrect.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs min-w-[960px]">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    {['FPP Code', 'Program / Project / Activity', 'Appropriation', 'Allotment', 'Obligation', 'Bal. of Approp.', 'Bal. of Allotment', 'Util. Rate'].map((h, i) => (
                      <th key={h} className={`py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${i >= 2 ? 'text-right' : 'text-left'} ${i === 1 ? 'min-w-[260px]' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map(row => {
                    if (row.isHeader) {
                      return (
                        <tr key={row.id} className="bg-gradient-to-r from-blue-600/10 to-blue-500/5">
                          <td colSpan={8} className="py-2 px-3 text-[11px] font-bold text-blue-800 uppercase tracking-widest">
                            {row.programProjectActivity}
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
                        <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold whitespace-nowrap">{row.fppCode}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium leading-snug">{row.programProjectActivity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">{formatPeso(row.appropriation)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-cyan-700 tabular-nums whitespace-nowrap">{formatPeso(row.allotment)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-violet-700 tabular-nums whitespace-nowrap">{formatPeso(row.obligation)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums whitespace-nowrap">{formatPeso(row.balanceOfAppropriation)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-teal-700 tabular-nums whitespace-nowrap">{formatPeso(row.balanceOfAllotment)}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                          <span className={`font-bold font-mono ${utilBadgeClass(row.utilizationRate)}`}>
                            {row.utilizationRate.toFixed(2)}%
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
                {/* Grand Total */}
                <tfoot>
                  <tr className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <td className="py-3 px-3 text-[11px] font-extrabold text-white uppercase tracking-wider" colSpan={2}>Grand Total</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.appropriation)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.allotment)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.obligation)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.balanceOfAppropriation)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums whitespace-nowrap">{formatPeso(totals.balanceOfAllotment)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs tabular-nums whitespace-nowrap">{totals.utilizationRate.toFixed(2)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 border-t border-slate-100 px-4 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => goTo(page - 1)} aria-disabled={page === 1} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}>
                    <PaginationLink isActive={p === page} onClick={() => goTo(p)}>{p}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => goTo(page + 1)} aria-disabled={page === totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}
