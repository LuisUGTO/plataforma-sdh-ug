# Contexto técnico del proyecto SDH–UG

**Fecha de corte:** 16 de octubre de 2026  
**Propósito:** transferir al siguiente agente una descripción comprobable del generador de infografías y del estado del trabajo, evitando que confunda entregables futuros con funciones ya construidas.

> Esta guía se basa en la entrega disponible en `outputs/SDH_Entrega_2026-10-14/generador_B`, sus instrucciones `outputs/SDH_Entrega_2026-10-14/LEEME.md` y las decisiones compartidas en las conversaciones del proyecto. En esta carpeta de trabajo no hay un repositorio Git en la raíz, ni se encontró una aplicación de tablero directivo o una matriz maestra implementada como software. La matriz `Base 107` se consulta en una hoja de cálculo compartida. Las rutas y configuraciones deben comprobarse al recibir el repositorio definitivo.

## 1. Objetivo general y alcance

El proyecto SDH–UG prepara información sociodemográfica de los pueblos y comunidades indígenas y afromexicanas de Guanajuato para consulta del equipo de la Secretaría de Derechos Humanos y la Universidad de Guanajuato. La meta amplia conversada comprende:

1. Un tablero directivo con mapas y resumen de las 107 comunidades.
2. Una matriz maestra de las 107 comunidades, que organiza datos censales y fuentes.
3. Un generador web de fichas/infografías, cuyo piloto de diseño y exportación es Alonso Yáñez.

**Estado real de la carpeta revisada:** el componente implementado y empaquetado es el generador de infografías. Consulta la pestaña `Base 107`, tiene respaldos locales y permite buscar/seleccionar comunidades, importar insumos auxiliares y generar una ficha PDF A2. La matriz completa y el tablero directivo son contexto y objetivos del proyecto; no deben describirse como módulos listos de esta entrega sin localizar sus repositorios o archivos fuente.

La entrega del 14 de octubre contiene dos PDF de comparación —encabezados A y B— y un único generador configurado con el encabezado B. El generador se puede copiar a la raíz publicada por GitHub Pages. Esa copia/publicación no se hizo desde esta carpeta ni la guía implica autorización para publicar.

## 2. Arquitectura actual y estructura de archivos

### 2.1 Entrega más reciente identificada

Carpeta de entrega: `outputs/SDH_Entrega_2026-10-14/`.

| Ruta | Función |
|---|---|
| `LEEME.md` | Instrucciones de integración y publicación; historial de observaciones de la entrega y límites de verificación. |
| `SDH_Alonso_Yanez_Opcion_A_A2.pdf` | Ficha A2 horizontal con identificación a la izquierda, logo al centro y título del panorama a la derecha. |
| `SDH_Alonso_Yanez_Opcion_B_A2.pdf` | Ficha A2 horizontal con identificación a la izquierda, título del panorama al centro y logo a la derecha. |
| `Encabezado_A.png`, `Encabezado_B.png` | Vistas de comparación de los dos encabezados. |
| `Vista_iconografia_actualizada.png` | Lámina de revisión de la iconografía. |
| `generador_B/` | Código, respaldos de datos, mapa, logos e iconografía para el sitio; encabezado B activo. |

### 2.2 Archivos principales de `generador_B`

