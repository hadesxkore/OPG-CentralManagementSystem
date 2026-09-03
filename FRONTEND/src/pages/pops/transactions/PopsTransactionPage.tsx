import { useState, useEffect, useRef } from 'react';
import { sileo } from 'sileo';
import * as XLSX from 'xlsx';

import {
  FileSpreadsheet, Plus, Search, Download, Trash2, Edit3, Eye,
  CheckCircle2, CreditCard, Wallet, ChevronLeft, ChevronRight, AlertCircle,
  Upload, FileUp, X, AlertTriangle, ShieldCheck
} from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { usePopsTransactionStore } from '@/stores/popsTransactionStore';
import type { PopsTransactionRecord, DvEntry } from '@/types';

const formatPeso = (v?: number) => {
  if (v === undefined || v === null || isNaN(v)) return '₱0.00';
  return `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function PopsTransactionPage() {
  const { user } = useAuthStore();
  const { records, subscribeTransactions, addTransaction, bulkAddTransactions, updateTransaction, deleteTransaction, clearAllTransactions } = usePopsTransactionStore();

  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<PopsTransactionRecord>>({
    no: '',
    dateTime: '',
    prNo: '',
    obrNo: '',
    particulars: '',
    prAmount: undefined,
    dvEntries: [{ id: `dv-${Date.now()}`, dvNo: '', dvAmount: undefined, payee: '' }],
    status: '',
    dateReleased: '',
    remarks: '',
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'no-asc' | 'newest' | 'oldest' | 'amount-high' | 'amount-low'>('no-asc');

  // Pagination states (20 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  // View / Edit / Delete states
  const [viewRecord, setViewRecord] = useState<PopsTransactionRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<PopsTransactionRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Excel Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<Partial<PopsTransactionRecord>[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeTransactions(user.id);
    return () => unsub();
  }, [subscribeTransactions, user?.id]);

  const handleInputChange = (field: keyof PopsTransactionRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // DV Entry handlers
  const handleDvChange = (index: number, field: keyof DvEntry, value: any) => {
    setFormData(prev => {
      const currentDvs = [...(prev.dvEntries || [])];
      if (!currentDvs[index]) return prev;
      currentDvs[index] = { ...currentDvs[index], [field]: value };
      return { ...prev, dvEntries: currentDvs };
    });
  };

  const addDvEntryRow = () => {
    setFormData(prev => ({
      ...prev,
      dvEntries: [
        ...(prev.dvEntries || []),
        { id: `dv-${Date.now()}-${Math.random()}`, dvNo: '', dvAmount: undefined, payee: '' }
      ]
    }));
  };

  const removeDvEntryRow = (index: number) => {
    setFormData(prev => {
      const currentDvs = [...(prev.dvEntries || [])];
      if (currentDvs.length <= 1) return prev;
      currentDvs.splice(index, 1);
      return { ...prev, dvEntries: currentDvs };
    });
  };

  // Auto-increment NO helper
  const getNextRecordNo = () => {
    if (!records || records.length === 0) return '1';
    const nums = records
      .map((r) => parseInt(String(r.no || '').replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    if (nums.length === 0) return String(records.length + 1);
    const maxNum = Math.max(...nums);
    return String(maxNum + 1);
  };

  const openNewModal = () => {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
    
    setFormData({
      no: getNextRecordNo(),
      dateTime: formattedDate,
      prNo: 'PR: 2026-01-',
      obrNo: 'OBR: 100-26-01-',
      particulars: '',
      prAmount: undefined,
      dvEntries: [{ id: `dv-${Date.now()}`, dvNo: '', dvAmount: undefined, payee: '' }],
      status: 'For cheque released',
      dateReleased: '',
      remarks: 'PNP',
    });
    setShowNewModal(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanDvs = (formData.dvEntries || []).filter(d => (d.dvAmount !== undefined && d.dvAmount !== null) || (d.payee && d.payee.trim() !== '') || (d.dvNo && d.dvNo.trim() !== ''));

      if (editingRecord) {
        await updateTransaction({
          ...editingRecord,
          ...formData,
          dvEntries: cleanDvs.length > 0 ? cleanDvs : [{ id: `dv-1`, dvAmount: undefined, payee: '' }],
          encodedBy: user?.name || editingRecord.encodedBy || 'POPS Staff',
          encodedById: user?.id || editingRecord.encodedById || 'usr-pops',
          office: user?.office || editingRecord.office || 'POPS Division',
        });
        setSuccessMsg(`Record #${formData.no || editingRecord.no} updated successfully!`);
        sileo.success({ title: 'Record Updated! ✨', description: `POPS Transaction #${formData.no || editingRecord.no} updated.` });
        setEditingRecord(null);
      } else {
        await addTransaction({
          ...formData,
          no: formData.no || getNextRecordNo(),
          dvEntries: cleanDvs.length > 0 ? cleanDvs : [{ id: `dv-1`, dvAmount: undefined, payee: '' }],
          encodedBy: user?.name || 'POPS Staff',
          encodedById: user?.id || 'usr-pops',
          office: user?.office || 'POPS Division',
        });
        setSuccessMsg(`POPS Record #${formData.no || getNextRecordNo()} added successfully!`);
        sileo.success({ title: 'Record Encoded! 🚀', description: `POPS Record #${formData.no || getNextRecordNo()} added to database.` });
        setShowNewModal(false);
      }

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to save POPS transaction:', err);
      sileo.error({ title: 'Encoding Error', description: 'Could not save record to database.' });
    }
  };

  const openEditModal = (rec: PopsTransactionRecord) => {
    setEditingRecord(rec);
    setFormData({
      ...rec,
      dvEntries: rec.dvEntries && rec.dvEntries.length > 0
        ? rec.dvEntries
        : [{ id: `dv-${Date.now()}`, dvNo: '', dvAmount: undefined, payee: '' }]
    });
  };

  const handleDeleteRecord = async () => {
    if (!deletingId) return;
    try {
      await deleteTransaction(deletingId);
      sileo.success({ title: 'Record Deleted 🗑️', description: 'Transaction removed from database.' });
    } catch (err) {
      console.error('Failed to delete POPS transaction:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Excel Parser for POPS format
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];

        const raw = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });

        if (!raw || raw.length === 0) {
          setImportError('The selected Excel file is empty.');
          return;
        }

        // Find header row (looks for NO, PR, DV, PAYEE)
        let headerRowIdx = -1;
        for (let r = 0; r < Math.min(raw.length, 10); r++) {
          const rowStr = (raw[r] || []).map((c) => String(c).toUpperCase()).join(' ');
          if (rowStr.includes('PR') || rowStr.includes('PAYEE') || rowStr.includes('DV')) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx === -1) headerRowIdx = 0;

        // Parse POPS rows
        const parsedRows: Partial<PopsTransactionRecord>[] = [];
        let rIdx = headerRowIdx + 1;

        while (rIdx < raw.length) {
          const rowA = raw[rIdx];
          if (!rowA || !Array.isArray(rowA)) {
            rIdx++;
            continue;
          }

          const noVal = String(rowA[0] || '').trim();
          const dateVal = String(rowA[1] || '').trim();
          const prVal = String(rowA[2] || '').trim();
          const partVal = String(rowA[3] || '').trim();
          const prAmtVal = parseFloat(String(rowA[4] || '').replace(/[^0-9.-]+/g, ''));
          const dv1Val = parseFloat(String(rowA[5] || '').replace(/[^0-9.-]+/g, ''));
          const payee1Val = String(rowA[6] || '').trim();
          const statusVal = String(rowA[7] || '').trim();
          const dateRelVal = String(rowA[8] || '').trim();
          const remarksVal = String(rowA[9] || '').trim();

          const hasData = noVal || prVal || partVal || !isNaN(prAmtVal) || payee1Val;
          if (!hasData) {
            rIdx++;
            continue;
          }

          // Check if there is a Row B (bottom sub-row for second DV / Payee)
          const rowB = rIdx + 1 < raw.length ? raw[rIdx + 1] : null;
          const dvEntries: DvEntry[] = [];

          if (!isNaN(dv1Val) || payee1Val) {
            dvEntries.push({
              id: `dv-${Date.now()}-1`,
              dvAmount: !isNaN(dv1Val) ? dv1Val : undefined,
              payee: payee1Val,
            });
          }

          let isRowBSub = false;
          if (rowB && Array.isArray(rowB)) {
            const noB = String(rowB[0] || '').trim();
            const prB = String(rowB[2] || '').trim();
            const dv2Val = parseFloat(String(rowB[5] || '').replace(/[^0-9.-]+/g, ''));
            const payee2Val = String(rowB[6] || '').trim();

            if (!noB && !prB && (!isNaN(dv2Val) || payee2Val)) {
              isRowBSub = true;
              dvEntries.push({
                id: `dv-${Date.now()}-2`,
                dvAmount: !isNaN(dv2Val) ? dv2Val : undefined,
                payee: payee2Val,
              });
            }
          }

          parsedRows.push({
            no: noVal || String(parsedRows.length + 1),
            dateTime: dateVal,
            prNo: prVal.includes('PR:') ? prVal : `PR: ${prVal}`,
            particulars: partVal,
            prAmount: !isNaN(prAmtVal) ? prAmtVal : undefined,
            dvEntries: dvEntries.length > 0 ? dvEntries : [{ id: `dv-1`, payee: payee1Val }],
            status: statusVal,
            dateReleased: dateRelVal,
            remarks: remarksVal,
          });

          rIdx += isRowBSub ? 2 : 1;
        }

        if (parsedRows.length === 0) {
          setImportError('No valid data rows found in this file.');
          return;
        }

        setImportRows(parsedRows);
      } catch (err) {
        console.error('POPS Excel Parsing Error:', err);
        setImportError('Failed to read Excel file. Please ensure it is a valid .xlsx or .xls file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportConfirm = async () => {
    if (importRows.length === 0) return;
    setImporting(true);
    try {
      const recordsToInsert = importRows.map(row => ({
        ...row,
        encodedBy: user?.name || 'POPS Staff',
        encodedById: user?.id || 'usr-pops',
        office: user?.office || 'POPS Division',
      }));

      await bulkAddTransactions(recordsToInsert);

      setShowImportModal(false);
      setImportRows([]);
      setImportFileName('');
      sileo.success({ title: 'Import Successful! 📊', description: `${importRows.length} POPS records imported.` });
    } finally {
      setImporting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['No', 'Date & Time', 'PR No.', 'OBR No.', 'Particulars', 'PR Amount', 'DV Amount', 'Payee', 'Status', 'Date Released', 'Remarks', 'Encoded By'];

    const rows: string[][] = [];
    filteredRecords.forEach(r => {
      const dvs = r.dvEntries || [];
      if (dvs.length === 0) {
        rows.push([
          `"${r.no || ''}"`,
          `"${r.dateTime || ''}"`,
          `"${r.prNo || ''}"`,
          `"${r.obrNo || ''}"`,
          `"${(r.particulars || '').replace(/"/g, '""')}"`,
          r.prAmount !== undefined ? String(r.prAmount) : '',
          '',
          '',
          `"${r.status || ''}"`,
          `"${r.dateReleased || ''}"`,
          `"${(r.remarks || '').replace(/"/g, '""')}"`,
          `"${r.encodedBy || ''}"`,
        ]);
      } else {
        dvs.forEach((dv, idx) => {
          rows.push([
            idx === 0 ? `"${r.no || ''}"` : '',
            idx === 0 ? `"${r.dateTime || ''}"` : '',
            idx === 0 ? `"${r.prNo || ''}"` : '',
            idx === 0 ? `"${r.obrNo || ''}"` : '',
            idx === 0 ? `"${(r.particulars || '').replace(/"/g, '""')}"` : '',
            idx === 0 ? (r.prAmount !== undefined ? String(r.prAmount) : '') : '',
            dv.dvAmount !== undefined ? String(dv.dvAmount) : '',
            `"${(dv.payee || '').replace(/"/g, '""')}"`,
            idx === 0 ? `"${r.status || ''}"` : '',
            idx === 0 ? `"${r.dateReleased || ''}"` : '',
            idx === 0 ? `"${(r.remarks || '').replace(/"/g, '""')}"` : '',
            idx === 0 ? `"${r.encodedBy || ''}"` : '',
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `POPS_PR_DV_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (r.no && r.no.toLowerCase().includes(query)) ||
      (r.prNo && r.prNo.toLowerCase().includes(query)) ||
      (r.obrNo && r.obrNo.toLowerCase().includes(query)) ||
      (r.particulars && r.particulars.toLowerCase().includes(query)) ||
      (r.status && r.status.toLowerCase().includes(query)) ||
      (r.remarks && r.remarks.toLowerCase().includes(query)) ||
      (r.dvEntries && r.dvEntries.some(d => d.payee && d.payee.toLowerCase().includes(query)));

    const matchesStatus = statusFilter === 'All' || (r.status && r.status.toLowerCase().includes(statusFilter.toLowerCase()));
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'no-asc') {
      const nA = parseInt(String(a.no ?? '').replace(/\D/g, ''), 10) || 0;
      const nB = parseInt(String(b.no ?? '').replace(/\D/g, ''), 10) || 0;
      return nA - nB;
    }
    if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    if (sortBy === 'amount-high') return (b.prAmount || 0) - (a.prAmount || 0);
    if (sortBy === 'amount-low') return (a.prAmount || 0) - (b.prAmount || 0);
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // KPIs
  const totalPrAmount = records.reduce((acc, r) => acc + (r.prAmount || 0), 0);
  const totalDvAmount = records.reduce((acc, r) => {
    const dvs = r.dvEntries || [];
    return acc + dvs.reduce((dAcc, d) => dAcc + (d.dvAmount || 0), 0);
  }, 0);
  const activeCount = records.filter(r => !r.status || !r.status.toLowerCase().includes('cancelled')).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="POPS PR / DV Transaction Tracker"
        description="Monitor Purchase Requests (PR), Obligation Requests (OBR), and Disbursement Vouchers (DV) with multi-row payee tracking."
        icon={ShieldCheck}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportModal(true)}
              className="border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 font-medium text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Import Excel</span>
            </Button>
            <Button
              size="sm"
              onClick={openNewModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New POPS Record</span>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total PR Encoded"
          value={String(records.length)}
          subtitle="Total POPS transactions logged"
          icon={FileSpreadsheet}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Total PR Amount"
          value={formatPeso(totalPrAmount)}
          subtitle="Sum of encoded PR amounts"
          icon={CreditCard}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="Total DV Amount Released"
          value={formatPeso(totalDvAmount)}
          subtitle="Sum of processed DV vouchers"
          icon={Wallet}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <KpiCard
          title="Active PR Status"
          value={String(activeCount)}
          subtitle={`${records.length - activeCount} cancelled or pending`}
          icon={CheckCircle2}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* Main Table Card */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>POPS Transaction Logs</span>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 font-mono font-semibold">
                  {filteredRecords.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Showing POPS PR, OBR, DV amounts and multi-payee records.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search PR, OBR, Particulars, Payee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs bg-slate-50 border-slate-200 h-9"
                />
              </div>

              {/* Status Filter */}
              <div className="min-w-[130px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="released">Cheque Released</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="min-w-[130px]">
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-asc">By No. (Ascending)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="amount-high">Highest PR Amount</SelectItem>
                    <SelectItem value="amount-low">Lowest PR Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {records.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearAllDialog(true)}
                  className="h-9 text-xs text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-100 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center px-4">
              <ShieldCheck className="w-12 h-12 mb-3 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">No POPS transactions found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery ? 'Try adjusting your search query or filters.' : 'Click "New POPS Record" above to start encoding.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[1400px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-12 text-center">NO.</th>
                    <th className="py-3 px-3 min-w-[120px]">Date & Time</th>
                    <th className="py-3 px-3 min-w-[150px]">PR / OBR No.</th>
                    <th className="py-3 px-3 min-w-[240px]">Particulars</th>
                    <th className="py-3 px-3 min-w-[110px]">PR Amount</th>
                    <th className="py-3 px-3 min-w-[110px] bg-slate-100/70 border-x border-slate-200">DV Amount</th>
                    <th className="py-3 px-3 min-w-[200px] bg-slate-100/70">Payee Name</th>
                    <th className="py-3 px-3 min-w-[150px]">Status</th>
                    <th className="py-3 px-3 min-w-[110px]">Date Released</th>
                    <th className="py-3 px-3 min-w-[100px]">Remarks</th>
                    <th className="py-3 px-3 text-right sticky right-0 bg-slate-50 shadow-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedRecords.map((r) => {
                    const dvs = r.dvEntries && r.dvEntries.length > 0
                      ? r.dvEntries
                      : [{ id: 'dv-0', dvAmount: undefined, payee: '' }];
                    const rowSpan = dvs.length;
                    const isCancelled = r.status && r.status.toLowerCase().includes('cancelled');

                    return dvs.map((dv, idx) => (
                      <tr
                        key={`${r.id}-dv-${idx}`}
                        className={`hover:bg-slate-50/80 transition-colors ${idx > 0 ? 'border-t border-slate-100 bg-slate-50/30' : ''}`}
                      >
                        {/* Columns rendered ONLY on 1st DV sub-row with RowSpan */}
                        {idx === 0 && (
                          <>
                            {/* NO */}
                            <td rowSpan={rowSpan} className="py-3 px-3 font-mono font-bold text-slate-800 text-center align-top border-r border-slate-100 bg-white">
                              {r.no || '—'}
                            </td>

                            {/* Date & Time */}
                            <td rowSpan={rowSpan} className="py-3 px-3 text-slate-700 align-top border-r border-slate-100 bg-white whitespace-nowrap">
                              {r.dateTime || '—'}
                            </td>

                            {/* PR & OBR */}
                            <td rowSpan={rowSpan} className="py-3 px-3 align-top border-r border-slate-100 bg-white">
                              <div className="space-y-1 font-mono text-[11px]">
                                {r.prNo && (
                                  <div className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block">
                                    {r.prNo}
                                  </div>
                                )}
                                {r.obrNo && (
                                  <div className="font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 inline-block">
                                    {r.obrNo}
                                  </div>
                                )}
                                {!r.prNo && !r.obrNo && '—'}
                              </div>
                            </td>

                            {/* Particulars */}
                            <td rowSpan={rowSpan} className={`py-3 px-3 text-slate-700 align-top border-r border-slate-100 bg-white max-w-[260px] ${isCancelled ? 'line-through text-rose-500' : ''}`}>
                              {r.particulars || '—'}
                            </td>

                            {/* PR Amount */}
                            <td rowSpan={rowSpan} className="py-3 px-3 font-bold font-mono text-slate-900 align-top border-r border-slate-100 bg-white whitespace-nowrap">
                              <span className={isCancelled ? 'text-rose-600 line-through' : 'text-slate-900'}>
                                {formatPeso(r.prAmount)}
                              </span>
                            </td>
                          </>
                        )}

                        {/* DV Amount & Payee (Rendered for EVERY sub-row) */}
                        <td className="py-3 px-3 font-semibold font-mono text-slate-800 align-top border-r border-slate-200 bg-slate-50/60 whitespace-nowrap">
                          {dv.dvAmount !== undefined ? formatPeso(dv.dvAmount) : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-800 align-top border-r border-slate-200 bg-slate-50/60 font-medium">
                          {dv.payee || '—'}
                        </td>

                        {/* Columns rendered ONLY on 1st DV sub-row with RowSpan */}
                        {idx === 0 && (
                          <>
                            {/* Status */}
                            <td rowSpan={rowSpan} className="py-3 px-3 align-top border-r border-slate-100 bg-white">
                              {r.status ? (
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] px-2 py-0.5 ${
                                    isCancelled
                                      ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                                  }`}
                                >
                                  {r.status}
                                </Badge>
                              ) : (
                                '—'
                              )}
                            </td>

                            {/* Date Released */}
                            <td rowSpan={rowSpan} className="py-3 px-3 text-slate-600 align-top border-r border-slate-100 bg-white whitespace-nowrap">
                              {r.dateReleased || '—'}
                            </td>

                            {/* Remarks */}
                            <td rowSpan={rowSpan} className="py-3 px-3 text-slate-600 italic align-top border-r border-slate-100 bg-white">
                              {r.remarks || '—'}
                            </td>

                            {/* Actions */}
                            <td rowSpan={rowSpan} className="py-3 px-3 text-right sticky right-0 bg-white align-top shadow-xs whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewRecord(r)}
                                  title="View Details"
                                  className="w-7 h-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditModal(r)}
                                  title="Edit Record"
                                  className="w-7 h-7 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingId(r.id)}
                                  title="Delete Record"
                                  className="w-7 h-7 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredRecords.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{startIndex + 1}–{Math.min(endIndex, filteredRecords.length)}</span> of{' '}
                <span className="font-semibold text-slate-700">{filteredRecords.length}</span> records
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && typeof arr[i - 1] === 'number' && p - (arr[i - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-xs">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item as number)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium transition-colors ${
                          safeCurrentPage === item
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NEW / EDIT TRANSACTION MODAL */}
      <Dialog open={showNewModal || !!editingRecord} onOpenChange={(op) => { if (!op) { setShowNewModal(false); setEditingRecord(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>{editingRecord ? `Edit POPS Record #${editingRecord.no}` : 'New POPS PR/DV Record'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Encode PR amount, OBR details, status, and multiple DV payee allocations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTransaction} className="space-y-4 pt-2">
            {/* Section 1: Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label className="text-xs font-semibold text-slate-700">NO. Item</Label>
                <Input
                  value={formData.no || ''}
                  onChange={(e) => handleInputChange('no', e.target.value)}
                  placeholder="e.g. 1"
                  className="h-9 text-xs bg-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Date & Time</Label>
                <Input
                  value={formData.dateTime || ''}
                  onChange={(e) => handleInputChange('dateTime', e.target.value)}
                  placeholder="e.g. 1/9/2026 1:55"
                  className="h-9 text-xs bg-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">PR Number</Label>
                <Input
                  value={formData.prNo || ''}
                  onChange={(e) => handleInputChange('prNo', e.target.value)}
                  placeholder="e.g. PR: 2026-01-0008B"
                  className="h-9 text-xs bg-white mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">OBR Number</Label>
                <Input
                  value={formData.obrNo || ''}
                  onChange={(e) => handleInputChange('obrNo', e.target.value)}
                  placeholder="e.g. OBR: 100-26-01-00053"
                  className="h-9 text-xs bg-white mt-1 font-mono"
                />
              </div>
            </div>

            {/* Section 2: Particulars & PR Amount */}
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Particulars (Description)</Label>
                <Textarea
                  value={formData.particulars || ''}
                  onChange={(e) => handleInputChange('particulars', e.target.value)}
                  placeholder="Purchase of Meals and Snacks for Bataan PPO Physical Fitness Test..."
                  className="text-xs bg-white mt-1 min-h-[60px]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">PR Amount (Total ₱)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.prAmount !== undefined ? formData.prAmount : ''}
                  onChange={(e) => handleInputChange('prAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g. 7875.00"
                  className="h-9 text-xs bg-white mt-1 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Section 3: DV Entries & Payees (Multi-row support) */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Disbursement Voucher (DV) Allocations</span>
                  </Label>
                  <p className="text-[11px] text-blue-600">
                    A single PR Amount can be split into 1 or 2 DV entries.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addDvEntryRow}
                  className="h-7 text-xs bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>Add DV Entry</span>
                </Button>
              </div>

              <div className="space-y-2">
                {(formData.dvEntries || []).map((dv, idx) => (
                  <div key={dv.id || idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-center">#{idx + 1}</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="DV Amount (₱)"
                      value={dv.dvAmount !== undefined ? dv.dvAmount : ''}
                      onChange={(e) => handleDvChange(idx, 'dvAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="h-8 text-xs w-36 font-mono"
                    />
                    <Input
                      placeholder="Payee Name (e.g. TONY AND ANN'S CATERING SERVICES)"
                      value={dv.payee || ''}
                      onChange={(e) => handleDvChange(idx, 'payee', e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    {(formData.dvEntries || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDvEntryRow(idx)}
                        className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Status, Date Released & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Status</Label>
                <Input
                  value={formData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  placeholder="e.g. For cheque released 2/25/26"
                  className="h-9 text-xs bg-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Date Released</Label>
                <Input
                  value={formData.dateReleased || ''}
                  onChange={(e) => handleInputChange('dateReleased', e.target.value)}
                  placeholder="e.g. 2/25/2026"
                  className="h-9 text-xs bg-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Remarks</Label>
                <Input
                  value={formData.remarks || ''}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="e.g. PNP"
                  className="h-9 text-xs bg-white mt-1"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowNewModal(false); setEditingRecord(null); }} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6">
                {editingRecord ? 'Save Changes' : 'Add POPS Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW DETAILS MODAL */}
      <Dialog open={!!viewRecord} onOpenChange={(op) => { if (!op) setViewRecord(null); }}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>POPS Record Details #{viewRecord?.no}</span>
            </DialogTitle>
          </DialogHeader>

          {viewRecord && (
            <div className="space-y-3 text-xs pt-2">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">NO. ITEM</span>
                  <span className="font-bold text-slate-800">{viewRecord.no || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DATE & TIME</span>
                  <span className="font-medium text-slate-700">{viewRecord.dateTime || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PR NO.</span>
                  <span className="font-mono font-bold text-blue-700">{viewRecord.prNo || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OBR NO.</span>
                  <span className="font-mono font-bold text-purple-700">{viewRecord.obrNo || '—'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Particulars</span>
                <p className="text-slate-800 mt-1 font-medium leading-relaxed">{viewRecord.particulars || '—'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">PR Amount</span>
                <span className="text-base font-bold font-mono text-slate-900">{formatPeso(viewRecord.prAmount)}</span>
              </div>

              {/* DV Entries */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 space-y-2">
                <span className="text-blue-900 font-bold text-[11px] block">DV Allocations & Payees</span>
                {(viewRecord.dvEntries || []).map((dv, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-blue-100 flex justify-between items-center">
                    <span className="font-medium text-slate-800">{dv.payee || '—'}</span>
                    <span className="font-mono font-bold text-slate-900">{formatPeso(dv.dvAmount)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">STATUS</span>
                  <span className="font-medium text-slate-800">{viewRecord.status || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DATE RELEASED</span>
                  <span className="font-medium text-slate-700">{viewRecord.dateReleased || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">REMARKS</span>
                  <span className="font-medium text-slate-700">{viewRecord.remarks || '—'}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setViewRecord(null)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPORT EXCEL MODAL */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-xl bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Import POPS Excel File</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Upload your POPS transaction sheet (.xlsx / .xls).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div
              onClick={() => importInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50 rounded-xl p-8 text-center cursor-pointer transition-all"
            >
              <FileUp className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Click to upload POPS Excel Tracker</p>
              <p className="text-[11px] text-slate-400 mt-1">Supports .xlsx, .xls files</p>
              <input
                ref={importInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {importFileName && (
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <span className="font-medium text-slate-700 truncate max-w-[300px]">{importFileName}</span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">
                  {importRows.length} rows parsed
                </Badge>
              </div>
            )}

            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleImportConfirm}
                disabled={importRows.length === 0 || importing}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {importing ? 'Importing...' : `Import ${importRows.length} Records`}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE SINGLE CONFIRMATION MODAL */}
      <Dialog open={!!deletingId} onOpenChange={(op) => { if (!op) setDeletingId(null); }}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Delete POPS Record?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to delete this POPS transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeletingId(null)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleDeleteRecord} className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CLEAR ALL CONFIRMATION MODAL */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Clear All POPS Records?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to delete all {records.length} POPS records? This will clear your personal log table so you can re-import or encode fresh records.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowClearAllDialog(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await clearAllTransactions(user?.id || '');
                setShowClearAllDialog(false);
                sileo.success({ title: 'History Cleared 🗑️', description: 'All POPS records removed.' });
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              Clear All Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
