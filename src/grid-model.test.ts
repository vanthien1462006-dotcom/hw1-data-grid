import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildView, filterRows, paginate, sortRows } from './grid-model.ts';
import type { ColumnDef, Member } from './contract.ts';

const members: Member[] = [
  { id: '1', name: 'Alice Nguyen', role: 'Designer', city: 'Hanoi', score: 88 },
  { id: '2', name: 'bob Tran', role: 'Developer', city: 'Da Nang', score: 72 },
  { id: '3', name: 'Carol Le', role: 'Developer', city: 'Hue', score: 95 },
  { id: '4', name: 'David Pham', role: 'Tester', city: 'Hanoi', score: 60 },
  { id: '5', name: 'Eve Do', role: 'Designer', city: 'Ho Chi Minh City', score: 81 },
  { id: '6', name: 'Frank Vo', role: 'Manager', city: 'Hanoi', score: 90 },
];

const columns: ColumnDef<Member>[] = [
  { header: 'Name', accessorKey: 'name', sortable: true },
  { header: 'Role', accessorKey: 'role', sortable: true },
  { header: 'City', accessorKey: 'city', sortable: true },
  { header: 'Score', accessorKey: 'score', sortable: true },
];

function ids(rows: Member[]): string[] {
  return rows.map((row) => row.id);
}

describe('filterRows', () => {
  it('returns a copy of all rows for empty text', () => {
    const result = filterRows(members, columns, '');
    assert.deepEqual(ids(result), ids(members));
    assert.notEqual(result, members);
  });

  it('treats whitespace-only text as empty', () => {
    assert.deepEqual(ids(filterRows(members, columns, '   ')), ids(members));
  });

  it('matches case-insensitively across all columns', () => {
    assert.deepEqual(ids(filterRows(members, columns, 'HANOI')), ['1', '4', '6']);
    assert.deepEqual(ids(filterRows(members, columns, 'designer')), ['1', '5']);
    assert.deepEqual(ids(filterRows(members, columns, 'BOB')), ['2']);
  });

  it('matches the numeric score column', () => {
    assert.deepEqual(ids(filterRows(members, columns, '95')), ['3']);
  });

  it('returns no rows when nothing matches', () => {
    assert.deepEqual(filterRows(members, columns, 'zzz'), []);
  });
});

describe('sortRows', () => {
  it('sorts numbers ascending and descending', () => {
    assert.deepEqual(ids(sortRows(members, 'score', 'asc')), ['4', '2', '5', '1', '6', '3']);
    assert.deepEqual(ids(sortRows(members, 'score', 'desc')), ['3', '6', '1', '5', '2', '4']);
  });

  it('sorts strings without regard to letter case', () => {
    assert.deepEqual(ids(sortRows(members, 'name', 'asc')), ['1', '2', '3', '4', '5', '6']);
    assert.deepEqual(ids(sortRows(members, 'name', 'desc')), ['6', '5', '4', '3', '2', '1']);
  });

  it('returns a new array and does not change the input', () => {
    const before = ids(members);
    const result = sortRows(members, 'score', 'desc');
    assert.notEqual(result, members);
    assert.deepEqual(ids(members), before);
  });
});

describe('paginate', () => {
  it('returns the partial last page', () => {
    const result = paginate(members, 2, 4);
    assert.deepEqual(ids(result.pageRows), ['5', '6']);
    assert.equal(result.page, 2);
    assert.equal(result.pageCount, 2);
  });

  it('clamps a page above the last page', () => {
    const result = paginate(members, 99, 4);
    assert.deepEqual(ids(result.pageRows), ['5', '6']);
    assert.equal(result.page, 2);
  });

  it('clamps a page below 1', () => {
    assert.equal(paginate(members, 0, 4).page, 1);
    assert.equal(paginate(members, -3, 4).page, 1);
    assert.deepEqual(ids(paginate(members, 0, 4).pageRows), ['1', '2', '3', '4']);
  });

  it('treats a page size below 1 as 1', () => {
    const result = paginate(members, 1, 0);
    assert.deepEqual(ids(result.pageRows), ['1']);
    assert.equal(result.pageCount, 6);
  });

  it('returns one empty page when there are no rows', () => {
    assert.deepEqual(paginate([], 5, 10), { pageRows: [], page: 1, pageCount: 1 });
  });
});

describe('buildView', () => {
  it('filters before sorting, then paginates the filtered rows', () => {
    const state = { filterText: 'hanoi', sortKey: 'score' as const, sortDir: 'desc' as const, pageSize: 2 };

    const first = buildView(members, columns, { ...state, page: 1 });
    assert.deepEqual(ids(first.pageRows), ['6', '1']);
    assert.equal(first.matchCount, 3);
    assert.equal(first.pageCount, 2);
    assert.equal(first.page, 1);

    const second = buildView(members, columns, { ...state, page: 2 });
    assert.deepEqual(ids(second.pageRows), ['4']);
    assert.equal(second.page, 2);
  });

  it('keeps the original order when sortDir is none', () => {
    const view = buildView(members, columns, {
      filterText: 'designer',
      sortKey: null,
      sortDir: 'none',
      page: 1,
      pageSize: 10,
    });
    assert.deepEqual(ids(view.pageRows), ['1', '5']);
  });

  it('reports the clamped page', () => {
    const view = buildView(members, columns, {
      filterText: '',
      sortKey: 'name',
      sortDir: 'asc',
      page: 99,
      pageSize: 4,
    });
    assert.equal(view.page, 2);
    assert.deepEqual(ids(view.pageRows), ['5', '6']);
  });

  it('does not change the input array', () => {
    const before = ids(members);
    buildView(members, columns, {
      filterText: 'a',
      sortKey: 'score',
      sortDir: 'asc',
      page: 1,
      pageSize: 2,
    });
    assert.deepEqual(ids(members), before);
  });
});
