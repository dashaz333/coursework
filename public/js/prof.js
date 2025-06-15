// js/prof.js

// Функция для обработки выхода (как предоставлено пользователем)
function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

document.addEventListener('DOMContentLoaded', async function () {
    // Получаем user_id из sessionStorage
    // ИСПРАВЛЕНО: Используем ключ 'user_id' для получения
    const user_id = sessionStorage.getItem('user_id');

    // Проверяем, есть ли user_id
    // ИСПРАВЛЕНО: Проверяем переменную user_id
    if (!user_id) {
        // Если user_id нет, перенаправляем на страницу авторизации
        window.location.href = '/login.html';
        return;
    }

    try {
        // Функция для получения данных пользователя из API
        // ИСПРАВЛЕНО: Используем user_id_param как параметр функции для ясности
        async function fetchUserData(user_id_param) {
            // Убедитесь, что ваш серверный API /api/users/:id возвращает данные пользователя
            const response = await fetch(`/api/users/${user_id_param}`); // ИСПРАВЛЕНО: Используем user_id_param в запросе
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Данные пользователя не найдены.');
                }
                throw new Error(`Ошибка при получении данных пользователя: ${response.status}`);
            }
            return await response.json();
        }

        // Получаем данные пользователя
        // ИСПРАВЛЕНО: Передаем user_id в функцию fetchUserData
        const userData = await fetchUserData(user_id);

        // Заполняем HTML-элементы данными пользователя
        document.getElementById('user-name').textContent = userData.name || '';
        document.getElementById('user-surname').textContent = userData.surname || '';
        document.getElementById('user-patronymic').textContent = userData.patronymic || '';
        document.getElementById('user-email').textContent = userData.email || '';
        document.getElementById('user-phone').textContent = userData.phone || '';

        // Вызываем функцию для отображения бронирований (определена в bookings.js)
        // Эта функция найдет элемент #bookings и заполнит его бронированиями пользователя
        // Убедитесь, что displayBookings корректно получает данные от /api/bookings
        // displayBookings теперь использует user_id из sessionStorage, которую мы корректно получили выше
        await displayBookings();

    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        // Вместо alert можно использовать showModal для единообразия
        // Убедитесь, что showModal доступна в этом файле (подключив bookings.js перед prof.js)
        showModal('Произошла ошибка при загрузке данных профиля: ' + error.message);
    }
});

// displayBookings, showModal, fetchBookings, fetchRoomDetails, checkUserId
// должны быть доступны в этом файле, если они определены в bookings.js, который подключен ДО prof.js
// Если bookings.js подключается ПОСЛЕ prof.js в HTML, то displayBookings и другие функции
// из bookings.js не будут видны в prof.js. Убедитесь, что bookings.js подключен первым.