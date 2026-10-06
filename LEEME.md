# Generador SDH / UG: versión revisable

Mantiene carta horizontal (279.4 × 215.9 mm), una hoja por comunidad. No es una aprobación de cifras ni una publicación oficial.

## Probar y publicar

1. Conserva una copia de la versión anterior del sitio.
2. Prueba esta carpeta mediante un servidor local, o publícala primero en una carpeta de prueba de tu repositorio. Abrir index.html con doble clic puede impedir la lectura de archivos JSON por las restricciones del navegador.
3. Selecciona una comunidad. El generador intenta consultar Base 107 mediante la conexión existente de Google. Si falla, usa datos-respaldo.json y muestra explícitamente que es una copia del 6 de octubre de 2026. Actualizar base vuelve a intentar la consulta; no escribe en Sheets.
4. Guardar PDF abre la impresión del navegador. Selecciona Guardar como PDF, carta horizontal, escala 100%, sin encabezados ni pies del navegador y con gráficos de fondo. Comprueba que diga una página.
5. Para reemplazar la versión principal, copia index.html, styles.css, app.js, datos-respaldo.json, complementos.json y assets al repositorio de GitHub Pages. Esta entrega no modifica ni publica el sitio actual.

## Datos y porcentajes

Se leen encabezados, no posiciones fijas. Las columnas de porcentajes sin símbolo se interpretan como proporciones entre 0 y 1, según la base revisada. Un CSV puede incluir porcentajes explícitos como 73.6%. No usar 73.6 sin símbolo en una columna que contiene proporciones. Cero se conserva; vacío/ND/SD se muestra como dato no disponible; asteriscos se muestran como dato reservado. Las cifras conservan el estado de revisión de la base.

La copia de consulta incluye 107 comunidades. San Agustín contiene cifras del insumo de trabajo, pendientes de documentar y revisar. 110090001 es la clave de referencia de Comonfort; el generador no usa esa clave para inventar la ubicación de San Agustín. Los grados de marginación y rezago se identifican como referencias de Comonfort. Hay una nota general de la base que dice que sus conteos están pendientes, aunque su fila contiene cifras: se conservan como cifras del insumo de trabajo, nunca como cifras aprobadas.

## Mapa completo

El generador intenta leer guanajuato-municipios.geojson y, si no existe, el servicio oficial https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgem/11. Si el servicio falla o impide solicitudes desde GitHub Pages, incorpora un archivo local obtenido de Geografía. Debe ser FeatureCollection con los 46 municipios, geometrías Polygon/MultiPolygon y properties.cvegeo de cinco dígitos. Coordenadas GeoJSON en longitud/latitud (WGS84). Se dibuja todo el estado y se destaca el municipio.

Para localidades ordinarias se intenta consultar el catálogo INEGI: solo se coloca un punto si coinciden clave y nombre y está dentro del municipio. Las diferencias de nombre se dejan pendientes, sin aproximarlas. Para San Agustín, incorpora coordenadas validadas por el equipo en complementos.json. Un punto identifica ubicación, no un polígono territorial de la comunidad.

## Complementos de coordenadas y edades

Cada comunidad se identifica mediante `clave|nombre`, por ejemplo `110090001|San Agustín`. El archivo complementos.json contiene `{"comunidades":{}}`. Se puede importar por los controles; para compartirlo con el equipo, guardar su contenido en el archivo del repositorio.

Estructura de cada entrada (reemplaza los valores null con datos reales antes de usar):

```json
{
  "comunidades": {
    "110090001|San Agustín": {
      "ubicacion": {
        "validada": false,
        "latitud": null,
        "longitud": null,
        "fuente": "Documento de validación de Geografía"
      },
      "fuenteEdades": "Fuente, año y cobertura territorial",
      "edades": [
        {"desde": 0, "hasta": 4, "hombres": null, "mujeres": null},
        {"desde": 5, "hasta": 9, "hombres": null, "mujeres": null}
      ]
    }
  }
}
```

`hasta: null` significa grupo abierto (por ejemplo 85+). Los intervalos no pueden superponerse. Hombres y mujeres son conteos enteros. La escala es porcentaje de población total, idéntica para ambos lados. Si la suma es menor al total se muestra una nota de cobertura pendiente; si excede el total o el total por sexo, se rechaza el gráfico. No hay barras de simulación.

## Identidad y límites de esta entrega

Paleta del manual: #004B87, #69B3E7, #C8D8EB y grises. Se mantiene el logotipo proporcionado. Títulos Vollkorn (fuente externa); texto Helvetica Neue LT Std si está instalada, con alternativas Helvetica Neue/Arial. Para equivalencia tipográfica estricta se requiere un archivo de Helvetica Neue LT Std autorizado para uso web; no se incluye ni se redistribuye su licencia.

Los bloques sin información mantienen su espacio. Esta versión añade servicios, bienes, TIC y afiliaciones que ya estaban en la base. No inventa migración, edad mediana, escolaridad por niveles, situación conyugal o inactividad económica. El mecanismo de Google conserva los permisos existentes; consultar el sitio público no equivale a tener control de acceso de usuarios. No se agregaron credenciales al proyecto.

Se incluye version-original.html como referencia de la plataforma y la gobernanza anterior. La nueva interfaz enlaza directamente a la hoja de ruta compartida, para no duplicar estados de etapas.

## Verificación realizada y pendiente

Se comprobó la sintaxis y la lectura de las 107 comunidades, la preservación de ceros y asteriscos, la interpretación de porcentajes y el cálculo de ocupación con denominador PEA. Se verificó que el sitio publicado original carga el catálogo. El navegador disponible no logró acceder al servidor de previsualización local: la comprobación visual y la impresión de esta nueva versión en el navegador del usuario siguen pendientes. Tampoco se pudo descargar aquí la cartografía oficial; su carga depende del servicio o del GeoJSON local. No presentar esta entrega como un generador definitivo validado hasta realizar esas comprobaciones.
