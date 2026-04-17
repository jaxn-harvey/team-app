// Initialize Socket.IO connection
const socket = io();

// Handle form submission
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form data
  const senderName = document.getElementById('senderName').value.trim();
  const senderEmail = document.getElementById('senderEmail').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail)) {
    showStatus('error', i18next.t('contact.validation.invalidEmail'));
    return;
  }

  // Show sending status
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  showStatus('sending', i18next.t('contact.status.sending'));

  // Emit email via WebSocket
  socket.emit('send-contact-email', {
    senderName,
    senderEmail,
    subject,
    message
  });
});

// Listen for email status from server
socket.on('email-status', (data) => {
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = false;

  if (data.status === 'success') {
    showStatus('success', i18next.t('contact.status.success'));
    // Clear form
    document.getElementById('contactForm').reset();
  } else if (data.status === 'error') {
    showStatus('error', data.message || i18next.t('contact.status.error'));
  }
});

// Handle WebSocket connection
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  showStatus('error', i18next.t('contact.status.disconnected'));
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  showStatus('error', i18next.t('contact.status.connectionError'));
});

// Display status message
function showStatus(type, message) {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.className = `status-message status-${type}`;
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';

  // Auto-hide success message after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }
}

// Setup hamburger menu
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburgerMenu');
  const navMenu = document.getElementById('navMenu');

  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
});