| Archivo/carpeta | Responsabilidad y conexión |
|---|---|
| `index.html` | Página y estructura semántica de la infografía y controles. Contiene copias de respaldo integradas en variables globales (`SDH_RESPALDO`, `SDH_EDADES_RESPALDO`, `SDH_REUNION`, `SDH_GEOMETRY`, `SDH_HISTORIAS`) y carga hojas de estilo y módulos JavaScript. Es grande porque integra datos y GeoJSON para facilitar la publicación estática. |
| `app.js` | Arranque, consulta de `Base 107`, normalización/importación de CSV, selección y búsqueda, unión con complementos, renderizado de secciones, mapa, historial, eventos de interfaz y exportación PDF. |
| `indicadores.js` | Modelo estadístico para derivar valores y porcentajes de los campos crudos de ITER y la fila de Base 107. Expone `window.SDH_INDICADORES.build(...)`. Centraliza validación numérica, razones, formatos, ordenamiento y mediana estimada. |
| `pdf-export.js` | Exportador PDF vectorial propio, con medidas A2, composición de páginas, textos, tarjetas, gráficos, mapas, referencias e iconografía. Expone `window.SDH_PDF`; `app.js` lo usa para la descarga. No es una dependencia de npm ni una biblioteca PDF externa. |
| `historias.js` | Validación, lectura y generación de plantilla CSV de historias. Expone `window.SDH_HISTORIAS_API` con `fromRows`, `fromJSON` y `csv`. |
| `iconografia.js` | Trazos vectoriales utilizados en el PDF. Expone `window.SDH_ICONOGRAFIA`; debe permanecer junto al resto de scripts. |
| `styles.css` | Interfaz web y maquetación A2 de impresión/vista, incluidos colores, tarjetas, gráficos, encabezado y fondo de referencias. |
| `datos-respaldo.json` | Copia local de consulta de los registros de la base; se usa si falla la consulta en línea. En el HTML puede existir además una copia embebida. |
| `edades-respaldo.json` | Distribuciones por grupos de edad y sexo para construir pirámides y, cuando se cumplen condiciones, estimar edad mediana. |
| `insumos-reunion.json` | Campos complementarios de ITER organizados por clave y nombre de localidad, además de otros insumos de trabajo. |
| `historias.json` | Historias disponibles por clave INEGI, con texto, fuente y estado de validación. |
| `complementos.json` | Insumo heredado/auxiliar. Confirmar su uso antes de editar; en la entrega actual la ruta activa de complementos se ve en `insumos-reunion.json` y `edades-respaldo.json`. |
| `guanajuato-municipios.geojson` | Cartografía municipal de Guanajuato para dibujar el mapa estatal y resaltar municipios. |
| `sincronizar-respaldo.py` | Utilidad opcional que vuelve a insertar cinco respaldos JSON en etiquetas `window.SDH_*` de `index.html`. No consulta ni modifica Google Sheets. |
| `assets/logo-sdh-icon.png`, `assets/logo-sdh-descriptivo-horizontal.png` | Icono y logotipo usados por interfaz/ficha. |
| `assets/mapa-alonso-yanez.png` | Mapa final del piloto de Alonso Yáñez. La instrucción de entrega dice conservarlo sin modificaciones. |
| `assets/iconos/*.png` | 15 iconos PNG transparentes para los encabezados de sección web. |
| `assets/iconos/vector/*.svg` | Versiones editables de la iconografía. |
| `assets/iconos/atribuciones.md` | Créditos y atribuciones de iconos. |

### 2.3 Tecnologías y ejecución

- HTML, CSS y JavaScript estándar en el navegador; datos serializados como JSON y geometría GeoJSON.
- No se identificó un gestor de dependencias, paso de compilación ni framework en la carpeta de entrega. No introducir uno sin necesidad y sin revisar el repositorio real.
- `app.js` consulta Google Sheets mediante el endpoint de visualización `gviz/tq`, leyendo la pestaña `Base 107` del ID configurado en `CONFIG`. El ID está en el código de la entrega; se omite aquí para evitar duplicarlo. El archivo usa `fetch`, `AbortController` y un límite de tiempo de 15 s para esa consulta.
- Para contingencia, `load()` usa `datos-respaldo.json` si la consulta falla antes de obtener una fuente; si ya había datos en memoria, conserva esa última base cargada. La copia tiene fecha de consulta y no debe tratarse como una actualización en vivo.
- La cartografía municipal puede consultarse al endpoint GeoINEGI configurado en `CONFIG.geoUrl`; también se integra el GeoJSON local. Las localidades pueden buscarse con el endpoint INEGI de catálogo; Alonso Yáñez usa su mapa estático validado.
- Ejecutar desde un servidor web (por ejemplo GitHub Pages) para que funcionen `fetch` y los archivos locales. Abrir `index.html` directamente con `file://` puede impedir la consulta/carga de respaldos.
- `pdf-export.js` construye el PDF A2 de una página horizontal (594 × 420 mm) desde primitivas vectoriales y activos locales. El logo y el mapa se preparan como imágenes; los gráficos y textos se representan en el documento. El botón de la interfaz descarga el PDF con extensión `.pdf`.

