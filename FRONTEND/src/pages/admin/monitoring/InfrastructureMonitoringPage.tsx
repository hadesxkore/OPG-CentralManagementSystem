import { useState, useEffect } from 'react';
import { Construction, Plus, Search, Download, Edit2, Trash2, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { sileo } from 'sileo';
import * as XLSX from 'xlsx-js-style';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import { db } from '@/backend/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';

interface InfrastructureProject {
  id: string;
  dateOfBidding: string;
  projectTitle: string;
  sourceOfFund: '20%' | 'Trust Fund' | 'SEF' | '5% LDRRM' | 'General Fund';
  abcAmount: number;
  bidAmount: number;
  calendarDays: number;
  contractor: string;
  contractDate: string;
  noticeToProceeded: string;
  percentageCompletion: number;
  expiryDate: string;
  slippage: number;
  peoRemarks: 'Completed' | 'On-going' | 'Cancelled';
  accountingRemarks: string;
  releaseDate: string;
  adviceDate: string;
  paymentDate: string;
  paid: 'Paid' | 'Unpaid';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const paidColors = {
  Paid: 'bg-green-100 text-green-700 border-green-200',
  Unpaid: 'bg-red-100 text-red-700 border-red-200',
};

const peoRemarksColors = {
  Completed: 'bg-green-100 text-green-700 border-green-200',
  'On-going': 'bg-blue-100 text-blue-700 border-blue-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function InfrastructureMonitoringPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<InfrastructureProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<InfrastructureProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<InfrastructureProject | null>(null);
  const [formData, setFormData] = useState<Partial<InfrastructureProject>>({});
  const [submitting, setSubmitting] = useState(false);



  // Firebase listener for real-time updates
  useEffect(() => {
    console.log('🔥 Setting up Firebase listener for infrastructure projects...');
    console.log('🔥 Firebase DB instance:', db);
    console.log('🔥 User:', user);
    
    const q = query(collection(db, 'infrastructure_projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔥 Firebase snapshot received:', snapshot.docs.length, 'documents');
      console.log('🔥 Snapshot empty?', snapshot.empty);
      console.log('🔥 Snapshot metadata:', snapshot.metadata);
      
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔥 Document data:', doc.id, data);
        return {
          id: doc.id,
          ...data
        } as InfrastructureProject;
      });
      
      console.log('🔥 Final projects data:', projectsData);
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error('🔥 Error fetching projects:', error);
      console.error('🔥 Error code:', error.code);
      console.error('🔥 Error message:', error.message);
      sileo.error({ title: 'Firebase Error', description: `Failed to load projects: ${error.message}` });
      setLoading(false);
    });

    return () => {
      console.log('🔥 Cleaning up Firebase listener');
      unsubscribe();
    };
  }, [user]);

  const filtered = projects.filter(p =>
    p.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    p.contractor.toLowerCase().includes(search.toLowerCase())
  );

  const { paged, page, totalPages, goTo } = usePagination(filtered, 10);

  // Calculate statistics
  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => p.peoRemarks === 'On-going').length,
    completed: projects.filter(p => p.peoRemarks === 'Completed').length,
    cancelled: projects.filter(p => p.peoRemarks === 'Cancelled').length,
    totalAbcAmount: projects.reduce((sum, p) => sum + p.abcAmount, 0),
    totalBidAmount: projects.reduce((sum, p) => sum + p.bidAmount, 0),
  };

  const handleAdd = async () => {
    if (!formData.projectTitle?.trim()) {
      sileo.error({ title: 'Validation Error', description: 'Project title is required.' });
      return;
    }

    setSubmitting(true);
    try {
      const newProject = {
        dateOfBidding: formData.dateOfBidding || '',
        projectTitle: formData.projectTitle.trim(),
        sourceOfFund: formData.sourceOfFund || 'General Fund',
        abcAmount: formData.abcAmount || 0,
        bidAmount: formData.bidAmount || 0,
        calendarDays: formData.calendarDays || 0,
        contractor: formData.contractor?.trim() || '',
        contractDate: formData.contractDate || '',
        noticeToProceeded: formData.noticeToProceeded || '',
        percentageCompletion: formData.percentageCompletion || 0,
        expiryDate: formData.expiryDate || '',
        slippage: formData.slippage || 0,
        peoRemarks: formData.peoRemarks || 'On-going',
        accountingRemarks: formData.accountingRemarks?.trim() || '',
        releaseDate: formData.releaseDate || '',
        adviceDate: formData.adviceDate || '',
        paymentDate: formData.paymentDate || '',
        paid: formData.paid || 'Unpaid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.id || '',
      };

      await addDoc(collection(db, 'infrastructure_projects'), newProject);
      
      setIsAddDialogOpen(false);
      setFormData({});
      sileo.success({ 
        title: 'Project Added', 
        description: `${newProject.projectTitle} has been added successfully.` 
      });
    } catch (error: any) {
      console.error('Error adding project:', error);
      sileo.error({ 
        title: 'Error', 
        description: error.message || 'Failed to add project' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedProject || !formData.projectTitle?.trim()) {
      sileo.error({ title: 'Validation Error', description: 'Project title is required.' });
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {
        ...formData,
        projectTitle: formData.projectTitle.trim(),
        contractor: formData.contractor?.trim() || '',
        accountingRemarks: formData.accountingRemarks?.trim() || '',
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'infrastructure_projects', selectedProject.id), updateData);
      
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      setFormData({});
      sileo.success({ 
        title: 'Project Updated', 
        description: 'Changes have been saved successfully.' 
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      sileo.error({ 
        title: 'Error', 
        description: error.message || 'Failed to update project' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'infrastructure_projects', projectToDelete.id));
      
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
      sileo.success({ 
        title: 'Project Deleted', 
        description: 'Project has been removed successfully.' 
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      sileo.error({ 
        title: 'Error', 
        description: error.message || 'Failed to delete project' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (project: InfrastructureProject) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (project: InfrastructureProject) => {
    setSelectedProject(project);
    setFormData(project);
    setIsEditDialogOpen(true);
  };

  const formatPeso = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Export to Excel functionality
  const handleExportExcel = () => {
    if (filtered.length === 0) {
      sileo.error({ title: 'No Data', description: 'No projects to export.' });
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
        ['INFRASTRUCTURE MONITORING REPORT'],
        [`Provincial Government of Bataan - Infrastructure Projects`],
        [`Generated on: ${currentDate} | Total Projects: ${filtered.length}`],
        [], // Empty row for spacing
      ];

      // Professional headers
      const headers = [
        [
          'Date of Bidding', 'Project Title', 'Source of Fund', 'ABC Amount (₱)', 'Bid Amount (₱)', 
          'Calendar Days', 'Contractor', 'Contract Date', 'Notice to Proceed', '% Completion', 
          'Expiry Date', 'Slippage (Days)', 'PEO Remarks', 'Accounting Remarks', 
          'Release Date (PTO)', 'Advice Date', 'Payment Date', 'Payment Status'
        ]
      ];

      // Create data rows
      const dataRows = filtered.map((project) => [
        project.dateOfBidding ? new Date(project.dateOfBidding).toLocaleDateString('en-US', { 
          month: '2-digit', day: '2-digit', year: 'numeric' 
        }) : '—',
        project.projectTitle || '—',
        project.sourceOfFund || '—',
        project.abcAmount || 0,
        project.bidAmount || 0,
        project.calendarDays || 0,
        project.contractor || '—',
        project.contractDate ? new Date(project.contractDate).toLocaleDateString('en-US', { 
          month: '2-digit', day: '2-digit', year: 'numeric' 
        }) : '—',
        project.noticeToProceeded ? new Date(project.noticeToProceeded).toLocaleDateString('en-US', { 
          month: '2-digit', day: '2-digit', year: 'numeric' 
        }) : '—',
        project.percentageCompletion || 0,
        project.expiryDate ? new Date(project.expiryDate).toLocaleDateString('en-US', { 
          month: '2-digit', day: '2-digit', year: 'numeric' 
        }) : '—',
        project.slippage || 0,
        project.peoRemarks || '—',
        project.accountingRemarks || '—',
        project.releaseDate ? new Date(project.releaseDate).toLocaleDateString('en-US', { 
          month: '2-digit', day: '2-digit', year: 'numeric' 
        }) : '—',
        project.adviceDate ? new Date(project.adviceDate).toLocaleDateString('en-US', { 
          month: '2-digit', day: '2-digit', year: 'numeric' 
        }) : '—',
        project.paymentDate ? new Date(project.paymentDate).toLocaleDateString('en-US', { 
          month: '2-digit', day: '2-digit', year: 'numeric' 
        }) : '—',
        project.paid || '—'
      ]);

      // Create summary section
      const summaryRows = [
        [], // Empty row
        ['PROJECT SUMMARY REPORT'],
        ['Total Projects:', filtered.length, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Ongoing Projects:', stats.ongoing, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Completed Projects:', stats.completed, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Cancelled Projects:', stats.cancelled, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Total ABC Amount:', stats.totalAbcAmount, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Total Bid Amount:', stats.totalBidAmount, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Average ABC Amount:', stats.totalAbcAmount / filtered.length, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Average Bid Amount:', stats.totalBidAmount / filtered.length, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ];

      const wsData = [...title, ...headers, ...dataRows, ...summaryRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Enhanced merging for professional layout
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }, // Main title
        { s: { r: 1, c: 0 }, e: { r: 1, c: 17 } }, // Subtitle
        { s: { r: 2, c: 0 }, e: { r: 2, c: 17 } }, // Date info
        { s: { r: dataRows.length + 5, c: 0 }, e: { r: dataRows.length + 5, c: 17 } }, // Summary title
      ];

      // Auto-sizing columns with optimal widths
      const colWidths = [
        { wch: 12 },  // Date of Bidding
        { wch: 35 },  // Project Title
        { wch: 12 },  // Source of Fund
        { wch: 15 },  // ABC Amount
        { wch: 15 },  // Bid Amount
        { wch: 12 },  // Calendar Days
        { wch: 25 },  // Contractor
        { wch: 12 },  // Contract Date
        { wch: 12 },  // Notice to Proceed
        { wch: 12 },  // % Completion
        { wch: 12 },  // Expiry Date
        { wch: 12 },  // Slippage
        { wch: 12 },  // PEO Remarks
        { wch: 25 },  // Accounting Remarks
        { wch: 12 },  // Release Date
        { wch: 12 },  // Advice Date
        { wch: 12 },  // Payment Date
        { wch: 12 },  // Payment Status
      ];

      // Calculate dynamic widths based on content
      filtered.forEach(project => {
        const titleLen = (project.projectTitle || '').length;
        const contractorLen = (project.contractor || '').length;
        const remarksLen = (project.accountingRemarks || '').length;

        if (titleLen > colWidths[1].wch) colWidths[1].wch = Math.min(titleLen + 2, 45);
        if (contractorLen > colWidths[6].wch) colWidths[6].wch = Math.min(contractorLen + 2, 30);
        if (remarksLen > colWidths[13].wch) colWidths[13].wch = Math.min(remarksLen + 2, 35);
      });

      ws['!cols'] = colWidths;

      // Enhanced styling with modern design
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:R1');
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
              font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
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
              font: { sz: 9, color: { rgb: '1F2937' } },
              alignment: { 
                horizontal: (C === 3 || C === 4 || C === 5 || C === 9 || C === 11) ? 'right' : 'left', 
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
            
            // Special formatting for different columns
            if ((C === 3 || C === 4) && typeof cell.v === 'number') {
              // ABC and Bid Amount columns
              cell.z = '₱#,##0.00';
              cell.s.font = { 
                ...cell.s.font, 
                bold: true, 
                color: { rgb: C === 3 ? '7C3AED' : '059669' } // Purple for ABC, Green for Bid
              };
            } else if (C === 9 && typeof cell.v === 'number') {
              // Percentage completion
              cell.z = '0"%"';
              cell.s.font = { 
                ...cell.s.font, 
                bold: true, 
                color: { rgb: cell.v >= 100 ? '059669' : cell.v >= 50 ? 'F59E0B' : 'DC2626' }
              };
            } else if (C === 11 && typeof cell.v === 'number') {
              // Slippage days
              cell.s.font = { 
                ...cell.s.font, 
                bold: true, 
                color: { rgb: cell.v > 0 ? 'DC2626' : cell.v < 0 ? '059669' : '6B7280' }
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
                if (cell.v > 1000) {
                  cell.z = '₱#,##0.00';
                } else {
                  cell.z = '#,##0';
                }
              }
            }
          }
        }
      }

      // Create workbook and export
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Infrastructure Projects');
      
      // Add metadata
      wb.Props = {
        Title: 'Infrastructure Monitoring Report',
        Subject: 'Infrastructure Projects Report',
        Author: 'Provincial Government of Bataan',
        CreatedDate: new Date()
      };

      const fileName = `Infrastructure_Projects_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 5).replace(':', '')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      sileo.success({ 
        title: 'Export Successful! 🏗️', 
        description: `${fileName} downloaded with ${filtered.length} projects and comprehensive summary.` 
      });
      
    } catch (error) {
      console.error('Export error:', error);
      sileo.error({ 
        title: 'Export Failed', 
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Infrastructure Monitoring"
          description="Track and manage infrastructure projects across the province"
          icon={Construction}
        />
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Loading infrastructure projects...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Infrastructure Monitoring"
        description="Track and manage infrastructure projects across the province"
        icon={Construction}
        actions={
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2 text-xs h-8"
              onClick={() => {
                setFormData({});
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8" onClick={handleExportExcel}>
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Projects', value: stats.total, color: 'text-blue-700', bar: 'bg-blue-500', icon: Construction },
          { label: 'Ongoing', value: stats.ongoing, color: 'text-cyan-700', bar: 'bg-cyan-500', icon: TrendingUp },
          { label: 'Completed', value: stats.completed, color: 'text-green-700', bar: 'bg-green-500', icon: CheckCircle2 },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-700', bar: 'bg-red-500', icon: AlertCircle },
          { label: 'Total ABC Amount', value: formatPeso(stats.totalAbcAmount), color: 'text-violet-700', bar: 'bg-violet-500', icon: DollarSign },
          { label: 'Total Bid Amount', value: formatPeso(stats.totalBidAmount), color: 'text-indigo-700', bar: 'bg-indigo-500', icon: DollarSign },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100 overflow-hidden">
            <CardContent className="p-4">
              <div className={`w-8 h-1 rounded-full mb-2 ${s.bar}`} />
              <p className="text-[11px] text-slate-400 leading-tight mb-1">{s.label}</p>
              <p className={`text-sm font-bold leading-tight ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold flex-1">
              Infrastructure Projects
              <span className="ml-2 text-xs font-normal text-slate-400">
                {filtered.length} project{filtered.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search projects..."
                className="pl-9 h-8 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="py-3 px-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date of Bidding</th>
                  <th className="py-3 px-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project Title</th>
                  <th className="py-3 px-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Source of Fund</th>
                  <th className="py-3 px-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ABC Amount</th>
                  <th className="py-3 px-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bid Amount</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Calendar Days</th>
                  <th className="py-3 px-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contractor</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contract Date</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Notice to Proceed</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">% Completion</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Slippage</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PEO Remarks</th>
                  <th className="py-3 px-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Accounting Remarks</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Release Date (PTO)</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Advice Date</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Payment Date</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Paid</th>
                  <th className="py-3 px-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Construction className="w-12 h-12 text-slate-200 mb-3" />
                        <p className="text-sm font-semibold text-slate-600">No infrastructure projects found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {search ? 'Try adjusting your search terms' : 'Click "Add Project" to create your first project'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map(project => {
                  return (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-blue-50/20 transition-colors cursor-pointer"
                      onClick={() => openEditDialog(project)}
                    >
                      <td className="py-3 px-3 text-center text-slate-700 text-[11px]">
                        {project.dateOfBidding ? new Date(project.dateOfBidding).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{project.projectTitle}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {project.sourceOfFund}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 font-semibold">
                        {formatPeso(project.abcAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 font-semibold">
                        {formatPeso(project.bidAmount)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-medium">
                        {project.calendarDays} days
                      </td>
                      <td className="py-3 px-3 text-slate-700">{project.contractor}</td>
                      <td className="py-3 px-3 text-center text-slate-700 text-[11px]">
                        {project.contractDate ? new Date(project.contractDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 text-[11px]">
                        {project.noticeToProceeded ? new Date(project.noticeToProceeded).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                              style={{ width: `${project.percentageCompletion}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600 w-10 text-right">
                            {project.percentageCompletion}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 text-[11px]">
                        {project.expiryDate ? new Date(project.expiryDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-medium">
                        {project.slippage > 0 ? `+${project.slippage}` : project.slippage} days
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge className={`text-[10px] font-medium border ${peoRemarksColors[project.peoRemarks]}`}>
                          {project.peoRemarks}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-700 text-[11px]">
                        {project.accountingRemarks || '—'}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 text-[11px]">
                        {project.releaseDate ? new Date(project.releaseDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 text-[11px]">
                        {project.adviceDate ? new Date(project.adviceDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 text-[11px]">
                        {project.paymentDate ? new Date(project.paymentDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge className={`text-[10px] font-medium border ${paidColors[project.paid]}`}>
                          {project.paid}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openEditDialog(project)}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openDeleteDialog(project)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 py-3">
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

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Infrastructure Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Row 1: Date of Bidding, Project Title */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBidding">Date of Bidding</Label>
                <Input
                  id="dateOfBidding"
                  type="date"
                  value={formData.dateOfBidding || ''}
                  onChange={e => setFormData({ ...formData, dateOfBidding: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  value={formData.projectTitle || ''}
                  onChange={e => setFormData({ ...formData, projectTitle: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>
            </div>

            {/* Row 2: Source of Fund, ABC Amount, Bid Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceOfFund">Source of Fund</Label>
                <Select value={formData.sourceOfFund} onValueChange={value => setFormData({ ...formData, sourceOfFund: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20%">20%</SelectItem>
                    <SelectItem value="Trust Fund">Trust Fund</SelectItem>
                    <SelectItem value="SEF">SEF</SelectItem>
                    <SelectItem value="5% LDRRM">5% LDRRM</SelectItem>
                    <SelectItem value="General Fund">General Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="abcAmount">ABC Amount (PHP)</Label>
                <Input
                  id="abcAmount"
                  type="number"
                  value={formData.abcAmount || ''}
                  onChange={e => setFormData({ ...formData, abcAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bidAmount">Bid Amount (PHP)</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  value={formData.bidAmount || ''}
                  onChange={e => setFormData({ ...formData, bidAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Row 3: Calendar Days, Contractor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calendarDays">Calendar Days</Label>
                <Input
                  id="calendarDays"
                  type="number"
                  min="0"
                  value={formData.calendarDays || ''}
                  onChange={e => setFormData({ ...formData, calendarDays: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contractor">Contractor</Label>
                <Input
                  id="contractor"
                  value={formData.contractor || ''}
                  onChange={e => setFormData({ ...formData, contractor: e.target.value })}
                  placeholder="Enter contractor name"
                />
              </div>
            </div>

            {/* Row 4: Contract Date, Notice to Proceed, % Completion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractDate">Contract Date</Label>
                <Input
                  id="contractDate"
                  type="date"
                  value={formData.contractDate || ''}
                  onChange={e => setFormData({ ...formData, contractDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noticeToProceeded">Notice to Proceed</Label>
                <Input
                  id="noticeToProceeded"
                  type="date"
                  value={formData.noticeToProceeded || ''}
                  onChange={e => setFormData({ ...formData, noticeToProceeded: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentageCompletion">% Completion</Label>
                <Input
                  id="percentageCompletion"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentageCompletion || ''}
                  onChange={e => setFormData({ ...formData, percentageCompletion: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Row 5: Expiry Date, Slippage, PEO Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slippage">Slippage (days)</Label>
                <Input
                  id="slippage"
                  type="number"
                  value={formData.slippage || ''}
                  onChange={e => setFormData({ ...formData, slippage: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peoRemarks">PEO Remarks</Label>
                <Select value={formData.peoRemarks} onValueChange={value => setFormData({ ...formData, peoRemarks: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On-going">On-going</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 6: Accounting Remarks (full width) */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountingRemarks">Accounting Remarks</Label>
                <Textarea
                  id="accountingRemarks"
                  value={formData.accountingRemarks || ''}
                  onChange={e => setFormData({ ...formData, accountingRemarks: e.target.value })}
                  placeholder="Enter accounting remarks"
                  rows={2}
                />
              </div>
            </div>

            {/* Row 7: Release Date (PTO), Advice Date, Payment Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date (PTO)</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate || ''}
                  onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adviceDate">Advice Date</Label>
                <Input
                  id="adviceDate"
                  type="date"
                  value={formData.adviceDate || ''}
                  onChange={e => setFormData({ ...formData, adviceDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>
            </div>

            {/* Row 8: Payment Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paid">Paid</Label>
                <Select value={formData.paid} onValueChange={value => setFormData({ ...formData, paid: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Infrastructure Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Row 1: Date of Bidding, Project Title */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfBidding">Date of Bidding</Label>
                <Input
                  id="edit-dateOfBidding"
                  type="date"
                  value={formData.dateOfBidding || ''}
                  onChange={e => setFormData({ ...formData, dateOfBidding: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-projectTitle">Project Title</Label>
                <Input
                  id="edit-projectTitle"
                  value={formData.projectTitle || ''}
                  onChange={e => setFormData({ ...formData, projectTitle: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>
            </div>

            {/* Row 2: Source of Fund, ABC Amount, Bid Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sourceOfFund">Source of Fund</Label>
                <Select value={formData.sourceOfFund} onValueChange={value => setFormData({ ...formData, sourceOfFund: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20%">20%</SelectItem>
                    <SelectItem value="Trust Fund">Trust Fund</SelectItem>
                    <SelectItem value="SEF">SEF</SelectItem>
                    <SelectItem value="5% LDRRM">5% LDRRM</SelectItem>
                    <SelectItem value="General Fund">General Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-abcAmount">ABC Amount (PHP)</Label>
                <Input
                  id="edit-abcAmount"
                  type="number"
                  value={formData.abcAmount || ''}
                  onChange={e => setFormData({ ...formData, abcAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bidAmount">Bid Amount (PHP)</Label>
                <Input
                  id="edit-bidAmount"
                  type="number"
                  value={formData.bidAmount || ''}
                  onChange={e => setFormData({ ...formData, bidAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Row 3: Calendar Days, Contractor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-calendarDays">Calendar Days</Label>
                <Input
                  id="edit-calendarDays"
                  type="number"
                  min="0"
                  value={formData.calendarDays || ''}
                  onChange={e => setFormData({ ...formData, calendarDays: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-contractor">Contractor</Label>
                <Input
                  id="edit-contractor"
                  value={formData.contractor || ''}
                  onChange={e => setFormData({ ...formData, contractor: e.target.value })}
                  placeholder="Enter contractor name"
                />
              </div>
            </div>

            {/* Row 4: Contract Date, Notice to Proceed, % Completion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contractDate">Contract Date</Label>
                <Input
                  id="edit-contractDate"
                  type="date"
                  value={formData.contractDate || ''}
                  onChange={e => setFormData({ ...formData, contractDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-noticeToProceeded">Notice to Proceed</Label>
                <Input
                  id="edit-noticeToProceeded"
                  type="date"
                  value={formData.noticeToProceeded || ''}
                  onChange={e => setFormData({ ...formData, noticeToProceeded: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-percentageCompletion">% Completion</Label>
                <Input
                  id="edit-percentageCompletion"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentageCompletion || ''}
                  onChange={e => setFormData({ ...formData, percentageCompletion: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Row 5: Expiry Date, Slippage, PEO Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slippage">Slippage (days)</Label>
                <Input
                  id="edit-slippage"
                  type="number"
                  value={formData.slippage || ''}
                  onChange={e => setFormData({ ...formData, slippage: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-peoRemarks">PEO Remarks</Label>
                <Select value={formData.peoRemarks} onValueChange={value => setFormData({ ...formData, peoRemarks: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On-going">On-going</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 6: Accounting Remarks (full width) */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-accountingRemarks">Accounting Remarks</Label>
                <Textarea
                  id="edit-accountingRemarks"
                  value={formData.accountingRemarks || ''}
                  onChange={e => setFormData({ ...formData, accountingRemarks: e.target.value })}
                  placeholder="Enter accounting remarks"
                  rows={2}
                />
              </div>
            </div>

            {/* Row 7: Release Date (PTO), Advice Date, Payment Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-releaseDate">Release Date (PTO)</Label>
                <Input
                  id="edit-releaseDate"
                  type="date"
                  value={formData.releaseDate || ''}
                  onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-adviceDate">Advice Date</Label>
                <Input
                  id="edit-adviceDate"
                  type="date"
                  value={formData.adviceDate || ''}
                  onChange={e => setFormData({ ...formData, adviceDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentDate">Payment Date</Label>
                <Input
                  id="edit-paymentDate"
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>
            </div>

            {/* Row 8: Payment Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-paid">Paid</Label>
                <Select value={formData.paid} onValueChange={value => setFormData({ ...formData, paid: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.projectTitle}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
