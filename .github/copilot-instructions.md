# Team Analytics Dashboard - Development Guidelines

## Project Overview

**Team Analytics Dashboard** — A full-stack web application for tracking projects, tasks, and team performance in real-time. Built with Next.js 16, React 19, Prisma (PostgreSQL), and modern web technologies.

## Quick Start & Essential Commands

### Development

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format:fix   # Format code with Prettier
```

### Database (Prisma)

```bash
npm run db:push      # Push schema to database
npm run db:migrate   # Create and apply migration
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Run seed script (prisma/seed.ts)
npm run db:generate  # Generate Prisma client
```

---

## Architecture & Key Patterns

### File Structure

- **`app/`** — Next.js App Router with layouts, pages, and route groups
- **`actions/`** — Server actions (mutations): `auth.ts`, `project.ts`, `task.ts`, `organization.ts`, `settings.ts`
- **`components/`** — React components organized by feature (dashboard, projects, tasks, etc.)
- **`lib/`** — Utilities: API client, auth helpers, Prisma instance, constants
- **`services/`** — Business logic layer (calls Prisma, handles core logic)
- **`server/repositories/`** — Data access layer (optional abstraction over Prisma)
- **`types/`** — TypeScript type definitions
- **`schema/`** — Zod schemas for validation

### Data Flow Patterns

#### Server Actions (Mutations)

```typescript
// actions/task.ts
"use server";
export async function updateTaskAction(taskId: string, data: UpdateTaskPayload) {
  // Validate input
  // Call service layer → Prisma
  // Return result or throw error
}
```

- All server actions in `actions/` directory
- Use `"use server"` directive
- Pair with Zod schemas in `schema/` for validation
- Throw `Error` for predictable failures
- Call service layer (not Prisma directly)

#### Service Layer

```typescript
// services/task.ts
export async function updateTask(id: string, data: UpdateTaskPayload) {
  // Business logic & validation
  // Direct Prisma calls
  // Return typed result
}
```

- Contains all business logic
- Direct access to Prisma models
- Returns strongly-typed data
- Pure functions with no side effects

#### Client-Side Data Fetching

- **Queries:** React Query (`@tanstack/react-query`) with `useQuery()` hooks
- **Mutations:** Use server actions directly from components with `startTransition()`
- **Optimistic Updates:** Use `useOptimistic()` hook with server actions

#### API Client

```typescript
// lib/api-client.ts
export const apiClient = new ApiClient(); // Singleton
apiClient.get<T>(url);
apiClient.post<T>(url, body);
apiClient.patch<T>(url, body);
apiClient.delete<T>(url);
```

- Used for API routes (if needed)
- Credentials included automatically
- Typed response handling

### Component Patterns

#### React Server Components (Default)

```typescript
// Child components are server components by default
export default async function Page() {
  const data = await fetch(...);
  return <div>{data}</div>;
}
```

#### Client Components

```typescript
// components/projects/project-card.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { useTransition } from "react";

