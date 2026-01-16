document.addEventListener('DOMContentLoaded', function () {
    console.log('Статья Digital Greatness загружена');

    const tocLinks = document.querySelectorAll('.table-of-contents a');
    const sections = document.querySelectorAll('.article-section');
    
    if (tocLinks.length > 0 && sections.length > 0) {
        tocLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    history.pushState(null, null, '#' + targetId);
                }
            });
        });
    }

    function highlightCurrentSection() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 150)) {
                currentSection = section.getAttribute('id');
            }
        });

        tocLinks.forEach(link => {
            link.classList.remove('active');
            const linkId = link.getAttribute('href').substring(1);
            if (linkId === currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightCurrentSection);
    highlightCurrentSection();

    const shareButtons = document.querySelectorAll('.share-btn');
    
    if (shareButtons.length > 0) {
        shareButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const social = this.getAttribute('data-social');
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                
                let shareUrl = '';
                
                switch (social) {
                    case 'telegram':
                        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                        break;
                    case 'vk':
                        shareUrl = `https://vk.com/share.php?url=${url}&title=${title}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://wa.me/?text=${title}%20${url}`;
                        break;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                    
                    if (typeof ym !== 'undefined') {
                        ym(106151381, 'reachGoal', 'share_article', {
                            social: social
                        });
                    }
                }
            });
        });
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.article-section, .article-tip, .article-summary').forEach(el => {
            observer.observe(el);
        });
    }

    function calculateReadingTime() {
        const articleBody = document.querySelector('.article-body');
        if (!articleBody) return;
        
        const text = articleBody.textContent || '';
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 слов в минуту
        
        const readingTimeElement = document.querySelector('.reading-time');
        if (readingTimeElement) {
            readingTimeElement.textContent = `${readingTime} мин чтения`;
        }
    }
    
    calculateReadingTime();

    const articleTitle = document.querySelector('.article-title');
    if (articleTitle) {
        articleTitle.style.cursor = 'pointer';
        articleTitle.title = 'Нажмите, чтобы скопировать ссылку';
        
        articleTitle.addEventListener('click', function () {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('✅ Ссылка на статью скопирована!');
            }).catch(err => {
                console.error('Ошибка копирования:', err);
                showNotification('❌ Не удалось скопировать ссылку');
            });
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: var(--shadow);
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    function initializeAnimations() {
        document.body.classList.add('loaded');
        
        setTimeout(() => {
            const elements = document.querySelectorAll('.article-section, .article-tip');
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 300);
    }

    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            
            if (!link.querySelector('i')) {
                link.innerHTML += ' <i class="fas fa-external-link-alt" style="font-size: 0.8em;"></i>';
            }
        }
    });

    function initArticle() {
        initializeAnimations();
        
        const style = document.createElement('style');
        style.textContent = `
            .article-section, .article-tip, .article-summary {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .article-section.fade-in,
            .article-tip.fade-in,
            .article-summary.fade-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .loaded .article-header {
                animation: fadeInUp 0.8s ease;
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
        `;
        document.head.appendChild(style);
    }

    setTimeout(initArticle, 100);
});