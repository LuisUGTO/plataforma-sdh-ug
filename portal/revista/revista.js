'use strict';

const el = id => document.getElementById(id);
const hoja = el('hoja');
const estado = el('estado');
const barra = el('barra');
const visor = el('visor');
const pantalla = el('pantalla');
let temporizador;
let paginas = [];
let numero = 1;
let solicitud = 0;

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
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('modo-lectura')) {
    document.body.classList.remove('modo-lectura');
    actualizarPantalla();
  }
});

function doblarHoja(imagen, regreso) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lienzo = document.createElement('canvas');
  const contexto = lienzo.getContext('2d');
  if (!contexto) return;
  lienzo.className = 'hoja-saliente ' + (regreso ? 'regreso' : 'vuelta');
  lienzo.setAttribute('aria-hidden', 'true');
  lienzo.width = Math.min(imagen.naturalWidth, 1500);
  lienzo.height = Math.round(lienzo.width * imagen.naturalHeight / imagen.naturalWidth);
  hoja.append(lienzo);

  const {width: ancho, height: alto} = lienzo;
  const tiras = 80;
  const inicio = performance.now();
  function dibujar(ahora) {
    if (!lienzo.isConnected) return;
    const t = Math.min(1, (ahora - inicio) / 700);
    if (t >= 1) {
      lienzo.remove();
      return;
    }
    const giro = t * t * (3 - 2 * t);
    const curva = Math.sin(Math.PI * giro);
    const borde = u => ancho * (1 - giro) * (u - .34 * curva * u ** 3);
    contexto.clearRect(0, 0, ancho, alto);
    for (let i = 0; i < tiras; i++) {
      const u = i / tiras;
      const v = (i + 1) / tiras;
      const x0 = borde(u), x1 = borde(v);
      const x = regreso ? ancho - x1 : x0;
      const origen = (regreso ? 1 - v : u) * imagen.naturalWidth;
      const margen = alto * .11 * curva * u ** 2;
      const anchoTira = x1 - x0 + 1;
      contexto.drawImage(imagen, origen, 0, imagen.naturalWidth / tiras, imagen.naturalHeight,
        x, margen, anchoTira, alto - 2 * margen);
      contexto.fillStyle = `rgba(13, 32, 51, ${.28 * curva * u ** 2})`;
      contexto.fillRect(x, margen, anchoTira, alto - 2 * margen);
    }
    requestAnimationFrame(dibujar);
  }
  dibujar(inicio);
}

async function mostrar(destino) {
  if (!Number.isInteger(destino) || destino < 1 || destino > paginas.length) return;
  const turno = ++solicitud;
  const datos = paginas[destino - 1];
  const imagen = new Image(datos.ancho, datos.alto);
  imagen.alt = `Hoja ${destino} de la revista digital`;
  imagen.src = `paginas/${datos.imagen}`;
  try {
    await imagen.decode();
  } catch {
    if (turno === solicitud) mostrarEstado('No se pudo cargar esta hoja. Intenta de nuevo.');
    return;
  }
  if (turno !== solicitud) return;
  const anterior = hoja.firstElementChild;
  hoja.style.setProperty('--proporcion', datos.ancho / datos.alto);
  hoja.replaceChildren(imagen);
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
    hoja.append(enlace);
  }
  if (anterior && destino !== numero) doblarHoja(anterior, destino < numero);
  numero = destino;
  el('numero').value = numero;
  el('anterior').disabled = numero === 1;
  el('siguiente').disabled = numero === paginas.length;
  mostrarEstado(`Hoja ${numero} de ${paginas.length}`, true);
  history.replaceState(null, '', `#hoja-${numero}`);
}

el('anterior').onclick = () => mostrar(numero - 1);
el('siguiente').onclick = () => mostrar(numero + 1);
el('indice').onclick = () => mostrar(paginas.findIndex(pagina => pagina.enlaces.length >= 40) + 1);
el('salto').onsubmit = event => {
  event.preventDefault();
  mostrar(el('numero').valueAsNumber);
};
el('zoom').onclick = () => {
  const ampliado = visor.classList.toggle('ampliado');
  visor.scrollTo(0, 0);
  el('zoom').setAttribute('aria-pressed', String(ampliado));
  el('zoom').textContent = ampliado ? 'Ajustar a pantalla' : 'Ampliar';
};
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey ||
      event.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  mostrar(numero + (event.key === 'ArrowLeft' ? -1 : 1));
});

async function iniciar() {
  try {
    const respuesta = await fetch('paginas/paginas.json');
    if (!respuesta.ok) throw Error('Índice no disponible');
    paginas = await respuesta.json();
    if (!paginas.length) throw Error('Revista vacía');
    el('total').textContent = `/ ${paginas.length}`;
    el('numero').max = paginas.length;
    for (const id of ['numero', 'ir', 'zoom']) el(id).disabled = false;
    el('indice').disabled = !paginas.some(pagina => pagina.enlaces.length >= 40);
    const inicial = Number(location.hash.match(/^#hoja-(\d+)$/)?.[1]);
    await mostrar(inicial >= 1 && inicial <= paginas.length ? inicial : 1);
  } catch {
    mostrarEstado('La revista no está disponible en este momento.');
  }
}
iniciar();