### 2.4 Flujo de datos y renderizado

1. `load()` solicita `Base 107`; si falla, intenta `datos-respaldo.json`.
2. `recordsFromRows()` localiza el encabezado `Clave INEGI`, conserva filas con clave estatal de nueve dígitos con prefijo `11` y crea objetos. `canonical()` normaliza claves quitando acentos y pasando a minúsculas. `useRecords()` agrega complementos faltantes, llena el selector y llama a `render()`.
3. `rawFor(r)` une campos de `SDH_REUNION.iter` usando `Clave INEGI|Comunidad / Localidad`. `extraFor(r)` une datos etarios con la misma clave compuesta.
4. `SDH_INDICADORES.build(r, raw, extra)` calcula el modelo de indicadores (`m`).
5. `reunionRender(r)` y las funciones HTML/SVG de `app.js` actualizan las secciones. El mapa usa `drawMap()`/`loadCommunityLocation()`.
6. `exportPDF()` toma la selección actual y el modelo estadístico, lo pasa a `SDH_PDF` e inicia la descarga. La variante de encabezado activa es `B`.

## 3. Diccionario de datos, reglas y cruces

### 3.1 Fuentes y claves

- **ITER 2020 (INEGI):** fuente de conteos de población, edades, educación, actividad económica, condición de habla de lengua indígena, salud, situación conyugal, religión, discapacidad, vivienda, servicios y TIC. En el generador, los nombres de campos crudos conservan las claves ITER, por ejemplo `POBTOT`, `P3YM_HLI`, `P3HLI_HE`, `P3HLINHE`, `VIVPARH_CV`, `VPH_AGUADV`, `PEA`.
- **Matriz/hoja compartida `Base 107`:** datos agregados y categóricos que se consultan en línea. Entre los encabezados conocidos están `Clave INEGI`, `Comunidad / Localidad`, `Municipio`, `Pueblo Originario`, `Año Reconocimiento`, población total y por sexo, relación hombres-mujeres, promedios, valores porcentuales, grado de marginación y rezago social, vivienda y estado/fuente de datos. `indicadores.js` acepta acentos y variantes porque normaliza encabezados.
- **CONAPO:** grado e índice de marginación 2020. Se muestra el grado procedente de la matriz, cuando está disponible.
- **CONEVAL:** grado e índice de rezago social 2020. Se muestra el grado procedente de la matriz, cuando está disponible.
- **Cartografía:** GeoJSON de municipios Guanajuato y catálogo geográfico de INEGI. Las claves se validan como códigos del estado 11.
- **Historias:** `historias.json` y CSV del equipo. El texto de Alonso Yáñez se corrigió por Carlos el 13 de octubre de 2026; las demás reseñas conservan estado de revisión bibliográfica/histórica cuando aplica.

La clave de localidad INEGI, por ejemplo `110030008` para Alonso Yáñez, es la llave estable de registros. Los respaldos de ITER usan además la llave compuesta `clave|nombre` para evitar colisiones. Mantener ceros a la izquierda y el nombre asociado; no unir por nombre solo.

### 3.2 Grupos de variables y derivaciones activas

El modelo completo está en `indicadores.js`, función `build(record, raw, extra)`. Esta lista resume las dependencias que efectivamente usa:

