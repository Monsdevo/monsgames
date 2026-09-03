const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const narrowNavigation = window.matchMedia("(max-width: 700px)");
document.documentElement.classList.add("enhanced");

function closeMenu(returnFocus = false) {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.textContent = "Menu";
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const opening = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(opening));
  menuButton.textContent = opening ? "Close" : "Menu";
});
navigation.addEventListener("click", event => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") closeMenu(true);
});
document.addEventListener("click", event => {
  if (!event.target.closest(".masthead")) closeMenu();
});
narrowNavigation.addEventListener("change", () => closeMenu());

const switches = [...document.querySelectorAll(".cue-switch")];
const announcement = document.querySelector("#counter-announcement");
let selectedCue = null;
function markCounter(cue) {
  for (const button of switches) button.closest(".cue").classList.toggle("is-linked", button.dataset.cue === cue);
  for (const response of document.querySelectorAll("[data-response]")) response.classList.toggle("is-linked", response.dataset.response === cue);
}
for (const button of switches) {
  button.addEventListener("pointerenter", () => markCounter(button.dataset.cue));
  button.addEventListener("pointerleave", () => markCounter(selectedCue));
  button.addEventListener("focus", () => markCounter(button.dataset.cue));
  button.addEventListener("blur", () => markCounter(selectedCue));
  button.addEventListener("click", () => {
    selectedCue = selectedCue === button.dataset.cue ? null : button.dataset.cue;
    for (const item of switches) item.setAttribute("aria-pressed", String(item.dataset.cue === selectedCue));
    markCounter(selectedCue);
    const response = selectedCue && document.querySelector(`[data-response="${selectedCue}"]`);
    announcement.textContent = response ? `The Haunts’ counter-move: ${response.textContent.trim()}` : "Counter-move highlight cleared.";
  });
}
