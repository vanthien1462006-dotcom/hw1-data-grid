import type { ColumnDef, Member } from './contract.ts';
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

renderRows(tbody, members, columns, new Set<string>());
