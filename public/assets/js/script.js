/* Renue Systems — homepage interactions */
(function () {
  'use strict';

  /* ---- Mobile nav overlay ---- */
  var toggle   = document.querySelector('.nav-toggle');
  var overlay  = document.getElementById('navOverlay');
  var closeBtn = document.getElementById('navClose');

  function openOverlay() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle && overlay) {
    toggle.addEventListener('click', openOverlay);
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeOverlay);
    });
    // Close on backdrop tap (outside the links/close btn)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });
  }

  /* ---- Service tabs ---- */
  var tabBtns   = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');
  if (tabBtns.length) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('aria-controls');

        // Update buttons
        tabBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Update panels
        tabPanels.forEach(function (panel) {
          if (panel.id === target) {
            panel.removeAttribute('hidden');
            panel.classList.add('active');
          } else {
            panel.setAttribute('hidden', '');
            panel.classList.remove('active');
          }
        });
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything if IntersectionObserver unsupported
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Partner logo carousel — seamless infinite loop ---- */
  (function () {
    var carousel = document.querySelector('.logo-carousel');
    if (!carousel) return;

    var track    = carousel.querySelector('.carousel-track');
    var viewport = carousel.querySelector('.carousel-viewport');
    var prevBtn  = carousel.querySelector('.carousel-prev');
    var nextBtn  = carousel.querySelector('.carousel-next');
    var autoTimer = null;

    // Collect only the original (real) items — no clones yet
    var realItems = Array.from(track.children);
    var REAL = realItems.length;
    var busy = false;
    var cloneCount = 0;
    var current = 0; // logical index into the full track (set after buildClones)

    function slots() {
      var w = viewport.offsetWidth;
      if (w < 480) return 2;
      if (w < 800) return 3;
      return 4;
    }

    function itemW() {
      var li = track.querySelector('li');
      return li ? li.offsetWidth : 0;
    }

    function buildClones() {
      // Remove existing clones
      Array.from(track.querySelectorAll('.carousel-clone')).forEach(function (el) { el.remove(); });

      cloneCount = slots(); // clone enough to fill one screen on each side

      // Prepend clones of the LAST cloneCount real items
      // so scrolling left from item 0 seamlessly shows the end
      var frag = document.createDocumentFragment();
      for (var i = REAL - cloneCount; i < REAL; i++) {
        var c = realItems[i].cloneNode(true);
        c.classList.add('carousel-clone');
        c.setAttribute('aria-hidden', 'true');
        frag.appendChild(c);
      }
      track.insertBefore(frag, track.firstChild);

      // Append clones of the FIRST cloneCount real items
      // so scrolling right past the last item seamlessly shows the start
      for (var j = 0; j < cloneCount; j++) {
        var c = realItems[j].cloneNode(true);
        c.classList.add('carousel-clone');
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      }

      // Start positioned at the first real item (index = cloneCount)
      current = cloneCount;
    }

    function jump(index) {
      // Instant position change — no animation
      track.style.transition = 'none';
      track.style.transform = 'translateX(-' + (index * itemW()) + 'px)';
      // Force reflow so the next transition isn't skipped
      track.getBoundingClientRect();
    }

    function slide(index) {
      track.style.transition = 'transform .38s cubic-bezier(.4,0,.2,1)';
      track.style.transform = 'translateX(-' + (index * itemW()) + 'px)';
    }

    function navigate(dir) {
      if (busy) return;
      busy = true;
      current += dir;
      slide(current);
    }

    track.addEventListener('transitionend', function () {
      // After sliding into a clone zone, silently jump to the real equivalent
      if (current >= cloneCount + REAL) {
        current -= REAL;
        jump(current);
      } else if (current < cloneCount) {
        current += REAL;
        jump(current);
      }
      busy = false;
    });

    if (nextBtn) nextBtn.addEventListener('click', function () { navigate(1); });
    if (prevBtn) prevBtn.addEventListener('click', function () { navigate(-1); });

    function startAuto() {
      stopAuto();
      autoTimer = window.setInterval(function () { navigate(1); }, 2600);
    }

    function stopAuto() {
      if (autoTimer) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);

    // Rebuild on resize and reposition without animation
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildClones();
        jump(current);
      }, 150);
    }, { passive: true });

    // Init
    buildClones();
    jump(current);
    startAuto();
  }());

  /* ---- Case studies carousel ---- */
  (function () {
    var wrap = document.querySelector('.case-grid-wrap');
    if (!wrap) return;

    var row = wrap.querySelector('.case-grid');
    var prev = wrap.querySelector('.case-prev');
    var next = wrap.querySelector('.case-next');
    if (!row || !prev || !next) return;

    var realItems = Array.from(row.children);
    var REAL = realItems.length;
    var current = 0;
    var cloneCount = 0;
    var busy = false;
    var settleTimer;

    function visibleCards() {
      return window.matchMedia('(max-width: 760px)').matches ? 1 : 2;
    }

    function cardW() {
      var card = row.querySelector('.case-card');
      if (!card) return 0;
      var styles = window.getComputedStyle(row);
      var gap = parseFloat(styles.columnGap || styles.gap || 0);
      return card.offsetWidth + gap;
    }

    function buildClones() {
      Array.from(row.querySelectorAll('.case-clone')).forEach(function (el) { el.remove(); });
      cloneCount = visibleCards();

      var before = document.createDocumentFragment();
      for (var i = REAL - cloneCount; i < REAL; i++) {
        var c = realItems[i].cloneNode(true);
        c.classList.add('case-clone');
        c.setAttribute('aria-hidden', 'true');
        before.appendChild(c);
      }
      row.insertBefore(before, row.firstChild);

      for (var j = 0; j < cloneCount; j++) {
        var a = realItems[j].cloneNode(true);
        a.classList.add('case-clone');
        a.setAttribute('aria-hidden', 'true');
        row.appendChild(a);
      }

      current = cloneCount;
    }

    function jump(index) {
      row.style.scrollBehavior = 'auto';
      row.scrollLeft = index * cardW();
      row.getBoundingClientRect();
      row.style.scrollBehavior = '';
    }

    function slide(index, after) {
      row.scrollTo({ left: index * cardW(), behavior: 'smooth' });
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        if (after) after();
        busy = false;
      }, 460);
    }

    function normalize() {
      if (current >= cloneCount + REAL) {
        current -= REAL;
        jump(current);
      } else if (current < cloneCount) {
        current += REAL;
        jump(current);
      }
    }

    function navigate(dir) {
      if (busy) return;
      busy = true;
      current += dir;
      slide(current, normalize);
    }

    next.addEventListener('click', function () { navigate(1); });
    prev.addEventListener('click', function () { navigate(-1); });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildClones();
        jump(current);
      }, 150);
    }, { passive: true });

    buildClones();
    jump(current);
  }());

  /* ---- Form: basic client-side feedback ---- */
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        var orig = btn.textContent;
        btn.textContent = 'Sent! We\'ll be in touch shortly.';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = orig;
          btn.disabled = false;
          form.reset();
        }, 4000);
      }
    });
  });

})();
