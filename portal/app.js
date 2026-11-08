(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const communities = window.SDH_PORTAL_DATA || [];
  const geojson = window.SDH_MUNICIPIOS_GEOJSON || { features: [] };

  // =========================================================================
  // 1. Proyección Geográfica SVG de Guanajuato (1000 x 800 px)
  // =========================================================================
  const SVG_W = 1000, SVG_H = 800, PAD = 35;

  function getPolygons(f) {
    if (!f || !f.geometry) return [];
    if (f.geometry.type === 'Polygon') return [f.geometry.coordinates];
    if (f.geometry.type === 'MultiPolygon') return f.geometry.coordinates;
    return [];
  }

  const allCoords = geojson.features.flatMap(f => getPolygons(f).flat(2));
  const xs = allCoords.map(a => a[0]), ys = allCoords.map(a => a[1]);
  const xmin = Math.min(...xs), xmax = Math.max(...xs);
  const ymin = Math.min(...ys), ymax = Math.max(...ys);

  const midLat = (ymin + ymax) / 2;
  const cosLat = Math.cos(midLat * Math.PI / 180);

  const rawW = (xmax - xmin) * cosLat;
  const rawH = (ymax - ymin);

  const scale = Math.min((SVG_W - PAD * 2) / rawW, (SVG_H - PAD * 2) / rawH);
  const offsetX = PAD + (SVG_W - PAD * 2 - rawW * scale) / 2;
  const offsetY = PAD + (SVG_H - PAD * 2 - rawH * scale) / 2;

  function project(lon, lat) {
    const x = offsetX + (lon - xmin) * cosLat * scale;
    const y = offsetY + (ymax - lat) * scale;
    return [x, y];
  }

  // Precalcular lista de municipios con presencia comunitaria y conteo
  const munCommCounts = {};
  communities.forEach(c => {
    const k = c.municipio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    munCommCounts[k] = (munCommCounts[k] || 0) + 1;
  });

  const municipalitiesWithComm = new Set(Object.keys(munCommCounts));

  // Letras oficiales de referencia cartográfica (A a M) según el Mapa Oficial de Guanajuato
  const munLetters = {
    'apaseo el alto': 'A',
    'atarjea': 'B',
    'comonfort': 'C',
    'dolores hidalgo cuna de la independencia nacional': 'D',
    'salvatierra': 'E',
    'san luis de la paz': 'F',
    'san miguel de allende': 'G',
    'santa catarina': 'H',
    'tierra blanca': 'I',
    'valle de santiago': 'J',
    'victoria': 'K',
    'villagran': 'L',
    'xichu': 'M'
  };

  // =========================================================================
  // 2. Renderizar Municipios y Capas Vectoriales
  // =========================================================================
  const layerMun = $('layer-municipios');
  const layerMunLabels = $('layer-mun-labels');
  const layerPins = $('layer-pins');
  const tooltip = $('map-tooltip');
  const wrapper = $('svg-map-wrapper');

  geojson.features.forEach(f => {
    const munName = f.properties.nomgeo || 'Municipio';
    const normName = munName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hasComm = municipalitiesWithComm.has(normName);
    const letter = munLetters[normName] || '';
    const commCount = munCommCounts[normName] || 0;

    const polys = getPolygons(f);
    let d = '';
    let sumX = 0, sumY = 0, ptCount = 0;

    polys.forEach(rings => {
      rings.forEach(ring => {
        ring.forEach(([lon, lat], i) => {
          const [px, py] = project(lon, lat);
          sumX += px;
          sumY += py;
          ptCount++;
          d += (i === 0 ? `M ${px.toFixed(2)} ${py.toFixed(2)} ` : `L ${px.toFixed(2)} ${py.toFixed(2)} `);
        });
        d += 'Z ';
      });
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d.trim());
    path.setAttribute('class', `municipio-poly${hasComm ? ' has-communities' : ''}`);
    path.setAttribute('data-municipio', munName);

    path.addEventListener('mousemove', e => {
      const title = letter ? `${munName} (${letter})` : munName;
      const subtitle = hasComm
        ? `Presencia comunitaria · ${commCount} ${commCount === 1 ? 'comunidad' : 'comunidades'}`
        : 'Municipio de Guanajuato';
      showTooltip(e, `<strong>${title}</strong><span>${subtitle}</span>`);
    });
    path.addEventListener('mouseleave', hideTooltip);

    layerMun.appendChild(path);

    // Si tiene letra oficial (A-M), agregar etiqueta visual en posición despejada
    if (letter && ptCount > 0 && layerMunLabels) {
      let cx = sumX / ptCount;
      let cy = sumY / ptCount;

      // Coordenadas cartográficas optimizadas para no solaparse con ningún pin de comunidad
      const letterPositions = {
        'A': { cx: 612, cy: 575 }, // Apaseo el Alto
        'B': { cx: 885, cy: 255 }, // Atarjea
        'C': { cx: 518, cy: 425 }, // Comonfort
        'D': { cx: 455, cy: 295 }, // Dolores Hidalgo
        'E': { cx: 480, cy: 662 }, // Salvatierra
        'F': { cx: 640, cy: 175 }, // San Luis de la Paz
        'G': { cx: 555, cy: 370 }, // San Miguel de Allende
        'H': { cx: 786, cy: 285 }, // Santa Catarina
        'I': { cx: 758, cy: 345 }, // Tierra Blanca
        'J': { cx: 350, cy: 582 }, // Valle de Santiago
        'K': { cx: 725, cy: 185 }, // Victoria
        'L': { cx: 436, cy: 532 }, // Villagrán (despejado del pin Suchitlán)
        'M': { cx: 810, cy: 215 }  // Xichú
      };

      if (letterPositions[letter]) {
        cx = letterPositions[letter].cx;
        cy = letterPositions[letter].cy;
      }

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx.toFixed(1));
      text.setAttribute('y', cy.toFixed(1));
      text.setAttribute('class', 'mun-letter-text');
      text.textContent = letter;
      layerMunLabels.appendChild(text);
    }
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
      showTooltip(e, `<strong>${c.nombre}</strong><span>${c.municipio} · ${c.pueblo}</span><small>Clic para ver ficha completa</small>`);
    });
    g.addEventListener('mouseleave', hideTooltip);

    g.addEventListener('click', e => {
      e.stopPropagation();
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
  // 4. Motor Interactivo de Zoom y Pan (SVG)
  // =========================================================================
  const zoomGroup = $('map-zoom-group');
  let currentZoom = 1;
  let panX = 0, panY = 0;
  let isDragging = false;
  let startX = 0, startY = 0;

  function updateTransform(animate = false) {
    zoomGroup.style.transition = animate ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    zoomGroup.setAttribute('transform', `translate(${panX}, ${panY}) scale(${currentZoom})`);
  }

  wrapper.addEventListener('mousedown', e => {
    if (e.target.closest('.map-controls') || e.target.closest('.map-legend')) return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform(false);
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  wrapper.addEventListener('wheel', e => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.83;
    const newZoom = Math.min(Math.max(1, currentZoom * zoomFactor), 12);
    if (newZoom === currentZoom) return;

    const rect = wrapper.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panX) / currentZoom;
    const mouseY = (e.clientY - rect.top - panY) / currentZoom;

    panX = (e.clientX - rect.left) - mouseX * newZoom;
    panY = (e.clientY - rect.top) - mouseY * newZoom;
    currentZoom = newZoom;
    updateTransform(false);
  }, { passive: false });

  $('btn-zoom-in').addEventListener('click', () => {
    currentZoom = Math.min(12, currentZoom * 1.35);
    updateTransform(true);
  });

  $('btn-zoom-out').addEventListener('click', () => {
    currentZoom = Math.max(1, currentZoom / 1.35);
    if (currentZoom === 1) { panX = 0; panY = 0; }
    updateTransform(true);
  });

  $('btn-zoom-reset').addEventListener('click', () => {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    updateTransform(true);
  });

  function centerOnCommunity(c) {
    if (!c.svgX || !c.svgY) return;
    currentZoom = 3.5;
    const rect = wrapper.getBoundingClientRect();
    panX = (rect.width / 2) - c.svgX * currentZoom;
    panY = (rect.height / 2) - c.svgY * currentZoom;
    updateTransform(true);
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

})();
