const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lfText = document.getElementById("lf-text");
const lfCaret = document.getElementById("lf-caret");
const lfThesis = document.getElementById("lf-thesis");
const headline = lfText.textContent;

function rand(min, max) { return min + Math.random() * (max - min); }

function finishHeadline() {
  lfThesis.classList.remove("is-waiting");
  lfCaret.classList.add("is-done");
}

if (reducedMotion) {
  lfCaret.classList.add("is-done");
} else {
  lfText.textContent = "";
  lfThesis.classList.add("is-waiting");
  let i = 0;
  const typeHeadline = () => {
    i++;
    lfText.textContent = headline.slice(0, i);
    if (i >= headline.length) {
      setTimeout(finishHeadline, 600);
      return;
    }
    const next = headline[i];
    setTimeout(typeHeadline, next === " " ? rand(130, 230) : rand(50, 100));
  };
  setTimeout(typeHeadline, 800);
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
