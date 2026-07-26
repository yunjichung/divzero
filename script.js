const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// fault isolation: each unit runs alone — one failure cannot halt
// evaluation and take the layout-critical measures down with it
const iso = (fn) => { try { fn(); } catch (e) {} };

// the FOLD, measured: --fold falls back to 100svh, but svh is taken
// against the browser's TALLEST bar config — Safari's compact pill
// leaves the real resting viewport ~25px taller, and the knife
// floated above the bar in that gap. pin the fold to the true
// resting height, measured at load; re-measure only near the top
// (rotation, window resize), never mid-scroll — a collapsing
// toolbar fires resize, and the guard keeps the knife dead still.
iso(() => {
  // safari's floating pill keeps ~13px of internal air between the
  // layout viewport's bottom (the farthest any CSS/JS measure
  // reaches — innerHeight, svh and visualViewport all agree) and
  // the pill itself. the knife sinks that far into the bar region,
  // where the page still renders, so the cut lands on the pill's
  // real top edge. chrome's opaque toolbar sits flush at the
  // viewport bottom: no nudge there, nor in in-app browsers.
  // 19 measured on-device: an iOS DESIGN constant (pts), not a
  // device-size value — the pill keeps the same margin on every
  // iPhone. if apple redesigns the bar, this one number is the dial.
  // ALLOWLIST, not blocklist: the nudge applies only when the UA
  // provably IS real safari (Version/ + Safari/ tokens — in-app
  // WKWebViews lack both). unknown surfaces get the honest measured
  // fold, the correct default; only the floating pill earns the air.
  const PILL_AIR = 19;
  const ua = navigator.userAgent;
  const pillAir =
    /iPhone|iPad/.test(ua) && /Version\/[\d.]+.*Safari\//.test(ua)
      ? PILL_AIR : 0;
  const set = () => {
    const root = document.documentElement.style;
    root.setProperty("--fold", (window.innerHeight + pillAir) + "px");
    // the description's TRUE height, measured at the same settled
    // moment — the block-centering formula stays exact under any
    // future copy edit, type change, or user text-zoom. nothing is
    // encoded in constants (the CSS px value is only the no-JS
    // approximation).
    const about = document.querySelector(".about-text");
    if (about) root.setProperty("--desc-h", about.offsetHeight + "px");
  };
  // a re-measure is accepted only when the viewport is PROVABLY
  // settled: the page must rest at the top, the live visual
  // viewport must agree with the layout value, and two samples
  // 200ms apart must match. chrome reports a stale innerHeight for
  // a beat after its toolbar animates — a single sample taken in
  // that beat pinned the fold ~100px low and the name repositioned
  // behind the toolbar (present, painted, hidden, forever). any
  // failed check re-queues, so an unstable moment delays the
  // measure instead of corrupting it. the never-move-mid-scroll
  // guarantee stays: nothing is measured away from rest.
  let settle = null;
  const vvH = () =>
    window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const queue = () => {
    clearTimeout(settle);
    settle = setTimeout(tryMeasure, 350);
  };
  function tryMeasure() {
    if (window.scrollY > 4) return;
    const first = window.innerHeight;
    if (Math.abs(vvH() - first) > 1) { queue(); return; } // bar mid-animation
    setTimeout(() => {
      if (window.scrollY > 4) return;
      if (window.innerHeight !== first || Math.abs(vvH() - first) > 1) {
        queue(); // moved between samples — not settled, try again
        return;
      }
      set();
    }, 200);
  }
  set(); // load: at rest, bar settled — measure immediately
  window.addEventListener("resize", queue);
  window.addEventListener("orientationchange", queue);
  if (window.visualViewport)
    window.visualViewport.addEventListener("resize", queue);
  // the description's height shifts when the real webfont lands a
  // beat after first paint — re-measure once the faces are in
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(queue);
});


