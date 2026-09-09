# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite on http://localhost:5173)
npm run dev:prod     # Run dev server with prod environment settings
npm run build        # Build for production (TypeScript check + Vite build)
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

## Project Overview

**PlanteiCerto** is a web application for registering, managing, and visualizing tree plantings and environmental projects. It's a full-stack app with React frontend and Supabase backend.

**Stack:**
- Frontend: React 19 + TypeScript + Vite
- Styling: Tailwind CSS v4 (`@tailwindcss/vite` plugin, class-based dark mode via ThemeContext)
- Maps: Leaflet + React Leaflet + Marker Clustering
- Data: Supabase (PostgreSQL + Edge Functions)
- State: TanStack React Query + Context API
- Icons: Lucide React (admin panel) + inline SVG (public pages)

## Architecture

### Core Structure

```
src/
├── components/          # Organized by feature
│   ├── admin/          # TreeDataTable, TreeFormModal, FormSection, RatingInput, ImageUpload
│   ├── auth/           # Login/signup modals, ProtectedRoute, AdminRoute
│   ├── layout/         # Header, Drawer (filters), Layout, AdminLayout
│   ├── map/            # ProjectMap, TreeMarker, clustering, controls
│   ├── trees/          # TreeCard, TreeGrid, TreeDetailModal
│   ├── projects/       # Project CRUD, PointsList, TreeSelectionDialog
│   ├── recommendation/ # QuestionCard, ResultScreen (wizard UI)
│   └── ui/             # Reusable: Modal, Skeleton, ConfirmDialog, etc.
├── contexts/           # AuthContext, ThemeContext
├── hooks/              # useTrees, useProjects, useProjectPoints, useTreeFilters, useRecommendation, useProfile, useAdminTrees, useAdminUsers
├── pages/              # TreesPage, ProjectsPage, RecommendationPage, ProfilePage, ResetPasswordPage, AdminTreesPage, AdminUsersPage
├── types/              # tree.ts (Arvore), project.ts, auth.ts (UserProfile, Profile), recommendation.ts
├── lib/                # supabase.ts, pdf.ts
└── data/               # trees.ts (static fallback), questionnaire.ts
```

### Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | TreesPage | No |
| `/recomendacao` | RecommendationPage | No |
| `/projetos` | ProjectsPage | Yes |
| `/perfil` | ProfilePage | Yes |
| `/reset-password` | ResetPasswordPage | Yes |
| `/admin/arvores` | AdminTreesPage | Yes (admin) |
| `/admin/equipe` | AdminUsersPage | Yes (admin) |

### Key Architecture Patterns

**Data Flow:**
1. **Trees (Read-Only):** TanStack React Query fetches from Supabase or falls back to static data (staleTime: 15 mins)
2. **Projects (CRUD):** Mutations via React Query + Supabase, cache invalidation on success
3. **Recommendation:** `useRecommendation` calls the `recommend-trees` Supabase Edge Function via `useMutation`; requires Supabase to be configured
4. **Auth State:** AuthContext detects session changes, provides user + auth methods
5. **Theme:** ThemeContext manages dark/light mode persisted to localStorage

**Database:** Supabase is optional (graceful fallback to static trees if env vars missing)
- `trees` table: flat schema — `id`, `foto`, `nome_cientifico`, `nome_popular`, `origem`, `decidua_perenifolia`, tolerância fields (1–5 scale), boolean flags (`presenca_espinhos`, `tolerancia_sol_pleno`, etc.), urban sizing fields (`faixa_serv_min_m_recomendada`, `berco_area_min_m2_recomendada`, `compat_fiacao`, etc.). RLS: SELECT public, INSERT/UPDATE/DELETE admin only.
- `profiles` table: `id` (FK auth.users), `nome`, `email`, `role` ('user'|'admin'), `created_at`. Auto-created via trigger on signup. RLS: users read own, admins read/update all.
- `projects` table: user projects (`nome`, `descricao`, `centro_lat/lng/zoom`, points count)
- `points` table: tree plantings within projects (`lat`, `lng`, `tree_id`, etc.). RLS: user manages own project points.
- Auth via Supabase auth
- Storage: `tree-images` bucket (public read, admin upload/delete)

