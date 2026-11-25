'use strict';

const el = id => document.getElementById(id);
const libro = el('libro');
const estado = el('estado');
const barra = el('barra');
const visor = el('visor');
const pantalla = el('pantalla');
const btnModoLibro = el('modo-libro');
const flechaIzq = el('flecha-izq');
const flechaDer = el('flecha-der');

let temporizador;
let paginas = [];
let numero = 1;
let solicitud = 0;
let preferenciaDoble = window.innerWidth >= 860;
let animando = false;

function esModoDoble() {
  return preferenciaDoble && !visor.classList.contains('ampliado') && window.innerWidth >= 760;
}

function activarControles() {
  barra.classList.remove('inactivo');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => barra.classList.add('inactivo'), 2800);
}

document.addEventListener('pointermove', activarControles);
document.addEventListener('pointerdown', activarControles);
activarControles();

function mostrarEstado(texto, paginaCargada = false) {
  estado.textContent = texto;
  estado.classList.toggle('pagina-cargada', paginaCargada);
}

function actualizarPantalla() {
  const completa = Boolean(document.fullscreenElement) || document.body.classList.contains('modo-lectura');
  pantalla.setAttribute('aria-pressed', String(completa));
  pantalla.textContent = completa ? 'Salir de pantalla completa' : 'Pantalla completa';
  activarControles();
}

pantalla.hidden = false;
pantalla.onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.body.classList.contains('modo-lectura')) document.body.classList.remove('modo-lectura');
    else await document.body.requestFullscreen();
  } catch {
    if (!document.fullscreenElement) document.body.classList.add('modo-lectura');
  }
  actualizarPantalla();
};
document.addEventListener('fullscreenchange', actualizarPantalla);

function normalizarPliego(destino, doble) {
  if (!doble) return destino;
  if (destino <= 1) return 1;
  // Pliegos: (2,3), (4,5), (6,7)...
  return destino % 2 === 0 ? destino : destino - 1;
}

function cargarImagen(idx) {
  const datos = paginas[idx - 1];
  const img = new Image(datos.ancho, datos.alto);
  img.alt = `Hoja ${idx} de la revista digital`;
  img.src = `paginas/${datos.imagen}`;
  return img.decode().then(() => img);
}

function precargarVecinas(base) {
  for (const offset of [-2, -1, 1, 2, 3]) {
    const idx = base + offset;
    if (idx >= 1 && idx <= paginas.length) {
      const img = new Image();
      img.src = `paginas/${paginas[idx - 1].imagen}`;
    }
  }
}

function construirPagina(idx, imagen) {
  const cont = document.createElement('div');
  if (!idx || idx < 1 || idx > paginas.length) {
    cont.className = 'pagina vacia';
    return cont;
  }
  cont.className = 'pagina';
  cont.append(imagen);
  const datos = paginas[idx - 1];
  for (const [x, y, w, h, objetivo] of datos.enlaces) {
    const enlace = document.createElement('a');
    enlace.href = `#hoja-${objetivo}`;
    enlace.setAttribute('aria-label', `Ir a la hoja ${objetivo}`);
    Object.assign(enlace.style, {
      left: `${x * 100}%`, top: `${y * 100}%`,
      width: `${w * 100}%`, height: `${h * 100}%`,
    });
    enlace.addEventListener('click', event => {
      event.preventDefault();
      mostrar(objetivo);
    });
    cont.append(enlace);
  }
  return cont;
}

function animarGiro3D(adelante, srcFrente, srcReverso) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const previa = libro.querySelector('.hoja-flip');
  if (previa) previa.remove();

  const hojaFlip = document.createElement('div');
  hojaFlip.className = `hoja-flip ${adelante ? 'adelante' : 'atras'}`;
  hojaFlip.setAttribute('aria-hidden', 'true');

  const frente = document.createElement('div');
  frente.className = 'cara frente';
  if (srcFrente) {
    const imgF = document.createElement('img');
    imgF.src = srcFrente;
    frente.append(imgF);
  }

  const reverso = document.createElement('div');
  reverso.className = 'cara reverso';
  if (srcReverso) {
    const imgR = document.createElement('img');
    imgR.src = srcReverso;
    reverso.append(imgR);
  }

  hojaFlip.append(frente, reverso);
  libro.append(hojaFlip);
  animando = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hojaFlip.classList.add('girando');
    });
  });

  setTimeout(() => {
    hojaFlip.remove();
    animando = false;
  }, 640);
}

