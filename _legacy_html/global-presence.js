/* ============================================================
   global-presence.js — CorosDev interactive hero globe
   Depends on: global-presence-data.js (GP_LOCATIONS, GP_CONNECTIONS,
   gpFindLocation), locale.js (CD_TRANSLATIONS, window._cdLang).
   Loads globe.gl from a CDN once the page has settled (so it never
   competes with the hero's initial paint), and degrades gracefully
   without WebGL/JS/network.
   ============================================================ */

(function () {
  const GLOBE_SCRIPT_URL = 'https://unpkg.com/globe.gl';
  // Locally-stored textures (NASA Blue Marble-derived day map + a matching
  // grayscale elevation bump map) — no CDN hotlinking for the Earth imagery.
  const GLOBE_TEXTURE_URL = 'assets/earth/earth-day.jpg';
  const GLOBE_BUMP_URL = 'assets/earth/earth-bump.png';

  const ALT_DEFAULT = 2.5;   // balanced whole-earth view (idle + on close)
  const ALT_PAN = 2.7;       // slightly zoomed-out altitude used while panning between locations
  const ALT_FOCUS = 1.8;     // zoomed-in altitude on a selected location — cinematic, not an extreme close-up
  const PAN_OUT_MS = 500;
  const ROTATE_MS = 1000;
  const ZOOM_IN_MS = 550;
  const CARD_SWITCH_MS = 260; // time given to the outgoing card to fade before panning
  const IDLE_RESUME_MS = 7000;
  const ROTATE_SPEED = 0.3;

  let world = null;
  let markerEls = {};
  let currentId = null;
  let cardOpen = false;
  let animationToken = 0;
  let idleTimer = null;
  let globeInitStarted = false;
  let resizeObserver = null;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function gpT(key) {
    const lang = window._cdLang || 'en';
    // CD_TRANSLATIONS is declared with `const` at the top level of locale.js,
    // so it lives in the shared script scope, not as a window property.
    const table = (typeof CD_TRANSLATIONS !== 'undefined' && CD_TRANSLATIONS[lang]) || {};
    return table[key] !== undefined ? table[key] : key;
  }

  function el(id) {
    return document.getElementById(id);
  }

  /* ── Card rendering ── */
  function renderCard(loc) {
    const bannerImg = el('gp-card-banner-img');
    if (bannerImg && bannerImg.getAttribute('data-loc') !== loc.id) {
      bannerImg.classList.remove('gp-card-banner-img--error');
      bannerImg.src = loc.banner;
      bannerImg.setAttribute('data-loc', loc.id);
    }
    el('gp-card-flag').textContent = loc.countryCode;
    setI18n(el('gp-card-type'), loc.i18n.type);
    setI18n(el('gp-card-title'), loc.i18n.title);
    setI18n(el('gp-card-location'), loc.i18n.location);
    setI18n(el('gp-card-company'), loc.i18n.company);
    setI18n(el('gp-card-address'), loc.i18n.address);
  }

  // If a banner photo 404s (or fails for any other reason), hide the
  // broken-image icon and fall back to the card's own dark background.
  function wireBannerFallback() {
    const bannerImg = el('gp-card-banner-img');
    if (!bannerImg) return;
    bannerImg.addEventListener('error', () => bannerImg.classList.add('gp-card-banner-img--error'));
    bannerImg.addEventListener('load', () => bannerImg.classList.remove('gp-card-banner-img--error'));
  }

  function setI18n(node, key) {
    if (!node) return;
    node.setAttribute('data-i18n', key);
    node.innerHTML = gpT(key);
  }

  /* ── Selector + marker active state ── */
  function updateActiveStates(id) {
    document.querySelectorAll('#gp-selector .gp-selector-btn').forEach(btn => {
      const isActive = btn.dataset.loc === id;
      btn.setAttribute('aria-pressed', String(isActive));
      if (isActive) btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    Object.keys(markerEls).forEach(locId => {
      const marker = markerEls[locId];
      marker.classList.toggle('is-selected', locId === id);
      marker.classList.toggle('is-dimmed', !!id && locId !== id);
    });
  }

  function openCard() {
    cardOpen = true;
    const card = el('gp-card');
    card.hidden = false;
    card.classList.remove('gp-card--visible');
    void card.offsetWidth; // force reflow so the transition replays
    requestAnimationFrame(() => card.classList.add('gp-card--visible'));
  }

  function closeCard() {
    cardOpen = false;
    const card = el('gp-card');
    card.classList.remove('gp-card--visible');
    if (reducedMotion) {
      card.hidden = true;
      return;
    }
    setTimeout(() => {
      if (!cardOpen) card.hidden = true;
    }, 450);
  }

  /* ── Idle auto-rotate resume ── */
  function scheduleIdleResume() {
    clearTimeout(idleTimer);
    if (reducedMotion) return;
    idleTimer = setTimeout(() => {
      if (world && world.controls()) world.controls().autoRotate = true;
    }, IDLE_RESUME_MS);
  }

  function pauseAutoRotate() {
    clearTimeout(idleTimer);
    if (world && world.controls()) world.controls().autoRotate = false;
  }

  /* ── Camera choreography: zoom out -> rotate -> zoom in ── */
  function animateCameraTo(loc, token, done) {
    if (!world) { done(); return; }

    if (reducedMotion) {
      world.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: ALT_FOCUS }, 0);
      done();
      return;
    }

    const current = world.pointOfView();
    world.pointOfView({ lat: current.lat, lng: current.lng, altitude: ALT_PAN }, PAN_OUT_MS);
    setTimeout(() => {
      if (token !== animationToken) return;
      world.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: ALT_PAN }, ROTATE_MS);
      setTimeout(() => {
        if (token !== animationToken) return;
        world.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: ALT_FOCUS }, ZOOM_IN_MS);
        setTimeout(() => {
          if (token === animationToken) done();
        }, ZOOM_IN_MS);
      }, ROTATE_MS);
    }, PAN_OUT_MS);
  }

  /* ── Core selection logic ── */
  function selectLocation(id) {
    const loc = gpFindLocation(id);
    if (!loc || id === currentId) return;

    const needsCardSwitch = cardOpen && currentId !== null;
    currentId = id;
    pauseAutoRotate();
    updateActiveStates(id);

    const token = ++animationToken;
    const proceed = () => {
      if (token !== animationToken) return;
      renderCard(loc);
      animateCameraTo(loc, token, () => {
        if (token !== animationToken) return;
        openCard();
        scheduleIdleResume();
      });
    };

    if (needsCardSwitch) {
      closeCard();
      setTimeout(proceed, reducedMotion ? 0 : CARD_SWITCH_MS);
    } else {
      proceed();
    }
  }

  function handleClose() {
    currentId = null;
    closeCard();
    updateActiveStates(null);
    const token = ++animationToken;
    if (world && !reducedMotion) {
      const current = world.pointOfView();
      world.pointOfView({ lat: current.lat, lng: current.lng, altitude: ALT_DEFAULT }, 700);
    }
    scheduleIdleResume();
  }

  /* ── Marker (HTML element) construction ── */
  function buildMarkerElement(loc) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gp-marker';
    btn.dataset.loc = loc.id;
    btn.tabIndex = -1;
    btn.setAttribute('aria-hidden', 'true');
    btn.style.pointerEvents = 'auto';

    const pulse = document.createElement('span');
    pulse.className = 'gp-marker-pulse';
    const dot = document.createElement('span');
    dot.className = 'gp-marker-dot';
    btn.appendChild(pulse);
    btn.appendChild(dot);

    btn.addEventListener('click', () => selectLocation(loc.id));
    markerEls[loc.id] = btn;
    return btn;
  }

  /* ── Globe construction ── */
  function buildGlobe(container) {
    const arcs = GP_CONNECTIONS.map(conn => {
      const from = gpFindLocation(conn.from);
      const to = gpFindLocation(conn.to);
      return {
        startLat: from.lat, startLng: from.lng,
        endLat: to.lat, endLng: to.lng
      };
    });

    world = Globe()(container)
      .width(container.clientWidth)
      .height(container.clientHeight)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl(GLOBE_TEXTURE_URL)
      .bumpImageUrl(GLOBE_BUMP_URL)
      .showAtmosphere(true)
      .atmosphereColor('#5fb0ff')
      .atmosphereAltitude(0.16)
      .htmlElementsData(GP_LOCATIONS)
      .htmlElement(buildMarkerElement)
      .arcsData(arcs)
      .arcColor(() => ['rgba(125,187,255,0.35)', 'rgba(31,127,255,0.6)'])
      .arcStroke(0.32)
      .arcDashLength(0.4)
      .arcDashGap(2.2)
      .arcDashAnimateTime(reducedMotion ? 0 : 3600)
      .arcAltitudeAutoScale(0.28)
      .pointOfView({ lat: 15, lng: -42, altitude: ALT_DEFAULT }, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    if (world.renderer) world.renderer().setPixelRatio(dpr);

    tuneLighting();
    tuneGlobeMaterial();

    const controls = world.controls();
    if (controls) {
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = ROTATE_SPEED;
      controls.enableZoom = false; // scroll should scroll the page, not zoom the globe
      controls.enablePan = false;
      ['start', 'end'].forEach(evt => {
        controls.addEventListener(evt, () => {
          if (evt === 'start') pauseAutoRotate();
          else scheduleIdleResume();
        });
      });
    }

    if (resizeObserver) resizeObserver.disconnect();
    resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry || !world) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) world.width(width).height(height);
    });
    // Observe the canvas mount itself (not its wrapper) — it's intentionally
    // sized larger than the wrapper via CSS for zoom safety margin, and
    // that's the box three.js should actually render into.
    resizeObserver.observe(container);
  }

  // Mutates the scene's existing default lights (globe.gl always creates an
  // AmbientLight + DirectionalLight) rather than constructing new THREE
  // objects — the CDN UMD bundle doesn't expose a `THREE` global, so this
  // is the only dependency-free way to adjust lighting.
  function tuneLighting() {
    if (!world || typeof world.lights !== 'function') return;
    const lights = world.lights() || [];
    lights.forEach(light => {
      if (light.type === 'AmbientLight') {
        // Keep the night side dim but never pure black — continents stay readable.
        light.intensity = 1.6;
      } else if (light.type === 'DirectionalLight') {
        light.intensity = 1.5;
        if (light.position && light.position.set) light.position.set(1, 0.6, 1);
      }
    });
  }

  // Adds a subtle polished-ocean sheen by mutating the material's existing
  // Color/number properties in place — again avoiding any need for THREE.
  function tuneGlobeMaterial() {
    if (!world || typeof world.globeMaterial !== 'function') return;
    const material = world.globeMaterial();
    if (!material) return;
    material.bumpScale = 6;
    material.shininess = 12;
    if (material.specular && material.specular.set) material.specular.set('#223a55');
  }

  /* ── Fallback (no WebGL / script failed to load) ── */
  function activateFallback() {
    const note = el('gp-fallback-note');
    if (note) note.hidden = false;
  }

  function supportsWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function loadGlobeScript() {
    return new Promise((resolve, reject) => {
      if (window.Globe) return resolve();
      const script = document.createElement('script');
      script.src = GLOBE_SCRIPT_URL;
      script.async = true;
      script.onload = () => (window.Globe ? resolve() : reject(new Error('globe.gl did not initialize')));
      script.onerror = () => reject(new Error('Failed to load globe.gl'));
      document.head.appendChild(script);
    });
  }

  function initGlobeWhenReady() {
    if (globeInitStarted) return;
    globeInitStarted = true;

    if (!supportsWebGL()) {
      activateFallback();
      return;
    }

    loadGlobeScript()
      .then(() => {
        const canvas = el('gp-globe-canvas');
        if (canvas) buildGlobe(canvas);
      })
      .catch(() => activateFallback());
  }

  // The globe sits in the hero, already in the first viewport, so there is
  // nothing to lazy-load-on-scroll — instead we defer the heavy CDN fetch +
  // WebGL init until the browser is idle / the page has finished its first
  // paint, so it never competes with the hero text/CTA for load time.
  function scheduleGlobeInit() {
    const ric = window.requestIdleCallback || function (cb) { return setTimeout(cb, 400); };
    const kickoff = () => ric(initGlobeWhenReady, { timeout: 2000 });
    if (document.readyState === 'complete') kickoff();
    else window.addEventListener('load', kickoff, { once: true });
  }

  /* ── Visibility handling: pause rendering when hidden/offscreen ── */
  function pauseRendering() {
    if (world && typeof world.pauseAnimation === 'function') world.pauseAnimation();
  }

  function resumeRendering() {
    if (world && typeof world.resumeAnimation === 'function') world.resumeAnimation();
  }

  function handleVisibilityChange() {
    if (document.hidden) pauseRendering();
    else resumeRendering();
  }

  function wireSelector() {
    const selector = el('gp-selector');
    if (!selector) return;
    selector.addEventListener('click', e => {
      const btn = e.target.closest('.gp-selector-btn');
      if (btn) selectLocation(btn.dataset.loc);
    });
  }

  function wireCloseButton() {
    const closeBtn = el('gp-card-close');
    if (closeBtn) closeBtn.addEventListener('click', handleClose);
  }

  // Translates the handful of aria-label attributes locale.js's data-i18n
  // pass doesn't touch (it only updates innerHTML/placeholder).
  function applyAriaLabels() {
    document.querySelectorAll('#hero-globe-stage [data-aria-key]').forEach(node => {
      node.setAttribute('aria-label', gpT(node.dataset.ariaKey));
    });
  }

  function init() {
    const stage = el('hero-globe-stage');
    if (!stage) return;

    wireSelector();
    wireCloseButton();
    wireBannerFallback();
    updateActiveStates(null);
    applyAriaLabels();

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.addEventListener('click', () => setTimeout(applyAriaLabels, 0));
    // Safety net: re-apply once the async IP-geolocation language detection
    // in locale.js has had time to resolve and possibly override the guess.
    setTimeout(applyAriaLabels, 3000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Pause/resume the render loop once the hero scrolls off-screen.
    const viewportObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) resumeRendering();
        else pauseRendering();
      });
    }, { threshold: 0 });
    viewportObserver.observe(stage);

    scheduleGlobeInit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
