/**
 * Навешивает обработчик на кнопку «Записаться на услугу» — переход
 * на страницу выбора услуг.
 */
function setupCtaServiceButton() {
  const ctaService = document.querySelector(".cta-service");
  if (ctaService) {
    ctaService.addEventListener("click", function () {
      window.location.href = "services.html";
    });
  }
}

/**
 * Навешивает обработчик на логотип — переход на главную.
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
 * Инициализация модуля.
 */
function init() {
  setupCtaServiceButton();
  setupLogoClick();
}

document.addEventListener("DOMContentLoaded", function () {
  init();
});
