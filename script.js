const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const line1 = document.getElementById("manifesto-line1");
const line2 = document.getElementById("manifesto-line2");
const caretEl = document.getElementById("manifesto-caret");
const thesisEl = document.getElementById("manifesto-thesis");
const text1 = line1.textContent;
const text2 = line2.textContent;

function rand(min, max) { return min + Math.random() * (max - min); }

function finishHeadline() {
  thesisEl.classList.remove("is-waiting");
  caretEl.classList.add("is-done");
}

const titleEl = document.querySelector(".manifesto-title");
const GLIDE = "transform .6s cubic-bezier(.165,.84,.44,1)";
const FADE = "opacity .9s ease .5s";

// caret lives outside the text flow: it follows the line ends by measurement,
// snapping per keystroke, gliding only on the enter
function placeCaret(lineEl, glide) {
  const t = titleEl.getBoundingClientRect();
  const r = lineEl.getBoundingClientRect();
  const x = r.right - t.left + 10;
  const y = r.top - t.top + (r.height - caretEl.offsetHeight) / 2;
  caretEl.style.transition = glide ? GLIDE + ", " + FADE : FADE;
  caretEl.style.transform = "translate(" + x + "px, " + y + "px)";
}

function typeInto(el, text, onDone) {
  caretEl.classList.add("is-typing");
  let i = 0;
  const step = () => {
    i++;
    el.textContent = text.slice(0, i);
    placeCaret(el, false);
    if (i >= text.length) {
      caretEl.classList.remove("is-typing");
      onDone();
      return;
    }
    setTimeout(step, text[i] === " " ? rand(430, 560) : rand(50, 100));
  };
  step();
}

if (reducedMotion) {
  caretEl.style.display = "none";
  caretEl.classList.add("is-done");
} else {
  line1.textContent = "\u200B";
  line2.textContent = "\u200B";
  thesisEl.classList.add("is-waiting");
  placeCaret(line1, false);
  setTimeout(() => {
    typeInto(line1, text1, () => {
      // the enter: hold and breathe, then the caret glides down to the empty line
      setTimeout(() => {
        placeCaret(line2, true);
        setTimeout(() => {
          typeInto(line2, text2, () => setTimeout(finishHeadline, 700));
        }, 700);
      }, 900);
    });
  }, 800);
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

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.3 });
document.querySelectorAll(".credits").forEach((el) => observer.observe(el));

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
