document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = window.location.pathname.includes('admin') ? 'login.html' : 'admin/login.html';
        return;
    }

    // Initialize statistics
    updateDashboardStats();
    loadUsers();
    loadTransactions();
    initializeCharts();

    // Search functionality
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            loadUsers(this.value);
        });
    }

    // Date filter for transactions
    const transactionDate = document.getElementById('transactionDate');
    if (transactionDate) {
        transactionDate.addEventListener('change', function() {
            loadTransactions(this.value);
        });
    }

    function updateDashboardStats() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const today = new Date().toISOString().split('T')[0];

        // Update statistics
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalTransactions').textContent = transactions.length;

        const totalFlow = transactions.reduce((sum, t) => sum + t.amount, 0);
        document.getElementById('totalMoneyFlow').textContent = '₹' + totalFlow.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        const todayTrans = transactions.filter(t => t.date.startsWith(today)).length;
        document.getElementById('todayTransactions').textContent = todayTrans;
    }

    function loadUsers(searchTerm = '') {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const filteredUsers = users.filter(user => 
            !searchTerm || 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredUsers.forEach(user => {
            if (user.isAdmin) return; // Skip admin users
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>₹${user.balance.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                })}</td>
                <td>
                    <span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${new Date(user.joinDate || Date.now()).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-${user.isActive ? 'danger' : 'success'} toggle-status" 
                            data-email="${user.email}" data-status="${user.isActive}">
                        ${user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners to toggle buttons
        document.querySelectorAll('.toggle-status').forEach(button => {
            button.addEventListener('click', function() {
                const email = this.getAttribute('data-email');
                const users = JSON.parse(localStorage.getItem('users'));
                const user = users.find(u => u.email === email);
                if (user) {
                    user.isActive = !user.isActive;
                    localStorage.setItem('users', JSON.stringify(users));
                    loadUsers(); // Reload the table
                    showNotification(`User ${user.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
                }
            });
        });
    }

    function loadTransactions(dateFilter = '') {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const tbody = document.getElementById('transactionTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const filteredTransactions = dateFilter
            ? transactions.filter(t => t.date.startsWith(dateFilter))
            : transactions;

        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(transaction.date).toLocaleString()}</td>
                <td>${transaction.senderEmail}</td>
                <td>${transaction.receiverEmail}</td>
                <td>₹${transaction.amount.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                })}</td>
                <td><span class="badge bg-success">Success</span></td>
            `;
            tbody.appendChild(row);
        });

        if (filteredTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No transactions found</td>
                </tr>
            `;
        }
    }

    function initializeCharts() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Transaction Trend Chart
        const ctx1 = document.getElementById('transactionTrend');
        if (ctx1) {
            const last7Days = Array.from({length: 7}, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const dailyTotals = last7Days.map(date => {
                return transactions
                    .filter(t => t.date.startsWith(date))
                    .reduce((sum, t) => sum + t.amount, 0);
            });

            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: last7Days.map(date => {
                        const [_, month, day] = date.split('-');
                        return `${day}/${month}`;
                    }),
                    datasets: [{
                        label: 'Daily Transaction Volume',
                        data: dailyTotals,
                        borderColor: '#1e3c72',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => '₹' + value.toLocaleString('en-IN')
                            }
                        }
                    }
                }
            });
        }

        // User Activity Pie Chart
        const ctx2 = document.getElementById('userActivity');
        if (ctx2) {
            const activeUsers = users.filter(u => u.isActive && !u.isAdmin).length;
            const inactiveUsers = users.filter(u => !u.isActive && !u.isAdmin).length;

            new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: ['Active Users', 'Inactive Users'],
                    datasets: [{
                        data: [activeUsers, inactiveUsers],
                        backgroundColor: ['#28a745', '#dc3545']
                    }]
                }
            });
        }

        // Daily Transaction Chart
        const ctx3 = document.getElementById('dailyTransactionChart');
        if (ctx3) {
            const today = new Date();
            const hourlyData = Array.from({length: 24}, (_, hour) => {
                return transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getDate() === today.getDate() && 
                           tDate.getMonth() === today.getMonth() &&
                           tDate.getHours() === hour;
                }).length;
            });

            new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                    datasets: [{
                        label: 'Transactions per Hour',
                        data: hourlyData,
                        backgroundColor: '#1e3c72'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // User Growth Chart
        const ctx4 = document.getElementById('userGrowthChart');
        if (ctx4) {
            const last6Months = Array.from({length: 6}, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                return d.toISOString().split('T')[0].substring(0, 7);
            }).reverse();

            const monthlyGrowth = last6Months.map(month => {
                return users.filter(u => 
                    !u.isAdmin && 
                    (u.joinDate || '').startsWith(month)
                ).length;
            });

            new Chart(ctx4, {
                type: 'line',
                data: {
                    labels: last6Months.map(month => {
                        const [year, m] = month.split('-');
                        return `${m}/${year}`;
                    }),
                    datasets: [{
                        label: 'New Users',
                        data: monthlyGrowth,
                        borderColor: '#28a745',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // Update Monthly Summary Table
        updateMonthlySummary();
    }

    function updateMonthlySummary() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const tbody = document.getElementById('monthlySummaryBody');
        if (!tbody) return;

        const monthlyData = {};
        transactions.forEach(t => {
            const month = t.date.substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    count: 0,
                    total: 0
                };
            }
            monthlyData[month].count++;
            monthlyData[month].total += t.amount;
        });

        const months = Object.keys(monthlyData).sort().reverse();
        let prevMonthTotal = 0;

        months.forEach((month, index) => {
            const data = monthlyData[month];
            const growth = prevMonthTotal ? ((data.total - prevMonthTotal) / prevMonthTotal * 100) : 0;
            prevMonthTotal = data.total;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${month}</td>
                <td>${data.count}</td>
                <td>₹${data.total.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                })}</td>
                <td>₹${(data.total / data.count).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                })}</td>
                <td class="${growth >= 0 ? 'text-success' : 'text-danger'}">
                    ${growth.toFixed(1)}%
                </td>
            `;
            tbody.appendChild(row);
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
        }
    }
});

// Global function to toggle user status
function toggleUserStatus(email) {
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
        users[userIndex].isActive = !users[userIndex].isActive;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Refresh the user list
        const searchTerm = document.getElementById('userSearch')?.value || '';
        loadUsers(searchTerm);
    }
}