// Logout function
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Initialize users if not exists
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        {
            email: 'Thirumal@admin.com',
            password: 'Thirumal@1234',
            name: 'Thirumal',
            isAdmin: true,
            balance: 0,
            isActive: true,
            joinDate: '2025-01-01'
        },
        {
            email: 'user1@example.com',
            password: 'password123',
            name: 'John Doe',
            isAdmin: false,
            balance: 1000000,
            isActive: true,
            joinDate: '2025-02-15'
        }
    ]));
}

// Initialize transactions if not exists
if (!localStorage.getItem('transactions')) {
    const sampleTransactions = [];
    const users = ['user1@example.com'];
    
    // Generate sample transactions for the last 30 days
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate 1-3 transactions per day
        const transactionsPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < transactionsPerDay; j++) {
            // Random amount between 1000 and 50000
            const amount = Math.floor(Math.random() * 49000) + 1000;
            
            // Add transaction
            sampleTransactions.push({
                date: new Date(date).toISOString(),
                senderEmail: 'Thirumal@admin.com',
                receiverEmail: users[0],
                amount: amount
            });
        }
    }
    
    localStorage.setItem('transactions', JSON.stringify(sampleTransactions));
}

// Check if user is logged in for protected pages
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && !window.location.pathname.includes('index.html')) {
        window.location.href = window.location.pathname.includes('admin') ? '../login.html' : 'login.html';
        return null;
    }
    return currentUser;
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form submission
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            if (!user.isActive) {
                showError('Your account is inactive. Please contact admin.');
                return;
            }
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            showError('Invalid email or password');
        }
    });
}

// Admin login form handler
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form submission
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email === 'Thirumal@admin.com' && password === 'Thirumal@1234') {
            const adminUser = {
                email: email,
                name: 'Thirumal',
                isAdmin: true,
                balance: 0,
                isActive: true
            };
            localStorage.setItem('user', JSON.stringify(adminUser));
            window.location.href = window.location.href.includes('admin') ? 'dashboard.html' : 'admin/dashboard.html';
        } else {
            showError('Invalid admin credentials');
        }
    });
}

// Register form handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form submission
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showError('Email already registered');
            return;
        }
        
        // Create new user
        const newUser = {
            name,
            email,
            password,
            balance: 1000000.00, // ₹10,00,000
            isAdmin: false,
            isActive: true,
            joinDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login after registration
        localStorage.setItem('user', JSON.stringify(newUser));
        window.location.href = 'dashboard.html';
    });
}

// Initialize dashboard if on dashboard page
if (window.location.pathname.includes('dashboard.html')) {
    const user = checkAuth();
    if (user) {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        if (profileName) profileName.textContent = user.name;
        if (profileEmail) profileEmail.textContent = user.email;
    }
}

// Logout handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = window.location.pathname.includes('admin') ? '../login.html' : 'login.html';
    });
}

// Error display helper
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
    }
}

// Run auth check
checkAuth();
