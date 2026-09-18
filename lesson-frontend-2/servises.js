// ============================================================
// 1. ДАННЫЕ, КОТОРЫЕ ПРИХОДЯТ С СЕРВЕРА
// ============================================================
// TODO: Позже эти данные будут загружаться через запрос к серверу.
// Сейчас захардкожены, чтобы страница работала без backend.

const SERVICES_DATA = [
  {
    id: 100,
    name: "Стрижки и укладки",
    services: [
      {
        id: 1,
        title: "Стрижка женская",
        desc: "Моделирование формы с учетом типа волос.",
        duration: 60,
        price: 4500,
      },
      {
        id: 2,
        title: "Укладка феном",
        desc: "Объемная укладка с фиксацией.",
        duration: 40,
        price: 2800,
      },
      {
        id: 3,
        title: "Кератиновое выпрямление",
        desc: "Восстановление и гладкость до 3 месяцев.",
        duration: 120,
        price: 8500,
      },
      {
        id: 4,
        title: "Стрижка мужская",
        desc: "Стильная мужская стрижка любой сложности.",
        duration: 40,
        price: 3200,
      },
      {
        id: 5,
        title: "Окрашивание тонирование",
        desc: "Мягкое тонирование без повреждения структуры.",
        duration: 90,
        price: 5800,
      },
    ],
  },
  {
    id: 200,
    name: "Маникюр и педикюр",
    services: [
      {
        id: 6,
        title: "Японский эстетический маникюр P.Shine",
        desc: "Идеальная чистота линий, сертифицированные премиум препараты.",
        duration: 50,
        price: 3200,
      },
      {
        id: 7,
        title: "Комбинированный маникюр с покрытием гель-лак Luxio",
        desc: "Идеальная чистота линий, сертифицированные премиум препараты.",
        duration: 60,
        price: 3800,
      },
      {
        id: 8,
        title: "Аппаратный премиум педикюр KART",
        desc: "Идеальная чистота линий, сертифицированные премиум препараты.",
        duration: 80,
        price: 5500,
      },
      {
        id: 9,
        title: "Укрепление ногтей и IBX-терапия",
        desc: "Идеальная чистота линий, сертифицированные премиум препараты.",
        duration: 30,
        price: 1800,
      },
      {
        id: 10,
        title: "Экспресс маникюр и педикюр в 4 руки",
        desc: "Идеальная чистота линий, сертифицированные премиум препараты.",
        duration: 90,
        price: 7800,
      },
    ],
  },
  {
    id: 300,
    name: "Брови и ресницы",
    services: [
      {
        id: 11,
        title: "Коррекция бровей воском",
        desc: "Четкая форма с учетом анатомии лица.",
        duration: 30,
        price: 1200,
      },
      {
        id: 12,
        title: "Окрашивание бровей хной",
        desc: "Стойкий цвет до 3 недель.",
        duration: 40,
        price: 1800,
      },
      {
        id: 13,
        title: "Ламинирование ресниц",
        desc: "Эффект распахнутого взгляда на 6-8 недель.",
        duration: 60,
        price: 3500,
      },
      {
        id: 14,
        title: "Ботокс для ресниц",
        desc: "Восстановление и укрепление ресниц.",
        duration: 45,
        price: 2800,
      },
    ],
  },
  {
    id: 400,
    name: "Спа-процедуры",
    services: [
      {
        id: 15,
        title: 'SPA-программа "Релакс"',
        desc: "Массаж лица и зоны декольте с аромамаслами.",
        duration: 90,
        price: 6500,
      },
      {
        id: 16,
        title: "Обертывание шоколадное",
        desc: "Питание и увлажнение кожи.",
        duration: 60,
        price: 4200,
      },
      {
        id: 17,
        title: "Пилинг тела с солями Мёртвого моря",
        desc: "Глубокое очищение и регенерация.",
        duration: 50,
        price: 3800,
      },
      {
        id: 18,
        title: "Массаж спины классический",
        desc: "Расслабляющий массаж для снятия напряжения.",
        duration: 60,
        price: 4500,
      },
    ],
  },
];

// ============================================================
// 2. СОСТОЯНИЕ ДЛЯ СТРАНИЦЫ
// ============================================================
// (на этой странице отдельного состояния нет — всё берётся
// из DOM: активная категория помечается классом .active,
// список услуг перерисовывается при клике)

// ============================================================
// 3. ЛОГИКА ДЛЯ ИМИТАЦИИ РАБОТЫ С СЕРВЕРОМ
// ============================================================
// Сейчас данные берутся из SERVICES_DATA напрямую.
// Когда появится backend, эти функции заменятся на fetch.

/**
 * Ищет категорию по id.
 */
function findCategoryById(id) {
  for (let i = 0; i < SERVICES_DATA.length; i++) {
    const category = SERVICES_DATA[i];
    if (category.id === id) {
      return category;
    }
  }
  return null;
}

