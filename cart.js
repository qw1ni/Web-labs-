// Конфигурация API
const API_BASE_URL = 'http://localhost:3000';

// Функция для извлечения числового значения цены
function extractPrice(priceString) {
    const match = priceString.match(/[\d\s]+/);
    if (match) {
        return parseInt(match[0].replace(/\s/g, ''), 10);
    }
    return 0;
}

// Функция для выполнения fetch запросов
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        showError('Не удалось загрузить данные. Убедитесь, что JSON Server запущен на http://localhost:3000');
        return [];
    }
}

// Загрузка корзины
async function loadCart() {
    const container = document.getElementById('cart-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Загрузка корзины...</div>';
    
    try {
        // Получаем список корзины
        const cart = await fetchData(`${API_BASE_URL}/cart`);
        
        if (cart.length === 0) {
            showEmptyCart();
            return;
        }
        
        // Загружаем данные об услугах
        const cartItems = [];
        for (const cartItem of cart) {
            try {
                const service = await fetchData(`${API_BASE_URL}/services/${cartItem.serviceId}`);
                if (service) {
                    cartItems.push({
                        ...service,
                        cartId: cartItem.id,
                        quantity: cartItem.quantity || 1
                    });
                }
            } catch (error) {
                console.error(`Ошибка при загрузке услуги ${cartItem.serviceId}:`, error);
            }
        }
        
        if (cartItems.length === 0) {
            showEmptyCart();
            return;
        }
        
        renderCart(cartItems);
        
    } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
        showError('Не удалось загрузить корзину. Убедитесь, что JSON Server запущен на http://localhost:3000');
    }
}

// Отображение корзины
function renderCart(cartItems) {
    const container = document.getElementById('cart-container');
    if (!container) return;
    
    let totalPrice = 0;
    
    // Вычисляем общую стоимость
    cartItems.forEach(item => {
        const price = extractPrice(item.price);
        totalPrice += price * item.quantity;
    });
    
    let cartHTML = '<div class="cart-items">';
    
    cartItems.forEach(item => {
        const itemPrice = extractPrice(item.price);
        const itemTotal = itemPrice * item.quantity;
        
        cartHTML += `
            <div class="cart-item" data-cart-id="${item.cartId}">
                <div class="cart-item-image">
                    <img src="${item.imageUrl}" alt="${item.name}" loading="lazy">
                    <div class="cart-item-category">${item.category}</div>
                </div>
                <div class="cart-item-content">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-description">${item.description}</p>
                    <div class="cart-item-features">
                        ${item.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
                    <div class="cart-item-footer">
                        <div class="cart-item-price-info">
                            <div class="cart-item-price">${item.price}</div>
                            <div class="cart-item-duration">${item.duration}</div>
                        </div>
                        <div class="cart-item-rating">
                            <span class="rating-stars">${'★'.repeat(Math.floor(item.rating))}${item.rating % 1 >= 0.5 ? '☆' : ''}</span>
                            <span class="rating-value">${item.rating}</span>
                        </div>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <label for="quantity-${item.cartId}" class="quantity-label">Количество:</label>
                        <div class="quantity-input-group">
                            <button class="quantity-btn" data-action="decrease" data-cart-id="${item.cartId}">−</button>
                            <input type="number" 
                                   id="quantity-${item.cartId}" 
                                   class="quantity-input" 
                                   value="${item.quantity}" 
                                   min="1" 
                                   max="10"
                                   data-cart-id="${item.cartId}">
                            <button class="quantity-btn" data-action="increase" data-cart-id="${item.cartId}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <span class="total-label">Итого:</span>
                        <span class="total-value">${formatPrice(itemTotal)} ₽</span>
                    </div>
                    <button class="remove-cart-btn" data-cart-id="${item.cartId}" title="Удалить из корзины">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                            <path d="M5 5l10 10M5 15L15 5"/>
                        </svg>
                        Удалить
                    </button>
                </div>
            </div>
        `;
    });
    
    cartHTML += '</div>';
    
    // Добавляем итоговую информацию и кнопку оформления
    cartHTML += `
        <div class="cart-summary">
            <div class="cart-total">
                <div class="cart-total-label">Общая стоимость:</div>
                <div class="cart-total-value">${formatPrice(totalPrice)} ₽</div>
            </div>
            <button id="checkout-btn" class="checkout-btn">Оформить заказ</button>
        </div>
    `;
    
    container.innerHTML = cartHTML;
    
    // Добавляем обработчики
    setupCartControls();
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

// Настройка обработчиков для элементов корзины
function setupCartControls() {
    // Кнопки изменения количества
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const cartId = parseInt(btn.getAttribute('data-cart-id'), 10);
            const action = btn.getAttribute('data-action');
            const input = document.getElementById(`quantity-${cartId}`);
            let newQuantity = parseInt(input.value, 10);
            
            if (action === 'increase' && newQuantity < 10) {
                newQuantity++;
            } else if (action === 'decrease' && newQuantity > 1) {
                newQuantity--;
            }
            
            await updateQuantity(cartId, newQuantity);
        });
    });
    
    // Прямой ввод количества
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const cartId = parseInt(e.target.getAttribute('data-cart-id'), 10);
            let quantity = parseInt(e.target.value, 10);
            
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
            } else if (quantity > 10) {
                quantity = 10;
            }
            
            await updateQuantity(cartId, quantity);
        });
    });
    
    // Кнопки удаления
    document.querySelectorAll('.remove-cart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const cartId = parseInt(btn.getAttribute('data-cart-id'), 10);
            await removeFromCart(cartId);
        });
    });
    
    // Кнопка оформления заказа
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            await checkout();
        });
    }
}

