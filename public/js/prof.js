// js/prof.js

// Функция для отображения модального окна (скопирована из примера авторизации)
function showModal(message, onConfirm, showCancel = false) {
    const modal = document.createElement('div');
    modal.className = 'modal'; 
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <p>${message}</p>
            <button id="confirm-button">Да</button>
            ${showCancel ? '<button id="cancel-button">Нет</button>' : ''}
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.remove(); // Закрыть модальное окно
    });

    const confirmButton = modal.querySelector('#confirm-button');
    confirmButton.addEventListener('click', () => {
        modal.remove(); // Удалить модальное окно
        if (onConfirm) {
            onConfirm(); // Выполнить действие при подтверждении
        }
    });

    if (showCancel) {
        const cancelButton = modal.querySelector('#cancel-button');
        cancelButton.addEventListener('click', () => {
            modal.remove(); // Удалить модальное окно
        });
    }

    // Показать модальное окно
    modal.style.display = 'block';
}

// Обновленная функция для обработки выхода
function logout() {
    showModal('Вы точно хотите выйти из профиля?', () => {
        // Действие при нажатии "Да" (выход)
        sessionStorage.clear(); // Удаляем все данные из Session Storage
        window.location.href = "login.html"; // Перенаправление на страницу авторизации
    }, true); // true для отображения кнопки "Нет"
}

document.addEventListener('DOMContentLoaded', async function () {
    // Получаем user_id из sessionStorage
    const user_id = sessionStorage.getItem('user_id');

    // Проверяем, есть ли user_id
    if (!user_id) {
        // Если user_id нет, перенаправляем на страницу авторизации
        window.location.href = '/login.html';
        return;
    }

    try {
        // Функция для получения данных пользователя из API
        async function fetchUserData(user_id_param) {
            const response = await fetch(`/api/users/${user_id_param}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Данные пользователя не найдены.');
                }
                throw new Error(`Ошибка при получении данных пользователя: ${response.status}`);
            }
            return await response.json();
        }

        // Получаем данные пользователя
        const userData = await fetchUserData(user_id);

        // Заполняем HTML-элементы данными пользователя
        document.getElementById('user-name').textContent = userData.name || '';
        document.getElementById('user-surname').textContent = userData.surname || '';
        document.getElementById('user-patronymic').textContent = userData.patronymic || '';
        document.getElementById('user-email').textContent = userData.email || '';
        document.getElementById('user-phone').textContent = userData.phone || '';

        // Вызываем функцию для отображения бронирований текущего пользователя (определена в bookings.js)
        if (typeof displayBookings === 'function') {
             await displayBookings();
        } else {
             console.error('Функция displayBookings не найдена. Убедитесь, что bookings.js подключен до prof.js.');
        }

        // --- НОВАЯ ЛОГИКА ДЛЯ АДМИНИСТРАТОРА ---
        // !!! ДОБАВЛЕНО ДЛЯ ОТЛАДКИ !!!
        console.log('Данные пользователя, полученные с сервера:', userData);
        console.log('Значение userData.rights:', userData ? userData.rights : 'userData отсутствует');
        // !!! КОНЕЦ ДОБАВЛЕННОГО !!!
        // Проверяем права пользователя
        if (userData && userData.rights === 'a') {
            console.log('Пользователь является администратором. Отображаем раздел всех бронирований.');
            // Отображаем скрытый раздел для администратора
            const adminSection = document.getElementById('admin-bookings-section');
            if (adminSection) {
                adminSection.style.display = 'block';
                // Вызываем функцию для отображения всех бронирований (определена в bookings.js)
                if (typeof displayAllBookingsAdmin === 'function') {
                    await displayAllBookingsAdmin();
                } else {
                    console.error('Функция displayAllBookingsAdmin не найдена. Убедитесь, что bookings.js подключен до prof.js.');
                }
            } else {
                console.error('Элемент с id "admin-bookings-section" не найден.');
            }
        } else {
            console.log('Пользователь не является администратором. Скрываем раздел всех бронирований.');
            // Убедимся, что раздел администратора скрыт (на случай, если он был случайно виден)
             const adminSection = document.getElementById('admin-bookings-section');
             if (adminSection) {
                 adminSection.style.display = 'none';
             }
        }
        // --- КОНЕЦ НОВОЙ ЛОГИКИ ---


    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        showModal('Произошла ошибка при загрузке данных профиля: ' + error.message);
    }

});

