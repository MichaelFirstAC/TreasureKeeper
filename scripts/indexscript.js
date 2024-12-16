// DOM Elements
const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const type = document.getElementById('type');
const category = document.getElementById('category');
const currencySelect = document.getElementById('currency-select');
const datetime = document.getElementById('datetime');

// Function to set default datetime value to current time
function setDefaultDateTime() {
    const now = new Date(); // Get current date and time
    const year = now.getFullYear(); // Get current year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Get current month (01-12)
    const day = String(now.getDate()).padStart(2, '0'); // Get current day (01-31)
    const hours = String(now.getHours()).padStart(2, '0'); // Get current hours (00-23)
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Get current minutes (00-59)
    
    // Set datetime value to current time
    datetime.value = `${year}-${month}-${day}T${hours}:${minutes}`; // Format: YYYY-MM-DDTHH:MM
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
        'IDR': 15898.30, // 1 USD = 15898.30 IDR
        'AUD': 1.55, // 1 USD = 1.55 AUD
        'EUR': 0.95, // 1 USD = 0.95 EUR
        'GBP': 0.79, // 1 USD = 0.79 GBP
        'JPY': 154.33, // 1 USD = 154.33 JPY
        'USD': 1 // 1 USD = 1 USD
    },
    'AUD': {
        'IDR': 10275.89, // 1 AUD = 10275.89 IDR
        'EUR': 0.61, // 1 AUD = 0.61 EUR
        'GBP': 0.51, // 1 AUD = 0.51 GBP
        'JPY': 99.74, // 1 AUD = 0.010 AUD
        'USD': 0.65, // 1 AUD = 0.65 USD
        'AUD': 1 // 1 AUD = 1 AUD
    },
    'EUR': {
        'IDR': 16819.00, // 1 EUR = 16819.00 IDR
        'GBP': 0.84, // 1 EUR = 0.84 GBP
        'JPY': 162.76, // 1 EUR = 162.76 JPY
        'USD': 1.05, // 1 EUR = 1.05 USD
        'AUD': 1.63, // 1 EUR = 1.63 AUD
        'EUR': 1 // 1 EUR = 1 EUR
    },
    'GBP': {
        'IDR': 20061.83, // 1 EUR = 20061.83 IDR
        'JPY': 194.74,  // 1 GBP = 194.74 JPY
        'USD': 1.26, // 1 EUR = 1.26 USD
        'AUD': 1.95, // 1 EUR = 1.95 AUD
        'EUR': 1.20, // 1 EUR = 1.20 GBP
        'GBP': 1 // 1 GBP = 1 GBP
    },
    'JPY': {
        'IDR': 103.02, // 1 JPY = 103.02 IDR
        'USD': 0.0065, // 1 JPY = 0.0065 USD
        'AUD': 0.010, // 1 JPY = 0.010 AUD
        'EUR': 0.0061, // 1 JPY = 0.0061 EUR
        'GBP': 0.0051, // 1 JPY = 0.0051 GBP
        'JPY': 1   // 1 JPY = 1 JPY
    },
    'IDR': {
        'IDR': 1,   // 1 IDR = 1 IDR
        'USD': 0.000063, // 1 IDR = 0.000063 USD
        'AUD': 0.000097, // 1 IDR = 0.000097 AUD
        'EUR': 0.000059, // 1 IDR = 0.000059 EUR
        'GBP': 0.000050, // 1 IDR = 0.000050 GBP
        'JPY': 0.0097 // 1 IDR = 0.0097 JPY
    }
};

// Get transactions from localStorage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions')); // Get transactions from localStorage
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : []; // Transaction
let currentCurrency = localStorage.getItem('currentCurrency') || DEFAULT_CURRENCY; // Get current currency from localStorage or set to default

// If you want to check if currentCurrency is empty and set it to a default
if (!currentCurrency) {
    currencySelect.value = ''; // This will show "Select a currency"
} else {
    currencySelect.value = currentCurrency; // This will set it to the stored currency
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// Format number with commas
function formatNumber(number) {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); // REGULAR EXPRESSION CHANGE TO DFA
}

