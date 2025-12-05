# Next.js Frontend Roadmap

This roadmap outlines the steps to build the frontend for your application using Next.js. It's structured progressively, from project setup to advanced features.

## Phase 1: Project Setup & Foundation

- [ ] **Set up Next.js Project:**
  - [ ] Initialize a new Next.js project (`npx create-next-app@latest`).
  - [ ] Choose TypeScript, ESLint, and Tailwind CSS during setup.
- [ ] **Project Structure:**
  - [ ] Create directories for `components`, `lib`, `hooks`, `styles`, `types`.
- [ ] **API Client:**
  - [ ] Install `axios` or use the built-in `fetch`.
  - [ ] Create a centralized API client in `lib/api.ts` to handle requests to your Django backend.
  - [ ] Set up base URL and interceptors for handling authentication tokens.
- [ ] **Authentication:**
  - [ ] Create a login page (`/login`).
  - [ ] Implement login form and logic to call the `/api/auth/login/` endpoint.
  - [ ] Store the authentication token securely (e.g., in `httpOnly` cookies or local storage).
  - [ ] Create a context or a state management solution (e.g., Zustand, Redux Toolkit) for managing user authentication state.
  - [ ] Implement logout functionality.
  - [ ] Create protected routes that require authentication.
- [ ] **Main Layout:**
  - [ ] Create a `Layout` component that includes a navigation bar and a sidebar.
  - [ ] The navigation bar should have a logout button and display the logged-in user's name.
  - [ ] The sidebar should have links to the different pages of the application.

## Phase 2: Inventory Management

- [ ] **Locations:**
  - [ ] Create a page (`/inventory/locations`) to list all locations.
  - [ ] Implement functionality to create, edit, and delete locations.
  - [ ] Create a `LocationForm` component.
- [ ] **Stock Types:**
  - [ ] Create a page (`/inventory/stock-types`) to list all stock types.
  - [ ] Implement functionality to create, edit, and delete stock types.
  - [ ] Create a `StockTypeForm` component.
- [ ] **Products:**
  - [ ] Create a page (`/inventory/products`) to list all products.
  - [ ] Implement search and filtering by name, brand, SKU, etc.
  - [ ] Create a page (`/inventory/products/[id]`) to view a single product's details.
  - [ ] On the product detail page, display the stock levels for the product at different locations.
  - [ ] Create a page (`/inventory/products/new` and `/inventory/products/[id]/edit`) to create and edit products.
  - [ ] Create a `ProductForm` component.
- [ ] **Stock Management:**
  - [ ] On the product detail page, add a component to update the stock quantity for each stock type at each location.

## Phase 3: Repair Management

- [ ] **Repairs:**
  - [ ] Create a page (`/repairs`) to list all repairs.
  - [ ] Implement search and filtering by customer, status, etc.
  - [ ] Create a page (`/repairs/[id]`) to view a single repair's details.
  - [ ] Create a page (`/repairs/new` and `/repairs/[id]/edit`) to create and edit repairs.
  - [ ] Create a `RepairForm` component.
- [ ] **Faults:**
  - [ ] Create a page (`/repairs/faults`) to manage faults.
  - [ ] Implement functionality to create, edit, and delete faults.
  - [ ] Create a `FaultForm` component.

## Phase 4: Order Management

- [ ] **Suppliers:**
  - [ ] Create a page (`/orders/suppliers`) to manage suppliers.
  - [ ] Implement functionality to create, edit, and delete suppliers.
  - [ ] Create a `SupplierForm` component.
- [ ] **Store Orders:**
  - [ ] Create a page (`/orders/store-orders`) to list all store orders.
  - [ ] Create a page (`/orders/store-orders/[id]`) to view a single store order's details.
  - [ ] Create a page (`/orders/store-orders/new` and `/orders/store-orders/[id]/edit`) to create and edit store orders.
  - [ ] Create a `StoreOrderForm` component.
  - [ ] In the store order form, add functionality to add products to the order.

## Phase 5: Polishing & Advanced Features

- [ ] **Dashboard:**
  - [ ] Create a dashboard page (`/`) that displays key metrics, such as:
    - [ ] Number of pending repairs.
    - [ ] Low-stock products.
    - [ ] Recent orders.
- [ ] **UI/UX:**
  - [ ] Choose a component library like [Shadcn/ui](https://ui.shadcn.com/) or [Material-UI](https://mui.com/) to build a consistent and professional-looking UI.
  - [ ] Ensure the application is responsive and works well on different screen sizes.
- [ ] **Testing:**
  - [ ] Set up a testing framework (e.g., Jest, React Testing Library).
  - [ ] Write unit tests for components and utility functions.
  - [ ] Write integration tests for key user flows.
- [ ] **Internationalization (i18n):**
  - [ ] If needed, add support for multiple languages using a library like `next-i18next`.

Good luck with your project, master!
