// Конфигурация API
const API_BASE_URL = 'http://localhost:3000';

// Проверка наличия администраторов в системе и показ кнопки
async function checkAdminAccess() {
    const adminBtn = document.getElementById('admin-access-btn');
    if (!adminBtn) return;
    
    try {
        // Получаем всех пользователей
        const response = await fetch(`${API_BASE_URL}/users`);
        if (response.ok) {
            const users = await response.json();
            
            // Проверяем, есть ли хотя бы один администратор
            const hasAdmin = users.some(user => 
                user.role === 'администратор' || 
                user.role === 'admin' || 
                user.role === 'Администратор'
            );
            
            if (hasAdmin) {
                adminBtn.style.display = 'block';
                adminBtn.addEventListener('click', () => {
                    window.location.href = 'admin.html';
                });
            } else {
                adminBtn.style.display = 'none';
            }
        } else {
            adminBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка при проверке доступа:', error);
        adminBtn.style.display = 'none';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
});

