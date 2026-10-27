document.addEventListener('DOMContentLoaded', function () {
  const dropdown = document.querySelector('.dropdown');
  const toggle = document.getElementById('moreToggle');

  if (!dropdown || !toggle) return;

  function isMobileView() {
    return window.innerWidth <= 992;
  }

  // Click/tap toggle — needed for mobile, and for accessibility on desktop
  toggle.addEventListener('click', function (e) {
    if (isMobileView()) {
      e.preventDefault();
      dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
    }
    // On desktop, hover already opens it — click still navigates if href isn't "#"
  });

  // Keyboard accessibility (Enter/Space toggles on focus)
  toggle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
    }
  });

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Reset state if window is resized across the breakpoint
  window.addEventListener('resize', function () {
    if (!isMobileView()) {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Smooth scroll for "More" dropdown links pointing to sections
document.querySelectorAll('#moreMenu a').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    const target = document.querySelector(targetId);

    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });

      // Mobile view me dropdown close kar do click ke baad
      const dropdown = document.querySelector('.dropdown');
      if (dropdown) dropdown.classList.remove('open');
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const dropdown = document.querySelector('.dropdown');
  const toggle = document.getElementById('moreToggle');

  // Dropdown open/close on click (mobile) — desktop pe hover se already CSS khol dega
  if (toggle) {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        dropdown.classList.toggle('open');
      }
    });
  }

  // Smooth scroll jab dropdown ka koi link click ho
  document.querySelectorAll('#moreMenu a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        dropdown.classList.remove('open');
      }
    });
  });
});