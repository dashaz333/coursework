function logout() {
    // Уничтожаем сессию (удаляем данные из Local Storage или Session Storage)
    sessionStorage.clear(); // Удаляем все данные из Session Storage
    // или
    // localStorage.clear(); // Удаляем все данные из Local Storage
    // Перенаправление на страницу авторизации или главную страницу
    window.location.href = "login.html";
}