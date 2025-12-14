Fix device_type filtering in repairs API endpoint

- Updated filter_by_device_type method to use case-insensitive partial matching
- Changed from exact slug matching to flexible icontains matching to handle CSV-imported device type slugs
- Added support for multiple device type aliases (computer/laptop/pc, smartphone/phone, etc.)
- Fixed issue where device_type query parameter returned empty results due to slug format mismatch