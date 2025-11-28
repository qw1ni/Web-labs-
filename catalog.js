// Массив каталога услуг веб-дизайна и маркетинга
const servicesCatalog = [
    {
        id: 1,
        name: "Разработка корпоративного сайта",
        description: "Создание современного корпоративного сайта с адаптивным дизайном и интеграцией CRM-систем",
        price: "от 150 000 ₽",
        duration: "4-6 недель",
        category: "Разработка",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        features: ["Адаптивный дизайн", "CMS интеграция", "SEO оптимизация"],
        rating: 4.9
    },
    {
        id: 2,
        name: "Интернет-магазин на платформе",
        description: "Полнофункциональный интернет-магазин с системой оплаты, корзиной и личным кабинетом",
        price: "от 250 000 ₽",
        duration: "6-8 недель",
        category: "E-commerce",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
        features: ["Онлайн-оплата", "Управление товарами", "Аналитика продаж"],
        rating: 4.8
    },
    {
        id: 3,
        name: "Настройка контекстной рекламы",
        description: "Профессиональная настройка Яндекс.Директ и Google Ads с оптимизацией бюджета",
        price: "от 30 000 ₽",
        duration: "1-2 недели",
        category: "Реклама",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        features: ["Ключевые слова", "A/B тестирование", "Ежемесячная поддержка"],
        rating: 4.7
    },
    {
        id: 4,
        name: "UX/UI дизайн интерфейсов",
        description: "Создание интуитивных и привлекательных пользовательских интерфейсов для веб и мобильных приложений",
        price: "от 80 000 ₽",
        duration: "3-4 недели",
        category: "Дизайн",
        imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
        features: ["Прототипирование", "Дизайн-система", "User testing"],
        rating: 5.0
    },
    {
        id: 5,
        name: "SMM продвижение в Instagram",
        description: "Комплексное ведение аккаунта, создание контента и настройка таргетированной рекламы",
        price: "от 50 000 ₽/мес",
        duration: "Ежемесячно",
        category: "SMM",
        imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
        features: ["Контент-план", "Сториз и посты", "Аналитика"],
        rating: 4.6
    },
    {
        id: 6,
        name: "SEO оптимизация сайта",
        description: "Комплексная поисковая оптимизация для повышения позиций в поисковых системах",
        price: "от 40 000 ₽/мес",
        duration: "Ежемесячно",
        category: "SEO",
        imageUrl: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2d1c0?w=800&h=600&fit=crop",
        features: ["Аудит сайта", "Техническая оптимизация", "Контент-маркетинг"],
        rating: 4.8
    },
    {
        id: 7,
        name: "Автоматизация продаж",
        description: "Настройка воронок продаж и автоматизация бизнес-процессов с помощью CRM",
        price: "от 100 000 ₽",
        duration: "4-5 недель",
        category: "Автоматизация",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        features: ["CRM интеграция", "Email-маркетинг", "Чат-боты"],
        rating: 4.9
    },
    {
        id: 8,
        name: "Брендинг и айдентика",
        description: "Разработка фирменного стиля, логотипа и брендбука для вашей компании",
        price: "от 120 000 ₽",
        duration: "5-6 недель",
        category: "Брендинг",
        imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
        features: ["Логотип", "Брендбук", "Гайдлайны"],
        rating: 4.7
    },
    {
        id: 9,
        name: "Landing page под ключ",
        description: "Создание одностраничного сайта для запуска рекламных кампаний и сбора заявок",
        price: "от 60 000 ₽",
        duration: "2-3 недели",
        category: "Разработка",
        imageUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop",
        features: ["Адаптивная верстка", "Формы обратной связи", "Интеграция с CRM"],
        rating: 4.8
    },
    {
        id: 10,
        name: "Аналитика и отчетность",
        description: "Настройка систем аналитики и ежемесячные отчеты по эффективности рекламы",
        price: "от 25 000 ₽/мес",
        duration: "Ежемесячно",
        category: "Аналитика",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        features: ["Google Analytics", "Яндекс.Метрика", "Дашборды"],
        rating: 4.9
    },
    {
        id: 11,
        name: "Email-маркетинг",
        description: "Настройка email-рассылок и автоматических воронок для повышения конверсии",
        price: "от 35 000 ₽",
        duration: "2-3 недели",
        category: "Маркетинг",
        imageUrl: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&h=600&fit=crop",
        features: ["Шаблоны писем", "Автоматизация", "A/B тестирование"],
        rating: 4.6
    },
    {
        id: 12,
        name: "Мобильное приложение",
        description: "Разработка нативных и кроссплатформенных мобильных приложений",
        price: "от 400 000 ₽",
        duration: "8-12 недель",
        category: "Разработка",
        imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
        features: ["iOS и Android", "Backend разработка", "Публикация в сторы"],
        rating: 4.9
    },
    {
        id: 13,
        name: "Видеопродакшн",
        description: "Создание рекламных роликов, видео для соцсетей и корпоративного контента",
        price: "от 80 000 ₽",
        duration: "3-4 недели",
        category: "Контент",
        imageUrl: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop",
        features: ["Сценарий", "Съемка", "Монтаж и графика"],
        rating: 4.7
    },
    {
        id: 14,
        name: "Веб-приложения",
        description: "Разработка сложных веб-приложений с использованием современных технологий",
        price: "от 300 000 ₽",
        duration: "10-14 недель",
        category: "Разработка",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        features: ["React/Vue.js", "API интеграция", "Облачная инфраструктура"],
        rating: 5.0
    },
    {
        id: 15,
        name: "Контент-стратегия",
        description: "Разработка стратегии контент-маркетинга и создание контент-плана",
        price: "от 60 000 ₽",
        duration: "2-3 недели",
        category: "Контент",
        imageUrl: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2d1c0?w=800&h=600&fit=crop",
        features: ["Аудит контента", "Контент-план", "KPI метрики"],
        rating: 4.8
    }
];

