export function parseBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
}

export function buildRestaurantPayload(body) {
  return {
    name: body.name?.trim() || '',
    cuisine: body.cuisine?.trim() || '',
    description: body.description?.trim() || '',
    image: body.image?.trim() || '',
    address: body.address?.trim() || '',
    phone: body.phone?.trim() || '',
    hours: body.hours?.trim() || '',
    rating: Number(body.rating) || 0,
    reviews: Number(body.reviews) || 0,
    liveMusic: parseBoolean(body.liveMusic),
    musicSchedule: body.musicSchedule?.trim() || '',
    featured: parseBoolean(body.featured),
    heritage: body.heritage?.trim() || '',
    lat: Number(body.lat) || 0,
    lng: Number(body.lng) || 0,
  };
}

export function validateRestaurantPayload(restaurant) {
  if (!restaurant.name || !restaurant.cuisine || !restaurant.description || !restaurant.address) {
    return 'Name, cuisine, description, and address are required.';
  }
  return null;
}