| Bloque de la ficha | Campos ITER principales | Regla actual |
|---|---|---|
| Población/sexo | `POBTOT`, `POBMAS`, `POBFEM`, `REL_H_M` | Hombres y mujeres como proporción de `POBTOT`; relación hombres-mujeres se presenta como valor por cada 100 mujeres si está disponible. |
| Edad | `Edad mediana` de la matriz, o `edades-respaldo.json` | Preferir mediana informada. Si falta, `median()` estima solo con grupos quinquenales completos, consecutivos, válidos, compatibles con sexo y total; no estima desde intervalos parciales/reservados ni si la mediana cae en el grupo abierto final. La estimación no es cifra oficial de INEGI y se marca como estimada en metadatos. |
| Fecundidad | `PROM_HNV` o `Promedio Hijas(os) Nacidas(os) Vivas(os)` | Valor mostrado con dos decimales. |
| Situación conyugal | `P12YM_SOLT`, `P12YM_CASA`, `P12YM_SEPA`, denominador `P_12YMAS` | Proporciones por categoría respecto a población de 12 años y más; pastel con categorías y porcentajes. |
| Etnicidad | `P3YM_HLI`, `P_3YMAS`, `PHOG_IND`, `POB_AFRO`, `Pueblo Originario` | Hablantes de lengua indígena / población de 3 años y más; hogares censales indígenas y población afromexicana / población total. El nombre del pueblo procede de la matriz. |
| Distribución de habla española | `P3YM_HLI`, `P3HLI_HE`, `P3HLINHE` | El encabezado de prevalencia expresa población de 3 años y más que habla lengua indígena; el porcentaje de ese indicador usa `P3YM_HLI / P_3YMAS`. El pastel desglosa entre los hablantes `P3HLI_HE / P3YM_HLI` y `P3HLINHE / P3YM_HLI` para sumar 100% cuando los conteos son completos. Las etiquetas acordadas son **“Habla español”** y **“No habla español”**. Mostrar categoría de 0% en leyenda si el conteo es cero. No mezclar el denominador del pastel con el de prevalencia. |
| Vivienda | `VIVPARH_CV`, `TVIVPARHAB`, `OCUPVIVPAR`, `PROM_OCUP`, `PRO_OCUP_C` | Conteos de vivienda/personas y ocupantes promedio; porcentajes de atributos habitacionales se calculan sobre vivienda particular habitada con características (`VIVPARH_CV`). |
| Servicios, bienes y TIC | `VPH_C_ELEC`, `VPH_AGUADV`, `VPH_DRENAJ`, `VPH_EXCSA`, `VPH_TINACO`, `VPH_CISTER`, `VPH_REFRI`, `VPH_LAVAD`, `VPH_AUTOM`, `VPH_MOTO`, `VPH_BICI`, `VPH_HMICRO`, `VPH_PC`, `VPH_INTER`, `VPH_TELEF`, `VPH_CEL`, `VPH_TV`, `VPH_STVP`, `VPH_RADIO`; denominador `VIVPARH_CV` | Cada valor es hogares/viviendas con el atributo ÷ `VIVPARH_CV`. Se ordenan dentro de cada grupo por porcentaje descendente, conservando orden original en empates. En la columna TIC algunas categorías pueden aparecer cero o no disponible. |
| Religión | `PCATOLICA`, `PRO_CRIEVA`, `POTRAS_REL`, `PSIN_RELIG`, denominador `POBTOT` | Porcentaje del total de la población por categoría; barras horizontales. |
| Discapacidad | `PCON_DISC`, `PCON_LIMI`, `PCLIM_PMEN`, denominador `POBTOT` | Proporciones independientes sobre población total. Actividades con dificultad (`PCDISC_MOT`, `PCDISC_VIS`, `PCDISC_LENG`, `PCDISC_AUD`, `PCDISC_MOT2`, `PCDISC_MEN`) se dividen entre `PCON_DISC`; pueden superponerse y no deben sumarse como categorías mutuamente excluyentes. |
| Salud | `PDER_SS`, `PSINDER`, denominador `POBTOT` | Afiliación y no afiliación sobre total. Nota actual: afiliaciones múltiples pueden existir. |
| Institución de salud | `PDER_IMSS`, `PDER_ISTE`, `PDER_ISTEE`, `PAFIL_PDOM`, `PDER_IMSSB`, `PDER_SEGP`, `PAFIL_IPRIV`, `PAFIL_OTRAI`, denominador `PDER_SS` | Distribución entre población afiliada. ISSSTE y estatal se suman. PEMEX/Defensa/Marina y algunas categorías se rotulan en varias líneas para caber. Revisar compatibilidad histórica de nombres de institución antes de cambiar. |
| Economía/PEA | `PEA`, `PE_INAC`, `POCUPADA`, `PDESOCUP`, denominadores `P_12YMAS` o `PEA` | PEA/12+; PNEA/12+; ocupada/PEA; desocupada/PEA. Mantener las bases correctas; no comparar directamente PEA con PEA ocupada sin identificar denominador. |
| PEA por sexo/ocupación | `PEA_F`, `PEA_M`, `POCUPADA_F`, `POCUPADA_M` | Mujeres y hombres dentro de la PEA o población ocupada, respectivamente. Gráficas de barras verticales con etiqueta de porcentaje encima y centrada sobre cada barra. |
| Educación | `GRAPROES`, `P15YM_AN`, `P_15YMAS` | Escolaridad promedio y analfabetismo entre 15 años y más. |
| Nivel de escolaridad | `P15YM_SE`, `P15PRI_CO`, `P15SEC_CO`, `P_15YMAS`; `P18YM_PB`, `P_18YMAS` | Sin escolaridad, primaria completa y secundaria completa usan 15+; posbásica usa 18+. La nota explica que las categorías no suman 100% porque las referencias de edad son distintas y no se incluyen todas las categorías. |
| Asistencia escolar | `P_3A5`, `P3A5_NOA`; `P_6A11`, `P6A11_NOA`; `P_12A14`, `P12A14NOA`; `P15A17A`/`P_15A17`; `P18A24A`/`P_18A24` | Donde existe conteo de no asistencia, calcula (universo − no asiste)/universo. En 15–17 y 18–24 usa población que asiste / universo de grupo. |
| Migración | `PRESOE15`, `P_5YMAS`; `PNACOE`, `POBTOT` | Residencia en otra entidad en marzo de 2015 / 5+; nacida en otra entidad / total. |

