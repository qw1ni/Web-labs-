// Конфигурация API
const API_BASE_URL = 'http://localhost:3000';
const ITEMS_PER_PAGE = 6;

// Глобальные переменные состояния
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    search: '',
    sort: '',
    categories: [],
    ratingMin: '',
    ratingMax: '',
    priceMin: '',
    priceMax: '',
    duration: ''
};
let allCategories = new Set();
let favoritesIds = new Set();
let cartIds = new Set();

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

// Загрузка избранного
async function loadFavorites() {
    try {
        const favorites = await fetchData(`${API_BASE_URL}/favorites`);
        favoritesIds = new Set(favorites.map(f => f.serviceId));
    } catch (error) {
        console.error('Ошибка при загрузке избранного:', error);
    }
}

// Загрузка корзины
async function loadCart() {
    try {
        const cart = await fetchData(`${API_BASE_URL}/cart`);
        cartIds = new Set(cart.map(c => c.serviceId));
    } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
    }
}

// Построение URL для запроса с фильтрами
function buildQueryURL() {
    const params = new URLSearchParams();
    
    // Поиск (JSON Server использует q для поиска по всем полям)
    if (currentFilters.search) {
        params.append('q', currentFilters.search);
    }
    
    // Фильтр по категориям
    if (currentFilters.categories.length > 0) {
        currentFilters.categories.forEach(category => {
            params.append('category', category);
        });
    }
    
    // Фильтр по длительности
    if (currentFilters.duration) {
        params.append('duration', currentFilters.duration);
    }
    
    // Фильтр по рейтингу (JSON Server поддерживает _gte и _lte)
    if (currentFilters.ratingMin) {
        params.append('rating_gte', currentFilters.ratingMin);
    }
    if (currentFilters.ratingMax) {
        params.append('rating_lte', currentFilters.ratingMax);
    }
    
    // Сортировка (кроме цены, которая сортируется на клиенте)
    if (currentFilters.sort && !currentFilters.sort.startsWith('price-')) {
        const [field, order] = currentFilters.sort.split('-');
        params.append('_sort', field === 'name' ? 'name' : 'rating');
        params.append('_order', order === 'asc' ? 'asc' : 'desc');
    }
    
    // Пагинация
    params.append('_page', currentPage);
    params.append('_limit', ITEMS_PER_PAGE);
    
    return `${API_BASE_URL}/services?${params.toString()}`;
}

// Загрузка и отображение каталога
async function loadCatalog() {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Загрузка...</div>';
    
    try {
        const url = buildQueryURL();
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let services = await response.json();
        let totalCount = parseInt(response.headers.get('X-Total-Count') || services.length.toString(), 10);
        
        // Если фильтруем по цене, нужно получить все данные для правильной фильтрации
        if (currentFilters.priceMin || currentFilters.priceMax) {
            // Строим URL без пагинации для получения всех данных
            const params = new URLSearchParams();
            if (currentFilters.search) params.append('q', currentFilters.search);
            if (currentFilters.categories.length > 0) {
                currentFilters.categories.forEach(cat => params.append('category', cat));
            }
            if (currentFilters.duration) params.append('duration', currentFilters.duration);
            if (currentFilters.ratingMin) params.append('rating_gte', currentFilters.ratingMin);
            if (currentFilters.ratingMax) params.append('rating_lte', currentFilters.ratingMax);
            
            const allDataUrl = `${API_BASE_URL}/services?${params.toString()}`;
            const allDataResponse = await fetch(allDataUrl);
            if (allDataResponse.ok) {
                services = await allDataResponse.json();
            }
        }
        
        // Фильтрация по цене на клиенте (так как цена в формате строки)
        if (currentFilters.priceMin || currentFilters.priceMax) {
            services = services.filter(service => {
                const price = extractPrice(service.price);
                const min = currentFilters.priceMin ? parseInt(currentFilters.priceMin, 10) : 0;
                const max = currentFilters.priceMax ? parseInt(currentFilters.priceMax, 10) : Infinity;
                return price >= min && price <= max;
            });
            totalCount = services.length;
        }
        
        // Сортировка по цене на клиенте (так как цена в формате строки)
        if (currentFilters.sort && currentFilters.sort.startsWith('price-')) {
            const order = currentFilters.sort.includes('asc') ? 1 : -1;
            services.sort((a, b) => {
                const priceA = extractPrice(a.price);
                const priceB = extractPrice(b.price);
                return (priceA - priceB) * order;
            });
        }
        
        // Применяем пагинацию на клиенте, если фильтровали по цене
        if (currentFilters.priceMin || currentFilters.priceMax) {
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            services = services.slice(startIndex, endIndex);
        }
        
        totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        const filteredServices = services;
        
        if (filteredServices.length === 0) {
            showNoResults();
            return;
        }
        
        renderCatalog(filteredServices);
        renderPagination();
        
    } catch (error) {
        console.error('Ошибка при загрузке каталога:', error);
        showError('Не удалось загрузить каталог. Убедитесь, что JSON Server запущен на http://localhost:3000');
    }
}

