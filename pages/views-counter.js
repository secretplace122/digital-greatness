// views-counter.js (упрощенная надежная версия)
(function() {
    'use strict';
    
    class ExactViewsCounter {
        constructor() {
            this.storageKey = 'dg_exact_views';
            this.sessionsKey = 'dg_sessions';
            
            // Базовый URL Apps Script
            this.API_BASE = 'https://script.google.com/macros/s/AKfycbzFB-K8BCvZ9hpgain3QpJVF7-U9wJhiy0pvlJjijFn7-hIAX8b_lFUEidwjBjw-aOV2A';
            this.API_URL = this.API_BASE + '/exec';
            
            this.views = this.loadViews();
            this.sessionId = this.getSessionId();
            this.isInitialized = false;
            
            console.log('ExactViewsCounter initialized');
            this.init();
        }
        
        getSessionId() {
            let sessionId = sessionStorage.getItem(this.sessionsKey);
            if (!sessionId) {
                sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem(this.sessionsKey, sessionId);
            }
            return sessionId;
        }
        
        getArticleId() {
            const path = window.location.pathname;
            const fileName = path.split('/').pop();
            
            if (fileName && fileName.endsWith('.html') && fileName !== 'blog.html') {
                return fileName.replace('.html', '');
            }
            return null;
        }
        
        loadViews() {
            try {
                const stored = localStorage.getItem(this.storageKey);
                return stored ? JSON.parse(stored) : {};
            } catch (e) {
                console.warn('Error loading views:', e);
                return {};
            }
        }
        
        saveViews() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.views));
            } catch (e) {
                console.warn('Error saving views:', e);
            }
        }
        
        // ПРОСТОЙ МЕТОД: Используем Image для отправки данных (всегда работает)
        sendView(articleId) {
            if (!articleId) return;
            
            console.log('Sending view for:', articleId);
            
            // 1. Обновляем локально
            if (!this.views[articleId]) {
                this.views[articleId] = 0;
            }
            this.views[articleId]++;
            this.saveViews();
            
            // 2. Отправляем на сервер через Image (работает везде)
            const img = new Image();
            const params = new URLSearchParams({
                action: 'increment',
                article: articleId,
                session: this.sessionId,
                t: Date.now() // предотвращаем кэширование
            });
            
            img.src = this.API_URL + '?' + params.toString();
            img.style.display = 'none';
            
            // Не ждем ответа, просто отправляем
            document.body.appendChild(img);
            setTimeout(() => {
                if (img.parentNode) img.parentNode.removeChild(img);
            }, 1000);
            
            console.log('View sent for', articleId, 'count:', this.views[articleId]);
            return this.views[articleId];
        }
        
        // Получаем данные с сервера (если доступно)
        async fetchServerViews() {
            return new Promise((resolve) => {
                // Пробуем JSONP
                const callbackName = 'views_callback_' + Date.now();
                const script = document.createElement('script');
                
                window[callbackName] = (data) => {
                    delete window[callbackName];
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    
                    if (data && data.success && data.views) {
                        console.log('Got server data:', data.views);
                        resolve(data.views);
                    } else {
                        resolve(null);
                    }
                };
                
                script.src = this.API_URL + '?action=getAll&callback=' + callbackName + '&_=' + Date.now();
                script.onerror = () => {
                    delete window[callbackName];
                    if (script.parentNode) script.parentNode.removeChild(script);
                    resolve(null);
                };
                
                document.body.appendChild(script);
                
                setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                        if (script.parentNode) script.parentNode.removeChild(script);
                        resolve(null);
                    }
                }, 3000);
            });
        }
        
        // Основная инициализация
        init() {
            const articleId = this.getArticleId();
            
            // Для страниц статей
            if (articleId) {
                console.log('Article page detected:', articleId);
                const count = this.sendView(articleId);
                this.updateCount(articleId, count);
            }
            
            // Для страницы блога
            if (window.location.pathname.includes('blog.html') || 
                (articleId === 'blog' || articleId === null)) {
                console.log('Blog page detected');
                this.updateAllCounts();
                
                // Пробуем получить данные с сервера
                setTimeout(() => {
                    this.fetchServerViews().then(serverViews => {
                        if (serverViews) {
                            // Обновляем локальные данные с серверными
                            Object.entries(serverViews).forEach(([id, data]) => {
                                const serverCount = data.total || data;
                                if (serverCount > (this.views[id] || 0)) {
                                    this.views[id] = serverCount;
                                }
                            });
                            this.saveViews();
                            this.updateAllCounts();
                        }
                    });
                }, 1000);
            }
            
            this.isInitialized = true;
        }
        
        // Обновляем счетчик на странице статьи
        updateCount(articleId, count) {
            const elements = document.querySelectorAll('.exact-count, .views-count, .article-views .exact-count');
            
            elements.forEach(el => {
                if (el.classList.contains('exact-count') || el.classList.contains('views-count')) {
                    el.textContent = this.formatNumber(count);
                } else if (el.closest('.article-views')) {
                    const parent = el.closest('.article-views');
                    if (parent) {
                        parent.innerHTML = `<i class="far fa-eye"></i> ${this.formatNumber(count)} просмотров`;
                    }
                }
            });
        }
        
        // Обновляем все счетчики на странице блога
        updateAllCounts() {
            const cards = document.querySelectorAll('.article-card');
            
            cards.forEach(card => {
                const link = card.querySelector('a[href*=".html"]');
                if (link) {
                    const href = link.getAttribute('href');
                    const articleId = href.split('/').pop().replace('.html', '');
                    const count = this.views[articleId] || 0;
                    const viewsElement = card.querySelector('.article-views');
                    
                    if (viewsElement) {
                        viewsElement.innerHTML = `<i class="far fa-eye"></i> ${this.formatNumber(count)} просмотров`;
                    }
                }
            });
        }
        
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
        
        // Отладочные функции
        debug() {
            console.log('=== DEBUG ===');
            console.log('Session:', this.sessionId);
            console.log('Current article:', this.getArticleId());
            console.log('Local views:', this.views);
            console.log('Total articles:', Object.keys(this.views).length);
            console.log('=== END DEBUG ===');
        }
        
        forceSync() {
            console.log('Force sync started');
            this.fetchServerViews().then(serverViews => {
                if (serverViews) {
                    Object.entries(serverViews).forEach(([id, data]) => {
                        const serverCount = data.total || data;
                        this.views[id] = Math.max(this.views[id] || 0, serverCount);
                    });
                    this.saveViews();
                    this.updateAllCounts();
                    alert('Синхронизация завершена!');
                } else {
                    alert('Не удалось получить данные с сервера');
                }
            });
        }
    }
    
    // Инициализируем после загрузки страницы
    document.addEventListener('DOMContentLoaded', function() {
        window.exactViewsCounter = new ExactViewsCounter();
        
        // Добавляем отладочные функции
        window.debugViews = () => window.exactViewsCounter.debug();
        window.forceSyncViews = () => window.exactViewsCounter.forceSync();
        
        console.log('Views counter ready! Use debugViews() or forceSyncViews()');
    });
    
    // Если DOM уже загружен
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        window.exactViewsCounter = new ExactViewsCounter();
    }
})();