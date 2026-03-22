import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: { value: number; label: string; isPositive: boolean };
  className?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, className }: KpiCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono leading-none tracking-tight truncate">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <div className="mt-3 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={cn('text-xs font-medium', trend.isPositive ? 'text-emerald-600' : 'text-red-600')}>
                {trend.value}%
              </span>
              <span className="text-xs text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-200', iconBg)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </div>
  );
}
