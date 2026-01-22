// Инициализация блога
function initBlog() {
    console.log('Блог Digital Greatness загружен');

    // Инициализация фильтров
    initFilters();

    // Инициализация ленивой загрузки изображений
    initLazyLoading();

    // Инициализация анимаций при скролле
    initScrollAnimations();

    // Инициализация пагинации
    initPagination();

    // Инициализация поиска
    initSearch();

    // Инициализация отслеживания просмотров
    initArticleViews();

    // Инициализация сохранения позиции скролла
    initScrollPosition();

    // Добавление CSS анимаций
    addBlogStyles();

    // Запуск начальных анимаций
    initializeAnimations();
}

// Инициализация фильтров статей
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleCards = document.querySelectorAll('.article-card');

    if (filterButtons.length === 0 || articleCards.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Снимаем активный класс со всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');

            const filter = this.dataset.filter;

            // Фильтрация статей
            articleCards.forEach(card => {
                const shouldShow = filter === 'all' || card.dataset.category === filter;

                if (shouldShow) {
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Ленивая загрузка изображений
function initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '100px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Анимации при скролле
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    document.querySelectorAll('.article-card').forEach(card => {
        fadeObserver.observe(card);
    });
}

// Пагинация
function initPagination() {
    const paginationLinks = document.querySelectorAll('.page-link');
    if (paginationLinks.length === 0) return;

    paginationLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (!this.classList.contains('active') && !this.classList.contains('next')) {
                e.preventDefault();

                paginationLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                console.log('Переход на страницу:', this.textContent.trim());
            }
        });
    });
}

// Поиск по статьям
function initSearch() {
    const searchInput = document.querySelector('.blog-search');
    const articleCards = document.querySelectorAll('.article-card');
    
    if (!searchInput || articleCards.length === 0) return;

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            // Показываем все статьи, если поисковый запрос слишком короткий
            articleCards.forEach(card => {
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
            return;
        }

        // Фильтрация статей по поисковому запросу
        articleCards.forEach(card => {
            const title = card.querySelector('.article-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
            const category = card.querySelector('.article-category').textContent.toLowerCase();

            const matches = title.includes(searchTerm) ||
                excerpt.includes(searchTerm) ||
                category.includes(searchTerm);

            if (matches) {
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Отслеживание просмотров статей
function initArticleViews() {
    const articleLinks = document.querySelectorAll('.article-title a');

    articleLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const articleId = href.split('/').filter(part => part).pop() || 'unknown';

            // Отслеживание в Яндекс.Метрике
            if (typeof ym !== 'undefined') {
                ym(106151381, 'reachGoal', 'article_click', {
                    article: articleId
                });
            }

            // Сохранение в localStorage для счетчика просмотров
            try {
                const views = JSON.parse(localStorage.getItem('article_views') || '{}');
                views[articleId] = (views[articleId] || 0) + 1;
                localStorage.setItem('article_views', JSON.stringify(views));

                // Обновление счетчика на странице (если есть)
                const viewsElement = this.closest('.article-card').querySelector('.article-views .exact-count');
                if (viewsElement) {
                    const currentViews = parseInt(viewsElement.textContent) || 0;
                    viewsElement.textContent = currentViews + 1;
                }
            } catch (e) {
                console.error('Ошибка сохранения просмотров:', e);
            }
        });
    });
}

// Сохранение позиции скролла
function initScrollPosition() {
    let scrollPosition = 0;

    window.addEventListener('scroll', function () {
        scrollPosition = window.scrollY;
    });

    window.addEventListener('beforeunload', function () {
        sessionStorage.setItem('blogScrollPosition', scrollPosition.toString());
    });

    const savedPosition = sessionStorage.getItem('blogScrollPosition');
    if (savedPosition && parseInt(savedPosition) > 0) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('blogScrollPosition');
    }
}

// Добавление стилей для анимаций
function addBlogStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .article-card {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .article-card.fade-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .filter-btn {
            transition: all 0.3s ease;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .loaded .blog-hero {
            animation: fadeInUp 0.8s ease;
        }
    `;
    document.head.appendChild(style);
}

// Инициализация начальных анимаций
function initializeAnimations() {
    document.body.classList.add('loaded');

    const articleCards = document.querySelectorAll('.article-card');
    const visibleArticles = Array.from(articleCards).filter(card => {
        const rect = card.getBoundingClientRect();
        return rect.top < window.innerHeight - 100;
    });

    visibleArticles.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Утилиты для блога
class BlogUtils {
    static formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace('.0', '') + 'k';
        }
        return num.toString();
    }

    static calculateReadingTime(text) {
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / 200);
    }

    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text);
    }

    static shareArticle(title, url) {
        if (navigator.share) {
            return navigator.share({
                title: title,
                url: url
            });
        }
        return false;
    }
}

// Инициализация при загрузке DOM с учетом компонентов
document.addEventListener('DOMContentLoaded', function() {
    // Ждем загрузки компонентов, если они есть
    if (typeof window.ComponentLoader !== 'undefined') {
        document.addEventListener('componentsLoaded', function() {
            console.log('Компоненты загружены, инициализируем блог...');
            setTimeout(initBlog, 100);
        });
    } else {
        // Если компонентов нет, инициализируем сразу
        console.log('Компоненты не используются, инициализируем блог...');
        setTimeout(initBlog, 100);
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogUtils;
}

// Глобальный экспорт
window.BlogUtils = BlogUtils;
window.initBlog = initBlog;