Los nombres y signos exactos deben cotejarse en la versión viva del ITER antes de editar. La tabla anterior refleja las expresiones de la entrega del 14 de octubre, no constituye una nueva validación de los microdatos/fuentes originales.

### 3.3 Validación, limpieza y excepciones

- `norm()` quita diacríticos, convierte a minúsculas y colapsa puntuación/espacios para comparar encabezados sin depender de acentos o mayúsculas.
- `number()` rechaza valores vacíos, códigos de dato no disponible y valores con `*` reservado; los porcentajes y conteos reservados no se convierten a cero.
- `ratio(a,b)` requiere valores numéricos, `b > 0`, `a >= 0` y `a <= b`. En caso contrario retorna `null`, que se representa como `Dato no disponible`/estado pendiente, no como 0%.
- El porcentaje se admite como fracción decimal o literal con `%`, y se limita al intervalo 0–100. El redondeo visual es a una decimal; no usar redondeo para validar identidades de conteo.
- Importación de base: exige encabezado `Clave INEGI`, conserva claves `11` + siete dígitos, admite ceros a la izquierda, y si no encuentra filas válidas devuelve error. CSV admite comillas escapadas y separador coma o punto y coma según la primera línea.
- `median()` y `pyramid()` validan intervalos, edades, conteos enteros no negativos y consistencia con población total/sexo. Cuando falta información, la pirámide o la mediana quedan pendientes; no inventar categorías ni prorratear valores reservados.
- Validación GeoJSON exige `FeatureCollection`, claves municipales de Guanajuato, coordenadas dentro de rangos válidos, polígonos/multipolígonos y exactamente 46 municipios.
- Historias CSV: columnas requeridas `Clave INEGI` y `Breve historia` (también acepta `Breve historia de la comunidad` o `Historia`), clave estatal válida, sin duplicados. Solo historias con texto se agregan; el CSV afecta sesión actual, salvo que se publique como `historias.csv` junto al HTML.
- **San Agustín / Comonfort:** tratar como caso con datos/ubicación por confirmar. No asociar automáticamente el mapa piloto ni los complementos de Comonfort a San Agustín. El código evita la búsqueda geográfica automática por nombre para San Agustín cuando no hay ubicación validada y conserva el mapa municipal con aviso. La edad todavía requiere criterio de Carlos; no calcular o sustituir el dato hasta que lo indique.
- **PEA:** se discutió un descuadre entre categorías. Mantener fórmulas y denominadores separados tal como están implementados; no forzar PEA + PNEA ni ocupación + desocupación a 100% desde el código sin rastrear campos, universos, faltantes y notas de la fuente. La entrega señala que se comparó el modelo con su versión anterior y que la modificación de octubre 14 solo cambió dos etiquetas del pastel, no fórmulas/valores.
- **Alonso Yáñez:** clave `110030008`; el nombre histórico recibido de Carlos usa “Alonzo Yáñez” en el texto corregido, mientras el catálogo/ficha puede mostrar “Alonso Yáñez”. No normalizar por cuenta propia hasta acordar grafía oficial. Se conserva el mapa final sin modificaciones.
- Estado de filas de respaldo en la matriz de trabajo puede ser “Datos cargados; revisión pendiente”; una cifra visible no significa que su fuente ya esté validada para publicación.

