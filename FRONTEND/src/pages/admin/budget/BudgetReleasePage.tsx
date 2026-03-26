import { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Wallet, CheckCircle2, AlertTriangle,
  Trash2, Search, FileOutput,
} from 'lucide-react';
import { sileo } from 'sileo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { db } from '@/backend/firebase';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, getDoc
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { formatPeso } from '@/data/mockData';
import { ppaFundMapping } from '@/data/ppaFundMapping';
import type { BudgetRelease, StatementRecord, PPARecord } from '@/types';
import { ChevronsUpDown } from 'lucide-react';

// ── Color palette cycling for dynamically-detected fund types ─────────────
const COLOR_PALETTE = [
  { bg: 'bg-blue-50',    text: 'text-blue-700',    badgeBg: 'bg-blue-100',    badgeText: 'text-blue-700',    border: 'border-blue-200' },
  { bg: 'bg-violet-50',  text: 'text-violet-700',  badgeBg: 'bg-violet-100',  badgeText: 'text-violet-700',  border: 'border-violet-200' },
  { bg: 'bg-amber-50',   text: 'text-amber-700',   badgeBg: 'bg-amber-100',   badgeText: 'text-amber-700',   border: 'border-amber-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-rose-50',    text: 'text-rose-700',    badgeBg: 'bg-rose-100',    badgeText: 'text-rose-700',    border: 'border-rose-200' },
];

// ── Fund section derived from Statement Records ─────────────────────────────
interface FundSection {
  key: string;        // full label e.g. "A. Personal Services"
  shortLabel: string; // short label e.g. "Personal Services"
  balance: number;    // total balanceOfAllotment for this section
  colors: typeof COLOR_PALETTE[0];
}

function deriveStatementFunds(records: StatementRecord[]): FundSection[] {
  const sections: FundSection[] = [];
  let currentIdx = -1;

  for (const r of records) {
    if (r.isHeader) {
      const label = (r.expensesClassification ?? '').trim();
      if (!label) continue;
      const parts = label.split('.');
      const shortLabel = parts.length > 1 ? parts.slice(1).join('.').trim() : label;
      sections.push({
        key: label,
        shortLabel,
        balance: 0,
        colors: COLOR_PALETTE[sections.length % COLOR_PALETTE.length],
      });
      currentIdx = sections.length - 1;
    } else if (currentIdx >= 0) {
      sections[currentIdx].balance += r.balanceOfAllotment ?? 0;
    }
  }

  // Fallback: if no isHeader rows found, group by unique expensesClassification
  if (sections.length === 0) {
    const seen = new Map<string, number>();
    for (const r of records) {
      const cls = (r.expensesClassification ?? '').trim();
      if (!cls) continue;
      seen.set(cls, (seen.get(cls) ?? 0) + (r.balanceOfAllotment ?? 0));
    }
    let i = 0;
    for (const [key, balance] of seen.entries()) {
      const parts = key.split('.');
      const shortLabel = parts.length > 1 ? parts.slice(1).join('.').trim() : key;
      sections.push({ key, shortLabel, balance, colors: COLOR_PALETTE[i % COLOR_PALETTE.length] });
      i++;
    }
  }

  return sections;
}

