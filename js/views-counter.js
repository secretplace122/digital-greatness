(function() {
  'use strict';
  
  const API_URL = 'https://script.google.com/macros/s/AKfycbwuXSgCgx-PQ7fxFhOU6YVcubuv03N4h4dea0ZHM04eQmEYcV0luTBU_9jZRPjBDsf8rQ/exec';
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
  
  function init() {
    console.log('Счетчик просмотров инициализирован');
    
    loadViewsFromAPI();
    
    countCurrentView();
    
    setInterval(loadViewsFromAPI, 30000);
  }
  
  function loadViewsFromAPI() {
    const callbackName = 'viewsCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    window[callbackName] = function(data) {
      console.log('Получены данные просмотров:', data);
      if (data && data.success && data.views) {
        updateAllViewCounters(data.views);
      }
      delete window[callbackName];
    };
    
    const script = document.createElement('script');
    script.src = API_URL + '?action=getAll&callback=' + callbackName;
    script.onerror = function() {
      console.warn('Не удалось загрузить данные просмотров');
      delete window[callbackName];
    };
    
    document.head.appendChild(script);
  }
  
  function countCurrentView() {
    const articleId = getCurrentArticleId();
    if (!articleId) return;
    
    const sessionKey = 'viewed_' + articleId;
    if (sessionStorage.getItem(sessionKey)) {
      console.log('Просмотр уже засчитан для:', articleId);
      return;
    }
    
    const img = new Image();
    const timestamp = Date.now();
    img.src = API_URL + '?action=increment&article=' + encodeURIComponent(articleId) + 
              '&session=sess_' + timestamp + '&t=' + timestamp;
    
    sessionStorage.setItem(sessionKey, '1');
    console.log('Новый просмотр засчитан для:', articleId);

    setTimeout(() => loadViewsFromAPI(), 1000);
  }

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: Теперь определяет статью по пути папки
  function getCurrentArticleId() {
    const url = window.location.href;
    
    // Если это главная страница блога (/blog/ или /blog/index.html)
    if (url.includes('/blog/') && 
        (url.endsWith('/blog/') || 
         url.endsWith('/blog') || 
         url.endsWith('/blog/index.html') ||
         url.endsWith('/blog.html'))) {
      console.log('Это главная страница блога, не считаем просмотр');
      return null;
    }
    
    // Если это страница статьи (находим название папки)
    if (url.includes('/blog/')) {
      // Убираем домен и путь до /blog/
      const path = url.split('/blog/')[1];
      if (!path) return null;
      
      // Получаем первую часть пути (название папки статьи)
      const articleSlug = path.split('/')[0];
      
      // Очищаем от .html и других параметров
      const cleanSlug = articleSlug
        .replace(/\.html$/i, '')
        .replace(/\?.*$/, '')
        .replace(/\#.*$/, '')
        .trim();
      
      if (!cleanSlug) return null;
      
      console.log('Определена статья:', cleanSlug, 'из URL:', url);
      return cleanSlug;
    }
    
    // Если это не страница блога
    return null;
  }
  
  function updateAllViewCounters(views) {
    console.log('Обновляю счетчики для:', Object.keys(views).length, 'статей');
    
    // Обновляем счетчики на главной странице блога
    document.querySelectorAll('.article-card').forEach(card => {
      const link = card.querySelector('a[href*="/"]');
      if (link) {
        const href = link.getAttribute('href');
        // Извлекаем slug статьи из ссылки (например, /blog/yandexwordstat/ -> yandexwordstat)
        const match = href.match(/\/blog\/([^\/]+)/);
        if (match) {
          const articleId = match[1];
          const count = views[articleId] || 0;
          
          const viewsEl = card.querySelector('.exact-count');
          if (viewsEl) {
            viewsEl.textContent = formatNumber(count);
          }
        }
      }
    });
    
    // Обновляем счетчик на странице статьи
    const currentArticleId = getCurrentArticleId();
    if (currentArticleId && views[currentArticleId] !== undefined) {
      const count = views[currentArticleId];
      
      document.querySelectorAll('.exact-count').forEach(el => {
        el.textContent = formatNumber(count);
      });
      
      const articleViews = document.querySelector('.article-views .exact-count');
      if (articleViews) {
        articleViews.textContent = formatNumber(count);
      }
    }
  }
  
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  
  window.debugViews = function() {
    console.log('Текущая статья:', getCurrentArticleId());
    console.log('Перезагружаю данные...');
    loadViewsFromAPI();
  };
  
  window.forceCount = function() {
    sessionStorage.clear();
    countCurrentView();
  };
  
})();