const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// the arrival: the line leads, and the same line carries every meaning
// in sequence. born from a single point (zero), it extends past both
// edges of the frame, accelerating (toward infinity). light blooms
// FROM it — warmth up, coolness down — the divider giving each world
// its character, and as the worlds take form the line breathes once
// (the taegeuk passing through it). then it settles into its work:
// dividing. division, from zero, creates without end.
(function () {
  const genesis = document.getElementById("genesis");
  const land = document.getElementById("manifesto");
  if (!genesis || !land) return;
  const born = () => land.classList.add("born");

  // the arrival plays only on a clean landing: any deep link (#about,
  // #still, …) goes straight to the finished page
  if (reducedMotion || location.hash) {
    genesis.remove();
    born();
    return;
  }

  const ctx = genesis.getContext("2d");
  let W = 0, H = 0, meetY = 0, AMP = 0, inkLine = null;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    genesis.width = Math.round(W * dpr);
    genesis.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the horizon's one source of truth: the CSS line sits at 50svh of
    // the hero, so the arrival draws its line at the hero's own middle
    // (not the window's) — the fade-out lands pixel-for-pixel on it
    meetY = land.offsetHeight * .50;
    AMP = H * .03;
    // the stroke exhales at the frame edges — pigment exhausting as
    // the line heads past the visible world
    inkLine = ctx.createLinearGradient(0, 0, W, 0);
    inkLine.addColorStop(0, "rgba(243,240,233,0)");
    inkLine.addColorStop(.07, "rgba(243,240,233,1)");
    inkLine.addColorStop(.93, "rgba(243,240,233,1)");
    inkLine.addColorStop(1, "rgba(243,240,233,0)");
  }

  const easeInOut = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  // one breath: crest then trough, tapered flat at both edges
  const shape = (u) => Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * u);
  const N = 140;

  // .4s black · .4–1.8s a point becomes an endless line · 1.8–3.3s the
  // line breathes while light blooms · 3.3–4.4s THE SPRINGBOARD: the
  // breath's energy gathers into a bow, the line snaps up past flat,
  // and both sentences arrive from the strike — the thesis flung up
  // to stand on the line, the answer handed down to hang from it.
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const bump = (u) => Math.exp(-((u - .5) * (u - .5)) / (2 * .11 * .11));

  // one oscillation, like a struck diving board: load, up-stroke
  // (launches the thesis), rebound down-stroke (delivers the answer),
  // settle. one strike, two deliveries.
  function springAt(t) {
    if (t < 3300) return 0;
    if (t < 3750) return 10 * easeInOut((t - 3300) / 450);          // load: bow down
    if (t < 3930) return 10 - 18 * easeOutCubic((t - 3750) / 180);  // up-stroke, past flat to -8
    if (t < 4150) return -8 + 14 * easeInOut((t - 3930) / 220);     // rebound, down past flat to +6
    if (t < 4700) return 6 * (1 - easeInOut((t - 4150) / 550));     // settle
    return 0;
  }

  function draw(t) {
    const grow = clamp01((t - 400) / 1400);
    // slow at birth (a point, held), accelerating past the edges
    const half = (W * .5 + 60) * Math.pow(grow, 2.2);
    const bloom = easeInOut(clamp01((t - 1800) / 2200));
    const breath = Math.sin(Math.PI * clamp01((t - 1800) / 1500));
    const s = breath;
    const spring = springAt(t);
    const edge = (u) => meetY + AMP * s * shape(u) + spring * bump(u);
    // light hugs the line first, reaching further as it becomes;
    // a faint overshoot at mid-bloom, settling to the resting level
    const reachW = Math.max(2, meetY * bloom);
    const reachC = Math.max(2, (H - meetY) * bloom);
    const m = bloom === 0 ? 0 : (.25 + .75 * bloom) * (1 + .35 * breath);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    if (m > 0) {
      // the line dictates where the light goes: one vertical profile,
      // brightest AT the line — warmth reaching up from it, coolness
      // falling away below — and each column of the field is shifted
      // to the line's own height there. the halo bends and travels
      // with every crest and trough; the warmth never crosses beneath
      // the line, the cool never rises above it.
      const wSpan = reachW / (reachW + reachC);
      const g = ctx.createLinearGradient(0, meetY - reachW, 0, meetY + reachC);
      g.addColorStop(wSpan * .26, "rgba(255,240,220,0)");
      g.addColorStop(wSpan * .66, "rgba(255,240,220," + (.016 * m).toFixed(4) + ")");
      g.addColorStop(wSpan * .94, "rgba(255,238,214," + (.045 * m).toFixed(4) + ")");
      g.addColorStop(wSpan, "rgba(255,238,214," + (.065 * m).toFixed(4) + ")");
      g.addColorStop(wSpan, "rgba(198,214,244," + (.035 * m).toFixed(4) + ")");
      g.addColorStop(wSpan + (1 - wSpan) * .4, "rgba(198,214,244," + (.015 * m).toFixed(4) + ")");
      g.addColorStop(wSpan + (1 - wSpan) * .85, "rgba(198,214,244,0)");
      ctx.fillStyle = g;
      const colW = W / N;
      for (let i = 0; i < N; i++) {
        const dy = edge((i + .5) / N) - meetY;
        const x0 = Math.round(i * colW);
        ctx.save();
        ctx.translate(0, dy);
        ctx.fillRect(x0, -dy, Math.round((i + 1) * colW) - x0, H);
        ctx.restore();
      }
    }

    if (grow > 0) {
      ctx.beginPath();
      if (grow < 1) {
        ctx.moveTo(W * .5 - half, meetY + .5);
        ctx.lineTo(W * .5 + half, meetY + .5);
      } else {
        for (let i = 0; i <= N; i++) {
          const x = W * i / N;
          const y = edge(i / N) + .5;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      }
      const alpha = grow < 1 ? Math.min(1, grow * 6) * .34 : .34 + .1 * breath;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = inkLine;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // both sentences arrive by the strike, not by fade — the line is
  // the whole composition, and it hands out its own words.
  const figure = land.querySelector(".figure");
  const undername = land.querySelector(".undername");

  function words(t) {
    const c1 = 3.4, c3 = c1 + 1;
    const back = (v) => v === 0 ? 0 : 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2);
    // the up-stroke flings the thesis (3750): fast off the board,
    // hang-time at the top of the arc, one firm landing — it stands
    // on the line that raised it.
    // the fling is deeper than the answer's (62px vs 27): the headline
    // must start fully sunk beneath the line, so it has further to rise
    if (figure) {
      const u = clamp01((t - 3750) / 950);
      const rise = back(u);
      figure.style.opacity = u > 0 ? "1" : "0";
      figure.style.transform = "translateY(" + (62 * (1 - rise)).toFixed(2) + "px)";
    }
    // the rebound down-stroke delivers the answer (3950): the same
    // spring, mirrored, one beat later — the board's echo. the
    // baseline delivers the words that say the baseline raises you.
    if (undername) {
      const v = clamp01((t - 3950) / 950);
      const drop = back(v);
      undername.style.opacity = v > 0 ? "1" : "0";
      undername.style.transform = "translateY(" + (-27 * (1 - drop)).toFixed(2) + "px)";
    }
  }

  let start = null;
  let skipped = false;
  let fading = false;
  const skip = () => { skipped = true; };
  window.addEventListener("wheel", skip, { once: true, passive: true });
  window.addEventListener("touchmove", skip, { once: true, passive: true });
  window.addEventListener("keydown", skip, { once: true });
  window.addEventListener("pointerdown", skip, { once: true });

  function frame(now) {
    if (start === null) start = now;
    const t = skipped ? 5600 : now - start;
    draw(Math.min(t, 4800));
    words(t);
    if (t >= 4800 && !fading) {
      fading = true;
      genesis.style.opacity = "0";
      setTimeout(() => genesis.remove(), 900);
    }
    if (t < 5600) { requestAnimationFrame(frame); return; }
    born();
  }

  size();
  window.addEventListener("resize", size);
  draw(0);
  requestAnimationFrame(frame);
})();

