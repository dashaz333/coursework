const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware для обработки JSON
router.use(express.json());

<<<<<<< HEAD
// GET all posts
=======
/**
 * @route GET /api/posts
 * @description Получение списка всех постов.
 * @access Public
 * @returns {Array<Object>} Массив объектов постов с полями id, title, content, author_id, image_url.
 * @returns {Object} 500 - Ошибка сервера.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, title, content, author_id, image_url FROM posts");
        console.log("Данные, полученные из базы данных:", rows); // Отладочный лог
        res.json(rows);
    } catch (error) {
        console.error("Ошибка при получении постов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

<<<<<<< HEAD
// GET a single post by ID
=======
/**
 * @route GET /api/posts/:id
 * @description Получение одного поста по ID.
 * @access Public
 * @param {string} id - Уникальный идентификатор поста.
 * @returns {Object} Объект поста с полями id, title, max (полное содержание), content (краткое содержание), author_id, image_url.
 * @returns {Object} 404 - Пост не найден.
 * @returns {Object} 500 - Ошибка сервера.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT id, title, max, content, author_id, image_url FROM posts WHERE id = ?", [id]);

        if (rows.length > 0) {
            console.log("Данные из API:", rows[0]); // Проверка данных
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Пост не найден" });
        }
    } catch (error) {
        console.error("Ошибка при получении поста:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

<<<<<<< HEAD


// POST (create) a new post
router.post('/', async (req, res) => {
    try {
        const { title, content, author_id, image_url } = req.body;
        const [result] = await db.query("INSERT INTO posts (title, content, author_id, image_url) VALUES (?, ?, ?, ?)", [title, content, author_id, image_url]);
        const newPost = { id: result.insertId, title, content, author_id, image_url };
        res.status(201).json(newPost); // Используйте 201 Created для успешного создания
=======
/**
 * @route POST /api/posts
 * @description Создание нового поста.
 * @access Public
 * @param {Object} req.body - Данные нового поста.
 * @param {string} req.body.title - Заголовок поста.
 * @param {string} req.body.content - Краткое содержание поста.
 * @param {number} req.body.author_id - Идентификатор автора поста.
 * @param {string} [req.body.image_url] - URL-адрес изображения поста (опционально).
 * @returns {Object} 201 - Объект созданного поста с его id.
 * @returns {Object} 400 - Некорректный запрос.
 */
router.post('/', async (req, res) => {
    try {
        const { title, content, author_id, image_url } = req.body; // Получаем данные из тела запроса

        // Выполняем SQL-запрос для добавления нового поста.
        const [result] = await db.query("INSERT INTO posts (title, content, author_id, image_url) VALUES (?, ?, ?, ?)", [title, content, author_id, image_url]);

        const newPost = { id: result.insertId, title, content, author_id, image_url }; // Формируем объект нового поста
        res.status(201).json(newPost); // Отправляем данные созданного поста с кодом 201 (Created)
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
    } catch (error) {
        console.error("Ошибка при добавлении поста:", error);
        res.status(400).json({ message: "Некорректный запрос", error: error.message });
    }
});

<<<<<<< HEAD
// PUT (update) an existing post
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, content_max, author_id, image_url } = req.body; // Обновлено для получения content_max

        // Измененный SQL запрос для обновления обоих полей
=======
/**
 * @route PUT /api/posts/:id
 * @description Обновление существующего поста.
 * @access Public
 * @param {string} id - Уникальный идентификатор поста для обновления.
 * @param {Object} req.body - Обновленные данные поста.
 * @param {string} [req.body.title] - Новый заголовок поста (опционально).
 * @param {string} [req.body.content] - Новое краткое содержание поста (опционально).
 * @param {string} [req.body.content_max] - Новое полное содержание поста (опционально).
 * @param {number} [req.body.author_id] - Новый идентификатор автора поста (опционально).
 * @param {string} [req.body.image_url] - Новый URL-адрес изображения поста (опционально).
 * @returns {Object} Объект с обновленными данными поста.
 * @returns {Object} 404 - Пост не найден.
 * @returns {Object} 400 - Некорректный запрос.
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        const { title, content, content_max, author_id, image_url } = req.body; // Получаем обновленные данные из тела запроса, включая content_max

        // Выполняем SQL-запрос для обновления данных поста.
        // Обновляем как 'content' (краткое содержание), так и 'max' (полное содержание).
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
        const [result] = await db.query(
            "UPDATE posts SET title = ?, content = ?, content_max = ?, author_id = ?, image_url = ? WHERE id = ?",
            [title, content, content_max, author_id, image_url, id]
        );

        if (result.affectedRows > 0) {
            const updatedPost = { id: parseInt(id), title, content, content_max, author_id, image_url };
            res.json(updatedPost);
        } else {
            res.status(404).json({ message: "Пост не найден" });
        }
    } catch (error) {
        console.error("Ошибка при обновлении поста:", error);
        res.status(400).json({ message: "Некорректный запрос", error: error.message });
    }
});

<<<<<<< HEAD

// DELETE a post by ID
=======
/**
 * @route DELETE /api/posts/:id
 * @description Удаление поста по ID.
 * @access Public
 * @param {string} id - Уникальный идентификатор поста для удаления.
 * @returns {Object} Сообщение об успешном удалении.
 * @returns {Object} 404 - Пост не найден.
 * @returns {Object} 500 - Ошибка сервера.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM posts WHERE id = ?", [id]);

        if (result.affectedRows > 0) {
            res.json({ message: `Пост с ID ${id} успешно удален` });
        } else {
            res.status(404).json({ message: "Пост не найден" });
        }
    } catch (error) {
        console.error("Ошибка при удалении поста:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
