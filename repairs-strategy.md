# Repairs List Feature Strategy

This strategy outlines the refactoring of the main repairs list view into a domain-specific feature structure, following the pattern established for "Add Reparation".

## Objective
Migrate the repairs list logic and components from the "app shell" (`src/app/(dashboard)/repairs/`) to the "feature core" (`src/features/repairs/_main/`) to ensure clean separation of concerns and maintainability.

## Proposed Structure

```text
src/features/repairs/_main/
├── _layouts/                    # Structural components for the repairs view
│   └── repairs-view-layout.tsx  # Grid/Flex layout for list + sidebar
├── _components/                 # Domain-specific UI components
│   ├── repair-list-container.tsx # Wrapper with filters and table
│   ├── repair-details-drawer.tsx # Refactored sidebar using sheet/drawer
│   ├── repair-actions-bar.tsx   # Top actions (Add, Stats, etc.)
│   └── stats/                   # Repair highlight statistics
├── _hooks/                      # Business logic and state management
│   ├── use-repair-list.ts       # Sorting, filtering, and pagination state
│   └── use-repair-actions.ts    # Logic for status changes, payments, etc.
├── _queries/                    # TanStack Query hooks
│   └── use-repairs-queries.ts   # GET /repairs, status updates, etc.
├── _types/                      # Feature-specific types
│   └── index.ts
└── index.ts                     # Public API for the route entry point
```

## Refactoring Steps

### 1. Centralize Data Fetching (`_queries/`)
Move the `fetchRepairs` logic from `page.tsx` into specialized TanStack Query hooks. This includes handling pagination, status filters, and search terms.

### 2. Extract Business Logic (`_hooks/`)
- Move logic from `use-repair-management.ts` to `use-repair-actions.ts`.
- Create `use-repair-list.ts` to manage filtering and pagination state, decoupling it from the `RepairsPage` component.

### 3. Component Refactoring (`_components/`)
- Refactor `RepairFilters` into `RepairListContainer`.
- Refactor `RepairDetailsSidebar` to use a more standard UI pattern (like Radix/Shadcn UI Sheet) and follow the FC standard (Arrow functions, Props interface, Rest props).
- Standardize all components to use `React.FC<Props>` and `cn` for class merging.

### 4. Thin Route Implementation
Update `src/app/(dashboard)/repairs/page.tsx` to be a minimal entry point:
```tsx
const RepairsPage: React.FC = () => {
  return (
    <RepairsViewLayout>
      <RepairActionsBar />
      <RepairListContainer />
      <RepairDetailsDrawer />
    </RepairsViewLayout>
  );
};
```

## Coding Standards Compliance
All new and refactored components MUST:
1. Use **Arrow Functions** (`const Comp: React.FC<Props> = ...`).
2. Extend `React.ComponentPropsWithoutRef` in their Props interface.
3. Spread `...rest` onto the root element.
4. Use the `cn()` utility for styling.