const emptyForm = {
  fundTypeKey: '',
  fppCode: '',
  department: '',
  amount: '',
  accountCode: '',
  payee: '',
  purpose: '',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function BudgetReleasePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [releases, setReleases]                 = useState<BudgetRelease[]>([]);
  const [statementRecords, setStatementRecords] = useState<StatementRecord[]>([]);
  const [ppaRecords, setPpaRecords]             = useState<PPARecord[]>([]);
  const [isLoading, setIsLoading]               = useState(true);
  const [userAllowedFunds, setUserAllowedFunds] = useState<string[] | null>(null); // null = all allowed

  const [showForm, setShowForm]     = useState(false);
  const [fppOpen, setFppOpen]       = useState(false); // for fpp combobox
  const [fppQuery, setFppQuery]     = useState('');    // custom search for fpp combo
  const [fundOpen, setFundOpen]     = useState(false); // for fund combobox
  const [form, setForm]             = useState({ ...emptyForm, department: user?.office ?? '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch]         = useState('');
  const [filterFund, setFilterFund] = useState<string>('All');

  // Live Firestore listeners
  useEffect(() => {
    // Fetch this user's allowedFundTypes from Firestore
    if (user?.id && !isAdmin) {
      getDoc(doc(db, 'users', user.id)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          // null means no restriction; array means specific types allowed
          setUserAllowedFunds(data.allowedFundTypes ?? null);
        }
      });
    }

    const unsubStatement = onSnapshot(doc(db, 'finance', 'statement'), snap => {
      setStatementRecords(snap.exists() && snap.data().records ? snap.data().records as StatementRecord[] : []);
    });

    const unsubPPA = onSnapshot(doc(db, 'finance', 'ppa_summary'), snap => {
      setPpaRecords(snap.exists() && snap.data().records ? snap.data().records as PPARecord[] : []);
    });

    const q = query(collection(db, 'budget_releases'), orderBy('createdAt', 'desc'));
    const unsubReleases = onSnapshot(q, snap => {
      setReleases(snap.docs.map(d => ({ id: d.id, ...d.data() } as BudgetRelease)));
      setIsLoading(false);
    });

    return () => { unsubStatement(); unsubPPA(); unsubReleases(); };
  }, [user?.id, isAdmin]);

  // Dynamically derived fund sections from live Statement data
  // Filtered by user's allowedFundTypes if set (admins see all)
  const allFundSections = useMemo(() => deriveStatementFunds(statementRecords), [statementRecords]);
  const fundSections = useMemo(() => {
    if (isAdmin || !userAllowedFunds || userAllowedFunds.length === 0) return allFundSections;
    // Filter sections whose shortLabel or key matches an allowed fund type key (e.g. 'MOOE')
    return allFundSections.filter(s =>
      userAllowedFunds.some(allowed =>
        s.shortLabel.toUpperCase().includes(allowed.toUpperCase()) ||
        s.key.toUpperCase().includes(allowed.toUpperCase())
      )
    );
  }, [allFundSections, isAdmin, userAllowedFunds]);

  // Set default fund selection when sections load for the first time
  useEffect(() => {
    if (fundSections.length > 0 && !form.fundTypeKey) {
      setForm(p => ({ ...p, fundTypeKey: fundSections[0].key }));
    }
  }, [fundSections, form.fundTypeKey]);

  // Sum of released amounts per fund section key
  const usedByFund = useMemo(() => {
    const result: Record<string, number> = {};
    for (const r of releases) {
      result[r.fundType] = (result[r.fundType] ?? 0) + r.amount;
    }
    return result;
  }, [releases]);

  const getRemainingForSection = (s: FundSection) =>
    s.balance - (usedByFund[s.key] ?? 0);

  const activeSection = fundSections.find(s => s.key === form.fundTypeKey) ?? fundSections[0];

  // Manually and strictly filtered PPA options for combobox bypassing cmdk fuzziness
  const fppOptions = useMemo(() => {
    let validPpas = ppaRecords.filter(p => !p.isHeader && p.fppCode);

    let mappedKey = '';
    if (activeSection) {
       const activeLabelUpper = activeSection.shortLabel.toUpperCase();
       const activeKeyUpper = activeSection.key.toUpperCase();
       
       for (const key of Object.keys(ppaFundMapping)) {
          const uKey = key.toUpperCase();
          if (activeLabelUpper.includes(uKey) || activeKeyUpper.includes(uKey) || uKey.includes(activeLabelUpper)) {
             mappedKey = key;
             break;
          }
       }
       if (!mappedKey) {
          if (activeLabelUpper.includes('20%')) mappedKey = '20%';
          else if (activeLabelUpper.includes('MOOE')) mappedKey = 'MOOE';
          else if (activeLabelUpper.includes('CO')) mappedKey = 'CO';
       }
    }

    if (mappedKey && ppaFundMapping[mappedKey]) {
       validPpas = ppaFundMapping[mappedKey].map(fixed => {
          const liveRecord = ppaRecords.find(p => p.fppCode === fixed.fppCode);
          return {
             id: fixed.fppCode,
             fppCode: fixed.fppCode,
             programProjectActivity: fixed.ppa,
             appropriation: liveRecord?.appropriation || 0,
             allotment: liveRecord?.allotment || 0,
             obligation: liveRecord?.obligation || 0,
             balanceOfAppropriation: liveRecord?.balanceOfAppropriation || 0,
             balanceOfAllotment: liveRecord?.balanceOfAllotment || 0,
             utilizationRate: liveRecord?.utilizationRate || 0,
          } as PPARecord;
       });
    }

    if (!fppQuery) return validPpas;
    const q = fppQuery.toLowerCase();
    return validPpas.filter(p =>
      p.fppCode.toLowerCase().includes(q) ||
      (p.programProjectActivity || '').toLowerCase().includes(q)
    );
  }, [ppaRecords, fppQuery, activeSection]);

  // Specific PPA based on selected FPP Code (looks in options to get merged data)
  const activePPA = useMemo(() => {
    return fppOptions.find(p => p.fppCode === form.fppCode) ?? null;
  }, [form.fppCode, fppOptions]);

  // Filtered entries for the table
  const displayed = useMemo(() => {
    return releases
      .filter(r => isAdmin || r.submittedById === user?.id)
      .filter(r => filterFund === 'All' || r.fundType === filterFund)
      .filter(r =>
        r.fppCode.toLowerCase().includes(search.toLowerCase()) ||
        r.purpose.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase()) ||
        (r.payee ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.accountCode ?? '').toLowerCase().includes(search.toLowerCase())
      );
  }, [releases, filterFund, search]);

  const handleSubmit = async () => {
    if (!form.fppCode.trim())   return sileo.error({ title: 'FPP Code required' });
    if (!form.purpose.trim())   return sileo.error({ title: 'Purpose required' });
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return sileo.error({ title: 'Valid amount required' });

    const section = fundSections.find(s => s.key === form.fundTypeKey);
    if (!section)               return sileo.error({ title: 'Select a fund type' });

    const remainingFund = getRemainingForSection(section);
    if (remainingFund < amount) {
      return sileo.error({
        title: 'Insufficient Fund Balance',
        description: `Only ${formatPeso(remainingFund)} remaining under ${section.shortLabel}.`,
      });
    }

    if (activePPA) {
      // Check PPA balance (balanceOfAllotment) since user explicitly selected an FPP code
      if (activePPA.balanceOfAllotment < amount) {
        return sileo.error({
          title: 'Insufficient PPA Balance',
          description: `Only ${formatPeso(activePPA.balanceOfAllotment)} remaining for FPP Code ${activePPA.fppCode}.`,
        });
      }
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'budget_releases'), {
        fundType:      section.key,
        fundLabel:     section.shortLabel,
        fppCode:       form.fppCode.trim().toUpperCase(),
        department:    form.department.trim(),
        amount,
        accountCode:   form.accountCode.trim(),
        payee:         form.payee.trim(),
        purpose:       form.purpose.trim(),
        submittedBy:   user?.name ?? user?.email ?? 'Unknown',
        submittedById: user?.id ?? '',
        office:        user?.office ?? '',
        createdAt:     new Date().toISOString(),
      });
      sileo.success({ title: 'Budget Entry Recorded', description: `${formatPeso(amount)} logged under ${section.shortLabel}.` });
      setForm(p => ({ ...emptyForm, department: p.department, fundTypeKey: p.fundTypeKey }));
      setShowForm(false);
    } catch (err: any) {
      sileo.error({ title: 'Error', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return sileo.error({ title: 'Access Denied', description: 'Only admins can delete entries.' });
    sileo.promise(deleteDoc(doc(db, 'budget_releases', id)), {
      loading: { title: 'Deleting entry...' },
      success: { title: 'Entry deleted.' },
      error:   { title: 'Delete failed.' },
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      Loading budget tracker...
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Budget Release Tracker"
        description="Log your fund releases and check your remaining available budget before filing a Purchase Request (PR)."
        icon={Wallet}
        actions={
          <Button size="sm" className="gap-2 text-xs h-8 text-white" style={{ background: '#1D4ED8' }} onClick={() => setShowForm(true)}>
            <PlusCircle className="w-3.5 h-3.5" /> New Entry
          </Button>
        }
      />

      {/* No statement warning */}
      {statementRecords.length === 0 && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            No Statement of Appropriations imported yet. Fund sections and balances will appear once an admin imports the Statement Excel file.
          </p>
        </div>
      )}

      {/* Live Balance Cards — dynamically from Statement */}
      {fundSections.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(fundSections.length, 3)} gap-3`}>
          {fundSections.map(section => {
            const c         = section.colors;
            const used      = usedByFund[section.key] ?? 0;
            const remaining = getRemainingForSection(section);
            const pct       = section.balance > 0 ? Math.min((used / section.balance) * 100, 100) : 0;
            const isLow     = remaining < section.balance * 0.1 && section.balance > 0;

            return (
              <Card key={section.key} className={`shadow-sm border ${c.border} ${c.bg}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{section.shortLabel}</span>
                    {isLow && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Low
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mb-1">Available Budget (Balance of Allotment)</p>
                  <p className={`text-xl font-bold font-mono mb-3 ${c.text}`}>{formatPeso(section.balance)}</p>
                  <div className="w-full bg-white/60 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-slate-500">Released: <span className="text-rose-600 font-bold font-mono">{formatPeso(used)}</span></span>
                    <span className="text-slate-500">Can still PR: <span className={`font-bold font-mono ${remaining < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{formatPeso(remaining)}</span></span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Entries Table */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold">
                Budget Entries
                <span className="ml-2 text-xs font-normal text-slate-400">{releases.length} total</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">All logged fund releases and utilizations.</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-slate-100 p-1 rounded-lg gap-0.5">
                <button
                  onClick={() => setFilterFund('All')}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-md transition-all ${filterFund === 'All' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  All
                </button>
                {fundSections.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setFilterFund(s.key)}
                    className={`text-[11px] font-semibold px-3 py-1 rounded-md transition-all ${filterFund === s.key ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    {s.shortLabel}
                  </button>
                ))}
              </div>
              <div className="relative sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input placeholder="Search…" className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileOutput className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-semibold text-slate-600">No entries found</p>
              <p className="text-xs text-slate-400 mt-1">Click "New Entry" to log a budget release.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Fund Type</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">FPP Code</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Payee</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Purpose/Particulars</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Account Code</th>
                    <th className="py-2.5 px-4 text-right font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Logged By</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                    {isAdmin && <th className="py-2.5 px-4" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayed.map(r => {
                    const sec = fundSections.find(s => s.key === r.fundType);
                    const c   = sec?.colors ?? COLOR_PALETTE[0];
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${c.badgeBg} ${c.badgeText}`}>
                            {(r as any).fundLabel ?? r.fundType}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-blue-700 font-semibold whitespace-nowrap">{r.fppCode}</td>
                        <td className="py-2.5 px-4 text-slate-700 font-medium max-w-[140px] truncate">{r.department}</td>
                        <td className="py-2.5 px-4 text-slate-700 font-medium max-w-[140px] truncate" title={r.payee}>{r.payee || '—'}</td>
                        <td className="py-2.5 px-4 text-slate-600 max-w-[200px]">
                          <p className="truncate" title={r.purpose}>{r.purpose}</p>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{r.accountCode || '—'}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700 whitespace-nowrap">{formatPeso(r.amount)}</td>
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{r.submittedBy}</td>
                        <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        {isAdmin && (
                          <td className="py-2.5 px-4 text-right">
                            <button onClick={() => handleDelete(r.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── New Entry Modal ─────────────────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-4xl sm:max-w-4xl w-full gap-0 p-0 overflow-hidden rounded-lg shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-slate-800 font-bold flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" /> New Budget Release Entry
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {/* ── Left Column ── */}
            <div className="p-6 space-y-5">
              {/* FPP Code auto-suggest */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Program/Project (FPP Code) *</Label>
                <Popover open={fppOpen} onOpenChange={v => { setFppOpen(v); if (!v) setFppQuery(''); }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={fppOpen}
                      className="w-full h-10 text-[11px] font-mono bg-white border-slate-200 shadow-none hover:bg-slate-50 text-slate-700 flex items-center px-3"
                    >
                      <div className="flex-1 text-left truncate flex items-center gap-1.5 overflow-hidden">
                        {form.fppCode ? (
                          activePPA ? (
                            <>
                              <span className="font-bold text-blue-700 shrink-0">{activePPA.fppCode}</span>
                              <span className="text-slate-400 shrink-0">—</span>
                              <span className="truncate">{activePPA.programProjectActivity}</span>
                            </>
                          ) : (
                            form.fppCode
                          )
                        ) : (
                          <span className="text-slate-400 font-sans">Search by FPP Code...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[450px] p-0 shadow-xl border-slate-200 z-[9999]" align="start" sideOffset={8}>
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search FPP code or project name..." 
                        className="text-xs h-10" 
                        value={fppQuery}
                        onValueChange={setFppQuery}
                      />
                      <CommandList>
                        <CommandEmpty className="py-4 text-xs text-center text-slate-500">No FPP matches found.</CommandEmpty>
                        <CommandGroup>
                          {fppOptions.map((ppa) => (
                            <CommandItem
                              key={ppa.id}
                              value={`${ppa.fppCode} ${ppa.programProjectActivity}`}
                              onSelect={() => {
                                setForm(p => ({ ...p, fppCode: ppa.fppCode }));
                                setFppOpen(false);
                              }}
                              className="flex flex-col items-start gap-1 py-2 px-3 hover:bg-slate-50 aria-selected:bg-blue-50 cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-mono font-bold text-xs text-blue-700">
                                  {ppa.fppCode}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-600 font-bold">
                                  {formatPeso(ppa.balanceOfAllotment)}
                                </span>
                              </div>
                              <span className="text-xs text-slate-600 line-clamp-1">{ppa.programProjectActivity}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Once selected, show full title and specific balance prominently */}
                {activePPA && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-xs text-slate-700 font-medium leading-relaxed mb-2">
                      {activePPA.programProjectActivity}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PPA Available Balance:</span>
                      <span className="text-sm font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {formatPeso(activePPA.balanceOfAllotment)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Code, Department & Payee */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Code</Label>
                  <Input className="h-10 text-xs font-mono bg-white" placeholder="e.g. 5-02-01-010"
                    value={form.accountCode} onChange={e => setForm(p => ({ ...p, accountCode: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Department / Office *</Label>
                  <Input className="h-10 text-xs bg-white" placeholder="e.g. Office of the Governor"
                    value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payee</Label>
                <Input className="h-10 text-xs bg-white" placeholder="e.g. Juan De La Cruz / ABC Corp"
                  value={form.payee} onChange={e => setForm(p => ({ ...p, payee: e.target.value }))} />
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="p-6 space-y-5 bg-slate-50/50">
              {/* Fund Type — locked nice label */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Authorized Fund Type
                </Label>
                {fundSections.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    No Statement data available. Please import the Statement of Appropriations first.
                  </p>
                ) : fundSections.length === 1 ? (
                  <div className={`px-4 py-3 rounded-xl border flex items-center justify-between ${activeSection.colors.bg} ${activeSection.colors.border}`}>
                    <span className={`text-sm font-bold ${activeSection.colors.text}`}>
                      {activeSection.shortLabel}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block leading-none mb-1">Total Available</span>
                      <span className={`text-sm font-mono font-bold ${activeSection.colors.text} leading-none`}>
                        {formatPeso(getRemainingForSection(activeSection))}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Popover open={fundOpen} onOpenChange={setFundOpen}>
                    <PopoverTrigger asChild>
                      <button className={`w-full h-14 px-4 py-0 flex items-center justify-between rounded-xl border shadow-none ${activeSection.colors.bg} ${activeSection.colors.border} hover:opacity-90 transition-opacity outline-none text-left`}>
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span className={`text-sm font-bold ${activeSection.colors.text}`}>
                            {activeSection.shortLabel}
                          </span>
                          <div className="text-right flex items-center justify-end gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 font-semibold uppercase block leading-none mb-1">Total Available</span>
                              <span className={`text-sm font-mono font-bold ${activeSection.colors.text} leading-none`}>
                                {formatPeso(getRemainingForSection(activeSection))}
                              </span>
                            </div>
                            <ChevronsUpDown className={`w-4 h-4 opacity-50 ${activeSection.colors.text}`} />
                          </div>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[300px] p-0 shadow-xl border-slate-200 z-[9999]" sideOffset={4}>
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {fundSections.map(s => (
                              <CommandItem
                                key={s.key}
                                value={s.key}
                                onSelect={() => {
                                  setForm(p => ({ ...p, fundTypeKey: s.key, amount: '' }));
                                  setFundOpen(false);
                                }}
                                className="flex items-center justify-between py-2.5 px-3 cursor-pointer hover:bg-slate-50 aria-selected:bg-blue-50"
                              >
                                <span className="font-bold text-sm w-full truncate pr-2">{s.shortLabel}</span>
                                <span className="text-xs font-mono text-emerald-600 font-semibold shrink-0">
                                  {formatPeso(getRemainingForSection(s))}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount (₱) *</Label>
                <Input className="h-10 text-base font-mono font-bold bg-white" placeholder="0.00" type="number" min={0}
                  value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                {form.amount && parseFloat(form.amount) > 0 && activePPA && (
                  <p className={`text-[10px] font-medium ${
                    (activePPA.balanceOfAllotment - parseFloat(form.amount)) < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    After this PR: {formatPeso(activePPA.balanceOfAllotment - parseFloat(form.amount))} remaining for this PPA.
                  </p>
                )}
              </div>

              {/* Purpose */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Purpose/Particulars *</Label>
                <textarea
                  className="w-full h-20 text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
                  placeholder="Describe what this budget release is for…"
                  value={form.purpose}
                  onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setShowForm(false)}
              disabled={submitting}
              className="text-xs text-slate-400 hover:text-slate-600 transition font-medium"
            >
              Cancel
            </button>
            <Button size="sm" className="gap-1.5 text-xs font-semibold text-white h-8 px-5 rounded-lg"
              style={{ background: '#1D4ED8' }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Submit Entry</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
