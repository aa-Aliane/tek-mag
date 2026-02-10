The payment module in the `repairs` app is structured to provide a clear audit trail of all financial transactions related to a repair. Here's a summary of its key components:

### 1. Data Models
*   **Payment (`models/payment.py`)**: Stores individual transactions.
    *   **Types**: Supports both `payment` and `refund`.
    *   **Methods**: Cash, Card, Check, or Transfer.
    *   **Rounding Logic**: Includes a custom `save` method that rounds cash payments to the nearest 0.50 and digital payments to 0.01.
    *   **Tracking**: Records who created the payment (`created_by`) and when.
*   **Discount (`models/discount.py`)**: A separate model to track price reductions (e.g., "Loyalty discount"), allowing the system to distinguish between money received and price adjustments.

### 2. Financial Logic (`models/repair.py`)
The `Repair` model uses properties to calculate the financial state of a repair in real-time:
*   **`total_paid`**: Calculated as `Sum(payments) - Sum(refunds)`.
*   **`final_price`**: The expected total (`base_price` - `total_discounts`).
*   **`remaining_balance`**: `final_price` - `total_paid`.
*   **`payment_status`**: Returns `paid` (if balance is 0 or less), `partial` (if some payment exists), or `unpaid`.

### 3. API & Serialization
*   **Nested Routes**: Payments are managed via nested endpoints: `/repairs/{repair_id}/payments/`.
*   **Serialization**: The `RepairSerializer` automatically includes:
    *   The full history of payments.
    *   Calculated fields (`base_price`, `total_paid`, `remaining_balance`, `payment_status`).
*   **Permissions**: Creating a payment requires authentication and automatically associates the transaction with the current user.

### 4. Workflow Integration
The payment system is decoupled from the repair's operational status (`Saisie`, `En cours`, `Terminé`, etc.). This allows for flexible workflows, such as accepting deposits (partial payments) while a repair is still in progress or issuing refunds after a repair is marked as finished.