// Function to edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        document.getElementById('edit-id').value = transaction.id; // Set the ID for editing
        document.getElementById('text').value = transaction.text; // Set the text for editing
        document.getElementById('category').value = transaction.category; // Set the category for editing
        
        // Display the exact same number with the same formatting in the amount bar
        const formattedAmount = formatNumber(Math.abs(transaction.amount));
        document.getElementById('amount').value = formattedAmount; // Set the amount for editing
        
        document.getElementById('type').value = transaction.amount < 0 ? 'expense' : 'income'; // Set the type for editing
        
        // Correct formatting of the date and time, for editing the value
        const date = new Date(transaction.datetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        document.getElementById('datetime').value = `${year}-${month}-${day}T${hours}:${minutes}`; // Set the datetime for editing
    }
}

// Constants for red and green box classes NEW ADDITION TO THE INDEX JS
const RED_BOX_CLASS = 'redbox';
const GREEN_BOX_CLASS = 'greenbox';

// Function to add or update a transaction
function addTransaction(e) { // Add or update a transaction
    e.preventDefault(); // Prevent the form from submitting

    const editId = document.getElementById('edit-id').value; // Get the ID for editing

    // Check if required fields are filled (amount and category only)
    if (amount.value.trim() === '' || category.value.trim() === '') {
        alert('Please add a category and amount');
        return;
    }
    
    // Store the current month in local storage
    const currentMonth = new Date().getMonth(); // Get the current month
    localStorage.setItem('lastTransactionMonth', currentMonth); // Store the current month

    // Get the transaction date
    const transactionDate = datetime.value ? new Date(datetime.value) : new Date();
    
    // Parse the amount value as a number
    const parsedAmount = parseFloat(amount.value.replace(/,/g, ''));

    // Check if the transaction is already in the database
    const transaction = {
        id: editId ? parseInt(editId) : generateID(),
        text: text.value, 
        category: category.value, 
        amount: type.value === 'income' ? parsedAmount : -parsedAmount,
        currency: currentCurrency, // Keep the current currency
        originalCurrency: currentCurrency, // Store original currency
        datetime: transactionDate.toISOString()
    };

    // Update the transaction in the transactions array
    if (editId) {
        transactions = transactions.map(t => (t.id === transaction.id ? transaction : t));
    } else {
        transactions.push(transaction);
    }

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();

    // Reset form
    text.value = '';
    amount.value = '';
    category.value = '';
    type.value = 'income';
    datetime.value = '';
    document.getElementById('edit-id').value = ''; // Reset edit ID

    assignBoxClassesForDates(); // Update box classes for dates
    
    init(); // This will sort and display the transactions

    // Refresh the website
    window.location.reload();
}

// Format date function
function formatDateTime(dateString) {
const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
};
return new Date(dateString).toLocaleString(undefined, options);
}

let isSelecting = false; // Flag to indicate if selection mode is active

// Function to add transaction to DOM
function addTransactionDOM(transaction) {
    const item = document.createElement("li");

    item.classList.add(transaction.amount < 0 ? "minus" : "plus");

    item.innerHTML = `
        <button class="delete-btn" onclick="showDeleteSelectModal(${transaction.id})"></button>
        <button class="edit-btn" onclick="editTransaction(${transaction.id})"></button>
        <div class="transaction-details">
            <span class="transaction-text">${transaction.text}</span>
            <span class="category-tag">${transaction.category}</span>
            <span class="transaction-amount">${currencySymbols[transaction.originalCurrency]}${formatNumber(Math.abs(transaction.amount))}</span>
            <span class="transaction-date">${formatDateTime(transaction.datetime)}</span>
        </div>
    `;

    item.addEventListener('click', () => {
        if (isSelecting) {
            toggleSelectTransaction(transaction.id);
        }
    });

    list.appendChild(item);
}

