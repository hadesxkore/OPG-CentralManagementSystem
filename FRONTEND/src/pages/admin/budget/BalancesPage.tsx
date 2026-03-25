import { useEffect, useState } from 'react';
import { Scale, Database } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatPeso } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { db } from '@/backend/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { PPARecord } from '@/types';

function getUtilColor(rate: number) {
  if (rate >= 75) return { text: 'text-red-600',     bar: 'bg-red-500' };
  if (rate >= 50) return { text: 'text-amber-600',   bar: 'bg-amber-500' };
  if (rate > 0)   return { text: 'text-emerald-600', bar: 'bg-emerald-500' };
  return           { text: 'text-slate-400',       bar: 'bg-slate-300' };
}

export default function BalancesPage() {
  const [records, setRecords] = useState<PPARecord[]>([]);
  const [isImported, setIsImported] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'finance', 'ppa_summary'), s => {
      if (s.exists() && s.data().records) {
        setRecords(s.data().records);
        setIsImported(true);
      } else {
        setRecords([]);
        setIsImported(false);
      }
    });
    return () => unsub();
  }, []);

  const dataRows = records.filter(r => !r.isHeader);
  const totalAppropriation = dataRows.reduce((sum, r) => sum + (r.appropriation || 0), 0);
  const totalObligation    = dataRows.reduce((sum, r) => sum + (r.obligation || 0), 0);
  const totalBalance       = totalAppropriation - totalObligation;
  const avgUtilization     = dataRows.length > 0 
    ? dataRows.reduce((sum, r) => sum + (r.utilizationRate || 0), 0) / dataRows.length 
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balances"
        description="Available budget per Program / Project / Activity (Appropriation minus Obligation)"
        icon={Scale}
      />

      {/* Overall summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Appropriation',  value: formatPeso(totalAppropriation), border: 'border-l-blue-500',    text: 'text-blue-700' },
          { label: 'Total Obligation',     value: formatPeso(totalObligation),    border: 'border-l-violet-500',  text: 'text-violet-700' },
          { label: 'Net Available Balance',value: formatPeso(totalBalance),       border: 'border-l-emerald-500', text: 'text-emerald-700' },
        ].map(s => (
          <Card key={s.label} className={`shadow-sm border-slate-100 border-l-4 ${s.border}`}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-xl font-bold font-mono mt-1 ${s.text}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall utilization bar */}
      <Card className="shadow-sm border-slate-100">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Overall Utilization Rate</span>
            <span className={`text-sm font-bold font-mono ${getUtilColor(avgUtilization).text}`}>{avgUtilization.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${getUtilColor(avgUtilization).bar}`}
              style={{ width: `${Math.min(avgUtilization, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{dataRows.length} PPA entries · {isImported ? 'Live PPA Data' : 'No Data Available'}</p>
        </CardContent>
      </Card>

      {/* Office-by-office cards */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Balance by Program / Project / Activity</CardTitle>
          <CardDescription className="text-xs">Based on latest PPA Summary sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dataRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Database className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No balances to show</p>
              <p className="text-xs mt-1">Please import PPA Summary data first.</p>
            </div>
          ) : (
            dataRows.map(ob => {
              const utilRate = ob.utilizationRate || 0;
              const uc = getUtilColor(utilRate);
              const bal = (ob.appropriation || 0) - (ob.obligation || 0);

              return (
                <div key={ob.id || Math.random()} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-mono text-blue-600 font-semibold mb-0.5">{ob.fppCode}</p>
                      <p className="text-sm font-semibold text-slate-800 leading-snug max-w-[90%]">{ob.programProjectActivity}</p>
                    </div>
                    <span className={`text-sm font-bold font-mono ml-3 flex-shrink-0 ${uc.text}`}>{utilRate.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${uc.bar}`}
                      style={{ width: `${Math.min(utilRate, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Appropriation</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{formatPeso(ob.appropriation || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Obligation</p>
                      <p className="text-xs font-mono font-bold text-violet-700">{formatPeso(ob.obligation || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Balance</p>
                      <p className={cn('text-xs font-mono font-bold', bal < 0 ? 'text-red-600' : 'text-emerald-700')}>{formatPeso(bal)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
