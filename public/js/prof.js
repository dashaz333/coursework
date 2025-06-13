// js/prof.js

// Функция для обработки выхода (как предоставлено пользователем)
function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

document.addEventListener('DOMContentLoaded', async function () {
    // Получаем ID пользователя из sessionStorage
    const userId = sessionStorage.getItem('userId');

    // Проверяем, есть ли ID пользователя
    if (!userId) {
        // Если ID нет, перенаправляем на страницу авторизации
        // (showModal в bookings.js при checkUserId также может сработать, но это основной обработчик)
        window.location.href = '/login.html';
        return;
    }

    try {
        // Функция для получения данных пользователя из API
        async function fetchUserData(userId) {
            const response = await fetch(`/api/users/${userId}`); // Предполагаем такой endpoint
            if (!response.ok) {
                 // Если пользователь не найден (например, 404) или другая ошибка
                if (response.status === 404) {
                    throw new Error('Данные пользователя не найдены.');
                }
                throw new Error(`Ошибка при получении данных пользователя: ${response.status}`);
            }
            return await response.json();
        }

        // Получаем данные пользователя
        const userData = await fetchUserData(userId);

        // Заполняем HTML-элементы данными пользователя
        document.getElementById('user-name').textContent = userData.name || '';
        document.getElementById('user-surname').textContent = userData.surname || '';
        document.getElementById('user-patronymic').textContent = userData.patronymic || '';
        document.getElementById('user-email').textContent = userData.email || '';
        document.getElementById('user-phone').textContent = userData.phone || '';

        // Вызываем функцию для отображения бронирований (определена в bookings.js)
        // Эта функция найдет элемент #bookings и заполнит его бронированиями пользователя
        await displayBookings();

    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        alert('Произошла ошибка при загрузке данных профиля: ' + error.message);
        // Опционально перенаправить при критической ошибке загрузки данных профиля
        // window.location.href = '/login.html';
    }
});