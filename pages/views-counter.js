(function() {
    'use strict';
    
    class ExactViewsCounter {
        constructor() {
            this.storageKey = 'dg_exact_views';
            this.sessionsKey = 'dg_sessions';
            this.lastSyncKey = 'dg_last_sync';
            
            this.API_URL = 'https://script.google.com/macros/s/AKfycbzFB-K8BCvZ9hpgain3QpJVF7-U9wJhiy0pvlJjijFn7-hIAX8b_lFUEidwjBjw-aOV2A/exec';
            this.SYNC_INTERVAL = 30000;
            this.RETRY_DELAY = 5000;
            
            this.views = this.loadViews();
            this.currentSession = this.getSessionId();
            this.syncInProgress = false;
            this.init();
        }
        
        // === Базовые методы ===
        
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
        
        // === Синхронизация с сервером ===
        
        async syncWithServer() {
            if (this.syncInProgress) return;
            
            this.syncInProgress = true;
            try {
                const response = await this.sendToServer('sync', {
                    data: this.views
                });
                
                if (response && response.views) {
                    Object.entries(response.views).forEach(([articleId, serverCount]) => {
                        if (!this.views[articleId]) {
                            this.views[articleId] = {
                                total: serverCount,
                                sessions: {},
                                firstView: new Date().toISOString(),
                                history: []
                            };
                        } else {
                            this.views[articleId].total = Math.max(
                                this.views[articleId].total || 0,
                                serverCount
                            );
                        }
                    });
                    
                    this.saveViews();
                    localStorage.setItem(this.lastSyncKey, Date.now().toString());
                    
                    console.log('Синхронизация успешна:', response.views);
                    return response.views;
                }
            } catch (error) {
                console.warn('Ошибка синхронизации:', error);
            } finally {
                this.syncInProgress = false;
            }
            
            return null;
        }
        
        async sendToServer(action, data = {}) {
            try {
                const payload = {
                    action: action,
                    ...data
                };
                
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (action === 'increment') {
                    setTimeout(() => this.syncWithServer(), 1000);
                }
                
                return null;
                
            } catch (error) {
                console.warn('Ошибка отправки на сервер:', error);
                throw error;
            }
        }
        
        async sendToServerJSONP(action, data) {
            return new Promise((resolve) => {
                const callbackName = 'jsonp_callback_' + Date.now();
                window[callbackName] = (response) => {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    resolve(response);
                };
                
                const script = document.createElement('script');
                const params = new URLSearchParams({
                    ...data,
                    action: action,
                    callback: callbackName
                });
                
                script.src = `${this.API_URL}?${params.toString()}`;
                document.body.appendChild(script);
                
                setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                        document.body.removeChild(script);
                        resolve(null);
                    }
                }, 5000);
            });
        }
        
        // === Основная логика счетчика ===
        
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
                
                this.sendToServer('increment', { article: articleId })
                    .catch(e => console.warn('Не удалось отправить на сервер:', e));
                
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
        
        // === Периодическая синхронизация ===
        
        startPeriodicSync() {
            setTimeout(() => this.syncWithServer(), 2000);
            
            setInterval(() => {
                const lastSync = parseInt(localStorage.getItem(this.lastSyncKey) || '0');
                const now = Date.now();
                
                if (now - lastSync > this.SYNC_INTERVAL) {
                    this.syncWithServer();
                }
            }, this.SYNC_INTERVAL);
        }
        
        // === Инициализация и обновление UI ===
        
        init() {
            const articleId = this.getArticleId();
            
            this.startPeriodicSync();
            
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
            
            window.forceSync = () => this.syncWithServer();
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
            });
            
            setTimeout(() => this.updateBlogPage(), 10000);
        }
        
        formatExactNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
        
        reset() {
            this.views = {};
            this.saveViews();
            localStorage.removeItem(this.lastSyncKey);
            console.log('Счетчики сброшены');
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        window.exactViewsCounter = new ExactViewsCounter();
    });
    
})();