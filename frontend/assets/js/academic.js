/* =========================================================
   academic.js  -  Academics page JavaScript
   Save at: frontend/assets/js/academic.js
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- NAVBAR (More dropdown + active link) ---------- */

  const dropdown = document.querySelector('.dropdown');
  const toggle = document.getElementById('moreToggle');

  if (dropdown && toggle) {

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list > li > a').forEach(function (link) {
    const linkFile = link.getAttribute('href').split('#')[0];
    if (linkFile === currentFile) {
      link.classList.add('active');
    }
  });


  /* ---------- DEPARTMENT FILTER ---------- */

  const filterButtons = document.querySelectorAll('.department-filter-btn');
  const departmentCards = document.querySelectorAll('.department-card');

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {

      const filter = button.getAttribute('data-filter');

      filterButtons.forEach(function (btn) {
        btn.classList.remove('active');
      });
      button.classList.add('active');

      departmentCards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

    });
  });

});