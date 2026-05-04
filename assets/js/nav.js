/* ════════════════════════════════════════════════════
   NAV.JS — Sidebar, Language Toggle, Shared Components
   ════════════════════════════════════════════════════ */

const IKS = (() => {

  /* ── Language ─────────────────────────────── */
  let lang = localStorage.getItem('iks-lang') || 'mr';

  /* ── Font size ────────────────────────────── */
  let fontSize = localStorage.getItem('iks-fs') || 'md';
  if (fontSize === 'sm') { fontSize = 'md'; localStorage.setItem('iks-fs', 'md'); }

  function setFontSize(level) {
    fontSize = level;
    document.documentElement.setAttribute('data-fs', level);
    localStorage.setItem('iks-fs', level);
    document.querySelectorAll('[data-fs-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.fsBtn === level);
    });
  }

  function setLang(l) {
    lang = l;
    localStorage.setItem('iks-lang', l);
    document.documentElement.lang = l === 'mr' ? 'mr' : 'en';
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.langBtn === l);
    });
    document.querySelectorAll('[data-mr]').forEach(el => {
      el.style.display = l === 'mr' ? '' : 'none';
    });
    document.querySelectorAll('[data-en]').forEach(el => {
      el.style.display = l === 'en' ? '' : 'none';
    });
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.style.display = el.dataset.lang === l ? '' : 'none';
    });
  }

  function getLang() { return lang; }

  /* ── Sidebar ──────────────────────────────── */
  let sidebarOpen = false;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const ham = document.getElementById('hamburger');
    if (sb) sb.classList.toggle('open', sidebarOpen);
    if (overlay) {
      overlay.classList.toggle('visible', sidebarOpen);
      overlay.style.display = sidebarOpen ? 'block' : '';
    }
    if (ham) ham.classList.toggle('open', sidebarOpen);
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
  }

  function closeSidebar() {
    sidebarOpen = false;
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const ham = document.getElementById('hamburger');
    if (sb) sb.classList.remove('open');
    if (overlay) { overlay.classList.remove('visible'); overlay.style.display = ''; }
    if (ham) ham.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Section collapse ─────────────────────── */
  function toggleSection(id) {
    const sec = document.getElementById('sec-' + id);
    if (!sec) return;
    sec.classList.toggle('open');
  }

  function openSection(id) {
    const sec = document.getElementById('sec-' + id);
    if (sec) sec.classList.add('open');
  }

  /* ── Active article highlight ─────────────── */
  function setActiveArticle(num) {
    document.querySelectorAll('.sb-art-link').forEach(a => {
      a.classList.toggle('active', a.dataset.art === num);
    });
    // Auto-open the section containing this article
    const link = document.querySelector(`.sb-art-link[data-art="${num}"]`);
    if (link) {
      const sec = link.closest('.sb-section');
      if (sec) sec.classList.add('open');
    }
  }

  /* ── Init ─────────────────────────────────── */
  function init() {
    // Apply saved language and font size
    setLang(lang);
    setFontSize(fontSize);

    // Hamburger
    const ham = document.getElementById('hamburger');
    if (ham) ham.addEventListener('click', toggleSidebar);

    // Overlay click closes sidebar
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Close sidebar on article link click (mobile)
    document.querySelectorAll('.sb-art-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 860) closeSidebar();
      });
    });

    // Keyboard: Escape closes sidebar
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebarOpen) closeSidebar();
    });
  }

  return { setLang, getLang, setFontSize, toggleSidebar, closeSidebar, toggleSection, openSection, setActiveArticle, init };
})();

document.addEventListener('DOMContentLoaded', IKS.init);
