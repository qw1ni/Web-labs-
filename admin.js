// Конфигурация API
const API_BASE_URL = 'http://localhost:3000';

const auth = window.auth || {
    getCurrentUser: () => null,
    saveCurrentUser: () => {},
    isAdmin: () => false
};

// Текущий администратор
let currentAdmin = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    checkAdminSession();
});

// Настройка формы входа
function setupLogin() {
    const loginForm = document.getElementById('admin-login');
    const emailInput = document.getElementById('admin-email');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const email = emailInput.value.trim();
            const errorElement = document.getElementById('admin-email-error');
            
            if (!email) {
                errorElement.textContent = '';
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    errorElement.textContent = '???????? ?????? email';
                    emailInput.classList.add('error');
                } else {
                    errorElement.textContent = '';
                    emailInput.classList.remove('error');
                }
            }
        });
    }
    
    const currentUser = auth.getCurrentUser();
    if (emailInput && currentUser?.email) {
        emailInput.value = currentUser.email;
    }
}

// Обработка входа
async function handleLogin() {
    const email = document.getElementById('admin-email').value.trim();
    const errorElement = document.getElementById('admin-email-error');
    
    if (!email) {
        errorElement.textContent = '??????? email';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const users = await response.json();
        const user = users.find((u) => u.email === email);

        if (user && auth.isAdmin(user)) {
            currentAdmin = user;
            sessionStorage.setItem('adminEmail', email);
            if (auth.saveCurrentUser) {
                auth.saveCurrentUser(user);
            }
            showAdminPanel();
        } else if (user) {
            errorElement.textContent = '?????? ????????? ?????? ?????????????.';
        } else {
            errorElement.textContent = '???????????? ? ????? email ?? ??????';
        }
    } catch (error) {
        console.error('?????? ??? ?????:', error);
        errorElement.textContent = '?? ??????? ???????? ?????. ?????????, ??? JSON Server ???????.';
    }
}

// Проверка сессии администратора
function checkAdminSession() {
    const storedUser = auth.getCurrentUser();
    if (storedUser && auth.isAdmin(storedUser)) {
        currentAdmin = storedUser;
        showAdminPanel();
        return;
    }

    const adminEmail = sessionStorage.getItem('adminEmail');
    if (adminEmail) {
        fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(adminEmail)}`)
            .then(response => response.json())
            .then(users => {
                if (Array.isArray(users) && users.length > 0) {
                    const user = users[0];
                    if (auth.isAdmin(user)) {
                        currentAdmin = user;
                        if (auth.saveCurrentUser) {
                            auth.saveCurrentUser(user);
                        }
                        showAdminPanel();
                    }
                }
            })
            .catch(error => {
                console.error('?????? ??? ???????? ??????:', error);
            });
    }
}


// Показать админ-панель
function showAdminPanel() {
    document.getElementById('admin-login-form').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    
    setupTabs();
    setupServiceForms();
    setupFeedbackForms();
    loadServicesForSelects();
}

// Настройка вкладок
function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Убираем активный класс у всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Добавляем активный класс к выбранной вкладке
            tab.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-form') || document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Загрузка услуг для выпадающих списков
async function loadServicesForSelects() {
    try {
        const response = await fetch(`${API_BASE_URL}/services`);
        if (response.ok) {
            const services = await response.json();
            
            // Заполняем все выпадающие списки
            ['edit-service-select', 'delete-service-select', 'feedback-service-select'].forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select) {
                    // Сохраняем первый option
                    const firstOption = select.querySelector('option');
                    select.innerHTML = '';
                    if (firstOption) {
                        select.appendChild(firstOption);
                    }
                    
                    services.forEach(service => {
                        const option = document.createElement('option');
                        option.value = service.id;
                        option.textContent = service.name;
                        select.appendChild(option);
                    });
                }
            });
        }
    } catch (error) {
        console.error('Ошибка при загрузке услуг:', error);
    }
}

// Настройка форм управления услугами
function setupServiceForms() {
    // Форма добавления
    setupAddServiceForm();
    
    // Форма редактирования
    setupEditServiceForm();
    
    // Форма удаления
    setupDeleteServiceForm();
}

// Настройка формы добавления услуги
function setupAddServiceForm() {
    const form = document.getElementById('add-service-form-element');
    if (!form) return;
    
    const inputs = form.querySelectorAll('.form-input, .form-textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateServiceForm('add');
        });
        input.addEventListener('blur', () => {
            validateServiceForm('add');
        });
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addService();
    });
    
    // Начальная валидация
    validateServiceForm('add');
}

// Настройка формы редактирования услуги
function setupEditServiceForm() {
    const select = document.getElementById('edit-service-select');
    const form = document.getElementById('edit-service-form-element');
    
    if (!select || !form) return;
    
    select.addEventListener('change', async (e) => {
        const serviceId = e.target.value;
        if (serviceId) {
            await loadServiceForEdit(serviceId);
            form.style.display = 'block';
        } else {
            form.style.display = 'none';
        }
    });
    
    const inputs = form.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateServiceForm('edit');
        });
        input.addEventListener('blur', () => {
            validateServiceForm('edit');
        });
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateService();
    });
}

// Настройка формы удаления услуги
function setupDeleteServiceForm() {
    const select = document.getElementById('delete-service-select');
    const infoDiv = document.getElementById('delete-service-info');
    
    select.addEventListener('change', async (e) => {
        const serviceId = e.target.value;
        if (serviceId) {
            await loadServiceForDelete(serviceId);
            infoDiv.style.display = 'block';
        } else {
            infoDiv.style.display = 'none';
        }
    });
    
    const deleteBtn = document.getElementById('delete-service-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (confirm('Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить.')) {
                await deleteService();
            }
        });
    }
}

// Загрузка услуги для редактирования
async function loadServiceForEdit(serviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`);
        if (response.ok) {
            const service = await response.json();
            
            document.getElementById('edit-name').value = service.name || '';
            document.getElementById('edit-description').value = service.description || '';
            document.getElementById('edit-price').value = service.price || '';
            document.getElementById('edit-duration').value = service.duration || '';
            document.getElementById('edit-category').value = service.category || '';
            document.getElementById('edit-imageUrl').value = service.imageUrl || '';
            document.getElementById('edit-features').value = service.features ? service.features.join(', ') : '';
            document.getElementById('edit-rating').value = service.rating || 4.5;
            
            // Сохраняем ID для обновления
            document.getElementById('edit-service-form-element').setAttribute('data-service-id', serviceId);
            
            validateServiceForm('edit');
        }
    } catch (error) {
        console.error('Ошибка при загрузке услуги:', error);
        alert('Не удалось загрузить услугу');
    }
}

