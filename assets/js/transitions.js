/* IKS Page-Turn Transitions + Swipe Navigation */
(function () {
  var main = document.querySelector('main');
  if (!main) return;

  /* ── Entry animation ─────────────────────────────── */
  var dir = sessionStorage.getItem('iks-nav-dir') || 'home';
  sessionStorage.removeItem('iks-nav-dir');

  if (dir === 'next')       main.classList.add('page-enter-right');
  else if (dir === 'prev')  main.classList.add('page-enter-left');
  else                      main.classList.add('page-enter-home');

  /* ── Shadow sweep overlay ───────────────────────────
     A gradient that darkens the page as it turns edge-on,
     selling the illusion of paper catching less light. */
  function addShadow(cls, duration) {
    var s = document.createElement('div');
    s.className = 'pt-shadow ' + cls;
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, duration + 100);
    return s;
  }

  /* Apply entry shadow (called on page load) */
  if (dir === 'next')       addShadow('shadow-enter-right', 450);
  else if (dir === 'prev')  addShadow('shadow-enter-left',  450);

  /* ── Navigate helper ─────────────────────────────── */
  function goTo(href, direction) {
    sessionStorage.setItem('iks-nav-dir', direction);
    main.classList.remove('page-enter-right', 'page-enter-left', 'page-enter-home');
    var exitClass   = direction === 'next' ? 'page-exit-left'      : 'page-exit-right';
    var shadowClass = direction === 'next' ? 'shadow-exit-left'    : 'shadow-exit-right';
    main.classList.add(exitClass);
    addShadow(shadowClass, 300);
    setTimeout(function () { window.location.href = href; }, 310);
  }

  /* ── Nav-button clicks ───────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.nav-btn');
    if (!btn || !btn.href) return;
    e.preventDefault();
    goTo(btn.href, btn.classList.contains('right') ? 'next' : 'prev');
  });

  /* ── Swipe gesture (edge-only) ──────────────────────
     Only fires when the touch STARTS within the outer 22% of
     screen width — avoids conflict with images and content. */
  var touchStartX = 0, touchStartY = 0, touchEdge = false;
  var EDGE_ZONE = 0.22;   /* fraction of screen width */
  var MIN_SWIPE = 55;     /* minimum horizontal distance in px */

  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    var sw = window.innerWidth;
    touchEdge = touchStartX < sw * EDGE_ZONE          /* left edge  → prev */
             || touchStartX > sw * (1 - EDGE_ZONE);   /* right edge → next */
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (!touchEdge) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;

    /* Reject if not clearly horizontal */
    if (Math.abs(dx) < MIN_SWIPE || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    var navNext = document.querySelector('.nav-btn.right');
    var navPrev = document.querySelector('.nav-btn:not(.right)');

    if (dx < 0 && navNext) goTo(navNext.href, 'next');   /* swipe left  → next */
    if (dx > 0 && navPrev) goTo(navPrev.href, 'prev');   /* swipe right → prev */
  }, { passive: true });

  /* ── Edge handle buttons (touch devices) ────────────
     Thin translucent strips on left/right edge — tap or
     swipe from there to go prev/next without ambiguity. */
  function buildEdgeHandles() {
    var navNext = document.querySelector('.nav-btn.right');
    var navPrev = document.querySelector('.nav-btn:not(.right)');
    if (!navNext && !navPrev) return;

    if (navPrev) {
      var lh = document.createElement('a');
      lh.className = 'nav-btn-edge edge-left';
      lh.href = navPrev.href;
      lh.setAttribute('aria-label', 'Previous article');
      lh.textContent = '‹';
      lh.addEventListener('click', function (e) {
        e.preventDefault();
        goTo(navPrev.href, 'prev');
      });
      document.body.appendChild(lh);
    }

    if (navNext) {
      var rh = document.createElement('a');
      rh.className = 'nav-btn-edge edge-right';
      rh.href = navNext.href;
      rh.setAttribute('aria-label', 'Next article');
      rh.textContent = '›';
      rh.addEventListener('click', function (e) {
        e.preventDefault();
        goTo(navNext.href, 'next');
      });
      document.body.appendChild(rh);
    }
  }

  /* Run after sidebar is injected (nav-btn links are in .art-nav, always present) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildEdgeHandles);
  } else {
    buildEdgeHandles();
  }

  /* ── Poster image hint ───────────────────────────────
     Inline banner below the summary box, shown on every
     chapter load. Independent of the swipe-hint session.
     Removed only if no poster exists for this article.   */
  (function () {
    var summary    = document.querySelector('.summary-box');
    var posterImgs = document.querySelectorAll('#art-photo-panel .art-photo-img');
    if (!summary || !posterImgs.length) return;

    var btn = document.createElement('button');
    btn.id = 'infographic-hint';
    btn.setAttribute('aria-label', 'दृश्यात्मक विवरण / Visual Explanation');
    btn.innerHTML =
      '<span class="ih-icon">◈</span>' +
      '<span data-lang="mr">दृश्यात्मक विवरण</span>' +
      '<span data-lang="en" style="display:none">Visual Explanation</span>';

    if (typeof IKS !== 'undefined' && IKS.getLang) {
      var l = IKS.getLang();
      btn.querySelectorAll('[data-lang]').forEach(function (el) {
        el.style.display = el.dataset.lang === l ? '' : 'none';
      });
    }

    /* Wrap hint + summary together in a flex row.
       Hint tab sits left of the summary's existing left border. */
    var wrap = document.createElement('div');
    wrap.className = 'ih-wrap';
    summary.parentNode.insertBefore(wrap, summary);
    wrap.appendChild(btn);
    wrap.appendChild(summary);   /* summary moves inside wrap */

    /* Remove wrap if every poster image fails to load */
    var errCount = 0;
    posterImgs.forEach(function (img) {
      img.addEventListener('error', function () {
        if (++errCount === posterImgs.length) {
          /* Unwrap: put summary back and remove hint */
          wrap.parentNode.insertBefore(summary, wrap);
          wrap.remove();
        }
      });
    });

    btn.addEventListener('click', function () {
      var panel = document.getElementById('art-photo-panel');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }());

  /* ── Swipe hint (first visit per session only) ───────
     Dismissed automatically after 3 s or on first touch. */
  var hasNav = document.querySelector('.nav-btn');
  if (!hasNav) return;

  var shown = sessionStorage.getItem('iks-hint-shown');
  if (shown) return;
  sessionStorage.setItem('iks-hint-shown', '1');

  var hint = document.createElement('div');
  hint.id = 'swipe-hint';
  hint.innerHTML =
    '<span class="sh-arrow sh-left">‹</span>' +
    '<span class="sh-text" data-lang="mr">कडेवरून स्वाइप करा — पृष्ठ बदला</span>' +
    '<span class="sh-text" data-lang="en" style="display:none">Swipe from edge to turn pages</span>' +
    '<span class="sh-arrow sh-right">›</span>';
  document.body.appendChild(hint);

  if (typeof IKS !== 'undefined' && IKS.getLang) {
    var lang = IKS.getLang();
    hint.querySelectorAll('[data-lang]').forEach(function (el) {
      el.style.display = el.dataset.lang === lang ? '' : 'none';
    });
  }

  function dismissHint() {
    hint.classList.add('sh-hide');
    setTimeout(function () { hint.remove(); }, 500);
  }

  var timer = setTimeout(dismissHint, 3200);
  hint.addEventListener('click', function () { clearTimeout(timer); dismissHint(); });
  document.addEventListener('touchstart', function () {
    clearTimeout(timer); dismissHint();
  }, { once: true, passive: true });
})();
