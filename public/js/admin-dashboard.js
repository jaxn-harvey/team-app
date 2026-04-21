const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'admin-login.html';
}

const list = document.getElementById('restaurantList');

function logout() {
  localStorage.clear();
  window.location.href = 'admin-login.html';
}

async function fetchRestaurants() {
  try {
    const res = await fetch('/api/admin/restaurants', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      logout();
      return;
    }

    const data = await res.json();
    renderRestaurants(data);
  } catch (err) {
    console.error(err);
  }
}

function renderRestaurants(restaurants) {
  list.innerHTML = restaurants.map(r => `
    <div class="restaurant-item">
      <h3>${r.name}</h3>
      <p>${r.cuisine}</p>
      <p>${r.address}</p>

      <button class="delete-btn" onclick="deleteRestaurant('${r._id}')">
        Delete
      </button>
    </div>
  `).join('');
}

async function deleteRestaurant(id) {
  if (!confirm('Delete this restaurant?')) return;

  try {
    await fetch(`/api/admin/restaurants/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchRestaurants();
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    name: document.getElementById('name').value,
    cuisine: document.getElementById('cuisine').value,
    address: document.getElementById('address').value,
    phone: document.getElementById('phone').value,
    hours: document.getElementById('hours').value,
    rating: document.getElementById('rating').value,
    reviews: document.getElementById('reviews').value,
    image: document.getElementById('image').value,
    description: document.getElementById('description').value,
    lat: document.getElementById('lat').value,
    lng: document.getElementById('lng').value
  };

  try {
    await fetch('/api/admin/restaurants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    e.target.reset();
    fetchRestaurants();
  } catch (err) {
    console.error(err);
  }
});

fetchRestaurants();