// Загрузка услуги для удаления
async function loadServiceForDelete(serviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`);
        if (response.ok) {
            const service = await response.json();
            
            const detailsDiv = document.getElementById('delete-service-details');
            detailsDiv.innerHTML = `
                <div class="delete-service-card">
                    <h3>${service.name}</h3>
                    <p><strong>Категория:</strong> ${service.category}</p>
                    <p><strong>Цена:</strong> ${service.price}</p>
                    <p><strong>Длительность:</strong> ${service.duration}</p>
                    <p><strong>Рейтинг:</strong> ${service.rating}</p>
                </div>
            `;
            
            document.getElementById('delete-service-btn').setAttribute('data-service-id', serviceId);
        }
    } catch (error) {
        console.error('Ошибка при загрузке услуги:', error);
        alert('Не удалось загрузить услугу');
    }
}

// Валидация формы услуги
function validateServiceForm(type) {
    const prefix = type === 'add' ? 'add' : 'edit';
    const fields = ['name', 'description', 'price', 'duration', 'category', 'imageUrl', 'features', 'rating'];
    
    let isValid = true;
    
    fields.forEach(field => {
        const input = document.getElementById(`${prefix}-${field}`);
        const errorElement = document.getElementById(`${prefix}-${field}-error`);
        
        if (!input || !errorElement) return;
        
        let fieldValid = true;
        let errorMessage = '';
        
        if (input.hasAttribute('required') && !input.value.trim()) {
            fieldValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        } else {
            // Дополнительные проверки
            if (field === 'imageUrl' && input.value.trim()) {
                try {
                    new URL(input.value);
                } catch {
                    fieldValid = false;
                    errorMessage = 'Неверный формат URL';
                }
            }
            
            if (field === 'rating' && input.value.trim()) {
                const rating = parseFloat(input.value);
                if (isNaN(rating) || rating < 0 || rating > 5) {
                    fieldValid = false;
                    errorMessage = 'Рейтинг должен быть от 0 до 5';
                }
            }
            
            if (field === 'features' && input.value.trim()) {
                const features = input.value.split(',').map(f => f.trim()).filter(f => f);
                if (features.length === 0) {
                    fieldValid = false;
                    errorMessage = 'Укажите хотя бы одну особенность';
                }
            }
        }
        
        if (fieldValid) {
            input.classList.remove('error');
            errorElement.textContent = '';
        } else {
            input.classList.add('error');
            errorElement.textContent = errorMessage;
            isValid = false;
        }
    });
    
    // Активируем/деактивируем кнопку
    const submitBtn = document.getElementById(`${prefix}-service-btn`);
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
    
    return isValid;
}

// Добавление услуги
async function addService() {
    if (!validateServiceForm('add')) {
        return;
    }
    
    const features = document.getElementById('add-features').value
        .split(',')
        .map(f => f.trim())
        .filter(f => f);
    
    const serviceData = {
        name: document.getElementById('add-name').value.trim(),
        description: document.getElementById('add-description').value.trim(),
        price: document.getElementById('add-price').value.trim(),
        duration: document.getElementById('add-duration').value.trim(),
        category: document.getElementById('add-category').value.trim(),
        imageUrl: document.getElementById('add-imageUrl').value.trim(),
        features: features,
        rating: parseFloat(document.getElementById('add-rating').value)
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        if (response.ok) {
            alert('Услуга успешно добавлена!');
            document.getElementById('add-service-form-element').reset();
            loadServicesForSelects();
            validateServiceForm('add');
        } else {
            const error = await response.json();
            alert('Ошибка при добавлении услуги: ' + (error.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка при добавлении услуги:', error);
        alert('Не удалось добавить услугу. Убедитесь, что JSON Server запущен.');
    }
}

// Обновление услуги
async function updateService() {
    if (!validateServiceForm('edit')) {
        return;
    }
    
    const form = document.getElementById('edit-service-form-element');
    const serviceId = form.getAttribute('data-service-id');
    
    if (!serviceId) {
        alert('Ошибка: не выбран ID услуги');
        return;
    }
    
    const features = document.getElementById('edit-features').value
        .split(',')
        .map(f => f.trim())
        .filter(f => f);
    
    const serviceData = {
        id: parseInt(serviceId, 10),
        name: document.getElementById('edit-name').value.trim(),
        description: document.getElementById('edit-description').value.trim(),
        price: document.getElementById('edit-price').value.trim(),
        duration: document.getElementById('edit-duration').value.trim(),
        category: document.getElementById('edit-category').value.trim(),
        imageUrl: document.getElementById('edit-imageUrl').value.trim(),
        features: features,
        rating: parseFloat(document.getElementById('edit-rating').value)
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        if (response.ok) {
            alert('Услуга успешно обновлена!');
            loadServicesForSelects();
            // Обновляем каталог если открыт
            if (typeof loadCatalog === 'function') {
                loadCatalog();
            }
        } else {
            const error = await response.json();
            alert('Ошибка при обновлении услуги: ' + (error.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка при обновлении услуги:', error);
        alert('Не удалось обновить услугу. Убедитесь, что JSON Server запущен.');
    }
}

// Удаление услуги
async function deleteService() {
    const deleteBtn = document.getElementById('delete-service-btn');
    const serviceId = deleteBtn.getAttribute('data-service-id');
    
    if (!serviceId) {
        alert('Ошибка: не выбран ID услуги');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Услуга успешно удалена!');
            document.getElementById('delete-service-select').value = '';
            document.getElementById('delete-service-info').style.display = 'none';
            loadServicesForSelects();
            // Обновляем каталог если открыт
            if (typeof loadCatalog === 'function') {
                loadCatalog();
            }
        } else {
            const error = await response.json();
            alert('Ошибка при удалении услуги: ' + (error.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка при удалении услуги:', error);
        alert('Не удалось удалить услугу. Убедитесь, что JSON Server запущен.');
    }
}

// Настройка форм управления отзывами
function setupFeedbackForms() {
    // Отзывы по услуге
    const serviceSelect = document.getElementById('feedback-service-select');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', async (e) => {
            const serviceId = e.target.value;
            if (serviceId) {
                await loadFeedbackByService(serviceId);
            } else {
                document.getElementById('feedback-service-results').innerHTML = '';
            }
        });
    }
    
    // Отзывы по пользователю
    const userEmailInput = document.getElementById('feedback-user-email');
    if (userEmailInput) {
        let emailTimeout;
        userEmailInput.addEventListener('input', (e) => {
            clearTimeout(emailTimeout);
            emailTimeout = setTimeout(async () => {
                const email = e.target.value.trim();
                if (email && validateEmailFormat(email)) {
                    await loadFeedbackByUser(email);
                } else {
                    document.getElementById('feedback-user-results').innerHTML = '';
                }
            }, 500);
        });
    }
}

// Валидация email
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Загрузка отзывов по услуге
async function loadFeedbackByService(serviceId) {
    const resultsDiv = document.getElementById('feedback-service-results');
    resultsDiv.innerHTML = '<div class="loading">Загрузка отзывов...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/feedback?serviceId=${serviceId}`);
        if (response.ok) {
            const feedbacks = await response.json();
            
            if (feedbacks.length === 0) {
                resultsDiv.innerHTML = '<p class="no-feedback">Отзывов на эту услугу пока нет</p>';
                return;
            }
            
            let html = '<div class="feedback-list">';
            feedbacks.forEach(feedback => {
                html += `
                    <div class="feedback-item">
                        <div class="feedback-header">
                            <div class="feedback-user">
                                <strong>${feedback.username || feedback.userEmail}</strong>
                                <span class="feedback-date">${formatDate(feedback.date)}</span>
                            </div>
                            <div class="feedback-rating">
                                ${'★'.repeat(Math.floor(feedback.rating))}${feedback.rating % 1 >= 0.5 ? '☆' : ''}
                                <span>${feedback.rating}</span>
                            </div>
                        </div>
                        <div class="feedback-comment">${feedback.comment}</div>
                        <div class="feedback-actions">
                            <button class="delete-feedback-btn" data-feedback-id="${feedback.id}">Удалить отзыв</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            resultsDiv.innerHTML = html;
            
            // Добавляем обработчики для кнопок удаления
            document.querySelectorAll('.delete-feedback-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const feedbackId = btn.getAttribute('data-feedback-id');
                    if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
                        await deleteFeedback(feedbackId, serviceId);
                    }
                });
            });
        } else {
            throw new Error('Не удалось загрузить отзывы');
        }
    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        resultsDiv.innerHTML = '<p class="error-text">Не удалось загрузить отзывы</p>';
    }
}

// Загрузка отзывов по пользователю
async function loadFeedbackByUser(email) {
    const resultsDiv = document.getElementById('feedback-user-results');
    resultsDiv.innerHTML = '<div class="loading">Загрузка отзывов...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/feedback?userEmail=${email}`);
        if (response.ok) {
            const feedbacks = await response.json();
            
            if (feedbacks.length === 0) {
                resultsDiv.innerHTML = '<p class="no-feedback">У этого пользователя нет отзывов</p>';
                return;
            }
            
            let html = '<div class="feedback-list">';
            feedbacks.forEach(feedback => {
                html += `
                    <div class="feedback-item">
                        <div class="feedback-header">
                            <div class="feedback-service">
                                <strong>${feedback.serviceName}</strong>
                                <span class="feedback-date">${formatDate(feedback.date)}</span>
                            </div>
                            <div class="feedback-rating">
                                ${'★'.repeat(Math.floor(feedback.rating))}${feedback.rating % 1 >= 0.5 ? '☆' : ''}
                                <span>${feedback.rating}</span>
                            </div>
                        </div>
                        <div class="feedback-comment">${feedback.comment}</div>
                        <div class="feedback-actions">
                            <button class="delete-feedback-btn" data-feedback-id="${feedback.id}">Удалить отзыв</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            resultsDiv.innerHTML = html;
            
            // Добавляем обработчики для кнопок удаления
            document.querySelectorAll('.delete-feedback-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const feedbackId = btn.getAttribute('data-feedback-id');
                    if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
                        await deleteFeedback(feedbackId, null, email);
                    }
                });
            });
        } else {
            throw new Error('Не удалось загрузить отзывы');
        }
    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        resultsDiv.innerHTML = '<p class="error-text">Не удалось загрузить отзывы</p>';
    }
}

// Удаление отзыва
async function deleteFeedback(feedbackId, serviceId = null, userEmail = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Отзыв успешно удален!');
            
            // Перезагружаем отзывы
            if (serviceId) {
                await loadFeedbackByService(serviceId);
            } else if (userEmail) {
                await loadFeedbackByUser(userEmail);
            }
        } else {
            const error = await response.json();
            alert('Ошибка при удалении отзыва: ' + (error.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
        alert('Не удалось удалить отзыв. Убедитесь, что JSON Server запущен.');
    }
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

