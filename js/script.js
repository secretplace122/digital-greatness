const FORM_HANDLER_URL = 'https://script.google.com/macros/s/AKfycbxV5Uwpn-4ZIR0v_wjhYjh9nvNnD7898FUnz22utve3n4lW5JPxgQJ-BU6Zh2ZXQqPX/exec';

function initApp() {
    console.log('Digital Greatness инициализирован');
    initMobileMenu();
    initSlides();
    initPlanModal();
    initAuditForm();
    initSmoothScroll();
    updateCurrentYear();
    optimizeForMobile();
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            const isActive = nav.classList.contains('active');
            nav.classList.toggle('active');
            menuToggle.innerHTML = isActive
                ? '<i class="fas fa-bars"></i>'
                : '<i class="fas fa-times"></i>';
            document.body.style.overflow = isActive ? 'auto' : 'hidden';
        });
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = 'auto';
            });
        });
    }
}

function initSlides() {
    const slides = document.querySelectorAll('.screen-slide');
    if (slides.length === 0) return;
    let currentSlide = 0;
    function showNextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    setInterval(showNextSlide, 3000);
}

function initPlanModal() {
    const selectPlanButtons = document.querySelectorAll('.select-plan');
    const planModal = document.getElementById('planModal');
    const selectedPlanName = document.getElementById('selectedPlanName');
    const modalClose = document.querySelector('.modal-close');
    const goToAudit = document.getElementById('goToAudit');
    if (!planModal) return;
    selectPlanButtons.forEach(button => {
        button.addEventListener('click', function () {
            const plan = this.getAttribute('data-plan');
            if (selectedPlanName) {
                selectedPlanName.textContent = plan;
            }
            planModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    if (modalClose) {
        modalClose.addEventListener('click', function () {
            planModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    window.addEventListener('click', function (event) {
        if (event.target === planModal) {
            planModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    if (goToAudit) {
        goToAudit.addEventListener('click', function () {
            planModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            const auditSection = document.getElementById('audit');
            if (auditSection) {
                auditSection.scrollIntoView({
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    const businessInput = document.getElementById('business');
                    if (businessInput) {
                        businessInput.focus();
                    }
                }, 500);
            }
        });
    }
}

function initAuditForm() {
    const auditForm = document.getElementById('auditForm');
    if (auditForm) {
        auditForm.addEventListener('submit', handleFormSubmit);
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('http') || href === '#' || href === '#!') return;
            
            let targetId;
            
            if (href.startsWith('/#')) {
                targetId = href.substring(2);
            } else if (href.startsWith('#')) {
                targetId = href.substring(1);
            } else {
                return;
            }
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const header = document.querySelector('header.header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                if (history.pushState) {
                    history.pushState(null, null, '#' + targetId);
                } else {
                    window.location.hash = '#' + targetId;
                }
                
                const nav = document.querySelector('.nav');
                const menuToggle = document.getElementById('menuToggle');
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    if (menuToggle) {
                        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                    document.body.style.overflow = 'auto';
                }
            }
        });
    });
}

function updateCurrentYear() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}


function optimizeForMobile() {
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
        const menuToggle = document.getElementById('menuToggle');
        const nav = document.querySelector('.nav');
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
                    showSaveDataMessage();
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
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors',
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
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }, 1000);
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showMessage(
            '⚠️ Ошибка отправки. Пожалуйста, напишите нам напрямую в Telegram: @digital_greatness',
            'error'
        );
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
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

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM загружен, инициализируем приложение...');
    setTimeout(initApp, 100);
});

window.DigitalGreatness = {
    initApp,
    showMessage,
    animateSuccess,
    testConnection
};