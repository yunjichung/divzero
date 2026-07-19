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
    meetY = H * .68;
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

  function fieldPath(edgeAt, top) {
    ctx.beginPath();
    if (top) { ctx.moveTo(0, -2); ctx.lineTo(W, -2); }
    else { ctx.moveTo(0, H + 2); ctx.lineTo(W, H + 2); }
    for (let i = N; i >= 0; i--) {
      ctx.lineTo(W * i / N, edgeAt(i / N));
    }
    ctx.closePath();
  }

  // .4s black · .4–1.8s a point becomes an endless line · 1.8–4s light
  // blooms from it while the line breathes once · 4.2s the words
  function draw(t) {
    const grow = clamp01((t - 400) / 1400);
    // slow at birth (a point, held), accelerating past the edges
    const half = (W * .5 + 60) * Math.pow(grow, 2.2);
    const bloom = easeInOut(clamp01((t - 1800) / 2200));
    const breath = Math.sin(Math.PI * bloom);
    const s = breath;
    const edge = (u) => meetY + AMP * s * shape(u);
    // light hugs the line first, reaching further as it becomes;
    // a faint overshoot at mid-bloom, settling to the resting level
    const reachW = Math.max(2, meetY * bloom);
    const reachC = Math.max(2, (H - meetY) * bloom);
    const m = bloom === 0 ? 0 : (.25 + .75 * bloom) * (1 + .35 * breath);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    if (m > 0) {
      ctx.save();
      fieldPath(edge, true);
      ctx.clip();
      const gw = ctx.createLinearGradient(0, meetY - reachW, 0, meetY);
      gw.addColorStop(.26, "rgba(255,240,220,0)");
      gw.addColorStop(.66, "rgba(255,240,220," + (.016 * m).toFixed(4) + ")");
      gw.addColorStop(.94, "rgba(255,238,214," + (.045 * m).toFixed(4) + ")");
      gw.addColorStop(1, "rgba(255,238,214," + (.065 * m).toFixed(4) + ")");
      ctx.fillStyle = gw;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      ctx.save();
      fieldPath(edge, false);
      ctx.clip();
      const gc = ctx.createLinearGradient(0, meetY, 0, meetY + reachC);
      gc.addColorStop(0, "rgba(198,214,244," + (.035 * m).toFixed(4) + ")");
      gc.addColorStop(.4, "rgba(198,214,244," + (.015 * m).toFixed(4) + ")");
      gc.addColorStop(.85, "rgba(198,214,244,0)");
      ctx.fillStyle = gc;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
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

  // the words are revealed by the light, not after it: the sentence
  // surfaces as the sky blooms; the figure rises through the line's
  // breath and settles onto the horizon as the water stills; the
  // thesis follows in the cool ground. no moment of appearance.
  const title = land.querySelector(".manifesto-title");
  const figure = land.querySelector(".figure");
  const thesis = land.querySelector(".manifesto-thesis");

  function words(t) {
    const o1 = easeInOut(clamp01((t - 2200) / 2400));
    const o2 = easeInOut(clamp01((t - 2900) / 1900));
    const o3 = easeInOut(clamp01((t - 3300) / 2200));
    if (title) title.style.opacity = o1.toFixed(3);
    if (figure) {
      figure.style.opacity = o2.toFixed(3);
      figure.style.transform = "translateY(" + (3 * (1 - o2)).toFixed(2) + "px)";
    }
    if (thesis) thesis.style.opacity = o3.toFixed(3);
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
    draw(Math.min(t, 4200));
    words(t);
    if (t >= 4200 && !fading) {
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
// and the water settles back to mirror-stillness. at rest it is a
// perfectly straight 1px line. this is the page's only motion.
(function () {
  const canvas = document.getElementById("water");
  const reach = document.getElementById("reach");
  if (!canvas || !reach) return;
  const ctx = canvas.getContext("2d");
  const MID = 40;
  let width = 0;
  let ink = null;

  // the exhausted stroke: full-bodied at its center, the line's ends
  // fade at the frame edges like a brush running out of pigment
  function inkGradient(context, w) {
    const g = context.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "rgba(243,240,233,0)");
    g.addColorStop(.07, "rgba(243,240,233,1)");
    g.addColorStop(.93, "rgba(243,240,233,1)");
    g.addColorStop(1, "rgba(243,240,233,0)");
    return g;
  }

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(80 * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ink = inkGradient(ctx, width);
    drawStill();
  }

  function stroke(path) {
    ctx.clearRect(0, 0, width, 80);
    ctx.beginPath();
    path();
    ctx.globalAlpha = .34;
    ctx.strokeStyle = ink;
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

  function frame(now) {
    ripples = ripples.filter((r) => now - r.t0 < LIFE);
    if (!ripples.length) { drawStill(); raf = null; return; }
    stroke(() => {
      for (let x = 0; x <= width; x += 2) {
        let y = MID + .5;
        for (const r of ripples) {
          const dt = (now - r.t0) / 1000;
          const amp = A * Math.exp(-dt / TAU);
          y += amp * wavelet((Math.abs(x - r.x0) - V * dt) / W);
        }
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    });
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
})();

// touch the figure and its name becomes 디브제로 for a moment
const figureEl = document.getElementById("figure");
if (figureEl) {
  figureEl.addEventListener("pointerdown", () => {
    figureEl.classList.add("hangul");
    setTimeout(() => figureEl.classList.remove("hangul"), 1400);
  });
}

const events = document.querySelectorAll(".event");
events.forEach((ev, i) => {
  const row = ev.querySelector(".row");
  const detail = ev.querySelector(".detail");
  detail.id = "event-detail-" + i;
  row.setAttribute("aria-controls", detail.id);
  row.addEventListener("click", () => {
    const wasOpen = ev.classList.contains("open");
    events.forEach((other) => {
      other.classList.remove("open");
      other.querySelector(".row").setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      ev.classList.add("open");
      row.setAttribute("aria-expanded", "true");
    }
  });
});

fetch("assets.json")
  .then((response) => response.ok ? response.json() : null)
  .then((assets) => {
    if (!assets || !Array.isArray(assets.images)) return;
    const imagesById = new Map(assets.images.map((image) => [image.id, image]));
    document.querySelectorAll("[data-asset-id]").forEach((slot) => {
      const image = imagesById.get(slot.dataset.assetId);
      if (!image || !image.url) return;
      const img = document.createElement("img");
      img.className = "photo photo--opening";
      img.src = image.url;
      img.alt = image.alt || "";
      slot.replaceWith(img);
    });
  })
  .catch(() => {});
