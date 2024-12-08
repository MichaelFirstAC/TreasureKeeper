document.addEventListener('DOMContentLoaded', function() {
    // Get references to the DOM elements
    const daysContainer = document.querySelector('.days');
    const monthYearDisplay = document.querySelector('.month-year');
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');
    const currencySelect = document.getElementById('currency-select');
    let currentCurrency = localStorage.getItem('currentCurrency') || 'USD';

    // Set the initial value of the currency select
    currencySelect.value = currentCurrency;

    // Initialize the current date
    let currentDate = new Date();

    // Currency configuration
    const currencySymbols = {
        '': '',
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
            'IDR': 15898.30,
            'AUD': 1.55,
            'EUR': 0.95,
            'GBP': 0.79,
            'JPY': 154.33,
            'USD': 1
        },
        'AUD': {
            'IDR': 10275.89,
            'EUR': 0.61,
            'GBP': 0.51,
            'JPY': 99.74,
            'USD': 0.65,
            'AUD': 1
        },
        'EUR': {
            'IDR': 16819.00,
            'GBP': 0.84,
            'JPY': 162.76,
            'USD': 1.05,
            'AUD': 1.63,
            'EUR': 1
        },
        'GBP': {
            'IDR': 20061.83,
            'JPY': 194.74,
            'USD': 1.26,
            'AUD': 1.95,
            'EUR': 1.20,
            'GBP': 1
        },
        'JPY': {
            'IDR': 103.02,
            'USD': 0.0065,
            'AUD': 0.010,
            'EUR': 0.0061,
            'GBP': 0.0051,
            'JPY': 1
        },
        'IDR': {
            'IDR': 1,
            'USD': 0.000063,
            'AUD': 0.000097,
            'EUR': 0.000059,
            'GBP': 0.000050,
            'JPY': 0.0097
        }
    };

    // Format number with commas
    function formatNumber(number) {
        return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Function to convert currency based on exchange rates
    function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount; // No conversion needed
        }
        const rate = EXCHANGE_RATES[fromCurrency][toCurrency];
        return amount * rate; // Convert using exchange rate
    }

    // Function to filter transactions by date
    function filterTransactionsByDate(date) {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.datetime).toDateString();
            return transactionDate === date.toDateString();
        });

        // Update the transaction list
        const incomeList = document.getElementById('income-list');
        const expenseList = document.getElementById('expense-list');
        const surplusList = document.getElementById('surplus-list');

        if (!incomeList || !expenseList || !surplusList) {
            console.error('Transaction list elements not found');
            return;
        }

        incomeList.innerHTML = '';
        expenseList.innerHTML = '';
        surplusList.innerHTML = '';

        let totalIncome = 0;
        let totalExpense = 0;

        // Loop through the filtered transactions and display them in the appropriate list
        filteredTransactions.forEach(transaction => {
            const item = document.createElement('li');
            item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
            const transactionType = transaction.amount < 0 ? 'EXPENSE' : 'INCOME';
            const transactionTypeClass = transaction.amount < 0 ? 'expense' : 'income';
            item.innerHTML = `
                <div class="transaction-details">
                    <span class="transaction-type ${transactionTypeClass}">${transactionType}</span>
                    <span class="transaction-text">${transaction.text}</span>
                    <span class="category-tag">${transaction.category}</span>
                    <span class="transaction-amount">${currencySymbols[transaction.originalCurrency]}${formatNumber(Math.abs(transaction.amount))}</span>
                    <span class="transaction-date">${new Date(transaction.datetime).toLocaleString()}</span>
                </div>
            `;

            if (transaction.amount < 0) {
                expenseList.appendChild(item);
                totalExpense += Math.abs(convertCurrency(transaction.amount, transaction.originalCurrency, currentCurrency));
            } else {
                incomeList.appendChild(item);
                totalIncome += convertCurrency(transaction.amount, transaction.originalCurrency, currentCurrency);
            }
        });

        // Update the surplus list
        const surplusItem = document.createElement('li');
        surplusItem.classList.add('surplus-item');
        const surplusValue = totalIncome - totalExpense;
        if (surplusValue > 0) {
            surplusItem.classList.add('positive');
        } else if (surplusValue < 0) {
            surplusItem.classList.add('negative');
        } else {
            surplusItem.classList.add('zero');
        }
        surplusItem.innerHTML = `
            <div class="transaction-details">
                <span class="transaction-text">Surplus</span>
                <span class="transaction-amount">${currencySymbols[currentCurrency]}${formatNumber(surplusValue)}</span>
            </div>
        `;
        surplusList.appendChild(surplusItem);

        // Update the box class based on the surplus value
        const dateKey = date.toDateString();
        const dateClasses = JSON.parse(localStorage.getItem('dateClasses')) || {};
        if (surplusValue > 0) {
            dateClasses[dateKey] = 'greenbox';
        } else if (surplusValue < 0) {
            dateClasses[dateKey] = 'redbox';
        } else {
            delete dateClasses[dateKey];
        }
        localStorage.setItem('dateClasses', JSON.stringify(dateClasses));
    }

    // Function to update the currency display
    function updateCurrencyDisplay(selectedCurrency) {
        currentCurrency = selectedCurrency;
        localStorage.setItem('currentCurrency', currentCurrency);
        if (lastClickedDay) {
            const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(lastClickedDay.textContent));
            filterTransactionsByDate(selectedDate);
        } else {
            filterTransactionsByDate(new Date());
        }
    }

    let lastClickedDay = null;

    // Function to render the calendar
    function renderCalendar() {
        daysContainer.innerHTML = '';
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        // Display the current month and year
        monthYearDisplay.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDayOfLastMonth = new Date(year, month, 0).getDate();

        // Retrieve date classes from local storage
        const dateClasses = JSON.parse(localStorage.getItem('dateClasses')) // This takes a hashmap (key value pairs, date and box class) from the local storage

        // Fill in the days from the previous month
        for (let i = firstDayOfMonth; i > 0; i--) {
            const day = document.createElement('div');
            day.classList.add('inactive');
            day.textContent = lastDayOfLastMonth - i + 1;
            daysContainer.appendChild(day);
        }

        // Fill in the days of the current month
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const day = document.createElement('div');
            day.textContent = i;

            // Apply the appropriate class based on the dateClasses from local storage
            const dateKey = new Date(year, month, i).toDateString();
            if (dateClasses[dateKey] === 'greenbox') {
                day.classList.add('income');
            } else if (dateClasses[dateKey] === 'redbox') {
                day.classList.add('expense');
            }

            // Highlight the current day
            if (i === currentDate.getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                day.classList.add('active');
            }

            // Add click event to show transactions for the selected date
            day.addEventListener('click', () => {
                const selectedDate = new Date(year, month, i);
                filterTransactionsByDate(selectedDate);

                // Remove the 'clicked' class from the last clicked day
                if (lastClickedDay && !lastClickedDay.classList.contains('active')) {
                    lastClickedDay.classList.remove('clicked');
                }

                // Add the 'clicked' class to the currently clicked day if it's not the current date
                if (!day.classList.contains('active')) {
                    day.classList.add('clicked');
                    lastClickedDay = day;
                } else {
                    lastClickedDay = null;
                }
            });

            daysContainer.appendChild(day);
        }

        // Fill in the days of the next month
        const totalDays = daysContainer.children.length;
        const remainingDays = 42 - totalDays;

        for (let i = 1; i <= remainingDays; i++) {
            const day = document.createElement('div');
            day.classList.add('inactive');
            day.textContent = i;
            daysContainer.appendChild(day);
        }
    }

    // Show transactions for the current date on initial load
    filterTransactionsByDate(new Date());

    // Event listener for previous month button
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    // Event listener for next month button
    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Event listener for currency select change
    currencySelect.addEventListener('change', (e) => {
        updateCurrencyDisplay(e.target.value);
    });

    // Initial render of the calendar
    renderCalendar();
});