// Отображение каталога
function renderCatalog(services) {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    services.forEach(service => {
        const isFavorite = favoritesIds.has(service.id);
        const isInCart = cartIds.has(service.id);
        
        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
            <div class="catalog-card-image">
                <img src="${service.imageUrl}" alt="${service.name}" loading="lazy">
                <div class="catalog-card-category">${service.category}</div>
                <div class="catalog-card-actions">
                    <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                            data-service-id="${service.id}" 
                            title="${isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor">
                            <path d="M10 15.5L4.5 10l1.5-4.5L10 2l4 3.5L15.5 10 10 15.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn cart-btn ${isInCart ? 'active' : ''}" 
                            data-service-id="${service.id}"
                            title="${isInCart ? 'Удалить из корзины' : 'Добавить в корзину'}">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                            <path d="M5 7h10l-1 8H6l-1-8zM7 3v4M13 3v4"/>
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
    
    // Добавляем обработчики для кнопок избранного и корзины
    setupCardActions();
}

// Настройка обработчиков для кнопок карточек
function setupCardActions() {
    // Избранное
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const serviceId = parseInt(btn.getAttribute('data-service-id'), 10);
            await toggleFavorite(serviceId);
        });
    });
    
    // Корзина
    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const serviceId = parseInt(btn.getAttribute('data-service-id'), 10);
            await toggleCart(serviceId);
        });
    });
}

// Переключение избранного
async function toggleFavorite(serviceId) {
    try {
        const isFavorite = favoritesIds.has(serviceId);
        
        if (isFavorite) {
            // Удаляем из избранного
            const favorites = await fetchData(`${API_BASE_URL}/favorites`);
            const favoriteItem = favorites.find(f => f.serviceId === serviceId);
            
            if (favoriteItem) {
                await fetch(`${API_BASE_URL}/favorites/${favoriteItem.id}`, {
                    method: 'DELETE'
                });
                favoritesIds.delete(serviceId);
            }
        } else {
            // Добавляем в избранное
            await fetch(`${API_BASE_URL}/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    serviceId: serviceId,
                    addedAt: new Date().toISOString()
                })
            });
            favoritesIds.add(serviceId);
        }
        
        // Обновляем отображение
        loadCatalog();
    } catch (error) {
        console.error('Ошибка при работе с избранным:', error);
        alert('Не удалось обновить избранное');
    }
}

// Переключение корзины
async function toggleCart(serviceId) {
    try {
        const isInCart = cartIds.has(serviceId);
        
        if (isInCart) {
            // Удаляем из корзины
            const cart = await fetchData(`${API_BASE_URL}/cart`);
            const cartItem = cart.find(c => c.serviceId === serviceId);
            
            if (cartItem) {
                await fetch(`${API_BASE_URL}/cart/${cartItem.id}`, {
                    method: 'DELETE'
                });
                cartIds.delete(serviceId);
            }
        } else {
            // Добавляем в корзину
            await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    serviceId: serviceId,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                })
            });
            cartIds.add(serviceId);
        }
        
        // Обновляем отображение
        loadCatalog();
    } catch (error) {
        console.error('Ошибка при работе с корзиной:', error);
        alert('Не удалось обновить корзину');
    }
}

// Загрузка категорий
async function loadCategories() {
    try {
        const services = await fetchData(`${API_BASE_URL}/services`);
        allCategories = new Set(services.map(s => s.category));
        renderCategories();
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
    }
}

// Отображение категорий
function renderCategories() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    categoriesList.innerHTML = Array.from(allCategories).sort().map(category => {
        const isSelected = currentFilters.categories.includes(category);
        return `
            <label class="category-checkbox ${isSelected ? 'checked' : ''}">
                <input type="checkbox" value="${category}" ${isSelected ? 'checked' : ''}>
                <span class="checkbox-label">${category}</span>
            </label>
        `;
    }).join('');
    
    // Добавляем обработчики событий
    const checkboxes = categoriesList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const category = e.target.value;
            if (e.target.checked) {
                if (!currentFilters.categories.includes(category)) {
                    currentFilters.categories.push(category);
                }
            } else {
                currentFilters.categories = currentFilters.categories.filter(cat => cat !== category);
            }
            
            const label = e.target.closest('.category-checkbox');
            if (e.target.checked) {
                label.classList.add('checked');
            } else {
                label.classList.remove('checked');
            }
            
            currentPage = 1;
            loadCatalog();
        });
    });
}

// Отображение пагинации
function renderPagination() {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination">';
    
    // Кнопка "Назад"
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" data-page="${currentPage - 1}">‹ Назад</button>`;
    }
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span class="pagination-dots">...</span>';
        }
    }
    
    // Кнопка "Вперед"
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" data-page="${currentPage + 1}">Вперед ›</button>`;
    }
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
    
    // Добавляем обработчики
    container.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.getAttribute('data-page'), 10);
            loadCatalog();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Показ сообщения об отсутствии результатов
