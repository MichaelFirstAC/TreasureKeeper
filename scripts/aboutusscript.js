document.addEventListener('DOMContentLoaded', function() {
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