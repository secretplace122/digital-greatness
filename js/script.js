const FORM_HANDLER_URL = 'https://script.google.com/macros/s/AKfycbxV5Uwpn-4ZIR0v_wjhYjh9nvNnD7898FUnz22utve3n4lW5JPxgQJ-BU6Zh2ZXQqPX/exec';

function initApp() {
    console.log('Digital Greatness инициализирован');
    
    // Самые важные функции первыми
    updateCurrentYear();
    initMobileMenu();
    
    // Остальные функции с задержкой
    setTimeout(() => {
        initSlides();
        initPlanModal();
        initAuditForm();
        initSmoothScroll();
        optimizeForMobile(); // Упрощенная версия
    }, 50);
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
        
        // Только для мобильных, а не для всех ссылок
        if (window.innerWidth < 768) {
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
    // Запускаем только если страница видима
    if (!document.hidden) {
        setInterval(showNextSlide, 3000);
    }
}

function initPlanModal() {
    const selectPlanButtons = document.querySelectorAll('.select-plan');
    const planModal = document.getElementById('planModal');
    const selectedPlanName = document.getElementById('selectedPlanName');
    const modalClose = document.querySelector('.modal-close');
    const goToAudit = document.getElementById('goToAudit');
    
    if (!planModal) return;
    
    // Делегирование событий вместо forEach
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('select-plan')) {
            const plan = e.target.getAttribute('data-plan');
            if (selectedPlanName) {
                selectedPlanName.textContent = plan;
            }
            planModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
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
                // Убрал setTimeout для фокуса - это не критично
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
    // Более простая версия
    document.addEventListener('click', function(e) {
        let target = e.target;
        // Ищем ближайшую ссылку
        while (target && target.tagName !== 'A') {
            target = target.parentElement;
        }
        
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (!href || href.startsWith('http') || href === '#' || href === '#!') return;
        
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
            }
            
            // Закрываем меню если открыто
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
}

function updateCurrentYear() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

function optimizeForMobile() {
    // Только самое необходимое
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

function showMessage(text, type = 'info') {
    const oldMsg = document.querySelector('.form-message');
    if (oldMsg) oldMsg.remove();
    
    const message = document.createElement('div');
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
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 90%;
        ">
            <i class="fas ${icon}" style="flex-shrink: 0;"></i>
            <span>${text}</span>
        </div>
    `;
    
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 5000);
}

function animateSuccess() {
    const checkmark = document.createElement('div');
    checkmark.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">
            <i class="fas fa-check" style="color: white; font-size: 30px;"></i>
        </div>
    `;
    
    document.body.appendChild(checkmark);
    setTimeout(() => {
        checkmark.remove();
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
        source: 'digital-greatness.ru'
    };
    
    if (!formData.business || !formData.contact) {
        showMessage('Пожалуйста, заполните все обязательные поля', 'error');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        return;
    }
    
    // Отправляем асинхронно, не блокируя UI
    setTimeout(async () => {
        try {
            await fetch(FORM_HANDLER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'no-cors',
                body: JSON.stringify(formData)
            });
            
            showMessage('✅ Заявка отправлена! Мы свяжемся с вами в течение 24 часов.', 'success');
            animateSuccess();
            
            setTimeout(() => {
                auditForm.reset();
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }, 1000);
            
        } catch (error) {
            showMessage('⚠️ Ошибка отправки. Напишите нам в Telegram: @digital_greatness', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }, 10);
}

// Инициализируем сразу, не ждем DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM загружен');
        initApp();
    });
} else {
    console.log('DOM уже загружен');
    setTimeout(initApp, 10);
}