/* === NASTYA FITNESS SITE PATCHES (UPDATED) === */
(function () {
  'use strict';

  const style = document.createElement('style');
  style.innerHTML = `
    /* 1. Сохранение абзацев и переносов строк в отзывах и текстах */
    .rev-card p, .review-text, .client-quote, [class*="review"], [class*="quote"], [class*="text"] {
      white-space: pre-line !important;
    }

    /* 2. Четыре блока: оставляем только жирный текст */
    .features-card p:not(strong), .about-feature p:not(strong), .grid-card p:not(strong), 
    .features-card span:not(strong), .about-feature span:not(strong) {
      display: none !important;
    }

    /* 3. Блок знакомства: полностью скрываем текст */
    .intro-text, .about-intro-text, [class*="intro-desc"] {
      display: none !important;
    }

    /* 4. Перенос указателя свайпа наверх под заголовок «Услуги и форматы работы» */
    .services-swipe-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: 12px 0 18px 0;
      padding: 8px 16px;
      background: rgba(201, 144, 78, 0.14);
      border: 1px solid rgba(201, 144, 78, 0.38);
      border-radius: 999px;
      color: #3F291B;
      font-family: 'Manrope', sans-serif;
      font-size: 12.5px;
      font-weight: 600;
    }

    /* 5. Убираем плашки «Точка А» и «Результат» в кейсах */
    .case-badge, .point-a-label, .result-label, [class*="badge-label"] {
      display: none !important;
    }

    /* 6. Кнопка подарка: убираем гантельку, добавляем пульсирующий палец */
    .gift-btn svg, .bow-dumbbell-ico {
      display: none !important;
    }
    .gift-btn::after {
      content: ' 👉';
      display: inline-block;
      animation: pulseFinger 1.2s ease-in-out infinite;
    }
    @keyframes pulseFinger {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.25); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  console.log("✅ Все исправления успешно применены через patches.js");
})();
