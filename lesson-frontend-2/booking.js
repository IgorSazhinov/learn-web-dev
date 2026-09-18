// ============================================================
// 1. ДАННЫЕ, КОТОРЫЕ ПРИХОДЯТ С СЕРВЕРА
// ============================================================
// TODO: Позже эти данные будут загружаться через запрос к серверу.

/**
 * Стартовый ответ сервера при открытии страницы.
 * today — текущая дата по мнению сервера (раньше нельзя выбирать).
 * slots — слоты на today.
 */
const SERVER_DATA = {
  today: { day: 17, month: 9, year: 2026 },
  slots: [
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: false },
    { time: "11:30", available: true },
    { time: "12:00", available: true },
    { time: "13:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: false },
    { time: "17:30", available: true },
    { time: "18:00", available: true },
    { time: "19:30", available: true },
  ],
};

/**
 * Слоты для чётных дней. Нужно только для имитации того, что данные с сервера приходят разные.
 * TODO: Позже будут приходить с сервера.
 */
const SLOTS_EVEN_DAY = [
  { time: "10:00", available: true },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "11:30", available: true },
  { time: "12:00", available: false },
  { time: "13:00", available: false },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:30", available: true },
  { time: "18:00", available: true },
  { time: "19:30", available: true },
];

/**
 * Слоты для нечётных дней. Нужно только для имитации того, что данные с сервера приходят разные.
 * TODO: Позже будут приходить с сервера.
 */
const SLOTS_ODD_DAY = [
  { time: "10:00", available: true },
  { time: "10:30", available: true },
  { time: "11:00", available: false },
  { time: "11:30", available: true },
  { time: "12:00", available: true },
  { time: "13:00", available: true },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: false },
  { time: "17:30", available: true },
  { time: "18:00", available: true },
  { time: "19:30", available: true },
];

// ============================================================
// 2. СОСТОЯНИЕ ДЛЯ СТРАНИЦЫ
// ============================================================
// То, что выбирает и листает пользователь. С сервера не приходит.

const BOOKING_STATE = {
  currentMonth: 9, // 0 = январь, 9 = октябрь
  currentYear: 2026,
  selectedDay: 17,
  selectedTime: null,
};

// ============================================================
// 3. ЛОГИКА ДЛЯ ИМИТАЦИИ РАБОТЫ С СЕРВЕРОМ
// ============================================================

/**
 * Имитация запроса к серверу — получение слотов на конкретный день.
 * Сейчас: чётный день → SLOTS_EVEN_DAY, нечётный → SLOTS_ODD_DAY.
 * Потом: заменится на запрос к серверу.
 *
 * @returns {{ day, month, year, slots }}
 */
function getSlotsForDay(day, month, year) {
  const isEven = day % 2 === 0;
  const slots = isEven ? SLOTS_EVEN_DAY : SLOTS_ODD_DAY;

  return {
    day: day,
    month: month,
    year: year,
    slots: slots,
  };
}

/**
 * Сохраняет выбранную дату и время в localStorage.
 */
function saveSelectedDate(date, time) {
  const raw = localStorage.getItem("elair-booking");
  let booking = {};
  if (raw) {
    try {
      booking = JSON.parse(raw);
    } catch (e) {
      booking = {};
    }
  }
  booking.date = date;
  booking.time = time;
  localStorage.setItem("elair-booking", JSON.stringify(booking));
}

// ============================================================
// 4. ЧИСТЫЕ ФУНКЦИИ
// ============================================================
// Не зависят от DOM и от проекта. Можно копировать в любой проект.

/**
 * Названия месяцев в именительном падеже (заголовок календаря).
 */
const MONTHS_NOMINATIVE = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

/**
 * Названия месяцев в родительном падеже (нижняя панель).
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
 * Названия дней недели (нижняя панель).
 */
const DAYS_OF_WEEK = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

/**
 * Сравнивает две даты без времени.
 * Возвращает -1, 0 или 1.
 * Функция нужна, чтобы запретить выбирать прошедшие дни.
 */
function compareDates(date1, date2) {
  const d1 = new Date(date1.year, date1.month, date1.day);
  const d2 = new Date(date2.year, date2.month, date2.day);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * Проверяет, доступна ли дата для выбора.
 * Раньше today выбирать нельзя.
 */
function isDateSelectable(day, month, year) {
  const today = SERVER_DATA.today;
  return compareDates({ day: day, month: month, year: year }, today) >= 0;
}

/**
 * Готовит сетку календаря для указанного месяца.
 * Возвращает массив недель, каждая неделя — массив из 7 ячеек.
 * Ячейка: { day, otherMonth }.
 *
 * Функция чистая — можно копировать в любой проект.
 */
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  // Дни предыдущего месяца
  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLastDay - i, otherMonth: true });
  }

  // Дни текущего месяца
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false });
  }

  // Дни следующего месяца
  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay, otherMonth: true });
    nextDay++;
  }

  // Разбиваем на недели
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

// ============================================================
// 5. ОТРИСОВКА И ОБРАБОТЧИКИ
// ============================================================

/**
 * Отрисовывает календарь на текущий месяц.
 */
