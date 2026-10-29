# CLAUDE.md

This file has two jobs:

1. Give an AI coding agent (Claude Code) the context and rules it needs to work on this repo (§1–3).
2. Show reviewers **how the developer and Claude worked together**: the steps, the decisions and why (§4).

The user-facing documentation is in [README.md](README.md).

---

## 1. Project context

Practical coding exercise: *Create a Redux setup in a React application.*

1. Call the API "get all breeds" (`https://dogapi.dog/api/v2/breeds`) and display some information for each breed (while connected to the Internet).
2. Disconnect from the Internet, then call the API "get all breeds" again.

Requirement 2 really tests **error handling in the async Redux flow**: a `rejected` state, a clear error UI, a way to retry, and no crash, endless spinner or blank page. Keep the scope proportional to this exercise.

## 2. Commands

```bash
npm run dev        # http://localhost:5173
npm test           # Vitest (tests/)
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run build      # type check + production build
```

Before saying a change is done, run `npm run lint`, `npm test` and `npm run build`. All three must pass.

## 3. Architecture and coding rules

### 3.1 Folders and dependency direction

Each folder has one job, and imports flow in **one direction only**: from the top of this diagram down, never back up.

```
main.tsx ─► App.tsx ─► layout/ ─────────────┐
                    └► features/*/components ┤
                                             ▼
             features/* (types, mapper, thunks, slice, selectors, hooks)
                                             │
              app/ (store, typed hooks, listener middleware, theme)
                                             │
                                             ▼
                                   api/ (HTTP + Dog API)

components/ and utils/ are leaves: anyone may use them, and they import nothing from the app.
```

| Folder | Holds | May import | Must NOT import |
| --- | --- | --- | --- |
| `src/api/` | `fetch` wrapper, error classification, Dog API call, raw response types | other files in `api/` | React, `app/`, `features/`, any UI |
| `src/app/` | store (`combineReducers` + `configureStore`), typed hooks, listener middleware, theme | `features/*` reducers, thunks, actions; `api/` | `layout/`, components |
| `src/features/<x>/` | one feature: app types, mapper, thunk, slice, selectors, hooks | `api/`, `app/` (types and hooks), `utils/` | **another feature**, `layout/` |
| `src/features/<x>/components/` | the feature's UI | its own feature, `app/hooks`, `components/`, `utils/` | another feature |
| `src/layout/` | app shell: `AppHeader`, `AppFooter` | features, `components/`, `app/hooks` | (top level) |
| `src/components/` | generic UI that works in any app (`StatusMessage`, `ColorModeToggle`) | MUI, `utils/` | `app/`, `features/`, `api/`, `layout/` |
| `src/utils/` | pure functions (`formatRange`, `formatTime`) | nothing from the app | everything app-specific |
| `tests/` | all tests and their helpers, **outside `src/`** | anything | (never imported by app code) |

Two consequences of these rules:

- **Features never import each other.** Behavior that involves two features goes in `app/listenerMiddleware.ts` (for example "request failed → chip Offline", "back online → retry breeds").
- **Only `api/` calls `fetch`.** Components and slices never see a raw response or a raw fetch error.

### 3.2 Components: containers and presentational components

| Kind | Rule | In this project |
| --- | --- | --- |
| **Page (container)** | The *only* component of its page that reads the store and dispatches. It picks what to show through `selectBreedsViewState`. | `BreedsPage` |
| **Presentational** | Gets data through props and reports user actions through callback props (`onPageChange`). Never touches the store. | `BreedGrid`, `BreedCard`, `BreedImage`, `BreedGridSkeleton`, `BreedsPagination`, `BreedsSummary`, `StatusMessage` |
| **Layout widget** | Lives in the header, outside any page, so it reads the store itself. Keep it to one or two values. | `ReloadBreedsButton`, `NetworkStatusChip` |
| **App shell** | Arranges layout and page, plus app-wide hooks. No business logic. | `App`, `AppHeader`, `AppFooter` |

- One exported component per file, and the file name matches the component. A tiny private helper may share the file if it is not exported (`BreedFact` in `BreedCard.tsx`).
- Constants and hooks shared between components go in their own `.ts` file (`breedGridLayout.ts`, `usePageFromUrl.ts`), so React Fast Refresh keeps working.

### 3.3 Where each piece of state lives

| State | Where | Why |
| --- | --- | --- |
| Breeds, pagination, request status, error | Redux `breeds` slice | Server data, read by several components |
| Online / offline | Redux `network` slice. Set by the browser's events **and** by API results | Used by the header and the listener middleware |
| Current page | URL `?page=2` (`usePageFromUrl`) | Survives a refresh, can be shared, works with Back / Forward |
| Color mode | MUI (`useColorScheme`, saved in localStorage) | Library preference, not app data |
| UI-only state (which photo failed) | `useState` in that component | No other component needs it |

