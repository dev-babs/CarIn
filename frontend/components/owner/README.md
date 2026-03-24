# Owner Dashboard Components

This directory contains all components for the owner dashboard functionality.

## Components

### OwnerDashboard.tsx
Main dashboard component with tab navigation for different sections.

### ListSpotForm.tsx
Form component for listing new parking spots with:
- Location picker (map integration)
- Price per hour input
- Availability schedule (time and days)
- Image upload (IPFS integration)
- Description textarea

### MapPicker.tsx
Component for selecting location on map or searching address.

### ImageUpload.tsx
Component for uploading images to IPFS.

### SpotsList.tsx
Component that displays all owner's spots with management options.

### SpotCard.tsx
Individual spot card component showing spot details and action buttons.

### EditSpotModal.tsx
Modal component for editing spot details (price, description, availability).

### EarningsSummary.tsx
Component showing earnings summary, transaction history, and withdraw functionality.

### Statistics.tsx
Component displaying booking statistics and analytics with charts.

## Integration

All components are ready to be integrated with:
- ParkingSpot smart contract for spot management
- PaymentEscrow contract for earnings and withdrawals
- IPFS services for image storage
- Map services (Google Maps, OpenStreetMap) for location selection

## Wallet Connection

All owner features require wallet connection. The dashboard checks for connected wallet before rendering owner features.




