# Technical and Stock Applications Documentation

This document provides a comprehensive overview of the `tech` and `stock` apps within the backend system. These apps form the core of the product catalog and inventory management system.

---

## 1. Tech App (`apps/tech`)
The `tech` app serves as the product catalog. It defines the hierarchy of brands, device types, models, and variants.

### Data Models
- **Brand**: Represents manufacturers (e.g., Apple, Samsung).
- **DeviceType**: Categories of devices (e.g., Smartphones, Laptops). Organized by domains (PHONES, COMPUTERS).
- **Series**: Product series within a brand (e.g., iPhone Pro, Galaxy S).
- **BaseProduct**: An abstract-like umbrella model for anything that can be in stock.
    - `is_serialized`: Boolean flag to determine if items require individual tracking (IMEI/Serial Number).
- **ProductModel**: Specific device models (e.g., iPhone 16 Pro). Inherits from `BaseProduct`.
- **PartType**: Standardized types of spare parts (e.g., Screen, Battery).
- **Part**: Represents a spare part component. Inherits from `BaseProduct`.
    - `compatible_models`: Many-to-Many relationship with `ProductModel`.
- **Color**: Standardized colors for products and parts.
- **QualityTier**: Grades or quality levels (e.g., Original, Premium, Grade A).
- **ProductVariant**: The specific "flavor" of a product. This is the entity that is actually held in stock.
    - Links to `BaseProduct` (either a `Part` or a `ProductModel`).
    - Includes `Color`, `QualityTier`, and optional `Storage`.
    - Stores financial data: `cost_price` and `retail_price`.

### Key Components
- **Filters**: `ProductVariantFilter` allows complex filtering by brand, category, quality, and ownership.
- **Pagination**: Includes `LargeResultsSetPagination` (100 items) and `NoPagination` for specific lookups.
- **Management Commands**:
    - `import_smart_devices_csv`: Imports thousands of device models from external data.
    - `generate_remaining_tech_data`: Populates parts, repairs, and pricing for testing.
    - `populate_tech`: Loads initial data from local CSVs.

### API Endpoints
All endpoints are managed via `DefaultRouter` at `/api/tech/`:
- `parts/`, `part-variants/`, `brands/`, `product-models/`, `device-types/`, `series/`, `colors/`, `quality-tiers/`.

---

## 2. Stock App (`apps/stock`)
The `stock` app handles the physical inventory, locations, and procurement.

### Data Models
- **Location**: Physical sites where stock is held (e.g., Retail Store, Warehouse).
- **StorageSlot**: Specific locations within a site (e.g., "Shelf A-1").
    - `is_for_parts` / `is_for_repairs`: Flags for organizational logic.
- **Supplier**: Entities that provide parts and devices.
- **StockItem**: Individual instances of a `ProductVariant` in a specific `StorageSlot`.
    - `status`: Available, Reserved, Installed, or Defective.
    - `serial_number`: Optional unique identifier (IMEI/SN).
    - `used_in_repair`: Link to the `Repair` object if the item was installed during service.
- **StoreOrder**: Procurement orders sent to suppliers.
    - Tracks status (Pending, Ordered, Received, Cancelled).

### Integration Logic
- **Tech-Stock Link**: Every `StockItem` points to a `ProductVariant` from the `tech` app.
- **Repair Link**: `StockItem` has a helper method `mark_as_installed(repair_object)` which transitions the item status and links it to a specific repair.

### API Endpoints
Managed via `DefaultRouter` at `/api/stock/`:
- `locations/`, `suppliers/`, `stock-items/`, `store-orders/`.

---

## 3. Architecture Overview

### Product Hierarchy
```text
Brand -> Series -> ProductModel (BaseProduct)
                          ^
                          |
ProductVariant <----------+ (Links to BaseProduct)
      ^
      |
  StockItem (Physical Instance in a Location/Slot)
```

### Serializers
The system uses `ModelSerializer` with expanded representations:
- `ProductVariantSerializer` dynamically calculates `margin` and expands product/brand details for "Flat" consumption by the frontend (React Tables).
- `StockItemSerializer` includes `PartSerializer` and `location_name` for easy display.
- `StoreOrderSerializer` includes several `SerializerMethodFields` to handle calculated delivery dates and financial summaries.
