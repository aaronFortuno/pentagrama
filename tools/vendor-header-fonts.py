"""Reproduce local header faces; no network font service is used at runtime."""
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
SOURCES = [
    ('serif', 'notoserif', 'NotoSerif[wdth,wght].ttf', '4d8e6761424656867019081a1a01336f3cb086982682698714054fc33f782713', False, [700]),
    ('serif', 'notoserif', 'NotoSerif-Italic[wdth,wght].ttf', 'e87acbc6c0efd0d9a20d6a8cbbda2b266c14be3a3a6f5af8ec9d7b2460570ad1', True, [200, 700]),
    ('sans', 'notosans', 'NotoSans[wdth,wght].ttf', 'bfb7bb691513f12e734dc346c03a03f784912432d7e3fa8e56efcf906fe86b3d', False, [400, 700]),
    ('sans', 'notosans', 'NotoSans-Italic[wdth,wght].ttf', '58e6e0ebd1931b29a365aa2d3e2ee9a9e831a3af7cf3ad1462d4e72154f0b291', True, [400, 700]),
    ('lora', 'lora', 'Lora[wght].ttf', '822a6621ccbe8d97d20ac88c1c41f5615c9c2c202eaa75f272cd452aac6475a7', False, [400, 700]),
    ('lora', 'lora', 'Lora-Italic[wght].ttf', '22d8d8854b53807aa664ca34f2031a9ed57a1d0dea296b8b96cdd3aad937a2b3', True, [400, 700]),
]
directory = ROOT / 'docs' / 'vendor'
cache = ROOT / 'tools' / '.glyph-deps' / 'header-sources'
cache.mkdir(parents=True, exist_ok=True)
faces, programs = {}, {}
for family, source_family, filename, checksum, italic, weights in SOURCES:
    source_path = cache / (source_family + '-' + filename)
    if not source_path.exists():
        url = f'https://raw.githubusercontent.com/google/fonts/{SHA}/ofl/{source_family}/' + urllib.parse.quote(filename)
        with urllib.request.urlopen(url, timeout=30) as response:
            source_path.write_bytes(response.read())
    source = source_path.read_bytes()
    assert hashlib.sha256(source).hexdigest() == checksum, 'Unexpected source font'
    for weight in weights:
        key = family + ('-bold' if weight == 700 else '-regular') + ('-italic' if italic else '')
        font = TTFont(io.BytesIO(source), recalcTimestamp=False)
        modified = font['head'].modified
        axes = {'wght': weight}
        if any(axis.axisTag == 'wdth' for axis in font['fvar'].axes):
            axes['wdth'] = 100
        instantiateVariableFont(font, axes, inplace=True, updateFontNames=True)
        options = subset.Options()
        options.layout_features = []
        options.name_IDs = ['*']
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=[*range(32, 0x530), *range(0x1E00, 0x2070), 0x20AC, 0x2122, 0xFFFD])
        subsetter.subset(font)
        if family == 'lora':
            # The upstream license reserves its font name for unmodified fonts.
            # Retain copyright/license records; give this subset its own family.
            subfamily = ('Bold' if weight == 700 else 'Regular') + (' Italic' if italic else '')
            ps_name = 'PentagramaEditorial-' + subfamily.replace(' ', '')
            names = {1: 'Pentagrama Editorial', 2: subfamily, 3: ps_name, 4: 'Pentagrama Editorial ' + subfamily,
                     6: ps_name, 16: 'Pentagrama Editorial', 17: subfamily}
            for record in font['name'].names:
                if record.nameID in names:
                    record.string = names[record.nameID].encode(record.getEncoding())
        font['head'].modified = modified
        output = io.BytesIO()
        font.save(output)
        scale, cmap = 1000 / font['head'].unitsPerEm, font.getBestCmap()
        codes = sorted(cmap)
        faces[key] = {
            'name': font['name'].getDebugName(6), 'weight': weight,
            'italicAngle': font['post'].italicAngle,
            'ascent': math.ceil(font['hhea'].ascent * scale), 'descent': math.floor(font['hhea'].descent * scale),
            'capHeight': math.ceil(font['OS/2'].sCapHeight * scale),
            'bbox': [math.floor(font['head'].xMin * scale), math.floor(font['head'].yMin * scale), math.ceil(font['head'].xMax * scale), math.ceil(font['head'].yMax * scale)],
            'characters': codes, 'glyphs': [font.getGlyphID(cmap[code]) for code in codes],
            'widths': [round(font['hmtx'][cmap[code]][0] * scale, 4) for code in codes],
        }
        programs[key] = base64.b64encode(output.getvalue()).decode('ascii')
        font.flavor = 'woff2'
        font.save(directory / f'header-{key}.woff2')
        print(key, len(codes), len(output.getvalue()))
for family, checksum in [('notosans', 'cee9892f9f0cc8fe882c9e9537ee6a89621d86ee7ceaf70b02e2b2b1c25c061a'), ('lora', '1d9a970809ac804b582a6ce7f0ebc4e7fefcbfd7ff6299cad35ee656a21be716')]:
    license_path = cache / (family + '-OFL.txt')
    if not license_path.exists():
        with urllib.request.urlopen(f'https://raw.githubusercontent.com/google/fonts/{SHA}/ofl/{family}/OFL.txt', timeout=30) as response:
            license_path.write_bytes(response.read())
    license_data = license_path.read_bytes()
    assert hashlib.sha256(license_data).hexdigest() == checksum
    (directory / (family + '-OFL.txt')).write_bytes(license_data)
notice = '// Generated by tools/vendor-header-fonts.py. Local SIL OFL 1.1 font subsets.\n'
(directory / 'header-font-metrics.js').write_text(notice + 'export const HEADER_FONTS = Object.freeze(' + json.dumps(faces, separators=(',', ':')) + ');\n', encoding='utf-8')
(directory / 'header-font-data.js').write_text(notice + 'export const HEADER_FONT_DATA = Object.freeze(' + json.dumps(programs, separators=(',', ':')) + ');\n', encoding='utf-8')
(directory / 'header-fonts-SOURCE.md').write_text('# Header fonts\n\nNoto Serif (200/700), Noto Sans (400/700), Pentagrama Editorial (400/700, based on Lora), with genuine italic faces. SIL OFL 1.1; see noto-serif-OFL.txt, notosans-OFL.txt and lora-OFL.txt. The modified Lora subset is renamed Pentagrama Editorial in all font family/full/PostScript names, respecting the upstream Reserved Font Name. Original copyright and license records remain.\n\nPinned Google Fonts revision: ' + SHA + '.\n\nAll source TTF checksums are verified by `tools/vendor-header-fonts.py`. The original Noto Serif ExtraLight face remains unchanged. European Latin, Greek and Cyrillic coverage where supported by each family; no kerning or ligatures, so SVG and PDF use identical advances. All runtime fonts are local.\n\nRegenerate: `python tools/vendor-header-fonts.py` with requirements-glyphs.txt.\n', encoding='utf-8')
