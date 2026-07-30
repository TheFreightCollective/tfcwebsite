// ===============================
// MOBILE NAV TOGGLE
// ===============================

function initNav() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (!menuToggle || !mobileNav) return;

  menuToggle.addEventListener('click', () => {
    const isActive = mobileNav.classList.toggle('active');
    menuToggle.classList.toggle('active', isActive);
    menuToggle.setAttribute('aria-expanded', isActive);
  });

  // Close menu when a link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', false);
    });
  });
}


// ===============================
// HEADER SCROLL EFFECT (premium feel)
// ===============================
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}


// ===============================
// SMOOTH SCROLL (for anchor links)
// ===============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});


// ===============================
// SCROLL REVEAL SYSTEM
// ===============================
function initReveal() {
  const elements = document.querySelectorAll('.reveal');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;

    elements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;

      if (elementTop < windowHeight - 100) {
        let delay = 0;

        if (el.classList.contains('reveal-delay-1')) delay = 100;
        if (el.classList.contains('reveal-delay-2')) delay = 200;
        if (el.classList.contains('reveal-delay-3')) delay = 300;

        setTimeout(() => {
          el.style.opacity = 1;
          el.style.transform = 'translateY(0)';
        }, delay);
      }
    });
  };

  revealOnScroll();
  window.addEventListener('scroll', revealOnScroll);
}


// ===============================
// INIT
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
});

console.log("Main JS loaded ✅");
