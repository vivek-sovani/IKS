/**
 * slides.js — PDF slide viewer for IKS articles
 *
 * Requires PDF.js to be loaded before this script.
 * Initialise by calling IKS.initSlides() after DOMContentLoaded.
 *
 * content.json block:
 *   { "type": "slides", "titleMr": "...", "titleEn": "...",
 *     "srcMr": "slides/slides-mr.pdf", "srcEn": "slides/slides-en.pdf" }
 *
 * HTML hooks (on .slide-viewer):
 *   data-pdf-mr  — path to Marathi PDF (omit or leave blank if unavailable)
 *   data-pdf-en  — path to English PDF (omit or leave blank if unavailable)
 */

(function () {
  'use strict';

  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const ZOOM_MIN     = 0.5;
  const ZOOM_MAX     = 2.0;

  // Per-viewer state keyed by element id
  const _state = {};
  // Track in-flight loads to prevent races (maps id → url being loaded)
  const _loading = {};

  // ── Init ──────────────────────────────────────────────────────────────────

  function initSlides() {
    if (typeof pdfjsLib === 'undefined') return;
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

    document.querySelectorAll('.slide-viewer').forEach(function (viewer) {
      _setupDragScroll(viewer.querySelector('.slide-track'));
      var lang = (IKS && IKS.getLang) ? IKS.getLang() : 'mr';
      _loadViewer(viewer, lang);
    });

    // Sync with global language toggle
    if (IKS && IKS.setLang) {
      var _orig = IKS.setLang.bind(IKS);
      IKS.setLang = function (lang) {
        _orig(lang);
        document.querySelectorAll('.slide-viewer').forEach(function (viewer) {
          _syncLangButtons(viewer, lang);
          _loadViewer(viewer, lang);
        });
      };
    }
  }

  // ── Load PDF into a viewer ────────────────────────────────────────────────

  async function _loadViewer(viewer, lang) {
    var id  = viewer.id;
    var url = lang === 'en' ? viewer.dataset.pdfEn : viewer.dataset.pdfMr;

    // No URL for this language — hide the viewer entirely
    if (!url) {
      viewer.style.display = 'none';
      return;
    }

    // Already showing this exact PDF — just re-render (zoom change)
    if (_state[id] && _state[id].url === url) {
      viewer.style.display = '';
      _renderPages(id);
      return;
    }

    // Debounce: skip if the same URL is already in flight
    if (_loading[id] === url) return;
    _loading[id] = url;

    var inner = viewer.querySelector('.slide-inner');
    inner.innerHTML = '<div class="slide-loading">लोड होत आहे… / Loading…</div>';

    try {
      var pdf = await pdfjsLib.getDocument(url).promise;
      // Abort if a newer request has superseded this one
      if (_loading[id] !== url) return;

      // Compute base scale: fit the slide width to the track's inner width
      var firstPage = await pdf.getPage(1);
      var nativeVP  = firstPage.getViewport({ scale: 1.0 });
      var trackPad  = 32; // 2 × 16px padding
      var trackW    = (viewer.querySelector('.slide-track').clientWidth || 640) - trackPad;
      var baseScale = trackW / nativeVP.width;

      _state[id] = {
        pdf:       pdf,
        url:       url,
        baseScale: baseScale,
        zoom:      (_state[id] && _state[id].zoom) || 1.0
      };
      delete _loading[id];

      viewer.style.display = '';
      _syncLangButtons(viewer, lang);
      _updateZoomDisplay(viewer, _state[id].zoom);
      await _renderPages(id);
    } catch (e) {
      delete _loading[id];
      // PDF URL was set but file doesn't exist — hide the viewer
      viewer.style.display = 'none';
    }
  }

  // ── Render all pages at current zoom ─────────────────────────────────────

  async function _renderPages(id) {
    var viewer = document.getElementById(id);
    if (!viewer) return;
    var inner = viewer.querySelector('.slide-inner');
    var state = _state[id];
    if (!state) return;

    var scale = (state.baseScale || 1.0) * state.zoom;
    inner.innerHTML = '';

    for (var i = 1; i <= state.pdf.numPages; i++) {
      var page     = await state.pdf.getPage(i);
      var viewport = page.getViewport({ scale: scale });
      var canvas   = document.createElement('canvas');
      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      var wrap = document.createElement('div');
      wrap.className = 'slide-page';
      wrap.setAttribute('data-page', i);
      wrap.appendChild(canvas);
      inner.appendChild(wrap);

      page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport });
    }

    // Fit track height to first page + padding
    var firstCanvas = inner.querySelector('.slide-page canvas');
    if (firstCanvas) {
      viewer.querySelector('.slide-track').style.height =
        (firstCanvas.height + 32) + 'px';
    }
  }

  // ── Public: switch language ───────────────────────────────────────────────

  function switchSlideLang(btn, lang) {
    var viewer = btn.closest('.slide-viewer');
    _syncLangButtons(viewer, lang);
    _loadViewer(viewer, lang);
  }

  // ── Public: zoom ──────────────────────────────────────────────────────────

  async function zoomSlides(btn, delta) {
    var viewer = btn.closest('.slide-viewer');
    var id     = viewer.id;
    if (!_state[id]) return;
    var z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN,
              Math.round((_state[id].zoom + delta) * 100) / 100));
    _state[id].zoom = z;
    _updateZoomDisplay(viewer, z);
    await _renderPages(id);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function _syncLangButtons(viewer, lang) {
    viewer.querySelectorAll('.slide-lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function _updateZoomDisplay(viewer, z) {
    var pct = viewer.querySelector('.zoom-pct');
    if (pct) pct.textContent = Math.round(z * 100) + '%';
  }

  function _setupDragScroll(track) {
    if (!track) return;
    var dragging = false, startX, scrollLeft;
    track.addEventListener('mousedown', function (e) {
      dragging   = true;
      startX     = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
      e.preventDefault();
    });
    track.addEventListener('mouseleave', function () { dragging = false; track.style.cursor = 'grab'; });
    track.addEventListener('mouseup',    function () { dragging = false; track.style.cursor = 'grab'; });
    track.addEventListener('mousemove',  function (e) {
      if (!dragging) return;
      track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.2;
    });
  }

  // ── Attach to IKS global ──────────────────────────────────────────────────

  window.IKS = window.IKS || {};
  IKS.initSlides      = initSlides;
  IKS.switchSlideLang = switchSlideLang;
  IKS.zoomSlides      = zoomSlides;

})();
