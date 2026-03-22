import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Download, Printer } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { MOCK_BUDGET_RECORDS, MOCK_MONTHLY_UTILIZATION, getBudgetSummaryFromRecords, formatPeso } from '@/data/mockData';
import { useBudgetStore } from '@/stores/budgetStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function utilizationColor(rate: number) {
  if (rate >= 75) return 'bg-red-50 text-red-700 border-red-200';
  if (rate >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (rate > 0)   return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return           'bg-slate-50 text-slate-500 border-slate-200';
}

export default function UtilizationPage() {
  const { importedRecords, isImported } = useBudgetStore();
  const records = isImported ? importedRecords : MOCK_BUDGET_RECORDS;
  const { totalAppropriation, totalObligation, totalBalance, avgUtilization } = getBudgetSummaryFromRecords(records);

  // Trim long office names for chart labels
  const chartData = records.map(r => ({
    office: r.office.length > 20 ? r.office.slice(0, 20) + '…' : r.office,
    fullName: r.office,
    Appropriation: r.appropriation,
    Obligation: r.obligation,
    Balance: r.balance,
    Rate: r.utilization,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilization Report"
        description="Budget utilization rate by office and period"
        icon={TrendingUp}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        }
      />

      {/* Summary row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Total Appropriation', value: formatPeso(totalAppropriation), color: 'text-blue-700' },
          { label: 'Total Obligation',    value: formatPeso(totalObligation),    color: 'text-violet-700' },
          { label: 'Total Balance',       value: formatPeso(totalBalance),       color: 'text-emerald-700' },
          { label: 'Avg Utilization',     value: `${avgUtilization.toFixed(2)}%`, color: avgUtilization >= 75 ? 'text-red-600' : avgUtilization >= 50 ? 'text-amber-600' : 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar Chart */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Appropriation vs. Obligation by Office</CardTitle>
          <CardDescription className="text-xs">FY 2025 · All offices</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 40, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="office"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={90}
              />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₱${(v / 1000000).toFixed(0)}M`} />
              <Tooltip
                formatter={(v: number) => `₱${(v / 1000000).toFixed(2)}M`}
                labelFormatter={(label) => chartData.find(d => d.office === label)?.fullName || label}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Appropriation" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Obligation"    fill="#7C3AED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Balance"       fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Monthly Utilization Rate (%)</CardTitle>
          <CardDescription className="text-xs">FY 2025 – Jan to Jun progress</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_MONTHLY_UTILIZATION} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Utilization']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="utilizationRate" stroke="#1D4ED8" strokeWidth={2.5} dot={{ r: 4, fill: '#1D4ED8' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Utilization Summary Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  {['Office', 'Appropriation', 'Obligation', 'Balance', 'Utilization %'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-4 text-xs font-medium text-slate-800 max-w-[240px]">
                      <p className="truncate">{r.office}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-xs font-mono text-slate-700">{formatPeso(r.appropriation)}</td>
                    <td className="py-2.5 pr-4 text-xs font-mono text-violet-700">{formatPeso(r.obligation)}</td>
                    <td className="py-2.5 pr-4 text-xs font-mono text-emerald-700">{formatPeso(r.balance)}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${utilizationColor(r.utilization)}`}>
                        {r.utilization.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
