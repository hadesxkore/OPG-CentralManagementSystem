import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, RefreshCcw, Eye, FileSpreadsheet, ShieldCheck, Database, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { sileo } from 'sileo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/backend/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';

type ArchivedItem = {
  id: string;
  type: 'ppa_summary' | 'obligations' | 'statements';
  fileName: string;
  clearedAt: string;
  clearedBy: string;
  status: string;
  originalPath: string;
  records: any[];
};

const DynamicTable = ({ data, type }: { data: any[]; type: string }) => {
  if (!data || data.length === 0) return <div className="p-8 text-center text-slate-400">No records found.</div>;
  
  const [recordSearch, setRecordSearch] = useState('');
  const q = recordSearch.toLowerCase();

  // Tab-aware filtering
  const filteredData = data.filter(row => {
    if (!q) return true;
    if (type === 'ppa_summary') {
      return (
        String(row.fppCode ?? '').toLowerCase().includes(q) ||
        String(row.programProjectActivity ?? '').toLowerCase().includes(q)
      );
    }
    if (type === 'obligations') {
      return (
        String(row.obrNo ?? '').toLowerCase().includes(q) ||
        String(row.particulars ?? '').toLowerCase().includes(q)
      );
    }
    if (type === 'statements') {
      return String(row.expensesClassification ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const placeholder =
    type === 'ppa_summary' ? 'Search by FPP Code or PPA...' :
    type === 'obligations' ? 'Search by OBR No or Particulars...' :
    'Search by Expenses Classification...';

  // Filter out internal fields for display
  const excludeKeys = ['id', 'isHeader'];
  const PREFERRED_ORDER = [
    'fppCode', 'programProjectActivity',
    'expensesClassification',
    'date', 'payee', 'particulars', 'obrNo', 
    'accountCode', 'appropriation', 'allotment', 'obligation',
    'balanceOfAppropriation', 'balanceOfAllotment', 'utilizationRate',
    'netApprovedAmount', 'payment'
  ];

  const keys = Object.keys(data[0])
    .filter(k => !excludeKeys.includes(k))
    .sort((a, b) => {
       let idxA = PREFERRED_ORDER.indexOf(a);
       let idxB = PREFERRED_ORDER.indexOf(b);
       if (idxA === -1) idxA = 999;
       if (idxB === -1) idxB = 999;
       return idxA - idxB;
    });

  const { paged, page, totalPages, goTo } = usePagination(filteredData, 25);

  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-[600px]">
      {/* Row-level search */}
      <div className="flex-none mb-3 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={recordSearch}
          onChange={e => setRecordSearch(e.target.value)}
          className="w-full max-w-sm pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {recordSearch && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
            {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto border border-slate-200 rounded-lg bg-white shadow-sm">
        <table className="w-max min-w-full text-sm text-left">
          <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 shadow-sm drop-shadow-sm">
            <tr>
              {keys.map(k => (
                <th key={k} className="p-3 font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">{k.replace(/([A-Z])/g, ' $1').trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none">
              {keys.map(k => {
                 let val = row[k];
                 let cellClass = "p-3 font-mono text-[13px] min-w-[120px] max-w-[350px] whitespace-normal leading-relaxed break-words ";
                 
                 const lowerK = k.toLowerCase();
                 if (typeof val === 'number') {
                   val = val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                   cellClass += "text-right font-bold ";
                   if (lowerK.includes('appropriation') && !lowerK.includes('balance')) cellClass += "text-blue-700 bg-blue-50/30 ";
                   else if (lowerK.includes('allotment') && !lowerK.includes('balance')) cellClass += "text-cyan-700 bg-cyan-50/30 ";
                   else if (lowerK.includes('obligation')) cellClass += "text-violet-700 bg-violet-50/30 ";
                   else if (lowerK.includes('balance') && lowerK.includes('appropriation')) cellClass += "text-emerald-700 bg-emerald-50/30 ";
                   else if (lowerK.includes('balance') && lowerK.includes('allotment')) cellClass += "text-rose-700 bg-rose-50/30 ";
                   else if (lowerK.includes('utilization')) cellClass += "text-amber-700 bg-amber-50/30 ";
                   else cellClass += "text-slate-700";
                 } else {
                   cellClass += "text-slate-800";
                 }

                 return <td key={k} className={cellClass}>{String(val ?? '—')}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {totalPages > 1 && (
        <div className="flex-none flex items-center justify-between px-4 py-3 bg-white border border-slate-200 mt-4 rounded-lg shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{(page - 1) * 25 + 1}</strong> to <strong className="text-slate-900">{Math.min(page * 25, data.length)}</strong> of <strong className="text-slate-900">{data.length}</strong> entries
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => goTo(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-lg border-slate-200 text-slate-500">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2 text-slate-400">...</span>}
                  <Button variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => goTo(p)} className={`w-8 h-8 rounded-lg text-xs font-semibold ${page === p ? 'bg-blue-600 text-white shadow-sm hover:!bg-blue-700 hover:!text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {p}
                  </Button>
                </Fragment>
              ))}
            <Button variant="outline" size="icon" onClick={() => goTo(page + 1)} disabled={page === totalPages} className="w-8 h-8 rounded-lg border-slate-200 text-slate-500">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function BudgetTrashPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [archives, setArchives] = useState<ArchivedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ppa_summary' | 'obligations' | 'statements'>('ppa_summary');
  const [search, setSearch] = useState('');
  
  // Modal state
  const [viewItem, setViewItem] = useState<ArchivedItem | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'budget_trash'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ArchivedItem))
        .sort((a, b) => new Date(b.clearedAt).getTime() - new Date(a.clearedAt).getTime());
      setArchives(items);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleRestore = (item: ArchivedItem) => {
    if (!isAdmin) return sileo.error({ title: 'Access Denied', description: 'Only Administrators can execute restore operations.' });

    sileo.promise(new Promise(async (resolve, reject) => {
      try {
        if (item.type === 'ppa_summary') {
           await setDoc(doc(db, 'finance', 'ppa_summary'), { records: item.records, fileName: item.fileName, updatedAt: new Date().toISOString() });
        } else if (item.type === 'obligations') {
           await setDoc(doc(db, 'finance', 'obligations'), { records: item.records, fileName: item.fileName, updatedAt: new Date().toISOString() });
        } else if (item.type === 'statements') {
           await setDoc(doc(db, 'finance', 'statement'), { records: item.records, fileName: item.fileName, updatedAt: new Date().toISOString() });
        }

        await deleteDoc(doc(db, 'budget_trash', item.id));
        resolve(true);
      } catch (err: any) {
        reject(err.message || 'Restoration failed');
      }
    }), {
      loading: { title: 'Restoring History Log...' },
      success: { title: 'Restored', description: `Successfully mounted ${item.records.length} records back into the active database!` },
      error: (e) => ({ title: 'Restore Interrupted', description: String(e) })
    });
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Scanning history sectors...</div>;

  const currentRecords = archives.filter(a => a.type === activeTab && a.fileName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget History Logs"
        description="Review previously archived budget records natively mapped in the cloud database."
        icon={History}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg w-max shadow-sm">
        {(['ppa_summary', 'obligations', 'statements'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all capitalize ${
              activeTab === t 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <Card className={`shadow-sm border-slate-200 flex flex-col ${viewItem ? 'max-h-[40vh]' : ''}`}>
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between border-b gap-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-800 capitalize flex items-center gap-2">
              {activeTab.replace('_', ' ')} History
              <span className="text-xs font-medium text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">{currentRecords.length} files</span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">Browse through the cleared {activeTab.replace('_', ' ')} Excel data historically tracked offline.</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search file name..." 
              className="pl-9 h-9 w-64 text-xs font-medium bg-slate-50 border-slate-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto min-h-0">
          {currentRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
               <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-dashed border-slate-200">
                 <Database className="w-6 h-6 text-slate-300" />
               </div>
               <p className="text-sm font-semibold text-slate-700 mb-1">No historical records found</p>
               <p className="text-xs text-slate-400 max-w-sm">No {activeTab.replace('_', ' ')} files have been cleared or archived to the unified history tracker yet.</p>
            </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 border-b">
                    <tr>
                      <th className="py-3 px-5">File Reference</th>
                      <th className="py-3 px-5">Cleared By</th>
                      <th className="py-3 px-5">Total Records</th>
                      <th className="py-3 px-5">Cleared Timestamp</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentRecords.map(item => (
                       <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group cursor-pointer" onClick={() => setViewItem(item)}>
                          <td className="py-3 px-5">
                             <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                   <FileSpreadsheet className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-slate-700 text-xs">{item.fileName}</span>
                             </div>
                          </td>
                          <td className="py-3 px-5">
                             <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                               <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                               {item.clearedBy}
                             </div>
                          </td>
                          <td className="py-3 px-5">
                             <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100/80 py-1.5 px-3 rounded-md border border-slate-200 text-center inline-block min-w-[50px]">
                               {item.records.length}
                             </span>
                          </td>
                          <td className="py-3 px-5">
                             <div className="flex items-center gap-1.5 text-xs text-slate-500">
                               <Calendar className="w-3.5 h-3.5" />
                               {new Date(item.clearedAt).toLocaleString(undefined, {
                                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                               })}
                             </div>
                          </td>
                          <td className="py-3 px-5 text-right">
                             <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px] font-bold text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-800" onClick={() => setViewItem(item)}>
                                   <Eye className="w-3.5 h-3.5" /> View Data
                                </Button>
                                {isAdmin && (
                                   <Button size="sm" className="h-8 gap-1.5 text-[11px] font-bold shadow-sm" onClick={() => handleRestore(item)}>
                                      <RefreshCcw className="w-3.5 h-3.5" /> Restore
                                   </Button>
                                )}
                             </div>
                          </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}
        </CardContent>
      </Card>

      {/* ── EXPANDED BOTTOM VIEW ─────────────────────────────────────── */}
      <AnimatePresence>
        {viewItem && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card className="shadow-sm border-slate-200 flex flex-col min-h-[75vh] mb-10">
              <CardHeader className="px-6 py-4 bg-white border-b flex-row items-center justify-between gap-4 space-y-0 shadow-sm z-20 relative">
                <CardTitle className="text-slate-800 font-bold flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold">Historical Log: <span className="text-blue-700 font-mono tracking-tight">{viewItem.fileName}</span></span>
                    <span className="text-xs text-slate-500 font-medium tracking-wide">Archived by <strong className="text-slate-700">{viewItem.clearedBy}</strong> on {new Date(viewItem.clearedAt).toLocaleString()} • <strong className="text-slate-700 font-mono">{viewItem.records.length}</strong> Entries Built</span>
                  </div>
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                   {isAdmin && (
                      <Button size="sm" className="gap-2 h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => { handleRestore(viewItem); setViewItem(null); }}>
                         <RefreshCcw className="w-4 h-4" /> Restore Module
                      </Button>
                   )}
                   <Button size="sm" variant="outline" className="gap-2 h-9 text-xs font-bold text-slate-600 shadow-none border-slate-300" onClick={() => setViewItem(null)}>
                      <X className="w-4 h-4" /> Close
                   </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 bg-slate-50/50 overflow-hidden flex flex-col min-h-0">
                <DynamicTable data={viewItem.records} type={viewItem.type} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
