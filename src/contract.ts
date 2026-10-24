export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
}

export interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowSelect?(item: T): void;
  ariaLabel: string;
}

export interface GridState {
  sortKey: string | null;
  sortDir: 'none' | 'asc' | 'desc';
  filterText: string;
  page: number;
  pageSize: number;
  selectedIds: Set<string>;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  city: string;
  score: number;
}
