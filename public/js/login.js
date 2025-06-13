// Получаем элемент формы авторизации
const loginForm = document.getElementById('loginForm');

// Обработчик события при отправке формы
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    // Получение email и пароля из формы
    const email = loginForm.elements['email'].value;
    const password = loginForm.elements['password'].value;

    try {
        // Отправляем учетные данные на сервер для авторизации
        const response = await fetch('/api/users/login', { // Исправлен путь
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }), // Преобразуем данные в JSON
        });

        if (response.ok) {
            // Успешная авторизация
            const data = await response.json(); // Получаем данные с сервера

            // Сохраняем ID в sessionStorage
            sessionStorage.setItem('userId', data.user.id); // Сохранение ID пользователя
            sessionStorage.setItem('userName', data.user.name); // Сохранение имени пользователя
            sessionStorage.setItem('userEmail', data.user.email); // Сохранение email пользователя

            // Перенаправление на главную страницу
            window.location.href = '/index.html';
        } else {
            // Ошибка авторизации
            const errorData = await response.json(); // Получаем детали ошибки
            alert(errorData.message || 'Ошибка авторизации'); // Сообщение об ошибке
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке запроса'); // Сообщение об ошибке
    }
});
