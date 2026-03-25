import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';

interface LocalPPARecord {
  fppCode: string;
  programProjectActivity: string;
  appropriation: number;
  allotment: number;
  obligation: number;
  balanceOfAppropriation: number;
  balanceOfAllotment: number;
  utilizationRate: number;
  isHeader?: boolean;
}

interface InsightsProps {
  oldRecords: LocalPPARecord[];
  newRecords: LocalPPARecord[];
}

const formatDiff = (diff: number) => {
  if (diff === 0) return 'No Change';
  const prefix = diff > 0 ? '+' : '';
  return `${prefix}₱${Math.abs(diff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPctDiff = (diff: number) => {
  if (diff === 0) return 'No Change';
  const prefix = diff > 0 ? '+' : '';
  return `${prefix}${Math.abs(diff).toFixed(2)}%`;
};

const DiffBadge = ({ value, invertColors = false, isPercent = false }: { value: number, invertColors?: boolean, isPercent?: boolean }) => {
  if (value === 0) return <span className="text-slate-400 font-mono text-xs flex items-center gap-1"><Minus className="w-3 h-3" /> No Change</span>;
  const isPositive = value > 0;
  // For things like available balance, increase is good. For obligations, increase might be neutral or bad. We'll stick to a standard: positive = green, negative = red. Unless invertColors is true (like Utilization, though higher utilization is actually good in budget execution usually. Let's not invert by default)
  const isGood = invertColors ? !isPositive : isPositive;
  return (
    <span className={`font-mono text-xs font-bold flex items-center gap-0.5 ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {isPercent ? formatPctDiff(value) : formatDiff(value)}
    </span>
  );
};

