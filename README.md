# Web-labs-

## Лабораторная работа №6: Каталог услуг с JSON Server

### Структура проекта

- `index.html` - главная страница лендинга
- `catalog.html` - страница каталога услуг
- `catalog.js` - JavaScript логика каталога
- `style.css` - стили для всех страниц
- `db.json` - JSON файл с данными для JSON Server
- `package.json` - конфигурация проекта и скрипты

### Настройка JSON Server

#### 1. Установка зависимостей

Убедитесь, что у вас установлен Node.js (версия 14 или выше).

Установите зависимости проекта:

```bash
npm install
```

Это установит `json-server` как зависимость проекта.

#### 2. Запуск JSON Server

Запустите JSON Server с помощью команды:

```bash
npm run server
```

Или напрямую:

```bash
npx json-server --watch db.json --port 3000
```

Сервер будет доступен по адресу: `http://localhost:3000`

#### 3. Доступные эндпоинты

После запуска сервера доступны следующие эндпоинты:

- **Услуги (товары):** `http://localhost:3000/services`
- **Избранное:** `http://localhost:3000/favorites`
- **Корзина:** `http://localhost:3000/cart`

#### 4. Примеры запросов

**Получить все услуги:**
```bash
GET http://localhost:3000/services
```

**Получить услугу по ID:**
```bash
GET http://localhost:3000/services/1
```

**Добавить в избранное:**
```bash
POST http://localhost:3000/favorites
Content-Type: application/json

{
  "serviceId": 1,
  "addedAt": "2024-01-01T00:00:00.000Z"
}
```

**Добавить в корзину:**
```bash
POST http://localhost:3000/cart
Content-Type: application/json

{
  "serviceId": 1,
  "quantity": 1,
  "addedAt": "2024-01-01T00:00:00.000Z"
}
```

**Обновить услугу:**
```bash
PUT http://localhost:3000/services/1
Content-Type: application/json

{
  "id": 1,
  "name": "Обновленное название",
  ...
}
```

**Удалить из корзины:**
```bash
DELETE http://localhost:3000/cart/1
```

### Структура db.json

Файл `db.json` содержит три основных ресурса:

1. **services** - массив услуг (15 объектов)
   - Каждый объект содержит минимум 6 полей:
     - `id` - уникальный идентификатор
     - `name` - название услуги
     - `description` - описание услуги
     - `price` - цена услуги
     - `duration` - длительность выполнения
     - `category` - категория услуги
     - `imageUrl` - ссылка на фото (обязательное поле)
     - `features` - массив особенностей
     - `rating` - рейтинг услуги

2. **favorites** - массив избранных услуг (изначально пустой)
   - Структура может содержать:
     - `id` - уникальный идентификатор записи
     - `serviceId` - ID услуги из массива services
     - `addedAt` - дата добавления

3. **cart** - массив товаров в корзине (изначально пустой)
   - Структура может содержать:
     - `id` - уникальный идентификатор записи
     - `serviceId` - ID услуги из массива services
     - `quantity` - количество
     - `addedAt` - дата добавления

### Дополнительные возможности JSON Server

#### Задержка ответа (для тестирования)

Для имитации задержки сети используйте:

```bash
npm run server:delay
```

Или:

```bash
npx json-server --watch db.json --port 3000 --delay 1000
```

#### Кастомные маршруты

JSON Server автоматически создает маршруты для вложенных ресурсов:

- `GET /services/:id` - получить услугу по ID
- `POST /services` - создать новую услугу
- `PUT /services/:id` - обновить услугу
- `PATCH /services/:id` - частично обновить услугу
- `DELETE /services/:id` - удалить услугу

#### Фильтрация и сортировка

```bash
# Фильтрация по категории
GET http://localhost:3000/services?category=Разработка

# Сортировка по рейтингу
GET http://localhost:3000/services?_sort=rating&_order=desc

# Поиск по названию
GET http://localhost:3000/services?name_like=дизайн

# Пагинация
GET http://localhost:3000/services?_page=1&_limit=5
```

### Использование в JavaScript

Пример работы с API:

```javascript
// Получить все услуги
fetch('http://localhost:3000/services')
  .then(response => response.json())
  .then(data => console.log(data));

// Добавить в избранное
fetch('http://localhost:3000/favorites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    serviceId: 1,
    addedAt: new Date().toISOString()
  })
})
  .then(response => response.json())
  .then(data => console.log(data));

// Добавить в корзину
fetch('http://localhost:3000/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    serviceId: 1,
    quantity: 1,
    addedAt: new Date().toISOString()
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Примечания

- JSON Server сохраняет изменения в файл `db.json` автоматически
- При перезапуске сервера все изменения сохраняются
- Для продакшена рекомендуется использовать полноценный backend API
- JSON Server подходит для разработки и прототипирования
