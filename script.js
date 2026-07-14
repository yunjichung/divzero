const phrases = [
  "the risks I take",
  "the standards I accept",
  "the scale of what I believe is possible",
  "my baseline",
  "my ambition",
  "my influence"
];
const card = document.getElementById("card");
const form = document.getElementById("bar");
const input = document.getElementById("goal-input");
const ghost = document.getElementById("ghost");
const ghostText = document.getElementById("ghost-text");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let phrase = 0;
let char = 0;
let deleting = false;
let done = false;

function rand(min, max) { return min + Math.random() * (max - min); }

function typeLoop() {
  if (done) return;
  if (document.activeElement === input || input.value) {
    ghost.classList.remove("is-typing");
    setTimeout(typeLoop, 400);
    return;
  }
  const current = phrases[phrase];
  ghostText.textContent = current.slice(0, char);
  if (deleting) {
    ghost.classList.add("is-typing");
    char--;
    if (char < 0) {
      deleting = false;
      phrase = (phrase + 1) % phrases.length;
      char = 0;
      ghost.classList.remove("is-typing");
      setTimeout(typeLoop, rand(350, 550));
      return;
    }
    setTimeout(typeLoop, rand(18, 34));
  } else {
    ghost.classList.add("is-typing");
    char++;
    if (char > current.length) {
      deleting = true;
      ghost.classList.remove("is-typing");
      setTimeout(typeLoop, rand(1600, 2300));
      return;
    }
    const justTypedSpace = current[char - 1] === " ";
    setTimeout(typeLoop, justTypedSpace ? rand(140, 240) : rand(38, 92));
  }
}

function engage() {
  form.classList.toggle("is-engaged", document.activeElement === input || Boolean(input.value));
}

function submit() {
  if (done || !input.value.trim()) return;
  done = true;
  input.readOnly = true;
  input.blur();
  card.classList.remove("state-typing");
  card.classList.add("state-done");
}

input.addEventListener("focus", engage);
input.addEventListener("blur", engage);
input.addEventListener("input", () => {
  engage();
  if (done) return;
  card.classList.toggle("state-typing", Boolean(input.value.trim()));
});
form.addEventListener("submit", (e) => { e.preventDefault(); submit(); });

if (reducedMotion) {
  ghostText.textContent = phrases[0];
} else {
  setTimeout(typeLoop, 900);
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
