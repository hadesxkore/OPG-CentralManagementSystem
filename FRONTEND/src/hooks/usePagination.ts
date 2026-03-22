import { useState, useMemo } from 'react';

/** Builds a compact page number list with ellipsis, e.g. [1, '…', 4, 5, 6, '…', 12] */
export function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [];
  const addPage = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  addPage(1);
  if (current > 3) pages.push('…');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) addPage(i);
  if (current < total - 2) pages.push('…');
  addPage(total);
  return pages;
}

export function usePagination<T>(items: T[], pageSize = 25) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 whenever items change (e.g. new search)
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  const goTo = (n: number) => setPage(Math.max(1, Math.min(n, totalPages)));

  return { paged, page: safePage, totalPages, goTo };
}