// the statement types itself — lovefrom-fashion: a near-empty page,
// one serif voice, a live caret. the thesis is typed; the caret
// blinks alone through a held pause (the volta, performed in real
// time); then Enter, and the answer types on its own line. when the
// statement ends, the name fades up in the floor: the signature.
iso(() => {
  const land = document.getElementById("manifesto");
  const line1 = land && land.querySelector(".line1");
  const line2 = land && land.querySelector(".line2");
  const caret = land && land.querySelector(".caret");
  if (!land || !line1 || !line2 || !caret) return;
  const TEXT1 = line1.textContent;
  const TEXT2 = line2.textContent;
  // signing marks the land (name rises) AND the body (the floor's
  // hairline draws itself — the knife joins the scene)
  const signed = () => {
    land.classList.add("signed");
    document.body.classList.add("signed");
  };

  // deep links and reduced motion read the finished page
  if (reducedMotion || location.hash) {
    signed();
    return;
  }

  // the line types LIVE-CENTERED: each keystroke inserts a character
  // before the trailing caret, and the whole centered line re-centers
  // around it — the statement is optically centered at every instant,
  // not only when finished. no fixed box, no carriage: the caret rides
  // at the end and the composition breathes outward from the center.

  line1.textContent = "";
  line2.textContent = "";
  line1.appendChild(caret);

  let skipped = false;
  const skip = () => { skipped = true; };
  window.addEventListener("wheel", skip, { once: true, passive: true });
  window.addEventListener("touchmove", skip, { once: true, passive: true });
  window.addEventListener("pointerdown", skip, { once: true });

  const finish = () => {
    line1.textContent = TEXT1;
    line2.textContent = TEXT2;
    line2.appendChild(caret);
    caret.style.visibility = "hidden";
    signed();
  };

  // the hand lifts once the line is set: the caret takes one last
  // exhale blink, then LEAVES — no cursor left blinking on a finished
  // statement. the stillness is the cue for the name to rise.
  const settle = () => {
    caret.style.visibility = "hidden";
    signed();
  };

  // ---- the scene, boarded as an animator would ----
  // 0.4s  empty stage: black. let the audience arrive.
  // 0.4s  the CHARACTER enters: the caret appears and blinks once or
  //       twice (~1.6s) — someone is here, gathering to speak.
  // 1.0s  the thesis, PHRASED: word-bursts, breaths between words,
  //       easing in on the first word. a hand that knows the line.
  // ~2.4s the period lands; Enter follows almost at once,
  //       document-true. THE pause — the only one — happens on the
  //       EMPTY line: the caret blinking in the blank space where
  //       the answer will land. commitment first, then the voice.
  // ~3.7s "So " — the pivot word, left alone for one beat — then
  //       the answer, typed SLOW: this is the powerful line, and
  //       its weight is told through deliberateness — each word
  //       set down like a stone, every letter meant.
  // ~6.3s the period; one exhale blink; the caret LEAVES; and the
  //       NAME rises at the floor — heavy, slow-settling, from the
  //       ground up. no cursor lingers on the finished statement.
  const strokeDelay = (ch, i, weighty) => {
    if (weighty) {
      if (ch === " ") return i === 2 ? 380 : 300; // each word set down
      return 120 + Math.random() * 40;            // slow, deliberate
    }
    if (ch === "." || ch === ",") return 420;     // the settle
    if (ch === " ") return 170;                   // breath between words
    // ease-in: the first strokes find the keys, then the hand flows
    return 40 + Math.max(0, 3 - i) * 22 + Math.random() * 20;
  };


  function type(lineEl, text, i, weighty, then) {
    if (skipped) { finish(); return; }
    if (i >= text.length) { then(); return; }
    lineEl.insertBefore(document.createTextNode(text[i]), caret);
    setTimeout(() => type(lineEl, text, i + 1, weighty, then), strokeDelay(text[i], i, weighty));
  }

  setTimeout(() => {                    // the character enters
    caret.style.visibility = "visible";
    setTimeout(() => {                  // …blinks once or twice, then speaks
      type(line1, TEXT1, 0, false, () => {
        // ONE pause, ONE place — and it lives on the EMPTY line:
        // Enter comes document-true almost at once (no travel, no
        // hold above), and the caret blinks naturally in the blank
        // space where the answer will land. the commitment is
        // visible before the voice arrives; the audience waits
        // where the vow will be spoken.
        setTimeout(() => {
          if (skipped) { finish(); return; }
          line2.appendChild(caret);
          setTimeout(() => {
            // after the answer's period: one exhale of stillness,
            // then the monument rises. the reader finishes the
            // sentence; THEN the ground answers.
            type(line2, TEXT2, 0, true, () => setTimeout(settle, 1000));
          }, 830);
        }, 180);
      });
    }, 1600);
  }, 400);
});

