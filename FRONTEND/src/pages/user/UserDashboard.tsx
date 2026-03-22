import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { FileSpreadsheet, Scale, TrendingUp, ClipboardList, Database, Activity } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { db } from '@/backend/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const formatPeso = (v: number) =>
  `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function UserDashboard() {
  const { user } = useAuthStore();

  // ── Firestore live data ──────────────────────────────────────────
  const [ppaRecords, setPpaRecords]   = useState<any[]>([]);
  const [oblRecords, setOblRecords]   = useState<any[]>([]);
  const [stmtRecords, setStmtRecords] = useState<any[]>([]);

  useEffect(() => {
    const unsubPPA  = onSnapshot(doc(db, 'finance', 'ppa_summary'),  s => setPpaRecords(s.exists()  ? (s.data().records ?? []) : []));
    const unsubObl  = onSnapshot(doc(db, 'finance', 'obligations'),  s => setOblRecords(s.exists()  ? (s.data().records ?? []) : []));
    const unsubStmt = onSnapshot(doc(db, 'finance', 'statement'),    s => setStmtRecords(s.exists() ? (s.data().records ?? []) : []));
    return () => { unsubPPA(); unsubObl(); unsubStmt(); };
  }, []);

  // ── KPI computations from PPA Summary ───────────────────────────
  const dataRows = ppaRecords.filter(r => !r.isHeader);
  const totalAppropriation    = dataRows.reduce((s, r) => s + (r.appropriation            ?? 0), 0);
  const totalAllotment        = dataRows.reduce((s, r) => s + (r.allotment                ?? 0), 0);
  const totalBalOfAppropriation = dataRows.reduce((s, r) => s + (r.balanceOfAppropriation ?? 0), 0);
  const avgUtilization        = dataRows.length > 0
    ? dataRows.reduce((s, r) => s + (r.utilizationRate ?? 0), 0) / dataRows.length
    : 0;

  // ── Obligations KPIs ─────────────────────────────────────────────
  const totalNetAmount = oblRecords.reduce((s, r) => s + (r.netApprovedAmount ?? 0), 0);
  const totalPayment   = oblRecords.reduce((s, r) => s + (r.payment           ?? 0), 0);

  // ── Bar chart — top FPP codes by appropriation ──────────────────
  const barData = dataRows
    .filter(r => r.fppCode)
    .sort((a, b) => (b.appropriation ?? 0) - (a.appropriation ?? 0))
    .slice(0, 8)
    .map(r => ({
      name:          (r.fppCode ?? '').slice(0, 14),
      fullName:      r.programProjectActivity ?? r.fppCode,
      Appropriation: r.appropriation        ?? 0,
      Allotment:     r.allotment            ?? 0,
      Obligation:    r.obligation           ?? 0,
    }));

  const hasData = dataRows.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2557, #1D4ED8)' }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
        <p className="text-blue-200/80 text-sm font-medium">Welcome back,</p>
        <h2 className="text-2xl font-bold mt-1">{user?.name} 👋</h2>
        <p className="text-blue-200/70 text-sm mt-1">{user?.position} · {user?.office}</p>
        <div className="mt-4 flex flex-wrap gap-6">
          <div>
            <p className="text-blue-200/60 text-xs">Employee ID</p>
            <p className="text-white font-mono font-semibold text-sm">{user?.employeeId}</p>
          </div>
          <div>
            <p className="text-blue-200/60 text-xs">Utilization Rate</p>
            <p className="text-white font-semibold text-sm font-mono">{avgUtilization.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-blue-200/60 text-xs">PPA Records</p>
            <p className="text-white font-semibold text-sm">{dataRows.length} entries</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Appropriation"
          value={formatPeso(totalAppropriation)}
          subtitle="From PPA Summary"
          icon={FileSpreadsheet}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Total Allotment"
          value={formatPeso(totalAllotment)}
          subtitle="Released allotment"
          icon={ClipboardList}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <KpiCard
          title="Balance of Appropriation"
          value={formatPeso(totalBalOfAppropriation)}
          subtitle="Unobligated remaining"
          icon={Scale}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="Utilization Rate"
          value={`${avgUtilization.toFixed(2)}%`}
          subtitle="Avg. across all entries"
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Bar Chart + Obligations summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Budget Overview – Top FPP by Appropriation</CardTitle>
            <CardDescription className="text-xs">Live data from PPA Summary · {dataRows.length} records</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center h-[220px] text-slate-400">
                <Database className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No PPA data imported yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 30, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} height={52} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₱${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(v: number) => [`₱${(v / 1_000_000).toFixed(2)}M`, '']}
                    labelFormatter={label => barData.find(d => d.name === label)?.fullName ?? label}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Appropriation" fill="#1D4ED8" radius={[4,4,0,0]} />
                  <Bar dataKey="Allotment"     fill="#0891b2" radius={[4,4,0,0]} />
                  <Bar dataKey="Obligation"    fill="#7C3AED" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Obligations Summary */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-500" /> Obligations Summary
            </CardTitle>
            <CardDescription className="text-xs">{oblRecords.length} obligation records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              { label: 'Total Net Approved Amount', value: totalNetAmount, color: 'text-blue-700', bg: 'bg-blue-50', bar: '#1D4ED8' },
              { label: 'Total Payment Made',        value: totalPayment,   color: 'text-violet-700', bg: 'bg-violet-50', bar: '#7C3AED' },
              { label: 'Remaining Unpaid',          value: Math.max(0, totalNetAmount - totalPayment), color: 'text-rose-700', bg: 'bg-rose-50', bar: '#e11d48' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 border ${s.bg} border-slate-100`}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-sm font-bold font-mono mt-0.5 ${s.color}`}>{formatPeso(s.value)}</p>
                <div className="w-full bg-white/60 rounded-full h-1 mt-2 overflow-hidden">
                  <div className="h-1 rounded-full" style={{ width: `${totalNetAmount > 0 ? Math.min((s.value / totalNetAmount) * 100, 100) : 0}%`, background: s.bar }} />
                </div>
              </div>
            ))}
            <div className="rounded-xl p-3 border bg-slate-50 border-slate-100">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Statement Records</p>
              <p className="text-sm font-bold font-mono mt-0.5 text-slate-700">{stmtRecords.length} entries</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
