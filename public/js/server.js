// server.js
const http = require("http");
const fs = require("fs");
const path = require('path');

// Импортируем api
const usersApi = require('./api/users');
const roomsApi = require('./api/rooms');
const bookingsApi = require('./api/bookings');
const postsApi = require('./api/posts');

async function getReqData(req) {
    return new Promise(async (resolve, reject) => {
        try {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const data = JSON.parse(Buffer.concat(buffers).toString());
            console.log("getReqData возвращает:", data); // Добавлено логирование
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}



http.createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        response.writeHead(200);
        response.end();
        return;
    }

    // Маршрутизация для users
    if (request.url.startsWith("/api/users")) {
        usersApi(request, response, getReqData);
        return;
    }

   if (request.url.startsWith("/api/login")) {
        usersApi(request, response, getReqData);
        return;
    }

    if (request.url.startsWith("/api/rooms")) {
        roomsApi(request, response, getReqData);
        return;
    }

     if (request.url.startsWith("/api/bookings")) {
        bookingsApi(request, response, getReqData);
        return;
    }

    if (request.url.startsWith("/api/posts")) {
        postsApi(request, response, getReqData);
        return;
    }

    // Обслуживание статических файлов (HTML, CSS, JS)
    let filePath = path.join(__dirname, 'public', request.url === '/' ? 'index.html' : request.url);
    if(request.url === '/') filePath = path.join(__dirname, 'public', 'index.html');

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile(path.join(__dirname, 'public', '404.html'), (error404, content404) => {
                     response.writeHead(404, { 'Content-Type': 'text/html' });
                     response.end(content404, 'utf8');
                })
            } else {
                response.writeHead(500);
                response.end('Ошибка сервера');
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf8');
        }
    });

}).listen(3000, () => console.log("Сервер запущен по адресу http://localhost:3000"));
