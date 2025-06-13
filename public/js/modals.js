document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы модального окна
    var modal = document.getElementById('registrationModal');
    var closeButton = modal.querySelector('.close-button');
    var goToLoginButton = document.getElementById('goToLogin'); // Кнопка "Авторизоваться" в модалке
    var goToRegistrationButton = document.getElementById('goToRegistration'); // Кнопка "Зарегистрироваться" в модалке

    var profileLink = document.getElementById('profile-link'); // Ссылка на Профиль

    // Функция для проверки наличия идентификатора пользователя (ВАША РЕАЛИЗАЦИЯ)
    function checkUserId() {
        // Здесь ваша логика проверки ID пользователя.
        // Пример:
        const userId = sessionStorage.getItem('userId');
        return userId !== null && userId !== '';
        // ЗАМЕНИТЕ ЭТУ ЧАСТЬ ВАШЕЙ РЕАЛЬНОЙ ЛОГИКОЙ ПРОВЕРКИ!!!
        // return false; // Пример: всегда показывать модалку для тестирования
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

    // Добавляем обработчик события клика на ссылку "Профиль"
    if (profileLink) {
        profileLink.addEventListener('click', function(event) {
            if (!checkUserId()) {
                event.preventDefault(); // Отменяем стандартное действие ссылки
                showRegistrationModal(); // Открываем модальное окно
            }
            // Если пользователь зарегистрирован, стандартное действие ссылки не отменяется,
            // и произойдет переход на profil.html
        });
    }

    // Добавляем обработчики для кнопок модального окна
    if (modal) {
        if (closeButton) {
            closeButton.addEventListener('click', hideRegistrationModal);
        }

        if (goToLoginButton) {
            goToLoginButton.addEventListener('click', function() {
                window.location.href = 'login.html'; // Переход на страницу авторизации
            });
        }

        if (goToRegistrationButton) {
            goToRegistrationButton.addEventListener('click', function() {
                window.location.href = 'register.html'; // Переход на страницу регистрации
            });
        }

        // Закрытие модального окна при клике вне его содержимого
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                hideRegistrationModal();
            }
        });
    }
});