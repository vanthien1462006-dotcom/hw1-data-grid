# Team Directory Data Grid

An accessible data grid with sorting, filtering and pagination, written without any UI or grid library. It is built with Vite and vanilla TypeScript in strict mode, and targets WCAG 2.2 AA.

## Run

Requirements: Node.js. `npm test` uses a glob pattern, which needs Node.js 21 or newer. The project was checked with Node.js 24.

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # type check (tsc) and bundle (vite build)
npm run preview    # serves the build at http://localhost:4173
npm test           # unit tests for the pure grid model
```

Open the pages through Vite only. Opening `index.html` with `file://` is not supported.

## Features

- **Sort.** Click a column header to cycle through none, ascending and descending. One column is sorted at a time.
- **Filter.** Type in the search box to match text in any column. Matching ignores letter case and leading or trailing spaces. Pressing Enter in the box does not reload the page.
- **Pagination.** Previous and Next move between pages. Each button is disabled at the first or last page.
- **Live status.** The status line reports the count and the page, for example "Showing 12 of 12 rows. Page 1 of 3.", or "No rows match the filter." when nothing matches.
- **Selection.** Space selects or deselects the focused row. Selected rows are marked with `aria-selected="true"` and a highlight.

## Keyboard

Only one cell of the table is in the tab order at a time. Use the arrow keys to move between cells.

| Key | Action |
| --- | --- |
| ArrowUp, ArrowDown, ArrowLeft, ArrowRight | Move focus one cell. Repeats while the key is held. |
| Home | Move to the first cell of the current row. |
| End | Move to the last cell of the current row. |
| Ctrl+Home | Move to the first cell of the table. |
| Ctrl+End | Move to the last cell of the table. |
| Enter | Activate the focused row and call the row-select handler. In this demo the status line shows the member's name. Ignored while the key is held. |
| Space | Toggle the focused row in the selection. Does not scroll the page. Ignored while the key is held. |

The focused cell keeps its position when the page, the filter or the sort changes, as long as its row is still on the page.

## Accessibility

- **Native table.** The data is a real `<table>` with a `<caption>`, a `<thead>`, and `<th scope="col">` headers. The rows and cells also carry `role="grid"`, `role="row"` and `role="gridcell"`. The `grid` role is claimed only because the full keyboard model described above is implemented.
- **Roving tabindex.** Exactly one cell has `tabindex="0"` while the table has rows. The other cells have `tabindex="-1"`.
- **Sort state.** Each sortable header holds one button. The header's `aria-sort` is `ascending`, `descending` or `none`.
- **Filter.** The search box has a visible label, "Filter rows", and its hint is linked with `aria-describedby`. Placeholders are not used as labels.
- **Status.** `#grid-status` has `role="status"`, so screen readers announce changes to the count and the page.
- **Skip link.** The first link on the page moves focus to the main content.
- **Focus.** Every interactive element shows a 2 px focus ring in `--focus-ring`, only for keyboard focus (`:focus-visible`).
- **Target size.** Sort buttons and pagination buttons are at least 24 by 24 CSS pixels (`--target-min`, WCAG 2.2 criterion 2.5.8).
- **Contrast.** Colours are defined once in `src/css/tokens.css`. The ratios below were calculated from those values.

| Pair | Ratio | Required |
| --- | --- | --- |
| `--text` on `--bg` | 16.56 | 4.5 (text) |
| `--text-muted` on `--surface` | 6.93 | 4.5 (text) |
| `--accent-text` on `--accent` | 6.70 | 4.5 (text) |
| `--border` on `--bg` | 4.20 | 3 (UI) |
| `--focus-ring` on `--bg` | 6.70 | 3 (UI) |

- **Motion.** Animations and transitions are turned off when the user prefers reduced motion.
- **Responsive.** The layout is designed for 375 px wide screens. A wide table scrolls inside its own region, not the whole page.

## Security

- All table content is written with `textContent`. The code does not use `innerHTML`, `outerHTML` or `insertAdjacentHTML`.
- The sample data includes a record that proves escaping. The city of "Leo Truong" is `<img src=x onerror=alert(1)>`. It must appear as plain text in the table, and no alert must open. If an alert opens, escaping is broken.

## Data and configuration

- The sample data is in `src/sample-data.ts`: 12 members, typed by `Member` in `src/contract.ts`.
- The page size is set in HTML with `data-page-size` on the table's `<section>`. The value is 5 in `index.html`. If the value is missing or is not a positive integer, the code uses 5.

## Dependencies

The project has exactly two dependencies, both for development:

- `vite`: the dev server, the bundler and the preview server.
- `typescript`: the type checker. `npm run build` runs it in strict mode.

There are no runtime dependencies and no CDN links. The assignment requires the grid to be written by hand, so no grid or UI library is used. Every file is served from the project, which keeps the dependency surface small and lets the page run offline. Adding any other package requires a prior decision.

## Verification

Run the checks listed in `TASK_DECOMPOSITION.md`, section 7, before each release: `npm run build`, `npm test`, `git show --stat HEAD`, and the browser checks for the task.

Lighthouse scores are recorded by the author. Run Lighthouse in Chrome in both Desktop and Mobile modes and fill in the table below.

| Mode | Accessibility | Best Practices |
| --- | --- | --- |
| Desktop | | |
| Mobile | | |

## Known limits

- **Light theme only.** The colours are defined for a light background. There is no dark theme.
- **Static data.** The grid shows the 12 sample members. Data is not loaded from a server.
- **Sort indicator.** The sorted column is announced through `aria-sort`, but there is no visible arrow or icon yet.
- **Two tab stops for the table.** The scrollable section has `tabindex="0"`, so Tab reaches the section first and then the focused cell. Removing the section's `tabindex` is planned.
- **Demo handlers.** Enter only shows the member's name in the status line. The selection is kept in memory and is lost on reload.
- **No debounce.** The table updates on every keystroke in the filter. This is fast enough for 12 rows.
