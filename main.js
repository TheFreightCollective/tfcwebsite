// ===============================
// MOBILE NAV TOGGLE
// ===============================
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}


// ===============================
// CLOSE MENU WHEN LINK CLICKED (Mobile UX fix)
// ===============================
const navItems = document.querySelectorAll('.nav-links a');

navItems.forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
    }
  });
});


// ===============================
// HEADER SCROLL EFFECT (premium feel)
// ===============================
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});


// ===============================
// SMOOTH SCROLL (for anchor links)
// ===============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behaviour: 'smooth'
      });
    }
  });
});


// ===============================
// SAFETY: PREVENT ERRORS IF ELEMENTS MISSING
// (prevents console errors across multiple pages)
// ===============================
console.log("Main JS loaded ✅");



// ===============================
// SIMPLE REVEAL SYSTEM
// ===============================
function initReveal() {
  const elements = document.querySelectorAll('.reveal');

  elements.forEach(el => {
    el.style.opacity = 1;
    el.style.transform = 'translateY(0)';
  });
}
