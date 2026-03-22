import { Shield, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePOPSStore, POPS_OFFICES } from '@/stores/popsStore';
import { formatPeso } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export default function POPSDashboard() {
  const { records } = usePOPSStore();
  const navigate = useNavigate();

  // Aggregate stats across all offices
  const allRecords = Object.values(records).flat();
  const totalPR = allRecords.reduce((s, r) => s + r.prAmount, 0);
  const totalPD = allRecords.reduce((s, r) => s + r.pdAmount, 0);
  const totalDV = allRecords.reduce((s, r) => s + r.dvAmount, 0);
  const totalBal = allRecords.reduce((s, r) => s + r.balanceSavings, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="POPS Division Dashboard"
        description="Peace and Order / Public Safety — Division Overview"
        icon={Shield}
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total PR Amount',  value: formatPeso(totalPR),  bar: 'bg-blue-500',    color: 'text-blue-700',    icon: FileText },
          { label: 'Total P.D Amount', value: formatPeso(totalPD),  bar: 'bg-violet-500',  color: 'text-violet-700',  icon: BarChart3 },
          { label: 'Total D.V Amount', value: formatPeso(totalDV),  bar: 'bg-cyan-500',    color: 'text-cyan-700',    icon: TrendingUp },
          { label: 'Balances/Savings', value: formatPeso(totalBal), bar: 'bg-emerald-500', color: 'text-emerald-700', icon: Shield },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100 overflow-hidden">
            <CardContent className="p-4">
              <div className={`w-8 h-1 rounded-full mb-2.5 ${s.bar}`} />
              <p className="text-[11px] text-slate-400 leading-tight mb-1">{s.label}</p>
              <p className={`text-sm font-bold font-mono leading-tight ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total entries */}
      <Card className="shadow-sm border-slate-100">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-slate-700 mb-1">Total Entries Across All Offices</p>
          <p className="text-2xl font-bold text-blue-700 font-mono">{allRecords.length}</p>
        </CardContent>
      </Card>

      {/* Office Overview Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Divisions / Offices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {POPS_OFFICES.map(office => {
            const officeRecords = records[office.key] || [];
            const totalPROffice = officeRecords.reduce((s, r) => s + r.prAmount, 0);
            const count = officeRecords.length;
            return (
              <Card
                key={office.key}
                className="shadow-sm border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(`/pops/office/${office.key}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {office.label}
                    </span>
                    <span className="text-[11px] text-slate-400">{count} {count === 1 ? 'entry' : 'entries'}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-1">{office.fullName}</p>
                  <p className="text-sm font-bold font-mono text-slate-700 group-hover:text-blue-700 transition-colors">
                    {formatPeso(totalPROffice)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
