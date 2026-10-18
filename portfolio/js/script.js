// Loader
const loader = document.getElementById('pageLoader');
window.addEventListener('load', () => {
  setTimeout(() => loader && loader.classList.add('hidden'), 350);
});
setTimeout(() => {
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
  }
}, 1500);

// Theme toggle (sombre / clair)
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const rootEl = document.documentElement;

function applyTheme(theme, persist) {
  const isLight = theme === 'light';
  rootEl.classList.toggle('light', isLight);

  if (themeIcon) {
    themeIcon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Activer le mode sombre' : 'Activer le mode clair');
    themeToggle.classList.remove('theme-anim');
    void themeToggle.offsetWidth;
    themeToggle.classList.add('theme-anim');
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isLight ? '#f4f6fb' : '#0a0e1a');
  }

  if (persist) {
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }
}

applyTheme(rootEl.classList.contains('light') ? 'light' : 'dark', false);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyTheme(rootEl.classList.contains('light') ? 'dark' : 'light', true);
  });
}

// Mobile menu toggle
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');

if (burger) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === '#' + current) {
      item.classList.add('active');
    }
  });
});

// Animate skill bars on scroll into view
const skillFills = document.querySelectorAll('.skill-fill');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const width = entry.target.style.width;
      entry.target.style.width = '0';
      setTimeout(() => {
        entry.target.style.transition = 'width 1s ease';
        entry.target.style.width = width;
      }, 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

skillFills.forEach(fill => observer.observe(fill));

// Scroll reveal animations
const revealItems = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.revealDelay || 0;
      entry.target.style.setProperty('--reveal-delay', delay + 'ms');
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach(item => revealObserver.observe(item));

// Project dots (carousel indicator placeholder)
const dots = document.querySelectorAll('.dot');
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    dots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

// Contact form (Formspree) + mail fallback (anti-spam obfuscation)
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = contactForm ? contactForm.querySelector('.form-submit') : null;
const submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;
const mailFallback = document.getElementById('mailFallback');
const FORM_ENDPOINT = 'https://formspree.io/f/mrpejvby';

if (mailFallback) {
  const user = mailFallback.dataset.user;
  const domain = mailFallback.dataset.domain;
  if (user && domain) {
    const mailto = `mailto:${user}@${domain}`;
    mailFallback.setAttribute('href', mailto);
    mailFallback.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = mailto;
    });
  }
}

if (contactForm) {
  const endpoint = contactForm.getAttribute('action') || FORM_ENDPOINT;
  const nameInput = document.getElementById('cf-name');
  const emailInput = document.getElementById('cf-email');
  const subjectInput = document.getElementById('cf-subject');
  const messageInput = document.getElementById('cf-message');
  const honeypot = contactForm.querySelector('.honeypot');

  function setStatus(text, type) {
    if (!formStatus) return;
    formStatus.textContent = text || '';
    formStatus.classList.remove('success', 'error');
    if (type) formStatus.classList.add(type);
  }

  function clearFieldErrors() {
    contactForm.querySelectorAll('.field-error').forEach(el => {
      el.textContent = '';
    });
  }

  function showFieldError(id, text) {
    const el = contactForm.querySelector(`.field-error[data-for="${id}"]`);
    if (el) el.textContent = text;
  }

  if (endpoint.includes('VOTRE_FORM_ID')) {
    console.warn('[Contact] Formspree endpoint non configuré. Remplace f/VOTRE_FORM_ID par ton ID réel.');
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();
    setStatus('');
    if (honeypot && honeypot.value) {
      setStatus('Merci ! Votre message a bien été envoyé. Je vous répondrai rapidement.', 'success');
      contactForm.reset();
      if (submitBtn && submitLabel) {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Envoyer le message ';
        submitLabel.appendChild(Object.assign(document.createElement('i'), { className: 'fa-solid fa-paper-plane' }));
      }
      return;
    }

    let valid = true;
    if (!nameInput || !nameInput.value.trim()) {
      showFieldError('cf-name', 'Veuillez renseigner votre nom.');
      valid = false;
    }
    if (!emailInput) {
      valid = false;
    } else {
      const val = emailInput.value.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val) {
        showFieldError('cf-email', 'Veuillez renseigner votre e-mail.');
        valid = false;
      } else if (!emailRe.test(val)) {
        showFieldError('cf-email', 'E-mail invalide.');
        valid = false;
      }
    }
    if (!subjectInput || !subjectInput.value.trim()) {
      showFieldError('cf-subject', 'Veuillez renseigner un sujet.');
      valid = false;
    }
    if (!messageInput) {
      valid = false;
    } else {
      const msgVal = messageInput.value.trim();
      if (!msgVal) {
        showFieldError('cf-message', 'Veuillez écrire un message.');
        valid = false;
      } else if (msgVal.length < 10) {
        showFieldError('cf-message', 'Le message doit contenir au moins 10 caractères.');
        valid = false;
      }
    }
    if (!valid) {
      setStatus('Veuillez corriger les erreurs ci-dessus.', 'error');
      return;
    }

    const formData = new FormData(contactForm);

    if (submitBtn && submitLabel) {
      submitBtn.disabled = true;
      submitLabel.textContent = 'Envoi en cours…';
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (res.ok) {
        contactForm.reset();
        setStatus('Merci ! Votre message a bien été envoyé. Je vous répondrai rapidement.', 'success');
      } else {
        setStatus('Une erreur est survenue. Réessayez ou écrivez-moi directement.', 'error');
      }
    } catch (err) {
      setStatus('Une erreur est survenue. Réessayez ou écrivez-moi directement.', 'error');
    } finally {
      if (submitBtn && submitLabel) {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Envoyer le message ';
        submitLabel.appendChild(Object.assign(document.createElement('i'), { className: 'fa-solid fa-paper-plane' }));
      }
    }
  });
}
