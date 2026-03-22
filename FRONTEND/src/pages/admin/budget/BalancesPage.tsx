import { Scale } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { MOCK_BUDGET_RECORDS, getBudgetSummaryFromRecords, formatPeso } from '@/data/mockData';
import { useBudgetStore } from '@/stores/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function getUtilColor(rate: number) {
  if (rate >= 75) return { text: 'text-red-600',     bar: 'bg-red-500' };
  if (rate >= 50) return { text: 'text-amber-600',   bar: 'bg-amber-500' };
  if (rate > 0)   return { text: 'text-emerald-600', bar: 'bg-emerald-500' };
  return           { text: 'text-slate-400',       bar: 'bg-slate-300' };
}

export default function BalancesPage() {
  const { importedRecords, isImported } = useBudgetStore();
  const records = isImported ? importedRecords : MOCK_BUDGET_RECORDS;
  const { totalAppropriation, totalObligation, totalBalance, avgUtilization } = getBudgetSummaryFromRecords(records);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balances"
        description="Available budget per office (Appropriation minus Obligation)"
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
          <p className="text-xs text-slate-400 mt-2">{records.length} offices · {isImported ? 'Imported data' : 'Mock data'}</p>
        </CardContent>
      </Card>

      {/* Office-by-office cards */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Balance by Office</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.map(ob => {
            const uc = getUtilColor(ob.utilization);
            return (
              <div key={ob.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-800 leading-snug max-w-[80%]">{ob.office}</p>
                  <span className={`text-sm font-bold font-mono ml-3 flex-shrink-0 ${uc.text}`}>{ob.utilization.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${uc.bar}`}
                    style={{ width: `${Math.min(ob.utilization, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Appropriation</p>
                    <p className="text-xs font-mono font-bold text-slate-700">{formatPeso(ob.appropriation)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Obligation</p>
                    <p className="text-xs font-mono font-bold text-violet-700">{formatPeso(ob.obligation)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Balance</p>
                    <p className={cn('text-xs font-mono font-bold', ob.balance < 0 ? 'text-red-600' : 'text-emerald-700')}>{formatPeso(ob.balance)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
