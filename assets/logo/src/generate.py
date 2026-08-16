#!/usr/bin/env python3
"""DivZero identity kit generator (self-contained).

Rebuilds every SVG in assets/logo/ from the outline data in
schibsted-600-glyphs.json. Letterforms: Schibsted Grotesk SemiBold
(SIL Open Font License 1.1). The ero-infinity knot is custom geometry:
two elliptical loops joined by internal-tangent diagonals through the
crossing, woven behind the r-stem, with the e-crossbar tucked into the
left loop. The knot's loop bottoms are baseline-aligned to the o's
overshoot line; oversize overflows upward only.

Run:  python3 generate.py   (writes SVGs into the parent directory)
"""
import json, math, re, sys

TOOLS = '/tmp/claude-0/logo-work/tools'
W, H = 1200, 400
SIZE = 200.0


def sample_path(d):
    toks = re.findall(r'([MLCQZHVAmlcqzhva])|(-?\d+\.?\d*(?:e-?\d+)?)', d)
    stream = []
    for cmd, num in toks:
        stream.append(cmd if cmd else float(num))
    pts = []
    i = 0
    cx = cy = sx = sy = 0.0
    cmd = None
    def bez3(p0, p1, p2, p3, n=16):
        return [(sum(c*w for c, w in zip((p0[0], p1[0], p2[0], p3[0]),
                ((1-t)**3, 3*(1-t)**2*t, 3*(1-t)*t*t, t**3))),
                 sum(c*w for c, w in zip((p0[1], p1[1], p2[1], p3[1]),
                ((1-t)**3, 3*(1-t)**2*t, 3*(1-t)*t*t, t**3))))
                for t in (k/n for k in range(1, n+1))]
    def bez2(p0, p1, p2, n=12):
        return [((1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0],
                 (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1])
                for t in (k/n for k in range(1, n+1))]
    while i < len(stream):
        t = stream[i]
        if isinstance(t, str):
            cmd = t
            i += 1
            if cmd in 'Zz':
                cx, cy = sx, sy
                continue
        if cmd in 'Mm':
            x, y = stream[i], stream[i+1]; i += 2
            if cmd == 'm': x += cx; y += cy
            cx, cy = sx, sy = x, y
            pts.append((x, y))
            cmd = 'L' if cmd == 'M' else 'l'
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
            pts += bez3((cx, cy), (x1, y1), (x2, y2), (x, y))
            cx, cy = x, y
        elif cmd in 'Qq':
            x1, y1, x, y = stream[i:i+4]; i += 4
            if cmd == 'q':
                x1 += cx; y1 += cy; x += cx; y += cy
            pts += bez2((cx, cy), (x1, y1), (x, y))
            cx, cy = x, y
        else:
            i += 1
    return pts



import os
_HERE = os.path.dirname(os.path.abspath(__file__))
FONT_JSON = os.path.join(_HERE, 'schibsted-600-glyphs.json')
OUT = os.path.dirname(_HERE)



# C1 recipe (tight): knot 0.97x stem, loops 1.18x, gap 0.95x
LIG_W_MULT, LOOP_MULT, GAP_MULT, RATIO = 0.97, 1.18, 0.95, 0.585
TRACK = 1.0


def stroke(dpath, w, color, cap='round'):
    return (f'  <path d="{dpath}" fill="none" stroke="{color}" stroke-width="{w:.2f}" '
            f'stroke-linecap="{cap}" stroke-linejoin="round"/>')


def load_metrics():
    d = json.load(open(FONT_JSON))
    S = 141.4 / d['capHeight']
    m = {'d': d, 'S': S, 'CAP': d['capHeight'] * S, 'XH': d['xHeight'] * S}
    m['ADV'] = {c: d['glyphs'][c]['advance'] * S for c in 'DivZero'}
    pts = {c: sample_path(d['glyphs'][c]['path']) for c in 'DiZeo'}
    m['bounds'] = {}
    for c, p in pts.items():
        xs = [q[0] for q in p]; ys = [q[1] for q in p]
        m['bounds'][c] = (min(xs) * S, min(ys) * S, max(xs) * S, max(ys) * S)
    stem = [q for q in pts['i'] if q[1] > -d['xHeight'] * 0.8]
    sxs = [q[0] for q in stem]
    m['STEM'] = (max(sxs) - min(sxs)) * S
    ob = m['bounds']['o']
    m['O_W'] = ob[2] - ob[0]
    m['O_H'] = ob[3] - ob[1]
    m['O_CY'] = (ob[1] + ob[3]) / 2
    m['Z_INKR'] = m['bounds']['Z'][2]
    m['D_LSB'] = m['bounds']['D'][0]
    return m


