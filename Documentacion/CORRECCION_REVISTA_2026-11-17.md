# Corrección de la revista publicada

La generación previa entregaba bytes PNG al exportador que declara imágenes JPEG (`DCTDecode`), provocando errores de lectura. Además preparaba incorrectamente los registros del consolidado, dejando campos vacíos. Un cambio de código y su push no regeneran el PDF adjunto en Releases.

Se añadió `preparar-revista.py` y `reconstruir-revista.cjs` para convertir imágenes a JPEG, preparar campos normalizados y unir ITER/edades por clave y nombre exactos. El proceso falla ante uniones ausentes. No modifica fuentes ni denominadores. Conserva portadas, orden, enlaces y notas metodológicas.

Verificación actual: 134 páginas renderizadas con Poppler sin errores; 107 fichas con nombre, identificación y secciones; ausencia de `undefined`; 124 enlaces en las dos páginas del índice; revisión visual de ficha de Mineral la Aurora y primera página metodológica. No se probó directamente en Adobe Acrobat.

Regeneración: `python preparar-revista.py`. El resultado validado se escribe en `tmp/pdfs/revista-corregida.pdf`. La publicación se realiza por separado en la release.
