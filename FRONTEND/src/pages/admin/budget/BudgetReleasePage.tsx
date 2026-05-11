import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PlusCircle, Wallet, CheckCircle2, AlertTriangle,
  Trash2, Search, FileOutput, Upload, FileSpreadsheet, Pencil, CalendarIcon, Download,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { db } from '@/backend/firebase';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, getDoc, writeBatch, updateDoc
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { formatPeso } from '@/data/mockData';
import { ppaFundMapping } from '@/data/ppaFundMapping';
import type { BudgetRelease, StatementRecord, PPARecord } from '@/types';
import { ChevronsUpDown } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { format } from 'date-fns';

// â”€â”€ Color palette cycling for dynamically-detected fund types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLOR_PALETTE = [
  { bg: 'bg-blue-50',    text: 'text-blue-700',    badgeBg: 'bg-blue-100',    badgeText: 'text-blue-700',    border: 'border-blue-200' },
  { bg: 'bg-violet-50',  text: 'text-violet-700',  badgeBg: 'bg-violet-100',  badgeText: 'text-violet-700',  border: 'border-violet-200' },
  { bg: 'bg-amber-50',   text: 'text-amber-700',   badgeBg: 'bg-amber-100',   badgeText: 'text-amber-700',   border: 'border-amber-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-rose-50',    text: 'text-rose-700',    badgeBg: 'bg-rose-100',    badgeText: 'text-rose-700',    border: 'border-rose-200' },
];

