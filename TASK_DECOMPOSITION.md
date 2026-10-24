# HW1: Accessible Data-Grid (WCAG 2.2 AA): Task Decomposition

## 1. Overview

A data grid for a team directory, written by hand with no grid or accessibility library. It supports:

- sorting by column (none, ascending, descending),
- filtering by text across all columns,
- pagination with Previous and Next,
- full keyboard navigation with a roving tabindex,
- a live status region that announces the result of each change.

Stack: Vite with vanilla TypeScript in strict mode. Two dev dependencies only: `vite` and `typescript`. No runtime dependencies, no CDN.

Targets:

- Mobile-first, checked at 375 px width. No horizontal page scroll. The table scrolls inside its own region.
- WCAG 2.2 AA: text contrast at least 4.5:1, UI and focus indicators at least 3:1, interactive targets at least 24 × 24 CSS px.
- Lighthouse 100 for Accessibility and Best Practices, in both Desktop and Mobile modes, measured by the author in Chrome.

Stages (slide 5): functional slicing (this WBS), contract first (`src/contract.ts`), one task per prompt, independent verification per task.

## 2. Contract

Written to `src/contract.ts` in H1-T03. These types are the only shared interfaces between modules.

```ts
export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
}

export interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowSelect?: (item: T) => void;
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
```

Functions (not part of the contract file; each lives in its module):

| Module | Function | Purpose |
| --- | --- | --- |
| `grid-model.ts` | `filterRows<T>(rows, columns, text): T[]` | Case-insensitive match across columns. Empty text returns a copy of all rows. |
| `grid-model.ts` | `sortRows<T>(rows, key, dir): T[]` | Numbers and strings. Returns a new array. Never mutates the input. |
| `grid-model.ts` | `paginate<T>(rows, page, pageSize)` | Clamps `page`. `pageCount` is at least 1. |
| `grid-model.ts` | `buildView<T>(rows, columns, state)` | Fixed pipeline: filter → sort → paginate, always from the original array. |
| `grid-render.ts` | `renderRows<T extends { id: string }>(tbody, rows, columns, selectedIds)` | Builds rows and cells with `createElement` and `textContent`. Sets `aria-selected`. |
| `keyboard.ts` | `restoreRovingFocus(tbody, position)` | After each render, puts `tabindex="0"` on the saved cell, or on the first cell of the page. |

## 3. Pipeline rule

Every change (filter text, sort, page, page size) recalculates the visible rows from the original data, in this order:

1. filter,
2. sort,
3. paginate.

When the filter text or the sort changes, the page resets to 1 in the caller, not in `buildView`. Selection is stored in `GridState.selectedIds` and applied on every render, so it survives paging and filtering.

## 4. HTML contract

- `<html lang="en">`, one `<h1>` in the header, `main#main-content` (with `tabindex="-1"`), `footer`.
- A skip link at the top of `body` pointing to `#main-content`.
- CSS linked with `<link rel="stylesheet">` in `index.html`, in this order: `reset.css`, `tokens.css`, `layout.css`, `table.css`. No `<style>` or `style=""` attributes.
- Filter: `form#grid-controls` with `role="search"`, a `<label for="filter-input">` and an `input type="search"` with a hint linked by `aria-describedby`.
- Table: `table role="grid"` with a `<caption>`, `thead` with `tr role="row"`, `th scope="col"` where each header holds one `<button>` for sorting, and `tbody id="grid-body"`. Row and cell roles come from `renderRows`.
- Pagination: `nav aria-label="Pagination"` with `button#prev-page` and `button#next-page`.
- Status: `p#grid-status role="status"`.
- No `<div>` used as structure. No `<div id="app">` from the template.

## 5. Keyboard contract

Roving tabindex: exactly one cell in the grid has `tabindex="0"` while the grid has rows. All others have `-1`. The grid element is not in the tab order.

| Key | Action |
| --- | --- |
| ArrowUp, ArrowDown, ArrowLeft, ArrowRight | Move focus one cell. May repeat while held. |
| Home, End | First and last cell of the current row. |
| Ctrl+Home, Ctrl+End | First cell of the first row, and last cell of the last row (W3C APG grid pattern). |
| Enter | Select the focused row and call `onRowSelect`. Ignored when `event.repeat` is true. |
| Space | Toggle the focused row in `selectedIds` and update its `aria-selected`. Ignored when `event.repeat` is true. `preventDefault()` so the page does not scroll. |

The focus position (row and column) is stored in `keyboard.ts`. After every render, `restoreRovingFocus` restores it. If the row is no longer on the page, the first cell of the page receives `tabindex="0"`.

`role="grid"` is claimed only because this full keyboard model is implemented.

## 6. Work breakdown structure

Acceptance criteria are checked by the author in the browser or by `npm run build` and `npm test`. Each row is one prompt and one commit.

