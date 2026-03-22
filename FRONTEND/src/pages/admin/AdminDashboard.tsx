import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { FileSpreadsheet, Scale, TrendingUp, ClipboardList, Database, Activity, BookOpen } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { db } from '@/backend/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const formatPeso = (v: number) =>
  `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminDashboard() {
  // ── Firestore live data ──────────────────────────────────────────
  const [ppaRecords,  setPpaRecords]  = useState<any[]>([]);
  const [oblRecords,  setOblRecords]  = useState<any[]>([]);
  const [stmtRecords, setStmtRecords] = useState<any[]>([]);

  useEffect(() => {
    const unsubPPA  = onSnapshot(doc(db, 'finance', 'ppa_summary'), s => setPpaRecords(s.exists()  ? (s.data().records ?? []) : []));
    const unsubObl  = onSnapshot(doc(db, 'finance', 'obligations'), s => setOblRecords(s.exists()  ? (s.data().records ?? []) : []));
    const unsubStmt = onSnapshot(doc(db, 'finance', 'statement'),   s => setStmtRecords(s.exists() ? (s.data().records ?? []) : []));
    return () => { unsubPPA(); unsubObl(); unsubStmt(); };
  }, []);

  // ── PPA KPIs ─────────────────────────────────────────────────────
  const dataRows              = ppaRecords.filter(r => !r.isHeader);
  const totalAppropriation    = dataRows.reduce((s, r) => s + (r.appropriation            ?? 0), 0);
  const totalAllotment        = dataRows.reduce((s, r) => s + (r.allotment                ?? 0), 0);
  const totalBalOfAppropriation = dataRows.reduce((s, r) => s + (r.balanceOfAppropriation ?? 0), 0);
  const avgUtilization        = dataRows.length > 0
    ? dataRows.reduce((s, r) => s + (r.utilizationRate ?? 0), 0) / dataRows.length : 0;

  // ── Obligations KPIs ─────────────────────────────────────────────
  const totalNetAmount = oblRecords.reduce((s, r) => s + (r.netApprovedAmount ?? 0), 0);
  const totalPayment   = oblRecords.reduce((s, r) => s + (r.payment           ?? 0), 0);
  const totalUnpaid    = Math.max(0, totalNetAmount - totalPayment);

  // ── Bar chart — top FPP by appropriation ─────────────────────────
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

  // ── Utilization breakdown for area chart ─────────────────────────
  const utilizationRows = dataRows
    .filter(r => r.fppCode && (r.utilizationRate ?? 0) > 0)
    .sort((a, b) => (b.utilizationRate ?? 0) - (a.utilizationRate ?? 0))
    .slice(0, 10)
    .map(r => ({
      name: (r.fppCode ?? '').slice(0, 12),
      fullName: r.programProjectActivity ?? r.fppCode,
      utilizationRate: parseFloat((r.utilizationRate ?? 0).toFixed(2)),
    }));

  const hasData = dataRows.length > 0;

  return (
    <div className="space-y-6">

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Appropriation"
          value={formatPeso(totalAppropriation)}
          subtitle={`${dataRows.length} PPA entries`}
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
          subtitle="Avg. across all PPA entries"
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Bar Chart — top FPP by appropriation */}
        <Card className="xl:col-span-2 shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Appropriation vs. Allotment vs. Obligation</CardTitle>
            <CardDescription className="text-xs">Top 8 FPP codes by Appropriation · Live PPA Summary data</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center h-[260px] text-slate-400">
                <Database className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No PPA data imported yet</p>
                <p className="text-xs mt-1 text-slate-300">Import an Excel file on the PPA Summary page</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 30, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} height={55} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₱${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value: number) => [`₱${(value / 1_000_000).toFixed(2)}M`, '']}
                    labelFormatter={label => barData.find(d => d.name === label)?.fullName ?? label}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
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
          <CardContent className="space-y-3 pt-2">
            {[
              { label: 'Net Approved Amount', value: totalNetAmount,  color: 'text-blue-700',   bg: 'bg-blue-50/70',   bar: '#1D4ED8' },
              { label: 'Total Payment Made',  value: totalPayment,    color: 'text-violet-700', bg: 'bg-violet-50/70', bar: '#7C3AED' },
              { label: 'Remaining Unpaid',    value: totalUnpaid,     color: 'text-rose-700',   bg: 'bg-rose-50/70',   bar: '#e11d48' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 border ${s.bg} border-slate-100`}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-sm font-bold font-mono mt-0.5 ${s.color}`}>{formatPeso(s.value)}</p>
                <div className="w-full bg-white/60 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${totalNetAmount > 0 ? Math.min((s.value / totalNetAmount) * 100, 100) : 0}%`, background: s.bar }} />
                </div>
              </div>
            ))}
            <div className="rounded-xl p-3 border bg-slate-50 border-slate-100">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Statement Records</p>
              <p className="text-sm font-bold font-mono mt-0.5 text-slate-700">{stmtRecords.length} entries loaded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Utilization Trend + PPA breakdown ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Utilization Rate – Top FPP Entries</CardTitle>
            <CardDescription className="text-xs">Live utilization rate per FPP Code from PPA Summary</CardDescription>
          </CardHeader>
          <CardContent>
            {utilizationRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[180px] text-slate-400">
                <Database className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No utilization data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={utilizationRows} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1D4ED8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, 'Utilization']}
                    labelFormatter={label => utilizationRows.find(d => d.name === label)?.fullName ?? label}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area type="monotone" dataKey="utilizationRate" stroke="#1D4ED8" strokeWidth={2} fill="url(#colorUtil)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* PPA Utilization Bars */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" /> Utilization by FPP
            </CardTitle>
            <CardDescription className="text-xs">Color-coded by threshold</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 overflow-y-auto max-h-[200px]">
            {dataRows.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No data</p>
            ) : (
              dataRows
                .filter(r => r.fppCode)
                .sort((a, b) => (b.utilizationRate ?? 0) - (a.utilizationRate ?? 0))
                .map((r, i) => {
                  const pct   = Math.min(r.utilizationRate ?? 0, 100);
                  const color = pct >= 75 ? '#ef4444' : pct >= 50 ? '#f59e0b' : '#22c55e';
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[10px] text-slate-600 truncate max-w-[70%]" title={r.programProjectActivity}>{r.fppCode}</p>
                        <span className="text-[10px] font-mono font-bold" style={{ color }}>{(r.utilizationRate ?? 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