// Функция для извлечения числового значения цены
function extractPrice(priceString) {
    const match = priceString.match(/[\d\s]+/);
    if (match) {
        return parseInt(match[0].replace(/\s/g, ''), 10);
    }
    return 0;
}

// Функции обработки массива различными методами
const arrayMethods = {
    // Все услуги (исходный массив)
    'all': (arr) => arr,

    // Filter: фильтрация по категории "Разработка"
    'filter-category': (arr) => {
        return arr.filter(service => service.category === 'Разработка');
    },

    // Filter: фильтрация по рейтингу >= 4.8
    'filter-rating': (arr) => {
        return arr.filter(service => service.rating >= 4.8);
    },

    // Sort: сортировка по цене (по возрастанию)
    'sort-price': (arr) => {
        return [...arr].sort((a, b) => {
            const priceA = extractPrice(a.price);
            const priceB = extractPrice(b.price);
            return priceA - priceB;
        });
    },

    // Sort: сортировка по рейтингу (по убыванию)
    'sort-rating': (arr) => {
        return [...arr].sort((a, b) => b.rating - a.rating);
    },

    // Map: добавление метки "Популярный" для услуг с рейтингом >= 4.9
    'map': (arr) => {
        return arr.map(service => ({
            ...service,
            name: service.rating >= 4.9 ? `${service.name} ⭐ Популярный` : service.name
        }));
    },

    // Slice: первые 7 услуг
    'slice': (arr) => {
        return arr.slice(0, 7);
    },

    // Reverse: обратный порядок
    'reverse': (arr) => {
        return [...arr].reverse();
    },

    // Filter + Sort: фильтрация по категории "Дизайн" и сортировка по рейтингу
    'filter-sort': (arr) => {
        return arr
            .filter(service => service.category === 'Дизайн')
            .sort((a, b) => b.rating - a.rating);
    },

    // Filter: услуги с длительностью <= 4 недель
    'filter-duration': (arr) => {
        return arr.filter(service => {
            const match = service.duration.match(/(\d+)/);
            if (match) {
                const weeks = parseInt(match[1], 10);
                return weeks <= 4;
            }
            return false;
        });
    }
};

// Функция для генерации карточек товаров
function renderCatalog(data = servicesCatalog) {
    const container = document.getElementById('catalog-container');
    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p class="no-results">Услуги не найдены</p>';
        return;
    }

    data.forEach(service => {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
            <div class="catalog-card-image">
                <img src="${service.imageUrl}" alt="${service.name}" loading="lazy">
                <div class="catalog-card-category">${service.category}</div>
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
}

// Обработчик клика на кнопки фильтров
function setupFilterButtons() {
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            buttons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс к нажатой кнопке
            button.classList.add('active');
            
            // Получаем метод из data-атрибута
            const method = button.getAttribute('data-method');
            
            // Применяем метод к массиву
            if (arrayMethods[method]) {
                const filteredData = arrayMethods[method](servicesCatalog);
                renderCatalog(filteredData);
            }
        });
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
    setupFilterButtons();
});

