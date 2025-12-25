# To Do List

## Task: Add Serial Number or IMEI field to Device Selection

### Description
Modify the device selection page at `@frontend/src/app/(dashboard)/add-reparation/device/page.tsx` to include a field for entering the device's serial number or IMEI.

### Details
- Add a new input field after the model selection in the device page
- The field should be labeled appropriately (e.g., "Numéro de série" or "IMEI")
- Update the reparation store to include a field for storing the serial number/IMEI
- Ensure the field is included in the summary sidebar

### Files to Modify
- `@frontend/src/app/(dashboard)/add-reparation/device/page.tsx`
- Reparation store in `@/lib/store` (if not already available)

### Priority
Medium - This is an important addition for device identification and tracking.