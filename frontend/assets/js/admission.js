/* =========================================================
   admission.js  -  Admissions page JavaScript
   Save at: frontend/assets/js/admission.js
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


  /* ---------- ADMISSION FORM ---------- */

  const form = document.getElementById("admissionForm");
  const message = document.getElementById("formMessage");

  if (form && message) {

    form.addEventListener("submit", function (event) {

      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const program = document.getElementById("program").value;

      if (!name || !email || !phone || !program) {
        message.textContent = "Please fill in all required fields.";
        return;
      }

      message.textContent =
        "Application submitted successfully! We will contact you soon.";

      form.reset();
    });
  }

});