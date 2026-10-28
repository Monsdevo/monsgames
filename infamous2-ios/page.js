// Progressive enhancement: without JavaScript every capture opens its original.
const dialog = document.querySelector('.lightbox');
const captureLinks = [...document.querySelectorAll('[data-capture]')];

if (dialog && typeof dialog.showModal === 'function' && captureLinks.length) {
  const image = dialog.querySelector('.lightbox-image');
  const title = dialog.querySelector('#lightbox-title');
  const count = dialog.querySelector('.lightbox-count');
  const original = dialog.querySelector('.lightbox-original');
  const status = dialog.querySelector('.lightbox-status');
  const close = dialog.querySelector('.lightbox-close');
  let selected = 0;
  let opener;
  let request = 0;

  const showCapture = index => {
    selected = (index + captureLinks.length) % captureLinks.length;
    const link = captureLinks[selected];
    const figure = link.closest('figure');
    const source = link.querySelector('img');
    const currentRequest = ++request;
    title.textContent = figure.querySelector('h3').textContent;
    count.textContent = `${selected + 1} / ${captureLinks.length}`;
    original.href = link.href;
    image.alt = source.alt;
    status.textContent = 'Loading full-resolution capture…';
    image.onload = () => {
      if (request === currentRequest) status.textContent = '';
    };
    image.onerror = () => {
      if (request === currentRequest) status.textContent = 'The capture could not load. Use “Open original” to try again.';
    };
    image.src = link.href;
    if (image.complete && image.naturalWidth) status.textContent = '';
  };

  captureLinks.forEach((link, index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    opener = link;
    showCapture(index);
    dialog.showModal();
    document.body.classList.add('lightbox-open');
    close.focus();
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-previous').addEventListener('click', () => showCapture(selected - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => showCapture(selected + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); showCapture(selected + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showCapture(selected - 1); }
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    opener?.focus({ preventScroll: true });
  });
}
