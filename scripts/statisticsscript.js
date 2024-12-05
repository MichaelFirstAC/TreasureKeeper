document.addEventListener("DOMContentLoaded", showStatistics);


function showStatistics() {
    const transactions = getTransactionsFromLocalStorage();

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
    updateStatistics(updatedTransactions);
    drawPieChart(updatedTransactions);
}

function getTransactionsFromLocalStorage() {
    const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
    return localStorageTransactions !== null ? localStorageTransactions : [];
}

function updateStatistics(transactions) {
    const totalIncome = transactions
        .filter(transaction => transaction.amount > 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0)
        .toFixed(2);

    const totalExpenses = transactions
        .filter(transaction => transaction.amount < 0)
        .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0)
        .toFixed(2);

    const surplus = (totalIncome - totalExpenses).toFixed(2);

    const statisticsContainer = document.getElementById('statistics-container');
    statisticsContainer.innerHTML = `
        <div id="income-statistics">
            <h3>Income Statistics</h3>
            <p>Total Income: $${totalIncome}</p>
        </div>
        <div id="expense-statistics">
            <h3>Expense Statistics</h3>
            <p>Total Expenses: $${totalExpenses}</p>
        </div>
        <div id="surplus-statistics">
            <h3>Surplus</h3>
            <p>Surplus: $${surplus}</p>
        </div>
    `;
}

function drawPieChart(transactions) {
    const incomeCategories = {};
    const expenseCategories = {};
    
    // Define colors for income and expenses
    const incomeColors = ['#4CAF50', '#81C784', '#A5D6A7']; // Green shades for income
    const expenseColors = ['#d32f2f', '#ef5350', '#e57373']; // Red shades for expenses

    transactions.forEach(transaction => {
        if (transaction.amount > 0) {
            incomeCategories[transaction.category] = (incomeCategories[transaction.category] || 0) + transaction.amount;
        } else {
            expenseCategories[transaction.category] = (expenseCategories[transaction.category] || 0) + Math.abs(transaction.amount);
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
                }
            }
        }
    });

    // Draw Income Legend
    drawLegend(incomeLabels, incomeData, 'income-legend', incomeColors);

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
                }
            }
        }
    });

    // Draw Expense Legend
    drawLegend(expenseLabels, expenseData, 'expense-legend', expenseColors);
}

function drawLegend(labels, data, legendId, colors) {
    const legendContainer = document.getElementById(legendId);
    legendContainer.innerHTML = ''; // Clear previous legends

    labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <span class="legend-color" style="background-color: ${colors[index % colors.length]};"></span>
            ${label}: ${data[index].toFixed(2)}
        `;
        legendContainer.appendChild(legendItem);
    });
}