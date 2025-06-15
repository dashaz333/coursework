// js/bookings.js

// --- Shared Utility Functions ---

// Функция для отображения модального окна
function showModal(message, redirect = false) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <p>${message}</p>
            ${redirect ? '<button id="proceed-button">Перейти к авторизации</button>' : '<button id="ok-button">ОК</button>'}
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    const proceedButton = modal.querySelector('#proceed-button');
    const okButton = modal.querySelector('#ok-button');

    if (proceedButton) {
        proceedButton.addEventListener('click', () => {
            modal.remove();
            window.location.href = '/login.html';
        });
    } else if (okButton) {
        okButton.addEventListener('click', () => {
            modal.remove();
        });
    }

    modal.style.display = 'block';
}

// Функция для проверки наличия идентификатора пользователя в sessionStorage
function checkUserId() {
    const user_id = sessionStorage.getItem('user_id');
    return user_id !== null && user_id !== '';
}

// Функция для получения деталей одного номера по ID
async function fetchRoomDetails(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) {
            console.error(`Ошибка при получении данных номера ${roomId}:`, response.status, await response.text());
            return { name: 'Неизвестный номер', price: null };
        }
        const room = await response.json();
        console.log(`fetchRoomDetails: Получены детали номера ${roomId}:`, room);
        return room; // Убедитесь, что сервер возвращает name
    } catch (error) {
        console.error(`fetchRoomDetails: Критическая ошибка при получении данных номера ${roomId}:`, error);
        return { name: 'Ошибка загрузки номера', price: null };
    }
}

// Функция для получения всех бронирований
async function fetchBookings() {
    try {
        const response = await fetch('/api/bookings');
        if (!response.ok) {
            console.error('Ошибка при получении списка бронирований:', response.status, await response.text());
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookings = await response.json();
        console.log('fetchBookings: Получены все бронирования:', bookings);
        // Убедитесь, что каждый объект в массиве имеет поля из вашей БД:
        // id, user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, booking_date, status
        return bookings;
    } catch (error) {
        console.error('fetchBookings: Критическая ошибка при получении списка бронирований:', error);
        return [];
    }
}

// --- Profile Page Specific Function ---

// Функция для отображения бронирований пользователя
async function displayBookings() {
    const bookingsContainer = document.getElementById('bookings');
    if (!bookingsContainer) {
        console.warn('Элемент #bookings не найден.');
        return;
    }

    const user_id = sessionStorage.getItem('user_id');
    if (!user_id) {
        bookingsContainer.innerHTML = '<p>Пожалуйста, войдите в систему.</p>';
        return;
    }

    try {
        const response = await fetch('/api/bookings');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке бронирований');
        }
        const allBookings = await response.json();

        // Фильтрация бронирований текущего пользователя (сравниваем как числа)
        const userBookings = allBookings.filter(booking => 
            parseInt(booking.user_id) === parseInt(user_id)
        );

        if (userBookings.length === 0) {
            bookingsContainer.innerHTML = '<p>У вас нет бронирований.</p>';
            return;
        }

        // Очистка контейнера перед выводом
        bookingsContainer.innerHTML = '';

        // Для каждого бронирования получаем название номера (если room_id есть)
        for (const booking of userBookings) {
            let roomName = 'Неизвестный номер';
            if (booking.room_id) {
                try {
                    const roomResponse = await fetch(`/api/rooms/${booking.room_id}`);
                    if (roomResponse.ok) {
                        const room = await roomResponse.json();
                        roomName = room.name || roomName;
                    }
                } catch (error) {
                    console.error('Ошибка при загрузке данных номера:', error);
                }
            }

            // Форматирование дат
            const formatDate = (dateStr) => {
                if (!dateStr) return 'Не указана';
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? 'Неверная дата' : date.toLocaleDateString();
            };

            // Создание элемента бронирования
            const bookingElement = document.createElement('div');
            bookingElement.className = 'booking-item';
            bookingElement.innerHTML = `
                <h4>Бронирование номера: ${roomName}</h4>
                <p>ID: ${booking.id || 'Не указан'}</p>
                <p>Даты: ${formatDate(booking.check_in_date)} → ${formatDate(booking.check_out_date)}</p>
                <p>Гостей: ${booking.number_of_guests || 'Не указано'}</p>
                <p>Цена: ${booking.total_price ? `${booking.total_price} ₽` : 'Не указана'}</p>
                <p>Статус: ${booking.status || 'Не указан'}</p>
            `;

            bookingsContainer.appendChild(bookingElement);
        }

    } catch (error) {
        console.error('Ошибка:', error);
        bookingsContainer.innerHTML = '<p>Произошла ошибка при загрузке бронирований.</p>';
    }
}
// --- Booking Form Specific Functions and Event Listener ---

