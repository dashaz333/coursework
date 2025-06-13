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
     console.warn('displayBookings: Элемент с id "bookings" не найден.');
    return;
}
console.log('displayBookings: Контейнер #bookings найден.');
const user_id = sessionStorage.getItem('user_id');
console.log('displayBookings: Получен user_id из sessionStorage:', user_id); // ПРОВЕРЬТЕ ЗДЕСЬ ЗНАЧЕНИЕ!
if (!user_id) {
    bookingsContainer.innerHTML = '<p>Пожалуйста, войдите в систему...</p>';
    console.log('displayBookings: user_id отсутствует, показываем сообщение.');
    return;
}
try {
    console.log('displayBookings: Запрос к API для получения всех бронирований...');
    const allBookings = await fetchBookings();
    if (!Array.isArray(allBookings)) {
        console.error('displayBookings: API /api/bookings вернул не массив:', allBookings);
        bookingsContainer.innerHTML = '<p>Ошибка при загрузке бронирований: неверный формат данных с сервера.</p>';
        return;
    }
    const userBookings = allBookings.filter(booking => String(booking.user_id) === String(user_id));
    console.log('displayBookings: Отфильтрованные бронирования пользователя:', userBookings); // ПРОВЕРЬТЕ СОДЕРЖИМОЕ!
    bookingsContainer.innerHTML = ''; // Очищаем предыдущие бронирования
    if (userBookings.length === 0) {
        bookingsContainer.innerHTML = '<p>У вас пока нет бронирований.</p>';
        console.log('displayBookings: У пользователя нет бронирований после фильтрации.');
    } else {
        console.log('displayBookings: Получение деталей номеров для', userBookings.length, 'бронирований...');
        // Используем map для создания промисов и Promise.allSettled для их выполнения
        const results = await Promise.allSettled(userBookings.map(async booking => {
             if (!booking.room_id) {
                 console.warn('displayBookings: В бронировании отсутствует room_id или он некорректен:', booking);
                 // Возвращаем объект с данными бронирования и плейсхолдером для имени номера
                 return {
                    status: 'fulfilled', // Считаем это "выполненным" в контексте получения бронирования
                    value: { ...booking, roomName: 'Номер без ID' }
                 };
             }
             try {
                  const room = await fetchRoomDetails(booking.room_id);
                  // Возвращаем объект с данными бронирования и именем номера
                  return {
                    status: 'fulfilled', // Успешно получили и бронирование, и детали номера
                    value: { ...booking, roomName: room.name || 'Неизвестный номер' }
                  };
             } catch (error) {
                  console.error(`displayBookings: Ошибка при получении деталей номера ${booking.room_id}:`, error);
                  // Возвращаем объект с данными бронирования и плейсхолдером, помечая ошибку деталей номера
                   return {
                    status: 'fulfilled', // Считаем это "выполненным", но с ошибкой деталей номера
                    value: { ...booking, roomName: 'Не удалось загрузить имя номера', fetchRoomDetailsError: true }
                   };
             }
         }));
        console.log('displayBookings: Результаты Promise.allSettled:', results); // ПОСМОТРИТЕ НА ЭТОТ ЛОГ!
        // Преобразуем результаты Promise.allSettled в массив объектов, готовых к отображению
        const allUserBookingsToDisplay = results
            .filter(result => result.status === 'fulfilled') // Берем только успешно "выполненные" (т.е. для которых у нас есть объект бронирования)
            .map(result => result.value) // Извлекаем наше созданное "value" (объект бронирования + roomName)
            .filter(booking => booking !== null && booking !== undefined); // Удаляем потенциальные null/undefined, если они могли появиться
        console.log('displayBookings: Финальный массив для отображения (после обработки результатов):', allUserBookingsToDisplay); // ПОСМОТРИТЕ СЮДА ПЕРЕД ОТОБРАЖЕНИЕМ!
        // Сортируем объединенный массив по дате заезда (check_in_date)
        allUserBookingsToDisplay.sort((a, b) => {
            // Используем new Date() напрямую для ISO 8601 формата
            // Добавляем проверку на наличие и корректность дат перед созданием Date объекта
            const dateA = a && a.check_in_date ? new Date(a.check_in_date) : new Date(0); // Default to epoch if date is missing
            const dateB = b && b.check_in_date ? new Date(b.check_in_date) : new Date(0); // Default to epoch if date is missing
            // Если одна из дат некорректна (NaN), new Date() вернет "Invalid Date", getTime() вернет NaN
            // Сортировка NaN даст непредсказуемый результат.
            // Проверяем, чтобы избежать сравнения NaN
            const timeA = dateA.getTime();
            const timeB = dateB.getTime();
            if (isNaN(timeA) || isNaN(timeB)) {
                console.warn('displayBookings: Некорректная дата при сортировке.', a?.check_in_date, b?.check_in_date);
                 // Можно выбрать стратегию сортировки некорректных дат (например, в конец)
                 if (isNaN(timeA) && isNaN(timeB)) return 0;
                 if (isNaN(timeA)) return 1; // a некорректна, b корректна
                 if (isNaN(timeB)) return -1; // a корректна, b некорректна
            }
            return timeA - timeB; // Сравниваем getTime() для надежности
        });
        // Отображаем бронирования
        if (allUserBookingsToDisplay.length > 0) {
             console.log('displayBookings: Отображение', allUserBookingsToDisplay.length, 'бронирований.');
             allUserBookingsToDisplay.forEach(booking => { // Теперь 'booking' здесь - это объект с нужными полями!
                const bookingElement = document.createElement('div');
                bookingElement.classList.add('booking-item');
                // Используем new Date() напрямую для ISO 8601 формата для отображения
                // Проверяем наличие поля перед созданием Date объекта для отображения
                const arrivalDateObj = booking && booking.check_in_date ? new Date(booking.check_in_date) : null;
                const departureDateObj = booking && booking.check_out_date ? new Date(booking.check_out_date) : null;
                const bookingDateObj = booking && booking.booking_date ? new Date(booking.booking_date) : null;
                // Форматируем даты, если они корректны
                const arrivalDate = arrivalDateObj && !isNaN(arrivalDateObj.getTime()) ? arrivalDateObj.toLocaleDateString() : 'Не указана';
                const departureDate = departureDateObj && !isNaN(departureDateObj.getTime()) ? departureDateObj.toLocaleDateString() : 'Не указана';
                const bookingDateFormatted = bookingDateObj && !isNaN(bookingDateObj.getTime()) ? bookingDateObj.toLocaleString() : 'Не указана';
                // Отображаем поля, используя их имена из структуры объекта
                // Добавляем проверки на undefined/null для надежности при отображении
                bookingElement.innerHTML = `
                    <h4>Бронирование номера "${booking.roomName || 'Неизвестный номер'}"</h4> <!-- Используем roomName -->
                    <p>ID бронирования: ${booking.id !== undefined && booking.id !== null ? booking.id : 'Не указан'}</p> <!-- Используем booking.id -->
                    <p>Даты проживания: с ${arrivalDate} по ${departureDate}</p> <!-- Используем отформатированные даты -->
                    <p>Количество гостей: ${booking.number_of_guests !== undefined && booking.number_of_guests !== null ? booking.number_of_guests : 'Не указано'}</p> <!-- Используем booking.number_of_guests -->
                    ${booking.comments ? `<p>Пожелания: ${booking.comments}</p>` : ''} <!-- Используем booking.comments, если есть -->
                    <p>Статус: ${booking.status || 'Не указан'}</p> <!-- Используем booking.status -->
                    <p>Дата бронирования: ${bookingDateFormatted}</p> <!-- Отображаем дату бронирования -->
                    <p>Общая цена: ${booking.total_price !== undefined && booking.total_price !== null ? booking.total_price : 'Не указана'}</p> <!-- Отображаем общую цену -->
                `;
                bookingsContainer.appendChild(bookingElement);
            });
        } else {
             console.log('displayBookings: После обработки деталей номеров не осталось бронирований для отображения.');
             // Это сообщение может появиться, если filter(result => result.status === 'fulfilled') отфильтровал все бронирования
             // Или если исходный userBookings был пуст (этот случай уже покрыт выше)
             bookingsContainer.innerHTML = '<p>Не удалось загрузить данные ваших бронирований или у вас нет бронирований с действительными номерами.</p>';
        }
    }
} catch (error) {
    console.error('displayBookings: Критическая ошибка при отображении бронирований:', error);
     bookingsContainer.innerHTML = '<p>Произошла ошибка при загрузке ваших бронирований.</p>';
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