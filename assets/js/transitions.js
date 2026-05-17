/* IKS Page-Turn Transitions */
(function () {
  var main = document.querySelector('main');
  if (!main) return;

  /* Apply entry animation based on direction stored before navigation */
  var dir = sessionStorage.getItem('iks-nav-dir') || 'home';
  sessionStorage.removeItem('iks-nav-dir');

  if (dir === 'next')  main.classList.add('page-enter-right');
  else if (dir === 'prev') main.classList.add('page-enter-left');
  else                 main.classList.add('page-enter-home');

  /* Intercept prev/next nav-btn clicks */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.nav-btn');
    if (!btn || !btn.href) return;

    e.preventDefault();
    var isNext = btn.classList.contains('right');
    var href   = btn.href;

    sessionStorage.setItem('iks-nav-dir', isNext ? 'next' : 'prev');

    /* Remove entry class, add exit class, then navigate */
    main.classList.remove('page-enter-right', 'page-enter-left', 'page-enter-home');
    main.classList.add(isNext ? 'page-exit-left' : 'page-exit-right');

    setTimeout(function () { window.location.href = href; }, 270);
  });
})();
