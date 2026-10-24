import type { ColumnDef } from './contract.ts';

export interface PageResult<T> {
  pageRows: T[];
  page: number;
  pageCount: number;
}

export interface ViewState<T> {
  filterText: string;
  sortKey: keyof T | null;
  sortDir: 'none' | 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface View<T> extends PageResult<T> {
  matchCount: number;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'en', { sensitivity: 'base' });
}

export function filterRows<T>(rows: T[], columns: ColumnDef<T>[], text: string): T[] {
  const needle = text.trim().toLowerCase();
  if (needle === '') {
    return rows.slice();
  }
  return rows.filter((row) =>
    columns.some((column) => String(row[column.accessorKey]).toLowerCase().includes(needle)),
  );
}

export function sortRows<T>(rows: T[], key: keyof T, dir: 'asc' | 'desc'): T[] {
  const sign = dir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => sign * compareValues(a[key], b[key]));
}

export function paginate<T>(rows: T[], page: number, pageSize: number): PageResult<T> {
  const size = clamp(Math.floor(pageSize), 1, Math.max(1, rows.length));
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const current = clamp(Math.floor(page), 1, pageCount);
  const start = (current - 1) * size;
  return {
    pageRows: rows.slice(start, start + size),
    page: current,
    pageCount,
  };
}

export function buildView<T>(rows: T[], columns: ColumnDef<T>[], state: ViewState<T>): View<T> {
  const matched = filterRows(rows, columns, state.filterText);
  const sorted =
    state.sortKey === null || state.sortDir === 'none'
      ? matched
      : sortRows(matched, state.sortKey, state.sortDir);
  const { pageRows, page, pageCount } = paginate(sorted, state.page, state.pageSize);
  return { pageRows, page, pageCount, matchCount: matched.length };
}
