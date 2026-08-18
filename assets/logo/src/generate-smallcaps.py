#!/usr/bin/env python3
"""DivZero small-caps logotype: D and Z full caps, iv/ero as small caps.

Pretendard has no smcp table, so the small caps are SYNTHESIZED properly:
scaled-down capitals drawn from a HEAVIER weight instance so their stems
optically match the full caps (a naive scale-down goes spindly).
  stem(wght) = 192 + 0.4*(wght-430) units  [measured]
  ratio 0.70 -> wght 636 | 0.74 -> 599 | 0.78 -> 565
"""
import json, re, os, sys
TOOLS = os.path.dirname(os.path.abspath(__file__))
CAPS = json.load(open(f'{TOOLS}/pretendard-430-caps.json'))
LAYOUT = [('D','cap'),('I','sc'),('V','sc'),('Z','cap'),('E','sc'),('R','sc'),('O','sc')]

def sample_path(d):
    toks = re.findall(r'([MLCQZHVAmlcqzhva])|(-?\d+\.?\d*(?:e-?\d+)?)', d)
    st=[c if c else float(n) for c,n in toks]; pts=[];i=0;cx=cy=sx=sy=0.0;cmd=None
    def b3(p0,p1,p2,p3,n=24):
        r=[]
        for k in range(1,n+1):
            t=k/n;m=1-t
            r.append((m**3*p0[0]+3*m*m*t*p1[0]+3*m*t*t*p2[0]+t**3*p3[0],
                      m**3*p0[1]+3*m*m*t*p1[1]+3*m*t*t*p2[1]+t**3*p3[1]))
        return r
    def b2(p0,p1,p2,n=16):
        r=[]
        for k in range(1,n+1):
            t=k/n;m=1-t
            r.append((m*m*p0[0]+2*m*t*p1[0]+t*t*p2[0], m*m*p0[1]+2*m*t*p1[1]+t*t*p2[1]))
        return r
    while i<len(st):
        t=st[i]
        if isinstance(t,str):
            cmd=t;i+=1
            if cmd in 'Zz': cx,cy=sx,sy; continue
        if cmd in 'Mm':
            x,y=st[i],st[i+1];i+=2
            if cmd=='m': x+=cx;y+=cy
            cx,cy=sx,sy=x,y;pts.append((x,y));cmd='L' if cmd=='M' else 'l'
        elif cmd in 'Ll':
            x,y=st[i],st[i+1];i+=2
            if cmd=='l': x+=cx;y+=cy
            pts.append((x,y));cx,cy=x,y
        elif cmd in 'Hh':
            x=st[i];i+=1
            if cmd=='h': x+=cx
            pts.append((x,cy));cx=x
        elif cmd in 'Vv':
            y=st[i];i+=1
            if cmd=='v': y+=cy
            pts.append((cx,y));cy=y
        elif cmd in 'Cc':
            x1,y1,x2,y2,x,y=st[i:i+6];i+=6
            if cmd=='c': x1+=cx;y1+=cy;x2+=cx;y2+=cy;x+=cx;y+=cy
            pts+=b3((cx,cy),(x1,y1),(x2,y2),(x,y));cx,cy=x,y
        elif cmd in 'Qq':
            x1,y1,x,y=st[i:i+4];i+=4
            if cmd=='q': x1+=cx;y1+=cy;x+=cx;y+=cy
            pts+=b2((cx,cy),(x1,y1),(x,y));cx,cy=x,y
        else: i+=1
    return pts

def build(out, color='#f3f0e9', ratio=0.74, sc_weight=599,
          track_em=0.0, sc_extra_em=0.012, pad_ratio=0.04):
    SC = json.load(open(f'{TOOLS}/pret-sc-{sc_weight}.json'))
    upm = CAPS['upm']
    k = ratio
    track = track_em*upm
    sc_extra = sc_extra_em*upm     # small caps want a touch more air
    placed, x = [], 0.0
    for i,(ch,kind) in enumerate(LAYOUT):
        src, s = (CAPS,1.0) if kind=='cap' else (SC,k)
        placed.append((ch,kind,src,s,x))
        adv = src['glyphs'][ch]['advance']*s
        nxt = LAYOUT[i+1][1] if i+1<len(LAYOUT) else None
        extra = sc_extra if (kind=='sc' or nxt=='sc') else 0.0
        x += adv + track + (extra if nxt else 0.0)
    minx=miny=1e9; maxx=maxy=-1e9
    for ch,kind,src,s,gx in placed:
        for px,py in sample_path(src['glyphs'][ch]['path']):
            X,Y = gx+px*s, py*s
            minx=min(minx,X);maxx=max(maxx,X);miny=min(miny,Y);maxy=max(maxy,Y)
    w,h = maxx-minx, maxy-miny
    pad = w*pad_ratio
    body=[]
    for ch,kind,src,s,gx in placed:
        tf = f'translate({gx:.2f},0)' + (f' scale({s:.5f})' if s!=1.0 else '')
        body.append(f'  <path transform="{tf}" d="{src["glyphs"][ch]["path"]}"/>')
    doc=(f'<svg xmlns="http://www.w3.org/2000/svg" '
         f'viewBox="{minx-pad:.2f} {miny-pad:.2f} {w+2*pad:.2f} {h+2*pad:.2f}">\n'
         f'<g fill="{color}">\n'+"\n".join(body)+'\n</g>\n</svg>\n')
    open(out,'w').write(doc)
    print(f'{os.path.basename(out):32s} ratio={ratio} wght={sc_weight} '
          f'track={track_em:+.3f} ink {w:.0f}x{h:.0f} aspect {w/h:.3f}')
    return w/h

if __name__=='__main__':
    O='/tmp/claude-0/logo-work/svg'
    for r,wt in ((0.70,636),(0.74,599),(0.78,565)):
        build(f'{O}/sc-r{int(r*100)}.svg', ratio=r, sc_weight=wt)
    for tr in (-0.024,-0.012,0.0,0.015):
        build(f'{O}/sc-t{tr:+.3f}.svg', ratio=0.74, sc_weight=599, track_em=tr)
