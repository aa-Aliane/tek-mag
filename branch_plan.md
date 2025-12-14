# Store Management Implementation Plan

## Overview
This plan outlines the implementation of missing store management features, particularly the "Commande de Pièce" (Parts Order) functionality that is currently incomplete in the Tek-Mag application.

## Current Issues
- [ ] Main form components (`command-form.tsx` and `command-details.tsx`) are empty
- [ ] No interface to create new part orders
- [ ] API service files are empty
- [ ] No connection between repair issues and required parts
- [ ] Users can only view existing orders but cannot create new ones

## Implementation Phases

### Phase 1: Foundation (Day 1-2)
- [x] **Complete API service layer**
   - [x] Implement `commands.ts` service with CRUD operations for store orders
   - [x] Implement `products.ts` service with search and filtering capabilities
   - [ ] Complete `client.ts` API service with proper error handling

- [x] **Basic Form Implementation**
   - [x] Complete `command-form.tsx` with basic functionality
   - [x] Add form validation using existing validator files
   - [x] Connect form to StoreOrder API endpoints

### Phase 2: Core Functionality (Day 3-4)
- [x] **Enhanced Form Features**
   - [x] Add search and filter functionality for parts
   - [x] Implement supplier selection dropdown
   - [x] Add quantity selection and validation
   - [x] Implement order summary and confirmation

- [x] **Integration with Existing Systems**
   - [x] Connect to Product API for part catalog
   - [x] Add integration with repair workflow to suggest parts needed
   - [ ] Link to Issue model to automatically identify parts needed for repairs

### New Task: Dynamic Routing Implementation
- [x] **Create Dynamic Route for Command Details**
   - [x] Create `/commandes/[id]/page.tsx` route
   - [x] Pass order ID from URL parameters to CommandDetails component
   - [x] Update OrdersTable to link to detail pages

### Phase 3: User Experience (Day 5-6)
- [x] **Complete Detail Views**
   - [x] Implement `command-details.tsx` for order details
   - [x] Add order tracking functionality
   - [ ] Create part detail view with specifications and compatibility info
   - [x] Create dynamic route for command details page (commandes/[id]/page.tsx)

- [ ] **Enhanced UI/UX**
   - [ ] Add responsive design to forms
   - [ ] Implement proper loading states and error handling
   - [ ] Add success/error notifications using toast

### New Task: Create New Order Route
- [x] **Create New Order Route for Command Form**
   - [x] Create `/commandes/new/page.tsx` route
   - [x] Integrate CommandForm component
   - [x] Add navigation from commandes list to new form

### New Task: Implement Row Interaction and shadcn/ui Components
- [x] **Row Interaction**
   - [x] Make entire table row clickable to open details view
   - [x] Prevent click propagation to action buttons

- [x] **shadcn/ui Components**
   - [x] Replace native input with shadcn/ui Input component
   - [x] Replace native select with shadcn/ui Select components
   - [x] Ensure consistent UI styling

### Phase 4: Advanced Features (Day 7-8)
- [ ] **Inventory Management Enhancements**
   - [ ] Implement low stock alerts with configurable thresholds
   - [ ] Add automated reordering suggestions
   - [ ] Create stock movement history

- [ ] **Advanced Reporting**
   - [ ] Add order history with detailed tracking
   - [ ] Create supplier performance tracking
   - [ ] Add parts usage analytics

## Technical Implementation Steps

### Backend Enhancements (if needed)
- [ ] Review current filtering capabilities on ProductViewSet
- [ ] Ensure StoreOrder model has all necessary fields for tracking
- [ ] Add any missing relationships between Repair and PartOrder models

### Frontend Components to Implement
- [ ] **CommandForm** - Main form for creating part orders
   - [ ] Part selection with search
   - [ ] Supplier selection
   - [ ] Quantity input
   - [ ] Reason/description field
   - [ ] Order confirmation

- [ ] **PartCatalog** - Browse and search available parts
   - [ ] Filter by device type, brand, model
   - [ ] Search by name/reference
   - [ ] Stock availability indicators

- [ ] **OrderDetails** - View details of an existing order
   - [ ] Order items list
   - [ ] Supplier information
   - [ ] Tracking information
   - [ ] Status history

- [ ] **StockAlerts** - Highlight low-stock items
   - [ ] Visual indicators
   - [ ] Quick reorder functionality
   - [ ] Customizable thresholds

### API Integration
- [ ] Ensure all necessary endpoints are available
- [ ] Implement proper error handling
- [ ] Add loading and success states
- [ ] Implement proper authentication for all requests

## Dependencies
- [ ] Backend API endpoints are already available
- [ ] Existing component library (shadcn/ui) for UI elements
- [ ] React Query for state management
- [ ] Existing authentication system
- [ ] Available hooks for products, suppliers, etc.

## Testing Strategy
- [ ] Unit tests for service layer functions
- [ ] Integration tests for API connections
- [ ] Component tests for UI elements
- [ ] End-to-end tests for order creation workflow

## Success Metrics
- [ ] Users can create new part orders successfully
- [ ] Orders are properly saved and tracked in the system
- [ ] Integration with repair workflow is functional
- [ ] Stock levels are accurately updated
- [ ] Form validation prevents incorrect data entry
- [ ] Error handling provides helpful feedback

## Timeline Estimate
- Total duration: 8 days
- Phase 1: 2 days (Foundation)
- Phase 2: 2 days (Core functionality)
- Phase 3: 2 days (User experience)
- Phase 4: 2 days (Advanced features)

## Risk Mitigation
- [ ] Focus on core functionality first before advanced features
- [ ] Ensure API integration works before complex UI features
- [ ] Test integration with repair workflow early in development
- [ ] Implement proper error handling from the beginning