// Обновление количества
async function updateQuantity(cartId, quantity) {
    try {
        // Получаем текущий элемент корзины
        const cartItem = await fetchData(`${API_BASE_URL}/cart/${cartId}`);
        
        // Обновляем количество
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...cartItem,
                quantity: quantity
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Перезагружаем корзину
        loadCart();
        
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        alert('Не удалось обновить количество');
    }
}

// Удаление из корзины
async function removeFromCart(cartId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Перезагружаем корзину
        loadCart();
        
    } catch (error) {
        console.error('Ошибка при удалении из корзины:', error);
        alert('Не удалось удалить товар из корзины');
    }
}

// Оформление заказа
async function checkout() {
    if (!confirm('Вы уверены, что хотите оформить заказ?')) {
        return;
    }
    
    try {
        // Получаем все элементы корзины
        const cart = await fetchData(`${API_BASE_URL}/cart`);
        
        // Удаляем все элементы корзины
        for (const item of cart) {
            await fetch(`${API_BASE_URL}/cart/${item.id}`, {
                method: 'DELETE'
            });
        }
        
        // Показываем уведомление
        showNotification();
        
        // Перезагружаем корзину (она будет пустой)
        setTimeout(() => {
            loadCart();
        }, 2000);
        
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        alert('Не удалось оформить заказ');
    }
}

// Показ уведомления об успешной покупке
function showNotification() {
    const modal = document.getElementById('notification-modal');
    if (modal) {
        modal.classList.add('show');
        
        const closeBtn = document.getElementById('close-notification');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }
        
        // Закрытие при клике вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            modal.classList.remove('show');
        }, 5000);
    }
}

// Показ сообщения о пустой корзине
function showEmptyCart() {
    const container = document.getElementById('cart-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="no-results-container">
            <svg class="no-results-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
                <path d="M32 20V36M32 44H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p class="no-results-title">Корзина пуста</p>
            <p class="no-results-text">Добавьте услуги в корзину из каталога</p>
            <a href="catalog.html" class="link-underline" style="margin-top: 20px; display: inline-block;">Перейти в каталог</a>
        </div>
    `;
}

// Показ ошибки
function showError(message) {
    const container = document.getElementById('cart-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="no-results-container">
            <svg class="no-results-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
                <path d="M32 20V36M32 44H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p class="no-results-title">Ошибка загрузки</p>
            <p class="no-results-text">${message}</p>
        </div>
    `;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

