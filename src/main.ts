import type { ColumnDef, GridState, Member } from './contract.ts';
import { applySortState, bindSortHeaders, nextSortDir } from './grid-controls.ts';
import { buildView } from './grid-model.ts';
import { renderRows } from './grid-render.ts';
import { members } from './sample-data.ts';

const columns: ColumnDef<Member>[] = [
  { header: 'Name', accessorKey: 'name', sortable: true },
  { header: 'Role', accessorKey: 'role', sortable: true },
  { header: 'City', accessorKey: 'city', sortable: true },
  { header: 'Score', accessorKey: 'score', sortable: true },
];

const tbody = document.querySelector<HTMLTableSectionElement>('#grid-body');
if (tbody === null) {
  throw new Error('Missing #grid-body in index.html: the table body is required to render rows.');
}

const thead = document.querySelector<HTMLTableSectionElement>('thead');
if (thead === null) {
  throw new Error('Missing thead in index.html: the sort headers are required.');
}

// Paging arrives with H1-T10. Until then, all rows share one page.
const state: GridState = {
  sortKey: null,
  sortDir: 'none',
  filterText: '',
  page: 1,
  pageSize: members.length,
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
};

bindSortHeaders(thead, columns, (accessorKey) => {
  const current = state.sortKey === accessorKey ? state.sortDir : 'none';
  const next = nextSortDir(current);
  state.sortKey = next === 'none' ? null : accessorKey;
  state.sortDir = next;
  state.page = 1;
  render();
});

render();
