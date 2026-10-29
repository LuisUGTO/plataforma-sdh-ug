# Propuesta global de las 107 comunidades

Fecha: 29 de octubre de 2026. Estado: propuesta de revisión, con introducción general pendiente.

## Universo

La ficha reúne toda la población de las 107 localidades con clave INEGI única del catálogo, en 13 municipios. No representa exclusivamente a las personas indígenas ni a toda la población indígena de Guanajuato. No se agrega ninguna fila a la base original: `GLOBAL` es un identificador interno de la vista adicional, no una clave INEGI.

El insumo local actual suma **91,683 habitantes: 43,704 hombres y 47,979 mujeres**. San Agustín se incluye una sola vez con sus cifras censales de trabajo y los desgloses recibidos; no se agrega población de todo Comonfort.

## Reglas de agregación

- `resumen-global.js` usa una lista explícita de conteos censales. Excluye porcentajes, promedios, medianas, coordenadas, índices y grados categóricos.
- Cada campo solo se suma si sus 107 valores son enteros no negativos disponibles. Un reservado, vacío, nulo o faltante invalida ese agregado; no se convierte en cero ni se calcula una tasa sobre una cobertura distinta del denominador. En los insumos actuales, todos los campos seleccionados tienen cobertura de 107/107.
- Los porcentajes se vuelven a calcular como suma de numeradores dividida por suma de sus denominadores. No se promedian ni se suman porcentajes de localidades.
- Ejemplos: discapacidad / población total; hablantes de lengua indígena / población de 3 años y más; PEA / población de 12 años y más; ocupación / PEA; servicios de vivienda / viviendas particulares habitadas con características; dificultad por actividad / población con discapacidad. La afiliación por institución conserva el universo de población afiliada y la nota sobre afiliaciones múltiples.
- El resumen se construye en memoria a partir de las mismas fuentes que usa cada ficha. Los JSON, la hoja de Google y las 107 introducciones originales no se modifican.

## Adaptación de los indicadores no aditivos

Se conserva la estructura A2, pero estos espacios de la propuesta global presentan conteos en lugar de combinar indicadores incompatibles:

| Espacio individual | Indicador de la propuesta global | Criterio |
|---|---|---|
| Edad mediana | Población de 60 años y más: 8,679 | No se promedian medianas ni se infiere una mediana a partir de cuatro intervalos desiguales. |
| Promedio de ocupantes por vivienda | Total de viviendas particulares: 28,615 | No se promedian valores locales redondeados. |
| Promedio de ocupantes por cuarto | Viviendas de uso temporal: 1,918 | No se inventa un denominador agregado de cuartos. |
| Promedio de hijos nacidos vivos | Población femenina de 12 años y más: 36,600 | Se muestra el universo disponible; no se estima un promedio sin sus numeradores y exclusiones exactos. |
| Grado promedio de escolaridad | Población de 15 años y más: 63,166 | No se aproxima el promedio global con promedios locales ni sin el universo exacto del indicador. |
| Pueblo por autoadscripción | Número de comunidades con población hablante de lengua indígena | No se asigna un solo pueblo indígena a todo el conjunto. |
| Grado de marginación | Número de comunidades con grado alto o muy alto: 4 | No se asigna un grado de marginación al agregado. |
| Grado de rezago social | Número de comunidades con grado alto o muy alto: 4 | No se promedian categorías ni índices para crear un grado nuevo. |

La introducción general sigue pendiente. El título del bloque Fecundidad se conserva para mantener el orden de las fichas, pero su tarjeta global identifica expresamente el conteo de población femenina que presenta.

## Edades, residuos y diferencias que se conservan

- La pirámide global utiliza los cuatro intervalos comunes reconstruibles con los conteos por sexo: 0–14, 15–17, 18–59 y 60+. Se obtienen por diferencias entre población total, de 15 años y más, de 18 años y más y de 60 años y más, para cada sexo. No se distribuyen edades proporcionalmente ni se crean grupos quinquenales.
- Se conservan las diferencias de una persona entre los totales de grupos y sus desgloses por sexo del insumo de San Agustín. En el agregado, 60+ declara 8,679 y sus conteos por sexo suman 8,678; en 18–59 la diferencia es inversa. Ambos sexos de la pirámide completa suman los 91,683 habitantes. Estas diferencias se registran en `extra.ageDifferences` y se mencionan en la nota de composición.
- Religión: los cuatro grupos recibidos suman 91,630, frente a 91,683 habitantes. La diferencia de **53** se presenta como “Sin especificar en el desglose”. Es un residuo aritmético del insumo, no una nueva afiliación religiosa ni una imputación. Solo se habilita si cada localidad tiene conteos completos y la suma de sus grupos no supera su población.
- Habla española entre personas hablantes de lengua indígena: el universo suma **3,705**, y los dos conteos de condición conocida suman **3,697**. La diferencia de **8** se presenta como “Sin especificar en el desglose”, sin adjudicarla a habla o no habla española. El cálculo se habilita con las mismas comprobaciones de completitud y no negatividad por localidad. No se modifica el tratamiento de los estados de los gráficos individuales.
- Actividad: 39,326 personas en la PEA + 29,218 en la PNEA suman 68,544, frente a 68,829 de 12 años y más: diferencia de **285**.
- Ocupación: 38,742 ocupados + 577 desocupados suman 39,319, frente a 39,326 en la PEA: diferencia de **7**. Las notas exponen ambas diferencias sin afirmar que correspondan a las mismas personas ni redistribuirlas.

## Mapas y presentación

Los 107 mapas y el mapa global se leen directamente desde `assets/New_mapas/`, mediante `mapas.js`. Los individuales se vinculan por sus primeros nueve dígitos INEGI y el mapa global tiene una ruta explícita. Alonso Yáñez utiliza también el mapa nuevo. Los archivos anteriores permanecen intactos como antecedente, pero el generador ya no los selecciona.

El resumen conserva el encabezado ganador, fuentes oficiales, iconos y una página A2 horizontal de 594 × 420 mm. El mapa global ocupa el espacio de mapa de la primera columna; las tarjetas territoriales presentan comunidades, municipios, entidad y cobertura, en vez de atribuir una sola altitud o coordenada al conjunto. El apartado de discapacidad se titula “Discapacidad, limitación y condición mental” en las 108 vistas. En todas las notas, solo “Nota:” va en negrita.

La aprobación de esta propuesta y de sus indicadores globales corresponde a la revisión institucional. Esta actualización no publica ni altera la base productiva.
