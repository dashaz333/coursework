
// Получаем элемент формы авторизации
const loginForm = document.getElementById('loginForm');

// Функция для отображения модального окна (скопирована из примера регистрации)
function showModal(message, redirect = false) {
    const modal = document.createElement('div');
    modal.className = 'modal'; 
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <p>${message}</p>
            ${redirect ? '<button id="proceed-button">Перейти на главную</button>' : '<button id="ok-button">ОК</button>'} <!-- Кнопка зависит от ситуации -->
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.remove(); // Закрыть модальное окно
    });

    const proceedButton = modal.querySelector('#proceed-button');
    const okButton = modal.querySelector('#ok-button');

    if (proceedButton) {
        proceedButton.addEventListener('click', () => {
            modal.remove(); // Удалить модальное окно
            window.location.href = '/index.html'; // Переход на главную страницу
        });
    } else if (okButton) {
        okButton.addEventListener('click', () => {
            modal.remove(); // Удалить модальное окно
        });
    }

    // Показать модальное окно
    modal.style.display = 'block';
}

// Обработчик события при отправке формы
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    // Получение email и пароля из формы
    const email = loginForm.elements['email'].value;
    const password = loginForm.elements['password'].value;

    try {
        // Отправляем учетные данные на сервер для авторизации
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }), // Преобразуем данные в JSON
        });

        if (response.ok) {
            // Успешная авторизация
            const data = await response.json(); // Получаем данные с сервера

            // Сохраняем данные в sessionStorage
            sessionStorage.setItem('user_id', data.user.id);
            sessionStorage.setItem('userName', data.user.name);
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('userRights', data.user.rights);

            // Показываем модальное окно об успешной авторизации с перенаправлением
            showModal('Вы удачно авторизовались!', true);

        } else {
            // Ошибка авторизации
            const errorData = await response.json(); // Получаем детали ошибки
            // Показываем модальное окно об ошибке
            showModal(errorData.message || 'Ошибка авторизации');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        // Показываем модальное окно об ошибке запроса
        showModal('Произошла ошибка при отправке запроса');
    }
});

