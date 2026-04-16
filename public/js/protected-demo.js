/* Protected demo page JavaScript */

let redirectDemoEnabled = false;

// Check authentication status when page loads
window.addEventListener('load', function() {
    checkAuthenticationStatus();
});

function checkAuthenticationStatus() {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    const authContent = document.getElementById('authContent');
    
    if (token && username) {
        // User is authenticated - show protected content
        authContent.innerHTML = `
            <div class="protected-content">
                <h1>🎉 Welcome to the Protected Zone!</h1>
                <h3>Hello, <strong>${username}</strong>!</h3>
                <p class="lead">Congratulations! You have successfully accessed a protected route.</p>
                
                <div class="mt-4">
                    <h5>🔐 What This Means:</h5>
                    <ul class="list-unstyled mt-3 text-start protected-list">
                        <li>✅ Your JWT token was found in localStorage</li>
                        <li>✅ Your identity has been verified</li>
                        <li>✅ You can now access authenticated content</li>
                        <li>✅ This is how user dashboards and private areas work</li>
                    </ul>
                </div>
                
                <div class="mt-4">
                    <a href="student-crud.html" class="btn btn-light btn-lg me-3">
                        📝 Try More Protected Features
                    </a>
                    <button onclick="simulateLogout()" class="btn btn-outline-light">
                        🚪 Logout & See What Happens
                    </button>
                </div>
            </div>
        `;
    } else {
        // User is NOT authenticated - show unauthorized content
        authContent.innerHTML = `
            <div class="unauthorized-content">
                <h1>🔒 Access Denied</h1>
                <h3>This is a Protected Route</h3>
                <p class="lead">You need to be logged in to view this content.</p>
                
                <div class="mt-4">
                    <h5>🚫 What's Happening:</h5>
                    <ul class="list-unstyled mt-3 text-start" style="max-width: 600px; margin: 0 auto;">
                        <li>❌ No JWT token found in your browser</li>
                        <li>❌ Cannot verify your identity</li>
                        <li>❌ Access to protected content is blocked</li>
                        <li>❌ This prevents unauthorized users from seeing private data</li>
                    </ul>
                </div>
                
                <div class="mt-4">
                    <a href="auth.html?redirect=protected-demo.html" class="btn btn-light btn-lg me-3">
                        🔑 Login to Access This Content
                    </a>
                    <button onclick="simulateAutoRedirect()" class="btn btn-outline-light">
                        🔄 See Auto-Redirect in Action
                    </button>
                </div>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    checkAuthenticationStatus(); // Refresh the page content
}

function simulateLogout() {
    if (confirm("This will log you out and show you the unauthorized view. Are you ready?")) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        
        // Add a small delay for dramatic effect
        const authContent = document.getElementById('authContent');
        authContent.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Logging out...</span>
                </div>
                <p class="mt-2 text-muted">Logging you out and updating page content...</p>
            </div>
        `;
        
        setTimeout(() => {
            checkAuthenticationStatus();
        }, 1500);
    }
}

function simulateAutoRedirect() {
    const authContent = document.getElementById('authContent');
    authContent.innerHTML = `
        <div class="unauthorized-content">
            <h1>🔄 Automatic Redirect Simulation</h1>
            <h3>Real App Behavior</h3>
            <p class="lead">In a real application, you would be redirected automatically...</p>
            
            <div class="mt-4">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Redirecting...</span>
                </div>
                <p class="mt-3"><strong>Redirecting to login page in <span id="countdown">3</span> seconds...</strong></p>
                <p><small>You'll be brought back here after you login!</small></p>
            </div>
        </div>
    `;
    
    let count = 3;
    const countdownElement = document.getElementById('countdown');
    
    const timer = setInterval(() => {
        count--;
        if (countdownElement) {
            countdownElement.textContent = count;
        }
        
        if (count <= 0) {
            clearInterval(timer);
            window.location.href = 'auth.html?redirect=protected-demo.html';
        }
    }, 1000);
}

function toggleRedirectDemo() {
    const button = document.getElementById('toggleRedirect');
    const status = document.getElementById('redirectStatus');
    
    redirectDemoEnabled = !redirectDemoEnabled;
    
    if (redirectDemoEnabled) {
        button.textContent = 'Disable Redirect Demo';
        button.className = 'btn btn-danger';
        status.innerHTML = `
            <div class="alert alert-warning">
                <strong>🔄 Redirect Demo Active:</strong> If you logout now, you'll be automatically redirected to the login page.
                <br><small>In a real app, this would happen immediately when visiting the page while logged out.</small>
            </div>
        `;
        
        // If user is not authenticated, redirect them now
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setTimeout(() => {
                status.innerHTML = `
                    <div class="alert alert-info">
                        <strong>🔄 Redirecting...</strong> Taking you to the login page in 3 seconds...
                    </div>
                `;
                setTimeout(() => {
                    window.location.href = 'auth.html?redirect=protected-demo.html';
                }, 3000);
            }, 1000);
        }
    } else {
        button.textContent = 'Enable Automatic Redirect Demo';
        button.className = 'btn btn-primary';
        status.innerHTML = '';
    }
}

// Check if user was redirected here after login
const urlParams = new URLSearchParams(window.location.search);
const fromLogin = urlParams.get('from');
if (fromLogin === 'login') {
    const authContent = document.getElementById('authContent');
    setTimeout(() => {
        authContent.insertAdjacentHTML('afterbegin', `
            <div class="alert alert-success alert-dismissible fade show">
                <strong>🎉 Login Successful!</strong> You were redirected here after logging in.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
    }, 500);
}