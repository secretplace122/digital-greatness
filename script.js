// DOM готов
document.addEventListener('DOMContentLoaded', function () {

    // 1. Мобильное меню
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            nav.classList.toggle('active');
            menuToggle.innerHTML = nav.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Закрытие меню при клике на ссылку
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // 2. Анимация слайдов в устройстве
    const slides = document.querySelectorAll('.screen-slide');
    let currentSlide = 0;

    function showNextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Запуск слайдшоу каждые 3 секунды
    if (slides.length > 0) {
        setInterval(showNextSlide, 3000);
    }

    // 3. Выбор плана (кнопки "Выбрать пакет")
    const selectPlanButtons = document.querySelectorAll('.select-plan');
    const planModal = document.getElementById('planModal');
    const selectedPlanName = document.getElementById('selectedPlanName');
    const modalClose = document.querySelector('.modal-close');
    const goToAudit = document.getElementById('goToAudit');

    selectPlanButtons.forEach(button => {
        button.addEventListener('click', function () {
            const plan = this.getAttribute('data-plan');
            selectedPlanName.textContent = plan;
            planModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    // Закрытие модального окна
    modalClose.addEventListener('click', function () {
        planModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Клик вне модального окна
    window.addEventListener('click', function (event) {
        if (event.target === planModal) {
            planModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Переход к форме аудита
    goToAudit.addEventListener('click', function () {
        planModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Плавная прокрутка к форме
        document.getElementById('audit').scrollIntoView({
            behavior: 'smooth'
        });

        // Фокус на поле ввода
        setTimeout(() => {
            document.getElementById('business').focus();
        }, 500);
    });

    // 4. Обработка формы аудита
    const auditForm = document.getElementById('auditForm');

    if (auditForm) {
        auditForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Сбор данных
            const formData = {
                business: document.getElementById('business').value,
                link: document.getElementById('link').value,
                contact: document.getElementById('contact').value,
                date: new Date().toISOString()
            };

            // В реальном проекте здесь будет отправка на сервер
            console.log('Данные формы:', formData);

            // Показываем сообщение об успехе
            const submitButton = auditForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;

            submitButton.innerHTML = '<i class="fas fa-check"></i> Отправлено!';
            submitButton.disabled = true;
            submitButton.style.backgroundColor = '#10b981';

            // В реальном проекте:
            // 1. Отправить данные в Telegram-бота через API
            // 2. Или отправить на email
            // 3. Или сохранить в Google Sheets

            // Имитация отправки
            setTimeout(() => {
                // Сброс формы
                auditForm.reset();

                // Восстановление кнопки через 2 секунды
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                    submitButton.style.backgroundColor = '';
                }, 2000);
            }, 1500);

            // Можно добавить отправку в Telegram
            // sendToTelegram(formData);
        });
    }

    // 5. Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            e.preventDefault();
            const targetElement = document.querySelector(href);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. Обновление года в футере
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // 7. Анимация при скролле (появление элементов)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Наблюдаем за секциями
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// Функция для отправки данных в Telegram (пример)
function sendToTelegram(formData) {
    // Токен бота и ID чата (заменить на реальные)
    const botToken = 'YOUR_BOT_TOKEN';
    const chatId = 'YOUR_CHAT_ID';

    const message = `📊 Новая заявка на аудит:\n\n` +
        `Бизнес: ${formData.business}\n` +
        `Ссылка: ${formData.link || 'не указана'}\n` +
        `Контакты: ${formData.contact}\n` +
        `Время: ${new Date(formData.date).toLocaleString('ru-RU')}`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Сообщение отправлено в Telegram:', data);
        })
        .catch(error => {
            console.error('Ошибка отправки в Telegram:', error);
        });
}
// Мобильные оптимизации
function optimizeForMobile() {
    // 1. Улучшаем touch события
    document.addEventListener('touchstart', function () { }, { passive: true });

    // 2. Предотвращаем двойной тап для зума
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // 3. Оптимизация скролла на iOS
    document.documentElement.style.scrollBehavior = 'smooth';

    // 4. Улучшенная обработка форм на мобильных
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            // Прокручиваем к полю ввода на мобильных
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    this.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300);
            }
        });

        // Убираем автозаполнение в iOS
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('spellcheck', 'false');
    });

    // 5. Адаптивное меню с touch-свайпом
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;

        if (touchStartX - touchEndX > swipeThreshold) {
            // Свайп влево - закрываем меню если открыто
            const nav = document.querySelector('.nav');
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                const menuToggle = document.getElementById('menuToggle');
                if (menuToggle) {
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        }
    }

    // 6. Улучшенная отправка формы для мобильных
    const auditForm = document.getElementById('auditForm');
    if (auditForm && 'connection' in navigator) {
        // Определяем скорость соединения
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        auditForm.addEventListener('submit', function (e) {
            if (connection && connection.saveData === true) {
                // Режим экономии трафика
                showSaveDataMessage();
            }
        });
    }

    // 7. Ленивая загрузка для мобильных
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function () {
    // Вызываем мобильную оптимизацию
    optimizeForMobile();

    // Определяем мобильное устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        document.documentElement.classList.add('mobile-device');

        // Убираем hover эффекты на тач-устройствах
        const style = document.createElement('style');
        style.textContent = `
            @media (hover: none) and (pointer: coarse) {
                .btn:hover, .nav-list a:hover, .pricing-card:hover {
                    transform: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Остальной код из предыдущей версии...
    // [вставить весь предыдущий JavaScript код здесь]

    // 8. Улучшенная навигация для мобильных
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');

    if (menuToggle) {
        // Touch событие вместо click для лучшего отклика
        menuToggle.addEventListener('touchstart', function (e) {
            e.preventDefault();
            nav.classList.toggle('active');
            this.innerHTML = nav.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';

            // Блокируем скролл при открытом меню
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });

        // Также оставляем click для десктопов
        menuToggle.addEventListener('click', function (e) {
            if (!isMobile) {
                nav.classList.toggle('active');
                this.innerHTML = nav.classList.contains('active')
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>';
            }
        });
    }

    // 9. Адаптивный текстовый ввод для мобильных
    const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    textInputs.forEach(input => {
        input.addEventListener('focus', function () {
            // Для iOS - правильная клавиатура
            if (this.type === 'tel') {
                this.setAttribute('pattern', '[0-9]*');
                this.setAttribute('inputmode', 'numeric');
            }
        });
    });
});

// Вспомогательные функции
function showSaveDataMessage() {
    const message = document.createElement('div');
    message.className = 'save-data-message';
    message.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 10px 15px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <i class="fas fa-leaf"></i> Режим экономии трафика включен
        </div>
    `;
    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Определяем тип соединения
if ('connection' in navigator) {
    const connection = navigator.connection;

    connection.addEventListener('change', function () {
        console.log('Тип соединения изменился:', connection.effectiveType);

        // Можем адаптировать контент под скорость соединения
        if (connection.effectiveType === '4g') {
            // Загружаем больше контента
        } else if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
            // Упрощаем контент
            document.querySelectorAll('.device-mockup, .hero-visual').forEach(el => {
                el.style.opacity = '0.7';
            });
        }
    });
}