## 4. Diseño, maquetación y exportación

- Página de salida: A2 horizontal, 594 × 420 mm, una página. Se exporta directamente y el archivo debe conservar `.pdf`.
- Paleta CSS principal: azul `#004B87`, azul claro `#69B3E7`, azul pálido `#C8D8EB`, gris `#54585A`, línea `#CED9E3`; series de gráficos usan turquesa `#008E95`, morado `#84369B`, naranja `#E66D42` y verde `#319356` (además de azul en algunas gráficas). No alterar sin acuerdo visual.
- Tipografía CSS usa Arial/Helvetica sans-serif. El PDF tiene métricas de texto y cálculo de ajuste de etiqueta propios; no presupone que una fuente instalada cambie el ancho.
- Títulos de sección llevan iconografía aprobada en fondo azul institucional. El icono de discapacidad es la figura de accesibilidad con brazos abiertos dentro de un círculo, no una silla de ruedas. Territorio y migración usan el contorno de Guanajuato. Religión usa símbolo multirreligioso.
- Encabezado **B** se utiliza en `generador_B`; la opción A existe como PDF comparativo, no como segundo generador. La decisión final de encabezado aún debe confirmarse.
- Regla de etiquetas acordada: “Población de 3 años y más que” es el límite de ancho de referencia para rótulos en tarjetas; los textos deben pasar a segunda línea dentro del límite. `pdf-export.js`: `LABEL_REFERENCE`, `LABEL_PT`, `labelLimit()`, `labelText()`, `labelLines()`, `cardLayout()`. Evitar etiquetas que excedan ese ancho o cifras que invadan el texto.
- Valores de tarjetas alineados a la derecha y centrados verticalmente frente a su etiqueta. Porcentajes de barras horizontales van junto al extremo de la barra; barras verticales tienen su porcentaje centrado sobre la barra.
- Pasteles tienen leyenda de color, porcentaje y etiqueta. El ajuste más reciente solicitado por Carlos para **Distribución entre hablantes** todavía está pendiente: compactar y centrar verticalmente las dos filas de leyenda respecto del pastel, como el ejemplo de situación conyugal, para quitar espacio vertical excesivo. Mantener porcentajes pegados a sus etiquetas y conservar el pastel, colores y valores.
- Fuentes y referencias: la propuesta agrega un degradado blanco a azul institucional muy tenue detrás de la sección, de borde a borde del ancho A2; contenido textual conserva márgenes. Confirmar si Carlos desea mantenerlo. No extender el fondo a otras secciones.
- La historia breve se presenta como párrafo. Para cargar historias masivamente, existe plantilla CSV por `Clave INEGI` y `Breve historia`; no se escriben 107 textos manualmente en el código.
- Impresión A2: orientación horizontal, escala 100%, sin márgenes, gráficos de fondo activados, si se emplea un flujo de impresión. Verificar que el PDF final conserve una sola página y sus medidas originales.

