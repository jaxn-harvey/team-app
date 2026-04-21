// Helper function to get map coordinates for Florence restaurants
export const RESTAURANT_COORDINATES = {
  // Main downtown Florence area
  'default': { lat: 34.7817, lng: -87.6760 }, // Downtown Florence
  'swampers': { lat: 34.7825, lng: -87.6741 },
  'flobama': { lat: 34.7823, lng: -87.6752 },
  'lava-room': { lat: 34.7820, lng: -87.6758 },
  'rising-crust': { lat: 34.7815, lng: -87.6765 },
  'champion': { lat: 34.7812, lng: -87.6770 },
  'rattlesnake': { lat: 34.7810, lng: -87.6775 },
  'renaissance': { lat: 34.7818, lng: -87.6748 }
};

export const FLORENCE_CENTER = [34.7817, -87.6760];

export function getDefaultCoordinates(restaurantName) {
  if (!restaurantName) return RESTAURANT_COORDINATES.default;
  
  const normalized = restaurantName.toLowerCase();
  
  for (const [key, coords] of Object.entries(RESTAURANT_COORDINATES)) {
    if (key !== 'default' && normalized.includes(key.replace('-', ' '))) {
      return coords;
    }
  }
  
  return RESTAURANT_COORDINATES.default;
}

export function fixInvalidCoordinates(coords) {
  // If coordinates are 0,0 or missing, return default Florence location
  if (!coords || (coords.lat === 0 && coords.lng === 0)) {
    return RESTAURANT_COORDINATES.default;
  }
  return coords;
}
