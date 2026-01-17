// views-counter.js
(function() {
    'use strict';
    
    class ExactViewsCounter {
        constructor() {
            this.storageKey = 'dg_exact_views';
            this.sessionsKey = 'dg_sessions';
            this.lastSyncKey = 'dg_last_sync';
            this.retryKey = 'dg_retry_count';
            
            this.API_URL = 'https://script.google.com/macros/s/AKfycbzFB-K8BCvZ9hpgain3QpJVF7-U9wJhiy0pvlJjijFn7-hIAX8b_lFUEidwjBjw-aOV2A/exec';
            this.SYNC_INTERVAL = 60000; // 1 минута
            this.RETRY_DELAY = 10000; // 10 секунд
            this.MAX_RETRIES = 3;
            
            this.views = this.loadViews();
            this.currentSession = this.getSessionId();
            this.syncInProgress = false;
            this.retryCount = parseInt(localStorage.getItem(this.retryKey) || '0');
            
            console.log('Counter initialized, API URL:', this.API_URL);
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
                    const parsed = JSON.parse(stored);
                    console.log('Loaded views from localStorage:', Object.keys(parsed).length);
                    return parsed;
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
            if (this.syncInProgress) {
                console.log('Sync already in progress');
                return null;
            }
            
            this.syncInProgress = true;
            console.log('Starting sync...');
            
            try {
                const response = await this.sendViaImagePixel('sync', {
                    data: JSON.stringify(this.views)
                });
                
                if (!response) {
                    console.log('Trying to get data from server...');
                    const serverViews = await this.getAllViewsFromServer();
                    
                    if (serverViews) {
                        Object.entries(serverViews).forEach(([articleId, serverCount]) => {
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
                        this.retryCount = 0;
                        localStorage.setItem(this.retryKey, '0');
                        
                        console.log('Sync successful from getAllViews:', serverViews);
                        return serverViews;
                    }
                }
                
                return response;
                
            } catch (error) {
                console.warn('Ошибка синхронизации:', error);
                this.retryCount++;
                localStorage.setItem(this.retryKey, this.retryCount.toString());
                
                if (this.retryCount > this.MAX_RETRIES) {
                    console.warn('Too many retries, delaying next sync');
                    this.SYNC_INTERVAL = 300000; 
                }
            } finally {
                this.syncInProgress = false;
            }
            
            return null;
        }
        
        // === Методы отправки данных ===
        
        async sendViaImagePixel(action, data) {
            return new Promise((resolve) => {
                const params = new URLSearchParams({
                    action: action,
                    timestamp: Date.now(),
                    session: this.currentSession,
                    ...data
                });
                
                const img = new Image();
                img.src = `${this.API_URL}?${params.toString()}`;
                img.style.display = 'none';
                
                img.onload = () => {
                    console.log(`Image pixel sent for ${action}`);
                    resolve(true);
                };
                
                img.onerror = () => {
                    console.log(`Image pixel failed for ${action}`);
                    resolve(false);
                };
                
                document.body.appendChild(img);
                
                setTimeout(() => {
                    if (img.parentNode) {
                        img.parentNode.removeChild(img);
                    }
                    console.log(`Image pixel timeout for ${action}`);
                    resolve(false);
                }, 5000);
            });
        }
        
        async sendIncrementToServer(articleId) {
            console.log(`Sending increment for ${articleId}`);
            
            await this.sendViaImagePixel('increment', {
                article: articleId
            });
            
            this.sendViaForm('increment', { article: articleId });
            
            return true;
        }
        
        sendViaForm(action, data) {
            try {
                const form = document.createElement('form');
                form.method = 'GET';
                form.action = this.API_URL;
                form.target = '_blank';
                form.style.display = 'none';

                const actionInput = document.createElement('input');
                actionInput.type = 'hidden';
                actionInput.name = 'action';
                actionInput.value = action;
                form.appendChild(actionInput);
                
                const articleInput = document.createElement('input');
                articleInput.type = 'hidden';
                articleInput.name = 'article';
                articleInput.value = data.article;
                form.appendChild(articleInput);
                
                const sessionInput = document.createElement('input');
                sessionInput.type = 'hidden';
                sessionInput.name = 'session';
                sessionInput.value = this.currentSession;
                form.appendChild(sessionInput);
                
                document.body.appendChild(form);
                form.submit();
                
                setTimeout(() => {
                    if (form.parentNode) {
                        form.parentNode.removeChild(form);
                    }
                }, 1000);
                
            } catch (error) {
                console.warn('Form submit error:', error);
            }
        }
        
        async getAllViewsFromServer() {
            return new Promise((resolve) => {
                const callbackName = 'dg_callback_' + Date.now();
                
                window[callbackName] = (response) => {
                    delete window[callbackName];
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    
                    if (response && response.success && response.views) {
                        console.log('Got views from server:', response.views);
                        resolve(response.views);
                    } else {
                        console.log('No valid response from server');
                        resolve(null);
                    }
                };
                
                const script = document.createElement('script');
                const params = new URLSearchParams({
                    action: 'getAll',
                    callback: callbackName,
                    _: Date.now()
                });
                
                script.src = `${this.API_URL}?${params.toString()}`;
                
                script.onerror = () => {
                    delete window[callbackName];
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    console.log('JSONP script failed to load');
                    resolve(null);
                };
                
                document.body.appendChild(script);
                
                setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                        if (script.parentNode) {
                            script.parentNode.removeChild(script);
                        }
                        console.log('JSONP timeout for getAllViews');
                        resolve(null);
                    }
                }, 8000);
            });
        }
        
        // === Основная логика счетчика ===
        
        incrementExact(articleId = this.getArticleId()) {
            if (!articleId || articleId === 'blog') {
                console.log('No article ID or blog page, skipping increment');
                return 0;
            }
            
            console.log(`Incrementing views for: ${articleId}`);
            
            if (!this.views[articleId]) {
                this.views[articleId] = {
                    total: 0,
                    sessions: {},
                    firstView: new Date().toISOString(),
                    history: [],
                    lastView: null
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
                    session: this.currentSession,
                    type: 'view'
                });
                
                if (article.history.length > 100) {
                    article.history = article.history.slice(-100);
                }
                
                article.lastView = new Date().toISOString();
                this.saveViews();
                
                console.log(`Article ${articleId} views: ${article.total}`);
                
                this.sendIncrementToServer(articleId).catch(e => {
                    console.warn('Failed to send increment:', e);
                });
                
                if (typeof ym !== 'undefined') {
                    try {
                        ym(106151381, 'reachGoal', 'article_view', {
                            article: articleId,
                            views: article.total
                        });
                    } catch (e) {
                        console.warn('Yandex Metrika error:', e);
                    }
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
            console.log('Starting periodic sync');
            
            setTimeout(() => {
                this.syncWithServer().then(views => {
                    if (views) {
                        this.updateUI();
                    }
                });
            }, 3000);
            
            setInterval(() => {
                const lastSync = parseInt(localStorage.getItem(this.lastSyncKey) || '0');
                const now = Date.now();
                
                if (now - lastSync > this.SYNC_INTERVAL) {
                    console.log('Periodic sync triggered');
                    this.syncWithServer().then(views => {
                        if (views) {
                            this.updateUI();
                        }
                    });
                }
            }, this.SYNC_INTERVAL);
        }
        
        // === Инициализация и обновление UI ===
        
        init() {
            const articleId = this.getArticleId();
            console.log(`Initializing for page: ${articleId}`);
            
            this.startPeriodicSync();

            if (articleId && articleId !== 'blog') {
                const newCount = this.incrementExact();
                console.log(`Initial count for ${articleId}: ${newCount}`);
                
                setTimeout(() => {
                    this.updateArticlePage(newCount);
                }, 500);
            }
            
            if (articleId === 'blog') {
                console.log('Blog page, updating all articles');
                setTimeout(() => {
                    this.updateBlogPage();
                    setInterval(() => {
                        this.updateBlogPage();
                    }, 30000);
                }, 1000);
            }
            
            window.debugViews = () => {
                console.log('=== DEBUG VIEWS ===');
                console.log('Current session:', this.currentSession);
                console.log('Retry count:', this.retryCount);
                console.log('All views:', this.views);
                console.log('Article stats:');
                Object.entries(this.views).forEach(([id, data]) => {
                    console.log(`  ${id}: ${data.total} views, ${Object.keys(data.sessions).length} sessions`);
                });
                console.log('=== END DEBUG ===');
            };
            
            window.forceSync = () => {
                console.log('Manual sync triggered');
                this.syncWithServer().then(views => {
                    if (views) {
                        this.updateUI();
                        alert('Синхронизация завершена');
                    } else {
                        alert('Синхронизация не удалась, проверьте консоль');
                    }
                });
            };
            
            window.resetViews = () => {
                if (confirm('Сбросить все локальные данные?')) {
                    this.reset();
                    location.reload();
                }
            };
        }
        
        updateArticlePage(count) {
            const viewsElements = document.querySelectorAll('.article-views, .views-count');
            
            if (viewsElements.length === 0) {
                console.log('No view elements found on article page');
                return;
            }
            
            viewsElements.forEach(element => {
                if (element.classList.contains('article-views')) {
                    const formattedCount = this.formatExactNumber(count);
                    
                    const currentText = element.textContent;
                    if (currentText.includes(formattedCount)) {
                        return;
                    }
                    
                    element.innerHTML = `
                        <i class="far fa-eye"></i>
                        <span class="exact-count">${formattedCount}</span>
                        <span class="views-text"> просмотров</span>
                    `;
                    
                    console.log(`Updated article page views: ${formattedCount}`);
                }
            });
        }
        
        updateBlogPage() {
            console.log('Updating blog page view counts');
            
            document.querySelectorAll('.article-card').forEach((card, index) => {
                const link = card.querySelector('a[href]');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href && href.endsWith('.html')) {
                        const articleId = href.replace('.html', '').split('/').pop();
                        const count = this.getExactCount(articleId);
                        const viewsElement = card.querySelector('.article-views');
                        
                        if (viewsElement && articleId) {
                            const formattedCount = this.formatExactNumber(count);
                            const currentText = viewsElement.textContent;
                            
                            if (!currentText.includes(formattedCount)) {
                                viewsElement.innerHTML = `
                                    <i class="far fa-eye"></i>
                                    <span class="exact-count">${formattedCount}</span>
                                    <span class="views-text"> просмотров</span>
                                `;
                                
                                if (index < 3) {
                                    console.log(`Updated ${articleId}: ${formattedCount} views`);
                                }
                            }
                        }
                    }
                }
            });
        }
        
        updateUI() {
            const articleId = this.getArticleId();
            
            if (articleId && articleId !== 'blog') {
                const count = this.getExactCount(articleId);
                this.updateArticlePage(count);
            } else if (articleId === 'blog') {
                this.updateBlogPage();
            }
        }
        
        formatExactNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
        
        reset() {
            this.views = {};
            this.saveViews();
            localStorage.removeItem(this.lastSyncKey);
            localStorage.removeItem(this.retryKey);
            this.retryCount = 0;
            console.log('All counters reset');
        }
    }
    
    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.exactViewsCounter = new ExactViewsCounter();
        });
    } else {
        window.exactViewsCounter = new ExactViewsCounter();
    }
    
})();