function showNoResults() {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="no-results-container">
            <svg class="no-results-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
                <path d="M32 20V36M32 44H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p class="no-results-title">Услуги не найдены</p>
            <p class="no-results-text">Попробуйте изменить параметры поиска или фильтры</p>
        </div>
    `;
}

// Показ ошибки
function showError(message) {
    const container = document.getElementById('catalog-container');
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

// Настройка поиска
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = e.target.value;
            currentPage = 1;
            loadCatalog();
        }, 300);
    });
}

// Настройка сортировки
function setupSort() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        currentPage = 1;
        loadCatalog();
    });
}

// Настройка расширенных фильтров
function setupAdvancedFilters() {
    // Фильтры по рейтингу
    const ratingMin = document.getElementById('filter-rating-min');
    const ratingMax = document.getElementById('filter-rating-max');
    
    if (ratingMin) {
        ratingMin.addEventListener('input', (e) => {
            currentFilters.ratingMin = e.target.value;
            currentPage = 1;
            loadCatalog();
        });
    }
    
    if (ratingMax) {
        ratingMax.addEventListener('input', (e) => {
            currentFilters.ratingMax = e.target.value;
            currentPage = 1;
            loadCatalog();
        });
    }
    
    // Фильтры по цене
    const priceMin = document.getElementById('filter-price-min');
    const priceMax = document.getElementById('filter-price-max');
    
    if (priceMin) {
        priceMin.addEventListener('input', (e) => {
            currentFilters.priceMin = e.target.value;
            currentPage = 1;
            loadCatalog();
        });
    }
    
    if (priceMax) {
        priceMax.addEventListener('input', (e) => {
            currentFilters.priceMax = e.target.value;
            currentPage = 1;
            loadCatalog();
        });
    }
    
    // Фильтр по длительности
    const duration = document.getElementById('filter-duration');
    if (duration) {
        duration.addEventListener('change', (e) => {
            currentFilters.duration = e.target.value;
            currentPage = 1;
            loadCatalog();
        });
    }
    
    // Кнопка сброса фильтров
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentFilters = {
                search: '',
                sort: '',
                categories: [],
                ratingMin: '',
                ratingMax: '',
                priceMin: '',
                priceMax: '',
                duration: ''
            };
            
            // Сброс полей формы
            document.getElementById('search-input').value = '';
            document.getElementById('sort-select').value = '';
            document.getElementById('filter-rating-min').value = '';
            document.getElementById('filter-rating-max').value = '';
            document.getElementById('filter-price-min').value = '';
            document.getElementById('filter-price-max').value = '';
            document.getElementById('filter-duration').value = '';
            
            // Сброс чекбоксов категорий
            document.querySelectorAll('.category-checkbox input').forEach(cb => {
                cb.checked = false;
                cb.closest('.category-checkbox').classList.remove('checked');
            });
            
            currentPage = 1;
            loadCatalog();
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadFavorites();
    await loadCart();
    await loadCategories();
    setupSearch();
    setupSort();
    setupAdvancedFilters();
    loadCatalog();
});
