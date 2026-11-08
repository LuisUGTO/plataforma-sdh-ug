import fs from 'node:fs';

const content = fs.readFileSync('portal/municipios.js', 'utf8');
const geojson = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));
const coms = JSON.parse(fs.readFileSync('portal/datos-comunidades.js', 'utf8').substring(fs.readFileSync('portal/datos-comunidades.js', 'utf8').indexOf('['), fs.readFileSync('portal/datos-comunidades.js', 'utf8').lastIndexOf(']') + 1));

const SVG_W = 1000, SVG_H = 800, PAD = 25;
function getPolygons(feature) {
  const g = feature.geometry;
  if (!g) return [];
  if (g.type === 'Polygon') return [g.coordinates];
  if (g.type === 'MultiPolygon') return g.coordinates;
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
  return [offsetX + (lon - xmin) * cosLat * scale, offsetY + (ymax - lat) * scale];
}

const allPins = coms.map(c => project(c.lon, c.lat));

function pointToPolyBorderDist(px, py, ring) {
  let minD = 999;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i+1];
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx*dx + dy*dy;
    let t = ((px - x1)*dx + (py - y1)*dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const nx = x1 + t*dx, ny = y1 + t*dy;
    const d = Math.hypot(px - nx, py - ny);
    if (d < minD) minD = d;
  }
  return minD;
}

function pointInPoly(pt, ring) {
  let [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    let xi = ring[i][0], yi = ring[i][1];
    let xj = ring[j][0], yj = ring[j][1];
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const munList = [
  ['A', 'apaseo el alto'],
  ['B', 'atarjea'],
  ['C', 'comonfort'],
  ['D', 'dolores hidalgo cuna de la independencia nacional'],
  ['E', 'salvatierra'],
  ['F', 'san luis de la paz'],
  ['G', 'san miguel de allende'],
  ['H', 'santa catarina'],
  ['I', 'tierra blanca'],
  ['J', 'valle de santiago'],
  ['K', 'victoria'],
  ['L', 'villagran'],
  ['M', 'xichu']
];

console.log('const letterPositions = {');
munList.forEach(([letter, munName]) => {
  const f = geojson.features.find(feat => feat.properties.nomgeo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === munName);
  const polys = getPolygons(f);
  const ring = polys[0][0].map(([lon, lat]) => project(lon, lat));
  const rxs = ring.map(p => p[0]), rys = ring.map(p => p[1]);
  const minX = Math.min(...rxs), maxX = Math.max(...rxs);
  const minY = Math.min(...rys), maxY = Math.max(...rys);

  const candidates = [];
  for (let x = Math.floor(minX); x <= Math.ceil(maxX); x += 1) {
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y += 1) {
      if (pointInPoly([x, y], ring)) {
        const bD = pointToPolyBorderDist(x, y, ring);
        let pD = 999;
        allPins.forEach(p => {
          const d = Math.hypot(x - p[0], y - p[1]);
          if (d < pD) pD = d;
        });
        // We want at least 15px clearance from border and pins
        candidates.push({ x, y, bD, pD, score: Math.min(bD, pD * 0.8) });
      }
    }
  }
  candidates.sort((a,b) => b.score - a.score);
  const best = candidates[0];
  console.log(`  '${letter}': { cx: ${best.x}, cy: ${best.y} }, // ${munName} (borderD: ${best.bD.toFixed(1)}px, pinD: ${best.pD.toFixed(1)}px)`);
});
console.log('};');