/**
 * Только если это многостраничное приложение.
 * Ищет услугу по id среди всех категорий.
 */
function findServiceById(id) {
  for (let i = 0; i < SERVICES_DATA.length; i++) {
    const category = SERVICES_DATA[i];
    for (let j = 0; j < category.services.length; j++) {
      const service = category.services[j];
      if (service.id === id) {
        return service;
      }
    }
  }
  return null;
}

/**
 * Только если это многостраничное приложение.
 * Сохраняет выбранную услугу в localStorage.
 * TODO: Позже может уйти на сервер как черновик брони.
 */
function saveSelectedService(service) {
  const booking = {
    service: {
      id: service.id,
      title: service.title,
      duration: service.duration,
      price: service.price,
    },
  };
  localStorage.setItem("elair-booking", JSON.stringify(booking));
}

// ============================================================
// 4. ЧИСТЫЕ ФУНКЦИИ
// ============================================================
// Эти функции не зависят от DOM и от данных проекта.
// Можно копировать в любой другой проект.

/**
 * Форматирует цену: 3200 → "3 200 ₽".
 */
function formatPrice(price) {
  return price.toLocaleString("ru-RU") + " ₽";
}

// ============================================================
// 5. ОТРИСОВКА И ОБРАБОТЧИКИ
// ============================================================

/**
 * Отрисовывает список категорий в боковой панели.
 * Первая категория становится активной.
 */
function renderCategories() {
  const sidebar = document.querySelector(".sidebar");
  SERVICES_DATA.forEach(function (category, index) {
    const categoryDiv = renderCategoryItem(category, index === 0);
    sidebar.appendChild(categoryDiv);
  });
}

/**
 * Отрисовка плашки с категорией.
 */
function renderCategoryItem(category, isActive) {
  const activeClass = isActive ? "active" : "";
  const count = category.services.length;
  const categoryDiv = document.createElement("div");
  categoryDiv.dataset.id = category.id;
  categoryDiv.className = "category-item " + activeClass;
  categoryDiv.innerHTML =
    '<span class="cat-name">' +
    category.name +
    "</span>" +
    '<div class="count-badge"><span>' +
    count +
    "</span></div>";
  return categoryDiv;
}

/**
 * Отрисовывает список услуг конкретной категории.
 */
function renderServices(categoryId) {
  const servicesContainer = document.querySelector(".services-list .rows");
  const category = findCategoryById(categoryId);

  if (!category || !category.services || category.services.length === 0) {
    servicesContainer.innerHTML =
      '<div style="text-align: center; padding: 40px; color: #6B6661; font-size: 16px;">' +
      "В этой категории пока нет услуг" +
      "</div>";
    return;
  }

  let html = "";
  category.services.forEach(function (service) {
    html += renderServiceItem(service);
  });

  servicesContainer.innerHTML = html;

  // После отрисовки вешаем обработчики на кнопки «Выбрать»
  setupSelectButtons();
}

/**
 * Отрисовка плашки с услугой.
 */
function renderServiceItem(service) {
  const formattedPrice = formatPrice(service.price);
  return `
    <div class="service-row" data-service="${service.id}">
      <div class="info">
        <span class="title">${service.title}</span>
        <span class="desc">${service.desc}</span>
      </div>
      <div class="meta">
        <span class="duration">${service.duration} мин</span>
        <span class="price">${formattedPrice}</span>
      </div>
      <button class="select-btn"><span>Выбрать</span></button>
    </div>
  `;
}

/**
 * Обработчик клика по категории — перерисовка списка услуг.
 */
function setupCategoryListeners() {
  const categoryItems = document.querySelectorAll(".category-item");

  function onCategoryItemClick(event) {
    categoryItems.forEach(function (cat) {
      cat.classList.remove("active");
    });

    const clickedItem = event.currentTarget;
    const categoryId = parseInt(clickedItem.dataset.id);

    clickedItem.classList.add("active");
    renderServices(categoryId);
  }

  categoryItems.forEach(function (item) {
    item.addEventListener("click", onCategoryItemClick);
  });
}

/**
 * Только если это многостраничное приложение.
 * Обработчики кнопок «Выбрать».
 * Сохраняет услугу и переходит на страницу выбора даты.
 */
function setupSelectButtons() {
  const selectButtons = document.querySelectorAll(".select-btn");
  selectButtons.forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      const row = event.currentTarget.closest(".service-row");
      const serviceId = parseInt(row.dataset.service);
      const service = findServiceById(serviceId);

      if (!service) return;

      saveSelectedService(service);
      window.location.href = "booking.html";
    });
  });
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

/**
 * Только если это многостраничное приложение.
 * Обработчик кнопки «Назад» — переход на главную.
 */
function setupBackButton() {
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

function init() {
  renderCategories();
  renderServices(100);
  setupCategoryListeners();
  setupLogoClick();
  setupBackButton();
}

document.addEventListener("DOMContentLoaded", function () {
  init();
});
