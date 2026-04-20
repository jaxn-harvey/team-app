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

  // Get and validate image file
  const imageFile = document.getElementById('adminImage').files[0];
  if (!imageFile) {
    alert('Please select an image');
    return;
  }

  try {
    // Step 1: Convert image to base64
    console.log('[FORM] Converting image to base64...');
    const imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
    console.log('[FORM] Image converted to base64');

    // Step 2: Format data for restaurant creation
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
      image: imageBase64,  // Store base64 image directly
      description: document.getElementById('adminDescription').value,
      liveMusic: document.getElementById('adminLiveMusic').checked,
      musicSchedule: musicSchedule,
      featured: document.getElementById('adminFeatured').checked,
      lat: parseFloat(document.getElementById('adminLat').value) || 34.7817,
      lng: parseFloat(document.getElementById('adminLng').value) || -87.6760
    };

    // Step 3: Create restaurant with base64 image
    console.log('[FORM] Creating restaurant...');
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

// ==================== LOAD ADMIN RESTAURANTS (FOR EDITING) ====================
async function loadAdminRestaurants() {
  const token = localStorage.getItem('token');
  const adminRestaurantsContainer = document.getElementById('adminRestaurantsList');
  
  if (!adminRestaurantsContainer) return;

  try {
    const res = await fetch('/api/admin/restaurants', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const restaurants = await res.json();
    
    adminRestaurantsContainer.innerHTML = restaurants.map(restaurant => `
      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 style="margin: 0 0 5px 0; color: #8B4513;">${restaurant.name}</h4>
          <p style="margin: 0; font-size: 0.9em; color: #666;">${restaurant.cuisine} • ${restaurant.address}</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="openEditRestaurantModal('${restaurant._id}')" style="background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Edit</button>
          <button onclick="deleteRestaurant('${restaurant._id}', '${restaurant.name}')" style="background: #d32f2f; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading restaurants:', error);
  }
}

// ==================== EDIT RESTAURANT ====================
async function openEditRestaurantModal(restaurantId) {
  const token = localStorage.getItem('token');
  
  try {
    const res = await fetch(`/api/restaurants/${restaurantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      alert('Failed to load restaurant');
      return;
    }

    const restaurant = await res.json();
    
    // Populate form with existing data
    document.getElementById('editRestaurantId').value = restaurant._id;
    document.getElementById('editName').value = restaurant.name;
    document.getElementById('editCuisine').value = restaurant.cuisine;
    document.getElementById('editAddress').value = restaurant.address;
    document.getElementById('editPhone').value = restaurant.phone;
    
    // Parse hours into opening and closing time
    const [opening, closing] = restaurant.hours.split(' - ');
    document.getElementById('editOpeningTime').value = opening || '';
    document.getElementById('editClosingTime').value = closing || '';
    
    document.getElementById('editRating').value = restaurant.rating || 0;
    document.getElementById('editReviews').value = restaurant.reviews || 0;
    document.getElementById('editDescription').value = restaurant.description;
    document.getElementById('editLiveMusic').checked = restaurant.liveMusic || false;
    document.getElementById('editFeatured').checked = restaurant.featured || false;
    document.getElementById('editLat').value = restaurant.lat || 0;
    document.getElementById('editLng').value = restaurant.lng || 0;
    
    // Parse music schedule if live music is enabled
    if (restaurant.liveMusic && restaurant.musicSchedule) {
      const [days, times] = restaurant.musicSchedule.split(' ');
      const dayArray = days.split(', ');
      const [startTime, endTime] = times.split(' - ');
      
      document.querySelectorAll('input[name="editMusicDays"]').forEach(cb => {
        cb.checked = dayArray.includes(cb.value);
      });
      document.getElementById('editMusicStartTime').value = startTime || '';
      document.getElementById('editMusicEndTime').value = endTime || '';
    }
    
    // Show/hide music schedule field
    const editMusicScheduleField = document.getElementById('editMusicScheduleField');
    if (editMusicScheduleField) {
      editMusicScheduleField.style.display = restaurant.liveMusic ? 'block' : 'none';
    }
    
    // Show edit modal
    const editModal = document.getElementById('editRestaurantModal');
    if (editModal) {
      editModal.style.display = 'block';
    }
  } catch (error) {
    console.error('Error opening edit modal:', error);
    alert('Failed to load restaurant for editing');
  }
}

// ==================== HANDLE EDIT RESTAURANT ====================
async function handleEditRestaurant(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const restaurantId = document.getElementById('editRestaurantId').value;

  try {
    // Get opening and closing times
    const openingTime = document.getElementById('editOpeningTime').value;
    const closingTime = document.getElementById('editClosingTime').value;
    const hours = openingTime && closingTime ? `${openingTime} - ${closingTime}` : '';

    // Get music schedule
    const musicDayCheckboxes = document.querySelectorAll('input[name="editMusicDays"]:checked');
    const selectedDays = Array.from(musicDayCheckboxes).map(cb => cb.value);
    const musicStartTime = document.getElementById('editMusicStartTime').value;
    const musicEndTime = document.getElementById('editMusicEndTime').value;
    const musicSchedule = selectedDays.length > 0 ? `${selectedDays.join(', ')} ${musicStartTime} - ${musicEndTime}` : '';

    // Check if a new image was selected
    const imageFile = document.getElementById('editImage').files[0];
    let imageData = null;
    
    if (imageFile) {
      // Convert new image to base64
      imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    }

    const body = {
      name: document.getElementById('editName').value,
      cuisine: document.getElementById('editCuisine').value,
      address: document.getElementById('editAddress').value,
      phone: document.getElementById('editPhone').value,
      hours: hours,
      rating: document.getElementById('editRating').value || 0,
      reviews: document.getElementById('editReviews').value || 0,
      description: document.getElementById('editDescription').value,
      liveMusic: document.getElementById('editLiveMusic').checked,
      musicSchedule: musicSchedule,
      featured: document.getElementById('editFeatured').checked,
      lat: parseFloat(document.getElementById('editLat').value) || 34.7817,
      lng: parseFloat(document.getElementById('editLng').value) || -87.6760
    };

    // Only include new image if provided
    if (imageData) {
      body.image = imageData;
    }

    console.log('[EDIT] Updating restaurant...');
    const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert('Restaurant updated successfully!');
      closeEditModal();
      location.reload();
    } else {
      const error = await res.json();
      alert('Error: ' + (error.error || 'Failed to update restaurant'));
    }
  } catch (error) {
    console.error('Error updating restaurant:', error);
    alert('Failed to update restaurant');
  }
}

// ==================== DELETE RESTAURANT ====================
async function deleteRestaurant(restaurantId, restaurantName) {
  const token = localStorage.getItem('token');
  
  if (!confirm(`Are you sure you want to delete "${restaurantName}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
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

// ==================== CLOSE EDIT MODAL ====================
function closeEditModal() {
  const editModal = document.getElementById('editRestaurantModal');
  if (editModal) {
    editModal.style.display = 'none';
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
  loadAdminRestaurants();
  
  // Setup edit modal close button
  const editModal = document.getElementById('editRestaurantModal');
  if (editModal) {
    const closeBtn = editModal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeEditModal);
    }
  }
  
  const editForm = document.getElementById('editRestaurantForm');
  if (editForm) {
    editForm.addEventListener('submit', handleEditRestaurant);
  }
  
  // Show/hide music schedule on edit form
  const editLiveMusicCheckbox = document.getElementById('editLiveMusic');
  const editMusicScheduleField = document.getElementById('editMusicScheduleField');
  if (editLiveMusicCheckbox && editMusicScheduleField) {
    editLiveMusicCheckbox.addEventListener('change', () => {
      editMusicScheduleField.style.display = editLiveMusicCheckbox.checked ? 'block' : 'none';
    });
  }
});

