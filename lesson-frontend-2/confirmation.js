// ============================================================
// 1. ДАННЫЕ, КОТОРЫЕ ПРИХОДЯТ С СЕРВЕРА
// ============================================================
// На этой странице отдельных данных с сервера нет —
// всё берётся из localStorage (то, что выбрал пользователь).

// ============================================================
// 2. СОСТОЯНИЕ ДЛЯ СТРАНИЦЫ
// ============================================================
// На этой странице отдельного состояния нет.
// Форма — обычный HTML, значения полей берутся напрямую из input'ов.

// ============================================================
// 3. ЛОГИКА ДЛЯ ИМИТАЦИИ РАБОТЫ С СЕРВЕРОМ
// ============================================================

/**
 * Загружает сохранённую бронь из localStorage.
 * Возвращает объект { service, date, time } или null.
 */
function loadBooking() {
  const raw = localStorage.getItem("elair-booking");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// ============================================================
// 4. ЧИСТЫЕ ФУНКЦИИ
// ============================================================

/**
 * Названия месяцев в родительном падеже.
 */
const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

/**
 * Форматирует цену: 3200 → "3 200 ₽".
 */
function formatPrice(price) {
  return price.toLocaleString("ru-RU") + " ₽";
}

/**
 * Форматирует дату: "17 октября 2026 в 12:00".
 */
function formatDateTime(date, time) {
  const monthName = MONTHS_GENITIVE[date.month];
  return date.day + " " + monthName + " " + date.year + " в " + time;
}

/**
 * Форматирует дату для модалки: "17 октября 2026, 12:00".
 */
function formatDateTimeShort(date, time) {
  const monthName = MONTHS_GENITIVE[date.month];
  return date.day + " " + monthName + " " + date.year + ", " + time;
}

// ============================================================
// 5. ОТРИСОВКА И ОБРАБОТЧИКИ
// ============================================================

/**
 * Заполняет блок «Детали вашего визита».
 */
function renderBookingDetails(booking) {
  const rows = document.querySelectorAll(".booking-info .detail-row");
  rows[0].querySelector(".value").textContent = booking.service.title;
  rows[1].querySelector(".value").textContent = formatDateTime(
    booking.date,
    booking.time
  );
  rows[3].querySelector(".value").textContent =
    booking.service.duration + " мин";

  document.querySelector(".booking-info .total-row .price").textContent =
    formatPrice(booking.service.price);
}

/**
 * Заполняет модалку данными.
 */
function renderModalDetails(booking) {
  const rows = document.querySelectorAll(".confirmation-modal .details .row");
  rows[0].querySelector(".value").textContent = booking.service.title;
  rows[1].querySelector(".value").textContent = formatDateTimeShort(
    booking.date,
    booking.time
  );
  rows[3].querySelector(".value").textContent =
    booking.service.duration + " мин";

  document.querySelector(".confirmation-modal .total-price").textContent =
    formatPrice(booking.service.price);
}

/**
 * Открывает модалку.
 */
function openConfirmationModal() {
  const modal = document.getElementById("confirmationModal");
  if (modal) modal.showModal();
}

/**
 * Закрывает модалку и переходит на главную.
 */
function closeModalAndGoHome() {
  const modal = document.getElementById("confirmationModal");
  if (modal) modal.close();
  localStorage.removeItem("elair-booking");
  window.location.href = "index.html";
}

/**
 * Обработчик отправки формы — открывает модалку.
 */
function setupContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    openConfirmationModal();
  });
}

/**
 * Обработчик кнопки в модалке.
 */
function setupModalButton() {
  const btn = document.querySelector(".modal-next-btn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    closeModalAndGoHome();
  });
}

/**
 * Обработчик кнопки «Назад» — переход на страницу календаря.
 */
function setupBackButton() {
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "booking.html";
    });
  }
}

/**
 * Обработчик клика по логотипу — переход на главную.
 */
function setupLogoClick() {
  const logo = document.querySelector(".logo-text");
  if (logo) {
    logo.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }
}

/**
 * Если данных нет — отправляет пользователя на первую страницу.
 */
function redirectIfNoBooking() {
  const booking = loadBooking();
  if (!booking || !booking.service || !booking.date || !booking.time) {
    window.location.href = "services.html";
    return null;
  }
  return booking;
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

function init() {
  const booking = redirectIfNoBooking();
  if (!booking) return;

  renderBookingDetails(booking);
  renderModalDetails(booking);
  setupContactForm();
  setupModalButton();
  setupBackButton();
  setupLogoClick();
}

document.addEventListener("DOMContentLoaded", function () {
  init();
});
