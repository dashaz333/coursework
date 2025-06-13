const db = require('../database');

module.exports = async function (request, response, getReqData) {
    if (request.url === "/api/users" && request.method === "GET") {
        try {
            const [rows, fields] = await db.query("SELECT id, name, surname, patronymic, email, phone FROM users");
            response.end(JSON.stringify(rows));
        } catch (error) {
            console.error("Ошибка при получении пользователей:", error);
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "Ошибка сервера" }));
        }
    }
    // получение одного пользователя по id
    else if (request.url.match(/\/api\/users\/([0-9]+)/) && request.method === "GET") {
        try {
            const id = request.url.split("/")[3];
            const [rows, fields] = await db.query("SELECT id, name, surname, patronymic, email, phone FROM users WHERE id = ?", [id]);

            if (rows.length > 0) {
                response.end(JSON.stringify(rows[0]));
            } else {
                response.writeHead(404, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: "Пользователь не найден" }));
            }
        } catch (error) {
            console.error("Ошибка при получении пользователя:", error);
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "Ошибка сервера" }));
        }
    }
    // удаление пользователя по id
    else if (request.url.match(/\/api\/users\/([0-9]+)/) && request.method === "DELETE") {
        try {
            const id = request.url.split("/")[3];
            const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);

            if (result.affectedRows > 0) {
                response.end(JSON.stringify({ id: id }));
            } else {
                response.writeHead(404, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: "Пользователь не найден" }));
            }
        } catch (error) {
            console.error("Ошибка при удалении пользователя:", error);
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "Ошибка сервера" }));
        }
    }
    // добавление пользователя
    else if (request.url === "/api/users" && request.method === "POST") {
        try {
            const userData = await getReqData(request);
            const { name, surname, patronymic, email, phone, password } = userData;

            // Проверка на существование email
            const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
            if (existingUsers.length > 0) {
                response.writeHead(400, { "Content-Type": "application/json" });
                return response.end(JSON.stringify({ message: "Пользователь с таким email уже зарегистрирован" }));
            }

            const sql = "INSERT INTO users (name, surname, patronymic, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)";
            const values = [name, surname, patronymic, email, phone, password];

            const [result] = await db.query(sql, values);

            const newUser = { id: result.insertId, name: name, surname: surname, patronymic: patronymic, email: email, phone: phone, password: password };
            response.end(JSON.stringify(newUser));
        } catch (error) {
            console.error("Ошибка при добавлении пользователя:", error);
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "Некорректный запрос", error: error.message }));
        }
    }
    // изменение пользователя
    else if (request.url === "/api/users" && request.method === "PUT") {
        try {
            const userData = await getReqData(request);
            const { id, name, surname, patronymic, email, phone, password } = userData; // Получаем password

            // Если пароль передается, обновляем его. Если нет, оставляем старый.
            let sql = "UPDATE users SET name = ?, surname = ?, patronymic = ?, email = ?, phone = ?";
            let values = [name, surname, patronymic, email, phone];

            if (password) {
                sql += ", password = ?";
                values.push(password);
            }

            sql += " WHERE id = ?";
            values.push(id);

            const [result] = await db.query(sql, values);

            if (result.affectedRows > 0) {
                const updatedUser = { id: id, name: name, surname: surname, patronymic: patronymic, email: email, phone: phone, password: password };
                response.end(JSON.stringify(updatedUser));
            } else {
                response.writeHead(404, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: "Пользователь не найден" }));
            }
        } catch (error) {
            console.error("Ошибка при обновлении пользователя:", error);
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "Некорректный запрос" }));
        }
    }
    else {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Ресурс не найден" }));
    }
};