### 3.4 Redux rules

- Reducers stay pure: no `fetch`, `Date.now()`, `localStorage` or `navigator`. Values like timestamps are created in the thunk and sent in the payload.
- Side effects go in thunks (`createAsyncThunk`) or the listener middleware.
- State and actions hold plain serializable data. Errors are `ApiError` objects, never class instances.
- Only the latest request may update the state. Each `pending` stores its `requestId`, and `fulfilled` / `rejected` from an older request are ignored.
- The thunk's `condition` skips a request when the same page is already in flight (`currentRequestId !== null`).
- While loading and after a failed request, breeds stay on screen only if they belong to the page in the URL.
- Components read state through named selectors in `xSelectors.ts`. A tiny slice may keep its one selector in the slice file (`selectIsOnline`).

### 3.5 Async calls and errors

1. `api/httpClient.ts` turns every failure into an `ApiRequestError` with a `kind`: `offline`, `network`, `timeout`, `http`, `invalid-response` or `unknown`.
2. The thunk converts it with `toApiError()` and returns `rejectWithValue(apiError)`.
3. The UI shows `getApiErrorContent(error)`, never the raw message, because every browser words network errors differently.
4. The request is always sent, even when `navigator.onLine` is `false`. Requests use `cache: 'no-cache'`, so a cached response can never hide an offline failure.
5. **Never trust `navigator.onLine` alone.** VPN or virtual network adapters keep it `true` with Wi-Fi off, and then no `online` / `offline` events fire. A request that cannot reach the server (`isConnectionError()`) is the reliable signal.

### 3.6 Naming

| Item | Rule | Example |
| --- | --- | --- |
| Component file | PascalCase, same as the component | `BreedCard.tsx` |
| Other files | camelCase, says what it holds | `breedMapper.ts`, `httpClient.ts` |
| Redux files | Redux Toolkit convention | `breedsSlice.ts`, `breedsThunks.ts`, `breedsSelectors.ts` |
| Test files | one per layer in `tests/` | `api.test.ts`, `redux.test.ts`, `app.test.tsx` |
| Hook | `use` + what it does | `usePageFromUrl` |
| Action / thunk / selector | event in the past tense / verb / `select` + result | `networkStatusChanged` / `fetchBreeds` / `selectBreedsViewState` |
| Boolean | `is` / `has` | `isOnline`, `isDimmed` |
| Handler / callback prop | `handle…` inside / `on…` as a prop | `handlePageChange` / `onPageChange` |
| Raw API type vs app type | `DogApi…` vs plain domain name | `DogApiBreed` vs `Breed` |
| Exports | named exports only, no `index.ts` barrels. Export only what another file uses | `export function App` |

### 3.7 TypeScript

- `strict` mode, no `any`. Use `unknown` and narrow it.
- **TypeScript 7** with `erasableSyntaxOnly`: no `enum`, no constructor parameter properties. Use union string types.
- `verbatimModuleSyntax`: type-only imports use `import type`.
- Import app code with the `@/` alias (`@/app/hooks`).

### 3.8 Styling (MUI 9)

- MUI components and the `sx` prop. No separate CSS files.
- Colors come from theme tokens (`text.secondary`, `primary.main`, `action.hover`), so light and dark mode both work. The only fixed color is the dark overlay behind the photo credit.
- Responsive layout uses breakpoint objects (`size={{ xs: 12, sm: 6, md: 4, lg: 3 }}`). Use `useMediaQuery` only when a *prop* must change (pagination size).
- **MUI 9 API:** `Grid` uses `size`, with no `item` prop. `PaperProps`, `TransitionComponent` and `componentsProps` are removed; use `slotProps`.
- Import per path (`@mui/material/Button`) to keep the dev server fast.
- Accessibility: images have `alt`, icon-only buttons have `aria-label`, and status changes use `role="status"` or `role="alert"`.

### 3.9 Tests

- All tests live in `tests/`, one file per layer: `api.test.ts` → `redux.test.ts` → `app.test.tsx`. `app.test.tsx` is grouped by exam requirement.
- `tests/support/`: `setup.ts` (runs before every file), `helpers.tsx` (`renderWithProviders`, `mockFetchSuccess`, `mockFetchNetworkFailure`, `setNavigatorOnline`), `fixtures.ts` (Dog API responses). Tests never hit the real network.
- Query elements the way a user finds them (`getByRole`, `getByText`), not by CSS class.
- Every bug fix comes with a test that fails without the fix.

### 3.10 Comments, language and workflow

- Comments explain **why**, not what the code does. Code, comments, UI text and README are in English.
- Only stop processes this session started. Check what owns a port before killing it.
- Do not commit or push without the developer's approval.

---

## 4. How we worked (2026-10-29)

### 4.1 Steps

