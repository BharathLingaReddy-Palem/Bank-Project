async function initCurrencyConverter() {
    const converter = document.getElementById('currency-converter');
    if (!converter) return;

    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const amount = document.getElementById('amount');
    const result = document.getElementById('conversion-result');
    const convertBtn = document.getElementById('convert-btn');

    // Sample exchange rates (in production, you'd fetch from an API)
    const rates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.25,
        INR: 74.5
    };

    convertBtn.addEventListener('click', () => {
        const from = fromCurrency.value;
        const to = toCurrency.value;
        const amt = parseFloat(amount.value);

        if (isNaN(amt)) {
            result.textContent = 'Please enter a valid amount';
            return;
        }

        const converted = (amt / rates[from]) * rates[to];
        result.textContent = `${amt} ${from} = ${converted.toFixed(2)} ${to}`;
    });
}
