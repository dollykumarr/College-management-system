/* =========================================================
   about.js  —  Navbar behaviour for about.html
   Save at: frontend/assets/js/about.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  const dropdown = document.querySelector('.dropdown');
  const toggle = document.getElementById('moreToggle');
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');

  function isMobileView() {
    return window.innerWidth <= 900;
  }

  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      navList.classList.toggle('open');
    });
  }

  if (dropdown && toggle) {
    toggle.addEventListener('click', function (e) {
      if (isMobileView()) {
        e.preventDefault();
        dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
      }
    });

    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
      }
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

    window.addEventListener('resize', function () {
      if (!isMobileView()) {
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

});