document.addEventListener("DOMContentLoaded", showStatistics);

function showStatistics() {
    const transactions = getTransactionsFromLocalStorage();
    updateStatistics(transactions);
    drawPieChart(transactions);
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
    new Chart(incomeCtx, {
        type: 'pie',
        data: {
            labels: incomeLabels,
            datasets: [{
                label: 'Income Categories',
                data: incomeData,
                backgroundColor: ['#4CAF50', '#81C784', '#A5D6A7'], // Different shades of green
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Income Distribution by Category'
                }
            }
        }
    });

    // Expense Pie Chart
    new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: expenseLabels,
            datasets: [{
                label: 'Expense Categories',
                data: expenseData,
                backgroundColor: ['#d32f2f', '#ef5350', '#e57373'], // Different shades of red
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Expense Distribution by Category'
                }
            }
        }
    });
}