def knot_elems(m, color, w_scale=1.0, stem_bottom=None):
    """Returns (list of element strings in knot-local coords, half_w, top, bottom, w_arc).
    stem_bottom: local y where the r-stem foot ends (default: baseline at -O_CY)."""
    w = m['STEM'] * 0.98 * LIG_W_MULT * w_scale
    w_arc = w * 1.02
    stem_w = m['STEM'] * 0.97 * w_scale
    r = (m['O_W'] - m['STEM'] * 0.98) / 2 * LOOP_MULT
    q = ((m['O_H'] - m['STEM'] * 0.98) / 2 * LOOP_MULT) / r
    c = r / RATIO
    th = math.asin(r / c)
    phi = math.atan(math.tan(th) * q)
    weave_gap = w * 0.34
    cos_t = math.cos(th)
    Rup = (c * cos_t**2, -r * cos_t * q); Rdn = (c * cos_t**2, r * cos_t * q)
    Lup = (-c * cos_t**2, -r * cos_t * q); Ldn = (-c * cos_t**2, r * cos_t * q)
    g = []
    g.append(stroke(f'M {Rup[0]:.2f} {Rup[1]:.2f} A {r:.2f} {r*q:.2f} 0 1 1 {Rdn[0]:.2f} {Rdn[1]:.2f}', w_arc, color))
    g.append(stroke(f'M {Lup[0]:.2f} {Lup[1]:.2f} A {r:.2f} {r*q:.2f} 0 1 0 {Ldn[0]:.2f} {Ldn[1]:.2f}', w_arc, color))
    g.append(stroke(f'M {Ldn[0]:.2f} {Ldn[1]:.2f} L {Rup[0]:.2f} {Rup[1]:.2f}', w, color))
    t_cut = (stem_w / 2 + weave_gap + w / 2) / math.cos(phi)
    ux, uy = math.cos(phi), math.sin(phi)
    g.append(stroke(f'M {Lup[0]:.2f} {Lup[1]:.2f} L {-t_cut*ux:.2f} {-t_cut*uy:.2f}', w, color))
    g.append(stroke(f'M {t_cut*ux:.2f} {t_cut*uy:.2f} L {Rdn[0]:.2f} {Rdn[1]:.2f}', w, color))
    sb = stem_bottom if stem_bottom is not None else -m['O_CY']
    g.append(f'  <path fill="{color}" d="M {-stem_w/2:.2f} 0 H {stem_w/2:.2f} '
             f'V {sb:.2f} H {-stem_w/2:.2f} Z"/>')
    bar_y = -0.02 * m['XH']
    g.append(stroke(f'M {-c-r:.2f} {bar_y:.2f} L {-c+r*0.94:.2f} {bar_y:.2f}', w * 0.94, color, cap='butt'))
    half_w = c + r + w_arc / 2
    top = -(r * q + w_arc / 2)
    bottom = r * q + w_arc / 2
    return g, half_w, top, bottom, w_arc


def wordmark(out, color):
    m = load_metrics()
    xs_, x = [], 0.0
    for ch in 'DivZ':
        xs_.append(x); x += m['ADV'][ch] + TRACK
    glyphs = [(f'  <path fill="{color}" transform="translate({gx:.2f},0) '
               f'scale({m["S"]:.6f})" d="{m["d"]["glyphs"][ch]["path"]}"/>')
              for ch, gx in zip('DivZ', xs_)]
    _, half_w, ktop, kbot, w_arc = knot_elems(m, color)   # geometry pass
    gap_ze = 19.57 * GAP_MULT
    cx = xs_[3] + m['Z_INKR'] + gap_ze + TRACK + half_w
    # baseline-align: loop bottoms sit on the o's own overshoot line; the
    # oversized loops overflow upward (ascender-like), never below baseline
    o_bottom = m['bounds']['o'][3]
    cy = o_bottom - kbot
    knot, _, _, _, _ = knot_elems(m, color, stem_bottom=-cy)
    body = "\n".join(glyphs) + (f'\n  <g transform="translate({cx:.2f},{cy:.2f})">\n'
                                + "\n".join(knot) + '\n  </g>')
    # ink bbox (baseline y=0, up negative)
    x0 = m['D_LSB']
    x1 = cx + half_w
    tops = [m['bounds'][ch][1] + 0 for ch in 'DiZ'] + [cy + ktop]
    y0 = min(min(tops), -m['CAP'])
    y1 = max(o_bottom, 2.0)
    pad = (x1 - x0) * 0.03
    vb = (x0 - pad, y0 - pad, (x1 - x0) + 2 * pad, (y1 - y0) + 2 * pad)
    doc = (f'<svg xmlns="http://www.w3.org/2000/svg" '
           f'viewBox="{vb[0]:.1f} {vb[1]:.1f} {vb[2]:.1f} {vb[3]:.1f}">\n{body}\n</svg>\n')
    open(out, 'w').write(doc)
    print(f'{out.split("/")[-1]}: viewBox {vb[2]:.0f}x{vb[3]:.0f} (aspect {vb[2]/vb[3]:.3f})')
    return vb[2] / vb[3]


