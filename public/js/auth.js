/* Auth page JavaScript */

// Check if user is already logged in
window.addEventListener('load', () => {
    const token = localStorage.getItem('jwtToken');
    const urlParams = new URLSearchParams(window.location.search);
    const redirectedFrom = urlParams.get('redirect');
    
    if (redirectedFrom) {
        // User was redirected from a protected page
        showMessage(`🔒 You need to login to access that page. Please login below and you'll be redirected back.`, 'warning');
    }
    
    if (token) {
        showDashboard();
    }
});

// Show message to user
function showMessage(message, type = 'info') {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        messagesDiv.innerHTML = '';
    }, 5000);
}

// Register new user
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Account created successfully! You can now login.`, 'success');
            document.getElementById('registerForm').reset();
        } else {
            showMessage(`❌ Registration failed: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

// Login user
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('jwtToken', result.token);
            localStorage.setItem('username', result.user.username);
            
            showMessage(`✅ Login successful! Welcome, ${result.user.username}!`, 'success');
            
            // Check if user should be redirected after login
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect');
            
            if (redirectTo) {
                // Redirect to the original page they were trying to access
                setTimeout(() => {
                    window.location.href = redirectTo + '?from=login';
                }, 1000);
            } else {
                // Show dashboard normally
                setTimeout(() => {
                    showDashboard();
                }, 1000);
            }
        } else {
            showMessage(`❌ Login failed: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

// Show user dashboard
function showDashboard() {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    
    document.getElementById('authForms').classList.add('hidden');
    document.getElementById('userDashboard').classList.remove('hidden');
    document.getElementById('currentUsername').textContent = username;
    document.getElementById('tokenDisplay').textContent = token;
}

// Test protected route
async function testProtectedRoute() {
    const token = localStorage.getItem('jwtToken');
    
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        
        const resultsDiv = document.getElementById('testResults');
        
        if (response.ok) {
            resultsDiv.innerHTML = `
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0">✅ Protected Route Test: SUCCESS</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>User Info from Server:</strong></p>
                        <pre>${JSON.stringify(result.user, null, 2)}</pre>
                    </div>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="card border-danger">
                    <div class="card-header bg-danger text-white">
                        <h6 class="mb-0">❌ Protected Route Test: FAILED</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Error:</strong> ${result.error}</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        document.getElementById('testResults').innerHTML = `
            <div class="card border-danger">
                <div class="card-header bg-danger text-white">
                    <h6 class="mb-0">❌ Network Error</h6>
                </div>
                <div class="card-body">
                    <p>${error.message}</p>
                </div>
            </div>
        `;
    }
}

// Logout user
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    
    document.getElementById('authForms').classList.remove('hidden');
    document.getElementById('userDashboard').classList.add('hidden');
    document.getElementById('testResults').innerHTML = '';
    
    showMessage('👋 Logged out successfully!', 'info');
}