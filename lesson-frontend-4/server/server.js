// Серверный API для Vite. Работает как плагин: перехватывает
// запросы к /api/* и отдаёт JSON. Всё остальное пропускает
// дальше — чтобы Vite отдавал статику.
//
// Когда появится настоящий backend на Python — этот файл исчезнет,
// а клиент продолжит обращаться к тем же URL (/api/...).
// Единственное, что изменится — порт и адрес.

import fs from "node:fs";
import path from "node:path";
import { database } from "./database.js";

// Путь к файлу, куда пишем записи.
const BOOKINGS_FILE = path.resolve("server/bookings.txt");

// Небольшая задержка, имитирует сеть. Чтобы на клиенте было
// видно состояние «Загрузка…».
const DELAY_MS = 500;

// Промис-обёртка для setTimeout — чтобы использовать await.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Отправка JSON-ответа с нужным статусом и CORS-заголовками.
function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(data));
}

// Чтение тела POST-запроса. Приходит стримом — собираем по кускам.
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

export default function apiMiddleware() {
  return {
    name: "api-middleware",
    configureServer(server) {
      console.log("API middleware загружен");

      server.middlewares.use(async (req, res, next) => {
        // Не /api/* — пропускаем дальше, пусть Vite обрабатывает.
        if (!req.url.startsWith("/api/")) {
          return next();
        }

        // CORS-preflight (OPTIONS). Браузер сначала спрашивает
        // разрешение, и только потом шлёт настоящий запрос.
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          res.end();
          return;
        }

        // GET /api/categories — список категорий с количеством услуг.
        if (req.method === "GET" && req.url === "/api/categories") {
          await delay(DELAY_MS);
          const categories = database.categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            servicesCount: cat.services.length,
          }));
          return sendJson(res, 200, categories);
        }

        // GET /api/categories/:id/services — услуги одной категории.
        const servicesMatch = req.url.match(
          /^\/api\/categories\/(\d+)\/services$/
        );
        if (req.method === "GET" && servicesMatch) {
          await delay(DELAY_MS);
          const categoryId = parseInt(servicesMatch[1]);
          const category = database.categories.find((c) => c.id === categoryId);
          if (!category) {
            return sendJson(res, 404, { error: "Категория не найдена" });
          }
          return sendJson(res, 200, category.services);
        }

        // GET /api/masters — список мастеров для главной.
        if (req.method === "GET" && req.url === "/api/masters") {
          await delay(DELAY_MS);
          return sendJson(res, 200, database.masters);
        }

        // GET /api/popular-services — популярные услуги для главной.
        if (req.method === "GET" && req.url === "/api/popular-services") {
          await delay(DELAY_MS);
          return sendJson(res, 200, database.popularServices);
        }

        // GET /api/booking/today — «сегодня» по мнению сервера.
        if (req.method === "GET" && req.url === "/api/booking/today") {
          await delay(DELAY_MS);
          return sendJson(res, 200, database.today);
        }

        // GET /api/categories/:id/slots?day=17&month=9&year=2026
        // Слоты для конкретной категории и даты.
        // Сервер сам решает, какие отдать (чёт/нечет), клиент этого не видит.
        // В ответе возвращаем полную дату — чтобы клиент знал, к какому
        // дню относятся слоты.
        const slotsMatch = req.url.match(/^\/api\/categories\/(\d+)\/slots/);
        if (req.method === "GET" && slotsMatch) {
          await delay(DELAY_MS);
          const url = new URL(req.url, "http://localhost");
          const categoryId = parseInt(slotsMatch[1]);
          const day = parseInt(url.searchParams.get("day"));
          const month = parseInt(url.searchParams.get("month"));
          const year = parseInt(url.searchParams.get("year"));

          // Проверяем, что дата пришла полностью. Если нет — 400.
          if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return sendJson(res, 400, {
              error: "Нужны параметры day, month, year",
            });
          }

          // Проверяем, что категория существует. Слоты для несуществующей
          // категории отдавать не должны.
          const category = database.categories.find((c) => c.id === categoryId);
          if (!category) {
            return sendJson(res, 404, { error: "Категория не найдена" });
          }

          const isEven = day % 2 === 0;
          const slots = isEven ? database.slotsEvenDay : database.slotsOddDay;

          return sendJson(res, 200, {
            date: { day, month, year },
            slots,
          });
        }

        // POST /api/booking — сохранить запись.
        // Пишем в файл одну строку. Никакой валидации, никакой БД —
        // просто чтобы показать студентам, что данные ушли на сервер
        // и их можно потом прочитать.
        if (req.method === "POST" && req.url === "/api/booking") {
          try {
            const raw = await readBody(req);
            const booking = JSON.parse(raw);
            const line = JSON.stringify(booking) + "\n";
            fs.appendFileSync(BOOKINGS_FILE, line, "utf-8");
            console.log("Запись сохранена:", booking);
            return sendJson(res, 200, { ok: true });
          } catch (err) {
            return sendJson(res, 400, { error: "Некорректные данные" });
          }
        }

        // Всё остальное — 404.
        return sendJson(res, 404, { error: `Не найдено: ${req.url}` });
      });
    },
  };
}
