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

  /* ---- Location region toggle (contact page) ---- */
  var locTabBtns = document.querySelectorAll('.location-tab-btn');
  if (locTabBtns.length) {
    locTabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('aria-controls');
        locTabBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        document.querySelectorAll('[role="tabpanel"]').forEach(function (panel) {
          if (panel.id === target) {
            panel.removeAttribute('hidden');
          } else {
            panel.setAttribute('hidden', '');
          }
        });
      });
    });
  }

  /* ---- Interactive office map (contact page, Leaflet) ---- */
  (function () {
    var mapEl   = document.getElementById('office-map');
    if (!mapEl || typeof L === 'undefined') return;

    var mapCard     = document.getElementById('office-map-card');
    var activeMarker = null;

    var map = L.map(mapEl, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
      worldCopyJump: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    var pinIcon = L.divIcon({
      className: 'office-pin',
      html: '<span class="office-pin-shape"></span>',
      iconSize: [22, 28],
      iconAnchor: [11, 26]
    });

    /* Build and show the in-map overlay card near a pin */
    function positionCard(latlng) {
      if (!mapCard) return;
      var pt     = map.latLngToContainerPoint(latlng);
      var cardW  = 250;                       /* fixed card width from CSS */
      var cardH  = mapCard.offsetHeight || 160;
      var mapW   = mapEl.offsetWidth;
      var mapH   = mapEl.offsetHeight;
      var pad    = 10;
      var offset = 18;

      /* Prefer right of pin, fall back to left */
      var left = pt.x + offset;
      if (left + cardW > mapW - pad) left = pt.x - cardW - offset;
      left = Math.max(pad, Math.min(left, mapW - cardW - pad));

      /* Vertically centered on pin, clamped */
      var top = pt.y - cardH / 2;
      top = Math.max(pad, Math.min(top, mapH - cardH - pad));

      mapCard.style.left = left + 'px';
      mapCard.style.top  = top  + 'px';
    }

    function showCard(cardEl, latlng, sticky) {
      if (!mapCard) return;
      var body = document.createElement('div');
      body.className = 'office-map-card-body';

      var tag = cardEl.querySelector('.tag');
      if (tag) body.appendChild(tag.cloneNode(true));

      var h3 = cardEl.querySelector('h3');
      if (h3) {
        var h4 = document.createElement('h4');
        h4.textContent = h3.textContent.trim();
        body.appendChild(h4);
      }

      ['office-name', 'office-contact', 'office-addr', 'office-phone', 'office-email', 'office-web'].forEach(function (cls) {
        var node = cardEl.querySelector('.' + cls);
        if (node) body.appendChild(node.cloneNode(true));
      });

      mapCard.innerHTML = '';
      mapCard.appendChild(body);
      mapCard._sticky = sticky || false;

      /* Make visible before positioning so offsetHeight is accurate */
      mapCard.removeAttribute('hidden');
      positionCard(latlng);
    }

    function hideCard() {
      if (!mapCard || mapCard._sticky) return;
      mapCard.setAttribute('hidden', '');
      mapCard._sticky = false;
    }

    function clearActive() {
      if (activeMarker) {
        var el = activeMarker.getElement();
        if (el) el.classList.remove('pin-active');
        activeMarker = null;
      }
      if (mapCard) {
        mapCard._sticky = false;
        mapCard.setAttribute('hidden', '');
      }
    }

    var markers = [];
    var byRegion = { us: [], intl: [] };

    document.querySelectorAll('#panel-us .service-card, #panel-intl .service-card').forEach(function (card) {
      var lat    = parseFloat(card.getAttribute('data-lat'));
      var lng    = parseFloat(card.getAttribute('data-lng'));
      var region = card.getAttribute('data-region') || 'us';
      if (!lat || !lng) return;

      var title  = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '';
      var marker = L.marker([lat, lng], { icon: pinIcon, title: title });
      marker.region = region;
      marker.slug   = card.getAttribute('data-slug');
      marker.cardEl = card;

      marker.on('mouseover', function () {
        if (!mapCard || !mapCard._sticky) showCard(card, marker.getLatLng(), false);
        var el = marker.getElement();
        if (el) el.classList.add('pin-active');
      });

      marker.on('mouseout', function () {
        var el = marker.getElement();
        if (el && marker !== activeMarker) el.classList.remove('pin-active');
        hideCard();
      });

      marker.on('click', function (e) {
        L.DomEvent.stopPropagation(e);
        if (activeMarker && activeMarker !== marker) {
          var prev = activeMarker.getElement();
          if (prev) prev.classList.remove('pin-active');
        }
        activeMarker = marker;
        var el = marker.getElement();
        if (el) el.classList.add('pin-active');

        showCard(card, marker.getLatLng(), true);

        /* Scroll to and briefly highlight the card below the map */
        var target = document.querySelector('.service-card[data-slug="' + marker.slug + '"]');
        if (target) {
          target.classList.add('card-active');
          setTimeout(function () { target.classList.remove('card-active'); }, 2200);
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      byRegion[region].push(marker);
      markers.push(marker);
    });

    /* Click on empty map area clears sticky state */
    map.on('click', function () { clearActive(); });

    function showRegion(region) {
      clearActive();
      markers.forEach(function (m) {
        if (m.region === region) { if (!map.hasLayer(m)) map.addLayer(m); }
        else { if (map.hasLayer(m)) map.removeLayer(m); }
      });
      var group = byRegion[region];
      if (group && group.length) {
        map.fitBounds(L.featureGroup(group).getBounds(), { padding: [50, 50], maxZoom: region === 'us' ? 5 : 3 });
      }
    }

    showRegion('us');

    document.querySelectorAll('.location-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('aria-controls');
        var region = target === 'panel-intl' ? 'intl' : 'us';
        mapEl.setAttribute('data-region', region);
        showRegion(region);
      });
    });

    function resize() { if (map) map.invalidateSize(); }
    setTimeout(resize, 300);
    window.addEventListener('resize', resize);
    var sect = mapEl.closest('.reveal');
    if (sect && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { resize(); obs.disconnect(); }
        });
      }, { threshold: 0.1 }).observe(sect);
    }
  })();

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

  /* ---- Franchisee video tiles: thumbnail → player on click ---- */
  var videoThumbs = document.querySelectorAll('.franchise-video-grid .video-thumb');
  if (videoThumbs.length) {
    var thumbData = [];

    // Build state objects for each tile
    videoThumbs.forEach(function (thumb) {
      thumbData.push({ thumb: thumb, video: null });
    });

    function deactivate(entry) {
      if (entry.video) {
        entry.video.pause();
      }
      entry.thumb.classList.remove('is-playing');
    }

    thumbData.forEach(function (entry) {
      var thumb = entry.thumb;
      var playBtn = thumb.querySelector('.video-play');
      var src = thumb.getAttribute('data-src');

      function activate() {
        if (thumb.classList.contains('is-playing')) return;

        // Revert every other tile back to thumbnail
        thumbData.forEach(function (other) {
          if (other !== entry) deactivate(other);
        });

        if (!entry.video) {
          // First play: create the video element once
          var video = document.createElement('video');
          video.className = 'franchise-video';
          video.setAttribute('controls', '');
          video.setAttribute('playsinline', '');
          video.setAttribute('preload', 'auto');
          var source = document.createElement('source');
          source.src = src;
          source.type = 'video/mp4';
          video.appendChild(source);
          thumb.appendChild(video);
          entry.video = video;

          video.addEventListener('loadedmetadata', function () { video.play(); });
          if (video.readyState >= 1) video.play();
        } else {
          entry.video.play();
        }

        thumb.classList.add('is-playing');
      }

      if (playBtn) playBtn.addEventListener('click', activate);
      thumb.addEventListener('click', function (e) {
        if (e.target === playBtn || thumb.classList.contains('is-playing')) return;
        activate();
      });
    });
  }

  /* ---- Partner logo carousel — seamless infinite loop ---- */
  (function () {
    var carousels = Array.from(document.querySelectorAll('.logo-carousel'));
    if (!carousels.length) return;

    carousels.forEach(function (carousel) {
      var track    = carousel.querySelector('.carousel-track');
      var viewport = carousel.querySelector('.carousel-viewport');
      if (!track || !viewport) return;

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

        cloneCount = Math.min(slots(), REAL); // clone enough to fill one screen on each side

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
    });
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

  /* ---- Related services infinite scroller ---- */
  (function () {
    var wrap = document.getElementById('related-scroller');
    if (!wrap || !window.RENUE_SERVICES) return;

    var currentSlug = window.__RS || '';

    // Find the branch of the current service
    var currentSvc = window.RENUE_SERVICES.filter(function (s) { return s.slug === currentSlug; })[0];

    // Commercial-only pages (light fixtures, flood) have just one true peer in the
    // 'commercial' branch, which leaves the scroller near-empty. For those pages we
    // pull every service that appears on the commercial list (branch 'commercial' or
    // flagged commercial:true). Hotel-branch pages keep the original same-branch set.
    var onCommercial = currentSvc && currentSvc.branch === 'commercial';
    var peers = window.RENUE_SERVICES.filter(function (s) {
      if (s.slug === currentSlug) return false;
      if (onCommercial) return s.branch === 'commercial' || s.commercial === true;
      return s.branch === 'hotel';
    });

    if (!peers.length) return;

    // Pick the title/short for the active language:
    // prefer an explicit *_<lang> field, then the shared i18n dictionary,
    // then fall back to the English source.
    function loc(svc, base) {
      var L = (window.RenueI18n && RenueI18n.lang) || 'en';
      var localized = svc[base + '_' + L];
      if (L !== 'en' && localized) return localized;
      if (L !== 'en' && window.RenueI18n) {
        var t = RenueI18n.t(svc[base]);
        if (t !== svc[base]) return t;
      }
      return svc[base];
    }

    function buildCard(svc, hidden) {
      var a = document.createElement('a');
      a.href = '/' + svc.slug + '/';
      a.className = 'service-scroll-card';
      if (hidden) a.setAttribute('aria-hidden', 'true');

      var img = document.createElement('img');
      img.src     = svc.img;
      img.alt     = loc(svc, 'title');
      img.loading = 'lazy';
      a.appendChild(img);

      var body = document.createElement('div');
      body.className = 'service-scroll-card-body';

      var h3 = document.createElement('h3');
      h3.textContent = loc(svc, 'title');
      body.appendChild(h3);

      var p = document.createElement('p');
      p.textContent = loc(svc, 'short');
      body.appendChild(p);

      var lnk = document.createElement('span');
      lnk.className   = 'card-link';
      lnk.textContent = (window.RenueI18n ? RenueI18n.t('Learn more \u2192') : 'Learn more \u2192');
      body.appendChild(lnk);

      a.appendChild(body);
      return a;
    }

    function render() {
      wrap.innerHTML = '';
      var track = document.createElement('div');
      track.className = 'services-scroller-track';
      // Original set
      peers.forEach(function (svc) { track.appendChild(buildCard(svc, false)); });
      // Duplicate set for seamless infinite loop
      peers.forEach(function (svc) { track.appendChild(buildCard(svc, true)); });
      wrap.appendChild(track);
    }

    render();

    // Rebuild in the new language when the user toggles EN/FR.
    if (window.RenueI18n) {
      window.addEventListener('renue:langchange', render);
    }
  }());

  /* ---- Photo gallery lightbox ---- */
  (function () {
    // Exclude the franchise video grid — it shares the gallery-grid class
    var grid = document.querySelector('.gallery-grid:not(.franchise-video-grid)');
    if (!grid) return;

    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML =
      '<button class="lightbox-close" type="button">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      '<figure class="lightbox-figure"><img class="lightbox-img" alt=""><figcaption class="lightbox-caption"></figcaption></figure>';
    document.body.appendChild(lb);

    var img = lb.querySelector('.lightbox-img');
    var cap = lb.querySelector('.lightbox-caption');
    var closeBtn = lb.querySelector('.lightbox-close');

    /* Localise the dynamic aria-labels. The lightbox is created after
       i18n.apply() has already run, so walkAttrs won't catch it on first
       paint — set them here via t() and refresh on language change. */
    function setLabels() {
      var i18n = window.RenueI18n;
      lb.setAttribute('aria-label', i18n ? i18n.t('Image preview') : 'Image preview');
      closeBtn.setAttribute('aria-label', i18n ? i18n.t('Close preview') : 'Close preview');
    }
    setLabels();
    if (window.RenueI18n) window.addEventListener('renue:langchange', setLabels);

    function open(card) {
      var image = card.querySelector('img');
      if (!image) return;
      img.src = image.currentSrc || image.src;
      img.alt = image.alt || '';
      var h3 = card.querySelector('h3');
      cap.textContent = h3 ? h3.textContent.trim() : '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      img.src = '';
      cap.textContent = '';
    }

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.media-card');
      if (!card) return;
      e.preventDefault();
      open(card);
    });

    closeBtn.addEventListener('click', close);
    // Close when clicking the dimmed backdrop (outside the image)
    lb.addEventListener('click', function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
  })();

  /* ---- Video gallery: inline player, one active at a time ---- */
  (function () {
    var cards = document.querySelectorAll('.video-grid .video-card');
    if (!cards.length) return;

    var activeCard = null;   // the card currently playing

    function stop(card) {
      if (!card) return;
      var player = card.querySelector('.video-card-player');
      if (player) {
        player.pause();
        player.removeAttribute('src');
        player.load();
        player.remove();
      }
      card.classList.remove('is-playing');
      if (activeCard === card) activeCard = null;
    }

    function activate(card) {
      if (card === activeCard) return;
      // Revert any other currently-playing card to its thumbnail state
      if (activeCard && activeCard !== card) stop(activeCard);

      var src = card.getAttribute('data-video');
      if (!src) return;
      var media = card.querySelector('.video-card-media');
      var video = document.createElement('video');
      video.className = 'video-card-player';
      video.setAttribute('controls', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('preload', 'auto');
      var source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);
      media.appendChild(video);
      card.classList.add('is-playing');
      activeCard = card;

      video.addEventListener('loadedmetadata', function () { video.play(); });
      if (video.readyState >= 1) video.play();
      // Revert to thumbnail when the clip finishes
      video.addEventListener('ended', function () { stop(card); });
    }

    cards.forEach(function (card) {
      var playBtn = card.querySelector('.video-card-play');
      if (playBtn) playBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        activate(card);
      });
      card.addEventListener('click', function (e) {
        if (card.classList.contains('is-playing')) return; // let native controls work
        if (e.target === playBtn) return;
        activate(card);
      });
    });

    // Pause the active clip if the user scrolls it out of view
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting && entry.target === activeCard) stop(activeCard);
        });
      }, { threshold: 0 });
      cards.forEach(function (card) { obs.observe(card); });
    }
  })();

  /* ---- Form: basic client-side feedback ---- */

  /* ---- Form: basic client-side feedback ---- */
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = form.querySelector('.form-success');
      var btn = form.querySelector('button[type="submit"]');
      if (success) {
        // Form has an inline success message — reveal it
        success.classList.add('is-visible');
        if (btn) btn.disabled = true;
        setTimeout(function () {
          success.classList.remove('is-visible');
          form.reset();
          if (btn) btn.disabled = false;
        }, 6000);
      } else if (btn) {
        var orig = btn.textContent;
        btn.textContent = (window.RenueI18n ? RenueI18n.t('Sent! We\'ll be in touch shortly.') : 'Sent! We\'ll be in touch shortly.');
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

/* ---- Language picker ---- */
(function () {
  document.querySelectorAll('.lang-picker').forEach(function (picker) {
    var btn = picker.querySelector('.lang-btn');
    var options = picker.querySelectorAll('.lang-option');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = picker.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        // Hand off to the i18n engine: it persists the choice, swaps the
        // flag/code UI, and translates the whole page.
        if (window.RenueI18n && RenueI18n.setLang) {
          RenueI18n.setLang(opt.dataset.lang);
        }
        picker.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.lang-picker.open').forEach(function (picker) {
      picker.classList.remove('open');
      picker.querySelector('.lang-btn').setAttribute('aria-expanded', 'false');
    });
  });
})();
