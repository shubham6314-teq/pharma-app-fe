# Pharma App FE

Vite + React 19 + TypeScript SPA. Keep changes small, typed, and inside this structure.

Update this file and `.cursor/rules/*.mdc` when the stack, folders, or conventions change.

## Tech stack

- **UI:** React 19, TypeScript, Tailwind CSS v4
- **Build:** Vite 8
- **Routing:** React Router (`src/app/App.tsx`)
- **Forms:** React Hook Form + Zod (`src/lib/zod-resolver.ts`)
- **State:** Redux Toolkit slices (client state only)
- **Fetching:** RTK Query (`src/store/api/base-api.ts`)
- **API base URL:** `import.meta.env.VITE_API_BASE_URL`

Do not add Zustand, TanStack Query, Yup, or extra CSS frameworks.

## Current app

- Guests see login at `/login`. Signed-in users get `AppShell` (`src/app/AppShell.tsx`): dark teal sidebar + nested pages.
- Desktop (`lg+`): collapsible sidebar. The hamburger sits to the left of the page heading in the content area (not in the nav). Expanded = icons + labels (`w-64`); collapsed = icons only. Below `lg`: top bar + off-canvas drawer.
- Nested routes: `/` redirects to `/divisions`. Also `/overview`, `/inventory`, `/orders`, `/prescriptions`, `/profile`.
- Profile lives in app chrome, not in `PagePanel`. Below `lg`: icon on the right of the sticky top bar. `lg+`: name/email row in the sidebar footer (avatar only when collapsed). Sign out stays under that block. Profile shows stored name and email in editable fields. Save stays disabled until a field changes. Saving name stays signed in; saving a new email (no SMTP) or changing password signs the user out.
- List screens use `ResourceTable` (search, optional filters, Create, table on `md+` / stacked cards below, Previous/Next). See `.cursor/rules/tables.mdc`.
- Table images use `Thumbnail` (`src/components/ui/Thumbnail.tsx`). Hover or focus shows a larger tooltip preview. Create/edit forms use `ImagePicker` (eye button plus remove to clear a chosen or existing preview).
- Divisions are live: `GET/POST /divisions`, `PATCH/DELETE /divisions/:id` via `src/features/divisions/api.ts`. List query is `page` + `limit`; body is `{ data, meta }`. Create/update send `FormData` with an optional `image` file; `imageUrl` in the response is a `/uploads/...` path.
- Login posts to `POST /auth/login` through RTK Query (`src/features/auth/api.ts`).
- Access token lives in `state.auth.token` and is sent as `Authorization: Bearer`.
- Success/error toasts live in `state.toast`. Call `useToast()` after mutations (login, division create/update/delete, sign out). Render `Toaster` from `AppProviders` (top-right).
- Products list all records by default. Division and category dropdowns are optional filters (`divisionId` / `categoryId` query params). Categories can filter by `divisionId` the same way. Status stays a client filter on the current page.

## Folder structure

```txt
src/
  app/                 # Router, app shell
  pages/               # Route screens (one folder per page)
  features/            # Domain modules (auth, medicines, orders)
    <feature>/
      components/      # Feature-only UI
      *-schema.ts      # Zod schemas
      api.ts           # RTK Query injectEndpoints
      types.ts
  components/ui/       # Shared primitives (Button, TextField, SelectField, ResourceTable, Modal, Toaster, Thumbnail, ImagePicker)
  store/               # Store, slices, baseApi
  providers/           # Redux Provider + Toaster
  lib/                 # Shared helpers (zodResolver)
  hooks/               # Shared hooks (`useToast`, table helpers, `useSidebarUi`)
  types/
  assets/
```

## Conventions

- Functional components. Files: `PascalCase.tsx` components, `use-thing.ts` hooks, `kebab-case.ts` elsewhere.
- Pages compose features. Features own domain UI, schemas, and API.
- Shared UI goes in `components/ui`. Do not duplicate Button/TextField.
- Server data → RTK Query. Client/UI/auth token/toasts → RTK slices. Never store API lists in slices.
- Forms → Zod schema + `useForm` + `zodResolver`. Infer types with `z.infer`.
- Style with Tailwind. Teal pharmacy look (`teal-700`, `#0b3d3a`). No new CSS files unless Tailwind cannot do it.
- `import type` for types. No `enum`s. Use `useAppDispatch` / `useAppSelector`.

## Cursor rules

File-specific how-tos live in `.cursor/rules/`. Keep those short. Add a new `.mdc` when a new pattern repeats (auth API, tables, etc.).
