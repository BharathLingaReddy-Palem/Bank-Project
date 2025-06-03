document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password');
        const strengthDiv = document.querySelector('.password-strength');
        
        // Password strength indicator
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            let message = '';
            
            if (password.length >= 8) strength += 1;
            if (/[A-Z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;
            if (/[!@#$%^&*]/.test(password)) strength += 1;
            
            switch(strength) {
                case 0:
                    message = '<div class="alert alert-danger">Very Weak</div>';
                    break;
                case 1:
                    message = '<div class="alert alert-warning">Weak</div>';
                    break;
                case 2:
                    message = '<div class="alert alert-info">Medium</div>';
                    break;
                case 3:
                    message = '<div class="alert alert-primary">Strong</div>';
                    break;
                case 4:
                    message = '<div class="alert alert-success">Very Strong</div>';
                    break;
            }
            
            strengthDiv.innerHTML = message;
        });
        
        // Form submission validation
        registerForm.addEventListener('submit', function(e) {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            let isValid = true;
            let errorMessage = '';
            
            // Password length check
            if (password.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long';
            }
            
            // Password number check
            if (!/\d/.test(password)) {
                isValid = false;
                errorMessage = 'Password must contain at least one number';
            }
            
            // Password special character check
            if (!/[!@#$%^&*]/.test(password)) {
                isValid = false;
                errorMessage = 'Password must contain at least one special character (!@#$%^&*)';
            }
            
            // Password uppercase check
            if (!/[A-Z]/.test(password)) {
                isValid = false;
                errorMessage = 'Password must contain at least one uppercase letter';
            }
            
            // Password match check
            if (password !== confirmPassword) {
                isValid = false;
                errorMessage = 'Passwords do not match';
            }
            
            if (!isValid) {
                e.preventDefault();
                const errorDiv = document.getElementById('errorMessage');
                errorDiv.textContent = errorMessage;
                errorDiv.classList.remove('d-none');
            }
        });
    }
});
