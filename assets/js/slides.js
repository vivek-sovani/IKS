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
  const ZOOM_MAX     = 3.0;

  // Per-viewer state keyed by element id
  const _state = {};
  // Track in-flight loads to prevent races (maps id → url being loaded)
  const _loading = {};

  // ── Init ──────────────────────────────────────────────────────────────────

  function initSlides() {
    if (typeof pdfjsLib === 'undefined') return;
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

    document.querySelectorAll('.slide-viewer').forEach(function (viewer) {
      _setupInteraction(viewer);
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

    // Already showing this exact PDF — just re-render (zoom change / resize)
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

      // Store native page width for scale computations (avoids repeated getPage calls)
      var firstPage = await pdf.getPage(1);
      var nativeVP  = firstPage.getViewport({ scale: 1.0 });
      var track     = viewer.querySelector('.slide-track');
      var trackW    = _trackInnerWidth(track);
      var baseScale = trackW / nativeVP.width;

      _state[id] = {
        pdf:         pdf,
        url:         url,
        nativeW:     nativeVP.width,   // stored; no need to re-fetch page 1 later
        nativeH:     nativeVP.height,
        baseScale:   baseScale,
        zoom:        (_state[id] && _state[id].zoom) || 1.0
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
    var track = viewer.querySelector('.slide-track');
    var inner = viewer.querySelector('.slide-inner');
    var state = _state[id];
    if (!state) return;

    // Always recompute baseScale from the live track width (handles resize / font changes)
    var trackW      = _trackInnerWidth(track);
    state.baseScale = trackW / state.nativeW;

    var scale = state.baseScale * state.zoom;
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

    // Set track height to exactly fit one page (no more, no less)
    var firstCanvas = inner.querySelector('.slide-page canvas');
    if (firstCanvas) {
      var cs   = getComputedStyle(track);
      var padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      track.style.height = (firstCanvas.height + padV) + 'px';
    }
  }

  // ── Public: switch language ───────────────────────────────────────────────

  function switchSlideLang(btn, lang) {
    var viewer = btn.closest('.slide-viewer');
    _syncLangButtons(viewer, lang);
    _loadViewer(viewer, lang);
  }

  // ── Public: open PDF in new tab ───────────────────────────────────────────

  function openSlidesPdf(btn) {
    var viewer = btn.closest('.slide-viewer');
    var lang   = (IKS && IKS.getLang) ? IKS.getLang() : 'mr';
    var url    = lang === 'en' ? viewer.dataset.pdfEn : viewer.dataset.pdfMr;
    if (url) window.open(url, '_blank');
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

  // ── Interaction: drag-scroll (desktop) + pinch-zoom (mobile) ─────────────

  function _setupInteraction(viewer) {
    var track = viewer.querySelector('.slide-track');
    var id    = viewer.id;
    if (!track) return;

    // ── Desktop drag-scroll ───────────────────────────────────────────────
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

    // ── Mobile pinch-zoom ─────────────────────────────────────────────────
    // Strategy: live visual feedback via CSS transform during pinch;
    // re-render at new zoom on touchend (avoids per-frame PDF.js re-render).
    var pinching = false, pinchDist0 = 0, pinchZoom0 = 1;

    track.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        pinching   = true;
        pinchDist0 = _touchDist(e.touches);
        pinchZoom0 = (_state[id] && _state[id].zoom) || 1.0;
        e.preventDefault(); // prevent browser native zoom
      }
    }, { passive: false });

    track.addEventListener('touchmove', function (e) {
      if (!pinching || e.touches.length < 2) return;
      var ratio = _touchDist(e.touches) / pinchDist0;
      var z     = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN,
                    Math.round(pinchZoom0 * ratio * 100) / 100));
      // Live visual scale on the inner container (no re-render yet — too slow)
      var inner = viewer.querySelector('.slide-inner');
      inner.style.transformOrigin = '0 0';
      inner.style.transform       = 'scale(' + (z / pinchZoom0) + ')';
      // Update state + display so button % is in sync
      if (_state[id]) {
        _state[id].zoom = z;
        _updateZoomDisplay(viewer, z);
      }
      e.preventDefault();
    }, { passive: false });

    track.addEventListener('touchend', function (e) {
      if (!pinching) return;
      if (e.touches.length < 2) {
        pinching = false;
        // Reset transform, then re-render at the committed zoom
        var inner = viewer.querySelector('.slide-inner');
        inner.style.transform = '';
        _renderPages(id);
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Returns the usable inner width of the track element (total width minus
   * horizontal padding). Uses getBoundingClientRect for accuracy on mobile
   * (clientWidth can be stale if layout hasn't settled).
   */
  function _trackInnerWidth(track) {
    var cs   = getComputedStyle(track);
    var padH = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var w    = (track.getBoundingClientRect().width || track.clientWidth || 640) - padH;
    return w > 20 ? w : 600;
  }

  function _touchDist(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  function _syncLangButtons(viewer, lang) {
    viewer.querySelectorAll('.slide-lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function _updateZoomDisplay(viewer, z) {
    var pct = viewer.querySelector('.zoom-pct');
    if (pct) pct.textContent = Math.round(z * 100) + '%';
  }

  // ── Attach to IKS global ──────────────────────────────────────────────────

  window.IKS = window.IKS || {};
  IKS.initSlides      = initSlides;
  IKS.switchSlideLang = switchSlideLang;
  IKS.zoomSlides      = zoomSlides;
  IKS.openSlidesPdf   = openSlidesPdf;

})();
