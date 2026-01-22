function initBlog() {
    console.log('Блог Digital Greatness загружен');
    initFilters();
    initSmoothScroll();
    updateCurrentYear();
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
    document.addEventListener('click', function(e) {
        let target = e.target;
        while (target && target.tagName !== 'A') {
            target = target.parentElement;
        }
        
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (!href || href.startsWith('http') || href === '#' || href === '#!') return;
        
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