| ID | Task | File(s) | Acceptance criteria | Commit message |
| --- | --- | --- | --- | --- |
| H1-T01 | Write this WBS and the contracts | `TASK_DECOMPOSITION.md`, `Agent.md`, `project-rules.md` | This file exists, contains section 2 to 5, and `git show --stat HEAD` lists three files. | `docs(spec): define data-grid contract and WBS` |
| H1-T02 | Replace the Vite demo with stub modules | demo removal, stubs, `package.json`, `tsconfig.json`, `.gitignore`, `index.html`, `public/favicon.svg` | `npm run build` passes. `npm ls --depth=0` lists only `vite` and `typescript`. `npm test` script exists. Tests are excluded from `tsc`. | `chore(scaffold): replace Vite demo with stub modules` |
| H1-T03 | Add the data-grid contract | `src/contract.ts` | Only the four interfaces from section 2. No functions, no `any`, no `enum`. Build passes. | `feat(types): add data-grid contract` |
| H1-T04 | Semantic page structure | `index.html` | Section 4 holds. One `<h1>`. Only one `main`. No `<div>` structure, no inline style or handler. | `feat(html): semantic data-grid page structure` |
| H1-T05 | Design tokens and reset | `src/css/reset.css`, `src/css/tokens.css` | All colours in `tokens.css`. Text contrast at least 4.5:1, UI and focus at least 3:1, shown in a contrast table. Reduced-motion rule present. | `feat(css): design tokens and box-sizing reset` |
| H1-T06 | Table layout and focus | `src/css/layout.css`, `src/css/table.css` | At 375 px no horizontal page scroll. The table scrolls inside its section. Sort and pagination buttons have `min-width` and `min-height` equal to `--target-min` (24 px). Focus ring at least 2 px. | `feat(css): table layout and focus indicators` |
| H1-T07 | Pure grid model | `src/grid-model.ts`, `src/grid-model.test.ts` | `filterRows`, `sortRows`, `paginate`, `buildView` pass tests. `buildView` filters before sorting. No DOM or `window` used. | `feat(ts): pure grid model for sort, filter and paginate` |
| H1-T08 | Render rows with textContent | `src/grid-render.ts`, `src/sample-data.ts`, `src/main.ts` | 12 rows render. The XSS sample (`<img src=x onerror=alert(1)>`) appears as text and raises no alert. `aria-selected` follows `selectedIds`. No `innerHTML`. | `feat(ts): render table rows with textContent` |
| H1-T09 | Sortable headers | `src/grid-controls.ts`, `src/main.ts` | One click listener on `thead`. Sort cycles none → asc → desc → none. `aria-sort` matches. Calls `buildView` and resets the page to 1. | `feat(ts): sortable headers with aria-sort` |
| H1-T10 | Filter, pagination, live status, Enter guard | `src/grid-controls.ts`, `src/main.ts` | Typing updates `filterText`, resets page, calls `buildView`. Previous and Next disable at the ends. `#grid-status` shows the count and "No rows match the filter." when empty. A `submit` listener calls `preventDefault()`: Enter in the filter does not reload the page. | `feat(ts): filter and pagination with live status` |
| H1-T11 | Keyboard navigation | `src/keyboard.ts`, `src/main.ts` | Section 5 holds. One `keydown` listener on `tbody`. Space toggles `selectedIds`. `restoreRovingFocus` runs after each render: after a page change, the focused cell still has `tabindex="0"` and the selection is unchanged. | `feat(ts): keyboard navigation with event delegation` |
| H1-T12 | Lighthouse fixes (only if needed) | files named by the finding | Author's own Lighthouse run in Desktop and Mobile shows 100 for Accessibility and Best Practices, or the remaining items are recorded. One finding per commit. | `fix(a11y): <finding>` |
| H1-T13 | README | `README.md` | Run instructions, keyboard table, accessibility choices, the XSS sample, dependency list (`vite` and `typescript` only), Lighthouse score fields left blank for the author. | `docs(readme): document data-grid usage and checks` |

## 7. Verification gate

For every task:

1. `npm run build` passes. This runs `tsc` and then `vite build`.
2. `npm test` passes once tests exist.
3. `git show --stat HEAD` lists only the files named in the task.
4. `git status` shows no changes except files the task did not name.
5. The author checks the browser behaviour listed in the task.

Final checks (see the guide, section 4): grep for `var`, `innerHTML`, `keyCode`, `keypress`, `any`, `enum` in `src/*.ts`; grep for `div`, `onclick`, `style=` in `index.html`; grep for hex colours outside `tokens.css`.

## 8. Rules

- One sub-task per prompt.
- Contract before logic.
- No commit when a check fails.
- No push.
- Lab 1 is not touched.
