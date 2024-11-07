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

// Currency configuration
const DEFAULT_CURRENCY = 'USD';
const currencySymbols = {
    'USD': '$',
    'CAD': 'C$',
    'SGD': 'S$',
    'NZD': 'NZ$',
    'AUD': 'A$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'KRW': '₩',
    'CNY': '¥',
    'INR': '₹',
    'RUB': '₽',
    'ZAR': 'R',
    'IDR': 'Rp',
    'THB': '฿',
    'MYR': 'RM',
};

// Set default datetime value to current time when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  datetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  init();
});

// Get transactions from localStorage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];
let currentCurrency = localStorage.getItem('currentCurrency') || DEFAULT_CURRENCY;

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// Format number with commas
function formatNumber(number) {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '' || category.value.trim() === '') {
      alert('Please add a description, category, and amount');
      return;
  }

  // Get the datetime value or use current time if not specified
  const transactionDate = datetime.value ? new Date(datetime.value) : new Date();

  const transaction = {
      id: generateID(),
      text: text.value,
      category: category.value,
      amount: type.value === 'income' ? +amount.value : -amount.value,
      currency: currentCurrency,
      datetime: transactionDate.toISOString() // Store date in ISO format
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateLocalStorage();

  // Reset form
  text.value = '';
  amount.value = '';
  category.value = '';
  type.value = 'income';
  datetime.value = '';
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

// Add transaction to DOM
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");

  item.classList.add(transaction.amount < 0 ? "minus" : "plus");
  
  item.innerHTML = `
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})"></button>
      <div class="transaction-details">
          <span class="transaction-text">${transaction.text}</span>
          <span class="category-tag">${transaction.category}</span>
          <span class="transaction-amount">${currencySymbols[currentCurrency]}${formatNumber(Math.abs(transaction.amount))}</span>
          <span class="transaction-date">${formatDateTime(transaction.datetime)}</span>
      </div>
  `;
  
  list.appendChild(item);

  // Add touch support
  item.addEventListener('touchstart', function() {
      this.classList.add('touched');
  });
  item.addEventListener('touchend', function() {
      this.classList.remove('touched');
  });
}

// Debounce function to prevent excessive API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// User Management System
class UserManager {
    constructor() {
        this.currentUser = null;
    }

    // Register a new user
    registerUser(username, password) {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (existingUsers[username]) {
            alert('Username already exists!');
            return false;
        }

        // Create user object
        existingUsers[username] = {
            password: this.hashPassword(password),
            transactions: [],
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(existingUsers));
        return true;
    }

    // Login user
    loginUser(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (!users[username]) {
            alert('User not found!');
            return false;
        }

        if (users[username].password === this.hashPassword(password)) {
            this.currentUser = username;
            
            // Load user's transactions
            transactions = users[username].transactions || [];
            
            // Update UI
            this.hideLoginModal();
            init();
            return true;
        }

        alert('Incorrect password!');
        return false;
    }

    // Simple password hashing (for demonstration - use more secure method in production)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Save transactions for current user
    saveUserTransactions() {
        if (!this.currentUser) return;

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[this.currentUser].transactions = transactions;
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Show login modal
    showLoginModal() {
        document.getElementById('login-modal').style.display = 'flex';
    }

    // Hide login modal
    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
    }

    // Logout user
    logout() {
        this.saveUserTransactions();
        this.currentUser = null;
        transactions = [];
        init();
        this.showLoginModal();
    }
}

// Initialize User Manager
const userManager = new UserManager();

// Event Listeners for Login/Register
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerBtn = document.getElementById('register-btn');

    // Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        userManager.loginUser(username, password);
    });

    // Register Button Click
    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (userManager.registerUser(username, password)) {
            alert('Registration successful! Please login.');
        }
    });

    // Show login modal on page load
    userManager.showLoginModal();
});

// Modify existing functions to work with user management
function updateLocalStorage() {
    userManager.saveUserTransactions();
}

// Add logout functionality
function addLogoutButton() {
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.classList.add('btn', 'logout-btn');
    logoutBtn.addEventListener('click', () => userManager.logout());
    
    // Add to appropriate location in your UI
    const container = document.querySelector('.container');
    container.insertBefore(logoutBtn, container.firstChild);
}

// Modify init to add logout button
function init() {
    list.innerHTML = "";
    transactions.forEach(addTransactionDOM);
    updateValues();
    addLogoutButton();
}

// Apply debounce to currency conversion
const debouncedCurrencyUpdate = debounce(updateCurrencyDisplay, 300);
currencySelect.addEventListener('change', (e) => debouncedCurrencyUpdate(e.target.value));

// Update balance, income and expense
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
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
}

// Remove transaction
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
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

async function updateCurrencyDisplay(selectedCurrency) {
    const loadingIndicator = document.querySelector('.currency-loading');
    if (loadingIndicator) loadingIndicator.classList.add('active');

    const rate = await getExchangeRate(currentCurrency, selectedCurrency);
    if (rate) {
        currentCurrency = selectedCurrency;
        updateValues();
        updateTransactionsList();
    }

    if (loadingIndicator) loadingIndicator.classList.remove('active');
}

// Initialize app
function init() {
    list.innerHTML = "";
    transactions.forEach(addTransactionDOM);
    updateValues();
}

// Event listeners
form.addEventListener('submit', addTransaction);
currencySelect.addEventListener('change', (e) => updateCurrencyDisplay(e.target.value));

// Initialize the app
document.addEventListener('DOMContentLoaded', init);