(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches) return;

  const line = document.querySelector("[data-token-line]");
  const phrase = line.textContent;
  const fragment = document.createDocumentFragment();
  const tokens = [];
  for (const character of phrase) {
    if (character === " ") {
      fragment.append(" ");
      continue;
    }
    const token = document.createElement("span");
    token.textContent = character;
    token.className = "token-pending";
    tokens.push(token);
    fragment.append(token);
  }
  line.replaceChildren(fragment);

  let next = 0;
  function reveal() {
    if (motion.matches || document.hidden) {
      line.textContent = phrase;
      return;
    }
    tokens[next].className = "token-fresh";
    next += 1;
    if (next < tokens.length) window.setTimeout(reveal, 40);
    else window.setTimeout(() => { line.textContent = phrase; }, 520);
  }
  window.setTimeout(reveal, 180);
})();
