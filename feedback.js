// Конфигурация API
const API_BASE_URL = 'http://localhost:3000';

// Минимальное количество символов для отзыва
const MIN_FEEDBACK_LENGTH = 30;

// Глобальные переменные
let currentUser = null;
let purchasedServices = [];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupForm();
    setupEmailValidation();
    setupFeedbackValidation();
});

// Настройка формы
function setupForm() {
    const form = document.getElementById('feedback-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
}

// Настройка валидации email
function setupEmailValidation() {
    const emailInput = document.getElementById('user-email');
    if (emailInput) {
        let emailTimeout;
        emailInput.addEventListener('input', (e) => {
            clearTimeout(emailTimeout);
            emailTimeout = setTimeout(async () => {
                await validateEmailAndLoadServices(e.target.value);
            }, 500);
        });
    }
}

// Валидация email и загрузка услуг
async function validateEmailAndLoadServices(email) {
    const emailError = document.getElementById('user-email-error');
    const serviceSelect = document.getElementById('service-select');
    const serviceHint = document.getElementById('service-hint');
    
    if (!email || !validateEmailFormat(email)) {
        emailError.textContent = 'Неверный формат email';
        serviceSelect.innerHTML = '<option value="">-- Выберите услугу --</option>';
        serviceSelect.disabled = true;
        currentUser = null;
        purchasedServices = [];
        checkFormValidity();
        return;
    }
    
    try {
        // Проверяем пользователя
        const usersResponse = await fetch(`${API_BASE_URL}/users?email=${email}`);
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            if (users.length > 0) {
                currentUser = users[0];
                
                // Проверяем роль пользователя
                if (currentUser.role === 'администратор' || currentUser.role === 'admin') {
                    emailError.textContent = 'Администраторы не могут оставлять отзывы';
                    serviceSelect.innerHTML = '<option value="">-- Выберите услугу --</option>';
                    serviceSelect.disabled = true;
                    purchasedServices = [];
                    checkFormValidity();
                    return;
                }
            }
        }
        
        // Загружаем заказы
        const ordersResponse = await fetch(`${API_BASE_URL}/orders`);
        if (ordersResponse.ok) {
            const orders = await ordersResponse.json();
            
            // Собираем все купленные услуги
            const purchasedServiceIds = new Set();
            orders.forEach(order => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        purchasedServiceIds.add(item.serviceId);
                    });
                }
            });
            
            if (purchasedServiceIds.size === 0) {
                emailError.textContent = 'У вас нет купленных услуг';
                serviceSelect.innerHTML = '<option value="">-- Выберите услугу --</option>';
                serviceSelect.disabled = true;
                purchasedServices = [];
                checkFormValidity();
                return;
            }
            
            // Загружаем информацию об услугах
            purchasedServices = [];
            for (const serviceId of purchasedServiceIds) {
                try {
                    const serviceResponse = await fetch(`${API_BASE_URL}/services/${serviceId}`);
                    if (serviceResponse.ok) {
                        const service = await serviceResponse.json();
                        purchasedServices.push(service);
                    }
                } catch (error) {
                    console.error(`Ошибка при загрузке услуги ${serviceId}:`, error);
                }
            }
            
            // Заполняем список услуг
            serviceSelect.innerHTML = '<option value="">-- Выберите услугу --</option>';
            purchasedServices.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.name;
                serviceSelect.appendChild(option);
            });
            
            serviceSelect.disabled = false;
            emailError.textContent = '';
            serviceHint.textContent = `Доступно услуг для отзыва: ${purchasedServices.length}`;
            
        } else {
            throw new Error('Не удалось загрузить заказы');
        }
        
    } catch (error) {
        console.error('Ошибка при проверке email:', error);
        emailError.textContent = 'Ошибка при проверке данных. Убедитесь, что JSON Server запущен.';
        serviceSelect.innerHTML = '<option value="">-- Выберите услугу --</option>';
        serviceSelect.disabled = true;
        purchasedServices = [];
    }
    
    checkFormValidity();
}

// Валидация формата email
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Настройка валидации отзыва
function setupFeedbackValidation() {
    const feedbackText = document.getElementById('feedback-text');
    const charCount = document.getElementById('char-count');
    
    if (feedbackText) {
        feedbackText.addEventListener('input', (e) => {
            const length = e.target.value.length;
            charCount.textContent = length;
            
            if (length < MIN_FEEDBACK_LENGTH) {
                charCount.style.color = '#E22D26';
            } else {
                charCount.style.color = 'inherit';
            }
            
            validateField('feedback-text');
        });
    }
    
    // Валидация при изменении других полей
    ['service-select', 'rating'].forEach(fieldName => {
        const field = document.getElementById(fieldName) || document.querySelector(`input[name="${fieldName}"]`);
        if (field) {
            field.addEventListener('change', () => {
                validateField(fieldName);
            });
        }
    });
}

