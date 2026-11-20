import json, subprocess, logging
from pathlib import Path
from PIL import Image
logging.getLogger('pypdf').setLevel(logging.ERROR)
from pypdf import PdfReader, PdfWriter
out=Path('tmp/pdfs'); out.mkdir(parents=True,exist_ok=True)
paths=json.loads(subprocess.check_output(['node','-e',"const m=require('./mapas.js');console.log(JSON.stringify([...Object.values(m.files),m.globalPath,'assets/logo-sdh-descriptivo-horizontal.png']))"]))
manifest={}
for i,p in enumerate(paths):
 im=Image.open(p).convert('RGB'); dest=out/f'image-{i}.jpg'; im.save(dest,quality=95)
 manifest[p]={'file':str(dest),'pxWidth':im.width,'pxHeight':im.height}
(out/'images.json').write_text(json.dumps(manifest),encoding='utf-8')
subprocess.run(['node','reconstruir-revista.cjs'],check=True)
cover=PdfReader('Documentacion/Charlie/PORTADA y CONTRAPORTADA REVISIONcolorGTO (1).pdf')
interior=PdfReader(out/'interior.pdf')
w=PdfWriter(); w.add_page(cover.pages[0]); w.append(interior); w.add_page(cover.pages[-1])
dest=out/'revista-corregida.pdf'
with dest.open('wb') as f:w.write(f)
r=PdfReader(dest); texts=[p.extract_text() or '' for p in r.pages]
assert len(texts)==len(interior.pages)+2
assert sum('Clave INEGI:' in t for t in texts)==107
assert not any('undefined' in t for t in texts)
print('VALIDADO:',len(texts),'páginas; sin undefined;',dest.stat().st_size,'bytes')
print('Fichas:',sum('Clave INEGI:' in t for t in texts))