// Функция для получения ID номера из URL (для страницы формы бронирования)
function getRoomIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function displayBookings() {
    const bookingsContainer = document.getElementById('bookings');
    if (!bookingsContainer) {
        console.error('Контейнер для бронирований не найден');
        return;
    }

    // Получаем ID текущего пользователя
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        bookingsContainer.innerHTML = '<p>Для просмотра бронирований необходимо авторизоваться</p>';
        return;
    }

    try {
        // Загружаем все бронирования
        const response = await fetch('/api/bookings');
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        const allBookings = await response.json();

        // Фильтруем бронирования текущего пользователя
        const userBookings = allBookings.filter(booking => 
            booking.user_id && parseInt(booking.user_id) === parseInt(userId)
        );

        if (userBookings.length === 0) {
            bookingsContainer.innerHTML = '<p>У вас нет активных бронирований</p>';
            return;
        }

        // Очищаем контейнер
        bookingsContainer.innerHTML = '';

        // Функция для красивого форматирования даты
        const formatDate = (dateString) => {
            if (!dateString) return 'дата не указана';
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'неверная дата';
            
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return date.toLocaleDateString('ru-RU', options);
        };

        // Сортируем бронирования по дате заезда (новые сверху)
        userBookings.sort((a, b) => 
            new Date(b.check_in_date) - new Date(a.check_in_date)
        );

        // Создаем элементы для каждого бронирования
        for (const booking of userBookings) {
            try {
                // Получаем информацию о номере
                let roomName = 'Неизвестный номер';
                if (booking.room_id) {
                    const roomResponse = await fetch(`/api/rooms/${booking.room_id}`);
                    if (roomResponse.ok) {
                        const roomData = await roomResponse.json();
                        roomName = roomData.name || roomName;
                    }
                }

                // Создаем элемент бронирования
                const bookingElement = document.createElement('div');
                bookingElement.className = 'booking-card';
                bookingElement.innerHTML = `
                    <div class="booking-header">
                        <h3>${roomName}</h3>
                    </div>
                    <div class="booking-dates">
                        <p>Проживание: с ${formatDate(booking.check_in_date)} до ${formatDate(booking.check_out_date)}</p>
                    </div>
                    <div class="booking-details">
                        <p><strong>Номер бронирования:</strong> ${booking.id || 'не указан'}</p>
                        <p><strong>Гостей:</strong> ${booking.number_of_guests || 'не указано'}</p>
                        <p><strong>Стоимость:</strong> ${booking.total_price ? `${booking.total_price} ₽` : 'не указана'}</p>
                    </div>
                `;

                bookingsContainer.appendChild(bookingElement);
            } catch (error) {
                console.error(`Ошибка обработки бронирования ${booking.id}:`, error);
            }
        }

    } catch (error) {
        console.error('Ошибка загрузки бронирований:', error);
        bookingsContainer.innerHTML = `
            <div class="error-message">
                <p>Не удалось загрузить информацию о бронированиях</p>
                <button onclick="window.location.reload()">Попробовать снова</button>
            </div>
        `;
    }
}

// Оставлены функции fetchRooms и displayRooms
async function fetchRooms() { /* ... ваш существующий код ... */ }
async function displayRooms() { /* ... ваш существующий код ... */ }