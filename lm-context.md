# Tek-Mag Reparation Process Context

## Overview
This document captures the context of the reparation process implementation in the Tek-Mag application, focusing on the multi-step form for creating new repair orders.

## Reparation Flow Structure

The reparation process is divided into three main steps:

### 1. Device Selection (`/add-reparation/device`)
- Allows users to select the type of device (smartphone, tablet, computer, etc.)
- Selects the brand of the device
- Selects the specific model of the device
- Uses a Zustand store to maintain state throughout the process

### 2. Issues Selection (`/add-reparation/issues`)
- Displays a list of common issues filtered by the selected device type
- Allows users to select multiple issues that apply to their device
- Includes additional details like description, accessories, password, deposit status, and scheduled date
- Issues are retrieved from the backend API based on the device type

### 3. Client Information (`/add-reparation/client`)
- Allows users to search for existing clients
- Provides option to create new clients
- Links the repair to a specific client

## Technical Implementation

### Routing and Navigation
- The main `/add-reparation` route redirects to `/add-reparation/device` to start the process
- Uses Next.js App Router with a shared layout
- State is preserved across steps using the Zustand store and Next.js router (not window.location.href)

### Shared Layout (`/add-reparation/layout.tsx`)
- Contains the shared header with progress indicators
- Includes the summary sidebar that shows all collected information
- Dynamically determines the current step based on the route
- Uses `usePathname()` to identify the current step

### State Management
- Uses Zustand store (`useReparationStore`) to maintain state across all steps
- Stores device type, brand, model, selected issues, description, accessories, password, deposit status, scheduled date, and client search data
- Prevents data loss when navigating between steps

### API Integration
- `useDeviceTypes` hook: Fetches available device types
- `useBrands` hook: Fetches brands filtered by device type
- `useProductModels` hook: Fetches models filtered by brand
- `useCommonIssues` hook: Fetches issues filtered by device type

### Backend Filtering
- Issues endpoint (`/repairs/issues/`) supports filtering by device_types
- Device types are stored as slugs in the backend (e.g., "smartphone", "tablet", "computer")
- The frontend now correctly passes device type slugs to match backend expectations

## Key Features

1. **Progressive Disclosure**: Each step focuses on specific information without overwhelming the user
2. **Real-time Validation**: Form validation occurs at each step before proceeding
3. **Dynamic Content**: Issue lists are filtered based on the selected device type
4. **Persistent State**: Information is maintained across all steps using Zustand
5. **Responsive Design**: Uses shadcn/ui components for consistent, responsive UI

## UI Components

### Step 1: Device Selection
- Grid of device type buttons with icons
- Brand selection dropdown with search functionality
- Model selection dropdown with search functionality

### Step 2: Issues Selection
- Toggleable issue buttons with checkmarks
- Text area for detailed description
- Input fields for accessories and password
- Checkbox for deposit status
- Calendar for scheduled date

### Step 3: Client Information
- Search input for existing clients
- Option to create new client

### Shared Components
- Header with progress indicators
- Summary sidebar showing all collected information
- Navigation buttons (Back/Next)

## Troubleshooting Notes

### Issue with Issue Selection
- Initially, the issue selection UI was not appearing
- Root cause: Device type was being stored as display name instead of slug
- Resolution: Changed device selection to use `type.slug` to match backend filtering expectations
- Icon rendering was fixed using a helper function instead of React.createElement

### State Preservation
- Initially using `window.location.href` which caused state loss
- Resolution: Switched to Next.js router with `useRouter.push()` to maintain state
- Summary sidebar is shared across all steps through the layout

## API Endpoints Used

- `GET /tech/device-types/` - List of device types
- `GET /tech/brands/` - List of brands (filterable by device type)
- `GET /tech/product-models/` - List of models (filterable by brand)
- `GET /repairs/issues/` - List of issues (filterable by device_types)

## Data Flow

1. User selects device type → State updates deviceType
2. Based on deviceType → Brands are fetched and filtered
3. User selects brand → State updates brand
4. Based on brand → Models are fetched and filtered
5. Based on deviceType → Issues are fetched and filtered
6. User selects issues and adds details → State updates issues and other fields
7. User provides client information → Process completed