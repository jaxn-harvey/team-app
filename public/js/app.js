// ==================== RESTAURANT DATA ====================
const restaurants = [
  {
    id: 1,
    name: "Swampers",
    cuisine: "American",
    description: "Where the legendary Swampers session musicians gathered. Premier dining at Renaissance Shoals Hotel with premium cuisine and performances. The heart of Muscle Shoals music tradition.",
    image: "https://images.unsplash.com/photo-1517457373614-b7152f800bb1?w=400&h=300&fit=crop",
    address: "One Riverfront Plaza, Florence, AL 35630",
    phone: "(256) 246-7000",
    hours: "5:00 PM - 11:00 PM",
    rating: 4.9,
    reviews: 324,
    liveMusic: true,
    musicSchedule: "Nightly performances",
    featured: true,
    heritage: "Home to the legendary Swampers session musicians"
  },
  {
    id: 2,
    name: "FloBama",
    cuisine: "Casual American",
    description: "Vibrant music venue where local and touring artists keep the Muscle Shoals tradition alive. Great food, cold drinks, and non-stop musical energy. A modern gathering place for music lovers.",
    image: "https://images.unsplash.com/photo-1504674900967-da76157f002f?w=400&h=300&fit=crop",
    address: "9 Court Street, Florence, AL 35630",
    phone: "(256) 766-2635",
    hours: "11:00 AM - Late Night",
    rating: 4.7,
    reviews: 418,
    liveMusic: true,
    musicSchedule: "Thursday-Sunday",
    heritage: "Contemporary hub for Muscle Shoals live music"
  },
  {
    id: 3,
    name: "Lava Room",
    cuisine: "Tapas & Small Plates",
    description: "Contemporary lounge featuring upscale small plates and craft cocktails overlooking the Tennessee River. Intimate atmosphere with live acoustic performances celebrating Muscle Shoals' artistic spirit.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    address: "116 Court Street, Florence, AL 35630",
    phone: "(256) 248-5282",
    hours: "4:00 PM - 11:00 PM",
    rating: 4.6,
    reviews: 207,
    liveMusic: true,
    musicSchedule: "Weekend nights",
    heritage: "Artistic venue with Tennessee River views"
  },
  {
    id: 4,
    name: "Rising Crust",
    cuisine: "Pizza & Italian",
    description: "Artisan pizzeria with wood-fired oven and authentic Italian recipes. Casual and welcoming atmosphere where musicians and music fans connect over great food and live performances.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561fcb?w=400&h=300&fit=crop",
    address: "200 Court Street, Florence, AL 35630",
    phone: "(256) 765-5432",
    hours: "11:00 AM - 10:00 PM",
    rating: 4.5,
    reviews: 301,
    liveMusic: true,
    musicSchedule: "Friday & Saturday",
    heritage: "Community-focused music venue"
  },
  {
    id: 5,
    name: "Champy's Soul Food",
    cuisine: "Soul Food",
    description: "Authentic Southern soul food restaurant celebrating the culinary roots of Muscle Shoals. Traditional comfort classics prepared with passion and warm hospitality. Occasional live music honoring local artists.",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop",
    address: "602 Court Street, Florence, AL 35630",
    phone: "(256) 764-2898",
    hours: "10:30 AM - 9:00 PM",
    rating: 4.4,
    reviews: 189,
    liveMusic: false,
    musicSchedule: "Live Music Events Monthly",
    heritage: "Soul food roots tied to Muscle Shoals culture"
  },
  {
    id: 6,
    name: "Rattlesnake Saloon",
    cuisine: "Barbecue & Casual",
    description: "Historic live music venue in a rustic building with authentic charm. BBQ and casual fare alongside some of the best live performances in the Muscle Shoals region. A true temple of local music.",
    image: "https://images.unsplash.com/photo-1502641192624-92c51f59c46d?w=400&h=300&fit=crop",
    address: "1012 Woods Cove Road, Florence, AL 35634",
    phone: "(256) 759-9800",
    hours: "11:00 AM - Midnight",
    rating: 4.7,
    reviews: 412,
    liveMusic: true,
    musicSchedule: "Thursday-Sunday",
    heritage: "Legendary live music venue"
  },
  {
    id: 7,
    name: "Renaissance Shoals Restaurant",
    cuisine: "American Fine Dining",
    description: "Elegant fine dining at Renaissance Shoals Hotel with views of the Tennessee River. Premium cuisine and upscale entertainment reflecting Muscle Shoals' cultural sophistication.",
    image: "https://images.unsplash.com/photo-1479623433602-84df5ce71d06?w=400&h=300&fit=crop",
    address: "One Riverfront Plaza, Florence, AL 35630",
    phone: "(256) 246-7000",
    hours: "6:00 PM - 10:00 PM",
    rating: 4.8,
    reviews: 267,
    liveMusic: true,
    musicSchedule: "Select evening events",
    heritage: "Prestige dining on the Tennessee River"
  }
];

