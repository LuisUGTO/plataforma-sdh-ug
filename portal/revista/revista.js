'use strict';

const el = id => document.getElementById(id);
const hoja = el('hoja');
const estado = el('estado');
let paginas = [];
let numero = 1;
let solicitud = 0;

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
    if (turno === solicitud) estado.textContent = 'No se pudo cargar esta hoja. Intenta de nuevo.';
    return;
  }
  if (turno !== solicitud) return;
  const direccion = destino < numero ? 'regreso' : 'vuelta';
  hoja.className = '';
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
  void hoja.offsetWidth;
  hoja.classList.add(direccion);
  numero = destino;
  el('numero').value = numero;
  el('anterior').disabled = numero === 1;
  el('siguiente').disabled = numero === paginas.length;
  estado.textContent = `Hoja ${numero} de ${paginas.length}`;
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
  const ampliado = el('visor').classList.toggle('ampliado');
  el('zoom').setAttribute('aria-pressed', String(ampliado));
  el('zoom').textContent = ampliado ? 'Ajustar a pantalla' : 'Ampliar';
};
document.addEventListener('keydown', event => {
  if (event.target.closest('input, button, a') || el('visor').classList.contains('ampliado')) return;
  if (event.key === 'ArrowLeft') mostrar(numero - 1);
  if (event.key === 'ArrowRight') mostrar(numero + 1);
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
    estado.textContent = 'La revista no está disponible en este momento.';
  }
}
iniciar();