async function mostrar(destinoSolicitado, animar = true) {
  if (!paginas.length) return;
  const clamped = Math.max(1, Math.min(paginas.length, destinoSolicitado));
  const doble = esModoDoble();
  const base = normalizarPliego(clamped, doble);
  const turno = ++solicitud;

  const mostrarPar = doble && base > 1;
  const izqIdx = mostrarPar ? base : base;
  const derIdx = mostrarPar && base + 1 <= paginas.length ? base + 1 : null;

  // Capturar imágenes actuales para animación 3D si cambia de hoja
  const imgsActuales = [...libro.querySelectorAll('.pagina img')].map(i => i.src);
  const adelante = base > numero;
  const cambio = animar && base !== numero && imgsActuales.length > 0;

  let imgIzq, imgDer = null;
  try {
    [imgIzq, imgDer] = await Promise.all([
      cargarImagen(izqIdx),
      derIdx ? cargarImagen(derIdx) : Promise.resolve(null),
    ]);
  } catch {
    if (turno === solicitud) mostrarEstado('No se pudo cargar esta hoja. Intenta de nuevo.');
    return;
  }
  if (turno !== solicitud) return;

  const datosIzq = paginas[izqIdx - 1];
  const proporcion = datosIzq.ancho / datosIzq.alto;
  libro.classList.toggle('doble', Boolean(mostrarPar));
  libro.style.setProperty('--spread-ratio', mostrarPar ? proporcion * 2 : proporcion);

  const nodos = [construirPagina(izqIdx, imgIzq)];
  if (mostrarPar) {
    nodos.push(construirPagina(derIdx, imgDer));
  }
  libro.replaceChildren(...nodos);

  if (cambio) {
    if (mostrarPar) {
      const srcFrente = adelante ? (imgsActuales[1] || imgsActuales[0]) : imgsActuales[0];
      const srcReverso = adelante ? imgIzq.src : (imgDer ? imgDer.src : imgIzq.src);
      animarGiro3D(adelante, srcFrente, srcReverso);
    } else {
      animarGiro3D(adelante, imgsActuales[0], imgIzq.src);
    }
  }

  numero = base;
  el('numero').value = numero;

  const hayAnterior = numero > 1;
  const haySiguiente = mostrarPar ? (derIdx !== null && derIdx < paginas.length) : numero < paginas.length;

  el('anterior').disabled = !hayAnterior;
  flechaIzq.disabled = !hayAnterior;
  el('siguiente').disabled = !haySiguiente;
  flechaDer.disabled = !haySiguiente;

  btnModoLibro.setAttribute('aria-pressed', String(preferenciaDoble));
  btnModoLibro.textContent = preferenciaDoble ? 'Vista libro' : 'Una hoja';

  const textoEstado = mostrarPar && derIdx
    ? `Hojas ${izqIdx}–${derIdx} de ${paginas.length}`
    : `Hoja ${numero} de ${paginas.length}`;
  mostrarEstado(textoEstado, true);
  history.replaceState(null, '', `#hoja-${numero}`);
  precargarVecinas(numero);
}

function pasoAnterior() {
  if (esModoDoble()) {
    if (numero <= 2) mostrar(1);
    else mostrar(numero - 2);
  } else {
    mostrar(numero - 1);
  }
}

function pasoSiguiente() {
  if (esModoDoble()) {
    if (numero === 1) mostrar(2);
    else mostrar(numero + 2);
  } else {
    mostrar(numero + 1);
  }
}

el('anterior').onclick = pasoAnterior;
el('siguiente').onclick = pasoSiguiente;
flechaIzq.onclick = pasoAnterior;
flechaDer.onclick = pasoSiguiente;

el('indice').onclick = () => {
  const idx = paginas.findIndex(pagina => pagina.enlaces.length >= 40) + 1;
  if (idx > 0) mostrar(idx);
};

el('salto').onsubmit = event => {
  event.preventDefault();
  mostrar(el('numero').valueAsNumber);
};

btnModoLibro.onclick = () => {
  preferenciaDoble = !preferenciaDoble;
  if (visor.classList.contains('ampliado')) {
    visor.classList.remove('ampliado');
    el('zoom').setAttribute('aria-pressed', 'false');
    el('zoom').textContent = 'Ampliar';
  }
  mostrar(numero, false);
};

el('zoom').onclick = () => {
  const ampliado = visor.classList.toggle('ampliado');
  visor.scrollTo(0, 0);
  el('zoom').setAttribute('aria-pressed', String(ampliado));
  el('zoom').textContent = ampliado ? 'Ajustar a pantalla' : 'Ampliar';
  mostrar(numero, false);
};

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('modo-lectura')) {
    document.body.classList.remove('modo-lectura');
    actualizarPantalla();
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey ||
      event.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    pasoAnterior();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    pasoSiguiente();
  }
});

// Soporte táctil (swipe) para pasar páginas
let toqueX = null;
libro.addEventListener('touchstart', e => {
  if (e.touches.length === 1 && !visor.classList.contains('ampliado')) {
    toqueX = e.touches[0].clientX;
  }
}, { passive: true });
libro.addEventListener('touchend', e => {
  if (toqueX === null || !e.changedTouches.length) return;
  const dx = e.changedTouches[0].clientX - toqueX;
  toqueX = null;
  if (Math.abs(dx) > 45) {
    if (dx < 0) pasoSiguiente();
    else pasoAnterior();
  }
}, { passive: true });

let ultimoAnchoDoble = esModoDoble();
window.addEventListener('resize', () => {
  const actual = esModoDoble();
  if (actual !== ultimoAnchoDoble) {
    ultimoAnchoDoble = actual;
    mostrar(numero, false);
  }
});

async function iniciar() {
  try {
    const respuesta = await fetch('paginas/paginas.json');
    if (!respuesta.ok) throw Error('Índice no disponible');
    paginas = await respuesta.json();
    if (!paginas.length) throw Error('Revista vacía');
    el('total').textContent = `/ ${paginas.length}`;
    el('numero').max = paginas.length;
    for (const id of ['numero', 'ir', 'zoom', 'modo-libro']) el(id).disabled = false;
    el('indice').disabled = !paginas.some(pagina => pagina.enlaces.length >= 40);
    const inicial = Number(location.hash.match(/^#hoja-(\d+)$/)?.[1]);
    await mostrar(inicial >= 1 && inicial <= paginas.length ? inicial : 1, false);
  } catch {
    mostrarEstado('La revista no está disponible en este momento.');
  }
}

iniciar();
