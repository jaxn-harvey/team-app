// ==================== ADDRESS GEOCODING ====================
// Uses OpenStreetMap's Nominatim service (free, no API key required)

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

/**
 * Convert address to latitude/longitude coordinates
 * @param {string} address - Full address (e.g., "123 Main St, Florence, AL")
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export async function geocodeAddress(address) {
  if (!address || address.trim().length === 0) {
    throw new Error('Please enter an address');
  }

  try {
    console.log('[GEOCODING] Converting address to coordinates:', address);

    const response = await fetch(
      `${NOMINATIM_API}?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Florence-AL-Dining-Guide'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding service returned ${response.status}`);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      throw new Error(`Address not found: "${address}". Try adding city and state.`);
    }

    const result = results[0];
    const coords = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    console.log('[GEOCODING] Success:', coords);
    return coords;
  } catch (error) {
    console.error('[GEOCODING] Error:', error.message);
    throw error;
  }
}

/**
 * Reverse geocode: convert coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string | null>}
 */
export async function reverseGeocodeCoordinates(lat, lng) {
  try {
    console.log('[REVERSE GEOCODING] Converting coordinates to address:', lat, lng);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'Florence-AL-Dining-Guide'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding service returned ${response.status}`);
    }

    const result = await response.json();
    const address = result.address?.road || result.display_name || null;

    console.log('[REVERSE GEOCODING] Success:', address);
    return address;
  } catch (error) {
    console.error('[REVERSE GEOCODING] Error:', error.message);
    return null;
  }
}

/**
 * Get coordinates hint for user
 */
export function getGeocodingHint() {
  return 'Enter address like: "123 Main St, Florence, AL" or "Swampers, Downtown, Florence"';
}