// the horizon is still water. touched, one damped pulse travels outward
// from the point of contact — each point it passes rises then falls —
// and the water settles back to mirror-stillness. while the line bends,
// the light bends with it: the strip repaints its glow as one vertical
// profile shifted to the line's height at every point, so the halo
// rides the pulse — warmth never beneath the line, cool never above.
// at rest it is a perfectly straight 1px line.
function stillWater(canvas, reach) {
  if (!canvas || !reach) return;
  const ctx = canvas.getContext("2d");
  const MID = 40;
  let width = 0;

  // nacre, not pigment: the ink drifts through a few degrees of color,
  // far too slowly to watch — mother-of-pearl held in the lacquer black
  function inkColor() {
    if (reducedMotion) return [243, 240, 233];
    const t = performance.now();
    return [
      Math.round(243 + 5 * Math.sin(t / 23000)),
      Math.round(240 + 4 * Math.sin(t / 31000 + 2)),
      Math.round(233 + 7 * Math.sin(t / 17000 + 4)),
    ];
  }

  // the exhausted stroke: full-bodied at its center, the line's ends
  // fade at the frame edges like a brush running out of pigment
  function ink() {
    const [r, g, b] = inkColor();
    const g2 = ctx.createLinearGradient(0, 0, width, 0);
    g2.addColorStop(0, "rgba(" + r + "," + g + "," + b + ",0)");
    g2.addColorStop(.07, "rgba(" + r + "," + g + "," + b + ",1)");
    g2.addColorStop(.93, "rgba(" + r + "," + g + "," + b + ",1)");
    g2.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");
    return g2;
  }

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(80 * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawStill();
  }

  function stroke(path) {
    ctx.clearRect(0, 0, width, 80);
    ctx.beginPath();
    path();
    ctx.globalAlpha = .34;
    ctx.strokeStyle = ink();
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawStill() {
    stroke(() => {
      ctx.moveTo(0, MID + .5);
      ctx.lineTo(width, MID + .5);
    });
  }

  const A = 3.2, V = 460, W = 78, TAU = 1.05, LIFE = 3200;
  const S2 = Math.SQRT2;
  const wavelet = (s) => (s > 2.6 || s < -2.6) ? 0 : -S2 * s * Math.exp(.5 - s * s);

  let ripples = [];
  let raf = null;
  let lastTouch = 0;

  // the CSS glow, rebuilt in canvas: the same stops as .sky and
  // .ground, sampled where the 80px strip sits, so the repaint is
  // seamless against the static gradients above and below it
  const lerpStops = (stops, u) => {
    if (u <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      if (u <= stops[i][0]) {
        const a = stops[i - 1], b = stops[i];
        return a[1] + (b[1] - a[1]) * (u - a[0]) / (b[0] - a[0]);
      }
    }
    return stops[stops.length - 1][1];
  };
  const skyStops = [[.26, 0], [.66, .016], [.94, .045], [1, .065]];
  const groundStops = [[0, .035], [.4, .015], [.85, 0]];

  function frame(now) {
    ripples = ripples.filter((r) => now - r.t0 < LIFE);
    if (!ripples.length) { drawStill(); raf = null; return; }
    const pts = [];
    for (let x = 0; x <= width; x += 2) {
      let y = MID + .5;
      for (const r of ripples) {
        const dt = (now - r.t0) / 1000;
        const amp = A * Math.exp(-dt / TAU);
        y += amp * wavelet((Math.abs(x - r.x0) - V * dt) / W);
      }
      pts.push([x, y]);
    }

    // repaint the strip: black base, then one vertical light profile —
    // brightest AT the line, warm side up, cool side down — shifted
    // column-by-column to the ripple's height there. the halo travels
    // with the pulse; the light holds the line's shape exactly.
    ctx.clearRect(0, 0, width, 80);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, 80);
    const half = Math.max(1, window.innerHeight * .5);
    const g = ctx.createLinearGradient(0, 0, 0, 80);
    g.addColorStop(0, "rgba(255,238,214," + lerpStops(skyStops, 1 - MID / half).toFixed(4) + ")");
    const knot = MID - .06 * half;
    if (knot > 0 && knot < MID) g.addColorStop(knot / 80, "rgba(255,238,214,.045)");
    g.addColorStop(MID / 80, "rgba(255,238,214,.065)");
    g.addColorStop(MID / 80, "rgba(198,214,244,.035)");
    g.addColorStop(1, "rgba(198,214,244," + lerpStops(groundStops, (80 - MID) / half).toFixed(4) + ")");
    ctx.fillStyle = g;
    for (let i = 0; i < pts.length; i += 2) {
      const dy = pts[i][1] - (MID + .5);
      ctx.save();
      ctx.translate(0, dy);
      ctx.fillRect(pts[i][0], -dy, 4, 80);
      ctx.restore();
    }

    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      i === 0 ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.globalAlpha = .34;
    ctx.strokeStyle = ink();
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function touch(clientX) {
    if (reducedMotion) return;
    const now = performance.now();
    if (now - lastTouch < 550) return;
    lastTouch = now;
    ripples.push({ x0: clientX, t0: now });
    if (!raf) raf = requestAnimationFrame(frame);
  }

  reach.addEventListener("pointerenter", (e) => touch(e.clientX));
  reach.addEventListener("pointerdown", (e) => touch(e.clientX));
  window.addEventListener("resize", size);
  size();

  // the drift needs no audience and almost no work: a few redraws a
  // second, only while the page is visible and the water is at rest
  if (!reducedMotion) {
    setInterval(() => { if (!raf && !document.hidden) drawStill(); }, 400);
  }
}

stillWater(document.getElementById("water"), document.getElementById("reach"));

// photos are proof: when an entry's assets.json url is filled in, its
// quiet slot becomes the documentary photograph
fetch("assets.json")
  .then((response) => response.ok ? response.json() : null)
  .then((assets) => {
    if (!assets || !Array.isArray(assets.images)) return;
    const imagesById = new Map(assets.images.map((image) => [image.id, image]));
    document.querySelectorAll("[data-asset-id]").forEach((entry) => {
      const image = imagesById.get(entry.dataset.assetId);
      if (!image || !image.url) return;
      const img = document.createElement("img");
      img.className = "photo";
      img.src = image.url;
      img.alt = image.alt || "";
      img.loading = "lazy";
      const slot = entry.querySelector(".ph");
      if (slot) slot.replaceWith(img);
      else entry.appendChild(img);
    });
  })
  .catch(() => {});

// the ledger's rise, for browsers that can't scroll-drive it in CSS:
// an observer lifts each entry once as it enters. without JS (or with
// reduced motion) the ledger simply stands visible.
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (CSS.supports("animation-timeline: view()")) return;
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((hits) => {
    hits.forEach((hit) => {
      if (!hit.isIntersecting) return;
      hit.target.classList.add("is-revealed");
      observer.unobserve(hit.target);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -5% 0px" });
  document.querySelectorAll(".entry").forEach((entry) => {
    entry.classList.add("pre-reveal");
    observer.observe(entry);
  });
})();
