// js/bookings.js

// --- Shared Utility Functions ---

// Функция для отображения модального окна
function showModal(message, redirect = false) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    // Basic modal structure, styling should be in CSS file
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
    const userId = sessionStorage.getItem('userId');
    return userId !== null && userId !== '';
}

// Функция для получения деталей одного номера по ID
async function fetchRoomDetails(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`); // Предполагаем, что у вас есть такой endpoint
        if (!response.ok) {
            console.error(`Ошибка при получении данных номера ${roomId}:`, response.status);
            // Возвращаем объект с placeholder'ом имени в случае ошибки
            return { name: 'Неизвестный номер' };
        }
        const room = await response.json();
        return room;
    } catch (error) {
        console.error(`Ошибка при получении данных номера ${roomId}:`, error);
        return { name: 'Ошибка загрузки номера' }; // Возвращаем объект в случае сетевой ошибки
    }
}

// Функция для получения всех бронирований (как предоставлено пользователем)
async function fetchBookings() {
    try {
        const response = await fetch('/api/bookings'); // Предполагаем, что этот endpoint возвращает все бронирования
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookings = await response.json();
        return bookings;
    } catch (error) {
        console.error('Ошибка при получении списка бронирований:', error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
}


// --- Profile Page Specific Function (используется также на странице бронирования для примера) ---

// Функция для отображения бронирований пользователя
async function displayBookings() {
    // Проверяем, существует ли контейнер для бронирований на текущей странице
    const bookingsContainer = document.getElementById('bookings');
    if (!bookingsContainer) {
        // Скрипт может быть включен на страницах без элемента #bookings
        // console.warn('Элемент с id "bookings" не найден. Пропуск отображения бронирований.');
        return;
    }

    const userId = sessionStorage.getItem('userId');

    if (!userId) {
        // Если ID пользователя нет, показываем сообщение
        bookingsContainer.innerHTML = '<p>Пожалуйста, войдите в систему, чтобы просмотреть ваши бронирования.</p>';
        return;
    }

    const allBookings = await fetchBookings(); // Получаем все бронирования

    // Фильтруем бронирования для текущего пользователя
    const userBookings = allBookings.filter(booking => booking.user_id === userId);

    bookingsContainer.innerHTML = ''; // Очищаем предыдущие бронирования

    if (userBookings.length === 0) {
        bookingsContainer.innerHTML = '<p>У вас пока нет бронирований.</p>';
    } else {
        // Получаем детали номеров для каждого бронирования параллельно с использованием Promise.all
        const bookingsWithRoomDetails = await Promise.all(userBookings.map(async booking => {
            const room = await fetchRoomDetails(booking.room_id);
            return { ...booking, roomName: room.name }; // Добавляем название номера к объекту бронирования
        }));

        // Сортируем бронирования по дате заезда (опционально)
        bookingsWithRoomDetails.sort((a, b) => new Date(a.arrival_date) - new Date(b.arrival_date));


        bookingsWithRoomDetails.forEach(booking => {
            const bookingElement = document.createElement('div');
            bookingElement.classList.add('booking-item'); // Используем специфичный класс для элементов бронирования
            // Форматируем даты, если нужно
            const arrivalDate = booking.arrival_date ? new Date(booking.arrival_date).toLocaleDateString() : 'Не указана';
            const departureDate = booking.departure_date ? new Date(booking.departure_date).toLocaleDateString() : 'Не указана';

            bookingElement.innerHTML = `
                <h4>Бронирование номера "${booking.roomName}"</h4>
                <p>ID бронирования: ${booking.id}</p>
                <p>Даты: с ${arrivalDate} по ${departureDate}</p>
                <p>Количество гостей: ${booking.num_guests || 'Не указано'}</p>
                ${booking.comments ? `<p>Пожелания: ${booking.comments}</p>` : ''}
                ${booking.status ? `<p>Статус: ${booking.status}</p>` : ''}
                <!-- Добавьте другие детали бронирования при необходимости -->
            `;
            bookingsContainer.appendChild(bookingElement);
        });
    }
}

// --- Booking Form Page Specific Logic ---

// Функция для получения ID номера из URL (для страницы формы бронирования)
function getRoomIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Add event listener for the booking form submission (only runs if the form exists)
document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) { // Проверяем, существует ли форма бронирования на этой странице
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Получаем значения дат
            const arrivalDateInput = document.getElementById('arrival-date');
            const departureDateInput = document.getElementById('departure-date');
            const arrivalDate = arrivalDateInput.value;
            const departureDate = departureDateInput.value;

            // Валидация дат
            const today = new Date();
            // Сбрасываем время, чтобы сравнивать только даты
            today.setHours(0, 0, 0, 0);
            const arrival = new Date(arrivalDate);
            const departure = new Date(departureDate);

            if (!arrivalDate || !departureDate) {
                 showModal('Пожалуйста, выберите даты заезда и выезда.');
                 return;
            }

             if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
                showModal('Некорректный формат даты.');
                return;
            }

            if (arrival < today) {
                showModal('Дата заезда не может быть в прошлом.');
                return;
            }

            if (departure <= arrival) {
                showModal('Дата выезда должна быть позже даты заезда.');
                return;
            }

            // Получаем остальные данные формы
            const roomId = getRoomIdFromUrl(); // Получаем ID номера из URL
            const numGuests = document.getElementById('num-guests').value;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const comments = document.getElementById('comments').value;

            // Проверяем, что ID номера был получен
            if (!roomId) {
                showModal('Ошибка: Не удалось определить номер для бронирования.');
                return;
            }

            // Проверяем авторизацию пользователя
            if (!checkUserId()) {
                showModal('Для бронирования номера необходимо авторизоваться.', true);
                return;
            }

            try {
                // Отправляем данные бронирования на сервер
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        room_id: roomId,
                        check_in_date: arrivalDate,
                        check_out_date: departureDate,
                        number_of_guests: numGuests,
                        name: name,
                        email: email,
                        phone: phone,
                        comments: comments,
                        user_id: sessionStorage.getItem('userId') // Отправляем user_id с фронтенда
                    }),
                });

                if (response.ok) {
                    showModal('Бронирование успешно создано!');
                    // При успешном бронировании можно перенаправить пользователя на страницу профиля
                    // или просто показать сообщение
                    // window.location.href = '/profil.html';
                } else {
                    // Ошибка на сервере
                    const errorData = await response.json(); // Пытаемся получить детали ошибки
                    console.error('Ошибка при создании бронирования:', response.status, errorData);
                    showModal(`Произошла ошибка при создании бронирования: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                // Ошибка сети или другая клиентская ошибка
                console.error('Ошибка при отправке запроса:', error);
                showModal('Произошла ошибка при отправке запроса.');
            }
        });

        // Логика для отображения названия номера на странице формы бронирования при загрузке
        const roomId = getRoomIdFromUrl();
        if (roomId) {
            fetchRoomDetails(roomId)
                .then(room => {
                    const roomNameElement = document.getElementById('selected-room-name');
                    if (roomNameElement && room) {
                        roomNameElement.textContent = `Выбранный номер: ${room.name}`;
                    }
                })
                .catch(error => {
                    console.error('Ошибка при получении деталей номера для отображения:', error);
                    // Можно показать пользователю сообщение об ошибке
                });
        } else {
             console.warn('ID номера не найден в URL для страницы формы бронирования.');
             // Можно показать пользователю сообщение или перенаправить его
        }

    }
});

// Оставлены функции fetchRooms и displayRooms, если они используются на странице списка номеров
// Если они не используются в других местах, кроме rooms.html, их можно удалить из этого общего файла.
async function fetchRooms() { /* ... ваш существующий код ... */ }
async function displayRooms() { /* ... ваш существующий код ... */ } // Вероятно, используется на rooms.html, а не здесь