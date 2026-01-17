(function() {
  'use strict';
  
  const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbwuXSgCgx-PQ7fxFhOU6YVcubuv03N4h4dea0ZHM04eQmEYcV0luTBU_9jZRPjBDsf8rQ/exec',
    STORAGE_KEY: 'blog_views_cache',
    SESSION_KEY: 'blog_session_id'
  };
  
  const Utils = {
    getSessionId() {
      let id = sessionStorage.getItem(CONFIG.SESSION_KEY);
      if (!id) {
        id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem(CONFIG.SESSION_KEY, id);
      }
      return id;
    },
    
    getArticleId() {
      const path = window.location.pathname.split('/').pop();
      if (!path || path === 'blog.html' || path === 'blog') return null;
      return path.replace('.html', '');
    },
    
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },
    
    getLocalViews() {
      try {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
      } catch {
        return {};
      }
    },
    
    saveLocalViews(views) {
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(views));
      } catch (e) {
        console.warn('Cannot save views:', e);
      }
    }
  };
  
  class ViewsCounter {
    constructor() {
      this.localViews = Utils.getLocalViews();
      this.sessionId = Utils.getSessionId();
      this.serverViews = {};
      this.init();
    }
    
    async init() {
      console.log('ViewsCounter: Initializing...');
      
      this.updateUI();

      this.loadServerViews();
      
      this.handleCurrentPage();
    }
    
    async loadServerViews() {
      try {
        const response = await this.fetchServerData('getAll');
        if (response && response.views) {
          this.serverViews = response.views;
          
          Object.entries(this.serverViews).forEach(([articleId, serverCount]) => {
            const current = this.localViews[articleId] || 0;
            this.localViews[articleId] = Math.max(current, serverCount);
          });
          
          Utils.saveLocalViews(this.localViews);
          this.updateUI();
        }
      } catch (error) {
        console.warn('Cannot load server views:', error);
      }
    }
    
    async fetchServerData(action, params = {}) {
      return new Promise((resolve) => {
        const callbackName = 'cb_' + Date.now();
        const script = document.createElement('script');
        
        const urlParams = new URLSearchParams({
          action: action,
          callback: callbackName,
          ...params,
          _: Date.now()
        });
        
        window[callbackName] = (data) => {
          delete window[callbackName];
          document.body.removeChild(script);
          resolve(data);
        };
        
        script.src = CONFIG.API_URL + '?' + urlParams.toString();
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
        }, 5000);
      });
    }
    
    handleCurrentPage() {
      const articleId = Utils.getArticleId();
      
      if (articleId) {
        this.incrementView(articleId);
      }
    }
    
    async incrementView(articleId) {
      if (!articleId) return;
      
      const sessionKey = 'viewed_' + articleId;
      if (sessionStorage.getItem(sessionKey)) {
        console.log('Already counted in this session:', articleId);
        return this.localViews[articleId] || 0;
      }
      
      this.localViews[articleId] = (this.localViews[articleId] || 0) + 1;
      Utils.saveLocalViews(this.localViews);
      sessionStorage.setItem(sessionKey, '1');
      
      this.updateUI();
      
      this.sendToServer(articleId).catch(() => {
        const pending = JSON.parse(localStorage.getItem('pending_views') || '[]');
        pending.push({ articleId, timestamp: Date.now() });
        localStorage.setItem('pending_views', JSON.stringify(pending.slice(-50)));
      });
      
      console.log('View counted:', articleId, 'count:', this.localViews[articleId]);
      return this.localViews[articleId];
    }
    
    async sendToServer(articleId) {
      const img = new Image();
      const params = new URLSearchParams({
        action: 'increment',
        article: articleId,
        session: this.sessionId,
        t: Date.now()
      });
      
      img.src = CONFIG.API_URL + '?' + params.toString();
      img.style.display = 'none';
      document.body.appendChild(img);
      
      setTimeout(() => {
        if (img.parentNode) img.parentNode.removeChild(img);
      }, 1000);
      
      return true;
    }
    
    updateUI() {
      const articleId = Utils.getArticleId();
      
      if (articleId) {
        const count = this.localViews[articleId] || 0;
        this.updateElement(`.article-views .exact-count, .views-count`, count);
      } else {
        this.updateAllCards();
      }
    }
    
    updateElement(selector, count) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.textContent = Utils.formatNumber(count);
        
        const parent = el.closest('.article-views');
        if (parent && !parent.querySelector('.exact-count')) {
          parent.innerHTML = `<i class="far fa-eye"></i> <span class="exact-count">${Utils.formatNumber(count)}</span> просмотров`;
        }
      });
    }
    
    updateAllCards() {
      document.querySelectorAll('.article-card').forEach(card => {
        const link = card.querySelector('a[href*=".html"]');
        if (link) {
          const href = link.getAttribute('href');
          const articleId = href.split('/').pop().replace('.html', '');
          const count = this.localViews[articleId] || 0;
          const viewsEl = card.querySelector('.article-views');
          
          if (viewsEl) {
            let countSpan = viewsEl.querySelector('.exact-count');
            if (!countSpan) {
              countSpan = document.createElement('span');
              countSpan.className = 'exact-count';
              
              const icon = viewsEl.querySelector('i') || document.createElement('i');
              icon.className = 'far fa-eye';
              viewsEl.innerHTML = '';
              viewsEl.appendChild(icon);
              viewsEl.appendChild(document.createTextNode(' '));
              viewsEl.appendChild(countSpan);
              viewsEl.appendChild(document.createTextNode(' просмотров'));
            }
            
            countSpan.textContent = Utils.formatNumber(count);
          }
        }
      });
    }
    
    debug() {
      console.log('=== ViewsCounter Debug ===');
      console.log('Session:', this.sessionId);
      console.log('Local views:', this.localViews);
      console.log('Server views:', this.serverViews);
      console.log('Current article:', Utils.getArticleId());
      console.log('==========================');
    }
    
    forceRefresh() {
      this.loadServerViews().then(() => {
        alert('Данные обновлены!');
      });
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.viewsCounter = new ViewsCounter();
    });
  } else {
    window.viewsCounter = new ViewsCounter();
  }
  
  window.debugViews = () => window.viewsCounter?.debug();
  window.refreshViews = () => window.viewsCounter?.forceRefresh();
  
})();