## 5. Estado actual verificable

La guía `outputs/SDH_Entrega_2026-10-14/LEEME.md` informa que se revisaron visualmente los dos PDF, que contienen una página A2 y seis enlaces en referencias; que se verificaron las 107 exportaciones del respaldo, distribución de encabezados A/B en 107 comunidades, 15 PNG transparentes, referencias locales, controles y descarga; y que la comparación estadística confirmó que el cambio de octubre 14 solo modificó etiquetas del pastel de lengua.

Funciones entregadas:

- búsqueda por comunidad, municipio o clave y selector completo;
- consulta en línea de `Base 107` y respaldo JSON para contingencia;
- importación de CSV de base, JSON de edad/coordenadas, GeoJSON municipal e historias CSV para la sesión;
- renderizado de secciones demográficas, territorio/mapa, historia, fecundidad, situación conyugal, vivienda/servicios/bienes/TIC, etnicidad/lengua, rezago y marginación, religión, migración, discapacidad, salud, PEA, educación y asistencia escolar;
- gráficas HTML/SVG y generación del PDF A2;
- historias JSON, plantilla CSV y lectura opcional de `historias.csv` publicado junto al HTML;
- iconografía PNG para la vista web y representación vectorial para PDF;
- encabezado B activo en el código, y PDFs A/B para revisión.

**Limitaciones registradas por la propia entrega:** no se logró hacer una prueba manual en un navegador real ni después de publicar; los resultados locales no sustituyen la inspección visual individual de las otras 106 comunidades. No se modificó/publicó GitHub ni se modificó la hoja Google Sheets al preparar el paquete. Los 15 iconos están listos según las especificaciones documentadas, pero el encabezado y el degradado siguen sujetos a decisión/revisión.

## 6. Pendientes y próximos pasos

Orden sugerido por el estado de la conversación al 16 de octubre de 2026:

1. **Leyenda de distribución entre hablantes:** ajustar su posición para que las dos filas queden más compactas y centradas verticalmente al lado del pastel, siguiendo la referencia de situación conyugal. Luego revisar el PDF de Alonso Yáñez.
2. **Edad de San Agustín:** esperar el criterio de Carlos; dijo que revisaría la edad y comunicaría cómo proceder. No importar datos de Comonfort ni inferir una edad.
3. **Encabezado:** definir si se conserva A o B o si diseño entrega un encabezado definitivo. Actualmente el generador está en B.
4. **Degradado de fuentes:** confirmar si se mantiene la banda tenue de borde a borde en referencias.
5. **Revisión final manual:** abrir el generador en servidor/navegador real, seleccionar Alonso Yáñez (110030008), comprobar consulta, iconos, mapa, historia, leyenda y descarga. Abrir el PDF y confirmar una página A2 horizontal. Después de publicar GitHub Pages, repetir la comprobación con recarga forzada.
6. **San Agustín y otras comunidades:** con datos/regla aprobados, validar mapa y salida de esa comunidad; posteriormente inspeccionar visualmente comunidades con distintas longitudes de texto, categorías cero, datos reservados, pirámides parciales y configuraciones municipales.
7. **Tablero/matriz maestra:** localizar el repositorio o archivo de trabajo de estos entregables y documentarlos por separado. No asumir que están incluidos en `generador_B`.

