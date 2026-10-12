"""Actualizar los respaldos del HTML después de revisar los JSON locales.

Ejecutar desde la carpeta del proyecto: python sincronizar-respaldo.py
No consulta ni modifica Google Sheets.
"""
import json
import re
from pathlib import Path

base = Path(__file__).resolve().parent
target = base / "index.html"
html = target.read_text(encoding="utf-8")
sources = {
    "SDH_RESPALDO": "datos-respaldo.json",
    "SDH_EDADES_RESPALDO": "edades-respaldo.json",
    "SDH_REUNION": "insumos-reunion.json",
    "SDH_GEOMETRY": "guanajuato-municipios.geojson",
    "SDH_HISTORIAS": "historias.json",
}
for variable, filename in sources.items():
    data = json.loads((base / filename).read_text(encoding="utf-8"))
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    replacement = f"<script>window.{variable} = {payload};</script>"
    pattern = rf"<script>\s*window\.{variable}\s*=[\s\S]*?</script>"
    html, count = re.subn(pattern, lambda _: replacement, html)
    if count != 1:
        raise ValueError(f"Se esperaba exactamente un respaldo de {variable}; encontrados: {count}")
target.write_text(html, encoding="utf-8")
print("Los respaldos del HTML quedaron sincronizados con los JSON locales.")
