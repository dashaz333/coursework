// js/prof.js

// Переиспользуемая функция showModal для сообщений и подтверждений
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
        modal.remove();
    });

    const confirmButton = modal.querySelector('#confirm-button');
    confirmButton.addEventListener('click', () => {
        modal.remove();
        if (onConfirm) {
            onConfirm();
        }
    });

    if (showCancel) {
        const cancelButton = modal.querySelector('#cancel-button');
        cancelButton.addEventListener('click', () => {
            modal.remove();
        });
    }
    modal.style.display = 'block';
}

// Функция для обновления данных профиля на странице без перезагрузки
function updateProfileDisplay(updatedData) {
    document.getElementById('user-name').textContent = updatedData.name || '';
    document.getElementById('user-surname').textContent = updatedData.surname || '';
    document.getElementById('user-patronymic').textContent = updatedData.patronymic || '';
    document.getElementById('user-email').textContent = updatedData.email || '';
    document.getElementById('user-phone').textContent = updatedData.phone || '';
}

// Новая функция для отображения формы редактирования профиля
function showEditProfileModal(userData) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2 style="margin-bottom: 20px;">Редактировать профиль</h2>
            <form id="edit-profile-form">
                <div class="form-group">
                    <label for="edit-name">Имя:</label>
                    <input type="text" id="edit-name" value="${userData.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-surname">Фамилия:</label>
                    <input type="text" id="edit-surname" value="${userData.surname || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-patronymic">Отчество:</label>
                    <input type="text" id="edit-patronymic" value="${userData.patronymic || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-email">Email:</label>
                    <input type="email" id="edit-email" value="${userData.email || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-phone">Телефон:</label>
                    <input type="tel" id="edit-phone" value="${userData.phone || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-password">Новый пароль (оставьте пустым, чтобы не менять):</label>
                    <input type="password" id="edit-password">
                </div>
                <button type="submit" class="button_1" style="margin-top: 20px; width: 80%; align-self: center;">Сохранить изменения</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    modal.style.display = 'block';

    const editProfileForm = modal.querySelector('#edit-profile-form');
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            name: document.getElementById('edit-name').value,
            surname: document.getElementById('edit-surname').value,
            patronymic: document.getElementById('edit-patronymic').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
        };

        const newPassword = document.getElementById('edit-password').value;
        if (newPassword) {
            updatedData.password = newPassword;
        }

        const user_id = sessionStorage.getItem('user_id');

        try {
            const response = await fetch(`/api/users/${user_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                modal.remove();
                showModal('Данные профиля успешно обновлены!', () => {
                    updateProfileDisplay(updatedData); // Используем новую функцию вместо location.reload()
                });
            } else {
                const errorData = await response.json();
                console.error('Ошибка при обновлении профиля:', response.status, errorData);
                showModal(`Ошибка при обновлении профиля: ${errorData.message || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса на обновление:', error);
            showModal('Произошла ошибка при отправке запроса на обновление профиля.');
        }
    });
}

// Обновленная функция для обработки выхода (без изменений)
function logout() {
    showModal('Вы точно хотите выйти из профиля?', () => {
        sessionStorage.clear();
        window.location.href = "login.html";
    }, true);
}

// Остальной код остается без изменений
document.addEventListener('DOMContentLoaded', async function () {
    const user_id = sessionStorage.getItem('user_id');

    if (!user_id) {
        window.location.href = '/login.html';
        return;
    }

    try {
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

        const userData = await fetchUserData(user_id);

        document.getElementById('user-name').textContent = userData.name || '';
        document.getElementById('user-surname').textContent = userData.surname || '';
        document.getElementById('user-patronymic').textContent = userData.patronymic || '';
        document.getElementById('user-email').textContent = userData.email || '';
        document.getElementById('user-phone').textContent = userData.phone || '';

        if (typeof displayBookings === 'function') {
            await displayBookings();
        } else {
            console.error('Функция displayBookings не найдена. Убедитесь, что bookings.js подключен до prof.js.');
        }

        console.log('Данные пользователя, полученные с сервера:', userData);
        console.log('Значение userData.rights:', userData ? userData.rights : 'userData отсутствует');

        if (userData && userData.rights === 'a') {
            console.log('Пользователь является администратором. Отображаем раздел всех бронирований.');
            const adminSection = document.getElementById('admin-bookings-section');
            if (adminSection) {
                adminSection.style.display = 'block';
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
            const adminSection = document.getElementById('admin-bookings-section');
            if (adminSection) {
                adminSection.style.display = 'none';
            }
        }

        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                showEditProfileModal(userData);
            });
        }

    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        showModal('Произошла ошибка при загрузке данных профиля: ' + error.message);
    }
});