export function ProjectCard({ id }: Props) {
  // Hooks, state, event handlers
}
```

- Add `"use client"` when using hooks or interactivity
- Use React Query for server state
- Use Zustand for UI/client state
- Avoid props drilling — use contexts or Zustand

#### UI Components

- Located in `components/ui/` (shadcn-inspired)
- Built with Radix UI primitives
- Styled with Tailwind CSS
- Lucide React for icons

### Authentication

- Custom JWT-based system (access + refresh tokens)
- Tokens stored in HTTP-only cookies
- Middleware/layout checks authorization
- Auth actions in `actions/auth.ts`
- Services in `server/` with database queries

---

## Code Style & Quality

### Prettier Configuration

```javascript
// prettier.config.mjs
{
  printWidth: 100,      // Lines max 100 chars
  semi: true,           // Add semicolons
  singleQuote: false,   // Use double quotes
  trailingComma: "all", // Trailing commas in multiline
  tabWidth: 2,          // 2-space indentation
  useTabs: false,       // Spaces not tabs
  arrowParens: "always" // (x) => x, not x => x
}
```

### ESLint Rules

- Next.js Core Web Vitals
- Next.js TypeScript strict mode
- Prettier integration (warn on violations)
- No manual formatting conflicts

### TypeScript Settings

- **Strict mode:** `true`
- **Paths:** `@/*` maps to workspace root
- **Incremental builds:** Enabled
- **JSX:** `react-jsx` (no React import needed)

### Naming Conventions

- **Files:** kebab-case (`kanban-board.tsx`, `task-card.tsx`)
- **Components:** PascalCase (`KanbanBoard`, `TaskCard`)
- **Functions:** camelCase (`handleStatusChange`, `updateTask`)
- **Constants:** UPPER_SNAKE_CASE (`KANBAN_COLUMNS`, `ACCESS_TOKEN_COOKIE`)
- **Types/Interfaces:** PascalCase (`Task`, `Project`)

---

## Key Features & Implementations

### Drag-and-Drop (Kanban Board)

- Library: `@dnd-kit/core`
- Pattern: `DndContext` wrapper → `DragOverlay` for visual feedback
- Integration: Optimistic updates with `useOptimistic()` + server action
- See: `components/projects/kanban-board.tsx`

### Database Models

- **User:** Authentication, team memberships, projects, tasks
- **Organization, Team:** Multi-tenant structure
- **Project, Task:** Core business entities
- **Permissions:** Managed via TeamMember, ProjectMember relations
- See: `prisma/schema.prisma`

### State Management

- **Server State:** React Query + server actions
- **Form State:** React Hook Form + Zod validation

---

## Common Development Workflows

### Adding a New Feature

1. **Database:** Update `prisma/schema.prisma`, run `npm run db:migrate`
2. **Types:** Add types in `types/index.ts`
3. **Service:** Create business logic in `services/*`
4. **Action:** Add server action in `actions/*`
5. **Component:** Create client/server component in `components/*`
6. **Route:** Add page/layout in `app/*`

### Fetching Data

```typescript
// Server Component - Direct fetch
const data = await getProjectById(id); // Service call

// Client Component - React Query
const { data } = useQuery({
  queryKey: ["project", id],
  queryFn: () => apiClient.get(`/api/projects/${id}`),
});
```

### Mutations

```typescript
const [isPending, startTransition] = useTransition();

function handleUpdate() {
  startTransition(async () => {
    await updateTaskAction(taskId, { status: "completed" });
  });
}
```

### Forms

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(TaskSchema),
  defaultValues: {},
});

async function onSubmit(data: TaskPayload) {
  await createTaskAction(data);
}
```

---

## Important Conventions

### Do's ✓

- Use `"use server"` in action files, `"use client"` for interactive components
- Keep components focused on presentation, logic in services/actions
- Use type-safe patterns (TypeScript strict, Zod validation)
- Always parse timestamps with `date-fns`
- Use `cn()` from `lib/utils.ts` for className merging (Tailwind)
- Return early and throw errors for clarity
- Use React Query for server state, Zustand for UI state
- Keep route groups for layout organization: `(auth)`, `(dashboard)`

### Don'ts ✗

- Don't fetch directly in client components; always fetch in server component and pass promise down and use use hooks in client components with suspense in parent server component
- Don't pass raw Prisma models to client; sanitize/transform first
- Don't import from `node_modules` Prisma client in client components
- Don't disable TypeScript strict mode without justification
- Don't use `any` type without explicit `// @ts-ignore` comment

---

## Debugging & Troubleshooting

### Dev Tools

- **Prisma Studio:** `npm run db:studio` → GUI for database inspection
- **React Query DevTools:** Already installed, shows query cache
- **Next.js DevTools:** `next-devtools-mcp` installed (`v0.3.10`)
- **Browser DevTools:** Standard React DevTools

### Common Issues

| Issue                     | Solution                                          |
| ------------------------- | ------------------------------------------------- |
| Hydration mismatch        | Wrap dynamic components in `Suspense` boundary    |
| Prisma query error        | Check schema alignment, run `npm run db:push`     |
| Server action not working | Verify `"use server"` directive, check error logs |
| Cache invalidation        | Use React Query `invalidateQueries()`             |
| Type errors with Prisma   | Run `npm run db:generate`                         |

---

## Environment & Node Requirements

- **Node:** ≥ 20.17.0 (specified in `package.json`)
- **Package Manager:** npm (verified working)
- **Database:** PostgreSQL (configured in Prisma)
- **Environment Variables:** `.env.local` (create from schema in Prisma docs)

---

## Deployment Notes

- Uses Vercel deployment ready
- Next.js 16 with cacheComponents enabled in `next.config.ts`
- Environment variables for database connection required
- Build command: `npm run build`
- Start command: `npm run start`
