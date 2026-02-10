# QWEN Project Context

## Project Overview
**Tek-Mag** is a full-stack web application designed for managing technical repairs and client services. It features a Django-based backend providing a REST API and a Next.js frontend for the user interface. The system includes authentication, role-based access, and search capabilities.

## Technology Stack

### Backend
* **Framework**: Django 5.2.4
* **API**: Django REST Framework (DRF)
* **Database**: PostgreSQL 16
* **Search**: Elasticsearch 8.17 (via `django-elasticsearch-dsl`)
* **Authentication**:
  * `dj-rest-auth` & `django-allauth`
  * JWT (JSON Web Tokens) with Cookie support (`dj-rest-auth`, `simplejwt`)
  * Social Auth (Google, Facebook)
* **Documentation**: OpenAPI 3.0 via `drf-spectacular`
* **Containerization**: Docker & Docker Compose

### Frontend
* **Framework**: Next.js 16 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS 4
* **UI Components**: Shadcn UI (Radix UI primitives)
* **State Management**: Zustand, React Query (`@tanstack/react-query`)
* **Forms**: React Hook Form + Zod validation
* **HTTP Client**: Axios for API requests with automatic token refresh

## Architecture

### Backend Structure (`/backend`)
The backend follows a modular Django app structure located in `backend/apps/`:
* **`accounts`**: User management, authentication, and profiles.
* **`tech`**: Handles technical inventory, devices, products, brands, models, locations, suppliers, stock items, and store orders.
* **`repairs`**: Core logic for managing repair tickets and workflows, including issues and repair status management.

**Key Configurations**:
* Settings managed via `django-environ`.
* I18N enabled (French default).
* CORS configured for frontend interaction.

### Frontend Structure (`/frontend`)
The frontend uses the Next.js App Router:
* **`app/`**: Next.js app router pages including authentication and dashboard routes
* **`components/`**: Reusable UI components
* **`hooks/`**: Custom React hooks for API interaction
* **`lib/`**: Helper functions and utilities including API client configuration
* **`services/`**: API client and service layers
* **`types/`**: TypeScript type definitions
* **`store/`**: Zustand stores for global state management
* **`contexts/`**: React context providers

## Development Environment
* **Docker Compose**: Orchestrates `db` (Postgres), `backend` (Django), and `frontend` (Next.js).
* **Makefile**: Provides shortcuts for common tasks:
  * `make init-backend` - Initialize backend with migrations and applies them
  * `make migrate` - Create and apply database migrations
  * `make createsuperuser` - Create Django superuser
  * `make load-clients-data` - Load client data
  * `make load-reparations-data` - Load reparation data
  * `make generate-test-data` - Generate test data
  * `make venv` - Create virtual environment and install dependencies
  * `make clean` - Clean virtual environment

## Key Features
* **User Authentication**: Secure login/signup with JWT and social providers.
* **Repair Tracking**: Management of repair lifecycle with multiple statuses (saisie, en-cours, prete, en-attente).
* **Inventory Management**: Managing products, brands, models, locations, suppliers, stock items and store orders.
* **Client Management**: Specialized data loading for clients.
* **Search**: Full-text search capabilities using Elasticsearch.

## Store Management Implementation Status

### Current Status
* **Backend**: Complete API infrastructure exists (StoreOrder, Product, Supplier, StockItem models with corresponding ViewSets and serializers)
* **Frontend**: Interface only allows viewing existing orders; critical functionality to create new orders is missing

### Known Issues
* **Empty Components**: `command-form.tsx` was empty but has now been implemented for order creation
* **Missing API Services**: `commands.ts` and `products.ts` service files were empty but are now implemented
* **No Order Creation**: Users can now create new orders via the command form
* **No Repair Integration**: Now implemented with repair selection in the command form
* **No Command Detail View**: The detail view is implemented and connected to dynamic route
* **Missing New Order Route**: Need to create `/commandes/new` route for creating new orders
* **Inconsistent UI Patterns**: Now aligned with repairs module patterns (side panel details view, consistent filtering, etc.)
* **Incomplete row interaction**: Now fixed - clicking on a row opens the details view
* **Missing shadcn/ui components**: Now properly implemented with Input and Select components

