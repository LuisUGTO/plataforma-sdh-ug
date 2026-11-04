# Auditoría de contexto y preparación de transferencia

Fecha de corte: **31 de octubre de 2026**. Inspección local de solo lectura de código/insumos; modificaciones limitadas a Markdown. No se ejecutaron migraciones, scripts de regeneración, commits, pushes o cambios de servicios externos.

## Base inspeccionada

- Raíz `C:\Proyectos\plataforma-sdh-ug`; inventario recursivo inicial: 467 archivos fuera de `.git`, cinco Markdown y dos TXT de licencias. Se revisaron módulos, utilidades Python, estructura de activos, respaldos, documentación e historial/diff.
- No se localizó `AGENTS.md` previo en raíz/ancestros inspeccionados ni en el árbol; tampoco README, `package.json`, `.github` versionado, `.gitignore` o `.gitattributes` versionados.
- Rama `main`, HEAD `c66c1b9` del 29 de octubre, 50 commits alcanzables. `origin/main` local apuntaba al mismo commit; no se hizo fetch y no se infiere sincronización actual del servidor.
- Ocho modificaciones previas: `CONTEXTO_CONTINUACION_SDH.md`, `METODOLOGIA_RESUMEN_GLOBAL.md`, `app.js`, `edades-respaldo.json`, `index.html`, `indicadores.js`, `pdf-export.js`, `styles.css`. El diff previo resumía 791 inserciones/16 eliminaciones. Word, carpeta de 107 PDF y dos ZIP estaban sin seguimiento. Se preservaron.
- Hitos Git: `d95820f` mapas; `ed268e7` introducciones; commits `e9dfdc5`/`8531b3d` criterios/encabezados de octubre 26; `f34b848` encabezado elegido; `58c492d` mapas nuevos/global; `c66c1b9` pirámide global 106. Los títulos genéricos no bastan como especificación: se contrastaron archivos.

## Contraste documental

| Afirmación anterior | Resultado al corte |
|---|---|
| No hay Git; trabajar en `outputs/.../generador_B` | Hay repositorio en raíz; esa entrega no está en el árbol |
| Ruta operativa `D:\Proyectos\...` | Raíz actual y destino esperado `C:\Proyectos\plataforma-sdh-ug` |
| Encabezado B por definir, Arial y posible degradado | Encabezado elegido el 28, fuentes institucionales y pie blanco |
| Alonso conserva mapa piloto | `mapas.js` selecciona mapa nuevo, igual que las otras localidades |
| San Agustín sin edad/pirámide | Criterio 31 y cuatro grupos integrados; diferencias originales siguen sin aclarar |
| 55 distribuciones calculables y 48 pendientes | Modelo actual: 58 `ready`, 49 `empty`, 0 `pending`; cifras anteriores eran reporte histórico |
| Historias/mapas nuevos pendientes | 107 introducciones y 107 mapas nuevos localizados |
| `complementos.json` de uso incierto | Se lee al iniciar y actualmente está vacío |
| Guía en `Documentacion/Guia_metodologica_indicadores_infografias_SDH_2026-10-29.docx` | Ese nombre no existe; archivo presente `Documentacion/indicadores_infografias.docx` |
| Carpeta larga de lote | Actual `Infografias/`; ambos ZIP permanecen |
| Validaciones de navegador/render ya realizadas | Registradas históricamente; no se repitieron ni se recuperaron sus evidencias externas |

Se conservan los antecedentes y se agregan avisos de vigencia; el contexto principal nuevo evita tratar afirmaciones antiguas como instrucciones actuales.

## Comprobaciones reproducidas

Mediante Node, lectura JSON, módulos CommonJS y análisis de sintaxis; mediante ZIP/.NET, lectura de archivos y SHA-256 sin extraer ni modificar originales:

- 107 registros base y 107 entradas ITER; fecha declarada del respaldo base `2026-10-06`.
- 107 introducciones; 113 entradas de edades, de las que 107 corresponden a claves compuestas actuales. Seis entradas heredadas: `110030136|El Lindero`, `110030252|El Salto`, `110400010|Cieneguilla`, `110400040|El Salto`, `110400051|Xoconoxtle`, `110450006|Aurora`. No son localidades adicionales.
- Los cinco JSON/GeoJSON coinciden estructuralmente con su copia embebida en HTML.
- 107 rutas individuales de mapas y ruta global existentes.
- Modelos individuales: habla española `ready=58`, `empty=49`; mediana ausente solo `110040071`; cuatro casos `disabilityEmpty`; residuos de lengua 4/3/1 en las claves documentadas en el contexto vigente.
- Modelo global ejecutado con respaldo local: 91,683 habitantes, 43,704 hombres y 47,979 mujeres; 107 localidades/13 municipios; pirámide de 106, universo 89,547, diferencia original 3; residuos 53/8 y diferencias económicas 285/7.
- Sintaxis de los ocho `.js` válida con `vm.Script` (no equivale a ejecutar DOM o exportar desde navegador).
- `Infografias/`: 107 PDF. ZIP largo: 107 entradas/107 PDF; `Infografias.zip`: 108 entradas/107 PDF. Los 107 PDF de cada ZIP coinciden por SHA-256 con la carpeta. No se afirma que ambos contenedores ZIP sean idénticos.
- ZIP largo 205,239,217 bytes; ZIP corto 205,229,570 bytes. Son los únicos archivos fuera de `.git` de más de 100 MiB encontrados.
- Word presente: ZIP interno legible y 87 elementos `m:oMath` en `word/document.xml`. No se confirmó en esta sesión la paginación de 26 páginas ni equivalencia completa con la guía histórica.

## Preparación de transferencia

Documentación suficiente para orientarse sin chats locales. **Transferencia todavía pendiente:** los cambios no confirmados no llegan mediante clon; los ZIP requieren LFS o canal aparte; las evidencias de `.codex/visualizations` y Downloads no están versionadas. No se modificó configuración Git para decidir por el usuario. GitHub bloquea archivos mayores de 100 MiB en Git ordinario: [documentación oficial](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

Las rutas operativas del código/activos son relativas; las absolutas detectadas en la documentación corresponden a antecedentes/evidencias. No hay variables de entorno de aplicación identificadas. Python es opcional y `fontTools` solo se necesita para reconstruir tipografía. Las instrucciones de arranque y aceptación están en `../CONTEXTO_PROYECTO.md`.

## No verificado y evidencia no recuperada

Sin prueba nueva de navegador, PDF renderizado, consulta en vivo de Sheets/INEGI, permisos de hoja, despliegue Pages ni instalación Lenovo. No se consultó el historial completo de chats anteriores; se recuperaron decisiones mediante los dos contextos escritos y Git. No se recuperaron audio, matriz completa ni manifiestos externos. La hoja y los recursos citados como fuentes estadísticas no se reauditaron contra originales.

No se interpreta “DB productiva” en la cronología como evidencia de una base SQL: el código localizado solo consulta la hoja y sirve archivos estáticos.