### Instrucciones de preservación para el siguiente agente

- Antes de editar, verificar que se está trabajando en `outputs/SDH_Entrega_2026-10-14/generador_B` o en el repositorio que lo reemplazó; identificar el commit/versión real cuando haya un repositorio.
- Mantener los cinco respaldos HTML y sus JSON locales sincronizados si se cambian datos; usar `sincronizar-respaldo.py` solamente después de revisar esos JSON. El script reescribe las variables correspondientes de `index.html`.
- No cambiar fórmulas, denominadores, datos, títulos acordados, mapa piloto, iconos ni historia como parte de un ajuste de maquetación.
- Al integrar al repositorio GitHub Pages, copiar el **contenido** de `generador_B` a la raíz de publicación, incluyendo todos los scripts, JSON, GeoJSON y `assets`; conservar archivos propios del repositorio que no pertenezcan a esta entrega.
- Registrar en el cambio qué provino de Carlos, qué es decisión de diseño y qué es cálculo. Si una fuente, edad o universo es ambiguo, dejarlo como pendiente y pedir confirmación antes de inferir.

## Anexo: campos crudos de ITER mencionados por módulo

**Demografía:** `POBTOT`, `POBMAS`, `POBFEM`, `REL_H_M`, `P_3YMAS`, `P_5YMAS`, `P_12YMAS`, `P_15YMAS`, `P_18YMAS`, grupos `P_0A4`…`P_85YMAS` y desgloses `_F`/`_M`.  
**Lengua/identidad:** `P3YM_HLI`, `P3HLI_HE`, `P3HLINHE`, `PHOG_IND`, `POB_AFRO`, `PUEBLO ORIGINARIO` (matriz).  
**Discapacidad y salud:** `PCON_DISC`, `PCON_LIMI`, `PCLIM_PMEN`, `PCDISC_MOT`, `PCDISC_VIS`, `PCDISC_LENG`, `PCDISC_AUD`, `PCDISC_MOT2`, `PCDISC_MEN`, `PDER_SS`, `PSINDER`, `PDER_IMSS`, `PDER_ISTE`, `PDER_ISTEE`, `PAFIL_PDOM`, `PDER_IMSSB`, `PDER_SEGP`, `PAFIL_IPRIV`, `PAFIL_OTRAI`.  
**Educación/economía:** `GRAPROES`, `P15YM_AN`, `P15YM_SE`, `P15PRI_CO`, `P15SEC_CO`, `P18YM_PB`, `P_3A5`, `P3A5_NOA`, `P_6A11`, `P6A11_NOA`, `P_12A14`, `P12A14NOA`, `P15A17A`, `P_15A17`, `P18A24A`, `P_18A24`, `PEA`, `PEA_F`, `PEA_M`, `PE_INAC`, `POCUPADA`, `POCUPADA_F`, `POCUPADA_M`, `PDESOCUP`.  
**Vivienda/TIC:** `VIVPARH_CV`, `TVIVPARHAB`, `OCUPVIVPAR`, `PROM_OCUP`, `PRO_OCUP_C`, `VPH_C_ELEC`, `VPH_AGUADV`, `VPH_DRENAJ`, `VPH_EXCSA`, `VPH_TINACO`, `VPH_CISTER`, `VPH_REFRI`, `VPH_LAVAD`, `VPH_HMICRO`, `VPH_AUTOM`, `VPH_MOTO`, `VPH_BICI`, `VPH_PC`, `VPH_INTER`, `VPH_TELEF`, `VPH_CEL`, `VPH_TV`, `VPH_STVP`, `VPH_RADIO`.