## Backend Models Status

**Note**: The gap_analysis.md document is OUTDATED. All models and APIs mentioned below are actually IMPLEMENTED in the backend:

### Tech App Models
* **Brand**: Represents product brands with device type associations
* **Series**: Product series under brands
* **ProductModel**: Device models within series
* **Product**: Individual products with pricing (retail, repair, special, other)
* **DeviceType**: Categories like smartphones, tablets, computers
* **Location**: Physical locations for inventory management
* **Supplier**: Vendor information for procurement
* **StockItem**: Inventory tracking linking products to locations
* **StoreOrder**: Purchase orders from suppliers

### Repairs App Models
* **Repair**: Complete repair record with client, product model, status, pricing, and description
* **Issue**: Defects or problems in repairs with device type associations

### Accounts App Models
* **User**: Custom user model extending AbstractUser
* **Profile**: Extended user profile information
* **EmailVerificationCode**: For email verification flow

## API Endpoints

### Tech Endpoints
* `/api/tech/products/` - Product management (ProductViewSet)
* `/api/tech/brands/` - Brand management (BrandViewSet)
* `/api/tech/product-models/` - Product model management (ProductModelViewSet)
* `/api/tech/locations/` - Location management (LocationViewSet)
* `/api/tech/suppliers/` - Supplier management (SupplierViewSet)
* `/api/tech/stock-items/` - Stock item management (StockItemViewSet)
* `/api/tech/store-orders/` - Store order management (StoreOrderViewSet)
* `/api/tech/device-types/` - Device type management (DeviceTypeViewSet)

### Repairs Endpoints
* `/api/repairs/repairs/` - Repair record management (RepairViewSet)
* `/api/repairs/issues/` - Issue management (IssueViewSet)

### Auth Endpoints
* `/api/auth/` - Standard auth endpoints from dj-rest-auth
* `/api/auth/login/` - Custom mobile login view
* `/api/` - Account management endpoints

## Frontend Hooks

The frontend provides React Query hooks for all backend endpoints:
* `useProducts`, `useBrands`, `useProductModels`, `useDeviceTypes`
* `useInventoryLocations`, `useSuppliers`, `useStockItems`, `useStoreOrders`
* `useRepairs`, `useClients`, `useAuth`
* and more specific hooks for different use cases

## Docker Services

The project uses Docker Compose with the following services:
- **db**: PostgreSQL 16 database
- **backend**: Django server running on port 8000
- **frontend**: Next.js application running on port 5173
- **elasticsearch**: Elasticsearch service for search capabilities

## Development Commands

- `make init-backend` - Initialize backend with migrations and applies them
- `make migrate` - Create and apply database migrations
- `make createsuperuser` - Create Django superuser
- `make load-clients-data` - Load client data
- `make load-reparations-data` - Load reparation data
- `make generate-test-data` - Generate test data
- `make venv` - Create virtual environment and install dependencies
- `make clean` - Clean virtual environment

## Environment Variables Management
- Environment variables are managed through `.envs/.local/` directory with separate files for database, server, and client configurations.

## Important Files and Directories
- `docker-compose.yml` - Docker orchestration configuration
- `Makefile` - Contains development commands
- `FRONTEND_ROADMAP.md` - Frontend development roadmap
- `gap_analysis.md` - **OUTDATED** Analysis of backend-frontend gaps (all mentioned issues are now resolved)
- `project_context.md` - Overall project context
- `backend/` - Django backend application
- `frontend/` - Next.js frontend application
- `temp.tsx` - Sample frontend component for repair form
- `backend/conf/settings.py` - Django settings with comprehensive configuration
- `backend/conf/urls.py` - Main URL configuration

## API Client Configuration
The frontend uses an Axios-based API client configured with:
- Base URL from environment variables (`NEXT_PUBLIC_API_BASE_URL`)
- Automatic credential handling (HttpOnly cookies)
- Request/response interceptors for token refresh
- Error handling with automatic 401 token refresh attempts
- Redirect to login on authentication failure