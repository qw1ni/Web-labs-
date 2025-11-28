// Конфигурация API
const API_BASE_URL = 'http://localhost:3000';

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

// Загрузка избранного
async function loadFavorites() {
    const container = document.getElementById('favorites-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Загрузка избранного...</div>';
    
    try {
        // Получаем список избранного
        const favorites = await fetchData(`${API_BASE_URL}/favorites`);
        
        if (favorites.length === 0) {
            showEmptyFavorites();
            return;
        }
        
        // Получаем ID услуг из избранного
        const serviceIds = favorites.map(f => f.serviceId);
        
        // Загружаем данные об услугах
        const services = [];
        for (const serviceId of serviceIds) {
            try {
                const service = await fetchData(`${API_BASE_URL}/services/${serviceId}`);
                if (service) {
                    // Добавляем ID записи из избранного для удаления
                    const favoriteItem = favorites.find(f => f.serviceId === serviceId);
                    service.favoriteId = favoriteItem ? favoriteItem.id : null;
                    services.push(service);
                }
            } catch (error) {
                console.error(`Ошибка при загрузке услуги ${serviceId}:`, error);
            }
        }
        
        if (services.length === 0) {
            showEmptyFavorites();
            return;
        }
        
        renderFavorites(services);
        
    } catch (error) {
        console.error('Ошибка при загрузке избранного:', error);
        showError('Не удалось загрузить избранное. Убедитесь, что JSON Server запущен на http://localhost:3000');
    }
}

// Отображение избранного
function renderFavorites(services) {
    const container = document.getElementById('favorites-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
            <div class="catalog-card-image">
                <img src="${service.imageUrl}" alt="${service.name}" loading="lazy">
                <div class="catalog-card-category">${service.category}</div>
                <div class="catalog-card-actions">
                    <button class="action-btn remove-favorite-btn active" 
                            data-favorite-id="${service.favoriteId}"
                            data-service-id="${service.id}"
                            title="Удалить из избранного">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor">
                            <path d="M10 15.5L4.5 10l1.5-4.5L10 2l4 3.5L15.5 10 10 15.5z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="catalog-card-content">
                <h3 class="catalog-card-title">${service.name}</h3>
                <p class="catalog-card-description">${service.description}</p>
                <div class="catalog-card-features">
                    ${service.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="catalog-card-footer">
                    <div class="catalog-card-info">
                        <div class="catalog-card-price">${service.price}</div>
                        <div class="catalog-card-duration">${service.duration}</div>
                    </div>
                    <div class="catalog-card-rating">
                        <span class="rating-stars">${'★'.repeat(Math.floor(service.rating))}${service.rating % 1 >= 0.5 ? '☆' : ''}</span>
                        <span class="rating-value">${service.rating}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Добавляем обработчики для кнопок удаления
    setupRemoveButtons();
}

// Настройка обработчиков для кнопок удаления
function setupRemoveButtons() {
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const favoriteId = parseInt(btn.getAttribute('data-favorite-id'), 10);
            await removeFromFavorites(favoriteId);
        });
    });
}

// Удаление из избранного
async function removeFromFavorites(favoriteId) {
    if (!favoriteId) {
        console.error('ID избранного не найден');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Перезагружаем список избранного
        loadFavorites();
        
    } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        alert('Не удалось удалить из избранного');
    }
}

// Показ сообщения о пустом избранном
function showEmptyFavorites() {
    const container = document.getElementById('favorites-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="no-results-container">
            <svg class="no-results-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
                <path d="M32 20V36M32 44H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p class="no-results-title">Избранное пусто</p>
            <p class="no-results-text">Добавьте услуги в избранное из каталога</p>
            <a href="catalog.html" class="link-underline" style="margin-top: 20px; display: inline-block;">Перейти в каталог</a>
        </div>
    `;
}

// Показ ошибки
function showError(message) {
    const container = document.getElementById('favorites-container');
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
    loadFavorites();
});

