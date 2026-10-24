import type { ColumnDef, GridState } from './contract.ts';

type SortDir = GridState['sortDir'];

const NEXT_SORT_DIR: Record<SortDir, SortDir> = { none: 'asc', asc: 'desc', desc: 'none' };
const ARIA_SORT: Record<SortDir, string> = { none: 'none', asc: 'ascending', desc: 'descending' };

export function nextSortDir(dir: SortDir): SortDir {
  return NEXT_SORT_DIR[dir];
}

export function bindSortHeaders<T>(
  thead: HTMLTableSectionElement,
  columns: ColumnDef<T>[],
  onSort: (accessorKey: keyof T) => void,
): () => void {
  const onClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const cell = event.target.closest('button')?.closest('th');
    if (!cell) {
      return;
    }
    const column = columns[cell.cellIndex];
    if (column === undefined || column.sortable === false) {
      return;
    }
    onSort(column.accessorKey);
  };

  thead.addEventListener('click', onClick);
  return () => thead.removeEventListener('click', onClick);
}

export function applySortState(thead: HTMLTableSectionElement, sortedIndex: number, sortDir: SortDir): void {
  const headers = thead.querySelectorAll<HTMLTableCellElement>('th');
  headers.forEach((header, index) => {
    const isSorted = index === sortedIndex;
    header.setAttribute('aria-sort', isSorted ? ARIA_SORT[sortDir] : 'none');
    header.classList.toggle('is-sorted', isSorted && sortDir !== 'none');
  });
}
