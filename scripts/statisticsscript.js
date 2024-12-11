// Get transactions from local storage and update the statistics and pie chart
document.addEventListener("DOMContentLoaded", () => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
        document.getElementById('currency').value = savedCurrency;
    }
    showStatistics();
    document.getElementById('currency').addEventListener('change', () => {
        const selectedCurrency = document.getElementById('currency').value;
        localStorage.setItem('selectedCurrency', selectedCurrency);
        showStatistics();
    });

    // Toggle dropdown content
    document.querySelector('.dropbtn').addEventListener('click', function(event) {
        event.stopPropagation();
        document.querySelector('.dropdown-content').classList.toggle('show');
    });

    // Close dropdown content when clicking outside
    document.addEventListener('click', function() {
        document.querySelector('.dropdown-content').classList.remove('show');
    });
});

// Update statistics and pie chart when the currency is changed
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
    updateStatistics(transactions, selectedCurrency); // Use original transactions
    drawPieChart(transactions, selectedCurrency); // Use original transactions
}

// Show statistics
function getCurrentMonth() {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Get transactions from local storage
function getTransactionsFromLocalStorage() {
    const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
    return localStorageTransactions !== null ? localStorageTransactions : [];
}

// Convert currency
function saveTransactionsToLocalStorage(transactions, month) {
    const localStorageTransactions = JSON.parse(localStorage.getItem('transactions')) || {};
    localStorageTransactions[month] = transactions;
    localStorage.setItem('transactions', JSON.stringify(localStorageTransactions));
}

// Format number with commas as thousand separators
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update statistics
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

    const incomeClass = totalIncome >= 0 ? 'positive' : 'negative';
    const surplusClass = surplus >= 0 ? 'positive' : 'negative';

    const statisticsContainer = document.getElementById('statistics-container');
    statisticsContainer.innerHTML = `
        <div id="income-statistics">
            <h3>Income Statistics</h3>
            <p class="${incomeClass}">Total Income: ${currencySymbols[currency]}${formatNumberWithCommas(totalIncome)}</p>
        </div>
        <div id="expense-statistics">
            <h3>Expense Statistics</h3>
            <p>Total Expenses: ${currencySymbols[currency]}${formatNumberWithCommas(totalExpenses)}</p>
        </div>
        <div id="surplus-statistics">
            <h3>Surplus</h3>
            <p class="${surplusClass}">Surplus: ${currencySymbols[currency]}${formatNumberWithCommas(surplus)}</p>
        </div>
    `;
}

// Draw pie chart for income and expenses
function drawPieChart(transactions, currency) {
    const incomeCategories = {};
    const expenseCategories = {};
    
    // Define colors for income and expenses
    const incomeColors = [
        '#4CAF50', '#81C784', '#A5D6A7', '#66BB6A', '#388E3C', 
        '#2196F3', '#64B5F6', '#BBDEFB', '#1976D2', '#0D47A1', 
        '#8E24AA', '#BA68C8', '#E1BEE7', '#7B1FA2', '#4A148C'
    ]; // Green, Blue, Violet shades for income
    const expenseColors = [
        '#d32f2f', '#ef5350', '#e57373', '#f44336', '#e53935', 
        '#FF9800', '#FFB74D', '#FFCC80', '#FB8C00', '#F57C00',
        '#FFEB3B', '#FFF176', '#FFF59D', '#FFEE58', '#FFEB3B', 
    ]; // Red, Yellow, Orange shades for expenses

    // Calculate the total income and expenses for each category
    transactions.forEach(transaction => {
        const convertedAmount = convertCurrency(transaction.amount, transaction.currency, currency);
        if (transaction.amount > 0) {
            incomeCategories[transaction.category] = (incomeCategories[transaction.category] || 0) + convertedAmount;
        } else {
            expenseCategories[transaction.category] = (expenseCategories[transaction.category] || 0) + Math.abs(convertedAmount);
        }
    });

    // Get labels and data for income and expenses pie charts
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
    drawLegend(incomeLabels, 'income-legend', incomeColors, incomeData);

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
    drawLegend(expenseLabels, 'expense-legend', expenseColors, expenseData);
}

// Draw legend for pie chart
function drawLegend(labels, legendId, colors, data) {
    const legendContainer = document.getElementById(legendId);
    legendContainer.innerHTML = '';

    const total = data.reduce((acc, value) => acc + value, 0); // Calculate total

    labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        const percentage = ((data[index] / total) * 100).toFixed(2); // Calculate percentage

        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${colors[index]};"></div>
            <span>${label}: <span class="percentage">${formatNumberWithCommas(percentage)}%</span></span>
        `;
        legendContainer.appendChild(legendItem);
    });
}

// Convert currency
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
