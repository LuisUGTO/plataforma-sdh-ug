# Verificación de las observaciones de Carlos

Actualización del 11 de octubre de 2026. Punto de partida: PDF vPiloto y documento “Infografía - Observaciones Prototipo”. Se conserva la salida A2 horizontal, 594 × 420 mm, una sola página.

| Apartado | Cambio aplicado |
|---|---|
| Reglas generales | Se retiraron las pestañas y bordes de color de las tarjetas. Etiquetas en gris y negrita; valores grandes, en azul institucional. Las etiquetas numéricas de las gráficas son grises. |
| Historia | Texto justificado; ortografía y acentos revisados. Se conserva la reseña del equipo; no se agregan hechos históricos nuevos. |
| Territorio | Municipio, Altitud, Latitud y Longitud; valores mayores y sin pestañas. Mapa del equipo para Alonso Yáñez; mapa estatal para las otras localidades. |
| Composición | Relación hombres-mujeres y Edad mediana; notas pedidas, valores azules y espacio interno. Población total conserva el recuadro azul. Pirámide con “Años”, edades a la izquierda y un cero central. |
| Fecundidad y situación conyugal | Ambos apartados debajo de composición; fecundidad a la izquierda, situación conyugal a la derecha. Nombre completo del indicador, título del pastel y tres etiquetas solicitadas. |
| Vivienda: tarjetas | Dos columnas y dos filas. Total de viviendas particulares habitadas y población en esas viviendas en fondo azul; promedios de ocupantes por vivienda y cuarto debajo. Se retiró ocupantes por dormitorio. |
| Vivienda: gráficos | Servicios y equipamiento, bienes y tecnologías; orden descendente, separadores grises. Se incorporan microondas, radio, televisión de paga y línea telefónica fija. |
| Etnicidad | Seis tarjetas en dos columnas y tres filas, con las denominaciones completas, Otomí y los porcentajes correspondientes. |
| Desarrollo social | Dos tarjetas sin bordes de color, valores azules. |
| Religión y migración | Religión a la izquierda y migración a la derecha debajo de desarrollo social. Cuatro grupos religiosos ordenados; primero residencia en otra entidad en 2015, después nacimiento en otra entidad. |
| Discapacidad | Tres tarjetas a la izquierda y seis barras por actividad a la derecha; denominadores documentados. |
| Salud | Leyenda de afiliaciones múltiples dentro de la tarjeta. Se quitó el título del gráfico; aparecen las siete instituciones, incluyendo los ceros reales. |
| Economía | Se retiraron los dos pasteles. Cuatro tarjetas y dos gráficos de barras por sexo con los nombres solicitados. |
| Educación | Dos tarjetas y dos gráficos. Nota solicitada con “Nota:” en negrita. Asistencia en cinco grupos; un color para todas sus barras. |
| Fuentes | Sección con icono y línea azul, únicamente las seis referencias solicitadas, títulos en cursiva, sangría francesa y enlaces. |

## Corrección acordada con Luis

La observación de vivienda pedía “habitadas” pero señalaba TVIVPAR. Se utilizó **TVIVPARHAB = 195**, que corresponde al nombre. TVIVPAR = 225 incluye 20 deshabitadas y 10 de uso temporal. La explicación está en `FICHAS_TECNICAS_actualizacion.md`.

## Verificación realizada

- Exportación programática de las 107 comunidades del respaldo: sin errores de distribución; no sustituye la revisión individual de cada comunidad.
- Flujo de la interfaz comprobado mediante un entorno de prueba: catálogo, búsqueda por tres criterios, selección, respaldo sin conexión y llamada al exportador. El navegador disponible en esta sesión no pudo acceder al servidor local, por lo que no se realizó una prueba manual completa en navegador.
- PDF de Alonso Yáñez abierto nuevamente, confirmado como una sola página A2 y revisado visualmente después de renderizarlo. Se conserva el mapa actualizado del equipo.
- Se verificaron viviendas, porcentajes de religión y discapacidad, afiliación, asistencia escolar y estimación de edad mediana frente a los conteos ITER.

## Fuera del alcance de esta actualización

No se publicaron cambios en GitHub Pages ni se editó la matriz de Google Sheets. La fuente y fecha del mapa del equipo siguen pendientes de documentación. Los insumos definitivos del equipo de diseño (encabezado, iconos y fondo) se podrán incorporar cuando los entreguen. La asistencia calculada por complemento de no asistencia tiene la limitación descrita en la ficha técnica.

## Segunda revisión visual con Luis

- Las etiquetas de las tarjetas tienen un ancho máximo común, medido con la línea “Población de 3 años y más que” (aproximadamente 5 cm a 9.5 puntos). Los cuadros estrechos respetan ese máximo y reducen el ancho disponible cuando hace falta conservar espacio para el valor.
- En etnicidad se respetan los saltos de línea “Población de 3 años y más que / habla alguna lengua indígena / y habla español”, así como el equivalente con “y no habla español”. Pueblo indígena por autoadscripción se presenta en dos renglones.
- Valores alineados a la derecha y centrados verticalmente en las tarjetas, incluyendo etnicidad, desarrollo social y los recuadros con notas.
- Los porcentajes de los tres grupos de vivienda vuelven a una columna fija a la derecha, separados de las barras; mantienen el gris uniforme aprobado para las gráficas.
- “Años” se presenta vertical, en negrita y al lado de las edades, con separación entre ambos.
- Las barras de los dos gráficos económicos crecen usando el espacio reservado anteriormente para las etiquetas inferiores. Se conserva el espacio antes de educación y la escala de 0 a 100%.
- No se modificaron los datos, fórmulas, fuentes ni la matriz de Google Sheets. Se conserva una hoja A2.

## Cierre de los retoques visuales

- Discapacidad: porcentajes en columna fija a la derecha, barras de 3.3 mm de grosor, sin cambiar los valores ni el denominador.
- Situación conyugal: leyenda cuatro milímetros más a la derecha, con texto alineado a la izquierda.
- Educación: en Alonso Yáñez, altura de gráficos de 43.475 mm; el final de la nota se alinea con el borde inferior de la última tarjeta de migración. La distribución limita el crecimiento según el espacio disponible de cada localidad.
- Se conservan el ancho común de las etiquetas, los valores centrados verticalmente, “Años” vertical, 195 viviendas habitadas y la salida en una hoja A2.
- Se externalizaron las nueve historias a historias.json, se agregó importación/plantilla CSV con vinculación por clave y lectura opcional de historias.csv publicado junto al sitio. Las historias faltantes se mantienen pendientes.
- La propuesta de títulos, iconografía y fondo del equipo de diseño sigue pendiente de entrega. No se publicó el sitio ni se editó Google Sheets.
