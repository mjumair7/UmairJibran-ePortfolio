"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector(".nav-links");

function closeMenu(returnFocus = false) {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  if (returnFocus) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menu?.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  if (open) menu?.querySelector("a")?.focus();
});
menu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") closeMenu(true);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

const progress = document.querySelector(".reading-progress span");
let progressQueued = false;
function updateProgress() {
  progressQueued = false;
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
}
function queueProgress() {
  if (progressQueued) return;
  progressQueued = true;
  requestAnimationFrame(updateProgress);
}
window.addEventListener("scroll", queueProgress, { passive: true });
window.addEventListener("resize", queueProgress);
queueProgress();

// A small depth shift keeps the real event photos feeling like objects in the
// field archive. It is limited to visible images and disabled for reduced motion.
if (!reduceMotion.matches) {
  const photos = [...document.querySelectorAll("[data-photo-depth]")];
  let photoFrame = 0;
  function updatePhotoDepth() {
    photoFrame = 0;
    const viewportMiddle = window.innerHeight / 2;
    photos.forEach(photo => {
      const box = photo.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      const distance = (box.top + box.height / 2 - viewportMiddle) / window.innerHeight;
      const shift = Math.max(-16, Math.min(16, -distance * 24));
      photo.style.setProperty("--photo-y", `${shift.toFixed(1)}px`);
    });
  }
  function queuePhotoDepth() {
    if (!photoFrame) photoFrame = requestAnimationFrame(updatePhotoDepth);
  }
  window.addEventListener("scroll", queuePhotoDepth, { passive: true });
  window.addEventListener("resize", queuePhotoDepth);
  queuePhotoDepth();
}

// Only hide sections when the browser can reveal them again.
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  document.documentElement.classList.add("js-motion");
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: .06 });
  document.querySelectorAll("[data-reveal]").forEach(element => revealObserver.observe(element));
}

const routeCopy = document.querySelector("[data-route-copy]");
const routeText = {
  "01": "Start with the actual input: a signal, a user need, or the thing that keeps going wrong.",
  "02": "Build a small real slice so the constraint shows up in working code or hardware.",
  "03": "Try the missing frame, bad packet, awkward user path, and second run.",
  "04": "Leave an explanation the next person can follow without standing beside me."
};
document.querySelectorAll("[data-route]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-route]").forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    document.querySelector(".system-figure")?.setAttribute("data-active", button.dataset.route);
    if (routeCopy) routeCopy.textContent = routeText[button.dataset.route] || "";
  });
});

// The instrument surfaces respond to a pointer only when there is a precise
// pointer and motion is allowed. Touch and keyboard users get the same content.
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion.matches) {
  document.querySelectorAll("[data-depth-scene]").forEach(scene => {
    let frame = 0;
    scene.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse") return;
      const bounds = scene.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scene.style.setProperty("--tilt-x", `${(-y * 3).toFixed(2)}deg`);
        scene.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
      });
    });
    scene.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      scene.style.setProperty("--tilt-x", "0deg");
      scene.style.setProperty("--tilt-y", "0deg");
    });
  });
}

const canDemo = document.querySelector("[data-can-demo]");
if (canDemo) {
  const state = canDemo.querySelector("[data-can-state]");
  const output = canDemo.querySelector("[data-can-output]");
  const detail = canDemo.querySelector("[data-can-detail]");
  const log = canDemo.querySelector("[data-can-log]");
  canDemo.querySelectorAll("[data-can-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const fault = button.dataset.canMode === "fault";
      canDemo.classList.toggle("is-fault", fault);
      canDemo.querySelectorAll("[data-can-mode]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      if (state) state.textContent = fault ? "TIMEOUT / FAIL-SAFE" : "NORMAL FRAMES";
      if (output) output.textContent = fault ? "FAN SAFE OFF" : "FAN 42%";
      if (detail) detail.textContent = fault ? "stale frame rejected" : "fresh frame accepted";
      if (log) log.textContent = fault ? "0x244 / RPM TIMEOUT / ACTUATOR SAFE" : "0x244 / RPM 1240 / CRC OK";
    });
  });
}

const rfDemo = document.querySelector("[data-rf-demo]");
if (rfDemo) {
  const tag = rfDemo.querySelector('[data-rf-tag="2"]');
  const status = tag?.querySelector("span");
  const summary = rfDemo.querySelector("[data-rf-summary]");
  rfDemo.querySelectorAll("[data-rf-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const fault = button.dataset.rfMode === "fault";
      tag?.classList.toggle("is-missing", fault);
      if (status) status.textContent = fault ? "TIMEOUT / RETRY" : "CRC OK";
      if (summary) summary.textContent = fault ? "1 TAG NEEDS REVIEW" : "3 TAGS SEEN";
    });
  });
}

const orders = {
  books: { package: "Mailer M2", steps: "Wrap books · Add bookmark · Print label" },
  gift: { package: "Gift Box G1", steps: "Add insert · Add greeting card · Seal box" },
  bulk: { package: "Carton B3", steps: "Stack books · Add corner pads · Print label" }
};
const orderDemo = document.querySelector("[data-order-demo]");
orderDemo?.querySelector("[data-order-run]")?.addEventListener("click", () => {
  const selected = orderDemo.querySelector("[data-order-select]")?.value;
  const result = orders[selected];
  if (!result) return;
  orderDemo.querySelector("[data-order-package]").textContent = result.package;
  orderDemo.querySelector("[data-order-steps]").textContent = result.steps;
});

// The index follows the case currently in the reading area.
if ("IntersectionObserver" in window) {
  const caseLinks = [...document.querySelectorAll("[data-case-link]")];
  const caseObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    caseLinks.forEach(link => {
      const active = link.dataset.caseLink === visible.target.id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-20% 0px -45% 0px", threshold: [0, .1, .35] });
  document.querySelectorAll(".case-study").forEach(study => caseObserver.observe(study));

  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const navObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => {
      if (link.getAttribute("href") === `#${visible.target.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-18% 0px -60% 0px", threshold: 0 });
  document.querySelectorAll("#work, #lab, #current, #training, #beyond, #contact").forEach(section => navObserver.observe(section));
}
