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

function typeInto(el, text, onDone) {
  caretEl.classList.add("is-typing");
  let i = 0;
  const step = () => {
    i++;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      caretEl.classList.remove("is-typing");
      onDone();
      return;
    }
    setTimeout(step, text[i] === " " ? rand(430, 560) : rand(50, 100));
  };
  step();
}

// FLIP: move the caret to the next line and let it glide there
function dropCaret(afterEl) {
  const from = caretEl.getBoundingClientRect();
  afterEl.after(caretEl);
  const to = caretEl.getBoundingClientRect();
  caretEl.style.transition = "none";
  caretEl.style.transform = "translate(" + (from.left - to.left) + "px, " + (from.top - to.top) + "px)";
  requestAnimationFrame(() => {
    caretEl.style.transition = "transform .5s cubic-bezier(.16,1,.3,1)";
    caretEl.style.transform = "";
  });
  setTimeout(() => {
    caretEl.style.transition = "";
    caretEl.style.transform = "";
  }, 550);
}

if (reducedMotion) {
  caretEl.classList.add("is-done");
} else {
  line1.textContent = "";
  line2.textContent = "";
  thesisEl.classList.add("is-waiting");
  setTimeout(() => {
    typeInto(line1, text1, () => {
      // the enter: hold and breathe, then the caret glides down to the empty line
      setTimeout(() => {
        dropCaret(line2);
        setTimeout(() => {
          typeInto(line2, text2, () => setTimeout(finishHeadline, 700));
        }, 560);
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
