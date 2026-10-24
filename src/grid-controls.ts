import type { ColumnDef, GridState } from './contract.ts';

type SortDir = GridState['sortDir'];

const NEXT_SORT_DIR: Record<SortDir, SortDir> = { none: 'asc', asc: 'desc', desc: 'none' };
const ARIA_SORT: Record<SortDir, string> = { none: 'none', asc: 'ascending', desc: 'descending' };

// Used when data-page-size is missing or is not a positive integer.
const DEFAULT_PAGE_SIZE = 5;

export function nextSortDir(dir: SortDir): SortDir {
  return NEXT_SORT_DIR[dir];
}

export function readPageSize(element: HTMLElement): number {
  const value = Number(element.dataset.pageSize);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_PAGE_SIZE;
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

export function bindFilterForm(form: HTMLFormElement, onFilter: (text: string) => void): () => void {
  const onInput = (event: Event): void => {
    if (event.target instanceof HTMLInputElement) {
      onFilter(event.target.value);
    }
  };
  // Enter in the filter field must not reload the page.
  const onSubmit = (event: Event): void => {
    event.preventDefault();
  };

  form.addEventListener('input', onInput);
  form.addEventListener('submit', onSubmit);
  return () => {
    form.removeEventListener('input', onInput);
    form.removeEventListener('submit', onSubmit);
  };
}

export function bindPagination(nav: HTMLElement, onStep: (step: number) => void): () => void {
  const onClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest('button');
    if (button === null) {
      return;
    }
    if (button.id === 'prev-page') {
      onStep(-1);
    } else if (button.id === 'next-page') {
      onStep(1);
    }
  };

  nav.addEventListener('click', onClick);
  return () => nav.removeEventListener('click', onClick);
}

export function applyPaginationState(nav: HTMLElement, page: number, pageCount: number): void {
  const prev = nav.querySelector<HTMLButtonElement>('#prev-page');
  const next = nav.querySelector<HTMLButtonElement>('#next-page');
  if (prev === null || next === null) {
    throw new Error('Missing #prev-page or #next-page in index.html.');
  }

  // A disabled button loses focus, so move focus to the other button first.
  const active = document.activeElement;
  prev.disabled = page <= 1;
  next.disabled = page >= pageCount;
  if (active === next && next.disabled && !prev.disabled) {
    prev.focus();
  } else if (active === prev && prev.disabled && !next.disabled) {
    next.focus();
  }
}

export function renderStatus(
  status: HTMLElement,
  view: { matchCount: number; total: number; page: number; pageCount: number },
): void {
  status.textContent =
    view.matchCount === 0
      ? 'No rows match the filter.'
      : `Showing ${view.matchCount} of ${view.total} rows. Page ${view.page} of ${view.pageCount}.`;
}
