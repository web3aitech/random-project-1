/* Renue Systems — client-side i18n (EN/FR)
   Depends on window.RENUE_I18N_DICT (FR) and window.RENUE_I18N_DICT_ES (ES)
   — see translations.js.
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

  /* Per-language dictionaries. EN is the source language (no dict needed);
     every other language maps normalized English -> translated string. New
     languages are added by registering a dict here and in setLang(). */
  var DICTS = {
    fr: window.RENUE_I18N_DICT,
    es: window.RENUE_I18N_DICT_ES
  };
  function activeDict() { return DICTS[lang] || {}; }

  /* Normalized view of the active dictionary: keys are run through norm() so
     that hand-written keys (straight quotes/apostrophes) still match source
     text that uses curly equivalents. */
  var ndict = {};
  function rebuild() {
    ndict = {};
    var dict = activeDict();
    for (var k in dict) ndict[norm(k)] = dict[k];
  }

  function isTranslated() { return lang !== 'en'; }

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
    if (!isTranslated() || en == null) return en;
    var key = norm(en);
    return ndict[key] != null ? ndict[key] : en;
  }

  /** Replace the active language's dictionary at runtime. */
  function setDict(d) { DICTS[lang] = d || {}; rebuild(); }

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
      /* The English source for this node: the original we captured the first
         time we translated it, otherwise the current (still-English) value.
         Keying off the source — not the live nodeValue — lets us switch
         directly between any two translated languages (e.g. es <-> fr)
         without stale text lingering from the previous language. */
      var source = textOrig.has(node) ? textOrig.get(node) : node.nodeValue;
      var trimmed = source.trim();
      var key = norm(source);
      if (isTranslated()) {
        if (ndict[key] != null) {
          if (!textOrig.has(node)) textOrig.set(node, node.nodeValue);
          var idx = source.indexOf(trimmed);
          var lead = source.slice(0, idx);
          var trail = source.slice(idx + trimmed.length);
          node.nodeValue = lead + ndict[key] + trail;
        } else if (textOrig.has(node)) {
          /* No translation for this string in the active language: fall back
             to the English original rather than leaving the previous lang. */
          node.nodeValue = textOrig.get(node);
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
        /* Key off the stored English original (see walkText) so direct
           switches between translated languages re-translate correctly. */
        var store = attrOrig.has(el) ? attrOrig.get(el) : null;
        var source = (store && attr in store) ? store[attr] : val;
        var key = norm(source);
        if (isTranslated()) {
          if (ndict[key] != null) {
            if (!store) { store = {}; attrOrig.set(el, store); }
            if (!(attr in store)) store[attr] = val;
            el.setAttribute(attr, ndict[key]);
          } else if (store && attr in store) {
            el.setAttribute(attr, store[attr]);
          }
        } else if (store && attr in store) {
          el.setAttribute(attr, store[attr]);
        }
      });
    });
  }

  /* ---- <title> + meta ---- */
  function walkHead() {
    var titleEl = document.querySelector('title');
    if (titleEl) {
      /* Key off the stored English original (see walkText). */
      var tsource = textOrig.has(titleEl) ? textOrig.get(titleEl) : titleEl.textContent;
      var tkey = norm(tsource);
      if (isTranslated() && ndict[tkey] != null) {
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
      var store = attrOrig.has(meta) ? attrOrig.get(meta) : null;
      var source = (store && 'content' in store) ? store.content : val;
      var key = norm(source);
      if (isTranslated() && ndict[key] != null) {
        if (!store) { store = {}; attrOrig.set(meta, store); }
        if (!('content' in store)) store.content = val;
        meta.setAttribute('content', ndict[key]);
      } else if (store && 'content' in store) {
        meta.setAttribute('content', store.content);
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
    document.documentElement.lang = lang;
    walkHead();
    walkText(document.body);
    walkAttrs(document.body);
    syncPickers();
  }

  function setLang(l) {
    if (l !== 'fr' && l !== 'es') l = 'en';
    lang = l;
    rebuild();
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
  document.documentElement.lang = lang;

  rebuild();
  init();
})();
