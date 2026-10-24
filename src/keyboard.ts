export interface GridKeyboardHandlers {
  onRowSelect(rowId: string): void;
  onToggleRow(rowId: string): boolean;
}

export interface GridKeyboard {
  restore(rowIds: readonly string[]): void;
  dispose(): void;
}

interface FocusPosition {
  rowId: string;
  column: number;
}

// One keydown listener on tbody, attached once. The focus position lives in this closure.
export function createGridKeyboard(tbody: HTMLTableSectionElement, handlers: GridKeyboardHandlers): GridKeyboard {
  let rowIds: readonly string[] = [];
  let position: FocusPosition | null = null;

  const cellAt = (row: number, column: number): HTMLTableCellElement | undefined =>
    tbody.rows[row]?.cells[column];

  const moveFocus = (from: HTMLTableCellElement, row: number, column: number): void => {
    const target = cellAt(row, column);
    if (target === undefined) {
      return;
    }
    from.setAttribute('tabindex', '-1');
    target.setAttribute('tabindex', '0');
    target.focus();
    position = { rowId: rowIds[row], column };
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!(event.target instanceof HTMLTableCellElement)) {
      return;
    }
    const cell = event.target;
    const row = cell.parentElement;
    if (!(row instanceof HTMLTableRowElement)) {
      return;
    }
    const rowIndex = row.sectionRowIndex;
    const column = cell.cellIndex;
    const lastRow = tbody.rows.length - 1;
    const lastColumn = row.cells.length - 1;
    const rowId = rowIds[rowIndex];

    let targetRow = rowIndex;
    let targetColumn = column;
    switch (event.key) {
      case 'ArrowUp':
        targetRow = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
        targetRow = Math.min(lastRow, rowIndex + 1);
        break;
      case 'ArrowLeft':
        targetColumn = Math.max(0, column - 1);
        break;
      case 'ArrowRight':
        targetColumn = Math.min(lastColumn, column + 1);
        break;
      case 'Home':
        targetColumn = 0;
        if (event.ctrlKey) {
          targetRow = 0;
        }
        break;
      case 'End':
        targetColumn = lastColumn;
        if (event.ctrlKey) {
          targetRow = lastRow;
        }
        break;
      case 'Enter':
        if (!event.repeat) {
          handlers.onRowSelect(rowId);
        }
        return;
      case ' ':
        event.preventDefault();
        if (!event.repeat) {
          row.setAttribute('aria-selected', String(handlers.onToggleRow(rowId)));
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    moveFocus(cell, targetRow, targetColumn);
  };

  // Called after every render: the row keeps its tabindex="0" cell when it is still on the page.
  const restore = (nextRowIds: readonly string[]): void => {
    rowIds = nextRowIds;
    tbody.querySelectorAll<HTMLTableCellElement>('td').forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    });
    if (tbody.rows.length === 0) {
      return;
    }

    let row = 0;
    let column = 0;
    if (position !== null) {
      const found = rowIds.indexOf(position.rowId);
      if (found !== -1) {
        row = found;
        column = Math.min(position.column, tbody.rows[found].cells.length - 1);
      }
    }
    position = { rowId: rowIds[row], column };
    cellAt(row, column)?.setAttribute('tabindex', '0');
  };

  tbody.addEventListener('keydown', onKeyDown);
  return {
    restore,
    dispose: () => tbody.removeEventListener('keydown', onKeyDown),
  };
}
