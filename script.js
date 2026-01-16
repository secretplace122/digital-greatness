const FORM_HANDLER_URL = 'https://script.google.com/macros/s/AKfycbxV5Uwpn-4ZIR0v_wjhYjh9nvNnD7898FUnz22utve3n4lW5JPxgQJ-BU6Zh2ZXQqPX/exec';

document.addEventListener('DOMContentLoaded', function () {
    console.log('Digital Greatness инициализирован');

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

    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            if (menuToggle) {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    const slides = document.querySelectorAll('.screen-slide');
    let currentSlide = 0;

    function showNextSlide() {
        if (slides.length > 0) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }
    }

    if (slides.length > 0) {
        setInterval(showNextSlide, 3000);
    }

    const selectPlanButtons = document.querySelectorAll('.select-plan');
    const planModal = document.getElementById('planModal');
    const selectedPlanName = document.getElementById('selectedPlanName');
    const modalClose = document.querySelector('.modal-close');
    const goToAudit = document.getElementById('goToAudit');

    selectPlanButtons.forEach(button => {
        button.addEventListener('click', function () {
            const plan = this.getAttribute('data-plan');
            if (selectedPlanName) {
                selectedPlanName.textContent = plan;
            }
            if (planModal) {
                planModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', function () {
            if (planModal) {
                planModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    window.addEventListener('click', function (event) {
        if (planModal && event.target === planModal) {
            planModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    if (goToAudit) {
        goToAudit.addEventListener('click', function () {
            if (planModal) {
                planModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            document.getElementById('audit').scrollIntoView({
                behavior: 'smooth'
            });

            setTimeout(() => {
                const businessInput = document.getElementById('business');
                if (businessInput) {
                    businessInput.focus();
                }
            }, 500);
        });
    }

    const auditForm = document.getElementById('auditForm');
    if (auditForm) {
        auditForm.addEventListener('submit', handleFormSubmit);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;

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

    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    optimizeForMobile();
});

async function handleFormSubmit(e) {
    e.preventDefault();

    const auditForm = e.target;
    const submitButton = auditForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';

    const formData = {
        business: document.getElementById('business')?.value.trim() || '',
        link: document.getElementById('link')?.value.trim() || '',
        contact: document.getElementById('contact')?.value.trim() || '',
        source: 'digital-greatness.ru',
        timestamp: new Date().toISOString()
    };

    if (!formData.business || !formData.contact) {
        showMessage('Пожалуйста, заполните все обязательные поля', 'error');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        return;
    }

    try {
        console.log('Отправка данных:', formData);

        const response = await fetch(FORM_HANDLER_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('Запрос отправлен (no-cors mode)');

        showMessage(
            '✅ Заявка отправлена! Мы свяжемся с вами в течение 24 часов.',
            'success'
        );

        animateSuccess();

        setTimeout(() => {
            auditForm.reset();
        }, 1000);

    } catch (error) {
        console.error('Ошибка отправки:', error);

        const fallbackSuccess = await tryFallback(formData);

        if (fallbackSuccess) {
            showMessage(
                '✅ Заявка отправлена (резервный метод)!',
                'success'
            );
            animateSuccess();
            setTimeout(() => auditForm.reset(), 1000);
        } else {
            showMessage(
                '⚠️ Ошибка отправки. Пожалуйста, напишите нам напрямую в Telegram.',
                'error'
            );
        }

    } finally {
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }, 2000);
    }
}
function showMessage(text, type = 'info') {
    const oldMsg = document.querySelector('.form-message');
    if (oldMsg) oldMsg.remove();

    const message = document.createElement('div');
    message.className = `form-message form-message-${type}`;

    const icon = type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    const bgColor = type === 'success' ? '#10b981' :
        type === 'error' ? '#ef4444' : '#3b82f6';

    message.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 90%;
            word-break: break-word;
        ">
            <i class="fas ${icon}" style="flex-shrink: 0;"></i>
            <span>${text}</span>
        </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

function animateSuccess() {
    const checkmark = document.createElement('div');
    checkmark.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: popIn 0.5s ease;
        ">
            <i class="fas fa-check" style="color: white; font-size: 40px;"></i>
        </div>
    `;

    document.body.appendChild(checkmark);

    setTimeout(() => {
        checkmark.style.opacity = '0';
        checkmark.style.transition = 'opacity 0.5s ease';
        setTimeout(() => checkmark.remove(), 500);
    }, 1000);
}

async function tryFallback(formData) {
    try {
        const TEST_BOT_TOKEN = '';
        const TEST_CHAT_ID = '';

        if (!TEST_BOT_TOKEN || !TEST_CHAT_ID) {
            return false;
        }

        const message = `📊 Заявка (резервный метод):\n\n` +
            `Бизнес: ${formData.business}\n` +
            `Контакты: ${formData.contact}\n` +
            `Время: ${new Date().toLocaleString('ru-RU')}`;

        const response = await fetch(`https://api.telegram.org/bot${TEST_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TEST_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        return response.ok;

    } catch (error) {
        console.error('Ошибка резервного метода:', error);
        return false;
    }
}

function optimizeForMobile() {
    document.addEventListener('touchstart', function () { }, { passive: true });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        document.documentElement.classList.add('mobile-device');

        const style = document.createElement('style');
        style.textContent = `
            @media (hover: none) and (pointer: coarse) {
                .btn:hover, .nav-list a:hover, .pricing-card:hover {
                    transform: none !important;
                }
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        const menuToggle = document.getElementById('menuToggle');
        const nav = document.querySelector('.nav');

        if (menuToggle && nav) {
            menuToggle.addEventListener('touchstart', function (e) {
                e.preventDefault();
                nav.classList.toggle('active');
                this.innerHTML = nav.classList.contains('active')
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>';

                document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
            }, { passive: false });
        }

        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function () {
                if (window.innerWidth < 768) {
                    setTimeout(() => {
                        this.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 300);
                }
            });

            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('spellcheck', 'false');

            if (input.type === 'tel') {
                input.setAttribute('pattern', '[0-9]*');
                input.setAttribute('inputmode', 'numeric');
            }
        });

        let touchStartX = 0;
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;

            if (touchStartX - touchEndX > swipeThreshold && nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                if (menuToggle) {
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
                document.body.style.overflow = '';
            }
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
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        if (connection) {
            if (connection.saveData === true) {
                console.log('Режим экономии трафика включен');
            }

            connection.addEventListener('change', function () {
                if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
                    document.querySelectorAll('.device-mockup, .hero-visual').forEach(el => {
                        el.style.opacity = '0.7';
                    });
                }
            });
        }
    }
}

function showSaveDataMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 10px 15px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <i class="fas fa-leaf"></i> Режим экономии трафика
        </div>
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function testConnection() {
    console.log('Тестирование подключения к Google Apps Script...');

    fetch(FORM_HANDLER_URL, { method: 'GET' })
        .then(response => {
            console.log('Сервер отвечает, статус:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('Ответ сервера (первые 500 символов):', text.substring(0, 500));
        })
        .catch(error => {
            console.error('Ошибка подключения:', error);
        });
}
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href.startsWith('http') || href === '#' || href === '#!') return;

        if (href.includes('#')) {
            e.preventDefault();
            const [page, anchor] = href.split('#');
            if (page) {
                window.location.href = page + '#' + anchor;
            } else if (document.querySelector('#' + anchor)) {
                document.querySelector('#' + anchor).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});