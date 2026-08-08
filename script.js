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
// the reading, the wall, the founders — each transit a time-boxed
// tween. momentum is recognized by its shape and swallowed, so a
// flick turns exactly one page while a held scroll travels on; on
// touch the same tween is driven by hand (the authored block below).
// reduced motion keeps native scrolling; css snap stands only as
// the no-JS fallback.
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
      // the stop has a FLOOR at the room's own threshold: on a tall
      // window, true centering would land the scroll a little above
      // the section and the wall's last row bled into the room —
      // the founders stand alone, so the stop never climbs past the
      // section's top edge
      const threshold = founders.getBoundingClientRect().top + window.scrollY;
      pts.push(Math.max(0, Math.min(Math.max(centered, threshold), maxScroll())));
    }
    return pts;
  }
  let began = 0;
  // the transit's clock is PROPORTIONAL to its distance, not fixed: a
  // fixed span made every room take the same second, so the short hop
  // into the reading (.58 of a screen) and the long one into the
  // archive (1.03) ran at different speeds — the hand calibrated on
  // the first flick and the second lurched at nearly twice the peak.
  // one velocity for the whole page: a full screen still takes the
  // old 1100ms, and every other room is timed off that same rate.
  // the floor keeps a short hop from snapping; the ceiling keeps a
  // tall screen's long haul from dragging.
  const RATE = 1100; // ms per screen of travel
  let dur = RATE;
  const span = (dist) =>
    Math.max(550, Math.min(1250, RATE * (dist / window.innerHeight)));
  // WHO is still on the wheel when a transit lands? a hand that has
  // kept pushing rides on to the next room; a flick's dead momentum
  // must not. the two are told apart by SHAPE, not by size: a held
  // scroll holds near its own peak, while a tail is only ever falling
  // away from it. an absolute floor of 18 answered this before, and
  // it was wrong twice over — a gentle deliberate drag (14px a notch)
  // sat under the floor and died after one room, while a flick's tail
  // was still over it and stole a second (the 2->4 slip: one gesture,
  // two rooms). `spent` is the tail's own confession, already kept by
  // the wheel handler; the ratio is the rest of the answer.
  const chaining = () =>
    !spent && performance.now() - lastFlowT < 140 &&
    flow > Math.max(8, peak * .45);
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
    const t = Math.min(1, (now - began) / dur);
    const k = 1 - Math.pow(1 - t, 4);
    window.scrollTo(0, from + (target - from) * k);
    if (t === 1) {
      target = null;
      raf = null;
      acc = 0;
      if (pageDir !== 0 && chaining()) {
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
    from = window.scrollY;
    const pts = points();
    const here = target === null ? window.scrollY : target;
    let cur = 0;
    for (let i = 1; i < pts.length; i++) {
      if (Math.abs(pts[i] - here) < Math.abs(pts[cur] - here)) cur = i;
    }
    const next = Math.max(0, Math.min(pts.length - 1, cur + dir));
    target = pts[next];
    // the clock is set once the distance is known — and `began` with
    // it, so a turn that interrupts a glide starts its own span clean
    dur = span(Math.abs(target - from));
    began = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  };
  // section 4 is a WALK, not a single stop: while the founders room
  // stands, a turn steps the stack (one flick, one founder — the
  // same gesture discipline as a page) and the room releases only
  // past its ends. a HELD scroll keeps stepping on its own beat.
  let walkTimer = null;
  // one question, asked from two places (the wheel's turn and the
  // horizontal keys): is the founders' room the one on stage?
  const founderRoomStands = () => {
    const f = document.getElementById("founders");
    const block = f && (f.querySelector(".kstage") || f);
    const br = block && block.getBoundingClientRect();
    return !!(br &&
      Math.abs(br.top + br.height / 2 - window.innerHeight / 2) <
        window.innerHeight * .35);
  };
  const turn = (dir) => {
    const k = window.DZfounders;
    const atFounders = founderRoomStands();
    if (k && atFounders && k.can(dir)) {
      tail = true;
      spent = false;
      peak = 0;
      flow = 0;
      pageDir = dir;
      k.walk(dir);
      clearTimeout(walkTimer);
      walkTimer = setTimeout(() => {
        if (chaining()) turn(dir);
      }, 500);
      return;
    }
    // the fifth founder is the page's floor: downward input past the
    // last of the stack goes nowhere at all — no drift, no no-op
    // glide. only upward, past the first, does the room release.
    if (atFounders && dir > 0) return;
    page(dir);
  };
  // inside the archive the wheel pans the WALL first — the grid
  // scrolls while it has room in the gesture's direction, and only
  // at its edge does the page take over (the same yield the touch
  // path gives below). without this, a short window hides the
  // wall's depth: every notch turned the room instead.
  //
  // WHERE the archive stands is answered from a cache kept by the
  // page's own scroll, never measured inside the wheel handler: a
  // getBoundingClientRect per notch forces layout on the hottest
  // path there is.
  const wall = document.querySelector(".wall");
  let atEvents = false;
  const placeWall = () => {
    if (!wall) return;
    const r = wall.getBoundingClientRect();
    const mid = window.innerHeight / 2;
    atEvents = r.top <= mid && r.bottom >= mid;
  };
  let placeRaf = null;
  const pokePlace = () => {
    if (placeRaf) return;
    placeRaf = requestAnimationFrame(() => { placeRaf = null; placeWall(); });
  };
  window.addEventListener("scroll", pokePlace, { passive: true });
  window.addEventListener("resize", pokePlace, { passive: true });
  placeWall();
  // a SLIVER of depth is not a room to pan. at common laptop heights
  // the grid overhangs its frame by only a few dozen px, and taking a
  // whole gesture to nudge the wall 33px reads as a dead flick — the
  // page simply refused to turn. below the sill the remainder is
  // closed at once (nothing stays unreachable) and the gesture goes
  // on to turn the page, as the hand plainly meant it to.
  const SILL = 48;
  const wallPan = (dy) => {
    if (!wall || !atEvents) return false;
    const room = dy > 0
      ? wall.scrollHeight - wall.clientHeight - wall.scrollTop
      : wall.scrollTop;
    if (room < 1) return false;
    if (room < SILL) { wall.scrollTop += dy > 0 ? room : -room; return false; }
    wall.scrollTop += dy;
    return true;
  };
  // a gesture that has spent itself panning the wall may not ALSO
  // turn the page when the wall runs out — the leftover momentum of
  // a flick would sail straight into the next room. the lock holds
  // until the input goes quiet or reverses, mirroring the `used`
  // guard the touch path keeps below.
  let panned = false;
  let panDir = 0;
  const resetQuiet = () => {
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => {
      tail = false; spent = false; peak = 0; acc = 0; pageDir = 0;
      panned = false; panDir = 0;
    }, 250);
  };
  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) return; // pinch-zoom stays native
    e.preventDefault();
    // firefox reports wheel deltas in LINES (deltaMode 1, ~3/notch)
    // or PAGES (2), not pixels — unnormalized, the 30px accumulator
    // needed ~10 notches per page-turn there. one delta currency.
    const dy = e.deltaY *
      (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    // pushing the other way is a new intent, not the old gesture's
    // tail: the wall's lock lifts at once so the room can be left
    if (panned && dy * panDir < 0) { panned = false; panDir = 0; }
    // the archive pans under the wheel before the page turns — but
    // never mid-transit (raf), and never on a page-turn's own tail
    if (!tail && !raf && wallPan(dy)) {
      // a pan is not a page-turn: the gesture spends itself in the
      // grid, and whatever it accumulated toward a turn is void
      panned = true;
      panDir = dy > 0 ? 1 : -1;
      acc = 0;
      resetQuiet();
      return;
    }
    // spent in the wall and now at its edge: the room holds until a
    // fresh push arrives — momentum alone never turns the page
    if (panned) { resetQuiet(); return; }
    resetQuiet();
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
      // a fresh push after a spent tail, measured against the gesture
      // that came before it rather than a fixed 40: a slow reader's
      // whole scroll is quieter than one flick's leftovers, and a flat
      // 40 locked them out of the page entirely. momentum only ever
      // falls, so it cannot climb back over its own share.
      if (a < Math.max(12, peak * .35)) return;
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
    // the founders' row answers to the HORIZONTAL keys: while that
    // room stands, left and right walk the line of five
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const k = window.DZfounders;
      const d = e.key === "ArrowRight" ? 1 : -1;
      if (k && founderRoomStands() && k.can(d)) {
        e.preventDefault();
        k.walk(d);
      }
      return;
    }
    const down = e.key === "ArrowDown" || e.key === "PageDown" ||
                 (e.key === " " && !e.shiftKey);
    const up = e.key === "ArrowUp" || e.key === "PageUp" ||
               (e.key === " " && e.shiftKey);
    if (!down && !up) return;
    e.preventDefault();
    // keys walk the wall's depth too, one measured step at a time —
    // they carry no momentum, so they need no lock, only the same
    // courtesy of not fighting a transit already in flight
    if (!raf && wallPan(down ? 160 : -160)) return;
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
      wallEl = e.target.closest && e.target.closest(".wall");
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (sy === null) return;
      const dy = sy - e.touches[0].clientY;
      const dx = sx - e.touches[0].clientX;
      // taps and sideways stay native (and clickable)
      if (Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(dx)) return;
      // inside the wall: the grid pans itself while it has room in
      // the gesture's direction; at its edge, the page takes over
      if (wallEl) {
        // the same sill the wheel keeps: a sliver left in the grid is
        // not worth a swipe, and the finger's meaning is the page
        const room = dy > 0
          ? wallEl.scrollHeight - wallEl.clientHeight - wallEl.scrollTop
          : wallEl.scrollTop;
        if (room >= SILL) return; // the grid has real depth: it pans itself
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

// the founders: five abreast, every name and post in view at a
// glance — the standing portrait takes the light and only the
// introduction swaps in place beneath. clicking selects directly;
// the arrow keys walk the row, and the page's own scroll steps it
// too (the pager routes its turns here while this room stands,
// via DZfounders).
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

// photos are proof: when a slot's assets.json url is filled in, the
// quiet placeholder becomes the documentary photograph.
//
// each photograph's own TREATMENT travels with it in assets.json —
// `tone: "color"` for the few that keep their color, `focus` for
// where a crop should sit, `grade` for a plate background that needs
// a deeper dark. the stylesheet holds what those words MEAN; the
// manifest holds which photograph gets which. (they were once CSS
// rules keyed to exact alt text, so editing a caption silently broke
// a crop.)
fetch("assets.json")
  .then((response) => response.ok ? response.json() : null)
  .then((assets) => {
    if (!assets || !Array.isArray(assets.images)) return;
    const imagesById = new Map(assets.images.map((image) => [image.id, image]));
    const players = [];
    document.querySelectorAll("div.photo[data-asset-id]").forEach((slot) => {
      const image = imagesById.get(slot.dataset.assetId);
      if (!image || !image.url) return;
      const media = image.type === "video";
      const el = document.createElement(media ? "video" : "img");
      el.className = slot.className; // the slot's dress carries over (photo, f-photo)
      el.src = image.url;
      if (media) {
        // a decorative loop: the figcaption already names the event,
        // and the footage must not announce itself a second time
        el.setAttribute("aria-hidden", "true");
        // the property is what the autoplay policy reads; the
        // attribute is what older WebKit checks at load
        el.muted = true;
        el.setAttribute("muted", "");
        el.loop = true;
        el.playsInline = true;
        // the headers only: enough that play() is not starting from
        // a standing stop, cheap enough that arriving costs nothing.
        // the frames themselves still wait for the room.
        el.preload = "metadata";
        if (image.poster) el.poster = image.poster;
        players.push(el);
      } else {
        el.alt = image.alt || "";
        // lazy only until the landing has had its moment: the warm
        // pass below lifts it. see there for why.
        el.loading = "lazy";
      }
      if (image.tone === "color") el.classList.add("in-color");
      if (image.grade) el.dataset.grade = image.grade;
      // the crop is handed to the stylesheet as a value, not applied as
      // one: a narrow phone tile is a different frame than a wide desk
      // one, and `focusMobile` is where a photograph asks for a second
      // crop there. an inline object-position could not be answered back.
      if (image.focus) el.style.setProperty("--focus", image.focus);
      if (image.focusMobile) el.style.setProperty("--focus-mobile", image.focusMobile);
      slot.replaceWith(el);
    });
    // the archive is WARMED, never lazy-loaded on approach. lazy put
    // every frame's download and decode inside the one gesture that
    // enters the room — the transit into the wall was where the whole
    // archive arrived, and a first visit froze there (measured: single
    // frames of 1.4s, 1.0s, 0.4s inside a 1.1s glide). the bytes are
    // instead fetched in the quiet AFTER the landing has spoken: the
    // statement types itself over the first ~2.2s and owns the network
    // until then, and by the time a hand reaches the archive the
    // frames are already in hand. (the footage keeps its own rule —
    // it wakes a screen ahead, below, and is untouched by this.)
    const warmWall = () => {
      document.querySelectorAll(".wall img").forEach((img) => {
        if (img.complete) return;
        img.loading = "eager";
        // the attribute flip alone resumes a pending lazy load in
        // current engines; the standalone request is the guarantee
        // everywhere else — same URL, so it costs one cache entry
        new Image().src = img.currentSrc || img.src;
      });
    };
    // whichever comes first: the landing's quiet, or a reader who is
    // already moving (a deep link, a fast hand) and needs them NOW
    const warmTimer = setTimeout(warmWall, 2400);
    const warmOnMove = () => {
      if (window.scrollY <= 24) return; // a hair off zero is still home
      window.removeEventListener("scroll", warmOnMove);
      clearTimeout(warmTimer);
      warmWall();
    };
    window.addEventListener("scroll", warmOnMove, { passive: true });
    // the footage wakes only where it is SEEN: on screen it plays, off
    // screen it stops. a reader who asked motion to stop gets the
    // poster frame and nothing moves at all.
    if (!players.length || reducedMotion) return;
    if (!("IntersectionObserver" in window)) {
      players.forEach((v) => { const p = v.play(); if (p) p.catch(() => {}); });
      return;
    }
    // the footage is woken BEFORE it is looked at: a screen of
    // margin either side, and any sliver counts. by the time the
    // frame is actually in view it is already running — waiting for
    // it to be a fifth visible and only then starting cold read as
    // a stall every time.
    const watch = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          const p = v.play();
          if (p) p.catch(() => {}); // autoplay refused: the poster stands
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: "100% 0px", threshold: 0 });
    players.forEach((v) => watch.observe(v));
  })
  .catch(() => {});