// the page MOVES IN ROOMS: one gesture, one section — the landing,
// the name-with-description reading, the archive — each transit
// carried by the reference's eased glide (lerp .045). momentum
// after a page-turn is swallowed until the wheel goes quiet, so a
// flick turns exactly one page. reduced motion keeps native
// scrolling entirely; touch pages via CSS snap instead.
iso(() => {
  if (reducedMotion) return;
  let target = null;
  let raf = null;
  let from = 0;
  let acc = 0;
  // the flick's own momentum must never turn a second page — and a
  // flick RAMPS UP before it decays, so a rising edge alone reads
  // as part of the same gesture. the rule the hand actually obeys:
  // after a turn, same-direction input is swallowed until the tail
  // has demonstrably DIED DOWN (fallen to a whisper of its peak);
  // only after that does a real push read as the next flick.
  let tail = false;
  let spent = false;
  let peak = 0;
  // the traveler's exception: input STILL FLOWING when the glide
  // lands is a held scroll, and it chains straight into the next
  // turn — nobody is forced to stop and push again at every room.
  // a flick's tail has died to nothing by arrival and chains nothing.
  let flow = 0;
  let lastFlowT = 0;
  let quietTimer = null;
  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;
  // the rooms, freshly measured each turn: the landing's top, the
  // .snap-2 reading, the archive's own top
  function points() {
    const pts = [0];
    const marker = document.querySelector(".snap-2");
    if (marker) pts.push(marker.getBoundingClientRect().top + window.scrollY);
    const events = document.getElementById("events");
    if (events) pts.push(Math.min(events.offsetTop, maxScroll()));
    // the founders' room: a fourth page. every room is a FIXED stop —
    // one gesture, one framed section, no loose positions between.
    const founders = document.getElementById("founders");
    if (founders) {
      // the founders' stop centers what the EYE sees: from the
      // block's top to the standing caption's bottom — not the box,
      // whose caption RESERVE (space held so swaps never jump)
      // extends invisibly below the text and dragged the visible
      // center high of true center
      const block = founders.querySelector(".kstage") || founders;
      const r = block.getBoundingClientRect();
      const cap = block.querySelector(".kcap.active");
      const bottom = cap ? cap.getBoundingClientRect().bottom : r.bottom;
      const centered = (r.top + bottom) / 2 + window.scrollY
        - window.innerHeight / 2;
      pts.push(Math.max(0, Math.min(centered, maxScroll())));
    }
    // if the LAST room outgrows the frame (a confined cast with five
    // full introductions), its foot must stay reachable: the page's
    // bottom becomes one more stop — only then
    if (maxScroll() > pts[pts.length - 1] + 24) pts.push(maxScroll());
    return pts;
  }
  let began = 0;
  const DUR = 1100;
  function tick(now) {
    // the document can SHRINK mid-transit (a room closing, a resize,
    // a toolbar collapse): the target follows the page's real edge
    if (target > maxScroll()) target = maxScroll();
    // TIME-BOXED, not asymptotic: the old lerp looked settled after a
    // second but kept crawling sub-pixel for another one — and
    // everything gated on arrival (the held-scroll chain, the final
    // set) fired long after the eye called the page at rest: the
    // forced repositioning. a quartic ease-out over a fixed span has
    // the same hand but a REAL end — the machine's clock and the
    // eye's clock agree on when the transit is over.
    const t = Math.min(1, (now - began) / DUR);
    const k = 1 - Math.pow(1 - t, 4);
    window.scrollTo(0, from + (target - from) * k);
    if (t === 1) {
      target = null;
      raf = null;
      acc = 0;
      if (pageDir !== 0 && performance.now() - lastFlowT < 140 && flow > 18) {
        turn(pageDir); // the held scroll travels on
      }
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  let pageDir = 0;
  // one page-turn, shared by wheel and keyboard: find the nearest
  // room to where we are (or are headed) and glide one room over
  const page = (dir) => {
    tail = true;
    spent = false;
    peak = 0;
    flow = 0;
    pageDir = dir;
    began = performance.now();
    from = window.scrollY;
    const pts = points();
    const here = target === null ? window.scrollY : target;
    let cur = 0;
    for (let i = 1; i < pts.length; i++) {
      if (Math.abs(pts[i] - here) < Math.abs(pts[cur] - here)) cur = i;
    }
    const next = Math.max(0, Math.min(pts.length - 1, cur + dir));
    target = pts[next];
    if (!raf) raf = requestAnimationFrame(tick);
  };
  // section 4 is a WALK, not a single stop: while the founders room
  // stands, a turn steps the stack (one flick, one founder — the
  // same gesture discipline as a page) and the room releases only
  // past its ends. a HELD scroll keeps stepping on its own beat.
  let walkTimer = null;
  const turn = (dir) => {
    const k = window.DZfounders;
    const f = document.getElementById("founders");
    const block = f && (f.querySelector(".kstage") || f);
    const br = block && block.getBoundingClientRect();
    const atFounders = br &&
      Math.abs(br.top + br.height / 2 - window.innerHeight / 2) <
        window.innerHeight * .35;
    if (k && atFounders && k.can(dir)) {
      tail = true;
      spent = false;
      peak = 0;
      flow = 0;
      pageDir = dir;
      k.walk(dir);
      clearTimeout(walkTimer);
      walkTimer = setTimeout(() => {
        if (performance.now() - lastFlowT < 140 && flow > 18) turn(dir);
      }, 500);
      return;
    }
    // the fifth founder is the page's floor: downward input past the
    // last of the stack goes nowhere at all — no drift, no no-op
    // glide. only upward, past the first, does the room release.
    if (atFounders && dir > 0) return;
    page(dir);
  };
  window.addEventListener("wheel", (e) => {
    if (window.DZlightOpen) return; // the lightbox holds the page still
    if (e.ctrlKey) return; // pinch-zoom stays native
    e.preventDefault();
    // firefox reports wheel deltas in LINES (deltaMode 1, ~3/notch)
    // or PAGES (2), not pixels — unnormalized, the 30px accumulator
    // needed ~10 notches per page-turn there. one delta currency.
    const dy = e.deltaY *
      (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => {
      tail = false; spent = false; peak = 0; acc = 0; pageDir = 0;
    }, 250);
    // input against the last turn's direction is always a human, and
    // it pages back at once, even mid-glide. input WITH the turn's
    // direction is one gesture — ramp, peak, decay — and ALL of it
    // is swallowed until it has died down to a whisper of its peak;
    // only then can a real push (not idle noise) begin the next turn.
    const a = Math.abs(dy);
    if (tail && dy * pageDir >= 0) {
      flow = flow * .7 + a * .3;
      lastFlowT = e.timeStamp;
      if (!spent) {
        peak = Math.max(peak, a);
        if (a < Math.max(12, peak * .1)) spent = true;
        return;
      }
      if (a < 40) return; // sub-push noise after a spent tail
    }
    if (acc * dy < 0) acc = 0;
    acc += dy;
    if (Math.abs(acc) < 30) return;
    const dir = acc > 0 ? 1 : -1;
    acc = 0;
    turn(dir);
  }, { passive: false });
  // keyboard parity: arrows, PageUp/Down and Space turn the same
  // rooms the wheel does — the keyboard reader sees the site
  // composed, not raw-scrolled. keys have no momentum, so they
  // bypass the wheel's lock; interactive elements keep their keys
  // (Space still opens a focused ledger row).
  window.addEventListener("keydown", (e) => {
    if (window.DZlightOpen) return; // the lightbox holds the page still
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // fields own their keys entirely; buttons and links own only the
    // keys that ACTIVATE them (Space, Enter) — after clicking a + or
    // an arrow, focus rests on that button, and the arrow keys must
    // still turn the page rather than going dead
    if (e.target && e.target.closest &&
        e.target.closest("input, textarea, select, [contenteditable=\"true\"]")) return;
    const onControl = e.target && e.target.closest &&
        e.target.closest("button, a");
    if (onControl && e.key === " ") return;
    const down = e.key === "ArrowDown" || e.key === "PageDown" ||
                 (e.key === " " && !e.shiftKey);
    const up = e.key === "ArrowUp" || e.key === "PageUp" ||
               (e.key === " " && e.shiftKey);
    if (!down && !up) return;
    e.preventDefault();
    turn(down ? 1 : -1);
  });
  // ---- touch, AUTHORED: the desktop grammar by hand ----
  // css snap negotiated with safari's engine and lost a little every
  // round. on touch surfaces the page now drives itself: a vertical
  // swipe turns one room on the same tween the wheel rides, the
  // founders' stop lands computed-centered, the stack walks swipe by
  // swipe with its sealed floor — one grammar, both surfaces. the
  // wall pans natively inside its own window (contained), and a
  // swipe that starts at its edge turns the page. css snap remains
  // in the stylesheet as the no-JS fallback; this hand overrides it.
  if (window.matchMedia("(hover: none)").matches) {
    document.documentElement.style.scrollSnapType = "none";
    let sy = null;
    let sx = null;
    let used = false;
    let wallEl = null;
    window.addEventListener("touchstart", (e) => {
      sy = e.touches[0].clientY;
      sx = e.touches[0].clientX;
      used = false;
      wallEl = e.target.closest && e.target.closest(".wall-grid");
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (sy === null || window.DZlightOpen) return;
      const dy = sy - e.touches[0].clientY;
      const dx = sx - e.touches[0].clientX;
      // taps and sideways stay native (and clickable)
      if (Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(dx)) return;
      // inside the wall: the grid pans itself while it has room in
      // the gesture's direction; at its edge, the page takes over
      if (wallEl) {
        const canDown =
          wallEl.scrollTop + wallEl.clientHeight < wallEl.scrollHeight - 1;
        const canUp = wallEl.scrollTop > 0;
        if ((dy > 0 && canDown) || (dy < 0 && canUp)) return;
      }
      e.preventDefault();
      if (used) return;
      if (Math.abs(dy) > 48) {
        used = true; // one gesture, one turn
        turn(dy > 0 ? 1 : -1);
      }
    }, { passive: false });
    window.addEventListener("touchend", () => {
      sy = null;
      wallEl = null;
    }, { passive: true });
  }
});

// the accordion: one room open at a time. opening a row closes the
// others; opening an open row simply closes the ledger back to rest.
iso(() => {
  const events = document.querySelectorAll(".event");
  events.forEach((ev, i) => {
    const row = ev.querySelector(".row");
    const detail = ev.querySelector(".detail");
    if (!row || !detail) return;
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
      // the room re-frames itself: a door opening or closing moves
      // the page's ground (the section re-measures, browsers
      // anchor-correct, snap re-settles) — so the scroll glides back
      // to the archive's own stop, the framing the reader started
      // from, instead of resting wherever the shift left it
      const room = document.getElementById("events");
      if (room) {
        const top = Math.min(room.offsetTop,
          document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
      }
    });
  });
});

// the founders, kalinsky-fashion: a centered stack of five — the
// standing portrait scales and takes the light, the bracketed name
// and introduction swap in place beneath. clicking selects
// directly; the page's own scroll walks the stack (the pager routes
// its turns here while this room stands, via DZfounders).
iso(() => {
  const stage = document.querySelector(".kstage");
  if (!stage) return;
  const thumbs = Array.from(stage.querySelectorAll(".kthumb"));
  const caps = Array.from(stage.querySelectorAll(".kcap"));
  if (!thumbs.length) return;
  let at = 0;
  const set = (n) => {
    at = Math.max(0, Math.min(thumbs.length - 1, n));
    thumbs.forEach((t, k) => t.classList.toggle("active", k === at));
    caps.forEach((c, k) => c.classList.toggle("active", k === at));
  };
  thumbs.forEach((t, k) => t.addEventListener("click", () => set(k)));
  // the caption RESERVE, made honest: sized to the tallest caption's
  // real height instead of a guessed constant — no invisible slack
  // below the text, so the block's center IS the visible center and
  // both the pager's stop and mobile's snap land the room true
  const reserve = stage.querySelector(".kcaps");
  const fit = () => {
    let h = 0;
    caps.forEach((c) => { h = Math.max(h, c.offsetHeight); });
    if (reserve && h) reserve.style.minHeight = h + "px";
  };
  fit();
  window.addEventListener("resize", fit, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.DZfounders = {
    can: (dir) => (dir > 0 ? at < thumbs.length - 1 : at > 0),
    walk: (dir) => set(at + dir),
  };
  set(0);
});

// the ring, shared: a looping strip of cards. two clones stand past
// each end; after every wrap the track teleports one full turn back
// with no transition — the frame is pixel-identical, so the jump
// cannot be seen and one direction loops forever. the standing card
// takes the light, its caption crossfades in below, and a meta line
// (if the stage carries one) reads the standing card's year and
// count. arrows, sideways trackpad and touch all walk the same way:
// one gesture, one card. vertical input passes through untouched.
iso(() => {
  document.querySelectorAll(".ring-stage").forEach((stage) => {
    const track = stage.querySelector(".ring-track");
    if (!track) return;
    const real = Array.from(track.querySelectorAll(".rcard"));
    const caps = stage.querySelectorAll(".ring-cap");
    const meta = stage.querySelector(".ring-meta");
    const N = real.length;
    const OFF = 2;
    if (N < 3) return;
    real.forEach((c, k) => { c.dataset.real = k; });
    const cloneOf = (k) => {
      const c = real[k].cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.dataset.real = k;
      return c;
    };
    track.insertBefore(cloneOf(N - 2), real[0]);
    track.insertBefore(cloneOf(N - 1), real[0]);
    track.appendChild(cloneOf(0));
    track.appendChild(cloneOf(1));
    const all = Array.from(track.querySelectorAll(".rcard"));
    let pos = OFF + Number(track.dataset.start || 0);
    let busy = false;
    let guard = null;
    const step = () => all[0].getBoundingClientRect().width + 24;
    const place = (animate) => {
      track.style.transition = animate ? "" : "none";
      track.style.transform =
        "translateX(" + (-(pos * step() + step() / 2 - 12)) + "px)";
      if (!animate) void track.offsetWidth; // commit the jump untransitioned
    };
    const settle = () => {
      if (pos >= N + OFF) { pos -= N; place(false); }
      if (pos < OFF) { pos += N; place(false); }
      busy = false;
    };
    const dress = () => {
      const r = ((pos - OFF) % N + N) % N;
      all.forEach((c) => c.classList.toggle("active", Number(c.dataset.real) === r));
      caps.forEach((c, k) => c.classList.toggle("active", k === r));
      if (meta && real[r].dataset.meta) meta.innerHTML = real[r].dataset.meta;
    };
    const walk = (dir) => {
      if (busy) return;
      busy = true;
      pos += dir;
      place(true);
      dress();
      // backstop: if the transition's end never reports (hidden tab,
      // interrupted paint), the ring must not stay frozen
      clearTimeout(guard);
      guard = setTimeout(settle, 750);
    };
    track.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;
      clearTimeout(guard);
      settle();
    });
    window.addEventListener("resize", () => place(false), { passive: true });
    place(false);
    dress();
    stage.querySelectorAll(".ring-arrow").forEach((b) => {
      b.addEventListener("click", () => walk(Number(b.dataset.dir)));
    });
    // trackpad: sideways-dominant wheel input belongs to the strip —
    // claimed before the page's own wheel pager sees it (and before
    // the browser reads it as back/forward)
    let hAcc = 0;
    let hLock = false;
    let hQuiet = null;
    stage.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(hQuiet);
      hQuiet = setTimeout(() => { hLock = false; hAcc = 0; }, 250);
      if (hLock) return;
      hAcc += e.deltaX;
      if (Math.abs(hAcc) < 40) return;
      hLock = true;
      walk(hAcc > 0 ? 1 : -1);
      hAcc = 0;
    }, { passive: false });
    // touch: a sideways drag is the same gesture by hand
    let tx = null;
    let ty = null;
    stage.addEventListener("touchstart", (e) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchmove", (e) => {
      if (tx === null) return;
      if (Math.abs(e.touches[0].clientX - tx) >
          Math.abs(e.touches[0].clientY - ty)) e.preventDefault();
    }, { passive: false });
    stage.addEventListener("touchend", (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      tx = null;
      ty = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        walk(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  });
});

