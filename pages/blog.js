document.addEventListener('DOMContentLoaded', function () {
    console.log('Блог Digital Greatness загружен');

    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleCards = document.querySelectorAll('.article-card');

    if (filterButtons.length > 0 && articleCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                filterButtons.forEach(btn => btn.classList.remove('active'));

                this.classList.add('active');

                const filter = this.dataset.filter;

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

    if ('IntersectionObserver' in window) {
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

    if ('IntersectionObserver' in window) {
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

    //ПАГИНАЦИЯ 
    const paginationLinks = document.querySelectorAll('.page-link');
    if (paginationLinks.length > 0) {
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

    function initializeAnimations() {
        document.body.classList.add('loaded');

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

    function handleResponsiveImages() {
        const articlesGrid = document.querySelector('.articles-grid');
        if (!articlesGrid) return;

        const updateImageSizes = () => {
            const isMobile = window.innerWidth < 768;
            const images = document.querySelectorAll('.article-image img');

            images.forEach(img => {
                if (isMobile) {
                    img.dataset.src = img.dataset.srcMobile || img.dataset.src;
                } else {
                    img.dataset.src = img.dataset.srcDesktop || img.dataset.src;
                }
            });
        };

        window.addEventListener('resize', updateImageSizes);
        updateImageSizes();
    }

    function trackArticleViews() {
        const articleLinks = document.querySelectorAll('.article-title a');

        articleLinks.forEach(link => {
            link.addEventListener('click', function () {
                const articleId = this.getAttribute('href').split('/').pop().replace('.html', '');

                if (typeof ym !== 'undefined') {
                    ym(106151381, 'reachGoal', 'article_click', {
                        article: articleId
                    });
                }

                try {
                    const views = JSON.parse(localStorage.getItem('article_views') || '{}');
                    views[articleId] = (views[articleId] || 0) + 1;
                    localStorage.setItem('article_views', JSON.stringify(views));

                    const viewsElement = this.closest('.article-card').querySelector('.article-views');
                    if (viewsElement) {
                        const currentViews = parseInt(viewsElement.textContent) || 0;
                        viewsElement.innerHTML = `<i class="far fa-eye"></i> ${currentViews + 1}`;
                    }
                } catch (e) {
                    console.error('Ошибка сохранения просмотров:', e);
                }
            });
        });
    }

    function initSearch() {
        const searchInput = document.querySelector('.blog-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm.length < 2) {
                articleCards.forEach(card => {
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                });
                return;
            }

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

    function handleScrollPosition() {
        let scrollPosition = 0;

        window.addEventListener('scroll', function () {
            scrollPosition = window.scrollY;
        });

        window.addEventListener('beforeunload', function () {
            sessionStorage.setItem('blogScrollPosition', scrollPosition);
        });

        const savedPosition = sessionStorage.getItem('blogScrollPosition');
        if (savedPosition && savedPosition > 0) {
            window.scrollTo(0, parseInt(savedPosition));
            sessionStorage.removeItem('blogScrollPosition');
        }
    }

    function initBlog() {
        initializeAnimations();
        handleResponsiveImages();
        trackArticleViews();
        initSearch();
        handleScrollPosition();

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
    setTimeout(initBlog, 100);
});

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogUtils;
}