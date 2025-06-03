function initBudgetTracker() {
    const budgetChart = document.getElementById('budgetChart');
    if (!budgetChart) return;

    // Get current user's data from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;

    // Get user's monthly income
    const monthlyIncome = parseFloat(localStorage.getItem(`${currentUser.email}_monthlyIncome`)) || 0;

    // Get all transactions for the current user
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const userTransactions = transactions.filter(t => 
        t.fromEmail === currentUser.email || t.toEmail === currentUser.email
    );

    // Calculate monthly expenses (sent amounts)
    const expenses = userTransactions
        .filter(t => t.fromEmail === currentUser.email)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Calculate savings
    const savings = monthlyIncome - expenses;

    // Update the UI with actual values
    document.getElementById('totalIncome').textContent = `₹${monthlyIncome.toLocaleString('en-IN')}`;
    document.getElementById('totalExpenses').textContent = `₹${expenses.toLocaleString('en-IN')}`;
    document.getElementById('totalSavings').textContent = `₹${savings.toLocaleString('en-IN')}`;

    // Group expenses by category
    const expensesByCategory = {
        'Transfer': 0,
        'Bills': 0,
        'Shopping': 0,
        'Food': 0,
        'Others': 0
    };

    userTransactions
        .filter(t => t.fromEmail === currentUser.email)
        .forEach(t => {
            const category = t.category || 'Others';
            expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(t.amount);
        });

    // Destroy existing chart if it exists
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

    // Create the expense breakdown chart
    window.expenseChart = new Chart(budgetChart, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expensesByCategory),
            datasets: [{
                data: Object.values(expensesByCategory),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expense Breakdown'
                }
            }
        }
    });
}

function editIncome() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;

    const currentIncome = parseFloat(localStorage.getItem(`${currentUser.email}_monthlyIncome`)) || 0;
    const newIncome = prompt('Enter your monthly income:', currentIncome);

    if (newIncome !== null) {
        const income = parseFloat(newIncome);
        if (!isNaN(income) && income >= 0) {
            localStorage.setItem(`${currentUser.email}_monthlyIncome`, income);
            initBudgetTracker();
            initSavingsGoal();
        } else {
            alert('Please enter a valid amount');
        }
    }
}

function initSavingsGoal() {
    const goalProgress = document.getElementById('savingsGoalProgress');
    if (!goalProgress) return;

    // Get current user's data
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;

    // Get or set savings goal from localStorage
    let savingsGoal = parseFloat(localStorage.getItem(`${currentUser.email}_savingsGoal`)) || 100000;
    
    // Get monthly income
    const monthlyIncome = parseFloat(localStorage.getItem(`${currentUser.email}_monthlyIncome`)) || 0;
    
    // Calculate current savings from expenses
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const expenses = transactions
        .filter(t => t.fromEmail === currentUser.email)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const currentSavings = monthlyIncome - expenses;

    // Update progress bar
    const percentage = Math.min((currentSavings / savingsGoal) * 100, 100);
    goalProgress.style.width = `${percentage}%`;
    goalProgress.textContent = `${percentage.toFixed(1)}%`;
    
    document.getElementById('currentSavings').textContent = `₹${currentSavings.toLocaleString('en-IN')}`;
    document.getElementById('savingsGoal').textContent = `₹${savingsGoal.toLocaleString('en-IN')}`;
}

function resetBudget() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;

    if (confirm('Are you sure you want to reset your budget? This will clear all your expenses.')) {
        // Get all transactions
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        // Remove all expense transactions for this user
        const newTransactions = transactions.filter(t => 
            !(t.fromEmail === currentUser.email && t.toEmail === 'expense@bank.com')
        );
        
        // Save filtered transactions
        localStorage.setItem('transactions', JSON.stringify(newTransactions));
        
        // Reset monthly income
        localStorage.setItem(`${currentUser.email}_monthlyIncome`, '0');
        
        // Update UI
        initBudgetTracker();
        initSavingsGoal();
        
        alert('Budget has been reset successfully!');
    }
}

function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!category || !amount || isNaN(amount)) {
        alert('Please fill in all fields with valid values');
        return;
    }

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    // Create new transaction
    const transaction = {
        fromEmail: currentUser.email,
        toEmail: 'expense@bank.com', // Dummy recipient for expenses
        amount: amount,
        date: new Date().toISOString(),
        category: category
    };

    // Add to transactions
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Update UI
    alert(`Expense added: ${category} - ₹${amount.toLocaleString('en-IN')}`);
    document.getElementById('expenseForm').reset();
    
    // Refresh charts and summaries
    initBudgetTracker();
    initSavingsGoal();
}
