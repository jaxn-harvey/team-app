// ==================== RESTAURANT DATA ====================
const restaurants = [
  {
    id: 1,
    name: "Osteria Antica Giovanni",
    cuisine: "Italian",
    description: "Traditional Tuscan cuisine in an intimate setting with rustic charm. Family recipes passed down for generations.",
    image: "https://images.unsplash.com/photo-1517521572454-1abb7a56a212?w=400&h=300&fit=crop",
    address: "Via del Proconsolo 70, Florence",
    phone: "+39 55 288 1897",
    hours: "12:00 PM - 11:00 PM",
    rating: 4.8,
    reviews: 248
  },
  {
    id: 2,
    name: "Trattoria Zigolini",
    cuisine: "Tuscan",
    description: "Authentic Tuscan specialties featuring wild boar, fresh pasta, and locally sourced ingredients.",
    image: "https://images.unsplash.com/photo-1504674900967-da76157f002f?w=400&h=300&fit=crop",
    address: "Via del Pesce 7, Florence",
    phone: "+39 55 287 6119",
    hours: "12:00 PM - 10:30 PM",
    rating: 4.7,
    reviews: 186
  },
  {
    id: 3,
    name: "Il Cibleo",
    cuisine: "Mediterranean",
    description: "Fine dining restaurant offering Mediterranean cuisine with creative presentations and exceptional service.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    address: "Via dei Servi 11, Florence",
    phone: "+39 55 211 685",
    hours: "12:30 PM - 11:00 PM",
    rating: 4.9,
    reviews: 312
  },
  {
    id: 4,
    name: "Armando al Pantheon",
    cuisine: "Italian",
    description: "Historic family-run restaurant famous for handmade pasta and traditional Roman-Tuscan dishes.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561fcb?w=400&h=300&fit=crop",
    address: "Piazza Santo Spirito 45, Florence",
    phone: "+39 55 211 277",
    hours: "12:00 PM - 11:30 PM",
    rating: 4.6,
    reviews: 425
  },
  {
    id: 5,
    name: "Enoteca Beccaria",
    cuisine: "Modern",
    description: "Contemporary Italian cuisine paired with an extensive wine selection from Tuscany and beyond.",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop",
    address: "Via Ghibellina 88, Florence",
    phone: "+39 55 224 953",
    hours: "1:00 PM - 11:00 PM",
    rating: 4.7,
    reviews: 197
  },
  {
    id: 6,
    name: "Ristorante Toscanaccio",
    cuisine: "Tuscan",
    description: "Cozy restaurant specializing in classic Tuscan recipes with T-bone steaks and ribollita.",
    image: "https://images.unsplash.com/photo-1502641192624-92c51f59c46d?w=400&h=300&fit=crop",
    address: "Via de Medici 12, Florence",
    phone: "+39 55 282 391",
    hours: "12:00 PM - 10:30 PM",
    rating: 4.5,
    reviews: 156
  }
];

// ==================== MAP INITIALIZATION ====================
function initializeMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // Florence coordinates
  const florenceCenter = [43.7732, 11.2558];

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
    
    const marker = L.marker(coordinates).addTo(map);
    
    const popupContent = `
      <div class="map-popup">
        <h4>${restaurant.name}</h4>
        <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
        <p><strong>Rating:</strong> ⭐ ${restaurant.rating}</p>
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

  const featured = restaurants.slice(0, 3);

  grid.innerHTML = featured.map(restaurant => `
    <div class="restaurant-card" onclick="goToRestaurantDetail(${restaurant.id})">
      <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
      <div class="restaurant-info">
        <h3>${restaurant.name}</h3>
        <div class="restaurant-cuisine">${restaurant.cuisine}</div>
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
          <h3>${restaurant.name}</h3>
          <span class="restaurant-cuisine-tag">${restaurant.cuisine}</span>
        </div>
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
        </div>
        <p class="restaurant-description">${restaurant.description}</p>
        <div class="restaurant-rating">⭐ ${restaurant.rating} (${restaurant.reviews} reviews)</div>
        <button class="btn-learn-more" onclick="alert('Contact information for ${restaurant.name}:\\n${restaurant.phone}')">
          Reserve a Table
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
