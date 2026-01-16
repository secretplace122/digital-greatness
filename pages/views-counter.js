(function() {
    'use strict';
    
    class ExactViewsCounter {
        constructor() {
            this.storageKey = 'dg_exact_views';
            this.sessionsKey = 'dg_sessions';
            this.views = this.loadViews();
            this.currentSession = this.getSessionId();
            this.init();
        }
        
        getSessionId() {
            let sessionId = sessionStorage.getItem(this.sessionsKey);
            if (!sessionId) {
                sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem(this.sessionsKey, sessionId);
            }
            return sessionId;
        }
        
        getArticleId() {
            const path = window.location.pathname;
            const fileName = path.split('/').pop().replace('.html', '');
            
            if (fileName && fileName !== 'blog') {
                return fileName;
            }
            return 'blog';
        }
        
        loadViews() {
            try {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Ошибка загрузки просмотров:', e);
            }
            return {};
        }
        
        saveViews() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.views));
            } catch (e) {
                console.warn('Ошибка сохранения просмотров:', e);
            }
        }
        
        incrementExact(articleId = this.getArticleId()) {
            if (!articleId) return 0;
            
            if (!this.views[articleId]) {
                this.views[articleId] = {
                    total: 0,
                    sessions: {},
                    firstView: new Date().toISOString(),
                    history: []
                };
            }
            
            const article = this.views[articleId];
            
            if (!article.sessions[this.currentSession]) {
                article.total++;
                article.sessions[this.currentSession] = {
                    count: 1,
                    first: new Date().toISOString(),
                    last: new Date().toISOString()
                };
                
                article.history.push({
                    timestamp: new Date().toISOString(),
                    session: this.currentSession
                });
                
                if (article.history.length > 1000) {
                    article.history = article.history.slice(-1000);
                }
                
                article.lastView = new Date().toISOString();
                this.saveViews();
                
                if (typeof ym !== 'undefined') {
                    ym(106151381, 'reachGoal', 'article_view', {
                        article: articleId,
                        views: article.total
                    });
                }
                
                return article.total;
            } else {
                article.sessions[this.currentSession].last = new Date().toISOString();
                this.saveViews();
                return article.total;
            }
        }
        
        getExactCount(articleId) {
            return this.views[articleId]?.total || 0;
        }
        
        getArticleStats(articleId) {
            return this.views[articleId] || null;
        }
        
        getAllStats() {
            return this.views;
        }
        
        reset() {
            this.views = {};
            this.saveViews();
            console.log('Счетчики сброшены');
        }
        
        formatExactNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
        
        init() {
            const articleId = this.getArticleId();
            
            if (articleId && articleId !== 'blog') {
                const newCount = this.incrementExact();
                
                setTimeout(() => {
                    this.updateArticlePage(newCount);
                }, 300);
            }
            
            if (articleId === 'blog') {
                setTimeout(() => {
                    this.updateBlogPage();
                }, 500);
            }
            
            window.debugViews = () => {
                console.log('Текущая сессия:', this.currentSession);
                console.log('Все просмотры:', this.views);
                console.log('Статистика по статьям:');
                Object.entries(this.views).forEach(([id, data]) => {
                    console.log(`${id}: ${data.total} просмотров`);
                });
            };
        }
        
        updateArticlePage(count) {
            const viewsElements = document.querySelectorAll('.article-views, .views-count');
            
            viewsElements.forEach(element => {
                if (element.classList.contains('article-views')) {
                    const icon = element.querySelector('i') || document.createElement('i');
                    icon.className = 'far fa-eye';
                    
                    const countSpan = document.createElement('span');
                    countSpan.className = 'exact-count';
                    countSpan.textContent = this.formatExactNumber(count);
                    
                    const textSpan = document.createElement('span');
                    textSpan.className = 'views-text';
                    textSpan.textContent = ' просмотров';
                    
                    element.innerHTML = '';
                    element.appendChild(icon);
                    element.appendChild(document.createTextNode(' '));
                    element.appendChild(countSpan);
                    element.appendChild(textSpan);
                } else if (element.classList.contains('views-count')) {
                    element.textContent = this.formatExactNumber(count);
                }
            });
            
            const metaCount = document.querySelector('meta[name="views-count"]');
            if (metaCount) {
                metaCount.setAttribute('content', count);
            }
        }
        
        updateBlogPage() {
            document.querySelectorAll('.article-card').forEach(card => {
                const link = card.querySelector('a[href]');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href.endsWith('.html')) {
                        const articleId = href.replace('.html', '').split('/').pop();
                        const count = this.getExactCount(articleId);
                        
                        if (count > 0) {
                            const viewsElement = card.querySelector('.article-views');
                            if (viewsElement) {
                                const icon = viewsElement.querySelector('i') || document.createElement('i');
                                icon.className = 'far fa-eye';
                                
                                const countSpan = document.createElement('span');
                                countSpan.className = 'exact-count';
                                countSpan.textContent = this.formatExactNumber(count);
                                
                                const textSpan = document.createElement('span');
                                textSpan.className = 'views-text';
                                textSpan.textContent = ' просмотров';
                                
                                viewsElement.innerHTML = '';
                                viewsElement.appendChild(icon);
                                viewsElement.appendChild(document.createTextNode(' '));
                                viewsElement.appendChild(countSpan);
                                viewsElement.appendChild(textSpan);
                            }
                        }
                    }
                }
            });
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        window.exactViewsCounter = new ExactViewsCounter();
    });
    
})();