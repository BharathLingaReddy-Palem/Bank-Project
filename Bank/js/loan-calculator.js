function initLoanCalculator() {
    const calculator = document.getElementById('loan-calculator');
    if (!calculator) return;

    const amount = document.getElementById('loan-amount');
    const interest = document.getElementById('interest-rate');
    const tenure = document.getElementById('loan-tenure');
    const result = document.getElementById('emi-result');
    const calculateBtn = document.getElementById('calculate-btn');

    calculateBtn.addEventListener('click', () => {
        const principal = parseFloat(amount.value);
        const rate = parseFloat(interest.value) / 12 / 100; // Monthly interest rate
        const time = parseFloat(tenure.value) * 12; // Convert years to months

        if (isNaN(principal) || isNaN(rate) || isNaN(time)) {
            result.innerHTML = 'Please enter valid values';
            return;
        }

        // EMI calculation formula
        const emi = principal * rate * Math.pow(1 + rate, time) / (Math.pow(1 + rate, time) - 1);
        const totalAmount = emi * time;
        const totalInterest = totalAmount - principal;

        result.innerHTML = `
            <div class="mb-2">Monthly EMI: $${emi.toFixed(2)}</div>
            <div class="mb-2">Total Amount: $${totalAmount.toFixed(2)}</div>
            <div>Total Interest: $${totalInterest.toFixed(2)}</div>
        `;
    });
}
