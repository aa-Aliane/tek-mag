# Proposed Frontend Structure: Add Reparation Feature

To align with Next.js best practices (thin pages) and your feature-based organization, here is the proposed structure for the `add-reparation` module.

## Directory Tree

```text
src/features/repairs/_add-reparation/
├── _components/               # UI Components
│   ├── layout/
│   │   ├── sidebar-summary.tsx    # Extracted from layout.tsx
│   │   └── payment-layout.tsx    # Extracted from _layouts/
│   ├── device/
│   │   └── device-type-grid.tsx
│   ├── issues/
│   │   ├── quality-tier-selector.tsx
│   │   └── selected-issue-card.tsx
│   ├── client/
│   │   ├── client-search.tsx     # Extracted from client/page.tsx
│   │   └── new-client-form.tsx   # Extracted from client/page.tsx
│   └── payment/
│       ├── payment-form.tsx
│       └── discount-form.tsx
├── _hooks/                    # Business Logic & Data Fetching
│   ├── use-device-step.ts         # Logic for device selection
│   ├── use-issues-step.ts         # Logic for issues & subtotal
│   ├── use-client-step.ts         # Logic for client search/creation
│   ├── use-payment-step.ts        # Logic for submission
│   └── use-summary-layout.ts      # Logic for sidebar calculations
├── _utils/                    # Helper functions
│   └── device-utils.ts            # getDeviceIcon, etc.
├── _types/                    # Feature-specific types
│   └── form-data.ts
└── index.ts                   # Public API (exports main components/hooks)
```

## Refactoring Strategy

### 1. The Layout (`layout.tsx`)
Move the sidebar rendering to `_components/layout/sidebar-summary.tsx` and the state/fetching logic to `_hooks/use-summary-layout.ts`.
**New Page Layout:**
```tsx
export default function AddReparationLayout({ children }) {
  const { summaryData, currentStep } = useSummaryLayout();
  return (
    <div className="layout-grid">
      <SharedHeader currentStep={currentStep} ... />
      <main>{children}</main>
      <SidebarSummary data={summaryData} />
    </div>
  );
}
```

### 2. The Steps (Pages)
Each page in `app/(dashboard)/add-reparation/*/page.tsx` should ideally be less than 20 lines of code.
**Example for `device/page.tsx`:**
```tsx
"use client";
import { DeviceStepContent } from "@/features/repairs/_add-reparation";

export default function AddReparationDevicePage() {
  return <DeviceStepContent />;
}
```

### 3. Benefits of this move:
- **Clean Routing:** The `app` directory only defines the URL structure and the high-level shell.
- **Encapsulation:** Hooks like `useSubtotal` or `useAddReparationDevice` are co-located with the feature they serve.
- **Readability:** `client/page.tsx` (currently ~300 lines) will be split into manageable pieces: `ClientSearch`, `NewClientForm`, and a `useClientStep` hook.
- **Internal Privacy:** The `_` prefix clearly indicates that these files should only be imported within the `repairs` feature.
