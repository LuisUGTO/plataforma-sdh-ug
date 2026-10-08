# Generador de infografías SDH / UG

Versión de revisión para generar infografías de comunidades indígenas de Guanajuato en **una hoja A2 horizontal (594 × 420 mm)**. Incluye títulos con iconos, reseña antes del mapa, pirámide de edad y sexo, mapa estatal con localización y secciones gráficas con datos disponibles.

## Publicar en GitHub Pages

Sube todo el contenido del paquete a la raíz del repositorio y conserva `assets/`, `guanajuato-municipios.geojson` y los archivos de datos. El HTML integrado consulta la pestaña `Base 107` de la hoja compartida y usa una copia local si la consulta falla. No modifica Google Sheets.

Para generar el PDF, selecciona una comunidad y usa `Guardar PDF A2`. En el diálogo de impresión, conserva A2 horizontal, tamaño original, sin márgenes y con gráficos de fondo.

`app.js` y `styles.css` son fuentes de referencia; el HTML integrado incluye esas funciones y estilos para publicarse como página estática. Al cambiar el código o el diseño, refleja los cambios también en `index.html`.

Las cifras, las reseñas del equipo y las fuentes cartográficas conservan las notas de revisión que aparecen en pantalla y en el PDF. La mediana estimada se identifica como aproximación y no se presenta como cifra oficial.