// Валидация поля
function validateField(fieldName) {
    let isValid = true;
    let errorMessage = '';
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    switch (fieldName) {
        case 'user-email':
            const email = document.getElementById('user-email').value.trim();
            if (!email) {
                isValid = false;
                errorMessage = 'Это поле обязательно для заполнения';
            } else if (!validateEmailFormat(email)) {
                isValid = false;
                errorMessage = 'Неверный формат email';
            }
            break;
            
        case 'service-select':
            const serviceId = document.getElementById('service-select').value;
            if (!serviceId) {
                isValid = false;
                errorMessage = 'Необходимо выбрать услугу';
            }
            break;
            
        case 'rating':
            const rating = document.querySelector('input[name="rating"]:checked');
            if (!rating) {
                isValid = false;
                errorMessage = 'Необходимо выбрать оценку';
            }
            break;
            
        case 'feedback-text':
            const text = document.getElementById('feedback-text').value.trim();
            if (!text) {
                isValid = false;
                errorMessage = 'Это поле обязательно для заполнения';
            } else if (text.length < MIN_FEEDBACK_LENGTH) {
                isValid = false;
                errorMessage = `Минимум ${MIN_FEEDBACK_LENGTH} символов. Сейчас: ${text.length}`;
            }
            break;
    }
    
    if (errorElement) {
        if (isValid) {
            errorElement.textContent = '';
        } else {
            errorElement.textContent = errorMessage;
        }
    }
    
    checkFormValidity();
    return isValid;
}

// Проверка валидности всей формы
function checkFormValidity() {
    const email = document.getElementById('user-email').value.trim();
    const serviceId = document.getElementById('service-select').value;
    const rating = document.querySelector('input[name="rating"]:checked');
    const feedbackText = document.getElementById('feedback-text').value.trim();
    
    let isValid = true;
    
    // Проверяем все поля
    if (!email || !validateEmailFormat(email)) {
        isValid = false;
    }
    
    if (!serviceId) {
        isValid = false;
    }
    
    if (!rating) {
        isValid = false;
    }
    
    if (!feedbackText || feedbackText.length < MIN_FEEDBACK_LENGTH) {
        isValid = false;
    }
    
    // Проверяем отсутствие ошибок
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        if (error.textContent.trim()) {
            isValid = false;
        }
    });
    
    // Проверяем, что пользователь не администратор
    if (currentUser && (currentUser.role === 'администратор' || currentUser.role === 'admin')) {
        isValid = false;
    }
    
    // Проверяем, что услуга была куплена
    if (serviceId && !purchasedServices.find(s => s.id === parseInt(serviceId, 10))) {
        isValid = false;
    }
    
    // Активируем/деактивируем кнопку
    const submitBtn = document.getElementById('submit-feedback-btn');
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
}

// Обработка отправки формы
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!checkFormValidity()) {
        return;
    }
    
    const email = document.getElementById('user-email').value.trim();
    const serviceId = parseInt(document.getElementById('service-select').value, 10);
    const rating = parseInt(document.querySelector('input[name="rating"]:checked').value, 10);
    const feedbackText = document.getElementById('feedback-text').value.trim();
    
    // Находим выбранную услугу
    const selectedService = purchasedServices.find(s => s.id === serviceId);
    if (!selectedService) {
        alert('Ошибка: услуга не найдена');
        return;
    }
    
    // Проверяем, что услуга была куплена (хотя бы раз в любом заказе)
    const ordersResponse = await fetch(`${API_BASE_URL}/orders`);
    if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        let isPurchased = false;
        
        for (const order of orders) {
            if (order.items && Array.isArray(order.items)) {
                const hasService = order.items.some(item => item.serviceId === serviceId);
                if (hasService) {
                    isPurchased = true;
                    break;
                }
            }
        }
        
        if (!isPurchased) {
            alert('Ошибка: эта услуга не была куплена. Отзыв можно оставить только на купленные услуги.');
            return;
        }
    } else {
        alert('Ошибка: не удалось проверить историю покупок');
        return;
    }
    
    // Проверяем роль пользователя еще раз
    if (currentUser && (currentUser.role === 'администратор' || currentUser.role === 'admin')) {
        alert('Администраторы не могут оставлять отзывы');
        return;
    }
    
    // Формируем данные отзыва
    const feedbackData = {
        serviceId: serviceId,
        serviceName: selectedService.name,
        userEmail: email,
        username: currentUser ? currentUser.username : null,
        rating: rating,
        comment: feedbackText,
        date: new Date().toISOString(),
        status: 'на модерации'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });
        
        if (response.ok) {
            alert('Отзыв успешно отправлен! Спасибо за ваш отзыв.');
            // Очищаем форму
            document.getElementById('feedback-form').reset();
            document.getElementById('service-select').innerHTML = '<option value="">-- Выберите услугу --</option>';
            document.getElementById('service-select').disabled = true;
            document.getElementById('char-count').textContent = '0';
            currentUser = null;
            purchasedServices = [];
            checkFormValidity();
        } else {
            const error = await response.json();
            alert('Ошибка при отправке отзыва: ' + (error.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка при отправке отзыва:', error);
        alert('Не удалось отправить отзыв. Убедитесь, что JSON Server запущен.');
    }
}

