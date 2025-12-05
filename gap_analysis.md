# Frontend-Backend Gap Analysis

## Executive Summary
The backend is currently missing several key components required by the frontend. The frontend expects APIs for stock management, suppliers, and locations, but the backend lacks both the API endpoints and the underlying database models for these features. Additionally, the `repairs` app exists but is not exposed via API.

## Missing Models & Endpoints (Critical)

The following features are implemented in frontend hooks but are **completely missing** from the backend (no models, no views, no URLs):

| Feature | Frontend Hook | Expected Endpoint | Backend Status |
| :--- | :--- | :--- | :--- |
| **Stock Items** | `use-stock-items.ts` | `/api/tech/stock-items/` | ❌ Model missing in `apps/tech` |
| **Locations** | `use-inventory-locations.ts` | `/api/tech/locations/` | ❌ Model missing in `apps/tech` |
| **Suppliers** | `use-suppliers.ts` | `/api/tech/suppliers/` | ❌ Model missing in `apps/tech` |
| **Store Orders** | `use-store-orders.ts` | `/api/tech/store-orders/` | ❌ Model missing in `apps/tech` |

## Unexposed Features

The following features exist in the backend models but are **not exposed** via the API:

| Feature | Backend Model | Current Status | Action Required |
| :--- | :--- | :--- | :--- |
| **Repairs** | `apps.repairs.models.Repair` | ✅ Model exists<br>❌ No `urls.py`<br>❌ No `views/`<br>❌ No `serializers/` | Create API layer for Repairs |

## Existing & Correct

The following endpoints appear to be correctly implemented:

*   ✅ `/api/tech/products/` (Backed by `ProductViewSet`)
*   ✅ `/api/tech/brands/` (Backed by `BrandViewSet`)
*   ✅ `/api/tech/product-models/` (Backed by `ProductModelViewSet`)
*   ✅ `/api/users/` & `/api/profiles/` (Accounts app)

## Recommendations

1.  **Create Missing Models**: Implement `StockItem`, `Location`, `Supplier`, and `StoreOrder` models in `apps/tech` (or a new app).
2.  **Implement API Layer**: Create serializers, views, and URL routers for these new models.
3.  **Expose Repairs**: Create the API layer (serializers, views, urls) for the existing `Repair` model.
