// js/rooms.js

// Функция для получения списка номеров с сервера
async function fetchRooms() {
    try {
        const response = await fetch('/api/rooms'); // endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rooms = await response.json();
        return rooms;
    } catch (error) {
        console.error('Ошибка при получении списка номеров:', error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
}

// Функция для проверки наличия идентификатора пользователя в sessionStorage
function checkUserId() {
    const userId = sessionStorage.getItem('user_id'); // Используем 'user_id' как в prof.js и bookings.js
    return userId !== null && userId !== '';
}

// Функция для отображения модального окна (скопирована из bookings.js для единообразия)
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

// Функция для отображения списка номеров на странице
async function displayRooms() {
    const rooms = await fetchRooms();
    const roomsContainer = document.getElementById('rooms'); // Контейнер для номеров

    if (!roomsContainer) {
        console.error('Элемент с id "rooms" не найден');
        return;
    }

    // Очищаем контейнер перед добавлением новых данных
    roomsContainer.innerHTML = '';

    // Создаем HTML для каждого номера и добавляем в контейнер
    rooms.forEach(room => {
        const roomElement = document.createElement('div');
        roomElement.classList.add('room'); // Можно добавить класс для стилизации
        let imageHTML = '';
        if (room.image_url) {
            imageHTML = `<img src="${room.image_url}" alt="Фото ${room.name}">`;
        }

        roomElement.innerHTML = `
            <h3>${room.name}</h3>
            ${imageHTML} <!-- Добавляем изображение -->
            <p>Описание: ${room.description}</p>
            <p>Цена: ${room.price}</p>
            <button class="book-button" type="button" data-room-id="${room.id}">Забронировать</button>
        `;

        roomsContainer.appendChild(roomElement);

        // Добавляем обработчик события для кнопки "Забронировать"
        const bookButton = roomElement.querySelector('.book-button');
        bookButton.addEventListener('click', function () {
            if (checkUserId()) {
                // Пользователь авторизован, перенаправляем на страницу бронирования
                const roomId = this.dataset.roomId;
                window.location.href = `bookings.html?id=${roomId}`;
            } else {
                // Пользователь не авторизован, показываем модальное окно
                showModal('Для бронирования номера необходимо авторизоваться.', true);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', displayRooms);

// Оставлены функции showRegistrationModal и hideRegistrationModal, если они используются