function renderCalendar() {
  const monthYearEl = document.querySelector(".month-year");
  const calendarGrid = document.querySelector(".grid-days");

  const year = BOOKING_STATE.currentYear;
  const month = BOOKING_STATE.currentMonth;

  monthYearEl.textContent = MONTHS_NOMINATIVE[month] + " " + year;

  const weeks = buildCalendarGrid(year, month);
  const today = SERVER_DATA.today;

  let html = "";
  weeks.forEach(function (week) {
    html += '<div class="week-row">';
    week.forEach(function (cell) {
      let classes = "day-cell";
      if (cell.otherMonth) classes += " other-month";

      const isToday =
        !cell.otherMonth &&
        cell.day === today.day &&
        month === today.month &&
        year === today.year;
      if (isToday) classes += " today";

      const isSelected =
        !cell.otherMonth &&
        cell.day === BOOKING_STATE.selectedDay &&
        month === BOOKING_STATE.currentMonth;
      if (isSelected) classes += " selected";

      const selectable = isDateSelectable(cell.day, month, year);
      if (!cell.otherMonth && !selectable) classes += " disabled";

      html +=
        '<div class="' +
        classes +
        '" data-day="' +
        cell.day +
        '" data-other="' +
        cell.otherMonth +
        '">' +
        cell.day +
        "</div>";
    });
    html += "</div>";
  });

  calendarGrid.innerHTML = html;

  const dayCells = calendarGrid.querySelectorAll(
    ".day-cell:not(.other-month):not(.disabled)"
  );
  dayCells.forEach(function (cell) {
    cell.addEventListener("click", onDayClick);
  });
}

/**
 * Обработчик клика по дню — запрашивает слоты, сбрасывает время.
 */
function onDayClick(event) {
  const cell = event.currentTarget;
  const day = parseInt(cell.dataset.day);

  BOOKING_STATE.selectedDay = day;
  BOOKING_STATE.selectedTime = null;

  const response = getSlotsForDay(
    day,
    BOOKING_STATE.currentMonth,
    BOOKING_STATE.currentYear
  );
  SERVER_DATA.slots = response.slots;

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
}

/**
 * Отрисовывает слоты времени для выбранного дня.
 */
function renderTimeSlots() {
  const timeGrid = document.querySelector(".time-grid");
  const slots = SERVER_DATA.slots;

  if (!slots || slots.length === 0) {
    timeGrid.innerHTML =
      '<div style="text-align:center; padding:40px; color:#6B6661; font-size:16px;">' +
      "В этот день нет доступного времени" +
      "</div>";
    return;
  }

  let html = "";
  slots.forEach(function (slot) {
    let classes = "time-slot";
    if (!slot.available) classes += " unavailable";
    if (slot.time === BOOKING_STATE.selectedTime && slot.available) {
      classes += " selected";
    }
    html +=
      '<button class="' +
      classes +
      '" data-time="' +
      slot.time +
      '">' +
      slot.time +
      "</button>";
  });

  timeGrid.innerHTML = html;

  const slotButtons = timeGrid.querySelectorAll(".time-slot:not(.unavailable)");
  slotButtons.forEach(function (slot) {
    slot.addEventListener("click", onTimeSlotClick);
  });
}

/**
 * Обработчик клика по слоту времени.
 */
function onTimeSlotClick(event) {
  const slot = event.currentTarget;
  const time = slot.dataset.time;

  BOOKING_STATE.selectedTime = time;

  renderTimeSlots();
  updateBottomBar();
}

/**
 * Обновляет нижнюю панель с выбранной датой и временем.
 */
function updateBottomBar() {
  const valueEl = document.querySelector(".bottom-bar .value");

  const day = BOOKING_STATE.selectedDay;
  const month = BOOKING_STATE.currentMonth;
  const year = BOOKING_STATE.currentYear;

  const dateObj = new Date(year, month, day);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  const monthName = MONTHS_GENITIVE[month];

  const timePart = BOOKING_STATE.selectedTime
    ? BOOKING_STATE.selectedTime
    : "время не выбрано";

  valueEl.textContent =
    dayName + ", " + day + " " + monthName + " " + year + " • " + timePart;
}

/**
 * Обработчик навигации по месяцам.
 */
function setupMonthNavigation() {
  const prevBtn = document.querySelector(".calendar-nav-prev");
  const nextBtn = document.querySelector(".calendar-nav-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      BOOKING_STATE.currentMonth -= 1;
      if (BOOKING_STATE.currentMonth < 0) {
        BOOKING_STATE.currentMonth = 11;
        BOOKING_STATE.currentYear -= 1;
      }
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      BOOKING_STATE.currentMonth += 1;
      if (BOOKING_STATE.currentMonth > 11) {
        BOOKING_STATE.currentMonth = 0;
        BOOKING_STATE.currentYear += 1;
      }
      renderCalendar();
    });
  }
}

/**
 * Только если это многостраничное приложение.
 * Обработчик кнопки «Назад» — переход на страницу услуг.
 */
function setupBackButton() {
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "services.html";
    });
  }
}

/**
 * Только если это многостраничное приложение.
 * Обработчик кнопки «Далее» — сохраняет дату и время, переход на подтверждение.
 */
function setupNextButton() {
  const nextBtn = document.querySelector(".next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!BOOKING_STATE.selectedTime) {
        alert("Пожалуйста, выберите время");
        return;
      }

      saveSelectedDate(
        {
          day: BOOKING_STATE.selectedDay,
          month: BOOKING_STATE.currentMonth,
          year: BOOKING_STATE.currentYear,
        },
        BOOKING_STATE.selectedTime
      );

      window.location.href = "confirmation.html";
    });
  }
}

/**
 * Только если это многостраничное приложение.
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

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

function init() {
  BOOKING_STATE.currentMonth = SERVER_DATA.today.month;
  BOOKING_STATE.currentYear = SERVER_DATA.today.year;
  BOOKING_STATE.selectedDay = SERVER_DATA.today.day;

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
  setupMonthNavigation();
  setupBackButton();
  setupNextButton();
  setupLogoClick();
}

document.addEventListener("DOMContentLoaded", function () {
  init();
});
