# Add Reparation Section - UI/UX Overview

## Overall Flow
The add-reparation workflow is a 3-step process:
1. **Device Selection** - Select device type, brand, and model
2. **Issues Selection** - Select problems and add details
3. **Client Information** - Enter client details and submit

## Layout and Shared Components
- A shared header with progress indicator showing the 3 steps: "Appareil", "Problèmes", "Client"
- A summary sidebar that displays the current information as the user progresses
- Responsive grid layout with form area and summary sidebar

The summary sidebar shows:
- Device information (type, brand, model)
- Selected issues count
- Additional details (accessories, password, scheduled date)
- Deposit status with a checkmark indicator

## Step 1: Device Selection UI
- Page title: "Nouvelle Réparation"
- Section title: "Type d'appareil"
- Subtitle: "Sélectionnez le type d'appareil à réparer"
- Grid of device type cards with icons and labels:
  - Smartphone (Smartphone icon)
  - Tablet (Tablet icon)
  - Laptop (Laptop icon)
  - Desktop (Monitor icon)
  - Watch (Watch icon)
  - Console (Gamepad2 icon)
- After selecting device type, shows brand selection with:
  - Featured brands section with logos for popular brands
  - Searchable list of all brands
- After selecting brand, shows model selection with:
  - Combobox to select model
- "Suivant" (Next) button to proceed

## Step 2: Issues Selection UI
- Section title: "Problèmes rencontrés"
- Subtitle: "Sélectionnez tous les problèmes qui s'appliquent"
- Grid of issue cards with checkboxes:
  - Each issue displayed as a card with checkmark when selected
  - Visual feedback when issue is selected (border color and background change)
- Additional fields:
  - Textarea for detailed description ("Description détaillée")
  - Input field for accessories ("Accessoires fournis")
  - Input field for unlock code ("Code de déverrouillage")
  - Checkbox for deposit received ("Acompte reçu")
  - Calendar component for scheduled date ("Date prévue") with date picker
- Navigation buttons: "Retour" (Back) and "Suivant" (Next)

## Step 3: Client Information UI
- Contains client information form fields
- "Submit" button to complete the process
- After submission, redirects to calendar page

## Brand Selection UI Improvements
- Featured brands section with visual cards and logos
- Search functionality for all brands
- After brand selection, compact single brand card with:
  - Brand name and logo
  - "Change" button with RotateCcw icon
- When clicking "Change", returns to full selection interface

## Visual Design Elements
- Cards with padding (p-8 class)
- Labels with consistent styling
- Buttons with consistent sizing (lg)
- Loading states with spinner icons and text
- Error states with red text and descriptive messages
- Responsive grid layouts that adapt to screen size
- Consistent spacing and padding throughout
- French language UI elements