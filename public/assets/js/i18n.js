/* Renue Systems — client-side i18n (EN/FR)
   Depends on window.RENUE_I18N_DICT (see translations.js).
   Walks the DOM and swaps English source strings for French translations,
   keyed by exact (decoded, trimmed) text-node / attribute values.
   Persists the chosen language in localStorage and re-applies it on every
   page load so French survives navigation.
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'renue-lang';
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, TEMPLATE: 1 };
  var TRANSLATABLE_ATTRS = ['placeholder', 'alt', 'aria-label', 'title', 'content'];

  /* In-memory store of original English values, keyed by the node/element
     itself. Fresh on every page load (HTML is always English), so toggling
     EN↔FR is idempotent and never accumulates. */
  var textOrig = new WeakMap();   // textNode -> original nodeValue
  var attrOrig = new WeakMap();   // element -> { attr: originalValue }

  var lang = 'en';
  try { lang = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) {}

  var dict = window.RENUE_I18N_DICT || {};
  /* Normalized view of the dictionary: keys are run through norm() so that
     hand-written keys (straight quotes/apostrophes) still match source text
     that uses curly equivalents. */
  var ndict = {};
  function rebuild() {
    ndict = {};
    for (var k in dict) ndict[norm(k)] = dict[k];
  }

  function isFr() { return lang === 'fr'; }

  /** Normalize whitespace so keys are immune to HTML line-wrapping, and
     flatten curly quotes/apostrophes so straight-form keys still match. */
  function norm(s) {
    return String(s).trim()
      .replace(/\s+/g, ' ')
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[“”„‟]/g, '"');
  }

  /** Translate an English string at runtime (for JS-injected text). */
  function t(en) {
    if (!isFr() || en == null) return en;
    var key = norm(en);
    return ndict[key] != null ? ndict[key] : en;
  }

  function setDict(d) { dict = d || {}; rebuild(); }

  /* ---- text nodes ---- */
  function walkText(root) {
    if (!root || !document.createTreeWalker) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        if (!p || SKIP_TAGS[p.nodeName]) return NodeFilter.FILTER_REJECT;
        var v = node.nodeValue;
        if (!v || !v.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var raw = node.nodeValue;
      var trimmed = raw.trim();
      var key = norm(raw);
      if (isFr()) {
        if (ndict[key] != null) {
          if (!textOrig.has(node)) textOrig.set(node, raw);
          var idx = raw.indexOf(trimmed);
          var lead = raw.slice(0, idx);
          var trail = raw.slice(idx + trimmed.length);
          node.nodeValue = lead + ndict[key] + trail;
        }
      } else if (textOrig.has(node)) {
        node.nodeValue = textOrig.get(node);
      }
    }
  }

  /* ---- attributes ---- */
  function walkAttrs(root) {
    if (!root) return;
    var sel = TRANSLATABLE_ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
    var els = root.querySelectorAll(sel);
    Array.prototype.forEach.call(els, function (el) {
      TRANSLATABLE_ATTRS.forEach(function (attr) {
        if (!el.hasAttribute(attr)) return;
        var val = el.getAttribute(attr);
        if (!val || !val.trim()) return;
        var key = norm(val);
        if (isFr()) {
          if (ndict[key] != null) {
            if (!attrOrig.has(el)) attrOrig.set(el, {});
            if (!(attr in attrOrig.get(el))) attrOrig.get(el)[attr] = val;
            el.setAttribute(attr, ndict[key]);
          }
        } else if (attrOrig.has(el)) {
          var store = attrOrig.get(el);
          if (attr in store) el.setAttribute(attr, store[attr]);
        }
      });
    });
  }

  /* ---- <title> + meta ---- */
  function walkHead() {
    var titleEl = document.querySelector('title');
    if (titleEl) {
      var tkey = norm(titleEl.textContent);
      if (isFr() && ndict[tkey] != null) {
        if (!textOrig.has(titleEl)) textOrig.set(titleEl, titleEl.textContent);
        titleEl.textContent = ndict[tkey];
      } else if (textOrig.has(titleEl)) {
        titleEl.textContent = textOrig.get(titleEl);
      }
    }
    ['description', 'og:description', 'og:title'].forEach(function (name) {
      var meta = document.querySelector('meta[name="' + name + '"]') ||
                 document.querySelector('meta[property="' + name + '"]');
      if (!meta) return;
      var val = meta.getAttribute('content');
      if (!val || !val.trim()) return;
      var key = norm(val);
      if (isFr() && ndict[key] != null) {
        if (!attrOrig.has(meta)) attrOrig.set(meta, {});
        if (!('content' in attrOrig.get(meta))) attrOrig.get(meta).content = val;
        meta.setAttribute('content', ndict[key]);
      } else if (attrOrig.has(meta)) {
        var store = attrOrig.get(meta);
        if ('content' in store) meta.setAttribute('content', store.content);
      }
    });
  }

  /* ---- language picker UI sync ---- */
  function syncPickers() {
    document.querySelectorAll('.lang-picker').forEach(function (picker) {
      var options = picker.querySelectorAll('.lang-option');
      var current = null;
      options.forEach(function (o) {
        var match = o.getAttribute('data-lang') === lang;
        o.classList.toggle('lang-active', match);
        if (match) current = o;
      });
      if (current) {
        var flagImg = picker.querySelector('.lang-btn .lang-flag-img');
        if (flagImg && current.dataset.flag) {
          flagImg.src = current.dataset.flag;
          flagImg.alt = current.dataset.code;
        }
        var code = picker.querySelector('.lang-code');
        if (code) code.textContent = current.dataset.code;
      }
    });
  }

  function apply() {
    document.documentElement.lang = isFr() ? 'fr' : 'en';
    walkHead();
    walkText(document.body);
    walkAttrs(document.body);
    syncPickers();
  }

  function setLang(l) {
    lang = (l === 'fr') ? 'fr' : 'en';
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    apply();
    window.dispatchEvent(new CustomEvent('renue:langchange', { detail: { lang: lang } }));
  }

  function getLang() { return lang; }

  /* ---- init ---- */
  function init() {
    /* Honour a saved French choice on first paint of the body. */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply);
    } else {
      apply();
    }
  }

  window.RenueI18n = {
    get lang() { return lang; },
    t: t,
    apply: apply,
    setLang: setLang,
    getLang: getLang,
    setDict: setDict
  };

  /* Set <html lang> as early as possible (before DOMContentLoaded) to
     reduce the English flash for screen readers / document language. */
  document.documentElement.lang = isFr() ? 'fr' : 'en';

  rebuild();
  init();
})();
