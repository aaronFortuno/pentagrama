"""Reproduce the local Noto Serif ExtraLight text font from the pinned source.

Uses tools/.glyph-deps (requirements-glyphs.txt) only when regenerating assets.
The legacy ASCII footer font remains unchanged for old sheets and PDF parity.
"""
import base64
import hashlib
import io
import json
import math
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools' / '.glyph-deps'))
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SHA = '8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5'
CHECKSUM = '4d8e6761424656867019081a1a01336f3cb086982682698714054fc33f782713'
URL = f'https://raw.githubusercontent.com/google/fonts/{SHA}/ofl/notoserif/' + urllib.parse.quote('NotoSerif[wdth,wght].ttf')
request = urllib.request.Request(URL, headers={'User-Agent': 'Pentagrama'})
with urllib.request.urlopen(request, timeout=60) as response:
    source = response.read()
assert hashlib.sha256(source).hexdigest() == CHECKSUM, 'Unexpected source font'
font = TTFont(io.BytesIO(source), recalcTimestamp=False)
modified = font['head'].modified
instantiateVariableFont(font, {'wght': 200, 'wdth': 100}, inplace=True, updateFontNames=True)
options = subset.Options()
options.layout_features = []  # Shared unkerned advances in SVG and PDF.
options.name_IDs = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=[*range(32, 0x530), *range(0x1E00, 0x2070), 0x20AC, 0x2122, 0xFFFD])
subsetter.subset(font)
font['head'].modified = modified
ttf = io.BytesIO()
font.save(ttf)
program = ttf.getvalue()
scale = 1000 / font['head'].unitsPerEm
cmap = font.getBestCmap()
codes = sorted(cmap)
metrics = {
    'name': font['name'].getDebugName(6), 'weight': 200,
    'ascent': math.ceil(font['hhea'].ascent * scale), 'descent': math.floor(font['hhea'].descent * scale),
    'capHeight': math.ceil(font['OS/2'].sCapHeight * scale),
    'bbox': [math.floor(font['head'].xMin * scale), math.floor(font['head'].yMin * scale), math.ceil(font['head'].xMax * scale), math.ceil(font['head'].yMax * scale)],
    'characters': codes, 'glyphs': [font.getGlyphID(cmap[code]) for code in codes],
    'widths': [round(font['hmtx'][cmap[code]][0] * scale, 4) for code in codes],
}
directory = ROOT / 'docs' / 'vendor'
notice = '// Noto Serif ExtraLight European text subset; SIL OFL 1.1. See noto-serif-OFL.txt.\n'
notice += f'// Source: https://github.com/google/fonts/tree/{SHA}/ofl/notoserif\n'
(directory / 'page-font-metrics.js').write_text(notice + 'export const PAGE_FONT = Object.freeze(' + json.dumps(metrics, separators=(',', ':')) + ');\n', encoding='utf-8')
(directory / 'page-font-data.js').write_text(notice + "export const PAGE_FONT_DATA = '" + base64.b64encode(program).decode('ascii') + "';\n", encoding='utf-8')
font.flavor = 'woff2'
font.save(directory / 'noto-serif-extralight.woff2')
(directory / 'page-font-SOURCE.md').write_text(
    '# Noto Serif ExtraLight\n\n' + f'Source: https://github.com/google/fonts/tree/{SHA}/ofl/notoserif\n\n'
    + 'SIL OFL 1.1; see noto-serif-OFL.txt. Static weight 200, width 100.\n\n'
    + 'European Latin (including accents), Greek, Cyrillic, combining marks and punctuation. No layout features; SVG and PDF share the same advances. PDF uses a Unicode character map and the same TrueType outlines as the local web font.\n\n'
    + f'Original TTF SHA-256: {CHECKSUM}\n\nRegenerate: `python tools/vendor-page-font.py`.\n', encoding='utf-8')
print(json.dumps({'characters': len(codes), 'ttfBytes': len(program), 'woff2Bytes': (directory / 'noto-serif-extralight.woff2').stat().st_size}))