// the knife belongs to the RESTING landing only: the first few px of
// scroll dissolve it, so no mid-transit frame ever shows a line
// floating under freed letters. (the "emerge through the blade"
// beat is sacrificed on purpose — a frozen half-state mid-scroll
// reads as broken, and the traded moment lasted three frames.)
// paging back, it returns only at the very end of the transit, as
// the page settles home. a single rAF-throttled scroll listener
// covers every scroll path (wheel pager, touch snap, reduced-motion
// native); the initial call lets deep links (#events) arrive
// floorless.
iso(() => {
  const floor = document.querySelector(".floor");
  if (!floor) return;
  let raf = null;
  // 24px: still far ahead of anything the landing hides (the
  // statement only ever surfaced ~350px into a transit), but loose
  // enough that iOS snap settling a few fractional px off zero
  // still counts as HOME — a 4px threshold left the state stuck
  // and the statement invisible at rest.
  const update = () => {
    raf = null;
    document.body.classList.toggle("off-landing", window.scrollY > 24);
  };
  // the settle re-check: snap's last micro-adjustment doesn't always
  // fire a scroll event, so the final state is confirmed once the
  // scroll has been quiet for a beat — the class can never strand.
  let quiet = null;
  const poke = () => {
    if (!raf) raf = requestAnimationFrame(update);
    clearTimeout(quiet);
    quiet = setTimeout(update, 180);
  };
  window.addEventListener("scroll", poke, { passive: true });
  window.addEventListener("resize", poke, { passive: true });
  update();
});

