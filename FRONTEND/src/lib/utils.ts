import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function formatParsedDate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = d.getSeconds();

  // If there's non-zero hours or minutes, include 12-hour format AM/PM
  if (hours > 0 || mins !== '00' || secs > 0) {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    return `${month}/${day}/${year} ${formattedHour}:${mins} ${ampm}`;
  }
  return `${month}/${day}/${year}`;
}

export function formatDisplayDate(val: any): string {
  if (val === null || val === undefined || val === '') return '';

  // 1. JS Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    return formatParsedDate(val);
  }

  // 2. Firestore Timestamp { seconds, nanoseconds } or has toDate()
  if (typeof val === 'object' && val !== null) {
    if (typeof val.toDate === 'function') {
      const d = val.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return formatParsedDate(d);
    }
    if (typeof val.seconds === 'number') {
      const d = new Date(val.seconds * 1000);
      if (!isNaN(d.getTime())) return formatParsedDate(d);
    }
  }

  const str = String(val).trim();
  if (!str) return '';

  // 3. Raw GMT strings (e.g., Fri Jan 09 2026 01:54:59 GMT+0800 (Philippine Standard Time)), ISO strings, or Date string patterns
  const isGmtOrTimezone = /GMT|UTC|Time|PST|EST|CST|MST/i.test(str);
  const isIsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str);
  const isLongDatePattern = /^[A-Za-z]{3}\s+[A-Za-z]{3}\s+\d{1,2}\s+\d{4}/.test(str);
  const hasMonthName = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(str);

  if (isGmtOrTimezone || isIsoDate || isLongDatePattern || hasMonthName) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return formatParsedDate(d);
    }
  }

  // 4. Standard YYYY-MM-DD or YYYY-MM-DD HH:mm(:ss)
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/.test(str)) {
    const d = new Date(str.replace(/-/g, '/'));
    if (!isNaN(d.getTime())) {
      return formatParsedDate(d);
    }
  }

  // If already clean string or custom description, return as-is
  return str;
}

export function isDateInRange(dateVal: any, startDateStr: string, endDateStr: string): boolean {
  if (!startDateStr && !endDateStr) return true;
  if (!dateVal) return false;

  let d: Date | null = null;
  if (dateVal instanceof Date) {
    d = dateVal;
  } else if (typeof dateVal === 'object' && dateVal !== null && typeof (dateVal as any).seconds === 'number') {
    d = new Date((dateVal as any).seconds * 1000);
  } else if (typeof dateVal === 'string') {
    const str = dateVal.trim();
    if (!str) return false;
    const parsed = new Date(str.replace(/-/g, '/'));
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    } else {
      const fallback = new Date(str);
      if (!isNaN(fallback.getTime())) d = fallback;
    }
  }

  if (!d || isNaN(d.getTime())) return false;

  const targetTime = d.getTime();

  if (startDateStr) {
    const start = new Date(startDateStr + 'T00:00:00').getTime();
    if (!isNaN(start) && targetTime < start) return false;
  }

  if (endDateStr) {
    const end = new Date(endDateStr + 'T23:59:59.999').getTime();
    if (!isNaN(end) && targetTime > end) return false;
  }

  return true;
}
