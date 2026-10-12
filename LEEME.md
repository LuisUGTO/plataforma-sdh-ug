GENERADOR SDH / UG - OBSERVACIONES FINALES - ENTREGA FINAL PARA REVISIÓN - 11 DE OCTUBRE DE 2026

1. Extrae este ZIP. Copia el contenido de la carpeta plataforma-sdh-ug al repositorio de GitHub que publica tu sitio. Reemplaza TODOS los archivos, incluyendo la carpeta assets y el nuevo indicadores.js. Conserva los nombres completos de los archivos.
2. La matriz de Google Sheets no necesita datos adicionales para usar esta actualización. El sistema sigue combinando Base 107 con los conteos ITER, edades y otros insumos locales del paquete.
3. Después de publicar los archivos, recarga el sitio con Ctrl+F5. El catálogo tiene 107 opciones y el buscador es independiente: comunidad, municipio o clave.
4. Selecciona Alonso Yáñez y pulsa Guardar PDF A2. El resultado es una página horizontal de 594 × 420 mm. Para imprimir a tamaño original, usa papel A2 y escala 100%.

CAMBIOS
- Tarjetas sin pestañas, etiquetas grises en negrita y cifras en azul institucional.
- 195 viviendas particulares habitadas; 225 es el total que también incluye deshabitadas y temporales.
- Fecundidad y situación conyugal juntas; religión y migración juntas.
- Vivienda ampliada, etnicidad en seis tarjetas, discapacidad por actividad y todas las instituciones de salud.
- Economía sin pasteles y asistencia escolar en cinco grupos de edad.
- Únicamente las seis fuentes solicitadas, con cursivas y sangría francesa.
- Se conserva el mapa actualizado del equipo para Alonso Yáñez y la hoja A2.

MATRIZ Y REVISIÓN
Lee FICHAS_TECNICAS_actualizacion.md para registrar los indicadores, fórmulas y la explicación de viviendas en Fichas técnicas. El paquete NO modifica Google Sheets ni publica el sitio automáticamente.
Lee REVISION_OBSERVACIONES_FINALES.md para revisar los cambios de Carlos y las limitaciones de la verificación.

Si se cambian los JSON locales, hay que sincronizar también el respaldo del HTML. El script opcional sincronizar-respaldo.py hace esa actualización; requiere Python. Para instalar y usar esta versión no necesitas ejecutarlo.

SEGUNDA REVISIÓN CON LUIS
Este paquete incorpora el límite común de ancho de las etiquetas, cifras centradas verticalmente a la derecha, porcentajes de vivienda en una columna fija, “Años” vertical en la pirámide y barras económicas con más altura visible. Conserva los datos de la revisión anterior. El PDF de muestra correspondiente se llama SDH_Alonso_Yanez_A2_entrega_final.pdf y se entrega aparte del ZIP.

ÚLTIMOS RETOQUES
Discapacidad: porcentajes alineados a la derecha y barras ligeramente más gruesas. Situación conyugal: leyenda desplazada hacia la derecha. Educación: barras más altas y nota alineada con el borde inferior del recuadro de migración en el PDF de Alonso Yáñez.

HISTORIAS DESDE EXCEL
Se agregó historias.json con las nueve reseñas existentes y se retiró la reseña fija de app.js. En “Incorporar datos y mapas” puedes descargar la plantilla de las 107 claves e importar historias desde un CSV UTF-8. Columnas: Clave INEGI y Breve historia. Para compartir el archivo con todos, publica historias.csv en la raíz del sitio. Lee HISTORIAS_COMUNIDADES.md para los pasos. Esto no conecta automáticamente una nueva pestaña de Google Sheets.
