// ==================== ADDRESS GEOCODING FOR ADMIN FORM ====================
// Uses OpenStreetMap's Nominatim service (free, no API key required)

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

/**
 * Convert address string to coordinates via OpenStreetMap Nominatim
 */
async function geocodeAddress(address) {
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
      throw new Error(`Address not found: "${address}". Try including city and state (e.g., "123 Main St, Florence, AL")`);
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
 * Auto-fill coordinates from address in Create Restaurant form
 */
async function autoFillCreateCoordinates() {
  const address = document.getElementById('adminAddress').value;
  
  if (!address) {
    alert('Please enter an address first');
    return;
  }

  try {
    document.getElementById('geoButtonCreate').disabled = true;
    document.getElementById('geoButtonCreate').innerText = 'Finding address...';

    const coords = await geocodeAddress(address);

    document.getElementById('adminLat').value = coords.lat.toFixed(6);
    document.getElementById('adminLng').value = coords.lng.toFixed(6);

    console.log('[FORM] Coordinates auto-filled from address');
    alert(`✓ Address found!\nLatitude: ${coords.lat.toFixed(6)}\nLongitude: ${coords.lng.toFixed(6)}`);
  } catch (error) {
    alert('Error: ' + error.message);
    console.error('[FORM] Geocoding error:', error);
  } finally {
    document.getElementById('geoButtonCreate').disabled = false;
    document.getElementById('geoButtonCreate').innerText = '📍 Auto-fill Coordinates from Address';
  }
}

/**
 * Auto-fill coordinates from address in Edit Restaurant form
 */
async function autoFillEditCoordinates() {
  const address = document.getElementById('editAddress').value;
  
  if (!address) {
    alert('Please enter an address first');
    return;
  }

  try {
    document.getElementById('geoButtonEdit').disabled = true;
    document.getElementById('geoButtonEdit').innerText = 'Finding address...';

    const coords = await geocodeAddress(address);

    document.getElementById('editLat').value = coords.lat.toFixed(6);
    document.getElementById('editLng').value = coords.lng.toFixed(6);

    console.log('[FORM] Coordinates auto-filled from address');
    alert(`✓ Address found!\nLatitude: ${coords.lat.toFixed(6)}\nLongitude: ${coords.lng.toFixed(6)}`);
  } catch (error) {
    alert('Error: ' + error.message);
    console.error('[FORM] Geocoding error:', error);
  } finally {
    document.getElementById('geoButtonEdit').disabled = false;
    document.getElementById('geoButtonEdit').innerText = '📍 Auto-fill Coordinates from Address';
  }
}

// Expose globally for HTML onclick handlers
window.autoFillCreateCoordinates = autoFillCreateCoordinates;
window.autoFillEditCoordinates = autoFillEditCoordinates;
