// auth.js - 修复版本
// Authentication DOM elements
const authElements = {
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    userInfo: document.getElementById('user-info'),
    usernameSpan: document.getElementById('username')
};

// Show login modal - 确保函数可以全局访问
window.showLoginModal = function() {
    const modal = createModal('Login', `
        <form id="login-form">
            <div class="form-group">
                <label for="login-email">Email Address</label>
                <input type="email" id="login-email" required>
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
        </form>
    `);
    
    modal.querySelector('#login-form').addEventListener('submit', handleLogin);
}

// Show register modal
window.showRegisterModal = function() {
    const modal = createModal('Register', `
        <form id="register-form">
            <div class="form-group">
                <label for="register-name">Full Name</label>
                <input type="text" id="register-name" required>
            </div>
            <div class="form-group">
                <label for="register-email">Email Address</label>
                <input type="email" id="register-email" required>
            </div>
            <div class="form-group">
                <label for="register-password">Password</label>
                <input type="password" id="register-password" required>
            </div>
            <div class="form-group">
                <label for="register-address">Shipping Address</label>
                <textarea id="register-address" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
        </form>
    `);
    
    modal.querySelector('#register-form').addEventListener('submit', handleRegister);
}

// Setup authentication event listeners
function setupAuthListeners() {
    if (authElements.loginBtn) {
        authElements.loginBtn.addEventListener('click', showLoginModal);
    }
    
    if (authElements.registerBtn) {
        authElements.registerBtn.addEventListener('click', showRegisterModal);
    }
    
    if (authElements.logoutBtn) {
        authElements.logoutBtn.addEventListener('click', logout);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (email && password) {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            appState.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address
            };
            
            saveStateToStorage();
            updateUserDisplay();
            closeModal();
            alert('Login successful!');
        } else {
            alert('Invalid email or password!');
        }
    } else {
        alert('Please fill in all fields!');
    }
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const address = document.getElementById('register-address').value;
    
    if (name && email && password && address) {
        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            alert('This email is already registered!');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            address,
            registeredDate: new Date().toISOString().split('T')[0]
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        appState.currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            address: newUser.address
        };
        
        saveStateToStorage();
        updateUserDisplay();
        closeModal();
        alert('Registration successful!');
    } else {
        alert('Please fill in all fields!');
    }
}

// Logout
function logout() {
    appState.currentUser = null;
    saveStateToStorage();
    updateUserDisplay();
    alert('Logged out successfully!');
}

// Update user display status
function updateUserDisplay() {
    if (!authElements.loginBtn || !authElements.registerBtn || !authElements.userInfo) return;
    
    if (appState.currentUser) {
        authElements.loginBtn.style.display = 'none';
        authElements.registerBtn.style.display = 'none';
        authElements.userInfo.style.display = 'flex';
        if (authElements.usernameSpan) {
            authElements.usernameSpan.textContent = appState.currentUser.name;
        }
    } else {
        authElements.loginBtn.style.display = 'inline-block';
        authElements.registerBtn.style.display = 'inline-block';
        authElements.userInfo.style.display = 'none';
    }
}

// Create modal (reusable function)
window.createModal = function(title, content) {
    const modalContainer = document.getElementById('modal-container');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn close-modal-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modalContainer.innerHTML = '';
    modalContainer.appendChild(modal);
    
    // Add close event
    modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
}

// Close modal
window.closeModal = function() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
}

// Initialize auth module
document.addEventListener('DOMContentLoaded', setupAuthListeners);