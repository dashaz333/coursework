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

// Функция для проверки наличия идентификатора пользователя
function checkUserId() {
    // Здесь может быть ваше условие проверки ID пользователя
    // Например, получение ID из sessionStorage или cookie
    const userId = sessionStorage.getItem('userId'); // Пример получения ID
    return userId !== null && userId !== ''; // Проверка на наличие ID
}

// Функция для отображения модального окна
function showRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.style.display = 'block';
    }
}
// Функция для скрытия модального окна
function hideRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.style.display = 'none';
    }
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
            const roomId = this.dataset.roomId; 
            window.location.href = `bookings.html?id=${roomId}`; 
        });
    });
}

document.addEventListener('DOMContentLoaded', displayRooms);


