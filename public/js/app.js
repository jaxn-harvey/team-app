// ==================== RESTAURANT DATA FROM API ====================
async function fetchRestaurants() {
  try {
    console.log('[FETCH] Fetching restaurants from API...');
    const res = await fetch('/api/restaurants');
    if (res.ok) {
      const data = await res.json();
      console.log(`[FETCH] Successfully fetched ${data.length} restaurants from API`);
      if (data && data.length > 0) {
        return data;
      } else {
        console.warn('[FETCH] API returned empty array');
      }
    } else {
      console.error(`[FETCH] API returned status ${res.status}`);
    }
  } catch (error) {
    console.error('[FETCH ERROR]:', error);
  }
  console.warn('[FETCH] Returning empty array');
  return [];
}

// ==================== MAP INITIALIZATION ====================
async function initializeMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // Fetch restaurants from database
  const restaurants = await fetchRestaurants();
  if (!restaurants || restaurants.length === 0) {
    console.warn('No restaurants available for map');
    return;
  }

  // Center of Shoals region (covers Florence, Muscle Shoals, Tuscumbia)
  const shoalsCenter = [34.7800, -87.7200];

  // Initialize map
  const map = L.map('map').setView(shoalsCenter, 12);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Add restaurant markers with actual coordinates
  restaurants.forEach((restaurant) => {
    const coordinates = [restaurant.lat, restaurant.lng];
    
    const musicIcon = restaurant.liveMusic ? 'Live' : 'Dining';
    
    const marker = L.marker(coordinates).addTo(map);
    
    const restaurantId = restaurant._id || restaurant.id;
    const popupContent = `
      <div class="map-popup">
        <h4>${musicIcon} ${restaurant.name}</h4>
        <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
        <p><strong>Rating:</strong> ${restaurant.rating}</p>
        ${restaurant.liveMusic ? `<p><strong style="color: #0984e3;">Live Music</strong></p>` : ''}
        <a href="restaurants.html#restaurant-${restaurantId}" class="popup-link">View Details</a>
      </div>
    `;
    
    marker.bindPopup(popupContent);
  });
}

// ==================== RESTAURANT CARDS (HOME PAGE) ====================
async function displayFeaturedRestaurants() {
  const grid = document.getElementById('restaurantsGrid');
  if (!grid) return;

  // Fetch restaurants from database
  const restaurants = await fetchRestaurants();
  if (!restaurants || restaurants.length === 0) {
    console.warn('No restaurants available');
    return;
  }

  // Get featured and top rated restaurants
  const featured = restaurants
    .filter(r => r.featured)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  if (featured.length === 0 && restaurants.length > 0) {
    // If no featured restaurants, show top 3 rated
    featured.push(...restaurants.sort((a, b) => b.rating - a.rating).slice(0, 3));
  }

  grid.innerHTML = featured.map(restaurant => {
    const restaurantId = restaurant._id || restaurant.id;
    return `
    <div class="restaurant-card" onclick="goToRestaurantDetail('${restaurantId}')">
      <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
      <div class="restaurant-info">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3>${restaurant.name}</h3>
          ${restaurant.featured ? '<span style="font-size: 18px; margin-left: 8px;">' + i18next.t('restaurants.featured') + '</span>' : ''}
        </div>
        <div class="restaurant-cuisine">${restaurant.cuisine}</div>
        ${restaurant.liveMusic ? '<div style="color: var(--highlight-color); font-weight: 600; font-size: 13px; margin-bottom: 8px;">' + i18next.t('restaurants.liveMusic') + ' Venue</div>' : ''}
        <p class="restaurant-description">${restaurant.description.substring(0, 80)}...</p>
        <div class="restaurant-rating">${restaurant.rating} (${restaurant.reviews} reviews)</div>
      </div>
    </div>
    `;
  }).join('');
}

