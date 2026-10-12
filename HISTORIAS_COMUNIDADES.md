# Historias de las 107 comunidades

La propuesta de Carlos permite mantener las reseñas sin escribirlas dentro del código. La clave INEGI identifica cada comunidad: en el catálogo actual las 107 claves son distintas.

## Archivo de trabajo en Excel

Usa una fila por comunidad y dos columnas:

| Clave INEGI | Breve historia |
|---|---|
| 110030008 | Reseña de Alonso Yáñez… |
| 110030018 | Reseña de Banda… |

Conserva los nombres de estos encabezados. Trata la clave como texto y conserva sus nueve dígitos. No repitas una clave. Los textos son reseñas de las localidades, no instrucciones para el generador.

Puedes crear una pestaña “Historias” en la matriz de Google o trabajar en un Excel independiente. **Esta versión importa el CSV y no consulta automáticamente una pestaña nueva de Google Sheets.**

## Preparar e importar las historias

1. En el generador abre “Incorporar datos y mapas” y pulsa “Descargar plantilla de historias”. Se descarga un CSV que puedes abrir en Excel; contiene las 107 claves y las nueve reseñas disponibles.
2. Escribe las reseñas en la segunda columna. Conserva la versión revisada de Alonso Yáñez. Una celda vacía significa que aún no agregaste la historia; no elimina las reseñas que ya tiene el paquete.
3. Guarda como **CSV UTF-8**. Las comas, comillas y saltos de línea dentro de las historias se conservan.
4. Usa el campo “Historias desde Excel (CSV UTF-8)” para probar el archivo. El generador vincula los textos por clave INEGI. Los cambios importados se usan en esa sesión.
5. Para compartirlas con todos, nombra el archivo **historias.csv**, ponlo junto a index.html y súbelo al repositorio. El generador lo leerá automáticamente al abrirse. No necesitas modificar app.js.

La validación rechaza claves desconocidas, duplicadas o archivos sin los encabezados requeridos. Si falta una historia, el espacio muestra “Reseña histórica pendiente”. Las historias deben ser breves para caber en la hoja A2; el exportador avisa cuando el contenido excede el área disponible y no corta la reseña silenciosamente.

## Respaldo y prioridad

- Las nueve historias iniciales están en **historias.json**. La reseña de Alonso Yáñez es la misma del PDF revisado; las otras ocho conservan los textos y metadatos del equipo.
- Ese JSON también está incrustado en index.html para mostrar las historias aun cuando la consulta local no esté disponible.
- Si existe historias.csv, sus textos no vacíos tienen prioridad sobre el JSON para las claves que contiene.
- Una importación manual durante la sesión tiene prioridad y evita que una consulta pendiente sobrescriba los textos recién importados.
- Si editas historias.json, ejecuta sincronizar-respaldo.py para actualizar también el respaldo del HTML. No necesitas ese paso si publicas un historias.csv nuevo.
- El antiguo apartado historia de insumos-reunion.json se conserva como antecedente; el generador usa la fuente nueva descrita aquí.

Las reseñas externas se insertan como texto, no como HTML ejecutable. El paquete no cambia la matriz compartida ni publica archivos por sí mismo.
