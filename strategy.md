# Implementation Strategy: Add Reparation Payment Module

This document outlines the strategy for fully implementing the payment and discount functionality in the "Add Reparation" wizard, ensuring alignment with the backend architecture.

## 1. Backend Architecture Review
- **Repair Model:** Calculates financial state dynamically via properties (`base_price`, `final_price`, `total_paid`, `remaining_balance`).
- **Payment Model:** Dedicated to money transactions (`payment`, `refund`) with specific methods (`cash`, `card`, etc.) and rounding logic.
- **Discount Model:** Separate entity for price adjustments (e.g., "Loyalty Discount").
- **API Endpoints:** 
  - `POST /api/repairs/repairs/`: Create the repair and its issues.
  - `POST /api/repairs/repairs/{id}/payments/`: Record a payment.
  - `POST /api/repairs/repairs/{id}/discounts/`: Record a discount.

## 2. Frontend State Updates (`addReparationStore.ts`)
The `RepairFormData` needs to be expanded to track pending payments and discounts before final submission:

```typescript
interface RepairFormData {
  // ... existing fields
  payments: {
    amount: number;
    method: 'cash' | 'card' | 'check' | 'transfer';
    note?: string;
  }[];
  discounts: {
    amount: number;
    reason: string;
  }[];
}
```

## 3. UI Component Development
Following the feature-based structure in `src/features/repairs/_add-reparation/`:

### A. `_components/payment/payment-methods.tsx`
- Form to add multiple payment entries.
- Real-time calculation of "Remaining to pay" based on `totalPrice` and existing payment entries.
- Selection of payment method (Espèces, Carte, etc.).

### B. `_components/payment/discount-section.tsx`
- Ability to subtract fixed amounts from the total.
- Input for "Reason" (mandatory for audit trail).

### C. Layout Integration
- Integrate these components into the `Tabs` in `payment/page.tsx`.
- Update `SummarySidebar` to show the breakdown:
  - Base Total
  - Total Discounts (-)
  - Final Price
  - Total Paid
  - **Remaining Balance**

## 4. Submission Logic (`submitForm`)
The submission process must be sequential because the backend handles these as separate resources:

1. **Step 1: Create Repair**
   - Call `POST /api/repairs/repairs/`.
   - Receive the created Repair ID.
2. **Step 2: Process Discounts**
   - For each discount in `formData.discounts`, call `POST /api/repairs/repairs/{id}/discounts/`.
3. **Step 3: Process Payments**
   - For each payment in `formData.payments`, call `POST /api/repairs/repairs/{id}/payments/`.
4. **Step 4: Completion**
   - If all steps succeed, reset the store and redirect.
   - If any step fails, provide options to retry specific parts (to avoid duplicate repairs).

## 5. Coding Standards
All new components will strictly follow:
- Arrow function definitions.
- `React.FC<Props>` typing.
- `Props` extending `React.ComponentPropsWithoutRef`.
- Usage of `...rest` and `cn()` for styling consistency.