// ==================== RESTAURANT LIST (DETAIL PAGE) ====================
async function displayRestaurantsList() {
  const listContainer = document.getElementById('restaurantsList');
  if (!listContainer) return;

  const token = localStorage.getItem('token');
  
  // Fetch restaurants from database only
  const restaurantsToDisplay = await fetchRestaurants();
  
  if (!restaurantsToDisplay || restaurantsToDisplay.length === 0) {
    listContainer.innerHTML = '<p>No restaurants available at this time.</p>';
    return;
  }

  listContainer.innerHTML = restaurantsToDisplay.map(restaurant => {
    // Handle both local ID format (id) and MongoDB format (_id)
    const restaurantId = restaurant._id || restaurant.id;
    return `
    <div id="restaurant-${restaurantId}" class="restaurant-item" data-cuisine="${restaurant.cuisine}" data-name="${restaurant.name.toLowerCase()}" data-id="${restaurantId}" data-livemusic="${restaurant.liveMusic ? 'true' : 'false'}">
      <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-item-image">
      <div class="restaurant-item-content">
        <div class="restaurant-item-header">
          <h3>${restaurant.name}${restaurant.featured ? ' - Featured' : ''}</h3>
          <span class="restaurant-cuisine-tag">${restaurant.cuisine}</span>
          ${restaurant.liveMusic ? '<span class="live-music-badge">Live Music</span>' : ''}
        </div>
        <div class="restaurant-details">
          <div class="detail-row">
            <span class="detail-label">Address:</span>
            <span>${restaurant.address}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span>${restaurant.phone}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Hours:</span>
            <span>${restaurant.hours}</span>
          </div>
          ${restaurant.liveMusic ? '<div class="detail-row"><span class="detail-label">Music Schedule:</span><span>' + restaurant.musicSchedule + '</span></div>' : ''}
        </div>
        <p class="restaurant-description">${restaurant.description}</p>
        <div class="restaurant-rating">${restaurant.rating} (${restaurant.reviews} reviews)</div>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn-learn-more" onclick="alert('Contact ${restaurant.name}:\\n${restaurant.phone}\\n\\nHours: ${restaurant.hours}')">
            Contact
          </button>
          ${token ? '<button class="btn-delete" onclick="deleteRestaurantCard(\'' + restaurantId + '\')" style="background: #d32f2f; color: white; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer;">Delete</button>' : ''}
        </div>
      </div>
    </div>
    `;
  }).join('');

  // Scroll to restaurant if anchor is present in URL
  setTimeout(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, 300);
}

// ==================== HAMBURGER MENU ====================
function setupHamburgerMenu() {
  const hamburger = document.getElementById('hamburgerMenu');
  const navMenu = document.getElementById('navMenu');

  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when a link is clicked
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// ==================== SEARCH & FILTER ====================
function setupFilters() {
  const searchInput = document.getElementById('searchInput');
  const cuisineFilter = document.getElementById('cuisineFilter');
  const liveMusicFilter = document.getElementById('liveMusicFilter');

  if (!searchInput || !cuisineFilter) return;

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const cuisineValue = cuisineFilter.value;
    const liveMusicOnly = liveMusicFilter ? liveMusicFilter.checked : false;

    document.querySelectorAll('.restaurant-item').forEach(item => {
      const name = item.dataset.name;
      const cuisine = item.dataset.cuisine;
      const liveMusic = item.dataset.livemusic;

      // Search by name, cuisine, or live music
      const matchesSearch = 
        name.includes(searchTerm) || 
        cuisine.toLowerCase().includes(searchTerm) || 
        (searchTerm.includes('live') && liveMusic === 'true') ||
        (searchTerm.includes('music') && liveMusic === 'true');
      
      const matchesCuisine = !cuisineValue || cuisine === cuisineValue;
      const matchesLiveMusic = !liveMusicOnly || liveMusic === 'true';

      item.style.display = (matchesSearch && matchesCuisine && matchesLiveMusic) ? 'flex' : 'none';
    });
  }

  searchInput.addEventListener('input', applyFilters);
  cuisineFilter.addEventListener('change', applyFilters);
  if (liveMusicFilter) {
    liveMusicFilter.addEventListener('change', applyFilters);
  }
}

// ==================== HELPER FUNCTIONS ====================
function goToRestaurantDetail(restaurantId) {
  window.location.href = `restaurants.html#restaurant-${restaurantId}`;
}

function scrollToRestaurant(restaurantId) {
  setTimeout(() => {
    const element = document.querySelector(`[data-id="${restaurantId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 300);
}

// Delete restaurant from public view (for admins)
async function deleteRestaurantCard(restaurantId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in as an admin to delete restaurants');
    return;
  }

  if (!confirm('Are you sure you want to delete this restaurant?')) {
    return;
  }

  try {
    // If it looks like a MongoDB ID (contains alphanumeric and hyphens), use it directly
    // Otherwise, it's a local ID and we need to handle it differently
    const url = `/api/admin/restaurants/${restaurantId}`;
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert('Restaurant deleted successfully!');
      location.reload();
    } else {
      const error = await res.json();
      alert('Error: ' + (error.error || 'Failed to delete restaurant'));
    }
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    alert('Failed to delete restaurant');
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  setupHamburgerMenu();
  
  // Initialize based on page
  const path = window.location.pathname;
  
  if (path.includes('index.html') || path.endsWith('/')) {
    console.log('[INIT] Home page - initializing map and featured restaurants');
    await initializeMap();
    await displayFeaturedRestaurants();
  } else if (path.includes('restaurants.html')) {
    console.log('[INIT] Restaurants page - loading restaurant list');
    await displayRestaurantsList();
    setupFilters();
  }
});
