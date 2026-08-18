#!/usr/bin/env python3
"""DIVZERO logotype — the site's own wordmark, outlined.

Type spec read from styles.css .wordmark:
  font    Pretendard Std Variable, weight 430
  track   letter-spacing -0.024em (applied BETWEEN letters only;
          CSS also adds it after the last glyph, which a logo must not keep)
  ink     #f3f0e9 (site renders it at 93% opacity over black)
"""
import json, re, sys, os

TOOLS = os.path.dirname(os.path.abspath(__file__))
GLYPHS = os.path.join(TOOLS, 'pretendard-430-caps.json')
TEXT = 'DIVZERO'
TRACK_EM = -0.024


def sample_path(d):
    """Flatten an SVG path to points, for exact ink bounds."""
    toks = re.findall(r'([MLCQZHVAmlcqzhva])|(-?\d+\.?\d*(?:e-?\d+)?)', d)
    stream = [c if c else float(n) for c, n in toks]
    pts, i = [], 0
    cx = cy = sx = sy = 0.0
    cmd = None
    def bez3(p0, p1, p2, p3, n=24):
        out = []
        for k in range(1, n + 1):
            t = k / n; mt = 1 - t
            out.append((mt**3*p0[0] + 3*mt*mt*t*p1[0] + 3*mt*t*t*p2[0] + t**3*p3[0],
                        mt**3*p0[1] + 3*mt*mt*t*p1[1] + 3*mt*t*t*p2[1] + t**3*p3[1]))
        return out
    def bez2(p0, p1, p2, n=16):
        out = []
        for k in range(1, n + 1):
            t = k / n; mt = 1 - t
            out.append((mt*mt*p0[0] + 2*mt*t*p1[0] + t*t*p2[0],
                        mt*mt*p0[1] + 2*mt*t*p1[1] + t*t*p2[1]))
        return out
    while i < len(stream):
        t = stream[i]
        if isinstance(t, str):
            cmd = t; i += 1
            if cmd in 'Zz':
                cx, cy = sx, sy
                continue
        if cmd in 'Mm':
            x, y = stream[i], stream[i+1]; i += 2
            if cmd == 'm': x += cx; y += cy
            cx, cy = sx, sy = x, y
            pts.append((x, y)); cmd = 'L' if cmd == 'M' else 'l'
        elif cmd in 'Ll':
            x, y = stream[i], stream[i+1]; i += 2
            if cmd == 'l': x += cx; y += cy
            pts.append((x, y)); cx, cy = x, y
        elif cmd in 'Hh':
            x = stream[i]; i += 1
            if cmd == 'h': x += cx
            pts.append((x, cy)); cx = x
        elif cmd in 'Vv':
            y = stream[i]; i += 1
            if cmd == 'v': y += cy
            pts.append((cx, y)); cy = y
        elif cmd in 'Cc':
            x1, y1, x2, y2, x, y = stream[i:i+6]; i += 6
            if cmd == 'c':
                x1 += cx; y1 += cy; x2 += cx; y2 += cy; x += cx; y += cy
            pts += bez3((cx, cy), (x1, y1), (x2, y2), (x, y)); cx, cy = x, y
        elif cmd in 'Qq':
            x1, y1, x, y = stream[i:i+4]; i += 4
            if cmd == 'q':
                x1 += cx; y1 += cy; x += cx; y += cy
            pts += bez2((cx, cy), (x1, y1), (x, y)); cx, cy = x, y
        else:
            i += 1
    return pts


def build(out, color, pad_ratio=0.03):
    d = json.load(open(GLYPHS))
    upm = d['upm']
    track = TRACK_EM * upm
    # lay out glyphs on the baseline, tracking between letters only
    xs, x = [], 0.0
    for ch in TEXT:
        xs.append(x)
        x += d['glyphs'][ch]['advance'] + track
    # exact ink bounds from the outlines themselves
    minx = miny = 1e9
    maxx = maxy = -1e9
    for ch, gx in zip(TEXT, xs):
        for px, py in sample_path(d['glyphs'][ch]['path']):
            minx = min(minx, gx + px); maxx = max(maxx, gx + px)
            miny = min(miny, py);      maxy = max(maxy, py)
    w, h = maxx - minx, maxy - miny
    pad = w * pad_ratio
    paths = [f'  <path transform="translate({gx:.2f},0)" d="{d["glyphs"][ch]["path"]}"/>'
             for ch, gx in zip(TEXT, xs)]
    doc = (f'<svg xmlns="http://www.w3.org/2000/svg" '
           f'viewBox="{minx-pad:.2f} {miny-pad:.2f} {w+2*pad:.2f} {h+2*pad:.2f}">\n'
           f'<g fill="{color}">\n' + "\n".join(paths) + '\n</g>\n</svg>\n')
    open(out, 'w').write(doc)
    print(f'{os.path.basename(out):34s} ink {w:.0f}x{h:.0f}  aspect {w/h:.4f}  cap {d["capHeight"]}')
    return w / h


if __name__ == '__main__':
    OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/logo-work/kit'
    build(f'{OUT}/divzero-logotype.svg',       '#111116')
    build(f'{OUT}/divzero-logotype-dark.svg',  '#f3f0e9')
    build(f'{OUT}/divzero-logotype-white.svg', '#ffffff')
