const form = document.getElementById('adminLoginForm');
const messageBox = document.getElementById('loginMessage');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  messageBox.textContent = '';
  messageBox.className = 'login-message';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      messageBox.textContent = data.error || 'Login failed.';
      messageBox.classList.add('error');
      return;
    }

    if (data.role !== 'admin') {
      messageBox.textContent = 'You do not have admin access.';
      messageBox.classList.add('error');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', username);

    messageBox.textContent = 'Login successful. Redirecting...';
    messageBox.classList.add('success');

    setTimeout(() => {
      window.location.href = 'restaurants.html';
    }, 800);
  } catch (error) {
    console.error('Login error:', error);
    messageBox.textContent = 'An error occurred while logging in.';
    messageBox.classList.add('error');
  }
});