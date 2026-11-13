# Contexto vigente del proyecto SDH–UG

**Actualización del 13 de noviembre de 2026.** El repositorio ya incluye el portal público en `portal/`, la revista interactiva y un nuevo lote de fichas. La [auditoría de la actualización de Carlos](Documentacion/AUDITORIA_CHARLIE_2026-11-13.md) registra el estado actual de esos entregables y los pasos para entregar el portal a la SDH. El resto de este archivo conserva el corte del 31 de octubre.

**Fecha de corte: 31 de octubre de 2026.** Fuente de verdad operativa para continuar desde otra computadora. Describe el árbol de trabajo local, incluidos cambios aún sin commit; no certifica el sitio publicado ni la hoja en vivo.

## 1. Identificación y descripción

Repositorio: `plataforma-sdh-ug`, remoto configurado [LuisUGTO/plataforma-sdh-ug](https://github.com/LuisUGTO/plataforma-sdh-ug). Proyecto de la Secretaría de Derechos Humanos y la Universidad de Guanajuato para consultar información sociodemográfica de pueblos y comunidades indígenas y afromexicanas de Guanajuato y producir infografías.

El producto localizado es un **generador web estático de fichas individuales**, con una vista global adicional en propuesta. El universo es la población de las 107 localidades del catálogo en 13 municipios; no equivale exclusivamente a población indígena ni a toda la población indígena estatal.

## 2. Objetivos institucionales y operativos

- Facilitar consulta, revisión y comunicación institucional de información censal y territorial trazable.
- Conservar las fuentes, universos, criterios recibidos y diferencias originales sin imputar datos.
- Generar fichas PDF A2 horizontales consistentes con el diseño institucional.
- Continuar el desarrollo sin depender de conversaciones o rutas de una computadora particular.

El tablero directivo y la matriz maestra forman parte del alcance institucional histórico. No se encontró una aplicación independiente de tablero ni un editor de matriz implementado aquí. La hoja externa `Base 107` es una fuente de consulta, no una base administrada por este sitio.

## 3. Alcance funcional

La aplicación contiene búsqueda y selector, consulta de `Base 107`, respaldo local, importación de base CSV, complementos JSON, cartografía GeoJSON e introducciones CSV; exportación individual PDF; y propuesta global. Las importaciones trabajan en memoria de la sesión: no guardan cambios en Google Sheets ni en los archivos del repositorio.

Cada ficha presenta Introducción, Territorio, Composición por edad y sexo, Fecundidad, Situación conyugal, Vivienda/servicios/bienes/TIC, Etnicidad, Desarrollo social, Religión, Migración, Discapacidad/limitación/condición mental, Salud, Economía, Educación y referencias.

## 4. Arquitectura y tecnologías

HTML, CSS y JavaScript nativo, JSON y GeoJSON. Sin framework, npm, `package.json`, compilación, servidor de aplicación o SQL local identificados. Los módulos exponen objetos `window.SDH_*`; varios también permiten lectura mediante CommonJS para comprobaciones con Node.

Flujo: respaldo embebido → carga inmediata del catálogo → intento de actualización por Google Sheets → normalización y unión de insumos → `SDH_INDICADORES.build` → vista HTML/SVG → `SDH_PDF.download`. Si falla la actualización se conserva la base cargada; si no hay ninguna, se intenta el JSON local. Los mapas estáticos se eligen primero por clave; GeoJSON/INEGI sirven de contingencia.

El PDF se construye con un exportador vectorial propio, una página de 594 × 420 mm; incorpora tipografías y utiliza imágenes de mapa/logotipo. No depende de una impresora PDF ni de instalar las fuentes en Windows.

## 5. Estructura y responsabilidades

| Archivo o carpeta | Responsabilidad actual |
|---|---|
| `index.html` | Interfaz y cinco respaldos `SDH_RESPALDO`, `SDH_EDADES_RESPALDO`, `SDH_REUNION`, `SDH_GEOMETRY`, `SDH_HISTORIAS`; orden de carga de scripts |
| `app.js` | Consulta, normalización, importaciones, selección, renderizado, mapas y descarga |
| `indicadores.js` | Cálculos, denominadores, medianas, estados y excepciones |
| `pdf-export.js` | Composición PDF A2, encabezado compartido, gráficos, notas y referencias |
| `resumen-global.js` | Agregación validada de 107 registros; pirámide de 106 |
| `mapas.js` | Catálogo explícito de 107 rutas y mapa `GLOBAL` |
| `historias.js`, `historias.json` | Validación/importación y 107 introducciones con procedencia |
| `iconografia.js`, `assets/iconos/` | Trazos PDF, PNG y SVG; atribuciones |
| `tipografia.js`, `assets/fuentes/` | Fuentes/métricas PDF y fuentes web; licencias y LEEME |
| `styles.css` | Vista web, A2, encabezado y gráficos |
| `datos-respaldo.json` | 107 filas; fecha de consulta declarada `2026-10-06` |
| `insumos-reunion.json` | 107 entradas ITER por clave compuesta; fuentes especiales |
| `edades-respaldo.json` | 113 entradas auxiliares; 107 coinciden con las claves compuestas actuales y seis conservan nombres anteriores |
| `complementos.json` | Objeto `comunidades` vacío, pero sigue leyéndose al iniciar |
| `guanajuato-municipios.geojson` | Cartografía de 46 municipios |
| `assets/New_mapas/` | Mapas activos: 101 + 6 individuales y un mapa global |
| `assets/Mapas/`, mapas piloto | Antecedentes conservados; no son la selección activa de `mapas.js` |
| `assets/Introducciones_finales.xlsx` | Fuente conservada de las introducciones |
| `assets/grupos_edad_4.csv` | Insumo original de San Agustín |
| Otros `assets/` | Logos, manual institucional, referencia de encabezado y perfil de comunidades |
| `helvetica-neue-lt-std-font/` | Originales tipográficos y licencia recibida |
| `sincronizar-respaldo.py` | Reescribe los cinco respaldos HTML desde JSON revisados; biblioteca estándar Python |
| `preparar-tipografias.py` | Regenera `tipografia.js`; requiere Python y `fontTools` |
| `Infografias/` | 107 PDF individuales del lote local |
| `Infografias.zip`, `Infografias_finales_107_2026-10-29.zip` | Dos paquetes con los mismos 107 PDF; no aptos para Git ordinario por tamaño |
| `Documentacion/indicadores_infografias.docx` | Guía editable presente; 87 ecuaciones nativas identificadas en su XML |
| `output/pdf/` | Pruebas/variantes anteriores y propuesta global; no confundir con lote oficial individual |

Documentación complementaria: `CONTEXTO_PROYECTO_SDH.md` es el antecedente técnico del 16 de octubre; `CONTEXTO_CONTINUACION_SDH.md` conserva la cronología y decisiones; `METODOLOGIA_RESUMEN_GLOBAL.md` detalla la propuesta global. La auditoría y sus límites están en `Documentacion/AUDITORIA_CONTEXTO_2026-10-31.md`. No se encontró README ni AGENTS previo; se incorpora `AGENTS.md`.

## 6. Modelo de datos, tablas y relaciones

No hay tablas SQL, ORM ni migraciones. Las colecciones equivalentes son:

| Colección | Llave y contenido |
|---|---|
| `datos-respaldo.records[]` / `Base 107` | `Clave INEGI`, nueve dígitos como texto, prefijo `11`; identidad, municipio, pueblo, reconocimiento, agregados y fuentes |
| `insumos-reunion.iter` | `clave|Comunidad / Localidad`; conteos ITER y promedios recibidos |
| `edades-respaldo.comunidades` | Misma clave compuesta; `edades[]`, procedencia, criterios, notas y flags |
| `historias.comunidades` | Clave INEGI; introducción y metadatos de procedencia |
| `SDH_MAPAS.files` | Clave INEGI → ruta relativa PNG |
| GeoJSON `features[]` | Código municipal; los primeros cinco dígitos de localidad identifican municipio |
| `GLOBAL` | Identificador de vista derivada en memoria; nunca insertar como localidad INEGI |

La normalización de encabezados quita acentos y puntuación. La unión ITER/edades requiere también el nombre exacto: las seis entradas heredadas de edades no significan seis localidades adicionales. No borrar ni renombrar sin evaluar compatibilidad.

Reglas principales: población por sexo sobre `POBTOT`; lengua indígena sobre `P_3YMAS`; condición de habla española sobre `P3YM_HLI`; servicios/bienes/TIC sobre `VIVPARH_CV`; conyugal y PEA/PNEA sobre `P_12YMAS`; ocupación sobre `PEA`; instituciones sobre `PDER_SS`; actividades con dificultad sobre `PCON_DISC`; analfabetismo sobre `P_15YMAS`; posbásica sobre `P_18YMAS`. No intercambiar `TVIVPARHAB`, `VIVPARH_CV` y `VIVPAR_HAB`. Mantener categorías superpuestas y bases de edad diferentes.

No convertir reservado/faltante a cero. Las tasas requieren denominador positivo y numerador compatible; el formato normalmente usa un decimal en porcentajes y dos en promedios. La mediana quinquenal es una estimación interpolada solo con distribución completa y consistente; `ageEstimated` registra la diferencia respecto de un valor informado. Debe revisarse si la distinción resulta suficientemente visible para el lector.

## 7. Flujos de trabajo y diseño vigente

1. Servir la raíz por HTTP y abrir `index.html`; se ofrece el respaldo y se consulta la hoja.
2. Buscar/seleccionar una localidad; comprobar fuente y avisos antes de exportar.
3. Importar insumos para revisión de sesión si corresponde; persistir cambios exige editar conscientemente los archivos fuente y sincronizar HTML después.
4. Descargar PDF desde el botón propio y revisar texto, mapa, notas, una página A2 y referencias.
5. La opción global solo aparece si la agregación valida el catálogo; una excepción la oculta sin mostrar el motivo al usuario.

Se conserva el encabezado elegido el 28 de octubre: título de tres líneas en Vollkorn ExtraBold, azul intenso/claro, franja del nombre y logo horizontal. Helvetica Neue LT Std se usa en el cuerpo. Fondo blanco en referencias. Solo **“Nota:”** va en negrita. El apartado se titula “Discapacidad, limitación y condición mental”. No retomar las alternativas A/B, el degradado ni los mapas piloto como configuración vigente.

## 8. Autenticación, permisos y seguridad

No se encontró login, roles de aplicación, OAuth ni escritura remota. La consulta Sheets usa `gviz/tq` con ID y pestaña configurados en `app.js`; la disponibilidad depende de permisos externos. El ID no sustituye una credencial y no se duplica aquí. No se identificaron variables de entorno necesarias ni `.env`/tokens de aplicación en la estructura revisada.

El contenido servido por un sitio estático llega al navegador: ocultar controles no protege datos. Mantener solo información autorizada para ese destino; no añadir datos personales, credenciales o fuentes privadas a JSON/HTML. La interfaz escapa textos y valida varias importaciones, pero esto no constituye una auditoría de seguridad completa. No hay evidencia de controles de servidor, copias automáticas ni política de acceso del hosting.

Priorizar integridad de fuentes y trazabilidad; solicitar confirmación antes de migraciones destructivas o cambios irreversibles. No enviar mensajes, publicar, hacer commit/push o alterar fuentes compartidas sin instrucción expresa.

## 9. Integraciones y dependencias externas

- Google Sheets, pestaña `Base 107`: lectura en línea; no comprobada en esta auditoría.
- Servicios geográficos INEGI: respaldo para cartografía/localización cuando no hay mapa estático. No comprobados en vivo.
- Fuentes estadísticas: ITER/Censo 2020, CONAPO y CONEVAL, según campos y referencias; el corte de documentación 2026 no actualiza el año censal.
- Hosting estático compatible con rutas relativas; GitHub Pages es el destino histórico previsto. Publicación y configuración actuales no verificadas; no hay workflow de despliegue versionado localizado.
- Navegador moderno con `fetch`, SVG, Blob, fuentes web y JavaScript actual. Python 3 opcional para servir/reconstruir; `fontTools` solo para regenerar tipografía. Node opcional para revisión técnica; no necesario al usuario final.
- Licencias: conservar `assets/fuentes/Vollkorn-OFL.txt`, `helvetica-neue-lt-std-font/Befonts-License.txt` y `assets/iconos/atribuciones.md`. Los archivos recibidos no sustituyen comprobar derechos de redistribución si cambia el destino de publicación.

## 10. ESTADO DEL PROYECTO AL 31 DE OCTUBRE DE 2026

**Confirmado en código e insumos locales:** generador, 107 mapas individuales + global, 107 introducciones, exportador y criterios especiales. Los cinco respaldos embebidos coinciden estructuralmente con sus archivos. Los modelos dan 58 distribuciones de habla española calculables y 49 casos sin hablantes, ninguna pendiente. Solo la edad mediana de San Juan del Llanito está no disponible. Se confirmó la sintaxis de los ocho archivos JavaScript.

**Entregables presentes:** 107 PDF con claves únicas en `Infografias/`; ambos ZIP contienen exactamente esos 107 PDF con bytes coincidentes. El Word existe como `Documentacion/indicadores_infografias.docx`, no con el nombre largo mencionado en la cronología. Su XML contiene 87 ecuaciones. Las 26 páginas y la inspección visual histórica son antecedentes reportados, no una nueva validación visual.

**Propuesta implementada, aprobación pendiente:** resumen global de 91,683 habitantes (43,704 hombres y 47,979 mujeres), 107 localidades/13 municipios. Solo su pirámide usa 106 localidades, universo de 89,547 y conteos que suman 89,544. Introducción general y aprobación institucional pendientes.

**Planificado/no localizado como producto:** tablero independiente, editor de matriz y documento conjunto con índice interno. Conservar la indicación registrada de no reunir todavía los PDF.

**Prioridad inmediata:** conservar y transferir los cambios locales, decidir almacenamiento de los ZIP grandes, respaldar evidencia externa y comprobar ejecución desde el clon de Lenovo. La preparación documental no equivale a haber terminado la transferencia.

## 11. Funcionalidades terminadas en el árbol local

Búsqueda/selector; respaldo y consulta; importadores y plantilla de introducciones; cálculo de indicadores y estados especiales; introducciones finales; mapas nuevos; encabezado institucional y tipografía; descarga individual A2. El lote de 107 archivos está presente. “Terminada” describe implementación/archivo disponible, no aprobación de toda fuente, despliegue o nueva prueba exhaustiva de navegador.

## 12. Problemas conocidos, pendientes y riesgos

- **Trabajo sin transferir:** al iniciar, `main` estaba en `c66c1b9` con ocho archivos modificados: `CONTEXTO_CONTINUACION_SDH.md`, `METODOLOGIA_RESUMEN_GLOBAL.md`, `app.js`, `edades-respaldo.json`, `index.html`, `indicadores.js`, `pdf-export.js`, `styles.css`. Además, Word, 107 PDF y dos ZIP sin seguimiento. Un clon del commit por sí solo pierde estas actualizaciones.
- **ZIP:** 205,239,217 y 205,229,570 bytes (aprox. 195.7 MiB cada uno). Superan los 100 MiB admitidos por GitHub en Git ordinario. Resolver con LFS o respaldo/distribución aparte antes de seleccionarlos para commit. No se cambió `.gitignore`, atributos ni historial. [Límite oficial de GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).
- **San Agustín:** mediana 31 por criterio recibido, no calculada. Pirámide 0–14, 15–17, 18–59 y 60+; los totales declarados 1,242/270 difieren de las sumas por sexo 1,243/269. Conservar sin redistribuir y aclarar con la fuente. Los promedios recibidos tampoco se reconstruyen automáticamente con los conteos agregados. Siete personas en religión y notas económicas conservadas; no afirmar que son las mismas personas.
- **San Juan del Llanito:** 3,167 en desglose frente a 3,170 total; diferencia de un hombre y dos mujeres. Mantener mediana no disponible y nota.
- **Ceros reales:** cuatro localidades sin población con discapacidad muestran mensaje específico; El Piñonal sin población de 12–14 muestra “No aplica”, nunca 0/0 como tasa.
- **Residuos de lengua:** Misión de Chichimecas 4, Fracción del Cano 3 y Cieneguilla (`110400010`) 1; se muestran sin especificar, sin asignar a una condición.
- **Global:** residuos de religión 53, lengua 8, actividad 285 y ocupación 7; no imputar. Nunca promediar medianas/porcentajes/grados para construir el agregado.
- **Mezcla temporal:** una actualización de `Base 107` puede combinarse con ITER, edades e introducciones congelados. Verificar claves/nombres y procedencia antes de asumir que una actualización en línea actualiza todo.
- No hay suite/CI ni versiones de herramientas fijadas. La validación visual previa se relata en la cronología; los manifiestos e imágenes originales están fuera de Git. Falta recuperar esa evidencia y hacer prueba de aceptación en Lenovo.

## 13. Decisiones técnicas relevantes

Mantener sitio estático sin añadir infraestructura innecesaria; PDF vectorial propio; unión por clave estable y nombre exacto para auxiliares; fuentes originales preservadas; criterios de fuente separados de estimaciones; mapas nuevos activos por clave; `GLOBAL` derivado sin modificar catálogo; San Agustín excluido solo de la pirámide global; versiones de caché en HTML cuando cambian activos; respaldos JSON/HTML sincronizados.

La cronología conserva autorizaciones históricas para generar el lote, pero no concede autorización permanente para publicar o regenerarlo. Los apartados fechados posteriores corrigen los anteriores; este archivo resuelve las contradicciones vigentes.

## 14. Próximas actividades recomendadas

1. Revisar el diff completo y respaldar todo el árbol antes de migrar. Elegir qué se versiona y cómo transferir ZIP/evidencias; commit/push los realiza el usuario o se autorizan en otra instrucción.
2. Clonar en Lenovo y comparar commit, archivos, conteos y huellas de los entregables.
3. Ejecutar el generador, comprobar fuente activa, exportar casos representativos y revisar su PDF.
4. Aclarar diferencias originales de San Agustín y procedencia de promedios sin corregirlos por inferencia.
5. Completar introducción/revisión global; construir consolidado e índice solo cuando se solicite.
6. Considerar controles reproducibles de claves, uniones, respaldos y cobertura; hacer visible por qué se oculta la global y revisar comunicación de medianas estimadas. Localizar entregables externos del tablero/matriz antes de ampliarlos.

## 15. Continuación en Lenovo ThinkPad

### Antes de dejar ASUS

Conservar copia íntegra del trabajo local y respaldo aparte de evidencias externas. Revisar `git status --short` y `git diff --stat`. Los ZIP no están versionados y no deben añadirse mediante una selección indiscriminada. Una vez revisados y autorizados los archivos, usar GitHub Desktop para commit y push; esta auditoría no los ejecuta. Confirmar que los cambios aparecen en GitHub antes de depender del clon.

### Instalar y clonar

Preparar GitHub Desktop con acceso al repositorio, un navegador y Python 3 si se usa el servidor de ejemplo. Para comandos Git, disponer de Git en la terminal. No se requiere npm ni instalar base de datos. No se registró una versión mínima probada de Python/Node en este repositorio.

Clonar con GitHub Desktop en `C:\Proyectos\plataforma-sdh-ug`. Después:

```powershell
Set-Location C:\Proyectos\plataforma-sdh-ug
git status --short
git log -1 --oneline
python --version
python -m http.server 8000 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8000/`. Si `python` es un alias de Microsoft Store, instalar/configurar Python o usar `py -m http.server 8000 --bind 127.0.0.1` si el lanzador está disponible. Detener con Ctrl+C. No abrir con `file://`. El servidor expone los archivos de la raíz al equipo local; no es un despliegue productivo.

Los scripts Python resuelven su raíz desde `__file__`; fuentes, módulos y mapas usan rutas relativas. No se encontraron rutas absolutas operativas al equipo viejo en esos scripts. No hay variables de entorno de aplicación que copiar. Credenciales de GitHub y acceso a Codex se configuran en la nueva máquina; no copiar sesiones/tokens al repositorio.

### Codex y contexto

Abrir o vincular la carpeta clonada como proyecto local en Codex y conceder el acceso requerido. La documentación oficial explica el uso de carpetas asociadas a proyectos; consultar [Projects and chats](https://learn.chatgpt.com/docs/projects). La continuidad de este repositorio se apoya en sus archivos, sin dar por garantizada la transferencia de chats o configuraciones locales.

Instrucción sugerida para el primer chat: «Lee AGENTS.md, CONTEXTO_PROYECTO.md y la auditoría del 31 de octubre. Revisa git status y el último commit, conserva cambios existentes y verifica ejecución local antes de modificar funcionalidad».

### Rutas históricas y archivos externos

La ruta histórica `D:\Proyectos\plataforma-sdh-ug` queda sustituida en las instrucciones operativas por `C:\Proyectos\plataforma-sdh-ug`; no se cambia configuración funcional. La cronología conserva rutas de Downloads y de `.codex/visualizations/.../01a15c12-eeeb-7772-9f21-2e5c807da58a/` con audios, PDFs de referencia, manifiestos e imágenes de revisión. No forman parte del clon. Respaldarlas por separado si se necesitan como evidencia; no copiar todo `.codex` ni credenciales. La carpeta histórica `outputs/SDH_Entrega_2026-10-14/` y el archivo `Matriz_SDH_UG.xlsx` no están en este árbol.

### Criterio de aceptación de la transferencia

Comprobar los 107 mapas y textos, fuente/fecha de la base y exportación de Alonso Yáñez, San Agustín, San Juan del Llanito, El Piñonal y un caso sin discapacidad/sin hablantes. Revisar una página A2, notas y tipografías. Verificar respaldo cuando falle la consulta y que la global siga marcada como propuesta. Comparar SHA-256 de entregables transferidos. Solo entonces declarar probada la instalación en Lenovo.

## Límites de información recuperada

Se consultaron archivos, historial Git local (50 commits), diff y antecedentes escritos. No se recuperó el historial completo de conversaciones anteriores ni se volvió a escuchar el audio, ni se verificaron los archivos originales externos, permisos de Sheets, hosting publicado o estado remoto mediante fetch. Las instrucciones y validaciones históricas se atribuyen a los documentos que las registran; no se presentan como pruebas repetidas el 31 de octubre.
