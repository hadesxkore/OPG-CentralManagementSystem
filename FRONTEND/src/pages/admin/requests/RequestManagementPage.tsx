import { useState } from 'react';
import { ClipboardList, Search, Eye, Check, X } from 'lucide-react';
import { sileo } from 'sileo';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, TypeBadge } from '@/components/shared/StatusBadge';
import { MOCK_REQUESTS } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RequestType } from '@/types';

const TABS: { value: string; label: string; type?: RequestType }[] = [
  { value: 'all', label: 'All Requests' },
  { value: 'DTR', label: 'DTR', type: 'DTR' },
  { value: 'ATR', label: 'ATR', type: 'ATR' },
  { value: 'Leave', label: 'Leave', type: 'Leave' },
  { value: 'OBR Signature', label: 'OBR Sig.', type: 'OBR Signature' },
  { value: 'Purchase Request', label: 'PR', type: 'Purchase Request' },
];

export default function RequestManagementPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleApprove = (ref: string) => {
    sileo.success({ title: 'Request approved', description: `${ref} has been approved` });
  };

  const handleReject = (ref: string) => {
    sileo.error({ title: 'Request rejected', description: `${ref} has been rejected` });
  };

  const getFiltered = (type?: RequestType) =>
    MOCK_REQUESTS.filter(r => {
      const matchType = !type || r.type === type;
      const matchSearch = r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="e-Request Management"
        description="Review and act on employee requests"
        icon={ClipboardList}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Requests', value: MOCK_REQUESTS.length, color: 'text-slate-800' },
          { label: 'Pending', value: MOCK_REQUESTS.filter(r => r.status === 'Pending').length, color: 'text-amber-600' },
          { label: 'Approved', value: MOCK_REQUESTS.filter(r => r.status === 'Approved').length, color: 'text-emerald-600' },
          { label: 'Rejected', value: MOCK_REQUESTS.filter(r => r.status === 'Rejected').length, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100">
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold flex-1">All e-Requests</CardTitle>
            <div className="relative sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Search..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {TABS.map(t => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>
              ))}
            </TabsList>
            {TABS.map(t => {
              const requests = getFiltered(t.type);
              return (
                <TabsContent key={t.value} value={t.value}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[750px]">
                      <thead>
                        <tr className="border-b-2 border-slate-100">
                          {['Reference No.', 'Employee', 'Type', 'Description', 'Date Filed', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4 last:pr-0">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {requests.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-8 text-slate-400 text-sm">No records found</td></tr>
                        ) : requests.map(req => (
                          <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 pr-4 text-xs font-mono text-blue-700 font-semibold whitespace-nowrap">{req.referenceNo}</td>
                            <td className="py-3 pr-4">
                              <p className="text-xs font-semibold text-slate-800">{req.employeeName}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{req.office}</p>
                            </td>
                            <td className="py-3 pr-4"><TypeBadge type={req.type} /></td>
                            <td className="py-3 pr-4 text-xs text-slate-600 max-w-[180px] truncate">{req.description}</td>
                            <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">{req.dateFiled}</td>
                            <td className="py-3 pr-4"><StatusBadge status={req.status} /></td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <button title="View" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {req.status === 'Pending' || req.status === 'For Review' ? (
                                  <>
                                <button title="Approve" onClick={() => handleApprove(req.referenceNo)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button title="Reject" onClick={() => handleReject(req.referenceNo)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
