import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus, Trash2, Search, Download, FileText,
  CalendarIcon, FileDigit, BookOpen, Receipt,
  Landmark, PiggyBank, StickyNote, DollarSign, Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { sileo } from 'sileo';
import * as XLSX from 'xlsx';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { usePOPSStore, POPS_OFFICES, type POPSRecord } from '@/stores/popsStore';
import { cn } from '@/lib/utils';

// ── Peso formatter ────────────────────────────────────────────────────────────
const peso = (n: number) =>
  '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Empty form ────────────────────────────────────────────────────────────────
const emptyForm = () => ({
  date: new Date(),
  prNumber: '',
  obrNumber: '',
  particulars: '',
  prAmount: '',
  pdAmount: '',
  dvAmount: '',
  balanceSavings: '',
  remarks: '',
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function POPSOfficeTrackerPage() {
  const { officeKey } = useParams<{ officeKey: string }>();
  const office = POPS_OFFICES.find(o => o.key === officeKey) || POPS_OFFICES[0];
  const { records, addRecord, deleteRecord } = usePOPSStore();
  const officeRecords: POPSRecord[] = records[office.key] || [];

  const [search, setSearch]               = useState('');
  const [addOpen, setAddOpen]             = useState(false);
  const [calendarOpen, setCalendarOpen]   = useState(false);
  const [viewRecord, setViewRecord]       = useState<POPSRecord | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<POPSRecord | null>(null);
  const [form, setForm]                   = useState(emptyForm());

  // ── Filter / totals ──────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    officeRecords.filter(r =>
      r.particulars.toLowerCase().includes(search.toLowerCase()) ||
      r.prNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.obrNumber.toLowerCase().includes(search.toLowerCase())
    ), [officeRecords, search]);

  const totals = useMemo(() => ({
    prAmount:       filtered.reduce((s, r) => s + r.prAmount, 0),
    pdAmount:       filtered.reduce((s, r) => s + r.pdAmount, 0),
    dvAmount:       filtered.reduce((s, r) => s + r.dvAmount, 0),
    balanceSavings: filtered.reduce((s, r) => s + r.balanceSavings, 0),
  }), [filtered]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const num = (v: string) => parseFloat(v.replace(/,/g, '')) || 0;
  const setField = (field: keyof ReturnType<typeof emptyForm>, value: string | Date) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.particulars.trim()) {
      sileo.error({ title: 'Required field', description: 'Please fill in the Particulars field.' });
      return;
    }
    const record: POPSRecord = {
      id: `pops_${Date.now()}`,
      date: format(form.date, 'yyyy-MM-dd'),
      prNumber: form.prNumber.trim(),
      obrNumber: form.obrNumber.trim(),
      particulars: form.particulars.trim(),
      prAmount: num(form.prAmount),
      pdAmount: num(form.pdAmount),
      dvAmount: num(form.dvAmount),
      balanceSavings: num(form.balanceSavings),
      remarks: form.remarks.trim(),
    };
    addRecord(office.key, record);
    sileo.success({ title: 'Entry saved!', description: `"${record.particulars}" added.` });
    setAddOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRecord(office.key, deleteTarget.id);
    sileo.info({ title: 'Deleted', description: 'Entry removed successfully.' });
    setDeleteTarget(null);
  };

  const handleExport = () => {
    const rows = officeRecords.map(r => ({
      'DATE': r.date, 'PR#': r.prNumber, 'OBR#': r.obrNumber,
      'PARTICULARS': r.particulars, 'PR AMOUNT': r.prAmount,
      'P.D AMOUNT': r.pdAmount, 'D.V AMOUNT': r.dvAmount,
      'BALANCES/SAVINGS': r.balanceSavings, 'REMARKS': r.remarks,
    }));
    rows.push({
      'DATE': '', 'PR#': '', 'OBR#': '', 'PARTICULARS': 'TOTAL',
      'PR AMOUNT': totals.prAmount, 'P.D AMOUNT': totals.pdAmount,
      'D.V AMOUNT': totals.dvAmount, 'BALANCES/SAVINGS': totals.balanceSavings, 'REMARKS': '',
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, office.label);
    XLSX.writeFile(wb, `${office.label}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    sileo.success({ title: 'Exported', description: `${office.label} records downloaded.` });
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <PageHeader
        title={office.label}
        description={office.fullName}
        icon={FileText}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2 text-xs h-9" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export Excel
            </Button>
            <Button
              size="sm"
              className="gap-2 text-sm h-9 text-white font-semibold px-5"
              style={{ background: '#1D4ED8' }}
              onClick={() => { setForm(emptyForm()); setAddOpen(true); }}
            >
              <Plus className="w-4 h-4" /> Add Entry
            </Button>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total PR Amount',  value: peso(totals.prAmount),       bar: 'bg-blue-500',    color: 'text-blue-700' },
          { label: 'Total P.D Amount', value: peso(totals.pdAmount),       bar: 'bg-violet-500',  color: 'text-violet-700' },
          { label: 'Total D.V Amount', value: peso(totals.dvAmount),       bar: 'bg-cyan-500',    color: 'text-cyan-700' },
          { label: 'Balances/Savings', value: peso(totals.balanceSavings), bar: 'bg-emerald-500', color: 'text-emerald-700' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100 overflow-hidden">
            <CardContent className="p-4">
              <div className={`w-8 h-1 rounded-full mb-2 ${s.bar}`} />
              <p className="text-[11px] text-slate-400 leading-tight mb-1">{s.label}</p>
              <p className={`text-sm font-bold font-mono leading-tight ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold flex-1">
              {office.label} Records
              <span className="ml-2 text-xs font-normal text-slate-400">{officeRecords.length} entries</span>
            </CardTitle>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search PR#, OBR#, or particulars…"
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {officeRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-base font-semibold text-slate-700 mb-1">No records yet</p>
              <p className="text-sm text-slate-400 max-w-xs mb-5">
                Click <strong>"Add Entry"</strong> above to start recording {office.fullName} transactions.
              </p>
              <Button size="default" className="gap-2 text-sm px-6 text-white" style={{ background: '#1D4ED8' }}
                onClick={() => { setForm(emptyForm()); setAddOpen(true); }}>
                <Plus className="w-4 h-4" /> Add First Entry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    {['Date','PR#','OBR#','Particulars','PR Amount','P.D Amount','D.V Amount','Bal./Savings','Remarks','Actions'].map((h, i) => (
                      <th key={i} className={cn(
                        'py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                        i >= 4 && i <= 7 ? 'text-right' : 'text-left',
                        i === 3 ? 'min-w-[200px]' : '',
                        i === 9 ? 'text-center w-[100px]' : '',
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(row => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap text-xs">{row.date}</td>
                      <td className="py-3 px-3 font-mono text-blue-700 font-semibold whitespace-nowrap text-xs">{row.prNumber || '—'}</td>
                      <td className="py-3 px-3 font-mono text-blue-700 font-semibold whitespace-nowrap text-xs">{row.obrNumber || '—'}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium max-w-[220px] truncate" title={row.particulars}>{row.particulars}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap text-xs">{peso(row.prAmount)}</td>
                      <td className="py-3 px-3 text-right font-mono text-violet-700 tabular-nums whitespace-nowrap text-xs">{peso(row.pdAmount)}</td>
                      <td className="py-3 px-3 text-right font-mono text-cyan-700 tabular-nums whitespace-nowrap text-xs">{peso(row.dvAmount)}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 tabular-nums whitespace-nowrap text-xs">{peso(row.balanceSavings)}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs max-w-[130px] truncate">{row.remarks || '—'}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => setViewRecord(row)}
                            className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(row)}
                            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                {/* TOTAL row */}
                <tfoot>
                  <tr className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <td colSpan={4} className="py-3 px-3 text-[11px] font-extrabold text-white uppercase tracking-wider">Grand Total</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs tabular-nums">{peso(totals.prAmount)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums">{peso(totals.pdAmount)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums">{peso(totals.dvAmount)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-100 text-xs tabular-nums">{peso(totals.balanceSavings)}</td>
                    <td className="py-3 px-3" /><td className="py-3 px-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ADD ENTRY MODAL ─────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New Entry — {office.label}
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-0.5">{office.fullName}</p>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* Row 1: Date · PR# · OBR# */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-500" /> Date <span className="text-red-500">*</span>
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal h-11 text-sm border-slate-300">
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {format(form.date, 'MMMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar mode="single" selected={form.date}
                      onSelect={(d) => { if (d) { setField('date', d); setCalendarOpen(false); } }}
                      initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileDigit className="w-4 h-4 text-blue-500" /> PR #
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono select-none">PR-</span>
                  <Input className="h-11 text-sm font-mono pl-9" placeholder="001"
                    value={form.prNumber} onChange={e => setField('prNumber', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-500" /> OBR #
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono select-none">OBR-</span>
                  <Input className="h-11 text-sm font-mono pl-11" placeholder="001"
                    value={form.obrNumber} onChange={e => setField('obrNumber', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Row 2: Particulars */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-500" />
                Particulars <span className="text-red-500">*</span>
                <span className="ml-1 text-xs font-normal text-slate-400">Brief description of the expense</span>
              </Label>
              <Textarea className="text-sm resize-none" rows={2}
                placeholder="e.g. Purchase of office supplies..."
                value={form.particulars} onChange={e => setField('particulars', e.target.value)} />
            </div>

            {/* Row 3: Amounts */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Financial Amounts (₱)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'PR Amount',    icon: DollarSign, field: 'prAmount'       as const, border: 'border-blue-200' },
                  { label: 'P.D Amount',   icon: Landmark,   field: 'pdAmount'       as const, border: 'border-violet-200' },
                  { label: 'D.V Amount',   icon: FileText,   field: 'dvAmount'       as const, border: 'border-cyan-200' },
                  { label: 'Bal./Savings', icon: PiggyBank,  field: 'balanceSavings' as const, border: 'border-emerald-200' },
                ].map(({ label, icon: Icon, field, border }) => (
                  <div key={field} className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" /> {label}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">₱</span>
                      <Input className={`h-11 text-sm font-mono pl-7 border ${border}`}
                        placeholder="0.00" value={form[field]}
                        onChange={e => setField(field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 4: Remarks */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-slate-400" />
                Remarks <span className="ml-1 text-xs font-normal text-slate-400">Optional</span>
              </Label>
              <Input className="h-11 text-sm" placeholder="Optional additional notes..."
                value={form.remarks} onChange={e => setField('remarks', e.target.value)} />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 gap-2 flex-row justify-end">
            <Button variant="outline" size="default" className="h-10 px-6 text-sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button size="default" className="h-10 px-8 text-sm font-semibold text-white gap-2"
              style={{ background: '#1D4ED8' }} onClick={handleSave}>
              <Plus className="w-4 h-4" /> Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── VIEW RECORD MODAL ──────────────────────────────────────────────── */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-lg w-full p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-slate-800 to-slate-700">
            <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
              <Eye className="w-4 h-4" /> Record Details — {office.label}
            </DialogTitle>
            <p className="text-slate-300 text-xs mt-0.5">
              {viewRecord?.date} · {viewRecord?.prNumber || 'No PR#'}
            </p>
          </DialogHeader>

          {viewRecord && (
            <div className="px-6 py-5 space-y-4">
              {/* Key info */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Date',  value: viewRecord.date },
                  { label: 'PR #',  value: viewRecord.prNumber  || '—' },
                  { label: 'OBR #', value: viewRecord.obrNumber || '—' },
                ].map(f => (
                  <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{f.label}</p>
                    <p className="text-sm font-semibold font-mono text-slate-700">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Particulars */}
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Particulars</p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">{viewRecord.particulars}</p>
              </div>

              <Separator />

              {/* Amounts */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">Financial Amounts</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'PR Amount',     value: viewRecord.prAmount,       color: 'text-blue-700',    bg: 'bg-blue-50' },
                    { label: 'P.D Amount',    value: viewRecord.pdAmount,       color: 'text-violet-700',  bg: 'bg-violet-50' },
                    { label: 'D.V Amount',    value: viewRecord.dvAmount,       color: 'text-cyan-700',    bg: 'bg-cyan-50' },
                    { label: 'Bal./Savings',  value: viewRecord.balanceSavings, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                  ].map(f => (
                    <div key={f.label} className={`${f.bg} rounded-xl p-3`}>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{f.label}</p>
                      <p className={`text-base font-bold font-mono ${f.color}`}>{peso(f.value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              {viewRecord.remarks && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-[10px] text-amber-500 uppercase tracking-wider mb-1">Remarks</p>
                  <p className="text-sm text-slate-600">{viewRecord.remarks}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t bg-slate-50">
            <Button variant="outline" size="default" className="h-10 px-6 text-sm" onClick={() => setViewRecord(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRMATION ────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-sm w-full p-0 overflow-hidden gap-0">
          {/* Red top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-red-400" />

          <div className="p-6 text-center">
            <AlertDialogHeader className="!place-items-center !text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <AlertDialogTitle className="text-base font-bold text-slate-800">
                Delete Entry?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed">
                You are about to permanently delete:
                <span className="block mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 text-sm text-center">
                  {deleteTarget?.particulars}
                </span>
                <span className="block mt-2 text-xs text-red-500">⚠ This cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="!flex-row gap-2 mt-4 justify-center">
              <AlertDialogCancel className="flex-1 h-10 text-sm">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="flex-1 h-10 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white gap-2"
                onClick={confirmDelete}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
