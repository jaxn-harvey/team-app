import {
  restaurantsCollection,
} from '../models/collections.mjs';
import { geocodeAddress } from '../utils/geocoding.mjs';

/**
 * Get all restaurants with geocoded coordinates
 * If coordinates are missing (0,0), geocode from address
 */
export async function getRestaurantsWithGeocoding(req, res, next) {
  try {
    console.log('[API] GET /api/restaurants/geocoded');
    
    const restaurants = await restaurantsCollection().find({}).toArray();
    
    // Process restaurants with geocoding
    const restaurantsWithCoords = await Promise.all(
      restaurants.map(async (restaurant) => {
        let lat = parseFloat(restaurant.lat) || 0;
        let lng = parseFloat(restaurant.lng) || 0;
        
        // If coordinates are invalid and address exists, geocode it
        if ((lat === 0 && lng === 0) && restaurant.address) {
          try {
            const coords = await geocodeAddress(restaurant.address + ', Florence, AL');
            lat = coords.lat;
            lng = coords.lng;
            console.log(`[GEOCODING] Successfully geocoded ${restaurant.name}`);
          } catch (error) {
            console.warn(`[GEOCODING] Failed for ${restaurant.name}:`, error.message);
            // Use default Florence coordinates if geocoding fails
            lat = 34.7817;
            lng = -87.6760;
          }
        }
        
        return { ...restaurant, lat, lng };
      })
    );
    
    console.log(`[API] Retrieved ${restaurantsWithCoords.length} restaurants with coordinates`);
    res.json(restaurantsWithCoords);
  } catch (error) {
    console.error('[API] Error fetching restaurants with geocoding:', error.message);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
}

/**
 * Update restaurant coordinates from address
 * Called when admin saves a restaurant with a new/updated address
 */
export async function updateRestaurantCoordinatesFromAddress(restaurantId, address) {
  try {
    if (!address) return;
    
    console.log(`[GEOCODING] Updating coordinates for restaurant ${restaurantId} from address: ${address}`);
    
    const coords = await geocodeAddress(address + ', Florence, AL');
    
    await restaurantsCollection().updateOne(
      { _id: restaurantId },
      {
        $set: {
          lat: coords.lat,
          lng: coords.lng,
          geocodedAt: new Date()
        }
      }
    );
    
    console.log(`[GEOCODING] Updated restaurant ${restaurantId} with coordinates [${coords.lat}, ${coords.lng}]`);
    return coords;
  } catch (error) {
    console.warn(`[GEOCODING] Failed to geocode address for restaurant ${restaurantId}:`, error.message);
    throw error;
  }
}