// Function to show delete/select modal
function showDeleteSelectModal(id) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <br><p>What would you like to do with this transaction?</p><br>
            <button class="delete-btn-modal" onclick="confirmDeleteTransaction(${id})">Delete this transaction</button>
            <button class="select-btn-modal" onclick="toggleSelectTransaction(${id}); closeModal()">Select transaction to delete</button>
            <button class="cancel-btn-modal" onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Function to close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Function to confirm delete transaction (singular)
function confirmDeleteTransaction(id) {
    const isConfirmed = confirm("Are you sure to delete this transaction? You will not be able to retrieve the data back!");
    if (isConfirmed) {
        removeTransaction(id);
    }
}

// Function to confirm delete selected transactions (plural)
function confirmDeleteSelectedTransactions() {
    const isConfirmed = confirm("Are you sure to delete these transactions? You will not be able to retrieve the data back!");
    if (isConfirmed) {
        deleteSelectedTransactions();
    }
}

// Function to toggle selection of a transaction
function toggleSelectTransaction(id) {
    // Show full list of transactions when entering select mode only if "Show All Transactions" button does not exist
    if (!isSelecting && !document.getElementById('show-all-btn')) {
        transactionsToShow = transactions.length; // Set the number of transactions to show to the total number of transactions
        list.innerHTML = ""; // Clear the current transaction list
        transactions.forEach(addTransactionDOM); // Add all transactions to the DOM
        updateValues(); // Update balance, income, and expense

        // Hide the "Show More" button
        document.getElementById('show-more-btn').style.display = 'none';
        // Show the "Show Less" button
        document.getElementById('show-less-btn').style.display = 'none';
        // Hide the "Show Full List" button
        document.getElementById('show-full-list-btn').style.display = 'none';
    }

    const transactionElement = document.querySelector(`li button.delete-btn[onclick="showDeleteSelectModal(${id})"]`).parentElement;
    const isSelected = transactionElement.classList.contains('selected');

    // Prevent deselecting the only one remaining selected item
    if (isSelected && document.querySelectorAll('.list li.selected').length === 1) {
        return;
    }

    transactionElement.classList.toggle('selected');
    isSelecting = true; // Enable selection mode
    document.getElementById('selection-buttons').style.display = 'flex'; // Show the selection buttons

    // Hide delete buttons when there is at least one selected transaction
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.style.display = 'none';
    });

    // Hide calendar and filter button when in select mode
    document.getElementById('filter-date').style.display = 'none';
    document.getElementById('filter-btn').style.display = 'none';

    // Check if no transactions are selected
    const selectedTransactions = document.querySelectorAll('.list li.selected');
    if (selectedTransactions.length === 0) {
        exitSelectionMode();
    } else {
        // Remove the "Show All Transactions" button if one transaction is selected
        const showAllBtn = document.getElementById('show-all-btn');
        if (showAllBtn) {
            showAllBtn.remove();
        }
    }

    // Hide the "Select All" button if all transactions are selected
    const transactionItems = document.querySelectorAll('.list li');
    if (Array.from(transactionItems).every(item => item.classList.contains('selected'))) {
        document.getElementById('select-all-btn').style.display = 'none';
    } else {
        document.getElementById('select-all-btn').style.display = 'flex';
    }
}

// Function to delete selected transactions
function deleteSelectedTransactions() {
    const selectedTransactions = document.querySelectorAll('.list li.selected');
    selectedTransactions.forEach(transactionElement => {
        const id = parseInt(transactionElement.querySelector('.delete-btn').getAttribute('onclick').match(/\d+/)[0]);
        transactions = transactions.filter(transaction => transaction.id !== id);
    });
    updateLocalStorage();
    window.location.reload();
}

// Function to cancel selection process
function cancelSelection() {
    const selectedTransactions = document.querySelectorAll('.list li.selected');
    selectedTransactions.forEach(transactionElement => {
        transactionElement.classList.remove('selected');
    });
    exitSelectionMode();

    // Bring back the "Show All Transactions" button if there is a value in the calendar date
    const filterDate = document.getElementById('filter-date').value;
    if (filterDate) {
        list.innerHTML += `<button id="show-all-btn" class="show-all-btn-class">Show All Dates</button>`;
        document.getElementById('show-all-btn').addEventListener('click', () => {
            window.location.reload(); // Refresh the page when the Show All Transaction button is pressed
        });
    }

    // Call filterTransactionsByDate with the same date
    if (filterDate) {
        filterTransactionsByDate(filterDate);
    }
    if (!document.getElementById('show-all-btn')) {
        window.location.reload(); // Refresh the page after canceling selection if "Show All Transactions" button is hidden
    }
}

