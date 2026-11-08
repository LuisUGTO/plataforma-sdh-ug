import fs from 'node:fs';

let content = fs.readFileSync('portal/municipios.js', 'utf8').trim();
content = content.replace(/^window\.SDH_MUNICIPIOS_GEOJSON\s*=\s*/, '');
if (content.endsWith(';')) content = content.slice(0, -1);
const geojson = JSON.parse(content);

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
const SVG_W = 1000, SVG_H = 800, PAD = 35;
const scale = Math.min((SVG_W - PAD * 2) / rawW, (SVG_H - PAD * 2) / rawH);
const offsetX = PAD + (SVG_W - PAD * 2 - rawW * scale) / 2;
const offsetY = PAD + (SVG_H - PAD * 2 - rawH * scale) / 2;

function project(lon, lat) {
  const x = offsetX + (lon - xmin) * cosLat * scale;
  const y = offsetY + (ymax - lat) * scale;
  return [x, y];
}

function pointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const candidatePositions = {
  'A': { cx: 598, cy: 565 }, // Apaseo el Alto
  'B': { cx: 896, cy: 248 }, // Atarjea
  'C': { cx: 495, cy: 450 }, // Comonfort
  'D': { cx: 445, cy: 310 }, // Dolores Hidalgo
  'E': { cx: 485, cy: 645 }, // Salvatierra
  'F': { cx: 645, cy: 165 }, // San Luis de la Paz
  'G': { cx: 580, cy: 390 }, // San Miguel de Allende
  'H': { cx: 785, cy: 285 }, // Santa Catarina
  'I': { cx: 770, cy: 350 }, // Tierra Blanca
  'J': { cx: 350, cy: 575 }, // Valle de Santiago
  'K': { cx: 745, cy: 165 }, // Victoria
  'L': { cx: 472, cy: 524 }, // Villagrán
  'M': { cx: 825, cy: 195 }  // Xichú
};

geojson.features.forEach(f => {
  const name = f.properties.nomgeo;
  const norm = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const letter = munLetters[norm];
  if (!letter) return;

  const pos = candidatePositions[letter];
  const polys = getPolygons(f);
  let isInside = false;
  polys.forEach(rings => {
    const ringPts = rings[0].map(([lon, lat]) => project(lon, lat));
    if (pointInPoly([pos.cx, pos.cy], ringPts)) {
      isInside = true;
    }
  });

  console.log(`${letter} (${name}): pos=(${pos.cx}, ${pos.cy}) -> inside: ${isInside}`);
});
