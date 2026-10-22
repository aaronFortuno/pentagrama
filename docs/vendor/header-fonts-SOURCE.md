# Header fonts

Noto Serif (200/700), Noto Sans (400/700), Pentagrama Editorial (400/700, based on Lora), with genuine italic faces. SIL OFL 1.1; see noto-serif-OFL.txt, notosans-OFL.txt and lora-OFL.txt. The modified Lora subset is renamed Pentagrama Editorial in all font family/full/PostScript names, respecting the upstream Reserved Font Name. Original copyright and license records remain.

Pinned Google Fonts revision: 8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5.

All source TTF checksums are verified by `tools/vendor-header-fonts.py`. The original Noto Serif ExtraLight face remains unchanged. European Latin, Greek and Cyrillic coverage where supported by each family; no kerning or ligatures, so SVG and PDF use identical advances. All runtime fonts are local.

Regenerate: `python tools/vendor-header-fonts.py` with requirements-glyphs.txt.
