function initWorksPage() {
    console.log('Works page инициализирована');
    initWorkCards();
}

function initWorkCards() {
    const workCards = document.querySelectorAll('.work-card');

    workCards.forEach(card => {
        const image = card.querySelector('.work-image img');
        if (image) {
            image.style.transition = 'transform 0.5s ease';
        }

        const workImage = card.querySelector('.work-image');
        if (workImage) {
            workImage.addEventListener('mouseenter', () => {
                const img = workImage.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1.05)';
                }
            });

            workImage.addEventListener('mouseleave', () => {
                const img = workImage.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1)';
                }
            });
        }
    });
}


class ImageModal {
    constructor() {
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalCaption = document.getElementById('modalCaption');
        this.modalClose = document.getElementById('modalClose');
        this.init();
    }

    init() {
        document.querySelectorAll('.inline-image-link').forEach(link => {
            link.addEventListener('click', (e) => this.open(e));
        });

        this.modalClose.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.close();
            }
        });
    }

    open(e) {
        e.preventDefault();
        const link = e.currentTarget;

        this.modalImage.src = '';
        this.modalImage.alt = link.getAttribute('data-image-alt') || 'Изображение';
        this.modalCaption.textContent = link.getAttribute('data-image-alt') || 'Изображение';

        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        const img = new Image();
        img.onload = () => {
            this.modalImage.src = link.getAttribute('data-image-url');
        };
        img.onerror = () => {
            this.modalImage.alt = 'Изображение не загрузилось';
            this.modalCaption.textContent = 'Не удалось загрузить изображение';
        };
        img.src = link.getAttribute('data-image-url');

        if (typeof ym !== 'undefined') {
            ym(106151381, 'reachGoal', 'image_modal_open', {
                page: 'works',
                image_url: link.getAttribute('data-image-url')
            });
        }
    }

    close() {
        this.modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageModal();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorksPage);
} else {
    setTimeout(initWorksPage, 10);
}