// js/posts.js
async function fetchPosts() {
    try {
        const response = await fetch('/api/posts'); // endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();
        return posts;
    } catch (error) {
        console.error('Ошибка при получении списка постов:', error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
}

async function displayPosts() {
    const posts = await fetchPosts(); // Предположим, что fetchPosts возвращает массив объектов постов
    const postsContainer = document.getElementById('posts'); // Контейнер для отображения постов

    if (!postsContainer) {
        console.error('Элемент с id "posts" не найден');
        return;
    }

    // Очистка контейнера перед обновлением
    postsContainer.innerHTML = '';

    // Создание элементов для каждого поста
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post'); // Класс для стилизации

        let imageHTML = ''; // Строка для хранения разметки изображения
        if (post.image_url) { // Проверяем наличие изображения
            imageHTML = `<img src="${post.image_url}" alt="Изображение к посту ${post.title}">`;
        }

        // Собираем HTML для поста
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            ${imageHTML}  
            <p>${post.content}</p>
            <button class="button_1" type="button" data-post-id="${post.id}">Подробнее</button>
        `;

        // Добавляем элемент в контейнер
        postsContainer.appendChild(postElement);

        // Получаем кнопку "Подробнее" и назначаем ей обработчик события
        const detailsButton = postElement.querySelector('.button_1');
        detailsButton.addEventListener('click', function () {
            const postId = this.dataset.postId; // Используем dataset для получения атрибута data-post-id
            window.location.href = `chit.html?id=${postId}`;
        });
    });
}

document.addEventListener('DOMContentLoaded', displayPosts);

