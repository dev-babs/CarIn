# Map Integration Components

This directory contains all components related to the map integration for parking spot discovery.

## Overview

The map integration provides users with an interactive map view to discover, search, and filter nearby parking spots in real-time.

## Features

✅ **Interactive Map** - Leaflet.js with OpenStreetMap tiles
✅ **Parking Spot Markers** - Visual indicators for available/unavailable spots
✅ **Geolocation** - Automatic centering on user's location
✅ **Address Search** - Search and geocode addresses with debouncing
✅ **Filtering** - Price range, availability, and distance filters
✅ **Marker Clustering** - Performance optimization for many markers
✅ **Real-time Availability** - Periodic updates of spot availability
✅ **Responsive Design** - Mobile and desktop optimized
✅ **View Toggle** - Switch between map and list views

## Components

### Core Components

- **MapView.tsx** - Main map view component integrating all features
- **MapContainer.tsx** - Base Leaflet map container
- **ParkingSpotMarker.tsx** - Individual parking spot marker
- **SpotInfoWindow.tsx** - Popup/info window for marker details
- **MarkerCluster.tsx** - Marker clustering for performance
- **SpotList.tsx** - List view component for parking spots

### UI Components

- **MapSearch.tsx** - Address/location search input
- **MapFilters.tsx** - Filter panel (price, availability, distance)
- **MapControls.tsx** - Map control buttons (zoom, center, fullscreen)
- **ViewToggle.tsx** - Toggle between map and list views

## Hooks

### useParkingSpots
Fetches and caches parking spots for map display.
```typescript
const { spots, loading, error, refresh } = useParkingSpots();
```

### useGeolocation
Gets user's current location.
```typescript
const { location, loading, error, getCurrentPosition } = useGeolocation();
```

### useSpotAvailability
Checks real-time availability of spots.
```typescript
const { getAvailability, refreshAvailability } = useSpotAvailability(spots);
```

## Utilities

### geocoding.ts
Geocoding utilities for address search.
- `geocodeAddress(address: string)` - Convert address to coordinates
- `reverseGeocode(lat: number, lng: number)` - Convert coordinates to address

### distance.ts
Distance calculation utilities.
- `calculateDistance(coord1, coord2)` - Calculate distance in km
- `formatDistance(distanceKm)` - Format distance for display
- `isWithinRadius(center, point, radiusKm)` - Check if point is within radius

## Configuration

Map configuration is managed in `lib/config/map.ts`:

```typescript
export const mapConfig: MapConfig = {
  provider: 'leaflet' | 'google',
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  defaultCenter: { lat: 37.7749, lng: -122.4194 },
  defaultZoom: 13,
  maxZoom: 18,
  minZoom: 10,
};
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_MAP_PROVIDER=leaflet
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here  # Optional, only for Google Maps
```

## Map Providers

### Leaflet (Default)
- **Free** - No API key required
- Uses OpenStreetMap tiles
- Open source
- Good performance

### Google Maps
- Requires API key
- More advanced features
- Better geocoding accuracy
- Set `NEXT_PUBLIC_MAP_PROVIDER=google` in environment

## Usage

### Basic Map View

```tsx
import MapView from '@/components/map/MapView';

function MyPage() {
  return (
    <div className="h-screen">
      <MapView onSpotClick={(spot) => console.log(spot)} />
    </div>
  );
}
```

### With View Toggle

```tsx
import { useState } from 'react';
import MapView from '@/components/map/MapView';
import SpotList from '@/components/map/SpotList';
import ViewToggle from '@/components/map/ViewToggle';

function MyPage() {
  const [view, setView] = useState<'map' | 'list'>('map');
  
  return (
    <>
      <ViewToggle currentView={view} onViewChange={setView} />
      {view === 'map' ? <MapView /> : <SpotList spots={spots} />}
    </>
  );
}
```

## Performance Optimization

1. **Marker Clustering** - Automatically clusters markers when zoomed out
2. **Debounced Search** - 500ms delay on search queries
3. **Spot Caching** - 30-second cache on spot data
4. **Dynamic Imports** - Map components loaded client-side only

## Mobile Responsiveness

- Responsive breakpoints for mobile, tablet, and desktop
- Touch-friendly controls
- Optimized marker popups for small screens
- Collapsible filters for mobile

## Integration with Smart Contracts

The map integration is prepared for smart contract integration:

1. **Spot Fetching** - Replace mock data in `useParkingSpots` hook
2. **Availability** - Update `useSpotAvailability` to query contracts
3. **Real-time Updates** - Connect to contract events for live updates

## Troubleshooting

### Map not loading
- Check if Leaflet CSS is imported in `globals.css`
- Verify map container has defined height
- Check browser console for errors

### Markers not showing
- Verify spots have coordinates
- Check marker icon paths
- Ensure spots are within map bounds

### Search not working
- Check geocoding service availability
- Verify API key (if using Google Maps)
- Check network requests in browser dev tools

### Performance issues
- Reduce number of markers shown
- Enable marker clustering
- Increase cache duration
- Use list view for many spots

## Future Enhancements

- [ ] Route directions to selected spot
- [ ] Street view integration
- [ ] Traffic information
- [ ] Parking availability predictions
- [ ] Favorite spots
- [ ] Share spot location

## License

Part of the CarIn parking platform.




