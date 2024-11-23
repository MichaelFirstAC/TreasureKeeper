document.addEventListener('DOMContentLoaded', function() {
    // Get references to the DOM elements
    const daysContainer = document.querySelector('.days');
    const monthYearDisplay = document.querySelector('.month-year');
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');

    // Initialize the current date
    let currentDate = new Date();

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

    // Initial render of the calendar
    renderCalendar();
});