import {
  fetchAllRestaurants,
  fetchRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../services/restaurantService.mjs';
import { buildRestaurantPayload, validateRestaurantPayload } from '../utils/validators.mjs';

export async function getRestaurants(req, res, next) {
  try {
    console.log('[API] GET /api/restaurants');
    const restaurants = await fetchAllRestaurants();
    console.log('[API] Retrieved', restaurants.length, 'restaurants');
    res.json(restaurants);
  } catch (error) {
    console.error('[API] Error fetching restaurants:', error.message);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
}

export async function getRestaurantById(req, res, next) {
  try {
    const { id } = req.params;
    console.log('[API] GET /api/restaurants/' + id);
    const restaurant = await fetchRestaurantById(id);
    res.json(restaurant);
  } catch (error) {
    console.error('[API] Error fetching restaurant:', error.message);
    const status = error.message.includes('Invalid') ? 400 : 404;
    res.status(status).json({ error: error.message });
  }
}

export async function createRestaurantHandler(req, res, next) {
  try {
    console.log('[API] POST /api/admin/restaurants');
    
    const payload = buildRestaurantPayload(req.body);
    const validationError = validateRestaurantPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const id = await createRestaurant(payload);
    console.log('[API] Restaurant created:', id);
    res.status(201).json({ message: 'Restaurant created successfully', id });
  } catch (error) {
    console.error('[API] Error creating restaurant:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateRestaurantHandler(req, res, next) {
  try {
    const { id } = req.params;
    console.log('[API] PUT /api/admin/restaurants/' + id);
    
    const payload = buildRestaurantPayload(req.body);
    const validationError = validateRestaurantPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    await updateRestaurant(id, payload);
    console.log('[API] Restaurant updated:', id);
    res.json({ message: 'Restaurant updated successfully' });
  } catch (error) {
    console.error('[API] Error updating restaurant:', error.message);
    const status = error.message.includes('Invalid') ? 400 : 404;
    res.status(status).json({ error: error.message });
  }
}

export async function deleteRestaurantHandler(req, res, next) {
  try {
    const { id } = req.params;
    console.log('[API] DELETE /api/admin/restaurants/' + id);
    await deleteRestaurant(id);
    console.log('[API] Restaurant deleted:', id);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('[API] Error deleting restaurant:', error.message);
    const status = error.message.includes('Invalid') ? 400 : 404;
    res.status(status).json({ error: error.message });
  }
}
