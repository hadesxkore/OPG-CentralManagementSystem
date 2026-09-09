import { useState, useEffect, useRef } from 'react';
import { sileo } from 'sileo';
import * as XLSX from 'xlsx';

import {
  Plus, Search, Download, Trash2, Edit3, Eye,
  CheckCircle2, CreditCard, Wallet, ChevronLeft, ChevronRight, AlertCircle,
  Upload, FileUp, AlertTriangle, ScrollText, User, ArrowRightLeft, FileText,
  Users, ShieldCheck
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuthStore } from '@/stores/authStore';
import { useObrSupplierStore } from '@/stores/obrSupplierStore';
import type { ObrSupplierRecord } from '@/types';
import { cn, formatDisplayDate, isDateInRange } from '@/lib/utils';
import { db } from '@/backend/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

type AppUser = { id: string; name: string; username?: string; office?: string; role?: string; destination?: string; status?: string; };

const formatPeso = (v?: number) => {
  if (v === undefined || v === null || isNaN(v)) return '₱0.00';
  return `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function ObrSupplierEncodingPage() {
  const { user } = useAuthStore();
  const { records, subscribeTransactions, addTransaction, bulkAddTransactions, updateTransaction, deleteTransaction, clearAllTransactions } = useObrSupplierStore();

  // ── Admin user-selection state ───────────────────────────────────────────
  const isAdmin = user?.role === 'admin';
  const [availableUsers, setAvailableUsers] = useState<AppUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const selectedUser = availableUsers.find(u => u.id === selectedUserId) || null;
  const effectiveUserId = selectedUserId || user?.id || '';
  const viewingLabel = selectedUser ? `${selectedUser.name} (${selectedUser.office || selectedUser.role || ''})` : 'My Records';

  // Map of userId -> count of encoded records in obr_supplier_records
  const [userRecordCounts, setUserRecordCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isAdmin) return;
    
    const unsubRecords = onSnapshot(collection(db, 'obr_supplier_records'), snap => {
      const counts: Record<string, number> = {};
      snap.docs.forEach(d => {
        const encId = d.data().encodedById;
        if (encId) counts[encId] = (counts[encId] || 0) + 1;
      });
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('opg_obr_supplier_tx_')) {
          const uid = key.replace('opg_obr_supplier_tx_', '');
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(parsed) && parsed.length > 0) {
              counts[uid] = Math.max(counts[uid] || 0, parsed.length);
            }
          } catch (e) {}
        }
      }
      setUserRecordCounts(counts);
    }, () => {});

    return () => unsubRecords();
  }, [isAdmin]);

  // Fetch ALL Central Users when admin
  useEffect(() => {
    if (!isAdmin) return;
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      const all: AppUser[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
      const centralUsers = all.filter(u => u.destination === 'Central Users' || u.role === 'user' || u.role === 'restricted');
      setAvailableUsers(centralUsers);
    }, () => {});

    return () => unsubUsers();
  }, [isAdmin]);

  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // Form fields state
  const [formData, setFormData] = useState<Partial<ObrSupplierRecord>>({
    cNo: '',
    dateReleased: '',
    obrNo: '',
    particulars: '',
    dateOfEvent: '',
    obrAmount: undefined,
    receivedBy1: '',
    dateTime1: '',
    documentReturnDate: '',
    payee: '',
    voucherAmount: undefined,
    receivedBy2: '',
    dateTime2: '',
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'no-asc' | 'newest' | 'oldest' | 'obr-high' | 'voucher-high'>('no-asc');

  // Pagination states (20 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Modal states
  const [viewRecord, setViewRecord] = useState<ObrSupplierRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ObrSupplierRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Excel Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<Partial<ObrSupplierRecord>[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // PDF Export states
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfStartDate, setPdfStartDate] = useState('');
  const [pdfEndDate, setPdfEndDate] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Generate Landscape PDF for live preview in Modal (Filtered by Date Released)
  useEffect(() => {
    if (!showPdfModal) {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      return;
    }

    const filteredForPdf = records.filter(r => isDateInRange(r.dateReleased, pdfStartDate, pdfEndDate));

    if (filteredForPdf.length === 0) {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('OFFICE OF THE PROVINCIAL GOVERNOR', 14, 12);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('CENTRAL MANAGEMENT SYSTEM — OBR & SUPPLIER RECORDS REPORT', 14, 17.5);

      const periodText = pdfStartDate || pdfEndDate
        ? `Date Period (Date Released): ${pdfStartDate || 'Beginning'} to ${pdfEndDate || 'Latest'}`
        : 'Date Period: All Released Dates';

      const ownerName = selectedUser
        ? (selectedUser.name || selectedUser.username || 'User')
        : (user?.name || user?.email || 'User');

      const headerText = selectedUser && isAdmin
        ? `${periodText}   |   Record Owner: ${ownerName}   |   Downloaded by: ${user?.name || 'Admin'}   |   Total Records: ${filteredForPdf.length}`
        : `${periodText}   |   Downloaded by: ${ownerName}   |   Total Records: ${filteredForPdf.length}`;

      doc.setFontSize(8);
      doc.text(headerText, 14, 23);

      const tableData = filteredForPdf.map((r) => [
        r.cNo || '—',
        formatDisplayDate(r.dateReleased) || '—',
        r.obrNo || '—',
        r.particulars || '—',
        formatDisplayDate(r.dateOfEvent) || '—',
        r.obrAmount !== undefined && r.obrAmount !== null ? `P${Number(r.obrAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        r.receivedBy1 || '—',
        formatDisplayDate(r.dateTime1) || '—',
        formatDisplayDate(r.documentReturnDate) || '—',
        r.payee || '—',
        r.voucherAmount !== undefined && r.voucherAmount !== null ? `P${Number(r.voucherAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        r.receivedBy2 || '—',
        formatDisplayDate(r.dateTime2) || '—'
      ]);

      autoTable(doc, {
        startY: 26,
        head: [['C. NO.', 'DATE RELEASED', 'OBR NO.', 'PARTICULARS', 'DATE OF EVENT', 'OBR AMOUNT', 'RECEIVED BY (1)', 'DATE/TIME (1)', 'RETURN DATE', 'PAYEE / SUPPLIER', 'VOUCHER AMOUNT', 'RECEIVED BY (2)', 'DATE/TIME (2)']],
        body: tableData,
        styles: { fontSize: 6.5, cellPadding: 1.8, overflow: 'linebreak' },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 22 },
          2: { cellWidth: 22, fontStyle: 'bold' },
          3: { cellWidth: 32 },
          4: { cellWidth: 22 },
          5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
          6: { cellWidth: 20 },
          7: { cellWidth: 22 },
          8: { cellWidth: 20 },
          9: { cellWidth: 28 },
          10: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
          11: { cellWidth: 20 },
          12: { cellWidth: 22 }
        },
        didDrawPage: (data) => {
          const str = `Page ${data.pageNumber} of ${doc.internal.pages.length - 1}`;
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(str, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 6);
        }
      });

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (e) {
      console.error('PDF preview generation error:', e);
    }
  }, [showPdfModal, pdfStartDate, pdfEndDate, records]);

  const handleDownloadPdf = () => {
    const filteredForPdf = records.filter(r => isDateInRange(r.dateReleased, pdfStartDate, pdfEndDate));
    if (filteredForPdf.length === 0) return;

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('OFFICE OF THE PROVINCIAL GOVERNOR', 14, 12);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('CENTRAL MANAGEMENT SYSTEM — OBR & SUPPLIER RECORDS REPORT', 14, 17.5);

      const ownerName = selectedUser
        ? (selectedUser.name || selectedUser.username || 'User')
        : (user?.name || user?.email || 'User');
      const ownerNameClean = ownerName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');

      const periodText = pdfStartDate || pdfEndDate
        ? `Date Period (Date Released): ${pdfStartDate || 'Beginning'} to ${pdfEndDate || 'Latest'}`
        : 'Date Period: All Released Dates';

      const headerText = selectedUser && isAdmin
        ? `${periodText}   |   Record Owner: ${ownerName}   |   Downloaded by: ${user?.name || 'Admin'}   |   Total Records: ${filteredForPdf.length}`
        : `${periodText}   |   Downloaded by: ${ownerName}   |   Total Records: ${filteredForPdf.length}`;

      doc.setFontSize(8);
      doc.text(headerText, 14, 23);

      const tableData = filteredForPdf.map((r) => [
        r.cNo || '—',
        formatDisplayDate(r.dateReleased) || '—',
        r.obrNo || '—',
        r.particulars || '—',
        formatDisplayDate(r.dateOfEvent) || '—',
        r.obrAmount !== undefined && r.obrAmount !== null ? `P${Number(r.obrAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        r.receivedBy1 || '—',
        formatDisplayDate(r.dateTime1) || '—',
        formatDisplayDate(r.documentReturnDate) || '—',
        r.payee || '—',
        r.voucherAmount !== undefined && r.voucherAmount !== null ? `P${Number(r.voucherAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        r.receivedBy2 || '—',
        formatDisplayDate(r.dateTime2) || '—'
      ]);

      autoTable(doc, {
        startY: 26,
        head: [['C. NO.', 'DATE RELEASED', 'OBR NO.', 'PARTICULARS', 'DATE OF EVENT', 'OBR AMOUNT', 'RECEIVED BY (1)', 'DATE/TIME (1)', 'RETURN DATE', 'PAYEE / SUPPLIER', 'VOUCHER AMOUNT', 'RECEIVED BY (2)', 'DATE/TIME (2)']],
        body: tableData,
        styles: { fontSize: 6.5, cellPadding: 1.8, overflow: 'linebreak' },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 22 },
          2: { cellWidth: 22, fontStyle: 'bold' },
          3: { cellWidth: 32 },
          4: { cellWidth: 22 },
          5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
          6: { cellWidth: 20 },
          7: { cellWidth: 22 },
          8: { cellWidth: 20 },
          9: { cellWidth: 28 },
          10: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
          11: { cellWidth: 20 },
          12: { cellWidth: 22 }
        },
        didDrawPage: (data) => {
          const str = `Page ${data.pageNumber} of ${doc.internal.pages.length - 1}`;
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(str, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 6);
        }
      });

      const fileName = `OBR_Supplier_Records_${ownerNameClean}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      sileo.success({ title: 'PDF Downloaded! 📄', description: `Saved ${fileName}` });
    } catch (e) {
      console.error('PDF export error:', e);
    }
  };

  useEffect(() => {
    if (!effectiveUserId) return;
    const unsub = subscribeTransactions(effectiveUserId);
    return () => unsub();
  }, [subscribeTransactions, effectiveUserId]);

  const handleInputChange = (field: keyof ObrSupplierRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-increment C. NO. helper
  const getNextCNo = () => {
    if (!records || records.length === 0) return '1';
    const nums = records
      .map((r) => parseInt(String(r.cNo || '').replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    if (nums.length === 0) return String(records.length + 1);
    const maxNum = Math.max(...nums);
    return String(maxNum + 1);
  };

  const openNewModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setFormData({
      cNo: getNextCNo(),
      dateReleased: todayStr,
      obrNo: 'OBR-',
      particulars: '',
      dateOfEvent: '',
      obrAmount: undefined,
      receivedBy1: '',
      dateTime1: '',
      documentReturnDate: '',
      payee: '',
      voucherAmount: undefined,
      receivedBy2: '',
      dateTime2: '',
    });
    setShowNewModal(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await updateTransaction({
          ...editingRecord,
          ...formData,
          encodedBy: user?.name || editingRecord.encodedBy || 'User Staff',
          encodedById: user?.id || editingRecord.encodedById || 'usr-1',
          office: user?.office || editingRecord.office || 'OPG - Central',
        });
        sileo.success({ title: 'Record Updated! ✨', description: `OBR Control #${formData.cNo || editingRecord.cNo} updated.` });
        setEditingRecord(null);
      } else {
        await addTransaction({
          ...formData,
          cNo: formData.cNo || getNextCNo(),
          encodedBy: user?.name || 'User Staff',
          encodedById: user?.id || 'usr-1',
          office: user?.office || 'OPG - Central',
        });
        sileo.success({ title: 'Record Encoded! 🚀', description: `OBR Control #${formData.cNo || getNextCNo()} added to database.` });
        setShowNewModal(false);
      }
    } catch (err) {
      console.error('Failed to save OBR record:', err);
      sileo.error({ title: 'Encoding Error', description: 'Could not save record to database.' });
    }
  };

  const openEditModal = (rec: ObrSupplierRecord) => {
    setEditingRecord(rec);
    setFormData({ ...rec });
  };

  const handleDeleteRecord = async () => {
    if (!deletingId) return;
    try {
      await deleteTransaction(deletingId);
      sileo.success({ title: 'Record Deleted 🗑️', description: 'Record removed from database.' });
    } catch (err) {
      console.error('Failed to delete OBR record:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Excel File Parser
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

        // Find header row
        let headerRowIdx = -1;
        for (let r = 0; r < Math.min(raw.length, 10); r++) {
          const rowStr = (raw[r] || []).map(c => String(c).toUpperCase()).join(' ');
          if (rowStr.includes('OBR') || rowStr.includes('PARTICULARS') || rowStr.includes('C. NO')) {
            headerRowIdx = r;
            break;
          }
        }
        if (headerRowIdx === -1) headerRowIdx = 0;

        const header = (raw[headerRowIdx] || []).map(h => String(h).toUpperCase().trim());

        const findColIdx = (keywords: string[]) => {
          return header.findIndex(h => keywords.some(k => h.includes(k)));
        };

        const cNoIdx = findColIdx(['C. NO', 'C.NO', 'CONTROL']);
        const relDateIdx = findColIdx(['DATE RELEASED', 'RELEASED']);
        const obrNoIdx = findColIdx(['OBR NO', 'OBR']);
        const partIdx = findColIdx(['PARTICULARS', 'DESCRIPTION']);
        const eventDateIdx = findColIdx(['EVENT', 'DATE OF EVENT']);
        const obrAmtIdx = findColIdx(['OBR AMOUNT', 'OBR AMT']);
        const recBy1Idx = findColIdx(['RECEIVED BY']);
        const dt1Idx = findColIdx(['DATE AND TIME']);
        const retDateIdx = findColIdx(['RETURN DATE', 'DOCUMENT RETURN']);
        const payeeIdx = findColIdx(['PAYEE', 'SUPPLIER']);
        const vAmtIdx = findColIdx(['VOUCHER AMOUNT', 'VOUCHER']);

        const formatExcelDate = (val: any): string => {
          return formatDisplayDate(val);
        };

        const parsedRows: Partial<ObrSupplierRecord>[] = [];
        for (let i = headerRowIdx + 1; i < raw.length; i++) {
          const row = raw[i];
          if (!row || !Array.isArray(row)) continue;

          const getVal = (idx: number) => idx !== -1 ? String(row[idx] || '').trim() : '';
          const getDateVal = (idx: number) => idx !== -1 ? formatExcelDate(row[idx]) : '';
          const getNum = (idx: number) => {
            if (idx === -1) return undefined;
            const n = parseFloat(String(row[idx] || '').replace(/[^0-9.-]+/g, ''));
            return isNaN(n) ? undefined : n;
          };

          const cNo = getVal(cNoIdx);
          const obrNo = getVal(obrNoIdx);
          const particulars = getVal(partIdx);
          const payee = getVal(payeeIdx);
          const obrAmount = getNum(obrAmtIdx);
          const voucherAmount = getNum(vAmtIdx);

          const hasAnyData = cNo || obrNo || particulars || payee || obrAmount !== undefined || voucherAmount !== undefined;
          if (!hasAnyData) continue;

          parsedRows.push({
            cNo: cNo || String(parsedRows.length + 1),
            dateReleased: getDateVal(relDateIdx),
            obrNo,
            particulars,
            dateOfEvent: getDateVal(eventDateIdx),
            obrAmount,
            receivedBy1: getVal(recBy1Idx),
            dateTime1: getDateVal(dt1Idx),
            documentReturnDate: getDateVal(retDateIdx),
            payee,
            voucherAmount,
            receivedBy2: '',
            dateTime2: '',
          });
        }

        if (parsedRows.length === 0) {
          setImportError('No valid data rows found in this file.');
          return;
        }

        setImportRows(parsedRows);
      } catch (err) {
        console.error('Excel Parsing Error:', err);
        setImportError('Failed to read Excel file.');
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
        encodedBy: user?.name || 'User Staff',
        encodedById: user?.id || 'usr-1',
        office: user?.office || 'OPG - Central',
      }));

      await bulkAddTransactions(recordsToInsert);
      setShowImportModal(false);
      setImportRows([]);
      setImportFileName('');
      sileo.success({ title: 'Import Successful! 📊', description: `${importRows.length} OBR records imported.` });
    } finally {
      setImporting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      'C. No.',
      'Date Released',
      'OBR No.',
      'Particulars',
      'Date of Event',
      'OBR Amount',
      'Received By (1)',
      'Date & Time (1)',
      'Doc Return Date',
      'Payee',
      'Voucher Amount',
      'Received By (2)',
      'Date & Time (2)',
      'Encoded By',
    ];

    const rows = filteredRecords.map(r => [
      `"${r.cNo || ''}"`,
      `"${r.dateReleased || ''}"`,
      `"${r.obrNo || ''}"`,
      `"${(r.particulars || '').replace(/"/g, '""')}"`,
      `"${r.dateOfEvent || ''}"`,
      r.obrAmount !== undefined ? String(r.obrAmount) : '',
      `"${(r.receivedBy1 || '').replace(/"/g, '""')}"`,
      `"${r.dateTime1 || ''}"`,
      `"${r.documentReturnDate || ''}"`,
      `"${(r.payee || '').replace(/"/g, '""')}"`,
      r.voucherAmount !== undefined ? String(r.voucherAmount) : '',
      `"${(r.receivedBy2 || '').replace(/"/g, '""')}"`,
      `"${r.dateTime2 || ''}"`,
      `"${r.encodedBy || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OBR_Supplier_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase().trim();
    return !query ||
      (r.cNo && r.cNo.toLowerCase().includes(query)) ||
      (r.obrNo && r.obrNo.toLowerCase().includes(query)) ||
      (r.particulars && r.particulars.toLowerCase().includes(query)) ||
      (r.payee && r.payee.toLowerCase().includes(query)) ||
      (r.receivedBy1 && r.receivedBy1.toLowerCase().includes(query)) ||
      (r.receivedBy2 && r.receivedBy2.toLowerCase().includes(query));
  }).sort((a, b) => {
    if (sortBy === 'no-asc') {
      const nA = parseInt(String(a.cNo ?? '').replace(/\D/g, ''), 10) || 0;
      const nB = parseInt(String(b.cNo ?? '').replace(/\D/g, ''), 10) || 0;
      return nA - nB;
    }
    if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    if (sortBy === 'obr-high') return (b.obrAmount || 0) - (a.obrAmount || 0);
    if (sortBy === 'voucher-high') return (b.voucherAmount || 0) - (a.voucherAmount || 0);
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // KPIs
  const totalObrSum = records.reduce((acc, r) => acc + (r.obrAmount || 0), 0);
  const totalVoucherSum = records.reduce((acc, r) => acc + (r.voucherAmount || 0), 0);
  const releasedCount = records.filter(r => r.dateReleased && r.dateReleased.trim() !== '').length;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Admin User-Selector Banner ───────────────────────────────── */}
      {isAdmin && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 leading-tight">Admin View Mode</p>
              <p className="text-[11px] text-amber-600 leading-tight">Select a user to view their OBR &amp; Supplier Records</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
            <Select
              value={selectedUserId || '__self__'}
              onValueChange={val => setSelectedUserId(val === '__self__' ? '' : val)}
            >
              <SelectTrigger className="h-9 text-xs bg-white border-amber-200 text-slate-700 min-w-[220px] w-auto">
                <Users className="w-3.5 h-3.5 text-amber-500 mr-1.5 flex-shrink-0" />
                <SelectValue placeholder="Select user to view..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__self__" className="text-xs font-semibold text-slate-500">— View My Own Records —</SelectItem>
                {availableUsers.map(u => {
                  const count = userRecordCounts[u.id] || 0;
                  return (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span className="font-medium">{u.name}{u.office ? ` (${u.office})` : ''}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", count > 0 ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-slate-100 text-slate-400")}>
                          {count > 0 ? `${count} record${count > 1 ? 's' : ''}` : 'No records'}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedUserId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUserId('')}
                className="h-9 text-xs border-amber-200 text-amber-700 hover:bg-amber-100"
              >
                ✕ Clear
              </Button>
            )}
          </div>
          {selectedUser && (
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-semibold px-2.5 py-1 whitespace-nowrap">
              Viewing: {viewingLabel}
            </Badge>
          )}
        </div>
      )}
      {/* Page Header */}
      <PageHeader
        title="OBR & Supplier Record"
        description="Encode and track OBR numbers, event dates, OBR/voucher amounts, payees, and document release status."
        icon={ScrollText}
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
              onClick={() => setShowPdfModal(true)}
              disabled={records.length === 0}
              className="border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 font-medium text-xs sm:text-sm flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Export PDF</span>
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
              <span>New OBR Record</span>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total OBR Encoded"
          value={String(records.length)}
          subtitle="Total supplier records logged"
          icon={ScrollText}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Total OBR Amount"
          value={formatPeso(totalObrSum)}
          subtitle="Sum of encoded OBR amounts"
          icon={CreditCard}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="Total Voucher Amount"
          value={formatPeso(totalVoucherSum)}
          subtitle="Sum of voucher amounts"
          icon={Wallet}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <KpiCard
          title="Documents Released"
          value={String(releasedCount)}
          subtitle={`${records.length - releasedCount} pending release`}
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
                <span>OBR & Supplier Logs</span>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 font-mono font-semibold">
                  {filteredRecords.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Tracking control numbers, OBR numbers, dates, payees, and voucher amounts.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search C.No, OBR, Payee, Particulars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs bg-slate-50 border-slate-200 h-9"
                />
              </div>

              {/* Sort */}
              <div className="min-w-[130px]">
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-asc">By C. No. (Ascending)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="obr-high">Highest OBR Amount</SelectItem>
                    <SelectItem value="voucher-high">Highest Voucher Amount</SelectItem>
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
              <ScrollText className="w-12 h-12 mb-3 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">No OBR & Supplier records found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery ? 'Try adjusting your search query.' : 'Click "New OBR Record" above to start encoding.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[1700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-14 text-center">C. NO.</th>
                    <th className="py-3 px-3 min-w-[110px]">Date Released</th>
                    <th className="py-3 px-3 min-w-[130px]">OBR NO.</th>
                    <th className="py-3 px-3 min-w-[220px]">Particulars</th>
                    <th className="py-3 px-3 min-w-[110px]">Date of Event</th>
                    <th className="py-3 px-3 min-w-[120px] bg-amber-50/70 border-x border-amber-200/60">OBR Amount</th>
                    <th className="py-3 px-3 min-w-[160px] bg-slate-100/50">Received By (1)</th>
                    <th className="py-3 px-3 min-w-[120px] bg-slate-100/50">Date & Time (1)</th>
                    <th className="py-3 px-3 min-w-[120px]">Doc Return Date</th>
                    <th className="py-3 px-3 min-w-[180px]">Payee / Supplier</th>
                    <th className="py-3 px-3 min-w-[120px] bg-emerald-50/70 border-x border-emerald-200/60">Voucher Amount</th>
                    <th className="py-3 px-3 min-w-[160px] bg-emerald-50/40">Received By (2)</th>
                    <th className="py-3 px-3 min-w-[120px] bg-emerald-50/40">Date & Time (2)</th>
                    <th className="py-3 px-3 text-right sticky right-0 bg-slate-50 shadow-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* C. NO */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 text-center whitespace-nowrap">
                        {r.cNo || '—'}
                      </td>

                      {/* Date Released */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {formatDisplayDate(r.dateReleased) || '—'}
                      </td>

                      {/* OBR NO */}
                      <td className="py-3 px-3 font-mono font-bold text-amber-700 whitespace-nowrap">
                        {r.obrNo ? (
                          <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {r.obrNo}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Particulars */}
                      <td className="py-3 px-3 text-slate-700 max-w-[240px] truncate" title={r.particulars}>
                        {r.particulars || '—'}
                      </td>

                      {/* Date of Event */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {formatDisplayDate(r.dateOfEvent) || '—'}
                      </td>

                      {/* OBR Amount */}
                      <td className="py-3 px-3 font-mono font-bold text-amber-900 bg-amber-50/40 border-x border-amber-100 whitespace-nowrap">
                        {formatPeso(r.obrAmount)}
                      </td>

                      {/* Received By 1 */}
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap bg-slate-50/40">
                        {r.receivedBy1 || '—'}
                      </td>

                      {/* Date Time 1 */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap bg-slate-50/40">
                        {formatDisplayDate(r.dateTime1) || '—'}
                      </td>

                      {/* Doc Return Date */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {formatDisplayDate(r.documentReturnDate) || '—'}
                      </td>

                      {/* Payee */}
                      <td className="py-3 px-3 font-semibold text-slate-800 max-w-[200px] truncate" title={r.payee}>
                        {r.payee || '—'}
                      </td>

                      {/* Voucher Amount */}
                      <td className="py-3 px-3 font-mono font-bold text-emerald-900 bg-emerald-50/40 border-x border-emerald-100 whitespace-nowrap">
                        {formatPeso(r.voucherAmount)}
                      </td>

                      {/* Received By 2 */}
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap bg-emerald-50/20">
                        {r.receivedBy2 || '—'}
                      </td>

                      {/* Date Time 2 */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap bg-emerald-50/20">
                        {formatDisplayDate(r.dateTime2) || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right sticky right-0 bg-white group-hover:bg-slate-50 transition-colors shadow-xs whitespace-nowrap">
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
                    </tr>
                  ))}
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
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-blue-600" />
              <span>{editingRecord ? `Edit OBR Record #${editingRecord.cNo}` : 'New OBR & Supplier Record'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Encode OBR details, dates, amounts, supplier payee, and receiving signatures.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRecord} className="space-y-4 pt-2">
            {/* Section 1: Control & Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label className="text-xs font-semibold text-slate-700">C. NO.</Label>
                <Input
                  value={formData.cNo || ''}
                  onChange={(e) => handleInputChange('cNo', e.target.value)}
                  placeholder="e.g. 1"
                  className="h-9 text-xs bg-white mt-1 font-mono font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">DATE RELEASED</Label>
                <Input
                  type="date"
                  value={formData.dateReleased || ''}
                  onChange={(e) => handleInputChange('dateReleased', e.target.value)}
                  className="h-9 text-xs bg-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">OBR NO.</Label>
                <Input
                  value={formData.obrNo || ''}
                  onChange={(e) => handleInputChange('obrNo', e.target.value)}
                  placeholder="e.g. OBR-2026-01"
                  className="h-9 text-xs bg-white mt-1 font-mono font-semibold"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">DATE OF EVENT</Label>
                <Input
                  type="text"
                  value={formData.dateOfEvent || ''}
                  onChange={(e) => handleInputChange('dateOfEvent', e.target.value)}
                  placeholder="e.g. Jan 12, 2026"
                  className="h-9 text-xs bg-white mt-1"
                />
              </div>
            </div>

            {/* Section 2: Particulars, Payee, Amounts */}
            <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Label className="text-xs font-semibold text-slate-700">PARTICULARS</Label>
                <Textarea
                  value={formData.particulars || ''}
                  onChange={(e) => handleInputChange('particulars', e.target.value)}
                  placeholder="Particulars or description of request / purchase..."
                  className="text-xs bg-white mt-1 min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">PAYEE / SUPPLIER</Label>
                  <Input
                    value={formData.payee || ''}
                    onChange={(e) => handleInputChange('payee', e.target.value)}
                    placeholder="Supplier or Payee Name"
                    className="h-9 text-xs bg-white mt-1 font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">OBR AMOUNT (₱)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.obrAmount !== undefined ? formData.obrAmount : ''}
                    onChange={(e) => handleInputChange('obrAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="e.g. 15000.00"
                    className="h-9 text-xs bg-white mt-1 font-mono font-bold text-amber-800"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">VOUCHER AMOUNT (₱)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.voucherAmount !== undefined ? formData.voucherAmount : ''}
                    onChange={(e) => handleInputChange('voucherAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="e.g. 14850.00"
                    className="h-9 text-xs bg-white mt-1 font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: 1st Receiving Info */}
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
              <Label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>1st Receiving Info</span>
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-slate-700">Received By (Printed Name w/ Signature)</Label>
                  <Input
                    value={formData.receivedBy1 || ''}
                    onChange={(e) => handleInputChange('receivedBy1', e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                    className="h-9 text-xs bg-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-700">Date and Time</Label>
                  <Input
                    value={formData.dateTime1 || ''}
                    onChange={(e) => handleInputChange('dateTime1', e.target.value)}
                    placeholder="e.g. 1/9/2026 8:30 AM"
                    className="h-9 text-xs bg-white mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Return & 2nd Receiving Info */}
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
              <Label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>Return & 2nd Receiving Info</span>
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium text-slate-700">Document Return Date</Label>
                  <Input
                    type="date"
                    value={formData.documentReturnDate || ''}
                    onChange={(e) => handleInputChange('documentReturnDate', e.target.value)}
                    className="h-9 text-xs bg-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-700">Received By (2nd)</Label>
                  <Input
                    value={formData.receivedBy2 || ''}
                    onChange={(e) => handleInputChange('receivedBy2', e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="h-9 text-xs bg-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-700">Date and Time (2nd)</Label>
                  <Input
                    value={formData.dateTime2 || ''}
                    onChange={(e) => handleInputChange('dateTime2', e.target.value)}
                    placeholder="e.g. 1/12/2026 2:15 PM"
                    className="h-9 text-xs bg-white mt-1"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowNewModal(false); setEditingRecord(null); }} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6">
                {editingRecord ? 'Save Changes' : 'Add OBR Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW DETAILS MODAL */}
      <Dialog open={!!viewRecord} onOpenChange={(op) => { if (!op) setViewRecord(null); }}>
        <DialogContent className="max-w-xl bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-blue-600" />
              <span>OBR Record Details #{viewRecord?.cNo}</span>
            </DialogTitle>
          </DialogHeader>

          {viewRecord && (
            <div className="space-y-3 text-xs pt-2">
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">C. NO.</span>
                  <span className="font-bold text-slate-800">{viewRecord.cNo || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DATE RELEASED</span>
                  <span className="font-medium text-slate-700">{formatDisplayDate(viewRecord.dateReleased) || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OBR NO.</span>
                  <span className="font-mono font-bold text-amber-700">{viewRecord.obrNo || '—'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Particulars</span>
                <p className="text-slate-800 mt-1 font-medium leading-relaxed">{viewRecord.particulars || '—'}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">PAYEE / SUPPLIER</span>
                  <span className="font-semibold text-slate-800">{viewRecord.payee || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OBR AMOUNT</span>
                  <span className="font-mono font-bold text-amber-900">{formatPeso(viewRecord.obrAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">VOUCHER AMOUNT</span>
                  <span className="font-mono font-bold text-emerald-900">{formatPeso(viewRecord.voucherAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div>
                  <span className="text-blue-500 block text-[10px] font-bold">1ST RECEIVED BY</span>
                  <span className="font-medium text-slate-800">{viewRecord.receivedBy1 || '—'}</span>
                </div>
                <div>
                  <span className="text-blue-500 block text-[10px] font-bold">1ST DATE & TIME</span>
                  <span className="font-medium text-slate-700">{formatDisplayDate(viewRecord.dateTime1) || '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-emerald-600 block text-[10px] font-bold">DOC RETURN DATE</span>
                  <span className="font-medium text-slate-800">{formatDisplayDate(viewRecord.documentReturnDate) || '—'}</span>
                </div>
                <div>
                  <span className="text-emerald-600 block text-[10px] font-bold">2ND RECEIVED BY</span>
                  <span className="font-medium text-slate-800">{viewRecord.receivedBy2 || '—'}</span>
                </div>
                <div>
                  <span className="text-emerald-600 block text-[10px] font-bold">2ND DATE & TIME</span>
                  <span className="font-medium text-slate-700">{formatDisplayDate(viewRecord.dateTime2) || '—'}</span>
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
              <span>Import OBR & Supplier Excel File</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Upload your OBR transaction sheet (.xlsx / .xls).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div
              onClick={() => importInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50 rounded-xl p-8 text-center cursor-pointer transition-all"
            >
              <FileUp className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Click to upload OBR & Supplier Excel Tracker</p>
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
              Delete OBR Record?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to delete this OBR record? This action cannot be undone.
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
              Clear All OBR Records?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to delete all {records.length} OBR records? This will clear your personal log table so you can re-import or encode fresh records.
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
                sileo.success({ title: 'History Cleared 🗑️', description: 'All OBR records removed.' });
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              Clear All Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EXPORT PDF PREVIEW MODAL */}
      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
        <DialogContent className="max-w-5xl bg-white p-6 rounded-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <DialogTitle className="text-base font-bold text-slate-900">
                  Export PDF Report Preview
                </DialogTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] uppercase font-bold">
                  Landscape A4
                </Badge>
              </div>
            </div>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Select date period to filter by <strong>Date Released</strong> column, then preview your PDF document before downloading.
            </DialogDescription>
          </DialogHeader>

          {/* Date Filters & Controls */}
          <div className="py-3 px-4 bg-slate-50 rounded-xl border border-slate-200/80 my-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold text-slate-700 whitespace-nowrap">From (Date Released):</Label>
                  <Input
                    type="date"
                    value={pdfStartDate}
                    onChange={(e) => setPdfStartDate(e.target.value)}
                    className="h-8 text-xs bg-white w-36 border-slate-300"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold text-slate-700 whitespace-nowrap">To:</Label>
                  <Input
                    type="date"
                    value={pdfEndDate}
                    onChange={(e) => setPdfEndDate(e.target.value)}
                    className="h-8 text-xs bg-white w-36 border-slate-300"
                  />
                </div>
                {(pdfStartDate || pdfEndDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setPdfStartDate(''); setPdfEndDate(''); }}
                    className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    Clear Dates
                  </Button>
                )}
              </div>

              {/* Summary matching badge */}
              <div className="text-xs text-slate-600 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                Matching Records: <strong className="text-blue-700">{records.filter(r => isDateInRange(r.dateReleased, pdfStartDate, pdfEndDate)).length}</strong> of {records.length}
              </div>
            </div>
          </div>

          {/* PDF Live Viewer Window */}
          <div className="flex-1 min-h-[440px] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
            {pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                title="PDF Live Preview"
                className="w-full h-full min-h-[440px] border-0 rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 mb-2" />
                <p className="font-semibold text-sm">No records match the selected date period</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting or clearing the date range filter above.</p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 italic">
              Orientation: <strong>Landscape</strong> (A4) · Format: Official OPG Report
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowPdfModal(false)} className="text-xs">
                Close
              </Button>
              <Button
                onClick={handleDownloadPdf}
                disabled={!pdfBlobUrl}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
