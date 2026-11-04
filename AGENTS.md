# Instrucciones para trabajar en SDH–UG

- Leer `CONTEXTO_PROYECTO.md` antes de modificaciones importantes. Consultar `CONTEXTO_CONTINUACION_SDH.md` para decisiones históricas y `METODOLOGIA_RESUMEN_GLOBAL.md` si afecta la global. Las entradas antiguas pueden estar superadas por las posteriores.
- Comprobar raíz, rama, último commit y `git status` antes de editar. Preservar cambios locales y archivos sin seguimiento; no restaurar, limpiar ni sobrescribir trabajo ajeno.
- Respetar HTML/CSS/JavaScript nativo, módulos `SDH_*`, rutas relativas y exportador PDF propio. Evitar cambios innecesarios y mantener compatibilidad de importaciones y funcionalidades.
- Verificar dependencias y sus usos antes de modificarlas. No introducir framework, gestor de paquetes o backend sin justificar necesidad.
- Priorizar seguridad, integridad de datos y mantenibilidad. No exponer credenciales, tokens, claves API ni información sensible en documentación, código o salidas.
- Mantener claves INEGI como texto de nueve dígitos; ITER y edades se unen por `clave|nombre`. No unir por nombre solo, imputar faltantes, convertir reservados a cero ni alterar denominadores.
- Preservar fuentes originales, introducciones, mapas y criterios recibidos. Mantener excepciones de San Agustín, San Juan del Llanito, ceros reales y residuos documentados. La global es propuesta; no declararla aprobada.
- Conservar A2 horizontal de una página, encabezado elegido, fuentes institucionales, mapas activos e iconografía. Solo la etiqueta `Nota:` va en negrita. No reunir el lote en un único PDF hasta recibir instrucción.
- Si se modifican JSON revisados, mantener sincronizados los cinco respaldos de `index.html`; `sincronizar-respaldo.py` reescribe HTML y debe ejecutarse solo dentro del alcance autorizado. Si cambian scripts/estilos, revisar versiones de caché.
- Documentar cambios relevantes y distinguir implementado, parcial, planificado y no verificado. Separar comprobaciones actuales de reportes históricos.
- Hacer verificaciones proporcionales: sintaxis y cálculos/uniones afectados; para cambios visuales/PDF, navegador y casos representativos, A2, textos completos, notas, referencias y fuentes. No atribuir validaciones que no se realizaron.
- Solicitar confirmación antes de migraciones destructivas, cambios irreversibles o alteraciones de datos compartidos. No hacer commit, push, publicación, envío de mensajes o producción masiva sin instrucción expresa.
- Para migrar, revisar archivos sin commit y evidencias externas. Los dos ZIP de aproximadamente 196 MiB superan el límite de Git ordinario de GitHub; no añadirlos indiscriminadamente ni reescribir historial. No cambiar LFS/ignorados sin explicar la decisión.
