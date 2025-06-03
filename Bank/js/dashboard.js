document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update profile section
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    if (profileName) profileName.textContent = currentUser.name;
    if (profileEmail) profileEmail.textContent = currentUser.email;

    // Update current balance
    function updateBalance() {
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === currentUser.email);
        if (user) {
            const balanceElement = document.getElementById('currentBalance');
            if (balanceElement) {
                balanceElement.textContent = '₹' + user.balance.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                });
            }
        }
    }

    // Load and display transactions
    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const tbody = document.querySelector('#transactionTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const userTransactions = transactions.filter(t => 
            t.senderEmail === currentUser.email || t.receiverEmail === currentUser.email
        );

        userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        userTransactions.forEach(t => {
            const row = document.createElement('tr');
            const type = t.senderEmail === currentUser.email ? 'Sent' : 'Received';
            const amount = t.amount.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
            const otherParty = t.senderEmail === currentUser.email ? t.receiverEmail : t.senderEmail;
            
            row.innerHTML = `
                <td>${new Date(t.date).toLocaleString()}</td>
                <td>${type}</td>
                <td class="${type === 'Sent' ? 'text-danger' : 'text-success'}">₹${amount}</td>
                <td>${otherParty}</td>
            `;
            tbody.appendChild(row);
        });

        // If no transactions, show a message
        if (userTransactions.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="4" class="text-center">No transactions yet</td>
            `;
            tbody.appendChild(row);
        }

        // Update the chart after loading transactions
        updateTransactionChart(userTransactions);
    }

    // Initialize and update transaction chart
    function updateTransactionChart(userTransactions) {
        const ctx = document.getElementById('transactionChart');
        if (!ctx) return;

        // Get last 7 days
        const dates = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const sent = dates.map(date => {
            return userTransactions
                .filter(t => t.senderEmail === currentUser.email && t.date.startsWith(date))
                .reduce((sum, t) => sum + t.amount, 0);
        });

        const received = dates.map(date => {
            return userTransactions
                .filter(t => t.receiverEmail === currentUser.email && t.date.startsWith(date))
                .reduce((sum, t) => sum + t.amount, 0);
        });

        // Destroy existing chart if it exists
        if (window.transactionChart instanceof Chart) {
            window.transactionChart.destroy();
        }

        // Create new chart
        window.transactionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => {
                    const [year, month, day] = date.split('-');
                    return `${day}/${month}`;
                }),
                datasets: [
                    {
                        label: 'Money Sent',
                        data: sent,
                        borderColor: '#dc3545',
                        backgroundColor: '#dc354520',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Money Received',
                        data: received,
                        borderColor: '#28a745',
                        backgroundColor: '#28a74520',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Transaction History (Last 7 Days)',
                        color: '#1e3c72',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Handle money transfer
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const receiverEmail = document.getElementById('receiver_email').value;
            const amount = parseFloat(document.getElementById('amount').value);

            if (amount <= 0) {
                showNotification('Please enter a valid amount', 'danger');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users'));
            const sender = users.find(u => u.email === currentUser.email);
            const receiver = users.find(u => u.email === receiverEmail);

            if (!receiver) {
                showNotification('Recipient not found', 'danger');
                return;
            }

            if (!receiver.isActive) {
                showNotification('Recipient account is inactive', 'danger');
                return;
            }

            if (sender.email === receiver.email) {
                showNotification('Cannot transfer money to yourself', 'danger');
                return;
            }

            if (sender.balance < amount) {
                showNotification('Insufficient balance', 'danger');
                return;
            }

            // Update balances
            sender.balance -= amount;
            receiver.balance += amount;
            localStorage.setItem('users', JSON.stringify(users));

            // Record transaction
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            transactions.push({
                date: new Date().toISOString(),
                senderEmail: currentUser.email,
                receiverEmail: receiverEmail,
                amount: amount
            });
            localStorage.setItem('transactions', JSON.stringify(transactions));

            // Update UI
            updateBalance();
            loadTransactions();
            showNotification('Money sent successfully', 'success');

            // Reset form
            transferForm.reset();
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const toastEl = document.getElementById('notificationToast');
        const messageEl = document.getElementById('notificationMessage');
        if (toastEl && messageEl) {
            messageEl.textContent = message;
            toastEl.classList.remove('bg-success', 'bg-danger', 'bg-info');
            toastEl.classList.add(`bg-${type}`);
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        } else {
            alert(message);
        }
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('user');
            window.location.href = window.location.pathname.includes('admin') ? '../login.html' : 'login.html';
        });
    }

    // Initialize dashboard
    updateBalance();
    loadTransactions();
});