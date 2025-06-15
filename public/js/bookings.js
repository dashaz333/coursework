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
        console.warn('Элемент с id "bookings" не найден.');
        return;
    }

    const user_id = sessionStorage.getItem('user_id');
    if (!user_id) {
        bookingsContainer.innerHTML = '<p>Пожалуйста, войдите в систему...</p>';
        return;
    }

    try {
        const allBookings = await fetchBookings();

        if (!Array.isArray(allBookings)) {
            bookingsContainer.innerHTML = '<p>Ошибка при загрузке бронирований</p>';
            return;
        }

        // Ключевое исправление: правильная фильтрация по user_id
        const userBookings = allBookings.filter(booking => 
            booking.user_id && parseInt(booking.user_id) === parseInt(user_id)
        );

        bookingsContainer.innerHTML = '';

        if (userBookings.length === 0) {
            bookingsContainer.innerHTML = '<p>У вас пока нет бронирований.</p>';
            return;
        }

        // Улучшенное форматирование дат
        const formatDate = (dateStr) => {
            if (!dateStr) return 'Не указана';
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? 'Неверная дата' : 
                date.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                });
        };

        for (const booking of userBookings) {
            try {
                let roomName = 'Неизвестный номер';
                if (booking.room_id) {
                    const room = await fetchRoomDetails(booking.room_id);
                    roomName = room.name || roomName;
                }

                const bookingElement = document.createElement('div');
                bookingElement.classList.add('booking-item');
                bookingElement.innerHTML = `
                    <h4>Бронирование номера "${roomName}"</h4>
                    <p>ID бронирования: ${booking.id || 'Не указан'}</p>
                    <p>Даты проживания: с ${formatDate(booking.check_in_date)} до ${formatDate(booking.check_out_date)}</p>
                    <p>Количество гостей: ${booking.number_of_guests || 'Не указано'}</p>
                    ${booking.comments ? `<p>Пожелания: ${booking.comments}</p>` : ''}
                    <p>Статус: ${booking.status || 'Не указан'}</p>
                    <p>Общая цена: ${booking.total_price || 'Не указана'} ₽</p>
                `;

                bookingsContainer.appendChild(bookingElement);
            } catch (error) {
                console.error('Ошибка обработки бронирования:', error);
            }
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

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) { // Проверяем, существует ли форма бронирования на этой странице

        // Логика для отображения названия выбранного номера на странице формы бронирования при загрузке
        const roomIdOnLoad = getRoomIdFromUrl();
        if (roomIdOnLoad) {
            fetchRoomDetails(roomIdOnLoad)
                .then(room => {
                    const roomNameElement = document.getElementById('selected-room-name');
                    if (roomNameElement && room && room.name) {
                        roomNameElement.textContent = `Выбранный номер: ${room.name}`;
                    } else if (roomNameElement) {
                         roomNameElement.textContent = `Выбран номер с ID: ${roomIdOnLoad}`;
                         showModal('Не удалось получить название выбранного номера.');
                    }
                })
                .catch(error => {
                    console.error('Ошибка при получении деталей номера для отображения:', error);
                    showModal('Произошла ошибка при загрузке информации о номере.');
                });
        } else {
             console.warn('ID номера не найден в URL для страницы формы бронирования.');
             showModal('Ошибка: Идентификатор номера для бронирования отсутствует в адресе страницы.');
             // window.location.href = '/rooms.html';
        }

        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const arrivalDateInput = document.getElementById('arrival-date');
            const departureDateInput = document.getElementById('departure-date');
            const arrivalDate = arrivalDateInput.value; // Формат YYYY-MM-DD из input type="date"
            const departureDate = departureDateInput.value; // Формат YYYY-MM-DD из input type="date"

            // Валидация дат с использованием new Date() и getTime()
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const arrival = new Date(arrivalDate); // new Date() для YYYY-MM-DD интерпретирует как UTC
            const departure = new Date(departureDate); // new Date() для YYYY-MM-DD интерпретирует как UTC


            if (!arrivalDate || !departureDate || isNaN(arrival.getTime()) || isNaN(departure.getTime()) || isNaN(departure.getTime())) {
                 showModal('Пожалуйста, выберите корректные даты заезда и выезда.');
                 return;
            }

            // Валидация дат: сравнение с today может потребовать преобразования в местное время
            // или сравнения только YYYY-MM-DD частей строк
            // Для простоты, сравним объекты Date напрямую, учитывая потенциальный сдвиг UTC vs Local
             if (arrival.getTime() < today.getTime()) {
                showModal('Дата заезда не может быть в прошлом.');
                return;
            }

            if (departure.getTime() <= arrival.getTime()) {
                showModal('Дата выезда должна быть позже даты заезда.');
                return;
            }


            const roomId = getRoomIdFromUrl();

            if (!roomId) {
                showModal('Ошибка: Не удалось определить номер для бронирования.');
                return;
            }

            if (!checkUserId()) {
                showModal('Для бронирования номера необходимо авторизоваться.', true);
                return;
            }

            const roomDetails = await fetchRoomDetails(roomId);

            if (!roomDetails || roomDetails.price === null || roomDetails.price === undefined) {
                 showModal('Не удалось получить информацию о цене номера. Бронирование невозможно.');
                 console.error('Не удалось получить цену номера:', roomDetails);
                 return;
            }

            const numGuests = document.getElementById('num-guests').value;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const comments = document.getElementById('comments').value;

            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        room_id: roomId,
                        // Отправляем даты в формате YYYY-MM-DD
                        check_in_date: arrivalDate,
                        check_out_date: departureDate,
                        number_of_guests: parseInt(numGuests, 10),
                        name: name,
                        email: email,
                        phone: phone,
                        comments: comments,
                        user_id: sessionStorage.getItem('user_id'),
                        total_price: roomDetails.price,
                         // booking_date и status обычно устанавливаются на сервере
                    }),
                });

                if (response.ok) {
                    showModal('Бронирование успешно создано!');
                    bookingForm.reset();
                    // setTimeout(() => { window.location.href = '/profil.html'; }, 2000);
                } else {
                    const errorData = await response.json();
                    console.error('Ошибка при создании бронирования:', response.status, errorData);
                    let errorMessage = `Произошла ошибка при создании бронирования: ${errorData.message || response.statusText}`;
                     if (errorData && typeof errorData === 'object') {
                        const otherErrors = Object.keys(errorData)
                            .filter(key => key !== 'message')
                            .map(key => `${key}: ${JSON.stringify(errorData[key])}`)
                            .join(', ');
                        if (otherErrors) {
                            errorMessage += ` (${otherErrors})`;
                        }
                    }
                    showModal(errorMessage);
                }
            } catch (error) {
                console.error('Ошибка при отправке запроса:', error);
                showModal('Произошла ошибка при отправке запроса.');
            }
        });
    }
});

// Оставлены функции fetchRooms и displayRooms
async function fetchRooms() { /* ... ваш существующий код ... */ }
async function displayRooms() { /* ... ваш существующий код ... */ }