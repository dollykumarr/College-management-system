// Contact form -> backend (saves data to the messages table)
const CONTACT_API = '../backend/scr/contact_submit.php';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formMessage');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = form.querySelector('.contact-submit');

    btn.disabled = true;
    note.textContent = 'Please wait, sending...';
    note.style.color = '';

    fetch(CONTACT_API, {
      method: 'POST',
      body: new FormData(form)
    })
      .then(r => r.json())
      .then(res => {

        if (res.success) {
          note.textContent =
            'Thank you! Your message has been sent successfully. We will get back to you soon.';
          note.style.color = 'green';

          form.reset();
        } else {
          note.textContent = res.message || 'Unable to send your message. Please try again.';
          note.style.color = 'crimson';
        }

      })
      .catch(() => {
        note.textContent =
          'Message could not be sent. Please check the Internet or server and try again.';
        note.style.color = 'crimson';
      })
      .finally(() => {
        btn.disabled = false;
      });
  });
});