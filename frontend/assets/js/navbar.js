document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("navToggle");
    var menu = document.querySelector(".nav-menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
        menu.classList.toggle("open");
    });
});