// â”€â”€ Fund section derived from Statement Records â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  dateReleased: '',
};

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function BudgetReleasePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Helper functions for number formatting with commas
  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Split into integer and decimal parts
    const parts = cleanValue.split('.');
    
    // Add commas to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted value (limit to 2 decimal places)
    return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
  };

  const parseFormattedNumber = (value: string): string => {
    // Remove commas for storage
    return value.replace(/,/g, '');
  };

  const [releases, setReleases]                 = useState<BudgetRelease[]>([]);
  const [statementRecords, setStatementRecords] = useState<StatementRecord[]>([]);
  const [ppaRecords, setPpaRecords]             = useState<PPARecord[]>([]);
  const [isLoading, setIsLoading]               = useState(true);
  const [userAllowedFunds, setUserAllowedFunds] = useState<string[] | null>(null); // null = all allowed

  const [showForm, setShowForm]     = useState(false);
  const [fppOpen, setFppOpen]       = useState(false); // for fpp combobox
  const [fppQuery, setFppQuery]     = useState('');    // custom search for fpp combo
  const [fppLimit, setFppLimit]     = useState(25);    // optimize large renders
  const [fundOpen, setFundOpen]     = useState(false); // for fund combobox
  const [form, setForm]             = useState({ ...emptyForm, department: user?.office ?? '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch]         = useState('');
  const [filterFund, setFilterFund] = useState<string>('All');
  
  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BudgetRelease | null>(null);
  const [editForm, setEditForm] = useState({
    fppCode: '',
    accountCode: '',
    payee: '',
    office: '',
    particulars: '',
    amount: '',
    dateReleased: '',
  });
  const [updating, setUpdating] = useState(false);
  
  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  
  // Delete import batch confirmation states
  const [showDeleteBatchDialog, setShowDeleteBatchDialog] = useState(false);
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);
  const [deletingBatchInfo, setDeletingBatchInfo] = useState<{ count: number; sheetName: string } | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  // Automatically reset the render limit to keep performance pristine whenever search/fund changes
  useEffect(() => { setFppLimit(25); }, [fppQuery, activeSection]);

  const handleFppScroll = (e: any) => {
    const target = e.target as HTMLElement;
    // looser threshold of 50px so it proactively triggers during momentum scrolls
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (bottom && fppLimit < fppOptions.length) {
      setFppLimit(prev => prev + 25);
    }
  };

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
  }, [releases, filterFund, search, isAdmin, user?.id]);

  // Pagination calculations
  const totalPages = Math.ceil(displayed.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = displayed.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterFund, search]);

  const handleSubmit = async () => {
    // All fields are now optional - no validation required
    const amount = parseFloat(form.amount) || 0;

    const section = fundSections.find(s => s.key === form.fundTypeKey);
    if (!section && fundSections.length > 0) {
      // Use first available fund section if none selected
      const defaultSection = fundSections[0];
      setForm(p => ({ ...p, fundTypeKey: defaultSection.key }));
      return sileo.error({ title: 'Please select a fund type' });
    }

    const selectedSection = section || fundSections[0];

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'budget_releases'), {
        fundType:      selectedSection.key,
        fundLabel:     selectedSection.shortLabel,
        fppCode:       form.fppCode.trim().toUpperCase(),
        department:    form.department.trim(),
        amount,
        accountCode:   form.accountCode.trim(),
        payee:         form.payee.trim(),
        purpose:       form.purpose.trim(),
        dateReleased:  form.dateReleased ? new Date(form.dateReleased).toISOString() : '',
        submittedBy:   user?.name ?? user?.email ?? 'Unknown',
        submittedById: user?.id ?? '',
        office:        user?.office ?? '',
        createdAt:     new Date().toISOString(),
      });
      sileo.success({ 
        title: 'Budget Entry Recorded', 
        description: amount > 0 ? `${formatPeso(amount)} logged under ${selectedSection.shortLabel}.` : 'Entry saved successfully.'
      });
      setForm(p => ({ ...emptyForm, department: p.department, fundTypeKey: p.fundTypeKey }));
      setShowForm(false);
    } catch (err: any) {
      sileo.error({ title: 'Error', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingEntryId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingEntryId) return;

    try {
      await deleteDoc(doc(db, 'budget_releases', deletingEntryId));
      sileo.success({ title: 'Entry Deleted', description: 'Budget entry has been removed.' });
      setShowDeleteDialog(false);
      setDeletingEntryId(null);
    } catch (err: any) {
      sileo.error({ title: 'Delete Failed', description: err.message });
    }
  };

  // Handle edit
  const handleEdit = (entry: BudgetRelease) => {
    setEditingEntry(entry);
    setEditForm({
      fppCode: entry.fppCode || '',
      accountCode: entry.accountCode || '',
      payee: entry.payee || '',
      office: entry.department || '',
      particulars: entry.purpose || '',
      amount: entry.amount?.toString() || '',
      dateReleased: (entry as any).dateReleased ? new Date((entry as any).dateReleased).toISOString().split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    // All fields are now optional - no validation required
    const amount = parseFloat(editForm.amount) || 0;

    setUpdating(true);
    try {
      const updateData: any = {
        fppCode: editForm.fppCode.trim().toUpperCase(),
        accountCode: editForm.accountCode.trim(),
        payee: editForm.payee.trim(),
        department: editForm.office.trim(),
        purpose: editForm.particulars.trim(),
        amount,
        dateReleased: editForm.dateReleased ? new Date(editForm.dateReleased).toISOString() : '',
      };

      await updateDoc(doc(db, 'budget_releases', editingEntry.id), updateData);
      
      sileo.success({ title: 'Entry Updated', description: 'Budget entry has been updated successfully.' });
      setShowEditModal(false);
      setEditingEntry(null);
    } catch (err: any) {
      sileo.error({ title: 'Update Failed', description: err.message });
    } finally {
      setUpdating(false);
    }
  };

  // Handle file selection and read sheets
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      setSelectedFile(file);
      setAvailableSheets(workbook.SheetNames);
      setSelectedSheet(workbook.SheetNames[0] || '');
      setShowImportModal(true);
    } catch (err: any) {
      sileo.error({ title: 'File Read Error', description: err.message });
    }
  };

  // Import selected sheet
  const handleImport = async () => {
    if (!selectedFile || !selectedSheet) return;

    setImporting(true);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true, dateNF: 'yyyy-mm-dd' });
      const worksheet = workbook.Sheets[selectedSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' }) as any[];

      if (jsonData.length === 0) {
        sileo.error({ title: 'Empty Sheet', description: 'The selected sheet contains no data.' });
        setImporting(false);
        return;
      }

      const batchId = `import_${Date.now()}_${user?.id}`;
      const batch = writeBatch(db);
      const collectionRef = collection(db, 'budget_releases');
      let importCount = 0;

      for (const row of jsonData) {
        // Extract data from Excel columns
        const fppCode = String(row['FPP'] || row['fpp'] || '').trim();
        const accountCode = String(row['Account Code'] || row['account code'] || row['AccountCode'] || '').trim();
        const payee = String(row['Payee'] || row['payee'] || '').trim();
        const office = String(row['Office'] || row['office'] || user?.office || '').trim();
        const particulars = String(row['Particulars'] || row['particulars'] || row['Purpose'] || '').trim();
        const amount = parseFloat(String(row['Amount'] || row['amount'] || '0').replace(/[^0-9.-]/g, ''));

        // Parse dates - with cellDates: true, XLSX converts dates to Date objects
        const dateStr = row['Date'] || row['date'] || '';
        let createdAt = new Date().toISOString();
        if (dateStr) {
          try {
            // If it's already a Date object from XLSX
            if (dateStr instanceof Date) {
              createdAt = dateStr.toISOString();
            } else if (typeof dateStr === 'string' && dateStr.trim()) {
              const parsedDate = new Date(dateStr);
              if (!isNaN(parsedDate.getTime())) {
                createdAt = parsedDate.toISOString();
              }
            }
          } catch (e) {
            console.error('Date parsing error:', e);
          }
        }

        const dateReleasedStr = row['Date Released'] || row['date released'] || row['DateReleased'] || '';
        let dateReleased = '';
        if (dateReleasedStr) {
          try {
            // If it's already a Date object from XLSX
            if (dateReleasedStr instanceof Date) {
              dateReleased = dateReleasedStr.toISOString();
            } else if (typeof dateReleasedStr === 'string' && dateReleasedStr.trim()) {
              const parsedDate = new Date(dateReleasedStr);
              if (!isNaN(parsedDate.getTime())) {
                dateReleased = parsedDate.toISOString();
              }
            }
          } catch (e) {
            console.error('Date Released parsing error:', e);
          }
        }

        // Skip rows without required data
        if (!fppCode || !amount || amount <= 0) continue;

        // Try to match fund type
        let fundType = '';
        let fundLabel = '';
        
        const sheetNameUpper = selectedSheet.toUpperCase();
        for (const section of fundSections) {
          const sectionKey = section.key.toUpperCase();
          const sectionLabel = section.shortLabel.toUpperCase();
          
          if (sheetNameUpper.includes('5%') && (sectionLabel.includes('5%') || sectionKey.includes('5%'))) {
            fundType = section.key;
            fundLabel = section.shortLabel;
            break;
          } else if (sheetNameUpper.includes('20%') && (sectionLabel.includes('20%') || sectionKey.includes('20%'))) {
            fundType = section.key;
            fundLabel = section.shortLabel;
            break;
          } else if (sheetNameUpper.includes('MOOE') && (sectionLabel.includes('MOOE') || sectionKey.includes('MOOE'))) {
            fundType = section.key;
            fundLabel = section.shortLabel;
            break;
          }
        }

        // Default to first fund section if no match
        if (!fundType && fundSections.length > 0) {
          fundType = fundSections[0].key;
          fundLabel = fundSections[0].shortLabel;
        }

        const docRef = doc(collectionRef);
        batch.set(docRef, {
          fundType,
          fundLabel,
          fppCode,
          accountCode,
          payee,
          department: office,
          purpose: particulars,
          amount,
          dateReleased,
          submittedBy: user?.name ?? user?.email ?? 'Unknown',
          submittedById: user?.id ?? '',
          office: user?.office ?? '',
          createdAt,
          batchId,
          sheetName: selectedSheet,
        });

        importCount++;
      }

      await batch.commit();

      sileo.success({
        title: 'Import Successful',
        description: `${importCount} entries imported from "${selectedSheet}"`,
      });

      // Reset
      setShowImportModal(false);
      setSelectedFile(null);
      setAvailableSheets([]);
      setSelectedSheet('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      sileo.error({ title: 'Import Error', description: err.message });
    } finally {
      setImporting(false);
    }
  };

  // Delete imported batch
  const handleDeleteImport = async (batchId: string) => {
    try {
      const batch = writeBatch(db);
      const entriesToDelete = releases.filter(r => (r as any).batchId === batchId);
      
      if (entriesToDelete.length === 0) {
        sileo.error({ title: 'No Entries Found' });
        return;
      }

      entriesToDelete.forEach(entry => {
        batch.delete(doc(db, 'budget_releases', entry.id));
      });

      await batch.commit();

      sileo.success({
        title: 'Import Deleted',
        description: `${entriesToDelete.length} entries removed`,
      });
    } catch (err: any) {
      sileo.error({ title: 'Delete Failed', description: err.message });
    }
  };

  const confirmDeleteBatch = async () => {
    if (!deletingBatchId) return;

    await handleDeleteImport(deletingBatchId);
    setShowDeleteBatchDialog(false);
    setDeletingBatchId(null);
    setDeletingBatchInfo(null);
  };

  // Group releases by import batch
  const importBatches = useMemo(() => {
    const batches = new Map<string, { batchId: string; count: number; sheetName: string; date: string }>();
    
    releases.forEach(r => {
      const batchId = (r as any).batchId;
      if (!batchId) return;
      
      if (!batches.has(batchId)) {
        batches.set(batchId, {
          batchId,
          count: 0,
          sheetName: (r as any).sheetName || 'Imported Data',
          date: r.createdAt,
        });
      }
      batches.get(batchId)!.count++;
    });

    return Array.from(batches.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [releases]);

  // Export to Excel functionality
  const handleExportExcel = () => {
    console.log('Export button clicked!');
    console.log('Displayed entries:', displayed.length);
    
    if (displayed.length === 0) {
      sileo.error({ title: 'No Data', description: 'No entries to export.' });
      return;
    }

    try {
      // Create professional title section
      const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const title = [
        ['BUDGET RELEASE TRACKER'],
        [`Provincial Government of Bataan - ${user?.office || 'Budget Office'}`],
        [`Generated on: ${currentDate} | Total Entries: ${displayed.length}`],
        [], // Empty row for spacing
      ];

      // Professional headers with better descriptions
      const headers = [
        ['Entry Date', 'FPP Code', 'Account Code', 'Payee/Supplier', 'Office/Department', 'Purpose/Particulars', 'Amount (₱)', 'Date Released']
      ];

      // Create data rows with better formatting
      const dataRows = displayed.map((entry) => [
        new Date(entry.createdAt).toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        entry.fppCode || '—',
        entry.accountCode || '—',
        entry.payee || '—',
        entry.department || '—',
        entry.purpose || '—',
        entry.amount || 0,
        (entry as any).dateReleased 
          ? new Date((entry as any).dateReleased).toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: 'numeric' 
            })
          : '—'
      ]);

      // Create summary section
      const totalAmount = displayed.reduce((sum, entry) => sum + (entry.amount || 0), 0);
      const avgAmount = totalAmount / displayed.length;
      
      const summaryRows = [
        [], // Empty row
        ['SUMMARY REPORT'],
        ['Total Entries:', displayed.length, '', '', '', '', '', ''],
        ['Total Amount:', totalAmount, '', '', '', '', '', ''],
        ['Average Amount:', avgAmount, '', '', '', '', '', ''],
        ['Highest Amount:', Math.max(...displayed.map(e => e.amount || 0)), '', '', '', '', '', ''],
        ['Lowest Amount:', Math.min(...displayed.map(e => e.amount || 0)), '', '', '', '', '', ''],
      ];

      const wsData = [...title, ...headers, ...dataRows, ...summaryRows];
      console.log('Creating worksheet with data:', wsData.length, 'rows');
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Enhanced merging for professional layout
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Main title
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Subtitle
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Date info
        { s: { r: dataRows.length + 5, c: 0 }, e: { r: dataRows.length + 5, c: 7 } }, // Summary title
      ];

      // Auto-sizing columns with optimal widths
      const colWidths = [
        { wch: 12 },  // Entry Date
        { wch: 16 },  // FPP Code
        { wch: 16 },  // Account Code
        { wch: 25 },  // Payee/Supplier
        { wch: 22 },  // Office/Department
        { wch: 35 },  // Purpose/Particulars
        { wch: 18 },  // Amount
        { wch: 14 },  // Date Released
      ];

      // Calculate dynamic widths based on content
      displayed.forEach(entry => {
        const fppLen = (entry.fppCode || '').length;
        const accountLen = (entry.accountCode || '').length;
        const payeeLen = (entry.payee || '').length;
        const deptLen = (entry.department || '').length;
        const purposeLen = (entry.purpose || '').length;

        if (fppLen > colWidths[1].wch) colWidths[1].wch = Math.min(fppLen + 2, 20);
        if (accountLen > colWidths[2].wch) colWidths[2].wch = Math.min(accountLen + 2, 20);
        if (payeeLen > colWidths[3].wch) colWidths[3].wch = Math.min(payeeLen + 2, 30);
        if (deptLen > colWidths[4].wch) colWidths[4].wch = Math.min(deptLen + 2, 25);
        if (purposeLen > colWidths[5].wch) colWidths[5].wch = Math.min(purposeLen + 2, 40);
      });

      ws['!cols'] = colWidths;

      // Enhanced styling with modern design
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:H1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
          let cell = ws[cellRef];
          if (!cell) continue;

          // Main title styling
          if (R === 0) {
            cell.s = {
              font: { bold: true, sz: 18, color: { rgb: 'FFFFFF' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              fill: { fgColor: { rgb: '1E40AF' } }, // Deep blue
              border: {
                top: { style: 'thick', color: { rgb: '1E40AF' } },
                bottom: { style: 'thick', color: { rgb: '1E40AF' } },
                left: { style: 'thick', color: { rgb: '1E40AF' } },
                right: { style: 'thick', color: { rgb: '1E40AF' } }
              }
            };
          }
          // Subtitle styling
          else if (R === 1) {
            cell.s = {
              font: { bold: true, sz: 12, color: { rgb: '1E40AF' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              fill: { fgColor: { rgb: 'EFF6FF' } },
              border: {
                top: { style: 'thin', color: { rgb: '93C5FD' } },
                bottom: { style: 'thin', color: { rgb: '93C5FD' } },
                left: { style: 'thin', color: { rgb: '93C5FD' } },
                right: { style: 'thin', color: { rgb: '93C5FD' } }
              }
            };
          }
          // Date info styling
          else if (R === 2) {
            cell.s = {
              font: { sz: 10, color: { rgb: '64748B' }, italic: true },
              alignment: { horizontal: 'center', vertical: 'center' },
              fill: { fgColor: { rgb: 'F8FAFC' } }
            };
          }
          // Header row styling
          else if (R === 4) {
            cell.s = {
              font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              fill: { fgColor: { rgb: '3B82F6' } }, // Blue
              border: {
                top: { style: 'medium', color: { rgb: '1E40AF' } },
                bottom: { style: 'medium', color: { rgb: '1E40AF' } },
                left: { style: 'thin', color: { rgb: '1E40AF' } },
                right: { style: 'thin', color: { rgb: '1E40AF' } }
              }
            };
          }
          // Data rows styling with alternating colors
          else if (R > 4 && R < dataRows.length + 5) {
            const isEvenRow = (R - 5) % 2 === 0;
            cell.s = {
              font: { sz: 10, color: { rgb: '1F2937' } },
              alignment: { 
                horizontal: C === 6 ? 'right' : 'left', 
                vertical: 'center' 
              },
              fill: { fgColor: { rgb: isEvenRow ? 'FFFFFF' : 'F9FAFB' } },
              border: {
                top: { style: 'thin', color: { rgb: 'E5E7EB' } },
                bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
                left: { style: 'thin', color: { rgb: 'E5E7EB' } },
                right: { style: 'thin', color: { rgb: 'E5E7EB' } }
              }
            };
            
            // Amount column special formatting
            if (C === 6 && typeof cell.v === 'number') {
              cell.z = '₱#,##0.00';
              cell.s.font = { 
                ...cell.s.font, 
                bold: true, 
                color: { rgb: cell.v > 100000 ? 'DC2626' : '059669' } // Red for large amounts, green for smaller
              };
            }
          }
          // Summary section styling
          else if (R >= dataRows.length + 5) {
            if (R === dataRows.length + 5) {
              // Summary title
              cell.s = {
                font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: '059669' } }, // Green
                border: {
                  top: { style: 'thick', color: { rgb: '059669' } },
                  bottom: { style: 'thick', color: { rgb: '059669' } },
                  left: { style: 'thick', color: { rgb: '059669' } },
                  right: { style: 'thick', color: { rgb: '059669' } }
                }
              };
            } else {
              // Summary data
              cell.s = {
                font: { bold: C === 1, sz: 10, color: { rgb: '1F2937' } },
                alignment: { horizontal: C === 1 ? 'right' : 'left', vertical: 'center' },
                fill: { fgColor: { rgb: 'F0FDF4' } },
                border: {
                  top: { style: 'thin', color: { rgb: 'BBF7D0' } },
                  bottom: { style: 'thin', color: { rgb: 'BBF7D0' } },
                  left: { style: 'thin', color: { rgb: 'BBF7D0' } },
                  right: { style: 'thin', color: { rgb: 'BBF7D0' } }
                }
              };
              
              // Format numbers in summary
              if (C === 1 && typeof cell.v === 'number') {
                cell.z = cell.v > 1 ? '₱#,##0.00' : '#,##0';
              }
            }
          }
        }
      }

      // Create workbook and export
      console.log('Creating workbook...');
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Budget Releases');
      
      // Add metadata
      wb.Props = {
        Title: 'Budget Release Tracker',
        Subject: 'Budget Release Report',
        Author: user?.name || 'Budget System',
        CreatedDate: new Date()
      };

      const fileName = `Budget_Releases_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 5).replace(':', '')}.xlsx`;
      console.log('Writing file:', fileName);
      
      XLSX.writeFile(wb, fileName);

      sileo.success({ 
        title: 'Export Successful! 📊', 
        description: `${fileName} downloaded with ${displayed.length} entries and summary report.` 
      });
      
      console.log('Export completed successfully!');
      
    } catch (error) {
      console.error('Export error:', error);
      sileo.error({ 
        title: 'Export Failed', 
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
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
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-file-input"
            />
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 text-xs h-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </Button>
          </div>
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

      {/* Live Balance Cards �� dynamically from Statement */}
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
          <div className="flex flex-col gap-3">
            {/* Title and Total Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">
                  Budget Entries
                  <span className="ml-2 text-xs font-normal text-slate-400">{displayed.length} entries</span>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">All logged fund releases and utilizations.</CardDescription>
              </div>
              
              {/* Total Amount Display */}
              <div className="flex gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-2.5">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Total ABC Amount</p>
                  <p className="text-xl font-bold font-mono text-blue-900">
                    {formatPeso(displayed.reduce((sum, entry) => sum + (entry.amount || 0), 0))}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Total Bid Amount</p>
                  <p className="text-xl font-bold font-mono text-emerald-900">
                    {formatPeso(displayed.reduce((sum, entry) => sum + (entry.amount || 0), 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters and Search Row - Right Aligned */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
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
              
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input placeholder="Search..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  className="gap-2 text-xs h-8 whitespace-nowrap" 
                  onClick={handleExportExcel}
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </Button>
                
                <Button 
                  size="sm" 
                  className="gap-2 text-xs h-8 text-white whitespace-nowrap" 
                  style={{ background: '#1D4ED8' }} 
                  onClick={() => setShowForm(true)}
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add New Entry
                </Button>
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
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">FPP</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Account Code</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Payee</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Office</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Particulars</th>
                    <th className="py-2.5 px-4 text-right font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date Released</th>
                    <th className="py-2.5 px-4 text-right font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {/* Show import batches first */}
                  {importBatches.map(batch => {
                    const batchEntries = paginatedData.filter(r => (r as any).batchId === batch.batchId);
                    if (batchEntries.length === 0) return null;

                    return (
                      <React.Fragment key={batch.batchId}>
                        {/* Import Batch Header */}
                        <tr className="bg-blue-50 border-y border-blue-200">
                          <td colSpan={12} className="py-2 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-blue-900">
                                  {batch.sheetName}
                                </span>
                                <span className="text-xs text-blue-600">
                                  ({batch.count} entries)
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setDeletingBatchId(batch.batchId);
                                  setDeletingBatchInfo({ count: batch.count, sheetName: batch.sheetName });
                                  setShowDeleteBatchDialog(true);
                                }}
                                className="h-7 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete Import
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {/* Batch Entries */}
                        {batchEntries.map(r => (
                          <tr 
                            key={r.id} 
                            onClick={() => handleEdit(r)}
                            className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-blue-700 font-semibold whitespace-nowrap">{r.fppCode}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-600">{r.accountCode || '—'}</td>
                            <td className="py-2.5 px-4 text-slate-700 font-medium max-w-[140px] truncate" title={r.payee}>{r.payee || '—'}</td>
                            <td className="py-2.5 px-4 text-slate-700 font-medium max-w-[140px] truncate">{r.department}</td>
                            <td className="py-2.5 px-4 text-slate-600 max-w-[200px]">
                              <p className="truncate" title={r.purpose}>{r.purpose}</p>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700 whitespace-nowrap">{formatPeso(r.amount)}</td>
                            <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                              {(r as any).dateReleased 
                                ? new Date((r as any).dateReleased).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleEdit(r)} 
                                  className="text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(r.id)} 
                                  className="text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}

                  {/* Manual entries (no batchId) */}
                  {paginatedData.filter(r => !(r as any).batchId).length > 0 && (
                    <>
                      <tr className="bg-slate-50 border-y border-slate-200">
                        <td colSpan={12} className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <PlusCircle className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-bold text-slate-700">
                              Manual Entries
                            </span>
                            <span className="text-xs text-slate-500">
                              ({paginatedData.filter(r => !(r as any).batchId).length} entries)
                            </span>
                          </div>
                        </td>
                      </tr>
                      {paginatedData.filter(r => !(r as any).batchId).map(r => {
                        const canDelete = isAdmin || r.submittedById === user?.id;
                        return (
                          <tr 
                            key={r.id} 
                            onClick={() => handleEdit(r)}
                            className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-blue-700 font-semibold whitespace-nowrap">{r.fppCode}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-600">{r.accountCode || '—'}</td>
                            <td className="py-2.5 px-4 text-slate-700 font-medium max-w-[140px] truncate" title={r.payee}>{r.payee || '—'}</td>
                            <td className="py-2.5 px-4 text-slate-700 font-medium max-w-[140px] truncate">{r.department}</td>
                            <td className="py-2.5 px-4 text-slate-600 max-w-[200px]">
                              <p className="truncate" title={r.purpose}>{r.purpose}</p>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700 whitespace-nowrap">{formatPeso(r.amount)}</td>
                            <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                              {(r as any).dateReleased 
                                ? new Date((r as any).dateReleased).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'}
                            </td>
                            {canDelete && (
                              <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => handleEdit(r)} 
                                    className="text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(r.id)} 
                                    className="text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination Controls */}
        {displayed.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(endIndex, displayed.length)}</span> of{' '}
              <span className="font-semibold text-slate-700">{displayed.length}</span> entries
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {/* Page numbers with ellipsis logic */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                  // Show ellipsis before current range
                  const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3;
                  // Show ellipsis after current range
                  const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNum}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* — New Entry Modal —————————————————————————————————————————————————————————————— */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="w-full max-w-4xl gap-0 p-0 overflow-hidden rounded-none sm:rounded-lg shadow-2xl flex flex-col sm:max-h-[90vh] max-h-screen">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
            <DialogTitle className="text-slate-800 font-bold flex items-center gap-2 text-sm">
              <PlusCircle className="w-4 h-4 text-blue-600" /> New Budget Release Entry
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">

              {/* ── Left Column: Fund Type · FPP Code · Department ── */}
              <div className="px-4 sm:px-6 py-5 space-y-4">

                {/* Authorized Fund Type */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Authorized Fund Type</Label>
                  {fundSections.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      No Statement data available. Please import the Statement of Appropriations first.
                    </p>
                  ) : fundSections.length === 1 ? (
                    <div className={`px-4 py-3 rounded-xl border flex items-center justify-between ${activeSection.colors.bg} ${activeSection.colors.border}`}>
                      <span className={`text-sm font-bold ${activeSection.colors.text}`}>{activeSection.shortLabel}</span>
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
                            <span className={`text-sm font-bold ${activeSection.colors.text}`}>{activeSection.shortLabel}</span>
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

                {/* FPP Code combobox */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Program/Project (FPP Code) *</Label>
                  <Popover open={fppOpen} onOpenChange={v => { setFppOpen(v); if (!v) setFppQuery(''); }} modal={true}>
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
                    <PopoverContent className="w-[min(90vw,450px)] p-0 shadow-xl border-slate-200 z-[9999]" align="start" sideOffset={8}>
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search FPP code or project name..."
                          className="text-xs h-10"
                          value={fppQuery}
                          onValueChange={setFppQuery}
                        />
                        <CommandList
                          onScroll={handleFppScroll}
                          className="max-h-[250px] overflow-y-auto pointer-events-auto touch-auto [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full pb-2"
                          style={{ overscrollBehavior: 'contain' }}
                        >
                          <CommandEmpty className="py-4 text-xs text-center text-slate-500">No FPP matches found.</CommandEmpty>
                          <CommandGroup>
                            {fppOptions.slice(0, fppLimit).map((ppa) => (
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
                                  <span className="font-mono font-bold text-xs text-blue-700">{ppa.fppCode}</span>
                                  <span className="text-[10px] font-mono text-emerald-600 font-bold">{formatPeso(ppa.balanceOfAllotment)}</span>
                                </div>
                                <span className="text-xs text-slate-600 line-clamp-1">{ppa.programProjectActivity}</span>
                              </CommandItem>
                            ))}
                            {fppLimit < fppOptions.length && (
                              <div className="py-3 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                <span className="w-3 h-3 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></span>
                                Loading more...
                              </div>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Once selected, show full title and balance */}
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

                {/* Department / Office — stays left */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Department / Office *</Label>
                  <Input className="h-10 text-xs bg-white" placeholder="e.g. Office of the Governor"
                    value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                </div>
              </div>

              {/* ── Right Column: all input fields ── */}
              <div className="px-4 sm:px-6 py-5 space-y-4 bg-slate-50/50">

                {/* Account Code */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Code</Label>
                  <Input className="h-10 text-xs font-mono bg-white" placeholder="e.g. 5-02-01-010"
                    value={form.accountCode} onChange={e => setForm(p => ({ ...p, accountCode: e.target.value }))} />
                </div>

                {/* Payee */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payee</Label>
                  <Input className="h-10 text-xs bg-white" placeholder="e.g. Juan De La Cruz / ABC Corp"
                    value={form.payee} onChange={e => setForm(p => ({ ...p, payee: e.target.value }))} />
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount (?) *</Label>
                  <Input 
                    className="h-10 text-base font-mono font-bold bg-white" 
                    placeholder="0.00" 
                    type="text"
                    value={form.amount ? formatNumberWithCommas(form.amount) : ''}
                    onChange={e => {
                      const formatted = formatNumberWithCommas(e.target.value);
                      setForm(p => ({ ...p, amount: parseFormattedNumber(formatted) }));
                    }}
                  />
                  {form.amount && parseFloat(form.amount) > 0 && activePPA && (
                    <p className={`text-[10px] font-medium ${
                      (activePPA.balanceOfAllotment - parseFloat(form.amount)) < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      After this PR: {formatPeso(activePPA.balanceOfAllotment - parseFloat(form.amount))} remaining for this PPA.
                    </p>
                  )}
                </div>

                {/* Date Released at PGO */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date Released at PGO</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 w-full justify-start text-left font-normal text-xs bg-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.dateReleased ? format(new Date(form.dateReleased), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown-months"
                        selected={form.dateReleased ? new Date(form.dateReleased) : undefined}
                        onSelect={(date) => setForm(p => ({ ...p, dateReleased: date ? format(date, 'yyyy-MM-dd') : '' }))}
                        fromYear={2020}
                        toYear={2030}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Purpose / Particulars */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Purpose/Particulars *</Label>
                  <textarea
                    className="w-full h-28 text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 bg-white"
                    placeholder="Describe what this budget release is for�"
                    value={form.purpose}
                    onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                  />
                </div>
              </div>

            </div>
          </div>{/* end scrollable body */}

          {/* Sticky footer */}
          <div className="px-4 sm:px-6 pb-4 pt-3 flex items-center justify-between border-t border-slate-100 shrink-0 bg-white">
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
                  Saving�
                </span>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Submit Entry</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sheet Selection Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Select Sheet to Import
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong className="font-semibold">File:</strong> {selectedFile?.name}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Select which sheet contains the data you want to import
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Available Sheets</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableSheets.map(sheetName => (
                  <button
                    key={sheetName}
                    onClick={() => setSelectedSheet(sheetName)}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                      selectedSheet === sheetName
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{sheetName}</span>
                      {selectedSheet === sheetName && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowImportModal(false);
                setSelectedFile(null);
                setAvailableSheets([]);
                setSelectedSheet('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={importing}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={importing || !selectedSheet}
              className="text-xs h-8 gap-1.5 text-white"
              style={{ background: '#1D4ED8' }}
            >
              {importing ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3" />
                  Import {selectedSheet}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit Budget Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">FPP Code</Label>
                <Input
                  value={editForm.fppCode}
                  onChange={e => setEditForm(p => ({ ...p, fppCode: e.target.value }))}
                  className="text-xs h-8 mt-1"
                  placeholder="Enter FPP Code"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Account Code</Label>
                <Input
                  value={editForm.accountCode}
                  onChange={e => setEditForm(p => ({ ...p, accountCode: e.target.value }))}
                  className="text-xs h-8 mt-1"
                  placeholder="Enter Account Code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Payee</Label>
                <Input
                  value={editForm.payee}
                  onChange={e => setEditForm(p => ({ ...p, payee: e.target.value }))}
                  className="text-xs h-8 mt-1"
                  placeholder="Enter Payee"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Office</Label>
                <Input
                  value={editForm.office}
                  onChange={e => setEditForm(p => ({ ...p, office: e.target.value }))}
                  className="text-xs h-8 mt-1"
                  placeholder="Enter Office"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Particulars</Label>
              <Input
                value={editForm.particulars}
                onChange={e => setEditForm(p => ({ ...p, particulars: e.target.value }))}
                className="text-xs h-8 mt-1"
                placeholder="Enter Particulars"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Amount</Label>
              <Input
                type="text"
                value={editForm.amount ? formatNumberWithCommas(editForm.amount) : ''}
                onChange={e => {
                  const formatted = formatNumberWithCommas(e.target.value);
                  setEditForm(p => ({ ...p, amount: parseFormattedNumber(formatted) }));
                }}
                className="text-xs h-8 mt-1"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Date Released</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 w-full justify-start text-left font-normal text-xs mt-1"
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {editForm.dateReleased ? format(new Date(editForm.dateReleased), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown-months"
                    selected={editForm.dateReleased ? new Date(editForm.dateReleased) : undefined}
                    onSelect={(date) => setEditForm(p => ({ ...p, dateReleased: date ? format(date, 'yyyy-MM-dd') : '' }))}
                    fromYear={2020}
                    toYear={2030}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(false)}
              disabled={updating}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateEntry}
              disabled={updating}
              className="text-xs h-8 gap-1.5 text-white"
              style={{ background: '#1D4ED8' }}
            >
              {updating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Update Entry
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-slate-800">
              Delete Budget Entry?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              This action cannot be undone. This will permanently delete the budget entry from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Import Batch Confirmation Dialog */}
      <AlertDialog open={showDeleteBatchDialog} onOpenChange={setShowDeleteBatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              Delete Import Batch?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              {deletingBatchInfo && (
                <>
                  You are about to delete <span className="font-bold text-slate-800">{deletingBatchInfo.count} entries</span> from{' '}
                  <span className="font-bold text-slate-800">"{deletingBatchInfo.sheetName}"</span>.
                  <br /><br />
                  This action cannot be undone. All entries from this import will be permanently removed from the database.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBatch}
              className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete {deletingBatchInfo?.count} Entries
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