// Function to exit selection mode
function exitSelectionMode() {
    isSelecting = false; // Disable selection mode
    document.getElementById('selection-buttons').style.display = 'none'; // Hide the selection buttons

    // Show delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.style.display = 'flex';
    });

    // Show calendar and filter button when exiting select mode
    document.getElementById('filter-date').style.display = 'flex';
    document.getElementById('filter-btn').style.display = 'flex';
}

// Event listener for "Delete Selected" button
document.getElementById('delete-selection-btn').addEventListener('click', confirmDeleteSelectedTransactions);

// Event listener for "Cancel Selection" button
document.getElementById('cancel-selection-btn').addEventListener('click', cancelSelection);

// Function to filter transactions by selected date
function filterTransactionsByDate(selectedDate) {
    const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.datetime).toDateString();
        return transactionDate === new Date(selectedDate).toDateString();
    });

    // Clear the current transaction list
    list.innerHTML = "";

    // Add filtered transactions to the DOM
    filteredTransactions.forEach(addTransactionDOM);

    // Add "Show All Transactions" button
    list.innerHTML += `<button id="show-all-btn" class="show-all-btn-class">Show All Dates</button>`;
    document.getElementById('show-all-btn').addEventListener('click', () => {
        window.location.reload(); // Refresh the page when the Show All Transaction button is pressed
    });

    // Hide the "Show More", "Show Less", and "Show Full List" buttons
    document.getElementById('show-more-btn').style.display = 'none';
    document.getElementById('show-less-btn').style.display = 'none';
    document.getElementById('show-full-list-btn').style.display = 'none';

    // Add event listeners for selection mode
    const transactionItems = document.querySelectorAll('.list li');
    transactionItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isSelecting) {
                toggleSelectTransaction(parseInt(item.querySelector('.delete-btn').getAttribute('onclick').match(/\d+/)[0]));
            }
        });
    });
}

// Event listener for filter button
document.getElementById('filter-btn').addEventListener('click', () => {
    const selectedDate = document.getElementById('filter-date').value;
    if (selectedDate) {
        filterTransactionsByDate(selectedDate);
    } else {
        // If no date is selected, show all transactions
        init();
    }
});

// Update balance, income and expense
function updateValues() {
    const amounts = transactions.map(transaction => {
        // Convert only for balance, income, and expense calculations
        return convertCurrency(transaction.amount, transaction.originalCurrency, currentCurrency);
    });

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (
        amounts.filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    balance.innerHTML = `${currencySymbols[currentCurrency]}${formatNumber(parseFloat(total))}`;
    money_plus.innerHTML = `+${currencySymbols[currentCurrency]}${formatNumber(parseFloat(income))}`;
    money_minus.innerHTML = `-${currencySymbols[currentCurrency]}${formatNumber(parseFloat(expense))}`;

    // Change color based on balance value, using direct styling by javascript
    if (parseFloat(total) >= 0) {
        balance.style.color = '#2e7d32';
    } else {
        balance.style.color = '#d32f2f';
    }
}

// Function to convert currency based on exchange rates
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount; // No conversion needed
    }
    const rate = EXCHANGE_RATES[fromCurrency][toCurrency];
    return amount * rate; // Convert using exchange rate
}

// Remove transaction
function removeTransaction(id) {
    // Filter out the transaction with the given ID
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage(); // Update local storage after removal
    window.location.reload(); // Refresh the page after deletion
}

// Update localStorage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('currentCurrency', currentCurrency);
}

// Currency conversion functions
async function getExchangeRate(fromCurrency, toCurrency) {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await response.json();
        return data.rates[toCurrency];
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
}

