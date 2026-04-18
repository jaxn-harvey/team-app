// ==================== ADMIN RESTAURANTS PAGE ====================
// This module handles admin functionality on the restaurants page
// Admins can add and manage restaurants without leaving the restaurants page

// ==================== INITIALIZE ADMIN SECTION ====================
async function initializeAdminSection() {
  // Get token fresh each time
  const token = localStorage.getItem('token');
  const adminSection = document.getElementById('adminSection');
  const userGreeting = document.getElementById('userGreeting');
  const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');

  // If no token, don't show admin section
  if (!token) {
    return;
  }

  try {
    // Verify token is valid and check user role
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      // Invalid token
      localStorage.removeItem('token');
      return;
    }

    const user = await res.json();

    // Only show admin section if user is an admin
    if (user.role === 'admin') {
      // Show user greeting and logout button in header on all pages
      if (userGreeting) {
        userGreeting.style.display = 'block';
        userGreeting.textContent = `Hello, ${user.username}`;
      }
      if (logoutHeaderBtn) {
        logoutHeaderBtn.style.display = 'block';
        const logoutBtn = logoutHeaderBtn.querySelector('button');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', handleLogout);
        }
      }

      // Show admin section only on restaurants page
      if (adminSection) {
        adminSection.style.display = 'block';
        setupAdminEventListeners();
      }
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
}

// ==================== ADMIN EVENT LISTENERS ====================
function setupAdminEventListeners() {
  const adminCreateForm = document.getElementById('adminCreateForm');
  if (adminCreateForm) {
    adminCreateForm.addEventListener('submit', handleCreateRestaurant);
  }

  // Show/hide music schedule field based on Live Music checkbox
  const liveMusicCheckbox = document.getElementById('adminLiveMusic');
  const musicScheduleField = document.getElementById('musicScheduleField');
  
  if (liveMusicCheckbox && musicScheduleField) {
    liveMusicCheckbox.addEventListener('change', () => {
      musicScheduleField.style.display = liveMusicCheckbox.checked ? 'block' : 'none';
    });
  }
}
async function handleCreateRestaurant(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');

  // Format opening and closing times
  const openingTime = document.getElementById('adminOpeningTime').value;
  const closingTime = document.getElementById('adminClosingTime').value;
  const hours = openingTime && closingTime ? `${openingTime} - ${closingTime}` : '';

  // Format music schedule
  const musicDayCheckboxes = document.querySelectorAll('input[name="musicDays"]:checked');
  const selectedDays = Array.from(musicDayCheckboxes).map(cb => cb.value);
  const musicStartTime = document.getElementById('adminMusicStartTime').value;
  const musicEndTime = document.getElementById('adminMusicEndTime').value;
  const musicSchedule = selectedDays.length > 0 ? `${selectedDays.join(', ')} ${musicStartTime} - ${musicEndTime}` : '';

  const body = {
    name: document.getElementById('adminName').value,
    cuisine: document.getElementById('adminCuisine').value,
    address: document.getElementById('adminAddress').value,
    phone: document.getElementById('adminPhone').value,
    hours: hours,
    rating: document.getElementById('adminRating').value || 0,
    reviews: document.getElementById('adminReviews').value || 0,
    image: document.getElementById('adminImage').value,
    description: document.getElementById('adminDescription').value,
    liveMusic: document.getElementById('adminLiveMusic').checked,
    musicSchedule: musicSchedule,
    featured: document.getElementById('adminFeatured').checked,
    lat: document.getElementById('adminLat').value || 0,
    lng: document.getElementById('adminLng').value || 0
  };

  try {
    const res = await fetch('/api/admin/restaurants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const adminCreateForm = document.getElementById('adminCreateForm');
      adminCreateForm.reset();
      alert('Restaurant added successfully!');
      // Refresh main restaurant list to show new restaurant
      location.reload();
    } else {
      const error = await res.json();
      alert('Error: ' + (error.error || 'Failed to create restaurant'));
    }
  } catch (error) {
    console.error('Error creating restaurant:', error);
    alert('Failed to create restaurant');
  }
}

// ==================== LOGOUT ====================
function handleLogout() {
  localStorage.removeItem('token');
  alert('Logged out successfully');
  location.reload();
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initializeAdminSection();
});

