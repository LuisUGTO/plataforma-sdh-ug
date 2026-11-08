const SVG_W = 1000, SVG_H = 800, PAD = 35;
const rawH = 1.83; // actual height in degrees
const scale = (SVG_H - PAD * 2) / rawH; // ~398 px/deg
const kmPerSvgPx = 110.74 / scale; // ~0.278 km/px
const rect = { width: 1180, height: 900 };

[1, 1.5, 2, 3, 5, 8, 12].forEach(currentZoom => {
  const svgAspect = SVG_W / SVG_H;
  const viewAspect = rect.width / rect.height;
  let renderH = (viewAspect > svgAspect) ? rect.height : rect.width / svgAspect;
  const screenPxPerSvgPx = (renderH / SVG_H) * currentZoom;
  const kmPerScreenPx = kmPerSvgPx / screenPxPerSvgPx;

  const niceDists = [100, 75, 50, 40, 30, 25, 20, 15, 10, 8, 5, 4, 3, 2, 1, 0.8, 0.5, 0.4, 0.25, 0.2, 0.1];
  let chosenDist = niceDists.find(d => {
    const w = d / kmPerScreenPx;
    return w >= 65 && w <= 135;
  }) || 25;
  let chosenWidth = chosenDist / kmPerScreenPx;
  const ratioVal = Math.round(kmPerScreenPx * (96 / 2.54) * 100000);
  console.log(`Zoom ${currentZoom}x -> Dist: ${chosenDist}km, Width: ${chosenWidth.toFixed(0)}px, Ratio: 1:${Math.round(ratioVal/10000)*10000}`);
});
