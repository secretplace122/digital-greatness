function initBlog() {
    console.log('Блог Digital Greatness загружен');
    initMobileMenu();
    initFilters();
    initSmoothScroll();
    updateCurrentYear();
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            const isActive = nav.classList.contains('active');
            nav.classList.toggle('active');
            menuToggle.innerHTML = isActive
                ? '<i class="fas fa-bars"></i>'
                : '<i class="fas fa-times"></i>';
            document.body.style.overflow = isActive ? 'auto' : 'hidden';
        });
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = 'auto';
            });
        });
    }
}

function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleCards = document.querySelectorAll('.article-card');
    if (filterButtons.length === 0 || articleCards.length === 0) return;
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            articleCards.forEach(card => {
                const shouldShow = filter === 'all' || card.dataset.category === filter;
                if (shouldShow) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('http') || href === '#' || href === '#!') return;
            let targetId;
            if (href.startsWith('/#')) {
                targetId = href.substring(2);
            } else if (href.startsWith('#')) {
                targetId = href.substring(1);
            } else {
                return;
            }
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                const header = document.querySelector('header.header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                if (history.pushState) {
                    history.pushState(null, null, '#' + targetId);
                } else {
                    window.location.hash = '#' + targetId;
                }
                const nav = document.querySelector('.nav');
                const menuToggle = document.getElementById('menuToggle');
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    if (menuToggle) {
                        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                    document.body.style.overflow = 'auto';
                }
            }
        });
    });
}

function updateCurrentYear() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM загружен, инициализируем блог...');
    setTimeout(initBlog, 100);
});