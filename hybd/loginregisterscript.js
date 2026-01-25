document.querySelectorAll('.flip-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.card-container').classList.toggle('flip');
    });
});