export function PpaInsights({ oldRecords, newRecords }: InsightsProps) {
  const [filter, setFilter] = useState<'All' | 'Changed'>('Changed');

  const insights = useMemo(() => {
    const oldFiltered = oldRecords.filter(r => !r.isHeader);
    const newFiltered = newRecords.filter(r => !r.isHeader);

    const oldMap = new Map(oldFiltered.map(r => [r.fppCode || r.programProjectActivity, r]));
    const newMap = new Map(newFiltered.map(r => [r.fppCode || r.programProjectActivity, r]));

    const changes = [];
    let totAppropDiff = 0;
    let totAllotDiff = 0;
    let totObligDiff = 0;
    let totBalAppropDiff = 0;

    for (const [key, newRow] of newMap.entries()) {
      const oldRow = oldMap.get(key);
      if (!oldRow) {
        // Added
        changes.push({ status: 'Added', ppa: newRow.programProjectActivity, fpp: newRow.fppCode, oldRow: null, newRow, diffs: {} });
        totAppropDiff += newRow.appropriation || 0;
        totAllotDiff += newRow.allotment || 0;
        totObligDiff += newRow.obligation || 0;
        totBalAppropDiff += newRow.balanceOfAppropriation || 0;
      } else {
        // Exists in both, check differences
        const appropDiff = (newRow.appropriation || 0) - (oldRow.appropriation || 0);
        const allotDiff = (newRow.allotment || 0) - (oldRow.allotment || 0);
        const obligDiff = (newRow.obligation || 0) - (oldRow.obligation || 0);
        const balAppropDiff = (newRow.balanceOfAppropriation || 0) - (oldRow.balanceOfAppropriation || 0);
        const balAllotDiff = (newRow.balanceOfAllotment || 0) - (oldRow.balanceOfAllotment || 0);
        const utilDiff = (newRow.utilizationRate || 0) - (oldRow.utilizationRate || 0);

        totAppropDiff += appropDiff;
        totAllotDiff += allotDiff;
        totObligDiff += obligDiff;
        totBalAppropDiff += balAppropDiff;

        if (appropDiff !== 0 || allotDiff !== 0 || obligDiff !== 0 || balAppropDiff !== 0 || balAllotDiff !== 0 || utilDiff !== 0) {
          changes.push({
            status: 'Modified',
            ppa: newRow.programProjectActivity,
            fpp: newRow.fppCode,
            oldRow,
            newRow,
            diffs: { appropDiff, allotDiff, obligDiff, balAppropDiff, balAllotDiff, utilDiff }
          });
        } else {
          changes.push({ status: 'Unchanged', ppa: newRow.programProjectActivity, fpp: newRow.fppCode, oldRow, newRow, diffs: { appropDiff: 0, allotDiff: 0, obligDiff: 0, balAppropDiff: 0, balAllotDiff: 0, utilDiff: 0 } });
        }
      }
    }

    for (const [key, oldRow] of oldMap.entries()) {
      if (!newMap.has(key)) {
        changes.push({ status: 'Removed', ppa: oldRow.programProjectActivity, fpp: oldRow.fppCode, oldRow, newRow: null, diffs: {} });
        totAppropDiff -= oldRow.appropriation || 0;
        totAllotDiff -= oldRow.allotment || 0;
        totObligDiff -= oldRow.obligation || 0;
        totBalAppropDiff -= oldRow.balanceOfAppropriation || 0;
      }
    }

    // Sort: Modified first, Added, Removed, then Unchanged
    const order: Record<string, number> = { 'Modified': 1, 'Added': 2, 'Removed': 3, 'Unchanged': 4 };
    changes.sort((a, b) => order[a.status] - order[b.status]);

    return { changes, totAppropDiff, totAllotDiff, totObligDiff, totBalAppropDiff };
  }, [oldRecords, newRecords]);

  const displayChanges = filter === 'Changed' ? insights.changes.filter(c => c.status !== 'Unchanged') : insights.changes;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-none border-blue-100 bg-blue-50/50">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 font-semibold uppercase">Total Approp. Sync</p>
            <p className="mt-1"><DiffBadge value={insights.totAppropDiff} /></p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-cyan-100 bg-cyan-50/50">
          <CardContent className="p-4">
            <p className="text-xs text-cyan-600 font-semibold uppercase">Total Allotment Sync</p>
            <p className="mt-1"><DiffBadge value={insights.totAllotDiff} /></p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-violet-100 bg-violet-50/50">
          <CardContent className="p-4">
            <p className="text-xs text-violet-600 font-semibold uppercase">Total Obligation Sync</p>
            <p className="mt-1"><DiffBadge value={insights.totObligDiff} invertColors /></p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-emerald-100 bg-emerald-50/50">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 font-semibold uppercase">Net Bal Approp. Sync</p>
            <p className="mt-1"><DiffBadge value={insights.totBalAppropDiff} /></p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-end border-b pb-2">
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Granular PPA AI-Assisted Insights
          </h3>
          <p className="text-xs text-slate-500">Row-by-row comparative analysis against the current live database.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setFilter('Changed')} className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${filter === 'Changed' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Changes Only</button>
          <button onClick={() => setFilter('All')} className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${filter === 'All' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Show All Rows</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-xs text-slate-500">
            <tr>
              <th className="p-3 font-semibold">Program / Project / Activity</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 text-right font-semibold">Approp. Diff</th>
              <th className="p-3 text-right font-semibold">Obligation Diff</th>
              <th className="p-3 text-right font-semibold">Bal Approp. Diff</th>
              <th className="p-3 text-right font-semibold">Util Rate Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayChanges.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No changes detected between this archive and the live database.</td></tr>
            ) : displayChanges.map((ch, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="p-3 max-w-[280px]">
                  <p className="font-mono text-[10px] text-blue-600 font-bold">{ch.fpp}</p>
                  <p className="text-xs text-slate-700 truncate font-medium" title={ch.ppa}>{ch.ppa}</p>
                </td>
                <td className="p-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    ch.status === 'Added' ? 'bg-emerald-100 text-emerald-700' :
                    ch.status === 'Removed' ? 'bg-rose-100 text-rose-700' :
                    ch.status === 'Modified' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{ch.status}</span>
                </td>
                <td className="p-3 text-right">
                  {ch.status === 'Modified' ? <DiffBadge value={ch.diffs.appropDiff!} /> : 
                   ch.status === 'Added' ? <DiffBadge value={ch.newRow!.appropriation || 0} /> :
                   ch.status === 'Removed' ? <DiffBadge value={-(ch.oldRow!.appropriation || 0)} /> :
                   <span className="text-slate-300 text-xs">—</span>}
                </td>
                <td className="p-3 text-right">
                  {ch.status === 'Modified' ? <DiffBadge value={ch.diffs.obligDiff!} invertColors /> : 
                   ch.status === 'Added' ? <DiffBadge value={ch.newRow!.obligation || 0} invertColors /> :
                   ch.status === 'Removed' ? <DiffBadge value={-(ch.oldRow!.obligation || 0)} invertColors /> :
                   <span className="text-slate-300 text-xs">—</span>}
                </td>
                <td className="p-3 text-right">
                  {ch.status === 'Modified' ? <DiffBadge value={ch.diffs.balAppropDiff!} /> : 
                   ch.status === 'Added' ? <DiffBadge value={ch.newRow!.balanceOfAppropriation || 0} /> :
                   ch.status === 'Removed' ? <DiffBadge value={-(ch.oldRow!.balanceOfAppropriation || 0)} /> :
                   <span className="text-slate-300 text-xs">—</span>}
                </td>
                <td className="p-3 text-right flex justify-end">
                  {ch.status === 'Modified' ? <DiffBadge value={ch.diffs.utilDiff!} isPercent /> : 
                   ch.status === 'Added' ? <DiffBadge value={ch.newRow!.utilizationRate || 0} isPercent /> :
                   ch.status === 'Removed' ? <DiffBadge value={-(ch.oldRow!.utilizationRate || 0)} isPercent /> :
                   <span className="text-slate-300 text-xs">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
