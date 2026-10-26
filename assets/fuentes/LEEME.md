# Tipografía institucional

El manual de identidad Gobierno de la Gente 2024-2030, páginas 26-27, identifica Vollkorn como familia principal y Helvetica Neue LT Std para la comunicación informativa.

- `Vollkorn-ExtraBold.ttf`: nombre de la comunidad y título principal. Procede del repositorio de su diseñador: https://github.com/FAlthausen/Vollkorn-Typeface. Su licencia está en `Vollkorn-OFL.txt`.
- `HelveticaNeueLTStd-Light.otf`: subtítulos del encabezado.
- `HelveticaNeueLTStd-Roman.otf`: identificación y contenido regular.
- `HelveticaNeueLTStd-Bold.otf`: títulos de sección, etiquetas y cifras destacadas.
- `HelveticaNeueLTStd-Italic.otf`: títulos de obras en las referencias.

Las cuatro fuentes Helvetica son copias sin alterar de las variantes que Luis agregó en `helvetica-neue-lt-std-font/` el 25 de octubre de 2026. La carpeta original se conserva intacta.

El navegador lee los archivos de esta carpeta. El PDF incorpora las fuentes y sus métricas mediante `tipografia.js`, sin depender de que estén instaladas en la computadora del lector.

Para regenerar `tipografia.js` con Python y fontTools disponibles, ejecutar `python preparar-tipografias.py` desde la raíz del proyecto. Al compartir el generador, incluir `tipografia.js` y esta carpeta completa.
