"""Preparar métricas y fuentes institucionales para el exportador PDF.

Usa fontTools. Conserva los archivos originales en assets/fuentes.
Ejecutar: python preparar-tipografias.py
"""
import argparse
import base64
import hashlib
import json
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent


def font_data(path):
    path = path.resolve()
    font = TTFont(path)
    units = font['head'].unitsPerEm
    scale = lambda value: round(value * 1000 / units, 3)
    cmap = font.getBestCmap()
    widths = []
    for code in range(256):
        char = bytes([code]).decode('cp1252', errors='replace')
        glyph = cmap.get(ord(char), '.notdef')
        widths.append(scale(font['hmtx'][glyph][0]))
    cff = 'CFF ' in font
    content = font.getTableData('CFF ') if cff else path.read_bytes()
    return {
        'name': font['name'].getDebugName(6),
        'kind': 'Type1C' if cff else 'TrueType',
        'widths': widths,
        'bbox': [scale(getattr(font['head'], k)) for k in ['xMin', 'yMin', 'xMax', 'yMax']],
        'ascent': scale(font['hhea'].ascent),
        'descent': scale(font['hhea'].descent),
        'capHeight': scale(getattr(font['OS/2'], 'sCapHeight', font['hhea'].ascent)),
        'italicAngle': font['post'].italicAngle,
        'data': base64.b64encode(content).decode('ascii'),
        'archivo': path.relative_to(ROOT).as_posix(),
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
    }


parser = argparse.ArgumentParser()
parser.add_argument('--apoyo', type=Path, default=Path('assets/fuentes/HelveticaNeueLTStd-Light.otf'))
parser.add_argument('--identificacion', type=Path, default=Path('assets/fuentes/HelveticaNeueLTStd-Roman.otf'))
parser.add_argument('--regular', type=Path, default=Path('assets/fuentes/HelveticaNeueLTStd-Roman.otf'))
parser.add_argument('--negrita', type=Path, default=Path('assets/fuentes/HelveticaNeueLTStd-Bold.otf'))
parser.add_argument('--cursiva', type=Path, default=Path('assets/fuentes/HelveticaNeueLTStd-Italic.otf'))
args = parser.parse_args()
fonts = {'headline': font_data(ROOT / 'assets/fuentes/Vollkorn-ExtraBold.ttf')}
if args.apoyo:
    fonts['support'] = font_data(ROOT / args.apoyo)
if args.identificacion:
    fonts['identity'] = font_data(ROOT / args.identificacion)
for role, path in [('normal', args.regular), ('bold', args.negrita), ('italic', args.cursiva)]:
    if path:
        fonts[role] = font_data(ROOT / path)
source = '(function(root){const fonts=' + json.dumps(fonts, ensure_ascii=False, separators=(',', ':'))
source += ";root.SDH_TIPOGRAFIA=fonts;if(typeof module!=='undefined')module.exports=fonts;})(typeof window!=='undefined'?window:globalThis);\n"
(ROOT / 'tipografia.js').write_text(source, encoding='utf-8')
print('Tipografías preparadas:', ', '.join(fonts))