**Admin Panel:**
- `AdminRoute` guard checks `profiles.role = 'admin'` via `useProfile` hook
- `AdminLayout` provides sidebar navigation (separate from public Layout)
- Tree CRUD: `useAdminTrees` hook (create/update/delete mutations + image upload to `tree-images` bucket)
- User management: `useAdminUsers` hook (list profiles, promote/demote admin role)

**Supabase Edge Functions:**
- `recommend-trees`: Accepts `{ answers: Record<string, string> }`, runs eliminatory rules (physical space, light, soil, preferences) then classifies/scores surviving trees (max 190 pts), returns `{ trees: RecommendedTree[], eliminated_count, criteriaSummary }`

### Tree Schema (flat, snake_case)

The `Arvore` interface in `src/types/tree.ts` is a flat schema matching the DB directly:
- `foto: string | null` — nullable image URL
- `origem: 'Nativa BR' | 'Exótica'`
- `porte_altura_classe: 'Grande' | 'Médio' | 'Pequeno' | null`
- `copa_classe: 'Grande' | 'Média' | 'Pequena' | null`
- `compat_fiacao: 'N' | 'A' | 'C' | null` — N=incompatible, A=compatible with care, C=compatible
- `decidua_perenifolia: 'Perenifólia' | 'Decídua' | 'Semidecídua'`
- Numeric 1–5 scales: `tolerancia_seca_1a5`, `tolerancia_encharcamento_1a5`, `tolerancia_poluicao_atmosferica_1a5`, `tolerancia_compactacao_solo_1a5`, `tolerancia_ventos_fortes_1a5`, `potencial_sujeira_1a5`, `potencial_dano_calcada_1a5`, `atracao_fauna_1a5`, `potencial_sombra_1a5`, `contribuicao_biodiversidade_1a5`, `tolerancia_poda_1a5`
- Boolean fields: `tolerancia_sol_pleno`, `tolerancia_meia_sombra`, `tolerancia_sombra`, `presenca_espinhos`, `presenca_subst_irritantes`

### Recommendation Questionnaire

`src/data/questionnaire.ts` defines a 6-group wizard (`Question[]` with `type: 'eliminatorio' | 'classificatorio'`). Questions support `showIf` for conditional display and `subQuestions` (flattened to a linear list via `flattenQuestions()`). The `RecommendationPage` drives the wizard; `useRecommendation` posts answers to the Edge Function.

## Important Files

| File | Purpose |
|------|---------|
| `src/types/tree.ts` | Flat `Arvore` interface + `FiltroAtributo` type |
| `src/data/questionnaire.ts` | Recommendation wizard questions (6 groups, eliminatory + classificatory) |
| `supabase/functions/recommend-trees/index.ts` | Deno Edge Function: scoring/filtering logic |
| `src/hooks/useRecommendation.ts` | `useMutation` wrapper for the Edge Function |
| `src/contexts/AuthContext.tsx` | Auth state, sign in/up/out, password reset |
| `src/lib/supabase.ts` | Supabase client init with env var fallback + `isSupabaseConfigured()` guard |
| `src/hooks/useTrees.ts` | Query trees (falls back to static), 15-min cache |
| `src/hooks/useProfile.ts` | Fetch current user profile (role, isAdmin) from `profiles` table |
| `src/hooks/useAdminTrees.ts` | Tree CRUD mutations (create, update, delete, image upload) |
| `src/hooks/useAdminUsers.ts` | Admin user management (list profiles, update role) |
| `src/components/auth/AdminRoute.tsx` | Route guard: redirects non-admin users to `/` |
| `src/components/admin/TreeFormModal.tsx` | Full tree CRUD form (5 sections, react-hook-form) |
| `supabase/migrations/20260321_admin_profiles_rls.sql` | Profiles table, trigger, RLS policies, storage bucket |
| `src/lib/pdf.ts` | PDF generation (jsPDF + html2canvas) |

## Environment Variables

Create `.env.local` (copy from `.env.example`):
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

If missing, the app degrades gracefully (uses static trees, disables auth/projects/recommendation).

## TypeScript & Linting

- **Target:** ES2022, strict mode (`noUnusedLocals`, `noUnusedParameters`)
- **ESLint:** Flat config with `@eslint/js`, `typescript-eslint`, React hooks rules
- `npm run build` runs `tsc -b` first — linting errors block builds

## Git & Commits

- Base branch: `master`
- Conventional commits preferred (`style:`, `fix:`, `feat:`, etc.)
