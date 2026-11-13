(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const communities = window.SDH_PORTAL_DATA || [];
  const geojson = window.SDH_MUNICIPIOS_GEOJSON || { features: [] };
  const neighboringStates = window.SDH_ESTADOS_VECINOS || { features: [] };

  // =========================================================================
  // 1. Proyección Geográfica Web Mercator (EPSG:3857) en SVG (1000 x 800 px)
  // =========================================================================
  const SVG_W = 1000, SVG_H = 800, PAD = 35;
  const MAX_ZOOM = 240;

  function getPolygons(f) {
    if (!f || !f.geometry) return [];
    if (f.geometry.type === 'Polygon') return [f.geometry.coordinates];
    if (f.geometry.type === 'MultiPolygon') return f.geometry.coordinates;
    return [];
  }

  function lonToMercX(lon) {
    return (lon + 180) / 360;
  }

  function latToMercY(lat) {
    const clipped = Math.max(-85.05112878, Math.min(85.05112878, lat));
    const rad = clipped * Math.PI / 180;
    return 0.5 - Math.log(Math.tan(Math.PI / 4 + rad / 2)) / (2 * Math.PI);
  }

  const allCoords = geojson.features.flatMap(f => getPolygons(f).flat(2));
  const mxs = allCoords.map(a => lonToMercX(a[0]));
  const mys = allCoords.map(a => latToMercY(a[1]));
  const lats = allCoords.map(a => a[1]);

  const mxMin = Math.min(...mxs), mxMax = Math.max(...mxs);
  const myMin = Math.min(...mys), myMax = Math.max(...mys);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;

  const rawW = mxMax - mxMin;
  const rawH = myMax - myMin;

  const mercScale = Math.min((SVG_W - PAD * 2) / rawW, (SVG_H - PAD * 2) / rawH);
  const offsetX = PAD + (SVG_W - PAD * 2 - rawW * mercScale) / 2;
  const offsetY = PAD + (SVG_H - PAD * 2 - rawH * mercScale) / 2;

  function project(lon, lat) {
    const x = offsetX + (lonToMercX(lon) - mxMin) * mercScale;
    const y = offsetY + (latToMercY(lat) - myMin) * mercScale;
    return [x, y];
  }

  // Precalcular lista de municipios con presencia comunitaria y conteo
  const munCommCounts = {};
  communities.forEach(c => {
    const k = c.municipio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    munCommCounts[k] = (munCommCounts[k] || 0) + 1;
  });

  const municipalitiesWithComm = new Set(Object.keys(munCommCounts));

  // =========================================================================
  // 2. Renderizar Estados Colindantes, Municipios y Capas Vectoriales
  // =========================================================================
  const layerEstados = $('layer-estados-vecinos');
  const layerEstadosLabels = $('layer-estados-labels');
  const layerMun = $('layer-municipios');
  const layerPins = $('layer-pins');
  const tooltip = $('map-tooltip');
  const wrapper = $('svg-map-wrapper');
  const tileLayer = $('tile-layer');
  const tileAttribution = $('tile-attribution');

  function buildFeaturePathD(f) {
    const polys = getPolygons(f);
    let d = '';
    polys.forEach(rings => {
      rings.forEach(ring => {
        ring.forEach(([lon, lat], i) => {
          const [px, py] = project(lon, lat);
          d += (i === 0 ? `M ${px.toFixed(2)} ${py.toFixed(2)} ` : `L ${px.toFixed(2)} ${py.toFixed(2)} `);
        });
        d += 'Z ';
      });
    });
    return d.trim();
  }

  // Estados vecinos (sin división municipal, contexto geográfico institucional)
  if (layerEstados && neighboringStates.features.length) {
    neighboringStates.features.forEach(f => {
      const stateName = f.properties.name || 'Estado';
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', buildFeaturePathD(f));
      path.setAttribute('class', 'estado-vecino-poly');
      path.setAttribute('data-estado', stateName);
      path.addEventListener('mousemove', e => {
        showTooltip(e, `<strong>${stateName}</strong><span>Estado colindante</span>`);
      });
      path.addEventListener('mouseleave', hideTooltip);
      layerEstados.appendChild(path);
    });
  }

  if (layerEstadosLabels) {
    const neighborLabels = [
      { name: 'JALISCO', lon: -102.22, lat: 20.66 },
      { name: 'MICHOACÁN', lon: -101.42, lat: 19.96 },
      { name: 'QUERÉTARO', lon: -99.84, lat: 20.66 },
      { name: 'SAN LUIS POTOSÍ', lon: -100.90, lat: 21.82 },
      { name: 'ZACATECAS', lon: -101.85, lat: 21.75 }
    ];
    neighborLabels.forEach(lbl => {
      const [lx, ly] = project(lbl.lon, lbl.lat);
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', lx.toFixed(1));
      t.setAttribute('y', ly.toFixed(1));
      t.setAttribute('class', 'estado-vecino-label');
      t.textContent = lbl.name;
      layerEstadosLabels.appendChild(t);
    });
  }

  layerMun.classList.add('has-gto-shadow');

  geojson.features.forEach(f => {
    const munName = f.properties.nomgeo || 'Municipio';
    const normName = munName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hasComm = municipalitiesWithComm.has(normName);
    const commCount = munCommCounts[normName] || 0;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', buildFeaturePathD(f));
    path.setAttribute('class', `municipio-poly${hasComm ? ' has-communities' : ''}`);
    path.setAttribute('data-municipio', munName);

    path.addEventListener('mousemove', e => {
      const subtitle = hasComm
        ? `Presencia comunitaria · ${commCount} ${commCount === 1 ? 'comunidad' : 'comunidades'}`
        : 'Municipio de Guanajuato';
      showTooltip(e, `<strong>${munName}</strong><span>${subtitle}</span>`);
    });
    path.addEventListener('mouseleave', hideTooltip);

    layerMun.appendChild(path);
  });

  // =========================================================================
  // 3. Renderizar Pines de Comunidades
  // =========================================================================
  const pinElements = new Map();

  communities.forEach(c => {
    if (c.lat === null || c.lon === null) return;
    const [cx, cy] = project(c.lon, c.lat);
    c.svgX = cx;
    c.svgY = cy;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'community-pin');
    g.setAttribute('data-clave', c.clave);
    g.dataset.cx = cx.toFixed(2);
    g.dataset.cy = cy.toFixed(2);
    g.setAttribute('transform', `translate(${cx.toFixed(2)}, ${cy.toFixed(2)})`);

    // Sombra y punto de base
    const circleBase = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleBase.setAttribute('class', 'pin-base');
    circleBase.setAttribute('r', '5.5');
    circleBase.setAttribute('filter', 'url(#pin-shadow)');

    const circleInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleInner.setAttribute('class', 'pin-inner');
    circleInner.setAttribute('r', '2.2');

    g.appendChild(circleBase);
    g.appendChild(circleInner);

    g.addEventListener('mousemove', e => {
      e.stopPropagation();
      showTooltip(e, `<strong>${c.nombre}</strong><span>${c.municipio}</span>`);
    });
    g.addEventListener('mouseleave', hideTooltip);

    g.addEventListener('click', e => {
      e.stopPropagation();
      if (dragMoved) return;
      selectCommunity(c, true);
    });

    layerPins.appendChild(g);
    pinElements.set(c.clave, g);
  });

  // Tooltip helper
  function showTooltip(e, html) {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    tooltip.innerHTML = html;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.hidden = false;
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  // =========================================================================
  // 4. Motor Interactivo de Zoom/Pan + Capas Cartográficas Web Mercator
  // =========================================================================
  const BASEMAPS = {
    institucional: {
      id: 'institucional',
      name: 'Institucional',
      isTile: false,
      attribution: ''
    },
    calles: {
      id: 'calles',
      name: 'Calles',
      isTile: true,
      maxNativeZoom: 19,
      layers: [
        { url: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png` }
      ],
      attribution: '© OpenStreetMap contributors'
    },
    satelite: {
      id: 'satelite',
      name: 'Satélite',
      isTile: true,
      maxNativeZoom: 18,
      layers: [
        { url: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}` },
        { url: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${z}/${y}/${x}`, overlay: true }
      ],
      attribution: 'Imágenes © Esri, Maxar · Referencia © Esri'
    },
    relieve: {
      id: 'relieve',
      name: 'Relieve',
      isTile: true,
      maxNativeZoom: 18,
      layers: [
        { url: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}` }
      ],
      attribution: 'Topografía © Esri · Contributors'
    }
  };

  const zoomGroup = $('map-zoom-group');
  let activeMapMode = 'institucional';
  let currentZoom = 1;
  let panX = 0, panY = 0;
  let isDragging = false;
  let dragMoved = false;
  let dragStartScreen = [0, 0];
  let dragStartSvg = [0, 0];
  let dragStartPan = [0, 0];
  let animFrameId = null;
  let currentTileZ = 9;

  const tileNodes = new Map();

  function getSvgViewportMetrics() {
    const rect = wrapper.getBoundingClientRect();
    const sView = Math.min(rect.width / SVG_W, rect.height / SVG_H) || 1;
    const oxView = (rect.width - SVG_W * sView) / 2;
    const oyView = (rect.height - SVG_H * sView) / 2;
    return { rect, sView, oxView, oyView };
  }

  function screenToSvg(localX, localY, m = getSvgViewportMetrics()) {
    return [(localX - m.oxView) / m.sView, (localY - m.oyView) / m.sView];
  }

  function updatePinsCounterScale() {
    const pinScale = currentZoom <= 1 ? 1 : Math.max(0.01, 1 / Math.pow(currentZoom, 0.85));
    const scaleStr = pinScale.toFixed(4);
    pinElements.forEach(el => {
      el.setAttribute('transform', `translate(${el.dataset.cx}, ${el.dataset.cy}) scale(${scaleStr})`);
    });
  }

  function renderTiles(m = getSvgViewportMetrics()) {
    if (!tileLayer) return;
    const cfg = BASEMAPS[activeMapMode];
    if (!cfg || !cfg.isTile || !m.rect.width || !m.rect.height) {
      if (!tileLayer.hidden) {
        tileLayer.hidden = true;
        tileLayer.innerHTML = '';
        tileNodes.clear();
      }
      return;
    }

    tileLayer.hidden = false;
    const worldPx = mercScale * currentZoom * m.sView;
    const originX = m.oxView + (panX + (offsetX - mxMin * mercScale) * currentZoom) * m.sView;
    const originY = m.oyView + (panY + (offsetY - myMin * mercScale) * currentZoom) * m.sView;

    const exactZ = Math.log2(worldPx / 256);
    const z = Math.max(6, Math.min(cfg.maxNativeZoom, Math.floor(exactZ + 0.45)));
    currentTileZ = z;
    const n = Math.pow(2, z);
    const tilePx = worldPx / n;

    const txMin = Math.max(0, Math.floor((0 - originX) / tilePx) - 1);
    const txMax = Math.min(n - 1, Math.floor((m.rect.width - originX) / tilePx) + 1);
    const tyMin = Math.max(0, Math.floor((0 - originY) / tilePx) - 1);
    const tyMax = Math.min(n - 1, Math.floor((m.rect.height - originY) / tilePx) + 1);

    const activeKeys = new Set();
    let allPrimaryLoaded = true;

    cfg.layers.forEach((layerCfg, layerIdx) => {
      for (let ty = tyMin; ty <= tyMax; ty++) {
        for (let tx = txMin; tx <= txMax; tx++) {
          const key = `${cfg.id}|${layerIdx}|${z}|${tx}|${ty}`;
          activeKeys.add(key);

          let entry = tileNodes.get(key);
          if (!entry) {
            const img = document.createElement('img');
            img.className = 'tile-img';
            img.alt = '';
            img.decoding = 'async';
            entry = { img, mode: cfg.id, layerIdx, z, tx, ty, loaded: false, failed: false };
            img.addEventListener('load', () => {
              entry.loaded = true;
              img.classList.add('loaded');
              if (entry.mode === activeMapMode && entry.z === currentTileZ) {
                pruneStaleZoomTiles(activeMapMode, currentTileZ);
              }
            });
            img.addEventListener('error', () => {
              entry.failed = true;
              img.style.display = 'none';
            });
            img.src = layerCfg.url(z, tx, ty);
            tileLayer.appendChild(img);
            tileNodes.set(key, entry);
          }

          if (layerIdx === 0 && !entry.loaded && !entry.failed) {
            allPrimaryLoaded = false;
          }

          const left = originX + tx * tilePx;
          const top = originY + ty * tilePx;
          const size = Math.ceil(tilePx + 0.8);
          entry.img.style.width = `${size}px`;
          entry.img.style.height = `${size}px`;
          entry.img.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
          entry.img.style.zIndex = layerIdx === 0 ? '2' : '3';
        }
      }
    });

    tileNodes.forEach((entry, key) => {
      if (entry.mode !== cfg.id) {
        entry.img.remove();
        tileNodes.delete(key);
        return;
      }
      if (entry.z === z) {
        if (!activeKeys.has(key)) {
          entry.img.remove();
          tileNodes.delete(key);
        }
        return;
      }
      if (Math.abs(entry.z - z) > 3) {
        entry.img.remove();
        tileNodes.delete(key);
        return;
      }
      const oldN = Math.pow(2, entry.z);
      const oldTilePx = worldPx / oldN;
      const oldLeft = originX + entry.tx * oldTilePx;
      const oldTop = originY + entry.ty * oldTilePx;
      const oldSize = Math.ceil(oldTilePx + 0.8);
      entry.img.style.width = `${oldSize}px`;
      entry.img.style.height = `${oldSize}px`;
      entry.img.style.transform = `translate3d(${oldLeft.toFixed(1)}px, ${oldTop.toFixed(1)}px, 0)`;
      entry.img.style.zIndex = entry.layerIdx === 0 ? '0' : '1';
    });

    if (allPrimaryLoaded) {
      pruneStaleZoomTiles(cfg.id, z);
    }
  }

  function pruneStaleZoomTiles(modeId, activeZ) {
    let stillLoadingCurrent = false;
    tileNodes.forEach(entry => {
      if (entry.mode === modeId && entry.z === activeZ && entry.layerIdx === 0 && !entry.loaded && !entry.failed) {
        stillLoadingCurrent = true;
      }
    });
    if (stillLoadingCurrent) return;
    tileNodes.forEach((entry, key) => {
      if (entry.mode === modeId && entry.z !== activeZ) {
        entry.img.remove();
        tileNodes.delete(key);
      }
    });
  }

  function applyTransformNow() {
    zoomGroup.style.transition = 'none';
    zoomGroup.setAttribute('transform', `translate(${panX}, ${panY}) scale(${currentZoom})`);
    updatePinsCounterScale();
    const m = getSvgViewportMetrics();
    renderTiles(m);
    updateDynamicScale(m);
  }

  function updateTransform(animate = false, targetZoom = currentZoom, targetPanX = panX, targetPanY = panY) {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (!animate) {
      currentZoom = targetZoom;
      panX = targetPanX;
      panY = targetPanY;
      applyTransformNow();
      return;
    }

    const startZoom = currentZoom;
    const startPanX = panX;
    const startPanY = panY;
    const startTime = performance.now();
    const duration = 320;

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      currentZoom = startZoom + (targetZoom - startZoom) * ease;
      panX = startPanX + (targetPanX - startPanX) * ease;
      panY = startPanY + (targetPanY - startPanY) * ease;
      applyTransformNow();
      if (t < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        animFrameId = null;
      }
    }
    animFrameId = requestAnimationFrame(step);
  }

  // Escala gráfica dinámica y precisa según el zoom, latitud y tamaño de pantalla
  function updateDynamicScale(m = getSvgViewportMetrics()) {
    const scaleBar = $('scale-bar');
    const scaleRatio = $('scale-ratio-text');
    const scaleMid = $('scale-mid-val');
    const scaleMax = $('scale-max-val');
    if (!scaleBar || !scaleMax || !m.rect.width || !m.rect.height) return;

    const screenPxPerSvgPx = m.sView * currentZoom;
    const kmPerMercUnit = 40075.016686 * Math.cos(midLat * Math.PI / 180);
    const kmPerSvgPx = kmPerMercUnit / mercScale;
    const kmPerScreenPx = kmPerSvgPx / screenPxPerSvgPx;

    const niceDists = [
      100, 75, 50, 40, 30, 25, 20, 15, 10, 8, 5, 4, 3, 2, 1,
      0.8, 0.5, 0.4, 0.25, 0.2, 0.1, 0.05
    ];

    let chosenDist = 50;
    let chosenWidth = 90;

    for (const d of niceDists) {
      const w = d / kmPerScreenPx;
      if (w >= 65 && w <= 135) {
        chosenDist = d;
        chosenWidth = w;
        break;
      }
    }

    if (!chosenWidth || chosenWidth < 50 || chosenWidth > 150) {
      chosenDist = niceDists.reduce((prev, curr) => {
        const wPrev = prev / kmPerScreenPx;
        const wCurr = curr / kmPerScreenPx;
        return Math.abs(wCurr - 90) < Math.abs(wPrev - 90) ? curr : prev;
      });
      chosenWidth = chosenDist / kmPerScreenPx;
    }

    const ratioVal = Math.round(kmPerScreenPx * (96 / 2.54) * 100000);
    const roundRatio = Math.max(1000, Math.round(ratioVal / 1000) * 1000);
    if (scaleRatio) {
      scaleRatio.textContent = `Escala 1 : ${roundRatio.toLocaleString('es-MX')}`;
    }

    scaleBar.style.width = `${Math.round(Math.max(54, Math.min(160, chosenWidth)))}px`;

    const midDist = chosenDist / 2;
    if (chosenDist >= 1) {
      scaleMid.textContent = Number.isInteger(midDist) ? midDist : midDist.toFixed(1);
      scaleMax.textContent = `${chosenDist} km`;
    } else {
      const midM = Math.round(midDist * 1000);
      const maxM = Math.round(chosenDist * 1000);
      scaleMid.textContent = midM;
      scaleMax.textContent = `${maxM} m`;
    }
  }

  window.addEventListener('resize', () => applyTransformNow());

  wrapper.addEventListener('mousedown', e => {
    if (e.target.closest('.map-controls, .map-legend, .mun-reference-box, .btn-toggle-ref, .layers-popover')) return;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    const m = getSvgViewportMetrics();
    isDragging = true;
    dragMoved = false;
    dragStartScreen = [e.clientX, e.clientY];
    dragStartSvg = screenToSvg(e.clientX - m.rect.left, e.clientY - m.rect.top, m);
    dragStartPan = [panX, panY];
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    if (!dragMoved && Math.hypot(e.clientX - dragStartScreen[0], e.clientY - dragStartScreen[1]) > 4) {
      dragMoved = true;
    }
    const m = getSvgViewportMetrics();
    const currSvg = screenToSvg(e.clientX - m.rect.left, e.clientY - m.rect.top, m);
    updateTransform(false, currentZoom, dragStartPan[0] + (currSvg[0] - dragStartSvg[0]), dragStartPan[1] + (currSvg[1] - dragStartSvg[1]));
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    setTimeout(() => { dragMoved = false; }, 0);
  });

  wrapper.addEventListener('wheel', e => {
    if (e.target.closest('.mun-reference-box, .map-legend, .map-controls, .layers-popover')) return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.24 : 0.8;
    const newZoom = Math.min(Math.max(1, currentZoom * zoomFactor), MAX_ZOOM);
    if (newZoom === currentZoom) return;

    const m = getSvgViewportMetrics();
    const [sx, sy] = screenToSvg(e.clientX - m.rect.left, e.clientY - m.rect.top, m);
    const mapX = (sx - panX) / currentZoom;
    const mapY = (sy - panY) / currentZoom;

    const newPanX = sx - mapX * newZoom;
    const newPanY = sy - mapY * newZoom;
    updateTransform(false, newZoom, newPanX, newPanY);
  }, { passive: false });

  function zoomAroundCenter(factor) {
    const newZoom = Math.min(Math.max(1, currentZoom * factor), MAX_ZOOM);
    if (newZoom <= 1.01 && factor < 1) {
      resetMap(true);
      return;
    }
    const cx = SVG_W / 2;
    const cy = SVG_H / 2;
    const mapX = (cx - panX) / currentZoom;
    const mapY = (cy - panY) / currentZoom;
    updateTransform(true, newZoom, cx - mapX * newZoom, cy - mapY * newZoom);
  }

  function resetMap(animate = true) {
    updateTransform(animate, 1, 0, 0);
  }

  $('btn-zoom-in').addEventListener('click', () => zoomAroundCenter(1.5));
  $('btn-zoom-out').addEventListener('click', () => zoomAroundCenter(1 / 1.5));
  $('btn-zoom-reset').addEventListener('click', () => resetMap(true));

  function centerOnCommunity(c) {
    if (!c.svgX || !c.svgY) return;
    const targetZoom = BASEMAPS[activeMapMode] && BASEMAPS[activeMapMode].isTile ? 28 : 6.5;
    const targetPanX = (SVG_W / 2) - c.svgX * targetZoom;
    const targetPanY = (SVG_H / 2) - c.svgY * targetZoom;
    updateTransform(true, targetZoom, targetPanX, targetPanY);
  }

  function centerOnMunicipality(munName) {
    const norm = munName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const mComm = communities.filter(c => c.municipio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === norm && c.svgX && c.svgY);
    if (mComm.length > 0) {
      const avgX = mComm.reduce((sum, c) => sum + c.svgX, 0) / mComm.length;
      const avgY = mComm.reduce((sum, c) => sum + c.svgY, 0) / mComm.length;
      const targetZoom = 3.2;
      const targetPanX = (SVG_W / 2) - avgX * targetZoom;
      const targetPanY = (SVG_H / 2) - avgY * targetZoom;
      updateTransform(true, targetZoom, targetPanX, targetPanY);
    }
  }

  // =========================================================================
  // 5. Filtros, Búsqueda y Lista Lateral
  // =========================================================================
  const searchInput = $('busqueda');
  const munSelect = $('filtro-municipio');
  const puebloSelect = $('filtro-pueblo');
  const listContainer = $('lista-comunidades');
  const counterEl = $('contador-resultados');

  // Llenar selects
  const uniqueMuns = [...new Set(communities.map(c => c.municipio))].sort((a,b) => a.localeCompare(b, 'es'));
  uniqueMuns.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    munSelect.appendChild(opt);
  });

  const uniquePueblos = [...new Set(communities.map(c => c.pueblo))].sort((a,b) => a.localeCompare(b, 'es'));
  uniquePueblos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    puebloSelect.appendChild(opt);
  });

  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function filterCommunities() {
    const query = normalize(searchInput.value);
    const munVal = munSelect.value;
    const puebloVal = puebloSelect.value;

    const filtered = communities.filter(c => {
      const matchQuery = !query || normalize(c.nombre).includes(query) || normalize(c.municipio).includes(query) || c.clave.includes(query);
      const matchMun = !munVal || c.municipio === munVal;
      const matchPueblo = !puebloVal || c.pueblo === puebloVal;
      return matchQuery && matchMun && matchPueblo;
    });

    renderList(filtered);
    counterEl.textContent = `Mostrando ${filtered.length} de ${communities.length} comunidades`;

    // Actualizar visibilidad de pines en el mapa
    const visibleClaves = new Set(filtered.map(c => c.clave));
    pinElements.forEach((el, clave) => {
      el.style.display = visibleClaves.has(clave) ? '' : 'none';
    });
  }

  function renderList(items) {
    listContainer.innerHTML = '';
    if (items.length === 0) {
      listContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--gray-light); font-size: 13px;">No se encontraron comunidades con esos criterios.</div>';
      return;
    }

    items.forEach(c => {
      const card = document.createElement('div');
      card.className = 'community-card';
      card.setAttribute('data-clave', c.clave);
      card.innerHTML = `
        <div class="card-top">
          <span class="card-mun">${c.municipio}</span>
          <span class="card-pueblo">${c.pueblo}</span>
        </div>
        <div class="card-title">${c.nombre}</div>
        <div class="card-bottom">
          <span class="card-meta" title="Población total">
            <img src="../assets/iconos/vector/poblacion.svg" class="card-mini-icon" alt="" aria-hidden="true">
            Pob: <strong>${c.pobTotal.toLocaleString('es-MX')}</strong>
          </span>
          <span class="card-meta" title="Viviendas habitadas">
            <img src="../assets/iconos/vector/vivienda.svg" class="card-mini-icon" alt="" aria-hidden="true">
            Viv: <strong>${c.viviendas.toLocaleString('es-MX')}</strong>
          </span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectCommunity(c, true);
      });

      listContainer.appendChild(card);
    });
  }

  searchInput.addEventListener('input', filterCommunities);
  munSelect.addEventListener('change', filterCommunities);
  puebloSelect.addEventListener('change', filterCommunities);

  // Inicializar lista
  renderList(communities);

  // =========================================================================
  // 6. Modal de Información y Detalles
  // =========================================================================
  const modal = $('modal-backdrop');
  let selectedCommunity = null;

  function selectCommunity(c, openDialog = true) {
    selectedCommunity = c;

    // Resaltar pin en el mapa
    pinElements.forEach(el => el.classList.remove('active'));
    const activePin = pinElements.get(c.clave);
    if (activePin) activePin.classList.add('active');

    // Resaltar tarjeta en la lista y desplazar suavemente si es necesario
    const targetCard = document.querySelector(`.community-card[data-clave="${c.clave}"]`);
    document.querySelectorAll('.community-card').forEach(card => card.classList.remove('selected'));
    if (targetCard) {
      targetCard.classList.add('selected');
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    centerOnCommunity(c);

    if (openDialog) {
      showModal(c);
    }
  }

  function showModal(c) {
    $('modal-nombre').textContent = c.nombre;
    $('modal-municipio').textContent = c.municipio;
    $('modal-pueblo').textContent = c.pueblo;
    $('modal-clave').textContent = `Clave INEGI: ${c.clave}`;

    $('modal-pob').textContent = c.pobTotal ? c.pobTotal.toLocaleString('es-MX') : 'Dato no disponible';
    $('modal-viv').textContent = c.viviendas ? c.viviendas.toLocaleString('es-MX') : 'Dato no disponible';
    $('modal-hli').textContent = c.hablantesLengua ? c.hablantesLengua.toLocaleString('es-MX') : '0';

    $('modal-historia').textContent = c.historia || 'Reseña histórica en integración.';

    const latCoord = c.latStr || (c.lat ? `${c.lat.toFixed(5)}° N` : 'No disponible');
    const lonCoord = c.lonStr || (c.lon ? `${c.lon.toFixed(5)}° W` : 'No disponible');
    $('modal-coordenadas').textContent = `${latCoord}, ${lonCoord} · (Lat: ${c.lat}, Lon: ${c.lon})`;

    // Enlace de Google Maps
    const gmapsBtn = $('btn-google-maps');
    if (c.googleMapsUrl) {
      gmapsBtn.href = c.googleMapsUrl;
      gmapsBtn.style.display = 'flex';
    } else {
      gmapsBtn.style.display = 'none';
    }

    // Enlace de descarga de PDF
    const pdfBtn = $('btn-download-pdf');
    pdfBtn.href = c.pdf;
    pdfBtn.setAttribute('download', c.pdfName);

    modal.hidden = false;
  }

  function closeModal() {
    modal.hidden = true;
  }

  $('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // =========================================================================
  // 7. Panel Desplegable: Mini Dashboard por Municipio y Pueblo
  // =========================================================================
  const btnToggleRef = $('btn-toggle-ref');
  const btnCloseRef = $('btn-close-ref');
  const munRefBox = $('mun-reference-box');
  const refMunList = $('ref-mun-list');
  const dashSummaryGrid = $('dash-summary-grid');
  const dashPueblosList = $('dash-pueblos-list');

  function renderMunicipalityDashboard() {
    if (!refMunList) return;
    const byMun = new Map();
    const byPueblo = new Map();
    let totalPop = 0;

    communities.forEach(c => {
      const m = c.municipio || 'Sin municipio';
      const entry = byMun.get(m) || { mun: m, count: 0, pop: 0 };
      entry.count += 1;
      entry.pop += Number(c.pobTotal) || 0;
      byMun.set(m, entry);

      const p = c.pueblo || 'Otro';
      byPueblo.set(p, (byPueblo.get(p) || 0) + 1);
      totalPop += Number(c.pobTotal) || 0;
    });

    const sortedMuns = [...byMun.values()].sort((a, b) => b.count - a.count || a.mun.localeCompare(b.mun, 'es'));
    const maxCount = sortedMuns.length ? sortedMuns[0].count : 1;

    if (dashSummaryGrid) {
      dashSummaryGrid.innerHTML = [
        { val: communities.length.toLocaleString('es-MX'), lbl: 'Comunidades' },
        { val: String(sortedMuns.length), lbl: 'Municipios' },
        { val: totalPop.toLocaleString('es-MX'), lbl: 'Habitantes' }
      ].map(k => `<div class="dash-stat-box"><strong>${k.val}</strong><span>${k.lbl}</span></div>`).join('');
    }

    const activeMun = munSelect.value;
    refMunList.innerHTML = sortedMuns.map(item => {
      const shortName = item.mun.startsWith('Dolores Hidalgo') ? 'Dolores Hidalgo' : item.mun;
      const pctW = Math.max(4, Math.round((item.count / maxCount) * 100));
      const isSelected = activeMun === item.mun;
      return `
        <button type="button" class="dash-bar-row${isSelected ? ' active' : ''}" data-mun="${escapeAttr(item.mun)}" title="${escapeAttr(item.mun)}: ${item.count} comunidades (${item.pop.toLocaleString('es-MX')} hab.)">
          <div class="dash-bar-top">
            <span class="dash-bar-name">${shortName}</span>
            <span class="dash-bar-val">${item.count} <em>(${((item.count / communities.length) * 100).toFixed(0)}%)</em></span>
          </div>
          <div class="dash-bar-track"><span class="dash-bar-fill" style="width:${pctW}%"></span></div>
        </button>`;
    }).join('');

    if (dashPueblosList) {
      const sortedPueblos = [...byPueblo.entries()].sort((a, b) => b[1] - a[1]);
      dashPueblosList.innerHTML = sortedPueblos.map(([p, cnt]) =>
        `<span class="dash-pueblo-chip"><strong>${p}</strong> ${cnt}</span>`
      ).join('');
    }

    refMunList.querySelectorAll('.dash-bar-row').forEach(row => {
      row.addEventListener('click', () => {
        const mun = row.getAttribute('data-mun');
        if (!mun) return;
        const toggleSame = munSelect.value === mun;
        munSelect.value = toggleSame ? '' : mun;
        filterCommunities();
        if (!toggleSame) centerOnMunicipality(mun);
        else resetMap();
        renderMunicipalityDashboard();
      });
    });
  }

  function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  renderMunicipalityDashboard();
  munSelect.addEventListener('change', renderMunicipalityDashboard);

  if (btnToggleRef && munRefBox) {
    btnToggleRef.addEventListener('click', e => {
      e.stopPropagation();
      const isHidden = munRefBox.hidden;
      munRefBox.hidden = !isHidden;
      if (isHidden) {
        if (refMunList) refMunList.scrollTop = 0;
        closeLayersPopover();
      }
      btnToggleRef.classList.toggle('open', isHidden);
      btnToggleRef.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });

    if (btnCloseRef) {
      btnCloseRef.addEventListener('click', e => {
        e.stopPropagation();
        munRefBox.hidden = true;
        btnToggleRef.classList.remove('open');
        btnToggleRef.setAttribute('aria-expanded', 'false');
      });
    }
  }

  // =========================================================================
  // 8. Selector de Tipo de Mapa / Capas (Estilo Google Maps)
  // =========================================================================
  const btnMapLayers = $('btn-map-layers');
  const layersPopover = $('layers-popover');
  const layersBtnThumb = $('layers-btn-thumb');
  const layersOptionsRow = $('layers-popover-options');
  const toggleMunBoundaries = $('toggle-mun-boundaries');
  const layerOptionButtons = document.querySelectorAll('.layer-option[data-layer]');

  function closeLayersPopover() {
    if (!layersPopover || !btnMapLayers) return;
    layersPopover.hidden = true;
    btnMapLayers.classList.remove('open');
    btnMapLayers.setAttribute('aria-expanded', 'false');
  }

  function setMapMode(modeId) {
    if (!BASEMAPS[modeId]) return;
    activeMapMode = modeId;
    const cfg = BASEMAPS[modeId];

    wrapper.setAttribute('data-map-mode', modeId);
    wrapper.classList.toggle('base-tile-active', cfg.isTile);
    layerMun.classList.toggle('has-gto-shadow', !cfg.isTile);

    if (layersOptionsRow) {
      layersOptionsRow.hidden = !cfg.isTile;
    }

    if (tileAttribution) {
      if (cfg.isTile && cfg.attribution) {
        tileAttribution.textContent = cfg.attribution;
        tileAttribution.hidden = false;
      } else {
        tileAttribution.hidden = true;
      }
    }

    layerOptionButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-layer') === modeId);
    });

    if (layersBtnThumb) {
      layersBtnThumb.className = 'layers-thumb ' + (cfg.isTile ? 'preview-institucional' : 'preview-satelite');
    }

    tileNodes.clear();
    if (tileLayer) tileLayer.innerHTML = '';
    applyTransformNow();
  }

  if (btnMapLayers && layersPopover) {
    btnMapLayers.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = layersPopover.hidden;
      layersPopover.hidden = !willOpen;
      btnMapLayers.classList.toggle('open', willOpen);
      btnMapLayers.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (willOpen && munRefBox && !munRefBox.hidden) {
        munRefBox.hidden = true;
        if (btnToggleRef) {
          btnToggleRef.classList.remove('open');
          btnToggleRef.setAttribute('aria-expanded', 'false');
        }
      }
    });

    layersPopover.addEventListener('click', e => e.stopPropagation());

    layerOptionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const layerId = btn.getAttribute('data-layer');
        setMapMode(layerId);
      });
    });

    if (toggleMunBoundaries) {
      toggleMunBoundaries.addEventListener('change', () => {
        wrapper.classList.toggle('hide-mun-overlay', !toggleMunBoundaries.checked);
      });
    }

    document.addEventListener('click', e => {
      if (!e.target.closest('.layers-control-wrap')) closeLayersPopover();
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !layersPopover.hidden) closeLayersPopover();
    });
  }

  // Inicializar vista y cálculo de escala dinámica en el primer render
  setTimeout(applyTransformNow, 150);

})();
