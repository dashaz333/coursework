const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение отправки формы

    // Получаем значения из формы
    const name = registerForm.elements['name'].value;
    const surname = registerForm.elements['surname'].value;
    const patronymic = registerForm.elements['patronymic'].value;
    const email = registerForm.elements['email'].value;
    const phone = registerForm.elements['phone'].value;
    const password = registerForm.elements['password'].value;

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, surname, patronymic, email, phone, password }),
        });

        if (response.ok) {
            // Успешная регистрация
            showModal('Регистрация прошла успешно! Вы можете перейти на страницу авторизации.', true); // Показываем модальное окно с возможностью перехода
        } else {
            // Обработка ошибок
            console.error('Ошибка при регистрации:', response.status);
            showModal('Произошла ошибка при регистрации.'); // Показываем модальное окно об ошибке
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showModal('Произошла ошибка при отправке запроса.'); // Показываем модальное окно об ошибке
    }
});

// Функция для отображения модального окна
function showModal(message, redirect = false) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <p>${message}</p>
            ${redirect ? '<button id="proceed-button">Перейти к авторизации</button>' : '<button id="ok-button">ОК</button>'} <!-- Кнопка зависит от ситуации -->
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
            window.location.href = '/login.html'; // Переход на страницу авторизации
        });
    } else if (okButton) {
        okButton.addEventListener('click', () => {
            modal.remove(); // Удалить модальное окно
        });
    }

    // Показать модальное окно
    modal.style.display = 'block';
}
