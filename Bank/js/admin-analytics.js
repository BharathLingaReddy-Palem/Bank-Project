function initAdminAnalytics() {
    // Transaction Analytics Chart
    const transactionCtx = document.getElementById('transactionChart');
    if (!transactionCtx) return;

    new Chart(transactionCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Deposits',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#4CAF50',
                tension: 0.1
            }, {
                label: 'Withdrawals',
                data: [8000, 15000, 12000, 20000, 18000, 25000],
                borderColor: '#f44336',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Transaction Trends'
                }
            }
        }
    });

    // User Growth Chart
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) return;

    // Get all users
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Group users by registration month
    const usersByMonth = {};
    users.forEach(user => {
        const date = new Date(user.registrationDate || user.date || new Date());
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        usersByMonth[monthYear] = (usersByMonth[monthYear] || 0) + 1;
    });

    // Get last 6 months
    const months = [];
    const userCounts = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        months.push(monthName);
        userCounts.push(usersByMonth[monthYear] || 0);
    }

    // Calculate cumulative growth
    const cumulativeGrowth = [];
    let total = 0;
    userCounts.forEach(count => {
        total += count;
        cumulativeGrowth.push(total);
    });

    // Create or update chart
    if (window.userGrowthChart) {
        window.userGrowthChart.destroy();
    }

    window.userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Total Users',
                data: cumulativeGrowth,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'User Growth Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Users'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    });
}

function initQuickActions() {
    const actionButtons = document.querySelectorAll('.quick-action');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            switch(action) {
                case 'export':
                    exportUserData();
                    break;
                case 'notify':
                    sendNotification();
                    break;
                case 'report':
                    generateReport();
                    break;
            }
        });
    });
}

function exportUserData() {
    // Demo function - in production, this would connect to a backend
    alert('Exporting user data...');
}

function sendNotification() {
    const message = prompt('Enter notification message:');
    if (message) {
        alert('Notification sent to all users!');
    }
}

function generateReport() {
    alert('Generating monthly report...');
}

// Initialize real-time monitoring
function initRealTimeMonitoring() {
    const container = document.getElementById('real-time-alerts');
    if (!container) return;

    // Demo alerts - in production, these would come from a backend
    const demoAlerts = [
        { type: 'success', message: 'New user registration: John Doe' },
        { type: 'warning', message: 'Large transaction detected: $50,000' },
        { type: 'danger', message: 'Failed login attempt: user123' }
    ];

    demoAlerts.forEach(alert => {
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${alert.type} alert-dismissible fade show`;
        alertEl.innerHTML = `
            ${alert.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.prepend(alertEl);
    });
}
