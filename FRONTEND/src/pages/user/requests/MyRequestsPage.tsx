import { useState } from 'react';
import { Clock, Car, CalendarOff, PenLine, ShoppingBag, Inbox, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, TypeBadge } from '@/components/shared/StatusBadge';
import { MOCK_REQUESTS } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import type { RequestType } from '@/types';

const requestTypes = [
  { type: 'DTR' as RequestType, label: 'File DTR', desc: 'Daily Time Record', icon: Clock, color: '#7C3AED', bg: '#f5f3ff' },
  { type: 'ATR' as RequestType, label: 'File ATR', desc: 'Authority to Travel', icon: Car, color: '#0EA5E9', bg: '#f0f9ff' },
  { type: 'Leave' as RequestType, label: 'Leave Application', desc: 'Vacation, Sick, or Special Leave', icon: CalendarOff, color: '#16A34A', bg: '#f0fdf4' },
  { type: 'OBR Signature' as RequestType, label: 'OBR Signature', desc: 'Request OBR approval signature', icon: PenLine, color: '#D97706', bg: '#fffbeb' },
  { type: 'Purchase Request' as RequestType, label: 'Purchase Request', desc: 'Goods and services procurement', icon: ShoppingBag, color: '#DC2626', bg: '#fef2f2' },
];

export default function MyRequestsPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<RequestType | 'All'>('All');
  const myRequests = MOCK_REQUESTS.filter(r => r.employeeId === user?.employeeId);
  const filtered = filter === 'All' ? myRequests : myRequests.filter(r => r.type === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My e-Requests"
        description="File and track your requests"
        icon={Inbox}
      />

      {/* New Request Cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">File a New Request</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {requestTypes.map(rt => (
            <button
              key={rt.type}
              className="flex flex-col items-center p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group text-center"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                style={{ background: rt.bg }}
              >
                <rt.icon className="w-6 h-6" style={{ color: rt.color }} />
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-tight">{rt.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{rt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* My Requests Table */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold">My Request History</CardTitle>
              <CardDescription className="text-xs">{myRequests.length} total requests</CardDescription>
            </div>
            <div className="flex flex-wrap gap-1">
              {(['All', 'DTR', 'ATR', 'Leave', 'OBR Signature', 'Purchase Request'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {f === 'All' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    {['Reference No.', 'Type', 'Description', 'Date Filed', 'Status', 'Remarks'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors cursor-pointer">
                      <td className="py-3 pr-4 text-xs font-mono text-blue-700 font-semibold whitespace-nowrap">{req.referenceNo}</td>
                      <td className="py-3 pr-4"><TypeBadge type={req.type} /></td>
                      <td className="py-3 pr-4 text-xs text-slate-600 max-w-[200px]">
                        <p className="truncate">{req.description}</p>
                        {req.fromDate && <p className="text-[10px] text-slate-400">{req.fromDate} → {req.toDate}</p>}
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">{req.dateFiled}</td>
                      <td className="py-3 pr-4"><StatusBadge status={req.status} /></td>
                      <td className="py-3 text-xs text-slate-500 max-w-[160px]">
                        <p className="truncate italic">{req.remarks || '—'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
