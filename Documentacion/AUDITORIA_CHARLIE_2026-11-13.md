# Auditoría del Panorama Sociodemográfico al 13 de noviembre de 2026

**Dictamen.** La entrega requiere una página independiente con el nombre oficial del proyecto entre la portada y el mensaje introductorio. Para entregar el código a la Secretaría de Derechos Humanos también debe prepararse una publicación exclusiva del portal. La raíz del sitio actual abre el generador.

Se revisaron los cuatro Word de `Documentacion/Charlie/`, incluidas las dos capturas incrustadas en el control de cambios. No se hallaron comentarios ni revisiones controladas. Se contrastaron con el código, los PDF locales y el despliegue público. El ejemplo de INEGI se tomó como referencia editorial. [Panorama de Ciudad de México](https://www.inegi.org.mx/contenidos/productos/prod_serv/contenidos/espanol/bvinegi/productos/nueva_estruc/889463931232.pdf)

| Solicitud | Resultado |
|---|---|
| Usar `VIVPARH_CV` en los porcentajes de piso, servicios, bienes y TIC | Cumple en `indicadores.js`. El modelo usa los conteos de cada atributo, incluido cada material de piso, con ese denominador. En el respaldo de Banda, por ejemplo, hay 118 viviendas particulares habitadas y 117 con características. |
| Mostrar inasistencia de 3–5, 6–11 y 12–14, y asistencia de 15–17 y 18–24 | Cumple. Las 107 fichas contienen ambas gráficas. En Alonso Yáñez coinciden con los conteos ITER: 37.5 %, 17.2 %, 33.3 %, 32.3 % y 5.3 %. En la muestra visual, la inasistencia aparece en naranja y la asistencia en turquesa. |
| Leyenda del Padrón al 2026 | Cumple en el padrón y el mapa grande. Se verificó en ambos PDF el texto pequeño en blanco bajo el título, en Helvetica Neue LT Std Roman de 11.5 pt. |
| Integrar los tres Word con formato | Integrados. Los seis párrafos del mensaje y los 103 renglones de encabezados e indicadores de la lista se localizaron en el PDF. El texto de la guía aparece al final, incluida la nota de los 18 grupos quinquenales. La comparación de texto no certifica la maquetación de cada fórmula. |
| Portada, página de título, mensaje, índice, lista, mapa y fichas, con guía al final | Parcial. La revista de 132 páginas pasa de portada (1) a mensaje (2). Índice (3), padrón adicional (4), lista (5), mapa (6), apertura de fichas (7), 13 separadores municipales, 107 fichas y guía (128–132) están presentes. Confirmar si el padrón adicional se conserva entre índice y lista al cerrar la edición. |
| 107 fichas agrupadas por municipio | Cumple en estructura. Las 107 claves son únicas y el contenido textual de las fichas de la revista coincide con los 107 PDF A2 individuales al excluir pie, numeración y enlace de retorno. La revista contiene 378 enlaces internos. No se repitió la inspección visual de sus 132 páginas. |

San Juan del Llanito muestra mediana de **26.5 años** y usa 3,167 de 3,170 habitantes en la pirámide. La nota y la procedencia constan en `edades-respaldo.json`. La guía describe grupos quinquenales. Conviene explicitar en ella la excepción de San Agustín, cuya ficha utiliza cuatro grupos amplios y mediana de 31 años conforme al criterio previo registrado. El padrón al 2026 describe la cobertura institucional. Las fichas usan principalmente ITER 2020. Conviene precisar esa diferencia junto a la mención de la Encuesta Intercensal 2025 en el mensaje.

## Portal y entrega de código

El portal público devolvió HTTP 200. Se probaron en Chrome 107 tarjetas, el filtro Comonfort (14), la búsqueda y la apertura de San Agustín con enlace PDF válido. Los enlaces públicos del mapa global y de la revista también devolvieron HTTP 200. Los 107 registros del portal tienen coordenadas numéricas y rutas locales válidas para sus fichas. Sus cifras de población, vivienda y hablantes coinciden con los campos correspondientes del respaldo ITER local. [Portal público](https://luisugto.github.io/plataforma-sdh-ug/portal/)

Se corrigió el título de la pestaña en `portal/index.html` con el nombre oficial completo y se verificó en Chrome con los archivos locales. El título público anterior seguirá visible hasta desplegar el cambio. La URL raíz del repositorio público continúa sirviendo el generador. [Raíz pública](https://luisugto.github.io/plataforma-sdh-ug/)

**Corrección móvil implementada.** Se reorganizó el encabezado y se eliminó la altura porcentual que interfería con la lista en pantallas estrechas. En Edge, con viewport móvil y táctil de 390 × 844, el documento ocupó exactamente 390 px, sin desplazamiento horizontal; la búsqueda de Alonso abrió la ficha de Alonso Yáñez. La prueba confirmó que continúan disponibles las capas Institucional, Calles, Satélite y Relieve. Conviene repetir el recorrido en un teléfono físico y comprobar la carga efectiva de las teselas con la red institucional antes de entregar.

La conversación del 13 de noviembre confirma expresamente la autorización de Charlie para incorporar la edad mediana de **26.5 años** de San Juan del Llanito en lugar de “Dato no disponible”. El audio adjunto no pudo transcribirse localmente porque la política de Control de aplicaciones de Windows bloqueó la biblioteca de reconocimiento; no se envió el archivo a servicios externos y su contenido no se atribuye como verificado en esta auditoría.

Para entregar el portal a la SDH, preparar un ZIP o repositorio de distribución independiente con:

- `portal/index.html`, `portal/styles.css`, `portal/app.js`, `portal/datos-comunidades.js`, `portal/municipios.js` y `portal/estados-vecinos.js`.
- Los activos que el portal referencia en `assets/` (logos, iconos, tipografías y sus atribuciones). Confirmar el permiso institucional para redistribuir Helvetica Neue LT Std.
- Los 107 PDF individuales, el mapa global y la revista aprobada en `Infografias_nuevas_2026-11-13/`. Si se publica también el padrón individual, incluir su PDF. Conservar la estructura relativa.
- Una entrada pública en la raíz del paquete que lleve a `portal/`, o configurar la URL institucional directamente para servir el portal y sus dependencias. Excluir el generador raíz, sus scripts, el historial Git, los borradores y documentos de trabajo.
- Instrucciones de despliegue estático por HTTPS y de actualización de datos y láminas. El portal lee su catálogo estático. Calles, Satélite y Relieve consultan teselas externas. El mapa institucional usa recursos empaquetados. Confirmar condiciones de uso y atribuciones para el dominio institucional.

La validación de aceptación debe realizarse con el paquete aislado en el hosting propuesto. Recorrer la portada, buscar y filtrar comunidades, abrir una ficha y verificar los enlaces a la revista y al mapa. La preparación de la edición definitiva y su publicación quedan pendientes.