| # | Step | Outcome |
| --- | --- | --- |
| 1 | Read and analyze the exam | Requirement 2 = error handling. API facts checked with real calls: 30 of 283 breeds per page, CORS `*`, JSON:API format |
| 2 | Brainstorm (TypeScript + MUI, as the developer asked) | Design shaped by verified facts (§4.2). Priority from the developer: names easy for a reviewer to read |
| 3 | Decisions with the developer | English UI and README, dark mode, page in the URL |
| 4 | Check against Redux theory (the developer's quiz notes) | `combineReducers` written out, Immer explained and tested, README table mapping each concept to a file |
| 5 | Keep the scope proportional | Dropped: localStorage cache, detail dialog, logger middleware, `/page/2` slug routes |
| 6 | Build | Scaffolded in a temp folder (the scaffolder's "remove files" option would delete `.git`), then API → Redux → UI → tests → README |
| 7 | Verify | Unit + end-to-end tests. Playwright on dev and production builds: online, offline reload, unloaded page offline, recovery, 375 / 768 / 1440 px, dark mode |
| 8 | Deep review before the first commit | 10 findings fixed (§4.3), structure rules written down (§3) |
| 9 | Real Wi-Fi test on the developer's machine | Chip stayed Online: *Radmin VPN* and *Tailscale* adapters keep `navigator.onLine` true. Fixed: API results drive the status |
| 10 | Race condition / UX review of auto retry | No data races. A 10 s background retry made the warning flicker, so it was fixed, then **removed** in step 11 |
| 11 | Final review for bloat | Auto-retry timer removed (option B), dead code removed, tests moved to `tests/` (3 files), this file shortened |
| 12 | Review prep after the push | One UX edge found: "Try again" on a never-loaded page briefly showed the old page's cards. Fixed with one rule for loading and failed states, tests first (§4.3) |

### 4.2 Verified facts that shaped the design

| Fact | Decision |
| --- | --- |
| Responses send `cache-control: max-age=300, stale-while-revalidate=3600`; the browser could answer from cache while offline | `fetch(url, { cache: 'no-cache' })` |
| `?include=group` returns group names in `included` | Group shown with no extra request |
| `meta.pagination.last` is missing on the last page; pages past the end return `data: []` | `lastPage` from `ceil(records / pageSize)`, plus an "empty" state |
| `page[size]` works | 24 per page: full grid rows at 1 / 2 / 3 / 4 columns |
| Most photos are CC BY / CC BY-SA | Author and license credited on each card |
| VPN / virtual adapters keep `navigator.onLine` true with Wi-Fi off (checked with `Get-NetAdapter`, documented on MDN) | Connection status also comes from API results |
| Vite template ships TS 7 (`erasableSyntaxOnly`) and oxlint; MUI 9 changed some APIs | Rules in §3.7 and §3.8 |

### 4.3 Problems found and fixed

| Problem | Fix |
| --- | --- |
| Network slice read `navigator.onLine` once, at import time | Lazy `initialState` |
| Photos that failed offline stayed placeholders | `BreedImage` remembers which photo object failed; the next successful load retries it |
| Clicking the current page added a history entry | `handlePageChange` ignores the current page |
| `components/` imported features | New `layout/` folder |
| No rule for which components read the store | Container / presentational rule (§3.2) |
| A connection drop while reading the body was reported as "invalid JSON" | Only `SyntaxError` means invalid JSON |
| Skeleton label ignored; Offline chip not announced | `role="status"` |
| `Weight ♂ / ♀` hard to read and read aloud as symbols | "Male weight" / "Female weight" |
| Tab still showed the Vite logo | Paw icon |
| Chip stayed Online with Wi-Fi off (VPN adapters) | Listener: connection error → Offline, success → Online |
| Dead code: `'aborted'` error kind (nothing aborts), HTTP 429 special case, 9 unneeded exports | Removed |
| "Try again" on `?page=7` (never loaded) showed page 1's cards, dimmed, until the answer came. The "same page" check only applied to the failed state | One check (`hasRequestedPageData`) for loading and failed. States renamed `loadingNoData` / `loadingWithData` to match `errorNoData` / `errorWithData`. Pagination stays visible while loading |

### 4.4 Tried and reverted

- **10 s background retry.** Added so the app recovers on machines where no `online` event fires. It needed a background-retry flag in the thunk and the reducer, plus a timer in `BreedsPage`. The exam does not ask for it, so it was removed. Recovery is now Retry / Reload, or automatic on the browser's `online` event.

### 4.5 Next steps

- [x] Commit: branch renamed to `main`, 3 commits (app → tests → docs). Each one builds on its own.
- [x] Create the GitHub repository and push: <https://github.com/takeisan24/redux-dog-breeds> (public). A fresh clone passes `npm ci`, lint, the 26 tests and the build.
- [x] Draft the answer for the exam form (repo link + how requirements 1 and 2 are handled).
- [ ] Submit the form (developer).
