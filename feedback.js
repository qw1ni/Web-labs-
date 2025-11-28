// Конфигурация API
const API_BASE_URL = 'http://localhost:3000';

const auth = window.auth || {
    getCurrentUser: () => null,
    isAdmin: () => false
};


// Минимальное количество символов для отзыва
const MIN_FEEDBACK_LENGTH = 30;

// Глобальные переменные
let currentUser = (window.auth && window.auth.getCurrentUser) ? window.auth.getCurrentUser() : null;
let purchasedServices = [];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupForm();
    setupEmailValidation();
    setupFeedbackValidation();
    if (currentUser?.email) {
        const emailInput = document.getElementById('user-email');
        if (emailInput) {
            emailInput.value = currentUser.email;
            validateEmailAndLoadServices(currentUser.email);
        }
    }
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
        emailError.textContent = '???????? ?????? email';
        serviceSelect.innerHTML = '<option value="">-- ???????? ?????? --</option>';
        serviceSelect.disabled = true;
        currentUser = null;
        purchasedServices = [];
        checkFormValidity();
        return;
    }
    
    try {
        const usersResponse = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            currentUser = users.length > 0 ? users[0] : null;
            if (currentUser && auth.isAdmin(currentUser)) {
                emailError.textContent = '?????????????? ?? ????? ????????? ??????';
                serviceSelect.innerHTML = '<option value="">-- ???????? ?????? --</option>';
                serviceSelect.disabled = true;
                purchasedServices = [];
                checkFormValidity();
                return;
            }
        }
        
        const ordersResponse = await fetch(`${API_BASE_URL}/orders?userEmail=${encodeURIComponent(email)}`);
        if (!ordersResponse.ok) {
            throw new Error('?? ??????? ????????? ??????');
        }

        const orders = await ordersResponse.json();
        const purchasedServiceIds = new Set();
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => purchasedServiceIds.add(item.serviceId));
            }
        });
        
        if (purchasedServiceIds.size === 0) {
            emailError.textContent = '? ??? ??? ????????? ?????';
            serviceSelect.innerHTML = '<option value="">-- ???????? ?????? --</option>';
            serviceSelect.disabled = true;
            purchasedServices = [];
            checkFormValidity();
            return;
        }
        
        purchasedServices = [];
        for (const serviceId of purchasedServiceIds) {
            try {
                const serviceResponse = await fetch(`${API_BASE_URL}/services/${serviceId}`);
                if (serviceResponse.ok) {
                    const service = await serviceResponse.json();
                    purchasedServices.push(service);
                }
            } catch (error) {
                console.error(`?????? ??? ???????? ?????? ${serviceId}:`, error);
            }
        }
        
        serviceSelect.innerHTML = '<option value="">-- ???????? ?????? --</option>';
        purchasedServices.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });
        
        serviceSelect.disabled = false;
        emailError.textContent = '';
        serviceHint.textContent = `???????? ????? ??? ??????: ${purchasedServices.length}`;
        
    } catch (error) {
        console.error('?????? ??? ???????? email:', error);
        emailError.textContent = '?????? ??? ???????? ??????. ?????????, ??? JSON Server ???????.';
        serviceSelect.innerHTML = '<option value="">-- ???????? ?????? --</option>';
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
    
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        if (error.textContent.trim()) {
            isValid = false;
        }
    });
    
    if (currentUser && auth.isAdmin && auth.isAdmin(currentUser)) {
        isValid = false;
    }
    
    if (serviceId && !purchasedServices.find(s => s.id === parseInt(serviceId, 10))) {
        isValid = false;
    }
    
    const submitBtn = document.getElementById('submit-feedback-btn');
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
    return isValid;
    
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
    
    const selectedService = purchasedServices.find(s => s.id === serviceId);
    if (!selectedService) {
        alert('??????: ?????? ?? ???????');
        return;
    }
    
    const ordersResponse = await fetch(`${API_BASE_URL}/orders?userEmail=${encodeURIComponent(email)}`);
    if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        const hasPurchase = orders.some(order => Array.isArray(order.items) && order.items.some(item => item.serviceId === serviceId));
        if (!hasPurchase) {
            alert('??????: ??? ?????? ?? ???? ???????. ????? ????? ???????? ?????? ?? ????????? ??????.');
            return;
        }
    } else {
        alert('??????: ?? ??????? ????????? ??????? ???????');
        return;
    }
    
    if (currentUser && auth.isAdmin && auth.isAdmin(currentUser)) {
        alert('?????????????? ?? ????? ????????? ??????');
        return;
    }
    
    const feedbackData = {
        serviceId: serviceId,
        serviceName: selectedService.name,
        userId: currentUser ? currentUser.id : null,
        userEmail: email,
        username: currentUser ? currentUser.username : null,
        rating: rating,
        comment: feedbackText,
        date: new Date().toISOString(),
        status: '?? ?????????'
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
            alert('????? ??????? ?????????! ??????? ?? ??? ?????.');
            document.getElementById('feedback-form').reset();
            document.getElementById('service-select').innerHTML = '<option value="">-- ???????? ?????? --</option>';
            document.getElementById('service-select').disabled = true;
            document.getElementById('char-count').textContent = '0';
            if (currentUser?.email) {
                document.getElementById('user-email').value = currentUser.email;
                await validateEmailAndLoadServices(currentUser.email);
            } else {
                currentUser = null;
                purchasedServices = [];
                checkFormValidity();
            }
        } else {
            const error = await response.json();
            alert('?????? ??? ???????? ??????: ' + (error.message || '??????????? ??????'));
        }
    } catch (error) {
        console.error('?????? ??? ???????? ??????:', error);
        alert('?? ??????? ????????? ?????. ?????????, ??? JSON Server ???????.');
    }
}

