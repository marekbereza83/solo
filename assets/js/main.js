(function () {
  'use strict';

  /* ── Mobile Menu ── */
  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var close  = document.getElementById('menu-close');
    var menu   = document.getElementById('mobile-menu');
    if (!toggle || !close || !menu) return;

    var lastFocused = null;

    function openMenu() {
      menu.classList.add('active');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
      lastFocused = document.activeElement;
      close.focus();
      document.addEventListener('keydown', handleKeyDown);
    }

    function closeMenu() {
      menu.classList.remove('active');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
      if (lastFocused) lastFocused.focus();
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(
        menu.querySelectorAll('a[href], button:not([disabled])')
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    toggle.addEventListener('click', openMenu);
    close.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ── Testimonials Carousel ── */
  function initCarousel() {
    var slides  = document.querySelectorAll('.testimonial-slide');
    var dots    = document.querySelectorAll('.testimonial-dot');
    var prevBtn = document.getElementById('prev-testimonial');
    var nextBtn = document.getElementById('next-testimonial');
    if (!slides.length || !prevBtn || !nextBtn) return;

    var current = 0;
    var timer   = null;

    function showSlide(idx) {
      current = ((idx % slides.length) + slides.length) % slides.length;
      slides.forEach(function (s) { s.classList.remove('active'); });
      dots.forEach(function (d) {
        d.classList.remove('bg-primary');
        d.classList.add('bg-outline/30');
      });
      slides[current].classList.add('active');
      if (dots[current]) {
        dots[current].classList.remove('bg-outline/30');
        dots[current].classList.add('bg-primary');
      }
    }

    function startTimer() {
      timer = setInterval(function () { showSlide(current + 1); }, 8000);
    }

    function stopTimer() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    prevBtn.addEventListener('click', function () { stopTimer(); showSlide(current - 1); startTimer(); });
    nextBtn.addEventListener('click', function () { stopTimer(); showSlide(current + 1); startTimer(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { stopTimer(); showSlide(i); startTimer(); });
    });

    var region = slides[0] && slides[0].closest('[data-carousel]');
    if (region) {
      region.addEventListener('mouseenter', stopTimer);
      region.addEventListener('mouseleave', startTimer);
      region.addEventListener('focusin',    stopTimer);
      region.addEventListener('focusout',   startTimer);
    }

    startTimer();
  }

  /* ── Contact Form ── */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var requiredIds = ['first_name', 'last_name', 'email', 'message', 'consent'];
    var successMsg  = document.getElementById('form-success');
    var errorMsg    = document.getElementById('form-error');
    var submitBtn   = form.querySelector('[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : '';

    function setLoading(on) {
      if (!submitBtn) return;
      submitBtn.disabled    = on;
      submitBtn.textContent = on ? 'Wysyłanie…' : submitLabel;
    }

    function validateField(id) {
      var el    = document.getElementById(id);
      var errEl = document.getElementById(id + '-error');
      if (!el) return true;

      var valid;
      if (el.type === 'checkbox') {
        valid = el.checked;
      } else if (el.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      } else {
        valid = el.value.trim().length > 0;
      }

      el.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (errEl) errEl.classList.toggle('visible', !valid);
      return valid;
    }

    requiredIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur',   function () { validateField(id); });
      el.addEventListener('change', function () { validateField(id); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* honeypot – abort silently if bot filled hidden field */
      var hp = form.querySelector('[name="_hp_email"]');
      if (hp && hp.value) return;

      var allValid = requiredIds.every(validateField);
      if (!allValid) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        if (errorMsg) errorMsg.classList.add('visible');
        return;
      }

      setLoading(true);

      /* Replace body below with a real fetch() to your backend */
      setTimeout(function () {
        setLoading(false);
        if (successMsg) {
          successMsg.classList.add('visible');
          successMsg.focus();
        }
        if (errorMsg) errorMsg.classList.remove('visible');
        form.reset();
      }, 400);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initCarousel();
    initContactForm();
  });
}());
