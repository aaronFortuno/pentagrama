# Glockenspiel · VSCO 2 Community Edition

Real instrument recordings from [Versilian Studios](https://versilian-studios.com/vsco-community/), recorded by Sam Gossner and Simon Dalzell; sample cutting by Elan Hickler / Soundemote.

- Source repository: https://github.com/sgossner/VSCO-2-CE
- Pinned revision: `440300901dfe9275fd84e0b7763af1f8443ae62e`
- Source files: `Percussion/Glock/glock_medium_G5.wav`, `glock_medium_C6.wav`, `glock_medium_G6.wav`.
- License: **CC0 1.0 Universal**, preserved in `LICENSE.txt`.

Preparation mixes the stereo recordings to mono, removes leading silence while preserving the attack, normalizes their peaks, retains four seconds of the real decay and fades the final 250 ms. The intermediate 44.1 kHz, 16-bit PCM WAVs are encoded as mono MP3 at 160 kbps with LAME, yielding a total bank of about 243 kB. No synthesized tones, artificial reverb or looping are added. The player removes the encoder lead-in after decoding, keeping 2 ms before the recorded attack.

The source octave labels differ from concert pitch. `manifest.json` records each measured fundamental as a fractional MIDI pitch, so playback can compensate for the instrument's small tuning offset. The logo uses the glockenspiel's usual [two-octave transposition](https://www.vsl.co.at/academy/percussion/glockenspiel): written E4–F5 sounds E6–F7. The nearest recording is transposed by at most a few semitones, preserving its recorded attack and metallic decay.

Regeneration requires Python with NumPy, Node.js and the official `lame.all.js` bundle from [lamejs 1.2.1](https://www.npmjs.com/package/lamejs/v/1.2.1), used only for maintenance:

1. Run `python tools/vendor-glock.py`; `--source-dir PATH` reuses downloaded source files and `LICENSE`. Git blob hashes are checked before processing.
2. Run `node tools/encode-glock.mjs PATH/TO/lame.all.js`. The encoder bundle's SHA-256 is pinned in the tool. This replaces the intermediate WAVs with the MP3s and updates `manifest.json` and `bank.js`.
3. Run `node tools/version-assets.mjs` for the current release.

The npm archive's SHA-1 is `0f92d38729213f106d4a19ded20821da7e89c8e4`. Output hashes and intermediate PCM hashes remain in the manifest. The encoder is not distributed or loaded by the website; the site uses native Web Audio with local recordings, without a CDN, Python, NumPy, a soundfont or an encoder dependency.
