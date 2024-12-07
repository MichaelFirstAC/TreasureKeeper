document.addEventListener("DOMContentLoaded", () => {
    showStatistics();
    document.getElementById('currency').addEventListener('change', showStatistics);
});

function showStatistics() {
    const transactions = getTransactionsFromLocalStorage();
    const selectedCurrency = document.getElementById('currency').value;

    // Get the last transaction month from local storage
    const lastTransactionMonth = localStorage.getItem('lastTransactionMonth');
    const currentMonth = new Date().getMonth();

    // Check if the month has changed
    if (lastTransactionMonth !== null && lastTransactionMonth != currentMonth) {
        // Reset transactions if the month has changed
        localStorage.removeItem('transactions'); // Clear transactions
        localStorage.setItem('lastTransactionMonth', currentMonth); // Update the stored month
    }

    // Get updated transactions after reset
    const updatedTransactions = getTransactionsFromLocalStorage();
    updateStatistics(updatedTransactions, selectedCurrency);
    drawPieChart(updatedTransactions, selectedCurrency);
}

function getCurrentMonth() {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

function getTransactionsFromLocalStorage() {
    const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
    return localStorageTransactions !== null ? localStorageTransactions : [];
}

function saveTransactionsToLocalStorage(transactions, month) {
    const localStorageTransactions = JSON.parse(localStorage.getItem('transactions')) || {};
    localStorageTransactions[month] = transactions;
    localStorage.setItem('transactions', JSON.stringify(localStorageTransactions));
}

function updateStatistics(transactions, currency) {
    const totalIncome = transactions
        .filter(transaction => transaction.amount > 0)
        .reduce((acc, transaction) => acc + convertCurrency(transaction.amount, transaction.currency, currency), 0)
        .toFixed(2);

    const totalExpenses = transactions
        .filter(transaction => transaction.amount < 0)
        .reduce((acc, transaction) => acc + Math.abs(convertCurrency(transaction.amount, transaction.currency, currency)), 0)
        .toFixed(2);

    const surplus = (totalIncome - totalExpenses).toFixed(2);

    const statisticsContainer = document.getElementById('statistics-container');
    statisticsContainer.innerHTML = `
        <div id="income-statistics">
            <h3>Income Statistics</h3>
            <p>Total Income: ${currencySymbols[currency]}${totalIncome}</p>
        </div>
        <div id="expense-statistics">
            <h3>Expense Statistics</h3>
            <p>Total Expenses: ${currencySymbols[currency]}${totalExpenses}</p>
        </div>
        <div id="surplus-statistics">
            <h3>Surplus</h3>
            <p>Surplus: ${currencySymbols[currency]}${surplus}</p>
        </div>
    `;
}

function drawPieChart(transactions, currency) {
    const incomeCategories = {};
    const expenseCategories = {};
    
    // Define colors for income and expenses
    const incomeColors = ['#4CAF50', '#81C784', '#A5D6A7']; // Green shades for income
    const expenseColors = ['#d32f2f', '#ef5350', '#e57373']; // Red shades for expenses

    transactions.forEach(transaction => {
        const convertedAmount = convertCurrency(transaction.amount, transaction.currency, currency);
        if (transaction.amount > 0) {
            incomeCategories[transaction.category] = (incomeCategories[transaction.category] || 0) + convertedAmount;
        } else {
            expenseCategories[transaction.category] = (expenseCategories[transaction.category] || 0) + Math.abs(convertedAmount);
        }
    });

    const incomeLabels = Object.keys(incomeCategories);
    const incomeData = Object.values(incomeCategories);
    const expenseLabels = Object.keys(expenseCategories);
    const expenseData = Object.values(expenseCategories);

    const incomeCtx = document.getElementById('income-pie-chart').getContext('2d');
    const expenseCtx = document.getElementById('expense-pie-chart').getContext('2d');

    // Clear the previous charts if they exist
    if (incomeCtx.chart) {
        incomeCtx.chart.destroy();
    }
    if (expenseCtx.chart) {
        expenseCtx.chart.destroy();
    }

    // Income Pie Chart
    const incomeChart = new Chart(incomeCtx, {
        type: 'pie',
        data: {
            labels: incomeLabels,
            datasets: [{
                label: 'Income',
                data: incomeData,
                backgroundColor: incomeColors, // Use defined colors for income
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false // Disable default legend
                },
                title: {
                    display: true,
                    text: 'Income Distribution by Category'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label;
                        }
                    }
                }
            }
        }
    });

    // Draw Income Legend
    drawLegend(incomeLabels, 'income-legend', incomeColors);

    // Expense Pie Chart
    const expenseChart = new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: expenseLabels,
            datasets: [{
                label: 'Expense',
                data: expenseData,
                backgroundColor: expenseColors, // Use defined colors for expenses
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false // Disable default legend
                },
                title: {
                    display: true,
                    text: 'Expense Distribution by Category'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label;
                        }
                    }
                }
            }
        }
    });

    // Draw Expense Legend
    drawLegend(expenseLabels, 'expense-legend', expenseColors);
}

function drawLegend(labels, legendId, colors) {
    const legendContainer = document.getElementById(legendId);
    legendContainer.innerHTML = '';
    labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${colors[index]};"></div>
            <span>${label}</span>
        `;
        legendContainer.appendChild(legendItem);
    });
}

function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    const rate = EXCHANGE_RATES[fromCurrency][toCurrency];
    return amount * rate;
}

// Currency configuration
const DEFAULT_CURRENCY = '';
const currencySymbols = {
    '':'',
    'USD': '$',
    'AUD': 'A$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'IDR': 'Rp',
};

// Define constant exchange rates
const EXCHANGE_RATES = {
    'USD': {
        'IDR': 15898.30, 'AUD': 1.55, 'EUR': 0.95, 'GBP': 0.79, 'JPY': 154.33, 'USD': 1
    },
    'AUD': {
        'IDR': 10275.89, 'EUR': 0.61, 'GBP': 0.51, 'JPY': 99.74, 'USD': 0.65, 'AUD': 1
    },
    'EUR': {
        'IDR': 16819.00, 'GBP': 0.84, 'JPY': 162.76, 'USD': 1.05, 'AUD': 1.63, 'EUR': 1
    },
    'GBP': {
        'IDR': 20061.83, 'JPY': 194.74, 'USD': 1.26, 'AUD': 1.95, 'EUR': 1.20, 'GBP': 1
    },
    'JPY': {
        'IDR': 103.02, 'USD': 0.0065, 'AUD': 0.010, 'EUR': 0.0061, 'GBP': 0.0051, 'JPY': 1
    },
    'IDR': {
        'IDR': 1, 'USD': 0.000063, 'AUD': 0.000097, 'EUR': 0.000059, 'GBP': 0.000050, 'JPY': 0.0097
    }
};