// Функция для получения значения параметра из URL
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[$$]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Получаем ID поста из URL
const postId = getParameterByName('id');

document.addEventListener('DOMContentLoaded', function () {

    // --- Логика для отображения поста (ваш существующий код) ---
    if (postId) {
        fetchPost(postId)
            .then(post => {
                if (post) {
                    displayPost(post);
                } else {
                    console.log('Пост не найден');
                    displayErrorMessage('Пост не найден');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении поста:', error);
                displayErrorMessage('Ошибка при получении поста');
            });
    } else {
        console.log('ID поста не найден в URL');
        displayErrorMessage('ID поста не найден в URL');
    }

    // Функция для получения данных поста из API
    async function fetchPost(postId) {
        try {
            const response = await fetch(`/api/posts/${postId}`);
            if (!response.ok) {
                throw new Error('Ошибка при получении поста');
            }
            return await response.json();
        } catch (error) {
            console.error("Ошибка в fetchPost:", error);
            throw error;
        }
    }

    // Функция для отображения данных поста на странице
    function displayPost(post) {
        const postsContainer = document.getElementById('posts');
        if (!postsContainer) {
            console.error('Элемент с id "posts" не найден');
            return;
        }
        let imageHTML = '';
        if (post.image_url) {
            imageHTML = `<img src="${post.image_url}" alt="Изображение к посту ${post.title}">`;
        }
        postsContainer.innerHTML = `
            <h3>${post.title}</h3>
            ${imageHTML}
            <p>${post.max}</p>
        `;
    }

    // Функция для отображения сообщения об ошибке на странице
    function displayErrorMessage(message) {
        const postsContainer = document.getElementById('posts');
        if (!postsContainer) {
            console.error('Элемент с id "posts" не найден');
            return;
        }
        postsContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Код для кнопки "Назад" ---
    const backButton = document.querySelector('.button_1'); // Находим кнопку по классу

    if (backButton && backButton.textContent.trim() === 'Назад') { // Проверяем, что кнопка найдена и текст соответствует
        backButton.addEventListener('click', function() {
            window.location.href = 'posts.html'; // Перенаправляем пользователя
        });
    }
});