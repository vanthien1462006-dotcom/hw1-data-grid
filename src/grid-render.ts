import type { ColumnDef } from './contract.ts';

function createCell<T>(row: T, column: ColumnDef<T>, tabIndex: string): HTMLTableCellElement {
  const cell = document.createElement('td');
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('tabindex', tabIndex);
  cell.textContent = String(row[column.accessorKey]);
  return cell;
}

function createRow<T extends { id: string }>(
  row: T,
  columns: ColumnDef<T>[],
  selected: boolean,
  isFirstRow: boolean,
): HTMLTableRowElement {
  const tr = document.createElement('tr');
  tr.setAttribute('role', 'row');
  tr.setAttribute('aria-selected', String(selected));
  const cells = columns.map((column, index) => {
    const isEntryCell = isFirstRow && index === 0;
    return createCell(row, column, isEntryCell ? '0' : '-1');
  });
  tr.replaceChildren(...cells);
  return tr;
}

export function renderRows<T extends { id: string }>(
  tbody: HTMLTableSectionElement,
  rows: T[],
  columns: ColumnDef<T>[],
  selectedIds: ReadonlySet<string>,
): void {
  const trs = rows.map((row, index) =>
    createRow(row, columns, selectedIds.has(row.id), index === 0),
  );
  tbody.replaceChildren(...trs);
}
