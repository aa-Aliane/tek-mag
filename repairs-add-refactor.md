# Refactoring Strategy: `add-reparation` to `repairs/add`

## Objective
Relocate the repair creation flow from `/add-reparation` to a more RESTful and hierarchical route `/repairs/add`, while simultaneously fixing architectural inconsistencies in the "Client" step.

## Phase 1: File System Restructuring

1.  **Move Directory**:
    *   Current: `frontend/src/app/(dashboard)/add-reparation`
    *   Target: `frontend/src/app/(dashboard)/repairs/add`
    *   Action: Move the folder and rename `add-reparation` to `add`.

## Phase 2: Route & Link Updates

We need to update all hardcoded strings and routing logic that reference the old path.

### Target Patterns
*   `"/add-reparation"` -> `"/repairs/add"`
*   `"/add-reparation/device"` -> `"/repairs/add/device"`
*   `"/add-reparation/issues"` -> `"/repairs/add/issues"`
*   `"/add-reparation/client"` -> `"/repairs/add/client"`
*   `"/add-reparation/payment"` -> `"/repairs/add/payment"`

### Key Files to Update
1.  **Feature Navigation (Internal Flow)**:
    *   `src/features/repairs/_add-reparation/_components/device/device-step.tsx`
    *   `src/features/repairs/_add-reparation/_components/issues/issues-step.tsx`
    *   `src/features/repairs/_add-reparation/_components/payment/payment-step.tsx`
    *   `src/app/(dashboard)/repairs/add/client/page.tsx` (formerly `add-reparation/client/page.tsx`)

2.  **Layout & Progress Indicators**:
    *   `src/app/(dashboard)/repairs/add/layout.tsx`: Update `pathname.includes` checks for step detection.
    *   `src/features/repairs/_add-reparation/_layouts/use-summary-layout.ts`: Update `pathname.includes` checks.

3.  **External Links (Entry Points)**:
    *   `src/app/(dashboard)/repairs/page.tsx`: The "Add Repair" button.
    *   `src/app/(dashboard)/archives/page.tsx`
    *   `src/components/features/calendrier/repair-calendar.tsx`

## Phase 3: Architectural Cleanup (The Client Step)

As noted in the investigation, the "Client" step currently contains domain logic inside the page wrapper, violating the project's "thin route" pattern.

1.  **Create Component**:
    *   Create `src/features/repairs/_add-reparation/_components/client/client-step.tsx`.
    *   Move the UI and form logic from the page file to this component.

2.  **Create Hook (Optional but recommended)**:
    *   Extract the client search and selection logic into `src/features/repairs/_add-reparation/_hooks/use-client-selection.ts`.

3.  **Update Route**:
    *   Refactor `src/app/(dashboard)/repairs/add/client/page.tsx` to simply render `<ClientStep />`.

## Phase 4: Verification

1.  **Build Check**: Run `npm run build` to ensure no import paths are broken.
2.  **Flow Test**:
    *   Navigate to `/repairs/add`.
    *   Verify redirection to `/repairs/add/device`.
    *   Complete the flow: Device -> Issues -> Client -> Payment.
    *   Verify the Sidebar Summary updates correctly at each step.
