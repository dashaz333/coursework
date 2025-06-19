function logout() {
    // Уничтожаем сессию (удаляем данные из Local Storage или Session Storage)
    sessionStorage.clear(); // Удаляем все данные из Session Storage
    window.location.href = "login.html";
}