// the lightbox: any photograph opens full-screen in its own light —
// ungraded, the room's one bright object. click or esc closes; the
// page behind holds perfectly still. empty frames open nothing.
iso(() => {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Photograph");
  const big = document.createElement("img");
  big.alt = "";
  box.appendChild(big);
  document.body.appendChild(box);
  const close = () => {
    box.classList.remove("open");
    window.DZlightOpen = false;
  };
  document.addEventListener("click", (e) => {
    const im = e.target.closest && e.target.closest("img.photo");
    if (!im) return;
    // founder thumbs are selection controls only — they never open
    // the lightbox; the full-screen light belongs to the wall
    if (im.closest(".kthumb")) return;
    big.src = im.src;
    big.alt = im.alt || "";
    box.classList.add("open");
    window.DZlightOpen = true;
  });
  box.addEventListener("click", close);
  box.addEventListener("wheel", (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, { passive: false });
  box.addEventListener("touchmove", (e) => { e.preventDefault(); }, { passive: false });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && box.classList.contains("open")) close();
  });
});

// photos are proof: when a slot's assets.json url is filled in, the
// quiet placeholder becomes the documentary photograph
fetch("assets.json")
  .then((response) => response.ok ? response.json() : null)
  .then((assets) => {
    if (!assets || !Array.isArray(assets.images)) return;
    const imagesById = new Map(assets.images.map((image) => [image.id, image]));
    document.querySelectorAll("div.photo[data-asset-id]").forEach((slot) => {
      const image = imagesById.get(slot.dataset.assetId);
      if (!image || !image.url) return;
      const img = document.createElement("img");
      img.className = slot.className; // the slot's dress carries over (photo, f-photo)
      img.src = image.url;
      img.alt = image.alt || "";
      img.loading = "lazy";
      slot.replaceWith(img);
    });
  })
  .catch(() => {});

// the ledger's rise, for browsers that can't scroll-drive it in CSS:
// an observer lifts each entry once as it enters. without JS (or with
// reduced motion) the ledger simply stands visible.
iso(() => {
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
  document.querySelectorAll(".event, .cell").forEach((event) => {
    event.classList.add("pre-reveal");
    observer.observe(event);
  });
});

