import type { ColumnDef, GridState, Member } from './contract.ts';
import {
  applyPaginationState,
  applySortState,
  bindFilterForm,
  bindPagination,
  bindSortHeaders,
  nextSortDir,
  readPageSize,
  renderStatus,
} from './grid-controls.ts';
import { buildView } from './grid-model.ts';
import { renderRows } from './grid-render.ts';
import { members } from './sample-data.ts';

function queryRequired<E extends Element>(selector: string): E {
  const element = document.querySelector<E>(selector);
  if (element === null) {
    throw new Error(`Missing ${selector} in index.html.`);
  }
  return element;
}

const columns: ColumnDef<Member>[] = [
  { header: 'Name', accessorKey: 'name', sortable: true },
  { header: 'Role', accessorKey: 'role', sortable: true },
  { header: 'City', accessorKey: 'city', sortable: true },
  { header: 'Score', accessorKey: 'score', sortable: true },
];

const section = queryRequired<HTMLElement>('section[data-page-size]');
const form = queryRequired<HTMLFormElement>('#grid-controls');
const tbody = queryRequired<HTMLTableSectionElement>('#grid-body');
const thead = queryRequired<HTMLTableSectionElement>('thead');
const nav = queryRequired<HTMLElement>('nav[aria-label="Pagination"]');
const status = queryRequired<HTMLElement>('#grid-status');

const state: GridState = {
  sortKey: null,
  sortDir: 'none',
  filterText: '',
  page: 1,
  pageSize: readPageSize(section),
  selectedIds: new Set<string>(),
};

const render = (): void => {
  const sortedIndex = columns.findIndex((column) => column.accessorKey === state.sortKey);
  const sortKey = sortedIndex === -1 ? null : columns[sortedIndex].accessorKey;
  const view = buildView(members, columns, {
    filterText: state.filterText,
    sortKey,
    sortDir: state.sortDir,
    page: state.page,
    pageSize: state.pageSize,
  });
  state.page = view.page;
  renderRows(tbody, view.pageRows, columns, state.selectedIds);
  applySortState(thead, sortedIndex, state.sortDir);
  applyPaginationState(nav, view.page, view.pageCount);
  renderStatus(status, {
    matchCount: view.matchCount,
    total: members.length,
    page: view.page,
    pageCount: view.pageCount,
  });
};

bindSortHeaders(thead, columns, (accessorKey) => {
  const current = state.sortKey === accessorKey ? state.sortDir : 'none';
  const next = nextSortDir(current);
  state.sortKey = next === 'none' ? null : accessorKey;
  state.sortDir = next;
  state.page = 1;
  render();
});

bindFilterForm(form, (text) => {
  state.filterText = text;
  state.page = 1;
  render();
});

bindPagination(nav, (step) => {
  state.page += step;
  render();
});

render();