// Currency conversion functions
async function updateCurrencyDisplay(selectedCurrency) {
    const loadingIndicator = document.querySelector('.currency-loading');
    if (loadingIndicator) loadingIndicator.classList.add('active');

    // Update the current currency
    currentCurrency = selectedCurrency;

    // Update balance and income/expense display
    updateValues(); // This will recalculate and display the updated values based on the new currency

    // Refresh the transaction list to reflect the unchanged history
    updateTransactionsList();

    if (loadingIndicator) loadingIndicator.classList.remove('active');
}

// Input field formatting
var inputField = amount;
inputField.oninput = function() {
    var removeChar = this.value.replace(/[^0-9.]/g, ''); // This is to remove alphabets and special characters.
    var dotCount = (removeChar.match(/\./g) || []).length; // Count the number of dots
    if (dotCount > 1) {
        removeChar = removeChar.slice(0, -1); // Remove the last character if it's a dot and there's already one dot
    }
    this.value = removeChar;

    var parts = this.value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas only to the left of the dot
    this.value = parts.join('.');
};

let transactionsToShow = 8; // Number of transactions to show initially

// Function to add transaction to DOM with limit
function addTransactionDOMWithLimit(transaction, index) {
    if (index < transactionsToShow) {
        addTransactionDOM(transaction);
    }
}

// Function to show more transactions
function showMoreTransactions() {
    transactionsToShow += 8; // Increase the number of transactions to show by 8
    list.innerHTML = ""; // Clear the current transaction list
    transactions.forEach(addTransactionDOMWithLimit); // Add transactions to the DOM with the new limit
    updateValues(); // Update balance, income, and expense

    // Hide the "Show More" button if all transactions are displayed
    if (transactionsToShow >= transactions.length) {
        document.getElementById('show-more-btn').style.display = 'none';
        document.getElementById('show-less-btn').style.display = 'flex'; // Show the "Show Less" button
        document.getElementById('show-full-list-btn').style.display = 'none'; // Hide the "Show Full List" button
    }
}

// Function to show less transactions
function showLessTransactions() {
    transactionsToShow = 8; // Reset the number of transactions to show
    list.innerHTML = ""; // Clear the current transaction list
    transactions.forEach(addTransactionDOMWithLimit); // Add transactions to the DOM with the new limit
    updateValues(); // Update balance, income, and expense

    // Show the "Show More" button if there are more transactions to show
    if (transactions.length > transactionsToShow) {
        document.getElementById('show-more-btn').style.display = 'flex';
    }

    // Hide the "Show Less" button
    document.getElementById('show-less-btn').style.display = 'none';
    document.getElementById('show-full-list-btn').style.display = 'flex'; // Show the "Show Full List" button
}

// Function to show full list of transactions
function showFullList() {
    transactionsToShow = transactions.length; // Set the number of transactions to show to the total number of transactions
    list.innerHTML = ""; // Clear the current transaction list
    transactions.forEach(addTransactionDOM); // Add all transactions to the DOM
    updateValues(); // Update balance, income, and expense

    // Hide the "Show More" button
    document.getElementById('show-more-btn').style.display = 'none';
    // Show the "Show Less" button
    document.getElementById('show-less-btn').style.display = 'flex';
    // Hide the "Show Full List" button
    document.getElementById('show-full-list-btn').style.display = 'none';
}

// Initialize app
function init() {
    // Retrieve selected currency from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
        currencySelect.value = savedCurrency;
        currentCurrency = savedCurrency;
    }
    // Sort transactions by datetime in descending order (most recent first)
    transactions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    list.innerHTML = "";
    transactions.forEach(addTransactionDOMWithLimit); // Add transactions to the DOM with limit
    updateValues();
    
    // Remove the "Show All Transactions" button if it exists
    const showAllBtn = document.getElementById('show-all-btn');
    if (showAllBtn) {
        showAllBtn.remove();
    }

    // Show or hide the "Show More", "Show Less", and "Show Full List" buttons based on the number of transactions
    if (transactions.length > transactionsToShow) {
        document.getElementById('show-more-btn').style.display = 'flex';
        document.getElementById('show-less-btn').style.display = 'none';
        document.getElementById('show-full-list-btn').style.display = 'flex';
    } else {
        document.getElementById('show-more-btn').style.display = 'none';
        document.getElementById('show-less-btn').style.display = 'none';
        document.getElementById('show-full-list-btn').style.display = 'none';
    }

    // Hide the "Show More" and "Show Less" buttons if the calendar date is not empty
    const filterDate = document.getElementById('filter-date').value;
    if (filterDate) {
        document.getElementById('show-more-btn').style.display = 'none';
        document.getElementById('show-less-btn').style.display = 'none';
    }

    // Ensure selection buttons are hidden initially
    document.getElementById('selection-buttons').style.display = 'none';
}

