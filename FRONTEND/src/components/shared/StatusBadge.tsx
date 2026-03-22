import { cn } from '@/lib/utils';
import type { RequestStatus, RequestType } from '@/types';

const statusConfig: Record<RequestStatus, { label: string; classes: string }> = {
  Approved: { label: 'Approved', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  Pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  Rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border border-red-200' },
  'For Review': { label: 'For Review', classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
};

const typeConfig: Record<RequestType, { classes: string }> = {
  DTR: { classes: 'bg-violet-50 text-violet-700 border border-violet-200' },
  ATR: { classes: 'bg-sky-50 text-sky-700 border border-sky-200' },
  Leave: { classes: 'bg-teal-50 text-teal-700 border border-teal-200' },
  'OBR Signature': { classes: 'bg-orange-50 text-orange-700 border border-orange-200' },
  'Purchase Request': { classes: 'bg-pink-50 text-pink-700 border border-pink-200' },
};

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

interface TypeBadgeProps {
  type: RequestType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.classes, className)}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {config.label}
    </span>
  );
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const config = typeConfig[type];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.classes, className)}>
      {type}
    </span>
  );
}

interface ObligationStatusBadgeProps {
  status: 'Approved' | 'Pending' | 'Cancelled';
}

export function ObligationStatusBadge({ status }: ObligationStatusBadgeProps) {
  const map = {
    Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    Cancelled: 'bg-slate-100 text-slate-600 border border-slate-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', map[status])}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
}
