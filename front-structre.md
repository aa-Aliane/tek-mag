# Refined Frontend Structure: Add Reparation Feature

This structure separates structural "shell" components from domain-specific "feature" components, ensuring a clean separation of concerns.

## Coding Standards for Components

To ensure consistency and type safety across the feature, all functional components (FC) must follow these rules:

1.  **Arrow Functions:** Always use `const Name: React.FC<Props> = (...) => ...`
2.  **Props Interfaces:** Always define a `Props` interface that extends the appropriate React HTML/Component attribute type using `React.ComponentPropsWithoutRef`.
3.  **Rest Props:** Always spread `...rest` onto the root element of the component to support standard HTML attributes (className, id, etc.).

### Example Component Template

```tsx
import React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  customProp?: string;
}

const MyComponent: React.FC<Props> = ({ className, customProp, ...rest }) => {
  return (
    <div className={cn("base-style", className)} {...rest}>
      {customProp}
    </div>
  );
};

export default MyComponent;
```

## Refined Directory Tree

```text
src/features/repairs/_add-reparation/
├── _layouts/                    # Structural / "Frame" components
│   ├── summary-sidebar.tsx      # The right-hand recap card
│   ├── step-layout.tsx          # Shared wrapper for step content
│   ├── payment-layout.tsx       # Specific layout for payment tabs
│   └── use-summary-layout.ts    # Logic for summary calculations & sync
├── _components/                 # Domain / "Feature" components
│   ├── device/
│   │   ├── device-type-grid.tsx
│   │   └── brand-model-picker.tsx
│   ├── issues/
│   │   ├── quality-tier-selector.tsx
│   │   └── selected-issues-list.tsx
│   ├── client/
│   │   ├── client-search-autocomplete.tsx
│   │   └── new-client-form.tsx
│   └── payment/
│       ├── payment-methods.tsx
│       └── discount-section.tsx
├── _hooks/                      # Shared business logic
│   ├── use-add-reparation-form.ts  # Master hook for form state
│   ├── use-device-selection.ts
│   └── use-issue-pricing.ts
├── _queries/                    # TanStack Query hooks (feature-specific)
├── _types/                      # Feature-specific TS definitions
│   └── index.ts
├── _utils/                      # Helpers (icons, formatting)
│   └── device-helpers.ts
└── index.ts                     # Public API for the app/ directory
```

## How to use this with Next.js `app/`

To keep your routes "thin," the files in `app/(dashboard)/add-reparation/` will act as simple entry points. All page/layout files should also follow the FC standard.

### 1. `layout.tsx` (The Shell)

```tsx
import React from "react";
import { SummarySidebar } from "@/features/repairs/_add-reparation/_layouts";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const AddReparationLayout: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <div className="grid lg:grid-cols-3 gap-8" {...rest}>
      <div className="lg:col-span-2">{children}</div>
      <SummarySidebar />
    </div>
  );
};

export default AddReparationLayout;
```

### 2. `device/page.tsx` (The Step)

```tsx
import React from "react";
import { DeviceStep } from "@/features/repairs/_add-reparation";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const DevicePage: React.FC<Props> = ({ ...rest }) => {
  return <DeviceStep {...rest} />;
};

export default DevicePage;
```

## Refactoring Steps

1. **Extract Layout Logic:** Move the sidebar and summary logic from the current `layout.tsx` into `_layouts/summary-sidebar.tsx`.
2. **Decompose Pages:** Split the 300-line `client/page.tsx` into `ClientSearch` and `NewClientForm` inside `_components/client/`.
3. **Centralize State:** Ensure `useReparationStore` and `useAddReparationStore` are accessed primarily through hooks in `_hooks/` to decouple UI from store structure.
