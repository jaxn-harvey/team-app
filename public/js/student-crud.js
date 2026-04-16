/* Student CRUD page JavaScript */

// Authentication helpers
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

function checkAuthentication() {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    const authStatus = document.getElementById('authStatus');
    const mainContent = document.getElementById('mainContent');

    if (!token) {
        authStatus.innerHTML = `
            <h5 class="text-danger">🔒 Authentication Required</h5>
            <p>You need to login to access the Student CRUD operations.</p>
            <a href="auth.html" class="btn btn-primary">🔑 Go to Login Page</a>
        `;
        mainContent.style.display = 'none';
        return false;
    } else {
        authStatus.innerHTML = `
            <h5 class="text-success">✅ Authenticated as: ${username}</h5>
            <a href="auth.html" class="btn btn-outline-secondary btn-sm">🔑 Auth Dashboard</a>
            <button onclick="logout()" class="btn btn-outline-danger btn-sm ms-2">🚪 Logout</button>
        `;
        mainContent.style.display = 'block';
        return true;
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    checkAuthentication();
    showMessage('👋 Logged out successfully!', 'info');
}

// Check authentication on page load
window.addEventListener('load', () => {
    if (checkAuthentication()) {
        loadStudents();
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

// CREATE - Add new student
document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }

    const student = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        grade: document.getElementById('grade').value
    };

    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(student)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Student "${student.name}" added successfully!`, 'success');
            document.getElementById('addStudentForm').reset();
            loadStudents(); // Refresh the list
        } else {
            if (response.status === 401 || response.status === 403) {
                showMessage('❌ Authentication failed. Please login again.', 'danger');
                logout();
            } else {
                showMessage(`❌ Error: ${result.error}`, 'danger');
            }
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

// READ - Load all students
async function loadStudents() {
    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }

    try {
        const response = await fetch('/api/students', {
            method: 'GET',
            headers: headers
        });
        
        if (response.status === 401 || response.status === 403) {
            showMessage('❌ Authentication failed. Please login again.', 'danger');
            logout();
            return;
        }

        const students = await response.json();

        const studentsList = document.getElementById('studentsList');
        
        if (students.length === 0) {
            studentsList.innerHTML = '<p class="text-muted">No students found. Try seeding the database!</p>';
            return;
        }

        studentsList.innerHTML = students.map(student => `
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${student.name}</strong> (Age: ${student.age}, Grade: ${student.grade})
                        <br>
                        <small class="text-muted">ID: <span class="student-id" 
                            data-id="${student._id}" 
                            data-name="${student.name}" 
                            data-age="${student.age}" 
                            data-grade="${student.grade}">${student._id}</span></small>
                        ${student.createdBy ? `<br><small class="text-muted">Created by: ${student.createdBy}</small>` : ''}
                    </div>
                    <button class="btn btn-outline-danger btn-sm" 
                        data-student-id="${student._id}" 
                        data-student-name="${student.name}" 
                        class="delete-btn">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add click event listeners for student IDs
        document.querySelectorAll('.student-id').forEach(span => {
            span.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const age = this.getAttribute('data-age');
                const grade = this.getAttribute('data-grade');
                fillUpdateForm(id, name, age, grade);
            });
        });
        
        // Add click event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-student-id');
                const name = this.getAttribute('data-student-name');
                deleteStudent(id, name);
            });
        });
        
        showMessage(`📋 Loaded ${students.length} students`, 'info');
    } catch (error) {
        showMessage(`❌ Error loading students: ${error.message}`, 'danger');
    }
}

// Fill update form when clicking on student ID
function fillUpdateForm(id, name, age, grade) {
    document.getElementById('updateId').value = id;
    document.getElementById('updateName').value = name;
    document.getElementById('updateAge').value = age;
    document.getElementById('updateGrade').value = grade;
    showMessage('📝 Student data loaded in update form', 'info');
}

// UPDATE - Update student
document.getElementById('updateStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('updateId').value;
    const student = {
        name: document.getElementById('updateName').value,
        age: parseInt(document.getElementById('updateAge').value),
        grade: document.getElementById('updateGrade').value
    };

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(student)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Student "${student.name}" updated successfully!`, 'success');
            document.getElementById('updateStudentForm').reset();
            loadStudents(); // Refresh the list
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

// DELETE - Delete student
async function deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Student "${name}" deleted successfully!`, 'success');
            loadStudents(); // Refresh the list
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}

// Seed Database
async function seedDatabase() {
    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }

    if (!confirm('This will add sample students to the database. Continue?')) {
        return;
    }

    try {
        showMessage('🌱 Seeding database...', 'info');
        const response = await fetch('/api/seed', {
            method: 'POST',
            headers: headers
        });

        if (response.status === 401 || response.status === 403) {
            showMessage('❌ Authentication failed. Please login again.', 'danger');
            logout();
            return;
        }

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ ${result.message}`, 'success');
            loadStudents(); // Refresh the list
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}

// Cleanup Database
async function cleanupDatabase() {
    const headers = getAuthHeaders();
    if (!headers) {
        showMessage('❌ Authentication required. Please login first.', 'danger');
        return;
    }

    if (!confirm('⚠️ This will DELETE ALL students from the database. Are you sure?')) {
        return;
    }

    try {
        showMessage('🧹 Cleaning database...', 'info');
        const response = await fetch('/api/cleanup', {
            method: 'DELETE',
            headers: headers
        });

        if (response.status === 401 || response.status === 403) {
            showMessage('❌ Authentication failed. Please login again.', 'danger');
            logout();
            return;
        }

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ ${result.message}`, 'success');
            loadStudents(); // Refresh the list
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}

// Load students when page loads
window.addEventListener('load', loadStudents);