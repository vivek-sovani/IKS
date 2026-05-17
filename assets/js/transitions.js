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

  /* ── Navigate helper ─────────────────────────────── */
  function goTo(href, direction) {
    sessionStorage.setItem('iks-nav-dir', direction);
    main.classList.remove('page-enter-right', 'page-enter-left', 'page-enter-home');
    main.classList.add(direction === 'next' ? 'page-exit-left' : 'page-exit-right');
    setTimeout(function () { window.location.href = href; }, 270);
  }

  /* ── Nav-button clicks ───────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.nav-btn');
    if (!btn || !btn.href) return;
    e.preventDefault();
    goTo(btn.href, btn.classList.contains('right') ? 'next' : 'prev');
  });

  /* ── Swipe gesture ───────────────────────────────── */
  var touchStartX = 0, touchStartY = 0;

  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;

    /* Only handle horizontal swipes (dx dominant, > 60px) */
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    var navNext = document.querySelector('.nav-btn.right');
    var navPrev = document.querySelector('.nav-btn:not(.right)');

    if (dx < 0 && navNext) goTo(navNext.href, 'next');   /* swipe left  → next */
    if (dx > 0 && navPrev) goTo(navPrev.href, 'prev');   /* swipe right → prev */
  }, { passive: true });

  /* ── Swipe hint (first visit only) ──────────────────
     Shows once per browser session on article pages.
     Dismissed automatically after 3 s or on first swipe/click. */
  var hasNav = document.querySelector('.nav-btn');
  if (!hasNav) return;

  var shown = sessionStorage.getItem('iks-hint-shown');
  if (shown) return;
  sessionStorage.setItem('iks-hint-shown', '1');

  var hint = document.createElement('div');
  hint.id = 'swipe-hint';
  hint.innerHTML =
    '<span class="sh-arrow sh-left">‹</span>' +
    '<span class="sh-text" data-lang="mr">स्वाइप करा — पृष्ठ बदला</span>' +
    '<span class="sh-text" data-lang="en" style="display:none">Swipe to turn pages</span>' +
    '<span class="sh-arrow sh-right">›</span>';
  document.body.appendChild(hint);

  /* Match the active language */
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