def monogram(out, color, square=False, chunk=0.34):
    r = 150.0
    w = r * chunk
    w_arc = w * 1.02
    q = 0.97
    c = r / 0.585
    th = math.asin(r / c)
    cos_t = math.cos(th)
    Rup = (c * cos_t**2, -r * cos_t * q); Rdn = (c * cos_t**2, r * cos_t * q)
    Lup = (-c * cos_t**2, -r * cos_t * q); Ldn = (-c * cos_t**2, r * cos_t * q)
    g = []
    g.append(stroke(f'M {Rup[0]:.2f} {Rup[1]:.2f} A {r:.2f} {r*q:.2f} 0 1 1 {Rdn[0]:.2f} {Rdn[1]:.2f}', w_arc, color))
    g.append(stroke(f'M {Lup[0]:.2f} {Lup[1]:.2f} A {r:.2f} {r*q:.2f} 0 1 0 {Ldn[0]:.2f} {Ldn[1]:.2f}', w_arc, color))
    g.append(stroke(f'M {Ldn[0]:.2f} {Ldn[1]:.2f} L {Rup[0]:.2f} {Rup[1]:.2f}', w, color))
    g.append(stroke(f'M {Lup[0]:.2f} {Lup[1]:.2f} L {Rdn[0]:.2f} {Rdn[1]:.2f}', w, color))
    g.append(stroke(f'M {-c-r:.2f} {-r*0.045:.2f} L {-c+r*0.92:.2f} {-r*0.045:.2f}', w * 0.95, color, cap='butt'))
    half_w = c + r + w_arc / 2
    half_h = r * q + w_arc / 2
    if square:
        s = half_w * 1.08
        vb = (-s, -s, 2 * s, 2 * s)
    else:
        pad = half_w * 0.05
        vb = (-half_w - pad, -half_h - pad, 2 * (half_w + pad), 2 * (half_h + pad))
    doc = (f'<svg xmlns="http://www.w3.org/2000/svg" '
           f'viewBox="{vb[0]:.1f} {vb[1]:.1f} {vb[2]:.1f} {vb[3]:.1f}">\n' +
           "\n".join(g) + '\n</svg>\n')
    open(out, 'w').write(doc)
    print(f'{out.split("/")[-1]}: viewBox {vb[2]:.0f}x{vb[3]:.0f}')
    return vb[2] / vb[3]


if __name__ == '__main__':
    import os
    os.makedirs(OUT, exist_ok=True)
    a = wordmark(f'{OUT}/divzero-wordmark.svg', '#111116')
    wordmark(f'{OUT}/divzero-wordmark-dark.svg', '#f3f0e9')
    b = monogram(f'{OUT}/divzero-mark.svg', '#111116')
    monogram(f'{OUT}/divzero-mark-dark.svg', '#f3f0e9')
    # favicon: square viewBox + theme-aware ink via prefers-color-scheme
    monogram(f'{OUT}/favicon.svg', '#111116', square=True)
    fav = open(f'{OUT}/favicon.svg').read()
    fav = fav.replace(' stroke="#111116"', '').replace(' fill="#111116"', '')
    style = ('<style>path{stroke:#111116}'
             '@media (prefers-color-scheme:dark){path{stroke:#f3f0e9}}</style>\n')
    fav = fav.replace('>\n  <path', '>\n' + style + '  <path', 1)
    open(f'{OUT}/favicon.svg', 'w').write(fav)
    print(f'ASPECTS wordmark={a:.4f} mark={b:.4f}')