// ==================== MAP INITIALIZATION ====================
function initializeMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // Florence, Alabama coordinates
  const florenceCenter = [34.1899, -87.6759];

  // Initialize map
  const map = L.map('map').setView(florenceCenter, 13);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Add restaurant markers
  restaurants.forEach((restaurant) => {
    const coordinates = getRandomCoordinates(florenceCenter);
    
    const musicIcon = restaurant.liveMusic ? '🎸' : '🍴';
    
    const marker = L.marker(coordinates).addTo(map);
    
    const popupContent = `
      <div class="map-popup">
        <h4>${musicIcon} ${restaurant.name}</h4>
        <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
        <p><strong>Rating:</strong> ⭐ ${restaurant.rating}</p>
        ${restaurant.liveMusic ? `<p><strong style="color: #ff006e;">🎵 Live Music</strong></p>` : ''}
        <a href="#" onclick="scrollToRestaurant(${restaurant.id}); return false;" class="popup-link">View Details</a>
      </div>
    `;
    
    marker.bindPopup(popupContent);
  });
}

// ==================== RESTAURANT CARDS (HOME PAGE) ====================
function displayFeaturedRestaurants() {
  const grid = document.getElementById('restaurantsGrid');
  if (!grid) return;

  // Get Swampers first, then other featured/top rated restaurants
  const swampers = restaurants.find(r => r.id === 1);
  const others = restaurants.filter(r => r.id !== 1).slice(0, 2);
  const featured = [swampers, ...others];

  grid.innerHTML = featured.map(restaurant => `
    <div class="restaurant-card" onclick="goToRestaurantDetail(${restaurant.id})">
      <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
      <div class="restaurant-info">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3>${restaurant.name}</h3>
          ${restaurant.featured ? '<span style="font-size: 18px;">⭐</span>' : ''}
        </div>
        <div class="restaurant-cuisine">${restaurant.cuisine}</div>
        ${restaurant.liveMusic ? '<div style="color: var(--highlight-color); font-weight: 600; font-size: 13px; margin-bottom: 8px;">🎸 Live Music Venue</div>' : ''}
        <p class="restaurant-description">${restaurant.description.substring(0, 80)}...</p>
        <div class="restaurant-rating">⭐ ${restaurant.rating} (${restaurant.reviews} reviews)</div>
      </div>
    </div>
  `).join('');
}

// ==================== RESTAURANT LIST (DETAIL PAGE) ====================
function displayRestaurantsList() {
  const listContainer = document.getElementById('restaurantsList');
  if (!listContainer) return;

  listContainer.innerHTML = restaurants.map(restaurant => `
    <div class="restaurant-item" data-cuisine="${restaurant.cuisine}" data-name="${restaurant.name.toLowerCase()}">
      <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-item-image">
      <div class="restaurant-item-content">
        <div class="restaurant-item-header">
          <h3>${restaurant.name}${restaurant.featured ? ' ⭐ Featured' : ''}</h3>
          <span class="restaurant-cuisine-tag">${restaurant.cuisine}</span>
          ${restaurant.liveMusic ? '<span class="live-music-badge">🎸 Live Music</span>' : ''}
        </div>
        ${restaurant.heritage ? `<div class="heritage-label">🎵 ${restaurant.heritage}</div>` : ''}
        <div class="restaurant-details">
          <div class="detail-row">
            <span class="detail-label">📍 Address:</span>
            <span>${restaurant.address}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📞 Phone:</span>
            <span>${restaurant.phone}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">⏰ Hours:</span>
            <span>${restaurant.hours}</span>
          </div>
          ${restaurant.liveMusic ? `<div class="detail-row">
            <span class="detail-label">🎵 Music:</span>
            <span>${restaurant.musicSchedule}</span>
          </div>` : ''}
        </div>
        <p class="restaurant-description">${restaurant.description}</p>
        <div class="restaurant-rating">⭐ ${restaurant.rating} (${restaurant.reviews} reviews)</div>
        <button class="btn-learn-more" onclick="alert('Contact ${restaurant.name}:\\n${restaurant.phone}\\n\\nHours: ${restaurant.hours}')">
          Get Contact Info
        </button>
      </div>
    </div>
  `).join('');
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

  if (!searchInput || !cuisineFilter) return;

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const cuisineValue = cuisineFilter.value;

    document.querySelectorAll('.restaurant-item').forEach(item => {
      const name = item.dataset.name;
      const cuisine = item.dataset.cuisine;

      const matchesSearch = name.includes(searchTerm);
      const matchesCuisine = !cuisineValue || cuisine === cuisineValue;

      item.style.display = (matchesSearch && matchesCuisine) ? 'flex' : 'none';
    });
  }

  searchInput.addEventListener('input', applyFilters);
  cuisineFilter.addEventListener('change', applyFilters);
}

// ==================== HELPER FUNCTIONS ====================
function getRandomCoordinates(center) {
  // Generate random coordinates within ~15km of Florence center
  const offset = 0.15;
  const lat = center[0] + (Math.random() - 0.5) * offset;
  const lng = center[1] + (Math.random() - 0.5) * offset;
  return [lat, lng];
}

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

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  setupHamburgerMenu();
  
  // Initialize based on page
  const path = window.location.pathname;
  
  if (path.includes('index.html') || path.endsWith('/')) {
    initializeMap();
    displayFeaturedRestaurants();
  } else if (path.includes('restaurants.html')) {
    displayRestaurantsList();
    setupFilters();
  }
});
