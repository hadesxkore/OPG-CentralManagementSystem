import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';
import * as XLSX from 'xlsx';

import {
  FileSpreadsheet, Plus, Search, Filter, Download, Trash2, Edit3, Eye,
  Sparkles, CheckCircle2, XCircle, Clock, MapPin, UserCheck, Calendar as CalendarIcon,
  CreditCard, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RefreshCw, FileText, Hash, AlertCircle,
  Wand2, Users, Upload, FileUp, X, AlertTriangle
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import type { TransactionRecord } from '@/types';

const BATAAN_MUNICIPALITIES = [
  'Abucay',
  'Bagac',
  'Balanga City',
  'Dinalupihan',
  'Hermosa',
  'Limay',
  'Mariveles',
  'Morong',
  'Orani',
  'Orion',
  'Pilar',
  'Samal',
];

const formatPeso = (v?: number) => {
  if (v === undefined || v === null || isNaN(v)) return '₱0.00';
  return `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ── SHADCN CALENDAR & TIME PICKER COMPONENT ──────────────────────
interface DateTimePickerProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  includeTime?: boolean;
}

function DateTimePicker({ value, onChange, placeholder = 'Select date & time', includeTime = true }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  // Parse existing value if available
  const parseVal = () => {
    if (!value) return { date: undefined as Date | undefined, time: '08:00' };
    const parts = value.split(' ');
    const dateObj = new Date(parts[0]);
    const validDate = isNaN(dateObj.getTime()) ? undefined : dateObj;
    const timeStr = parts[1] || '08:00';
    return { date: validDate, time: timeStr };
  };

  const { date: selectedDate, time: selectedTime } = parseVal();

  const formatDisplay = () => {
    if (!value) return placeholder;
    return value;
  };

  const handleSelectDate = (newDate: Date | undefined) => {
    if (!newDate) {
      onChange('');
      return;
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = newDate.getFullYear();
    const mm = pad(newDate.getMonth() + 1);
    const dd = pad(newDate.getDate());
    const datePart = `${yyyy}-${mm}-${dd}`;
    if (includeTime) {
      onChange(`${datePart} ${selectedTime}`);
    } else {
      onChange(datePart);
    }
  };

  const handleTimeChange = (newTime: string) => {
    if (!selectedDate) {
      const today = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const datePart = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      onChange(`${datePart} ${newTime}`);
    } else {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const datePart = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
      onChange(`${datePart} ${newTime}`);
    }
  };

  const handleSetNow = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (includeTime) {
      onChange(`${dateStr} ${timeStr}`);
    } else {
      onChange(dateStr);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={`w-full justify-start text-left font-normal text-xs h-9 bg-white border-slate-200 hover:bg-slate-50 ${!value ? 'text-slate-400' : 'text-slate-800 font-medium'}`}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{formatDisplay()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-white border-slate-200 shadow-xl rounded-2xl z-50" align="start">
          <div className="space-y-3">
            {/* Calendar */}
            <ShadcnCalendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDate}
              className="rounded-lg border border-slate-100 p-2"
            />

            {/* Time controls */}
            {includeTime && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-600">Time:</span>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="h-7 text-xs w-28 bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="flex items-center gap-1">
                  {['08:00', '12:00', '17:00'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTimeChange(t)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-medium text-slate-600 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { onChange(''); setOpen(false); }}
                className="text-[11px] text-slate-500 h-7 px-2"
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSetNow}
                className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white h-7 px-3"
              >
                Set Current Time
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function TransactionEncodingPage() {
  const { user } = useAuthStore();
  const { records, subscribeTransactions, addTransaction, bulkAddTransactions, updateTransaction, deleteTransaction, clearAllTransactions } = useTransactionStore();

  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);



  // Form fields state (All optional)
  const [formData, setFormData] = useState<Partial<TransactionRecord>>({
    no: '',
    dtn: '',
    receivedDateTime: '',
    preparedDateTime: '',
    requestorContact: '',
    barangay: '',
    municipality: '',
    particulars: '',
    payee: '',
    amount: undefined,
    dateProcessed: '',
    receivedByNameSignature: '',
    receivedByDateTime: '',
    remarks: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'no-asc' | 'newest' | 'oldest' | 'amount-high' | 'amount-low'>('no-asc');

  // Pagination states (20 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMunicipality, sortBy]);

  // Modal states
  const [viewRecord, setViewRecord] = useState<TransactionRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<TransactionRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMsg, setModalMsg] = useState({ title: '', desc: '' });

  // Excel Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<Partial<TransactionRecord>[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeTransactions(user.id);
    return () => unsub();
  }, [subscribeTransactions, user?.id]);

  const handleInputChange = (field: keyof TransactionRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-increment NO helper: returns count + 1 (or max numeric NO + 1)
  const getNextRecordNo = () => {
    if (!records || records.length === 0) return '1';
    let maxNum = 0;
    for (const r of records) {
      if (r.no) {
        const parsed = parseInt(r.no.replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
    return maxNum > 0 ? String(maxNum + 1) : String(records.length + 1);
  };

  const nextAutoNo = getNextRecordNo();

  // Auto-fill NO field with default next sequence number if blank
  useEffect(() => {
    if (formData.no === undefined || formData.no === '') {
      setFormData(prev => ({ ...prev, no: nextAutoNo }));
    }
  }, [nextAutoNo]);



  // DTN Generator supporting all requested formats (e.g. 1146-32, E-0107, BBB 2026-01)
  const handleAutoGenerateDTNFormat = (formatStyle: '6digit' | 'prefix' | 'officeYear') => {
    const year = new Date().getFullYear();
    let generatedDTN = '';

    if (formatStyle === '6digit') {
      // Sample style: 1146-32 (6 digits with dash)
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(10 + Math.random() * 90);
      generatedDTN = `${part1}-${part2}`;
    } else if (formatStyle === 'prefix') {
      // Sample style: E-0107 (Prefix + dash + numbers)
      const prefixLetter = ['A', 'B', 'C', 'E', 'R', 'T'][Math.floor(Math.random() * 6)];
      const numPart = Math.floor(100 + Math.random() * 900).toString().padStart(4, '0');
      generatedDTN = `${prefixLetter}-${numPart}`;
    } else {
      // Sample style: BBB 2026-01 (Office code + Year + sequence)
      const officePrefixes = ['OPG', 'BBB', 'VGO', 'PAS', 'PTO'];
      const prefix = officePrefixes[Math.floor(Math.random() * officePrefixes.length)];
      const seq = Math.floor(1 + Math.random() * 99).toString().padStart(2, '0');
      generatedDTN = `${prefix} ${year}-${seq}`;
    }

    const noVal = formData.no !== undefined && formData.no !== '' ? formData.no : nextAutoNo;
    setFormData(prev => ({ ...prev, dtn: generatedDTN, no: noVal }));
  };

  // 3 Payee inputs state
  const [payeeInputs, setPayeeInputs] = useState<[string, string, string]>(['', '', '']);
  const [editPayeeInputs, setEditPayeeInputs] = useState<[string, string, string]>(['', '', '']);

  const handlePayeeInputChange = (index: number, val: string) => {
    const updated: [string, string, string] = [...payeeInputs];
    updated[index] = val;
    setPayeeInputs(updated);
    const combined = updated.map(p => p.trim()).filter(Boolean).join('\n');
    handleInputChange('payee', combined);
  };

  const handleEditPayeeInputChange = (index: number, val: string) => {
    if (!editingRecord) return;
    const updated: [string, string, string] = [...editPayeeInputs];
    updated[index] = val;
    setEditPayeeInputs(updated);
    const combined = updated.map(p => p.trim()).filter(Boolean).join('\n');
    setEditingRecord({ ...editingRecord, payee: combined });
  };

  const openEditModal = (r: TransactionRecord) => {
    const payeesList = r.payee ? r.payee.split('\n') : [];
    setEditPayeeInputs([
      payeesList[0] || '',
      payeesList[1] || '',
      payeesList[2] || '',
    ]);
    setEditingRecord(r);
  };

  const handleResetForm = () => {
    setPayeeInputs(['', '', '']);
    setFormData({
      no: '',
      dtn: '',
      receivedDateTime: '',
      preparedDateTime: '',
      requestorContact: '',
      barangay: '',
      municipality: '',
      particulars: '',
      payee: '',
      amount: undefined,
      dateProcessed: '',
      receivedByNameSignature: '',
      receivedByDateTime: '',
      remarks: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNo = formData.no !== undefined && formData.no.trim() !== '' ? formData.no.trim() : nextAutoNo;

    await addTransaction({
      no: finalNo,
      dtn: formData.dtn || undefined,
      receivedDateTime: formData.receivedDateTime || undefined,
      preparedDateTime: formData.preparedDateTime || undefined,
      requestorContact: formData.requestorContact || undefined,
      barangay: formData.barangay || undefined,
      municipality: formData.municipality || undefined,
      particulars: formData.particulars || undefined,
      payee: formData.payee || undefined,
      amount: formData.amount !== undefined && !isNaN(Number(formData.amount)) ? Number(formData.amount) : undefined,
      dateProcessed: formData.dateProcessed || undefined,
      receivedByNameSignature: formData.receivedByNameSignature || undefined,
      receivedByDateTime: formData.receivedByDateTime || undefined,
      remarks: formData.remarks || undefined,
      encodedBy: user?.name || 'User Staff',
      encodedById: user?.id || 'usr-1',
      office: user?.office || 'OPG Office',
    });

    handleResetForm();
    setShowNewModal(false);
    setModalMsg({
      title: 'Transaction Encoded! 🎉',
      desc: `Record #${finalNo} has been saved successfully to the system.`,
    });
    setShowSuccessModal(true);
    try {
      sileo.success({
        title: 'Transaction Encoded! 🎉',
        description: `Record #${finalNo} saved successfully.`,
      });
    } catch (e) {}
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    await updateTransaction({
      ...editingRecord,
      amount: editingRecord.amount !== undefined && !isNaN(Number(editingRecord.amount)) ? Number(editingRecord.amount) : undefined,
    });

    const recTitle = editingRecord.dtn || editingRecord.no || 'Record';
    setEditingRecord(null);
    setModalMsg({
      title: 'Record Updated! ✨',
      desc: `Transaction details for ${recTitle} have been updated.`,
    });
    setShowSuccessModal(true);
    try {
      sileo.success({
        title: 'Record Updated! ✨',
        description: `${recTitle} updated successfully.`,
      });
    } catch (e) {}
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteTransaction(deletingId);
      setDeletingId(null);
      try {
        sileo.success({
          title: 'Record Deleted 🗑️',
          description: 'Transaction record removed.',
        });
      } catch (e) {}
    }
  };

  // ── EXCEL IMPORT HELPER ──────────────────────────────────────────────────
  const cleanStr = (s: any) =>
    String(s ?? '')
      .toLowerCase()
      .replace(/[\r\n]+/g, ' ')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Format Date objects or values coming from Excel into clean readable strings
  const formatExcelCellValue = (val: any, fieldKey: keyof TransactionRecord): string | number | undefined => {
    if (val === null || val === undefined || val === '') return undefined;

    // Handle JS Date objects created by XLSX cellDates: true
    if (val instanceof Date || (typeof val === 'object' && val && 'getTime' in val)) {
      const d = new Date(val);
      if (isNaN(d.getTime())) return undefined;

      const year = d.getFullYear();
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      const timeStr = `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;

      // Time-only cell in Excel (stored relative to year 1899/1900)
      if (year <= 1900) {
        return timeStr;
      }

      // Date or Date+Time cell
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      if (hours !== 0 || d.getMinutes() !== 0) {
        return `${dateStr} ${timeStr}`;
      }
      return dateStr;
    }

    // Number conversion for amount
    if (fieldKey === 'amount') {
      const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
      return isNaN(num) ? undefined : num;
    }

    return String(val).trim();
  };

  // Map clean header tokens to system field keys
  const resolveColumnField = (rawHeader: any): keyof TransactionRecord | undefined => {
    const c = cleanStr(rawHeader);
    if (!c) return undefined;

    if (c === 'no' || c === 'no.' || c.startsWith('no ') || c.endsWith(' no') || c === 'item no' || c === 'record no') {
      return 'no';
    }
    if (c.includes('dtn') || c.includes('tracking')) {
      return 'dtn';
    }
    if (c.includes('received date') || c.includes('date received') || c === 'received date time' || c === 'received time') {
      return 'receivedDateTime';
    }
    if (c.includes('prepared date') || c.includes('date prepared') || c === 'prepared date time' || c === 'prepared time') {
      return 'preparedDateTime';
    }
    if (c.includes('requestor') || c.includes('contact')) {
      return 'requestorContact';
    }
    if (c.includes('barangay') || c === 'brgy') {
      return 'barangay';
    }
    if (c.includes('municipality')) {
      return 'municipality';
    }
    if (c.includes('particular')) {
      return 'particulars';
    }
    if (c.includes('payee')) {
      return 'payee';
    }
    if (c.includes('amount')) {
      return 'amount';
    }
    if (c.includes('date processed') || c.includes('processed date')) {
      return 'dateProcessed';
    }
    if (c.includes('received by name') || c.includes('received by signature') || c === 'received by') {
      return 'receivedByNameSignature';
    }
    if (c.includes('received by date') || c.includes('received by time')) {
      return 'receivedByDateTime';
    }
    if (c.includes('remark') || c.includes('note') || c.includes('comment')) {
      return 'remarks';
    }

    return undefined;
  };

  const parseExcelFile = (file: File) => {
    setImportError('');
    setImportRows([]);
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (raw.length < 2) {
          setImportError('The Excel file appears to be empty or has no data rows.');
          return;
        }

        // Find the BEST Header Row (scan top 10 rows for row with most recognized column fields)
        let headerRowIndex = 0;
        let maxMappedCount = 0;
        let bestMapping: Record<number, keyof TransactionRecord> = {};

        for (let rIdx = 0; rIdx < Math.min(10, raw.length); rIdx++) {
          const row = raw[rIdx];
          if (!Array.isArray(row)) continue;

          const currentMapping: Record<number, keyof TransactionRecord> = {};
          let mappedCount = 0;

          row.forEach((cellVal, colIdx) => {
            const field = resolveColumnField(cellVal);
            if (field && !Object.values(currentMapping).includes(field)) {
              currentMapping[colIdx] = field;
              mappedCount++;
            }
          });

          if (mappedCount > maxMappedCount) {
            maxMappedCount = mappedCount;
            headerRowIndex = rIdx;
            bestMapping = currentMapping;
          }
        }

        if (maxMappedCount === 0) {
          setImportError(
            'No matching column headers found. Please ensure your Excel file contains column titles like: NO., DTN, RECEIVED DATE TIME, PREPARED DATE TIME, REQUESTOR, BARANGAY, MUNICIPALITY, PARTICULARS, PAYEE, AMOUNT.'
          );
          return;
        }

        // Find column indices for key fields
        let noColIdx: number = 0;
        let receivedColIdx: number = 2;
        let preparedColIdx: number = 3;
        let requestorColIdx: number = 4;
        let particularsColIdx: number = 7;
        let payeeColIdx: number = 8;
        let amountColIdx: number = 11;

        Object.entries(bestMapping).forEach(([colIdxStr, fieldKey]) => {
          const idx = Number(colIdxStr);
          if (fieldKey === 'no') noColIdx = idx;
          if (fieldKey === 'receivedDateTime') receivedColIdx = idx;
          if (fieldKey === 'preparedDateTime') preparedColIdx = idx;
          if (fieldKey === 'requestorContact') requestorColIdx = idx;
          if (fieldKey === 'particulars') particularsColIdx = idx;
          if (fieldKey === 'payee') payeeColIdx = idx;
          if (fieldKey === 'amount') amountColIdx = idx;
        });

        // Helper to check if a cell contains a sub-row time value (e.g. 1:30, 9:30, 4:05 or 1899 Date object)
        const isTimeOnlyVal = (val: any): boolean => {
          if (val === null || val === undefined || val === '') return false;
          if (val instanceof Date || (typeof val === 'object' && val && 'getTime' in val)) {
            const y = new Date(val).getFullYear();
            return y <= 1900;
          }
          const str = String(val).trim();
          return /^\d{1,2}:\d{2}(\s*(AM|PM|am|pm))?$/.test(str);
        };

        // 1. Find the last data row in Excel (any non-empty cell in columns A..N)
        let lastDataRowIndex = headerRowIndex;
        for (let rIdx = raw.length - 1; rIdx > headerRowIndex; rIdx--) {
          const row = raw[rIdx];
          if (!Array.isArray(row)) continue;
          const hasAnyCellData = row.some((val) => val !== null && val !== undefined && String(val).trim() !== '');
          if (hasAnyCellData) {
            lastDataRowIndex = rIdx;
            break;
          }
        }

        console.group('📊 EXCEL IMPORT DIAGNOSTICS');
        console.log(`📁 File: ${file.name}`);
        console.log(`📏 Total Rows in Excel Sheet: ${raw.length}`);
        console.log(`📌 Header Row Index: Row ${headerRowIndex + 1}`);
        console.log(`🏁 Last Data Row Index: Row ${lastDataRowIndex + 1}`);
        console.log(`🗺️ Detected Column Mapping:`, bestMapping);

        // 2. Parse 2-row merged pairs strictly from headerRowIndex + 1 to lastDataRowIndex
        const rows: Partial<TransactionRecord>[] = [];
        let recordCount = 0;

        for (let i = headerRowIndex + 1; i <= lastDataRowIndex; i += 2) {
          const rowA = raw[i];
          const rowB = i + 1 < raw.length ? raw[i + 1] : null;

          if (!rowA || !Array.isArray(rowA)) continue;

          // Build primary record from Row A
          const record: Partial<TransactionRecord> = {};

          Object.entries(bestMapping).forEach(([colIdxStr, fieldKey]) => {
            const colIdx = Number(colIdxStr);
            const rawVal = rowA[colIdx];
            const formattedVal = formatExcelCellValue(rawVal, fieldKey);
            if (formattedVal !== undefined) {
              (record as any)[fieldKey] = formattedVal;
            }
          });

          // Merge sub-row fields from Row B (Time part, secondary text)
          if (rowB && Array.isArray(rowB)) {
            Object.entries(bestMapping).forEach(([colIdxStr, fieldKey]) => {
              const colIdx = Number(colIdxStr);
              const rawValB = rowB[colIdx];
              const formattedValB = formatExcelCellValue(rawValB, fieldKey);
              if (formattedValB !== undefined) {
                const existing = (record as any)[fieldKey];
                if (!existing) {
                  (record as any)[fieldKey] = formattedValB;
                } else if (fieldKey === 'receivedDateTime' || fieldKey === 'preparedDateTime' || fieldKey === 'receivedByDateTime') {
                  // Combine Date from Row A + Time from Row B
                  (record as any)[fieldKey] = `${existing} ${formattedValB}`;
                } else if (fieldKey === 'payee' || fieldKey === 'remarks' || fieldKey === 'particulars') {
                  if (String(existing).indexOf(String(formattedValB)) === -1) {
                    (record as any)[fieldKey] = `${existing}\n${formattedValB}`;
                  }
                }
              }
            });
          }

          // Stop if record number exceeds 282 (template rows)
          const noNum = parseInt(String(record.no ?? '').replace(/\D/g, ''), 10);
          if (!isNaN(noNum) && noNum > 282) {
            console.log(`⛔ Stopped parsing at Record #${record.no} (exceeds 282 target)`);
            break;
          }

          rows.push(record);
          recordCount++;
          console.log(`✔ Record #${recordCount} (Excel Rows ${i + 1}-${i + 2}):`, {
            no: record.no,
            dtn: record.dtn,
            receivedDateTime: record.receivedDateTime,
            preparedDateTime: record.preparedDateTime,
            requestor: record.requestorContact,
            payee: record.payee,
            amount: record.amount,
          });
        }

        console.log(`🎯 TOTAL VALID RECORDS PARSED: ${rows.length}`);
        console.groupEnd();

        if (rows.length === 0) {
          setImportError('No valid data rows were found below the header row in this Excel file.');
          return;
        }

        setImportRows(rows);
      } catch (err) {
        console.error('Excel parsing error:', err);
        setImportError('Failed to read the Excel file. Please make sure it is a valid .xlsx or .xls file.');
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
        office: user?.office || 'OPG Office',
      }));

      await bulkAddTransactions(recordsToInsert);

      setShowImportModal(false);
      setImportRows([]);
      setImportFileName('');
      setModalMsg({
        title: 'Import Successful! 📊',
        desc: `${importRows.length} transaction record${importRows.length > 1 ? 's' : ''} imported in one shot!`,
      });
      setShowSuccessModal(true);
      try {
        sileo.success({ title: 'Import Successful! 📊', description: `${importRows.length} records imported.` });
      } catch (e) {}
    } finally {
      setImporting(false);
    }
  };


  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      'No',
      'DTN',
      'Received Date Time',
      'Prepared Date Time',
      'Requestor / Contact',
      'Barangay',
      'Municipality',
      'Particulars',
      'Payee',
      'Amount',
      'Date Processed',
      'Received By',
      'Received By Date Time',
      'Remarks',
      'Encoded By',
      'Created At',
    ];

    const rows = filteredRecords.map(r => [
      `"${r.no || ''}"`,
      `"${r.dtn || ''}"`,
      `"${r.receivedDateTime || ''}"`,
      `"${r.preparedDateTime || ''}"`,
      `"${(r.requestorContact || '').replace(/"/g, '""')}"`,
      `"${r.barangay || ''}"`,
      `"${r.municipality || ''}"`,
      `"${(r.particulars || '').replace(/"/g, '""')}"`,
      `"${(r.payee || '').replace(/"/g, '""')}"`,
      r.amount !== undefined ? r.amount : '',
      `"${r.dateProcessed || ''}"`,
      `"${(r.receivedByNameSignature || '').replace(/"/g, '""')}"`,
      `"${r.receivedByDateTime || ''}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
      `"${r.encodedBy || ''}"`,
      `"${r.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transaction_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering & Sorting
  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (r.no && r.no.toLowerCase().includes(query)) ||
      (r.dtn && r.dtn.toLowerCase().includes(query)) ||
      (r.requestorContact && r.requestorContact.toLowerCase().includes(query)) ||
      (r.payee && r.payee.toLowerCase().includes(query)) ||
      (r.particulars && r.particulars.toLowerCase().includes(query)) ||
      (r.barangay && r.barangay.toLowerCase().includes(query)) ||
      (r.municipality && r.municipality.toLowerCase().includes(query)) ||
      (r.receivedByNameSignature && r.receivedByNameSignature.toLowerCase().includes(query));

    const matchesMunicipality = selectedMunicipality === 'All' || r.municipality === selectedMunicipality;
    return matchesSearch && matchesMunicipality;
  }).sort((a, b) => {
    if (sortBy === 'no-asc') {
      const nA = parseInt(String(a.no ?? '').replace(/\D/g, ''), 10) || 0;
      const nB = parseInt(String(b.no ?? '').replace(/\D/g, ''), 10) || 0;
      return nA - nB;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'amount-high') {
      return (b.amount || 0) - (a.amount || 0);
    }
    if (sortBy === 'amount-low') {
      return (a.amount || 0) - (b.amount || 0);
    }
    return 0;
  });

  // Pagination calculations (20 items per page)
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // KPI computations
  const totalAmount = records.reduce((acc, r) => acc + (r.amount || 0), 0);
  const todayDateStr = new Date().toISOString().split('T')[0];
  const processedToday = records.filter(r => r.dateProcessed === todayDateStr || (r.createdAt && r.createdAt.startsWith(todayDateStr))).length;
  const uniqueMunicipalitiesCount = new Set(records.map(r => r.municipality).filter(Boolean)).size;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="Record of Transaction"
        description="Encode, monitor, and manage transaction logs with full tracking details."
        icon={FileSpreadsheet}
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
              onClick={() => { setImportRows([]); setImportFileName(''); setImportError(''); setShowImportModal(true); }}
              className="border-violet-200 hover:bg-violet-50 text-violet-700 font-medium text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-violet-600" />
              <span>Import Excel</span>
            </Button>
            {records.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearAllDialog(true)}
                className="border-rose-200 hover:bg-rose-50 text-rose-700 font-medium text-xs sm:text-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete All ({records.length})</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowNewModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Transaction</span>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Encoded"
          value={records.length.toString()}
          subtitle="Total transactions logged"
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Total Amount"
          value={formatPeso(totalAmount)}
          subtitle="Sum of transaction values"
          icon={CreditCard}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="Processed Today"
          value={processedToday.toString()}
          subtitle="Entries logged today"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <KpiCard
          title="Municipalities Covered"
          value={uniqueMunicipalitiesCount.toString()}
          subtitle="Active locations"
          icon={MapPin}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW TRANSACTION MODAL */}
      <Dialog open={showNewModal} onOpenChange={(open) => { if (!open) { handleResetForm(); } setShowNewModal(open); }}>
        <DialogContent className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
            <DialogTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              New Transaction Encoding
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              All fields are optional. Fill in the details below and click Save.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] px-6 py-5">
            <form id="new-transaction-form" onSubmit={handleSubmit} className="space-y-5">

                  {/* Section 1: Identification & Timestamps */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200/60">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">1. Document Tracking & Time</h4>
                    </div>
                    {/* Row 1: NO. + DTN side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* NO */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="no" className="text-xs font-semibold text-slate-700">NO. (Record No.)</Label>
                          <span className="text-[10px] text-blue-600 font-mono font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                            Auto: #{nextAutoNo}
                          </span>
                        </div>
                        <Input
                          id="no"
                          placeholder={`Auto #${nextAutoNo}`}
                          value={formData.no || ''}
                          onChange={(e) => handleInputChange('no', e.target.value)}
                          className="text-sm bg-white font-mono font-semibold text-blue-900 border-blue-200/80 focus:border-blue-500"
                        />
                      </div>

                      {/* DTN */}
                      <div className="space-y-1.5">
                        <Label htmlFor="dtn" className="text-xs font-semibold text-slate-700">DTN (Tracking No.)</Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            id="dtn"
                            placeholder="e.g. 1146-32, E-0107, BBB 2026-01"
                            value={formData.dtn || ''}
                            onChange={(e) => handleInputChange('dtn', e.target.value)}
                            className="text-sm bg-white font-mono flex-1"
                          />
                          {/* Compact format preset buttons inline */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAutoGenerateDTNFormat('6digit')}
                              className="px-1.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-mono font-semibold transition-colors"
                              title="Generate 6-digit style e.g. 1146-32"
                            >1146</button>
                            <button
                              type="button"
                              onClick={() => handleAutoGenerateDTNFormat('prefix')}
                              className="px-1.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-mono font-semibold transition-colors"
                              title="Generate prefix style e.g. E-0107"
                            >E-01</button>
                            <button
                              type="button"
                              onClick={() => handleAutoGenerateDTNFormat('officeYear')}
                              className="px-1.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-mono font-semibold transition-colors"
                              title="Generate office year style e.g. BBB 2026-01"
                            >BBB</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Received + Prepared Date pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Received Date &amp; Time</Label>
                        <DateTimePicker
                          value={formData.receivedDateTime}
                          onChange={(val) => handleInputChange('receivedDateTime', val)}
                          placeholder="Select Received Date & Time"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Prepared Date &amp; Time</Label>
                        <DateTimePicker
                          value={formData.preparedDateTime}
                          onChange={(val) => handleInputChange('preparedDateTime', val)}
                          placeholder="Select Prepared Date & Time"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Requestor & Location */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200/60">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">2. Requestor & Location</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Name of Requestor / Contact No */}
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor="requestorContact" className="text-xs font-semibold text-slate-700">Requestor / Contact No.</Label>
                        <Input
                          id="requestorContact"
                          placeholder="Name of Requestor / 09XX-XXX-XXXX"
                          value={formData.requestorContact || ''}
                          onChange={(e) => handleInputChange('requestorContact', e.target.value)}
                          className="text-sm bg-white"
                        />
                      </div>

                      {/* Barangay */}
                      <div className="space-y-1.5">
                        <Label htmlFor="barangay" className="text-xs font-semibold text-slate-700">Barangay</Label>
                        <Input
                          id="barangay"
                          placeholder="e.g. Poblacion"
                          value={formData.barangay || ''}
                          onChange={(e) => handleInputChange('barangay', e.target.value)}
                          className="text-sm bg-white"
                        />
                      </div>

                      {/* Municipality (Shadcn Select Dropdown) */}
                      <div className="space-y-1.5">
                        <Label htmlFor="municipality" className="text-xs font-semibold text-slate-700">Municipality</Label>
                        <Select
                          value={formData.municipality || ''}
                          onValueChange={(val) => handleInputChange('municipality', val)}
                        >
                          <SelectTrigger className="text-sm bg-white border-slate-200">
                            <SelectValue placeholder="Select Bataan Municipality..." />
                          </SelectTrigger>
                          <SelectContent>
                            {BATAAN_MUNICIPALITIES.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Financial & Particulars */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200/60">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">3. Particulars, Payee & Amount</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Particulars */}
                      <div className="space-y-1.5 sm:col-span-3">
                        <Label htmlFor="particulars" className="text-xs font-semibold text-slate-700">Particulars</Label>
                        <Textarea
                          id="particulars"
                          rows={2}
                          placeholder="Describe the nature of the transaction or request..."
                          value={formData.particulars || ''}
                          onChange={(e) => handleInputChange('particulars', e.target.value)}
                          className="text-sm bg-white resize-none"
                        />
                      </div>

                      {/* Payees (Up to 3 Payees / Names) */}
                      <div className="space-y-2 sm:col-span-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            Payee Names (Up to 3 Payees)
                          </Label>
                          <span className="text-[10px] text-slate-400">Multiple payees allowed</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-medium">Payee 1</span>
                            <Input
                              placeholder="Primary Payee Name"
                              value={payeeInputs[0]}
                              onChange={(e) => handlePayeeInputChange(0, e.target.value)}
                              className="text-xs bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-medium">Payee 2 (Optional)</span>
                            <Input
                              placeholder="2nd Payee Name"
                              value={payeeInputs[1]}
                              onChange={(e) => handlePayeeInputChange(1, e.target.value)}
                              className="text-xs bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-medium">Payee 3 (Optional)</span>
                            <Input
                              placeholder="3rd Payee Name"
                              value={payeeInputs[2]}
                              onChange={(e) => handlePayeeInputChange(2, e.target.value)}
                              className="text-xs bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="space-y-1.5">
                        <Label htmlFor="amount" className="text-xs font-semibold text-slate-700">Amount (₱)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.amount !== undefined ? formData.amount : ''}
                          onChange={(e) => handleInputChange('amount', e.target.value === '' ? undefined : e.target.value)}
                          className="text-sm bg-white font-mono"
                        />
                      </div>


                      {/* Date Processed (Shadcn Calendar & Time Picker) */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Date Processed</Label>
                        <DateTimePicker
                          value={formData.dateProcessed}
                          onChange={(val) => handleInputChange('dateProcessed', val)}
                          placeholder="Select Date Processed"
                          includeTime={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Receiving & Remarks */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200/60">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">4. Received By & Remarks</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Received By Name / Signature */}
                      <div className="space-y-1.5">
                        <Label htmlFor="receivedByNameSignature" className="text-xs font-semibold text-slate-700">Received By (Name / Signature)</Label>
                        <Input
                          id="receivedByNameSignature"
                          placeholder="e.g. Maria Santos (Signed)"
                          value={formData.receivedByNameSignature || ''}
                          onChange={(e) => handleInputChange('receivedByNameSignature', e.target.value)}
                          className="text-sm bg-white"
                        />
                      </div>

                      {/* Received By Date & Time (Shadcn Calendar & Time Picker) */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Received Date & Time</Label>
                        <DateTimePicker
                          value={formData.receivedByDateTime}
                          onChange={(val) => handleInputChange('receivedByDateTime', val)}
                          placeholder="Select Received Date & Time"
                        />
                      </div>

                      {/* Remarks */}
                      <div className="space-y-1.5">
                        <Label htmlFor="remarks" className="text-xs font-semibold text-slate-700">Remarks (If Any)</Label>
                        <Input
                          id="remarks"
                          placeholder="Notes or status comments..."
                          value={formData.remarks || ''}
                          onChange={(e) => handleInputChange('remarks', e.target.value)}
                          className="text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>

            </form>
          </div>

          {/* Modal Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetForm}
              className="text-xs text-slate-500 hover:bg-slate-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Clear Form
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { handleResetForm(); setShowNewModal(false); }}
                className="text-xs border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="new-transaction-form"
                size="sm"
                className="bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-semibold px-5 shadow-md text-xs"
              >
                Save Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Log Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">Encoded Transaction History</CardTitle>
              <div className="flex items-center gap-3 mt-0.5">
                <CardDescription className="text-xs text-slate-500">
                  Showing {filteredRecords.length} of {records.length} records
                </CardDescription>
                {records.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowClearAllDialog(true)}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    <span>Delete All Records</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search DTN, Payee, Requestor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs bg-slate-50 border-slate-200 h-9"
                />
              </div>

              {/* Municipality Filter */}
              <div className="min-w-[140px]">
                <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Municipalities</SelectItem>
                    {BATAAN_MUNICIPALITIES.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort selector */}
              <div className="min-w-[130px]">
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-asc">By No. (Ascending)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="amount-high">Highest Amount</SelectItem>
                    <SelectItem value="amount-low">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center px-4">
              <FileSpreadsheet className="w-12 h-12 mb-3 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">No transaction records found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery || selectedMunicipality !== 'All'
                  ? 'Try adjusting your search query or filters to find records.'
                  : 'Start encoding transactions using the form above.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[1600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                    <th className="py-3 px-3">NO.</th>
                    <th className="py-3 px-3">DTN</th>
                    <th className="py-3 px-3">Received Date/Time</th>
                    <th className="py-3 px-3">Prepared Date/Time</th>
                    <th className="py-3 px-3">Requestor / Contact</th>
                    <th className="py-3 px-3">Barangay</th>
                    <th className="py-3 px-3">Municipality</th>
                    <th className="py-3 px-3 min-w-[200px]">Particulars</th>
                    <th className="py-3 px-3 min-w-[160px]">Payee</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Date Processed</th>
                    <th className="py-3 px-3">Received By</th>
                    <th className="py-3 px-3">Rec. By Date/Time</th>
                    <th className="py-3 px-3 min-w-[150px]">Remarks</th>
                    <th className="py-3 px-3 text-right sticky right-0 bg-slate-50 shadow-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* 1. NO. */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {r.no || '—'}
                      </td>

                      {/* 2. DTN */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {r.dtn || '—'}
                      </td>

                      {/* 3. Received Date & Time */}
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {r.receivedDateTime || '—'}
                      </td>

                      {/* 4. Prepared Date & Time */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {r.preparedDateTime || '—'}
                      </td>

                      {/* 5. Requestor / Contact */}
                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {r.requestorContact || '—'}
                      </td>

                      {/* 6. Barangay */}
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {r.barangay || '—'}
                      </td>

                      {/* 7. Municipality */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {r.municipality ? (
                          <Badge variant="outline" className="text-[10px] bg-purple-50 border-purple-200 text-purple-700">
                            {r.municipality}
                          </Badge>
                        ) : '—'}
                      </td>

                      {/* 8. Particulars */}
                      <td className="py-3 px-3 text-slate-700 max-w-[240px] truncate" title={r.particulars}>
                        {r.particulars || '—'}
                      </td>

                      {/* 9. Payee (Renders multiple payees with numbering if > 1) */}
                      <td className="py-3 px-3">
                        {r.payee ? (
                          <div className="text-slate-700 space-y-0.5">
                            {r.payee.split('\n').filter(Boolean).map((p, idx, arr) => (
                              <div key={idx} className="flex items-center gap-1 max-w-[180px] truncate" title={p}>
                                {arr.length > 1 && <span className="text-[9px] font-bold text-slate-400 font-mono">{idx + 1}.</span>}
                                <span className="truncate font-medium">{p}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* 10. Amount */}
                      <td className="py-3 px-3 font-semibold text-emerald-700 font-mono whitespace-nowrap">
                        {formatPeso(r.amount)}
                      </td>

                      {/* 11. Date Processed */}
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {r.dateProcessed ? (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 border-blue-200 text-blue-700">
                            {r.dateProcessed}
                          </Badge>
                        ) : '—'}
                      </td>

                      {/* 12. Received By */}
                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {r.receivedByNameSignature || '—'}
                      </td>

                      {/* 13. Received By Date & Time */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {r.receivedByDateTime || '—'}
                      </td>

                      {/* 14. Remarks */}
                      <td className="py-3 px-3 text-slate-500 italic max-w-[180px] truncate" title={r.remarks}>
                        {r.remarks || '—'}
                      </td>

                      {/* 15. Actions (Sticky column) */}
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
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page number buttons */}
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

                {/* Next */}
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

      {/* VIEW DETAILS MODAL */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent className="max-w-xl bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
              <span>Transaction Details</span>
              <Badge className="bg-blue-600 text-white font-mono text-xs">
                {viewRecord?.dtn || viewRecord?.no || 'Record'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Encoded by {viewRecord?.encodedBy || 'Staff'} · {viewRecord?.createdAt ? new Date(viewRecord.createdAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>

          {viewRecord && (
            <div className="space-y-4 py-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Record No.</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{viewRecord.no || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">DTN</p>
                  <p className="font-mono font-semibold text-blue-700 mt-0.5">{viewRecord.dtn || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Received Date & Time</p>
                  <p className="font-medium text-slate-800 mt-0.5">{viewRecord.receivedDateTime || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Prepared Date & Time</p>
                  <p className="font-medium text-slate-800 mt-0.5">{viewRecord.preparedDateTime || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Requestor / Contact</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{viewRecord.requestorContact || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Location</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {[viewRecord.barangay, viewRecord.municipality].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Particulars</p>
                  <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">{viewRecord.particulars || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Payee</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{viewRecord.payee || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Amount</p>
                    <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">{formatPeso(viewRecord.amount)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Date Processed</p>
                  <p className="font-medium text-slate-800 mt-0.5">{viewRecord.dateProcessed || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Received By (Signature)</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{viewRecord.receivedByNameSignature || '—'}</p>
                  {viewRecord.receivedByDateTime && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{viewRecord.receivedByDateTime}</p>
                  )}
                </div>
              </div>

              {viewRecord.remarks && (
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-amber-900">
                  <p className="text-[10px] font-bold uppercase text-amber-700">Remarks</p>
                  <p className="mt-0.5 italic">{viewRecord.remarks}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setViewRecord(null)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL WITH SHADCN CALENDARS */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">Edit Transaction Record</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update details for {editingRecord?.dtn || editingRecord?.no || 'this record'}
            </DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <form onSubmit={handleUpdateRecord} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">NO.</Label>
                  <Input
                    value={editingRecord.no || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, no: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">DTN</Label>
                  <Input
                    value={editingRecord.dtn || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, dtn: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Received Date & Time</Label>
                  <DateTimePicker
                    value={editingRecord.receivedDateTime}
                    onChange={val => setEditingRecord({ ...editingRecord, receivedDateTime: val })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Prepared Date & Time</Label>
                  <DateTimePicker
                    value={editingRecord.preparedDateTime}
                    onChange={val => setEditingRecord({ ...editingRecord, preparedDateTime: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Requestor / Contact</Label>
                  <Input
                    value={editingRecord.requestorContact || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, requestorContact: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Barangay</Label>
                  <Input
                    value={editingRecord.barangay || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, barangay: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Municipality</Label>
                  <Select
                    value={editingRecord.municipality || ''}
                    onValueChange={val => setEditingRecord({ ...editingRecord, municipality: val })}
                  >
                    <SelectTrigger className="text-xs bg-white">
                      <SelectValue placeholder="Select Municipality..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BATAAN_MUNICIPALITIES.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Particulars</Label>
                <Textarea
                  rows={2}
                  value={editingRecord.particulars || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, particulars: e.target.value })}
                  className="text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                {/* 3 Payees */}
                <div className="space-y-1.5 sm:col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> Payees (Up to 3 Payees)
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Payee 1"
                      value={editPayeeInputs[0]}
                      onChange={e => handleEditPayeeInputChange(0, e.target.value)}
                      className="text-xs bg-white"
                    />
                    <Input
                      placeholder="Payee 2 (Optional)"
                      value={editPayeeInputs[1]}
                      onChange={e => handleEditPayeeInputChange(1, e.target.value)}
                      className="text-xs bg-white"
                    />
                    <Input
                      placeholder="Payee 3 (Optional)"
                      value={editPayeeInputs[2]}
                      onChange={e => handleEditPayeeInputChange(2, e.target.value)}
                      className="text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Amount (₱)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingRecord.amount !== undefined ? editingRecord.amount : ''}
                    onChange={e => setEditingRecord({ ...editingRecord, amount: e.target.value === '' ? undefined : Number(e.target.value) })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Date Processed</Label>
                <DateTimePicker
                  value={editingRecord.dateProcessed}
                  onChange={val => setEditingRecord({ ...editingRecord, dateProcessed: val })}
                  includeTime={false}
                />
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Received By (Name/Signature)</Label>
                  <Input
                    value={editingRecord.receivedByNameSignature || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, receivedByNameSignature: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Received Date & Time</Label>
                  <DateTimePicker
                    value={editingRecord.receivedByDateTime}
                    onChange={val => setEditingRecord({ ...editingRecord, receivedByDateTime: val })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Remarks</Label>
                <Input
                  value={editingRecord.remarks || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, remarks: e.target.value })}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingRecord(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 text-xs">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* IMPORT EXCEL MODAL */}
      <Dialog open={showImportModal} onOpenChange={(open) => { if (!open) { setImportRows([]); setImportFileName(''); setImportError(''); } setShowImportModal(open); }}>
        <DialogContent className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-violet-50/60 to-purple-50/40">
            <DialogTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-600" />
              Import Transactions from Excel
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Upload an Excel file (.xlsx / .xls). Only columns that match the system fields will be imported — extra columns are ignored.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[65vh] px-6 py-5 space-y-5">
            {/* Column mapping reference */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Recognized Column Headers (case-insensitive)</p>
              <div className="flex flex-wrap gap-1.5">
                {['NO.', 'DTN', 'Received Date Time', 'Prepared Date Time', 'Requestor', 'Barangay', 'Municipality', 'Particulars', 'Payee', 'Amount', 'Date Processed', 'Received By', 'Received By Date Time', 'Remarks'].map(col => (
                  <span key={col} className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-mono rounded-md border border-violet-200">{col}</span>
                ))}
              </div>
            </div>

            {/* Drag-and-Drop Upload Zone */}
            <div
              className="border-2 border-dashed border-violet-300 rounded-xl p-8 text-center cursor-pointer hover:bg-violet-50/50 transition-colors group"
              onClick={() => importInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-violet-50'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('bg-violet-50')}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-violet-50');
                const file = e.dataTransfer.files[0];
                if (file) parseExcelFile(file);
              }}
            >
              <input
                ref={importInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) parseExcelFile(f); e.target.value = ''; }}
              />
              <FileUp className="w-10 h-10 text-violet-400 mx-auto mb-3 group-hover:text-violet-500 transition-colors" />
              {importFileName ? (
                <div>
                  <p className="text-sm font-semibold text-violet-700">{importFileName}</p>
                  <p className="text-xs text-slate-500 mt-1">Click or drop another file to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-700">Drag & drop your Excel file here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse — supports .xlsx and .xls</p>
                </div>
              )}
            </div>

            {/* Error message */}
            {importError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-xs font-medium">{importError}</p>
              </div>
            )}

            {/* Preview Table */}
            {importRows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Preview — <span className="text-violet-600">{importRows.length} row{importRows.length > 1 ? 's' : ''}</span> ready to import
                  </p>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 border-emerald-200 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Columns Mapped
                  </Badge>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-[11px] text-left min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                        {['NO.', 'DTN', 'Requestor', 'Barangay', 'Municipality', 'Particulars', 'Payee', 'Amount', 'Date Processed', 'Received By', 'Remarks'].map(h => (
                          <th key={h} className="py-2 px-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importRows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-slate-700">{row.no || '—'}</td>
                          <td className="py-2 px-3 font-mono text-blue-700">{row.dtn || '—'}</td>
                          <td className="py-2 px-3 max-w-[130px] truncate">{row.requestorContact || '—'}</td>
                          <td className="py-2 px-3">{row.barangay || '—'}</td>
                          <td className="py-2 px-3">{row.municipality ? <Badge variant="outline" className="text-[9px] bg-purple-50 border-purple-200 text-purple-700">{row.municipality}</Badge> : '—'}</td>
                          <td className="py-2 px-3 max-w-[160px] truncate">{row.particulars || '—'}</td>
                          <td className="py-2 px-3 max-w-[120px] truncate">{row.payee || '—'}</td>
                          <td className="py-2 px-3 font-mono text-emerald-700">{row.amount !== undefined ? `₱${row.amount.toLocaleString()}` : '—'}</td>
                          <td className="py-2 px-3">{row.dateProcessed || '—'}</td>
                          <td className="py-2 px-3 max-w-[120px] truncate">{row.receivedByNameSignature || '—'}</td>
                          <td className="py-2 px-3 max-w-[120px] truncate italic text-slate-500">{row.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importRows.length > 10 && (
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-center">
                      Showing first 10 of {importRows.length} rows — all will be imported
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">Only matching columns will be saved. Extra Excel columns are ignored.</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowImportModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleImportConfirm}
                disabled={importRows.length === 0 || importing}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-semibold px-5 shadow-md flex items-center gap-1.5"
              >
                {importing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Import {importRows.length > 0 ? `${importRows.length} Records` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this transaction record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)} className="text-xs">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ANIMATED SUCCESS POPUP MODAL */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-sm bg-white p-6 rounded-3xl text-center shadow-2xl border border-slate-100 outline-none overflow-hidden sm:max-w-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className="flex flex-col items-center py-2"
          >
            {/* Animated Glowing Icon Ring */}
            <div className="relative mb-4 mt-2">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 15 }}
                className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center relative z-10 shadow-inner"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-600 stroke-[2.2]" />
              </motion.div>
              {/* Outer glowing pulse ring */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-emerald-400/40 z-0"
              />
            </div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              {modalMsg.title || 'Success!'}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="text-xs text-slate-500 mt-1.5 max-w-[250px] leading-relaxed"
            >
              {modalMsg.desc || 'The operation was completed successfully.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="mt-6 w-full"
            >
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs h-10 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Done & Continue
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* CLEAR ALL CONFIRMATION MODAL */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Clear All Encoded History?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete all {records.length} transaction records? This will clear the table so you can start fresh or re-import your Excel file cleanly.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowClearAllDialog(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await clearAllTransactions(user?.id || '');
                setShowClearAllDialog(false);
                try {
                  sileo.success({ title: 'History Cleared 🗑️', description: 'All records removed.' });
                } catch (e) {}
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

