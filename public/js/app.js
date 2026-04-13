// ==================== RESTAURANT DATA ====================
const restaurants = [
  {
    id: 1,
    name: "Swampers",
    cuisine: "American",
    description: "Premier dining at Renaissance Shoals Hotel featuring upscale American cuisine and live entertainment. An elegant experience with world-class performances overlooking the Tennessee River.",
    image: "https://images.unsplash.com/photo-1517457373614-b7152f800bb1?w=400&h=300&fit=crop",
    address: "10 Hightower Pl, Florence, AL 35630",
    phone: "(256) 246-7000",
    hours: "5:00 PM - 11:00 PM",
    rating: 4.9,
    reviews: 324,
    liveMusic: true,
    musicSchedule: "Nightly performances",
    featured: true,
    heritage: "Premier waterfront dining venue",
    lat: 34.8086927,
    lng: -87.6307255
  },
  {
    id: 2,
    name: "FloBama",
    cuisine: "Casual American",
    description: "Vibrant bar and restaurant with a stellar reputation for live music and entertainment. Great food, cold drinks, and non-stop musical energy. A modern gathering place for music lovers.",
    image: "https://images.unsplash.com/photo-1504674900967-da76157f002f?w=400&h=300&fit=crop",
    address: "311 N Court St, Florence, AL 35630",
    phone: "(256) 766-2635",
    hours: "11:00 AM - Late Night",
    rating: 4.7,
    reviews: 418,
    liveMusic: true,
    musicSchedule: "Thursday-Sunday",
    heritage: "Popular live music destination",
    lat: 34.8022223,
    lng: -87.6777217
  },
  {
    id: 3,
    name: "Lava Room",
    cuisine: "Tapas & Small Plates",
    description: "Contemporary lounge featuring upscale small plates and craft cocktails. Intimate atmosphere with live acoustic performances in a sophisticated setting.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    address: "313 N Court St, Florence, AL 35630",
    phone: "(256) 248-5282",
    hours: "4:00 PM - 11:00 PM",
    rating: 4.6,
    reviews: 207,
    liveMusic: true,
    musicSchedule: "Weekend nights",
    heritage: "Upscale lounge with live entertainment",
    lat: 34.8009232,
    lng: -87.6773822
  },
  {
    id: 4,
    name: "Rising Crust",
    cuisine: "Pizza & Italian",
    description: "Artisan pizzeria with wood-fired oven and authentic Italian recipes. Casual and welcoming atmosphere where musicians and music fans connect over great food and live performances.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561fcb?w=400&h=300&fit=crop",
    address: "4136 Florence Blvd, Florence, AL 35634",
    phone: "(256) 765-5432",
    hours: "11:00 AM - 10:00 PM",
    rating: 4.5,
    reviews: 301,
    liveMusic: true,
    musicSchedule: "Friday & Saturday",
    heritage: "Community pizzeria with live music",
    lat: 34.8448447,
    lng: -87.5822045
  },
  {
    id: 5,
    name: "Champy's Chicken",
    cuisine: "Soul Food",
    description: "Authentic Southern soul food restaurant featuring traditional comfort classics prepared with passion and warm hospitality. Occasional live music and community-focused gatherings.",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop",
    address: "120 E 2nd St, Muscle Shoals, AL 35661",
    phone: "(256) 764-2898",
    hours: "10:30 AM - 9:00 PM",
    rating: 4.4,
    reviews: 189,
    liveMusic: false,
    musicSchedule: "Live Music Events Monthly",
    heritage: "Traditional soul food establishment",
    lat: 34.7592979,
    lng: -87.6766439
  },
  {
    id: 6,
    name: "Rattlesnake Saloon",
    cuisine: "Barbecue & Casual",
    description: "Historic live music venue in a rustic building with authentic charm. BBQ and casual fare alongside some of the best live performances in the area. A true temple of local entertainment.",
    image: "https://images.unsplash.com/photo-1502641192624-92c51f59c46d?w=400&h=300&fit=crop",
    address: "1292 Mount Mills Rd, Tuscumbia, AL 35674",
    phone: "(256) 759-9800",
    hours: "11:00 AM - Midnight",
    rating: 4.7,
    reviews: 412,
    liveMusic: true,
    musicSchedule: "Thursday-Sunday",
    heritage: "Iconic live venue",
    lat: 34.6486699,
    lng: -87.9067437
  },
  {
    id: 7,
    name: "Renaissance Shoals Restaurant",
    cuisine: "American Fine Dining",
    description: "Elegant fine dining at Renaissance Shoals Hotel with views of the Tennessee River. Premium cuisine and upscale entertainment in a sophisticated setting.",
    image: "https://images.unsplash.com/photo-1479623433602-84df5ce71d06?w=400&h=300&fit=crop",
    address: "10 Hightower Pl, Florence, AL 35630",
    phone: "(256) 246-7000",
    hours: "6:00 PM - 10:00 PM",
    rating: 4.8,
    reviews: 267,
    liveMusic: true,
    musicSchedule: "Select evening events",
    heritage: "Fine dining on the Tennessee River",
    lat: 34.8086927,
    lng: -87.6307255
  }
];

// ==================== MAP INITIALIZATION ====================
function initializeMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

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
    
    const musicIcon = restaurant.liveMusic ? '🎸' : '🍴';
    
    const marker = L.marker(coordinates).addTo(map);
    
    const popupContent = `
      <div class="map-popup">
        <h4>${musicIcon} ${restaurant.name}</h4>
        <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
        <p><strong>Rating:</strong> ⭐ ${restaurant.rating}</p>
        ${restaurant.liveMusic ? `<p><strong style="color: #ff006e;">🎵 Live Music</strong></p>` : ''}
        <a href="restaurants.html#restaurant-${restaurant.id}" class="popup-link">View Details</a>
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
    <div id="restaurant-${restaurant.id}" class="restaurant-item" data-cuisine="${restaurant.cuisine}" data-name="${restaurant.name.toLowerCase()}" data-id="${restaurant.id}">
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
