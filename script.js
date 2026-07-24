const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// the statement types itself — lovefrom-fashion: a near-empty page,
// one serif voice, a live caret. the thesis is typed; the caret
// blinks alone through a held pause (the volta, performed in real
// time); then Enter, and the answer types on its own line. when the
// statement ends, the name fades up in the floor: the signature.
(() => {
  const land = document.getElementById("manifesto");
  const line1 = land && land.querySelector(".line1");
  const line2 = land && land.querySelector(".line2");
  const caret = land && land.querySelector(".caret");
  if (!land || !line1 || !line2 || !caret) return;
  const TEXT1 = line1.textContent;
  const TEXT2 = line2.textContent;
  const signed = () => land.classList.add("signed");

  // deep links and reduced motion read the finished page
  if (reducedMotion || location.hash) {
    signed();
    return;
  }

  // the lines are TYPEWRITER BOXES: each line's final width is
  // measured up front and fixed, left-aligned inside the centered
  // column. text builds left-to-right like a real carriage —
  // nothing re-centers per keystroke — and the carriage return
  // lands exactly at the new line's left margin. the finished
  // composition is pixel-identical to centered text.
  function fit() {
    const cs = getComputedStyle(line1);
    const c = fit.ctx || (fit.ctx = document.createElement("canvas").getContext("2d"));
    c.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    if ("letterSpacing" in c) c.letterSpacing = cs.letterSpacing;
    [[line1, TEXT1], [line2, TEXT2]].forEach(([el, t]) => {
      el.style.width = "min(" + Math.ceil(c.measureText(t).width + 2) + "px, 100%)";
      el.style.margin = "0 auto";
      el.style.textAlign = "left";
    });
  }
  fit();
  window.addEventListener("resize", fit);

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
    caret.style.visibility = "visible";
    signed();
  };

  // ---- the scene, boarded as an animator would ----
  // 0.4s  empty stage: black. let the audience arrive.
  // 0.4s  the CHARACTER enters: the caret appears, blinks once —
  //       someone is here, about to speak.
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
  // ~6.3s the period; one exhale blink; and the NAME rises at the
  //       floor — heavy, slow-settling, built from the ground up.
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
    setTimeout(() => {                  // …blinks once, then speaks
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
            type(line2, TEXT2, 0, true, () => setTimeout(signed, 1000));
          }, 830);
        }, 180);
      });
    }, 600);
  }, 400);
})();

// the page scrolls the way the reference does: wheel input gathers
// into a target and the view eases toward it — Lenis-style, lerp
// .045 with ticks at .8 — so arriving anywhere is a deliberate act.
// touch keeps the platform's own physics; reduced motion keeps
// native scrolling entirely.
(() => {
  if (reducedMotion) return;
  let target = null;
  let raf = null;
  let last = null;
  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;
  function tick(now) {
    const dt = last === null ? 16.7 : Math.min(50, now - last);
    last = now;
    const cur = window.scrollY;
    const d = target - cur;
    if (Math.abs(d) < .5) {
      window.scrollTo(0, target);
      target = null;
      last = null;
      raf = null;
      return;
    }
    // the reference's lerp .045 per 60fps frame, held at any framerate
    window.scrollTo(0, cur + d * (1 - Math.pow(1 - .045, dt / 16.7)));
    raf = requestAnimationFrame(tick);
  }
  // the page's two composed readings (the landing, and the
  // name-at-the-top view marked by .snap-2): when the wheel goes
  // quiet, the eased scroll settles onto the nearest reading if one
  // is within reach — the lerp glides in, so arriving feels chosen,
  // not forced. past the readings, the scroll stays free.
  let settleTimer = null;
  function settle() {
    if (target === null) return;
    const marker = document.querySelector(".snap-2");
    const points = [0];
    if (marker) points.push(marker.getBoundingClientRect().top + window.scrollY);
    const vh = window.innerHeight;
    for (const p of points) {
      if (Math.abs(target - p) < vh * .28) {
        target = p;
        if (!raf) raf = requestAnimationFrame(tick);
        break;
      }
    }
  }
  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) return; // pinch-zoom stays native
    e.preventDefault();
    const from = target === null ? window.scrollY : target;
    target = Math.max(0, Math.min(maxScroll(), from + e.deltaY * .8));
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 170);
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: false });
})();

// the accordion: one room open at a time. opening a row closes the
// others; opening an open row simply closes the ledger back to rest.
(() => {
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
    });
  });
})();

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
      img.className = "photo";
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
  document.querySelectorAll(".event").forEach((event) => {
    event.classList.add("pre-reveal");
    observer.observe(event);
  });
})();
