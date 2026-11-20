"""Genera las páginas y los enlaces internos del lector web desde la revista PDF."""
import argparse
import json
import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image
from pypdf import PdfReader


def exportar(pdf, destino, desde=1):
    reader = PdfReader(pdf)
    indices = {page.indirect_reference.idnum: i for i, page in enumerate(reader.pages, 1)}
    paginas = []
    destino.mkdir(parents=True, exist_ok=True)
    manifiesto = destino / "paginas.json"
    if not 1 <= desde <= len(reader.pages):
        raise ValueError("La primera página a regenerar está fuera del PDF")
    if desde > 1:
        previas = json.loads(manifiesto.read_text(encoding="utf-8"))[:desde - 1]
        if len(previas) != desde - 1 or any(not (destino / p["imagen"]).is_file() for p in previas):
            raise ValueError("Faltan páginas previas. Regenera la revista completa")
    with TemporaryDirectory() as temporal:
        prefijo = Path(temporal) / "pagina"
        subprocess.run(
            ["pdftoppm", "-f", str(desde), "-scale-to", "2100", "-png", str(pdf), str(prefijo)],
            check=True,
        )
        renders = sorted(Path(temporal).glob("pagina-*.png"))
        if len(renders) != len(reader.pages) - desde + 1:
            raise ValueError("El número de páginas renderizadas no coincide con el PDF")
        for numero, page in enumerate(reader.pages, 1):
            nombre = f"pagina-{numero:03}.webp"
            if numero < desde:
                ancho, alto = previas[numero - 1]["ancho"], previas[numero - 1]["alto"]
            else:
                with Image.open(renders[numero - desde]) as imagen:
                    imagen.save(destino / nombre, quality=84)
                    ancho, alto = imagen.size
            box = page.mediabox
            enlaces = []
            for ref in page.get("/Annots", []):
                anotacion = ref.get_object()
                accion = anotacion.get("/A", {})
                salto = accion.get("/D") if accion.get("/S") == "/GoTo" else anotacion.get("/Dest")
                if not isinstance(salto, list) or not salto:
                    continue
                objetivo = indices.get(getattr(salto[0], "idnum", None))
                if objetivo is None:
                    continue
                x0, y0, x1, y1 = map(float, anotacion["/Rect"])
                w, h = float(box.width), float(box.height)
                enlaces.append([
                    round((x0 - float(box.left)) / w, 5),
                    round((float(box.top) - y1) / h, 5),
                    round((x1 - x0) / w, 5),
                    round((y1 - y0) / h, 5),
                    objetivo,
                ])
            paginas.append({"imagen": nombre, "ancho": ancho, "alto": alto, "enlaces": enlaces})
    manifiesto.write_text(json.dumps(paginas, separators=(",", ":")), encoding="utf-8")
    print(f"{len(paginas)} páginas y {sum(len(p['enlaces']) for p in paginas)} enlaces internos")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--destino", type=Path, default=Path("portal/revista/paginas"))
    parser.add_argument("--desde", type=int, default=1, help="Primera hoja a renderizar si las anteriores siguen iguales")
    args = parser.parse_args()
    exportar(args.pdf, args.destino, args.desde)