// Save form data to localStorage
function saveFormData() {
    const formData = {
        category: category.value,
        type: type.value,
        datetime: datetime.value,
    };
    localStorage.setItem('formData', JSON.stringify(formData));
}

// Load form data from localStorage
function loadFormData() {
    const formData = JSON.parse(localStorage.getItem('formData'));
    if (formData) {
        category.value = formData.category;
        type.value = formData.type;
        datetime.value = formData.datetime;
    } else {
        setDefaultDateTime(); // Set default datetime if no formData in localStorage
    }
}

// Event listeners
document.getElementById('show-more-btn').addEventListener('click', showMoreTransactions);
document.getElementById('show-less-btn').addEventListener('click', showLessTransactions);
document.getElementById('show-full-list-btn').addEventListener('click', showFullList);
form.addEventListener('submit', addTransaction);
currencySelect.addEventListener('change', (e) => {
    updateCurrencyDisplay(e.target.value);
    localStorage.setItem('selectedCurrency', e.target.value); // Save selected currency to localStorage
});

// Save form data on input change
form.addEventListener('input', saveFormData);

// Load form data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    init();
    assignBoxClassesForDates();
});

// Function to assign box classes for each unique date and store in local storage
async function assignBoxClassesForDates() {
    const dateAmounts = {};
    const dateClasses = {};

    // Calculate total amount for each date
    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.datetime).toDateString();
        if (!dateAmounts[transactionDate]) {
            dateAmounts[transactionDate] = 0;
        }
        dateAmounts[transactionDate] += transaction.amount;
    });

    // Determine box class for each date based on total amount
    Object.keys(dateAmounts).forEach(date => {
        const totalAmount = dateAmounts[date];
        let boxClass = '';
        if (totalAmount > 0) {
            boxClass = GREEN_BOX_CLASS;
        } else if (totalAmount < 0) {
            boxClass = RED_BOX_CLASS;
        }
        dateClasses[date] = boxClass;
    });

    // Store date classes in local storage
    localStorage.setItem('dateClasses', JSON.stringify(dateClasses));
}

// Toggle dropdown content
document.querySelector('.dropbtn').addEventListener('click', function(event) {
    event.stopPropagation();
    document.querySelector('.dropdown-content').classList.toggle('show');
});

// Close dropdown content when clicking outside
document.addEventListener('click', function() {
    document.querySelector('.dropdown-content').classList.remove('show');
});

// Function to toggle selection of all transactions
function toggleSelectAllTransactions() {
    const transactionItems = document.querySelectorAll('.list li');
    const allSelected = Array.from(transactionItems).every(item => item.classList.contains('selected'));

    transactionItems.forEach(item => {
        if (allSelected) {
            item.classList.remove('selected');
        } else {
            item.classList.add('selected');
        }
    });

    if (allSelected) {
        exitSelectionMode();
    } else {
        isSelecting = true;
        document.getElementById('selection-buttons').style.display = 'flex';
    }

    // Hide the "Select All" button if all transactions are selected
    if (Array.from(transactionItems).every(item => item.classList.contains('selected'))) {
        document.getElementById('select-all-btn').style.display = 'none';
    } else {
        document.getElementById('select-all-btn').style.display = 'flex';
    }
}

// Event listener for "Select All" button
document.getElementById('select-all-btn').addEventListener('click', toggleSelectAllTransactions);

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

