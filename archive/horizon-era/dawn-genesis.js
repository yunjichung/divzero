// DAWN VARIANT of the arrival (never committed — preserved from the
// 2026-07-23 design session). A replacement for the springboard
// genesis in script.js: the page opens dark; light gathers along
// the horizon — warmth above, coolness below — and the line is never
// drawn: it BECOMES visible where the two worlds meet, the way a
// real horizon does. The words do not move. The light reaches them
// and they are simply there. Nothing performs — things become.
//
// Drop-in notes: expects the horizon-era index.html structure
// (#genesis canvas, .land/#manifesto, .sky, .figure, .wordmark) and
// a `reducedMotion` const in scope. Word/figure elements get their
// opacity driven frame-by-frame; CSS `.land.born` rules show them
// for the skip/deep-link paths.
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
  let W = 0, H = 0, meetY = 0, inkLine = null;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    genesis.width = Math.round(W * dpr);
    genesis.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the horizon's one source of truth: the CSS line sits at the
    // sky's bottom edge (50svh), so the dawn reads the sky's own
    // height — and the fade-out lands pixel-for-pixel on it
    const sky = land.querySelector(".sky");
    meetY = sky ? sky.offsetHeight : H * .50;
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

  // .4s dark, held · .4–2.9s the light blooms and the line appears
  // where the worlds meet · the thesis resolves inside the light ·
  // the name resolves at the floor · 3.4s the canvas exhales onto
  // the finished page. no displacement anywhere: only luminance.
  function draw(t) {
    const bloom = easeInOut(clamp01((t - 400) / 2500));
    // the line trails the light slightly: it is FOUND by the dawn,
    // not drawn ahead of it
    const lineA = .34 * easeInOut(clamp01((t - 900) / 1800));

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    if (bloom > 0) {
      // the page's own resting light, grown in reach and strength
      // together: one vertical profile, brightest at the meeting
      // height — warmth reaching up, coolness falling away below
      const reachW = Math.max(2, meetY * bloom);
      const reachC = Math.max(2, (H - meetY) * bloom);
      const m = .25 + .75 * bloom;
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
      ctx.fillRect(0, meetY - reachW, W, reachW + reachC);
    }

    if (lineA > 0) {
      ctx.beginPath();
      ctx.moveTo(0, meetY + .5);
      ctx.lineTo(W, meetY + .5);
      ctx.globalAlpha = lineA;
      ctx.strokeStyle = inkLine;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // the light hands out the words: the thesis resolves inside the
  // bloom, the name resolves at the floor a breath later. opacity
  // only — as if the dawn reached them where they already stood.
  const figure = land.querySelector(".figure");
  const wordmark = land.querySelector(".wordmark");

  function words(t) {
    if (figure) {
      figure.style.opacity = easeInOut(clamp01((t - 1400) / 1400)).toFixed(3);
    }
    if (wordmark) {
      wordmark.style.opacity = easeInOut(clamp01((t - 2100) / 1100)).toFixed(3);
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
    const t = skipped ? 4200 : now - start;
    draw(Math.min(t, 3400));
    words(t);
    if (t >= 3400 && !fading) {
      fading = true;
      genesis.style.opacity = "0";
      setTimeout(() => genesis.remove(), 900);
    }
    if (t < 4200) { requestAnimationFrame(frame); return; }
    born();
  }

  size();
  window.addEventListener("resize", size);
  draw(0);
  requestAnimationFrame(frame);
})();
