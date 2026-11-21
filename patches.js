/**
 * patches.js — Чистый модульный слой поверх index.html (Шаг 1)
 * - Тёмно-шоколадная шапка с золотой кнопкой как на эталоне
 * - Полная мобильная адаптация (включая длинное главное фото без обрезки)
 * - Точное сохранение переносов строк и абзацев из панели управления (1-в-1)
 * - Отсутствие перекрытий на фото кейсов («Точка А» / «Результат» убраны)
 * - Блок подарка: большая гантелька с бантиком наверху, пульсирующий палец на кнопку (без гантельки в кнопке)
 * - Услуги: порядок А -> Б (Мини-группы) -> В (Программы) -> Г (Растяжка) + указатель свайпа НАВЕРХУ под заголовком
 * - Форма «Оставить заявку»: автоподтяжка актуальных цен из блока «Коммерческие предложения»
 * - Блок «Образование»: ровно 2 фото-блока (Диплом и Сертификат) с заголовками сверху и лайтбоксом
 * - Блок «Отзывы»: чистая 3D-призма со скриншотами переписок (без круглых аватарок и без кнопки «Выбрать формат»)
 * - Хуки для модулей Шага 2 (reliefs.js) и Шага 3 (lusion3d.js)
 */
(function () {
  'use strict';

  // ==========================================================================
  // 1. ПРЕДОХРАНИТЕЛЬ ПРЕЛОАДЕРА И СИНХРОНИЗАЦИЯ ФОТО
  // ==========================================================================
  function unlockPreloader() {
    var pre = document.getElementById('preloader');
    if (pre) pre.classList.add('hidden');
    document.body.classList.add('loaded');
  }
  setTimeout(unlockPreloader, 1100);
  window.addEventListener('load', function () { setTimeout(unlockPreloader, 500); });

  var ORIG_EXT = ['jpg', 'jpeg', 'png', 'webp'];
  window.photoFallback = function (img) {
    if (!img) return;
    var slot = img.getAttribute('data-slot');
    var ovPhotos = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.photos) || {};
    if (slot && ovPhotos[slot] && img.getAttribute('src') !== ovPhotos[slot]) {
      img.src = ovPhotos[slot];
      return;
    }
    var src = img.getAttribute('src') || '';
    var m = src.match(/^((?:photos|images)\/[^.]+)\.(\w+)$/);
    if (m) {
      var idx = ORIG_EXT.indexOf(m[2].toLowerCase());
      if (idx >= 0 && idx < ORIG_EXT.length - 1) {
        img.src = m[1] + '.' + ORIG_EXT[idx + 1];
        return;
      }
      img.onerror = null;
      if (window.STOCK && window.STOCK[m[1]]) {
        img.src = window.STOCK[m[1]];
        return;
      }
    }
    img.onerror = null;
    if (slot && window.STOCK && window.STOCK['photos/' + slot]) {
      img.src = window.STOCK['photos/' + slot];
    }
  };

  function syncAllPhotos() {
    var ov = window.SITE_OVERRIDES || {};
    var ph = ov.photos || {};
    document.querySelectorAll('img[data-slot]').forEach(function (img) {
      var slot = img.getAttribute('data-slot');
      if (slot && ph[slot]) img.src = ph[slot];
    });
    if (window.SITE_DATA && ov.lists) {
      Object.keys(ov.lists).forEach(function (k) {
        if (ov.lists[k]) window.SITE_DATA[k] = ov.lists[k];
      });
    }
  }

  // ==========================================================================
  // 2. ИНЪЕКЦИЯ СТИЛЕЙ (АДАПТИВ, ШАПКА, ПЕРЕНОСЫ СТРОК, ПРАВКИ)
  // ==========================================================================
  var styleEl = document.createElement('style');
  styleEl.id = 'nastya-patches-css';
  styleEl.textContent = [
    '/* 0. Безопасность от горизонтального скролла на телефонах */',
    'html, body { overflow-x: clip !important; }',

    '/* 1. Точное сохранение абзацев и переносов строк из панели управления 1-в-1 */',
    '.case-quote, .case-metrics, .hero-sub, .section-desc, .goal-card p, .tariff-desc,',
    '.step-card p, .approach-card-body p, .faq-answer p, .about-bio-grid p, .gift-card p,',
    '.cta-sub, .lusion-info p, .gallery-card-body p {',
    '  white-space: pre-line !important;',
    '}',

    '/* 2. Фирменная тёмно-шоколадная шапка с золотой кнопкой (эталон) */',
    'header {',
    '  background: rgba(54, 34, 21, 0.96) !important;',
    '  border-bottom: 1px solid rgba(224, 168, 98, 0.22) !important;',
    '  box-shadow: 0 8px 28px rgba(30, 18, 10, 0.16);',
    '}',
    'header .logo { color: #FFFBF5 !important; }',
    'header .logo-text span {',
    '  background: linear-gradient(90deg, #F0C48B, #D99B58) !important;',
    '  -webkit-background-clip: text !important;',
    '  background-clip: text !important;',
    '  -webkit-text-fill-color: transparent !important;',
    '}',
    'header .nav-links a { color: rgba(255, 251, 245, 0.86) !important; }',
    'header .nav-links a:hover { color: #F6D9A8 !important; }',
    'header .btn.btn-primary {',
    '  background: linear-gradient(135deg, #EDBB75, #C0803A) !important;',
    '  color: #2B1A0E !important;',
    '  font-weight: 700 !important;',
    '  box-shadow: 0 6px 18px rgba(192, 128, 58, 0.35) !important;',
    '  border: none !important;',
    '}',
    'header .burger {',
    '  border-color: rgba(246, 217, 168, 0.35) !important;',
    '  background: rgba(255, 251, 245, 0.08) !important;',
    '}',
    'header .burger span { background: #FFF6E8 !important; }',
    'body.menu-open header { background: transparent !important; border-color: transparent !important; box-shadow: none !important; }',

    '/* 3. Главное фото и фото «Обо мне»: убираем плашку, удлиняем на телефоне без обрезки */',
    '.hero-floating-card { display: none !important; }',
    '@keyframes softLevitate {',
    '  0%, 100% { transform: translateY(0px); }',
    '  50% { transform: translateY(calc(-1 * var(--float-amp, 7px))); }',
    '}',
    '.hero-visual, .about-photo-main {',
    '  background: var(--bg-milk) !important;',
    '  overflow: hidden !important;',
    '  border-radius: 26px !important;',
    '  box-shadow: 0 22px 46px rgba(63, 41, 27, 0.12) !important;',
    '}',
    '.hero-visual img, .about-photo-main img {',
    '  width: 100% !important;',
    '  height: 100% !important;',
    '  object-fit: cover !important;',
    '  object-position: center top !important;',
    '  -webkit-mask-image: none !important;',
    '  mask-image: none !important;',
    '}',
    '@media (min-width: 721px) {',
    '  .hero-visual { animation: softLevitate 6.5s ease-in-out infinite; }',
    '}',
    '@media (max-width: 720px) {',
    '  .hero-visual {',
    '    aspect-ratio: 3 / 4.2 !important;',
    '    min-height: 440px !important;',
    '    height: auto !important;',
    '    animation: none !important;',
    '  }',
    '  .about-photo-main {',
    '    aspect-ratio: 4 / 4.5 !important;',
    '    max-height: none !important;',
    '  }',
    '}',

    '/* 4. Кейсы («Реальные истории»): убираем плашки «Точка А» и «Результат» */',
    '.case-photo-tag { display: none !important; }',

    '/* 5. Блок «Знакомство»: 4 карточки только с жирным текстом */',
    '.about-point {',
    '  display: flex;',
    '  align-items: center;',
    '  min-height: 66px;',
    '  padding: 16px 20px !important;',
    '}',
    '.about-point strong {',
    '  margin-bottom: 0 !important;',
    '  font-size: 0.94rem !important;',
    '  line-height: 1.35;',
    '}',
    '.about-point span { display: none !important; }',

    '/* 6. Блок «Образование»: ровно 2 фото с текстом сверху */',
    '.certs-two-grid {',
    '  display: grid !important;',
    '  grid-template-columns: repeat(2, 1fr) !important;',
    '  gap: 24px !important;',
    '}',
    '@media (max-width: 720px) {',
    '  .certs-two-grid {',
    '    grid-template-columns: 1fr !important;',
    '    gap: 18px !important;',
    '  }',
    '}',
    '.cert-scan-card {',
    '  background: var(--bg-milk);',
    '  border: 1px solid var(--border-soft);',
    '  border-radius: 20px;',
    '  padding: 20px;',
    '  cursor: zoom-in;',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 14px;',
    '  transition: var(--transition);',
    '}',
    '.cert-scan-card:hover {',
    '  transform: translateY(-4px);',
    '  box-shadow: 0 18px 38px rgba(63, 41, 27, 0.13);',
    '}',
    '.cert-scan-top-title {',
    '  font-family: "Manrope", sans-serif;',
    '  font-size: 0.96rem;',
    '  font-weight: 700;',
    '  color: var(--deep-choco);',
    '  text-align: center;',
    '  line-height: 1.35;',
    '}',
    '.cert-scan-img-wrap {',
    '  width: 100%;',
    '  aspect-ratio: 4 / 3;',
    '  border-radius: 12px;',
    '  overflow: hidden;',
    '  background: var(--bg-soft);',
    '  border: 1px solid rgba(201, 144, 78, 0.28);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '}',
    '.cert-scan-img-wrap img {',
    '  width: 100%;',
    '  height: 100%;',
    '  object-fit: contain;',
    '}',

    '/* 7. Блок подарка: пульсирующий палец на кнопку «Забрать подарок», без гантельки внутри кнопки */',
    '.gift-cta-row {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 12px;',
    '  max-width: 100%;',
    '}',
    '@media (max-width: 720px) {',
    '  .gift-cta-row {',
    '    display: flex;',
    '    justify-content: center;',
    '    width: 100%;',
    '  }',
    '  .gift-cta-row .gift-claim-btn { flex: 1; max-width: 260px; }',
    '}',
    '.gift-claim-btn .bow-dumbbell-ico { display: none !important; }',
    '.gift-finger-pointer {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 38px;',
    '  height: 38px;',
    '  flex-shrink: 0;',
    '  animation: fingerPointPulse 1.25s ease-in-out infinite;',
    '  filter: drop-shadow(0 4px 10px rgba(224, 168, 98, 0.45));',
    '}',
    '.gift-finger-pointer svg { width: 34px; height: 34px; }',
    '@keyframes fingerPointPulse {',
    '  0%, 100% { transform: translateX(0) scale(1); opacity: 0.85; }',
    '  50% { transform: translateX(7px) scale(1.1); opacity: 1; }',
    '}',

    '/* 8. Указатель свайпа НАВЕРХУ под заголовком «Услуги и форматы работы» */',
    '.services-swipe-bar {',
    '  position: relative;',
    '  z-index: 3;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  gap: 12px;',
    '  margin: -18px 0 22px 0;',
    '  padding: 9px 14px 9px 18px;',
    '  max-width: 480px;',
    '  background: rgba(255, 251, 245, 0.78);',
    '  backdrop-filter: blur(8px);',
    '  border: 1px solid rgba(138, 100, 70, 0.28);',
    '  border-radius: 999px;',
    '  color: var(--deep-choco);',
    '  font-size: 0.82rem;',
    '  font-weight: 600;',
    '}',
    '@media (max-width: 720px) {',
    '  .services-swipe-bar { margin: -6px 0 16px 0; max-width: 100%; font-size: 0.78rem; padding: 8px 10px 8px 14px; }',
    '}',
    '.services-swipe-bar .swipe-text { display: inline-flex; align-items: center; gap: 8px; }',
    '.services-swipe-bar .swipe-arrows { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }',
    '.services-swipe-bar button {',
    '  width: 30px; height: 30px; border-radius: 50%;',
    '  border: 1px solid rgba(63, 41, 27, 0.2);',
    '  background: #FFFBF5; color: var(--deep-choco);',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  cursor: pointer; font-size: 16px; line-height: 1;',
    '}',
    '.services-swipe-bar svg.anim-arrow {',
    '  width: 18px; height: 18px; stroke: #C9904E; stroke-width: 2.2; fill: none;',
    '  animation: nastyaSwipeMove 1.3s ease-in-out infinite;',
    '}',
    '@keyframes nastyaSwipeMove {',
    '  0%, 100% { transform: translateX(0); opacity: 0.55; }',
    '  50% { transform: translateX(5px); opacity: 1; }',
    '}',

    '/* 9. Плашка актуальной цены в форме «Оставить заявку» */',
    '.form-price-badge {',
    '  display: inline-block;',
    '  margin-top: 8px;',
    '  padding: 6px 14px;',
    '  border-radius: 999px;',
    '  background: rgba(201, 144, 78, 0.18);',
    '  color: var(--deep-choco);',
    '  font-size: 0.8rem;',
    '  font-weight: 700;',
    '}',

    '/* 10. Гантелька с бантиком (мини) */',
    '.bow-dumbbell-ico { display: inline-flex; align-items: center; vertical-align: middle; width: 26px; height: 18px; margin-right: 6px; flex-shrink: 0; }',
    '.bow-dumbbell-ico svg { width: 100%; height: 100%; overflow: visible; }',

    '/* 11. 3D-блок в стиле Lusion.co */',
    '.lusion-sec { padding: 8px 0 76px; position: relative; z-index: 2; }',
    '.lusion-card {',
    '  position: relative;',
    '  height: var(--lusion-h, 360px);',
    '  border-radius: 32px;',
    '  overflow: hidden;',
    '  background: radial-gradient(620px 320px at 86% 12%, rgba(224,168,98,0.34), transparent 62%), linear-gradient(135deg, #3F291B 0%, #5A3823 55%, #2B1B11 100%);',
    '  box-shadow: 0 28px 66px rgba(63,41,27,0.26), inset 0 1px 0 rgba(255,246,232,0.18);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 36px 48px;',
    '  color: #FFF6E8;',
    '  user-select: none;',
    '}',
    '.lusion-canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; cursor: grab; }',
    '.lusion-canvas:active { cursor: grabbing; }',
    '.lusion-info {',
    '  position: relative; z-index: 2; max-width: 440px; pointer-events: none;',
    '  background: rgba(34, 21, 13, 0.36); backdrop-filter: blur(6px);',
    '  padding: 20px 24px; border-radius: 22px;',
    '  border: 1px solid rgba(246, 217, 168, 0.16);',
    '}',
    '.lusion-info .eyebrow { color: #E7C08A; margin-bottom: 8px; }',
    '.lusion-info h3 { color: #FFF6E8; font-size: clamp(1.6rem, 2.9vw, 2.35rem); margin-bottom: 10px; line-height: 1.12; }',
    '.lusion-info h3 i { background: linear-gradient(100deg, #F6D9A8, #E0A862); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }',
    '.lusion-info p { color: rgba(255,246,232,0.88); font-size: 0.9rem; line-height: 1.55; margin: 0; }',
    '.lusion-hint {',
    '  position: absolute; right: 24px; bottom: 18px; z-index: 2; pointer-events: none;',
    '  font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;',
    '  color: rgba(246,217,168,0.8); background: rgba(30,20,14,0.42);',
    '  backdrop-filter: blur(8px); padding: 7px 14px; border-radius: 999px;',
    '  border: 1px solid rgba(246,217,168,0.22);',
    '}',
    '@media (max-width: 720px) {',
    '  .lusion-sec { padding: 4px 0 44px; }',
    '  .lusion-card { height: 320px; padding: 20px 16px; align-items: flex-start; border-radius: 26px; }',
    '  .lusion-info { max-width: 100%; padding: 16px 18px; }',
    '  .lusion-info h3 { font-size: 1.48rem; }',
    '  .lusion-info p { font-size: 0.8rem; }',
    '  .lusion-hint { right: 14px; bottom: 12px; font-size: 0.64rem; }',
    '}',

    '/* 12. Базовые стили для 15 скульптурных барельефов (подробно наполняются в Шаге 2 — reliefs.js) */',
    '.wall-relief-host { position: relative; overflow: hidden; }',
    '.wall-relief-host > .container, .wall-relief-host > .faq-container { position: relative; z-index: 2; }',
    '.wall-sculpture {',
    '  position: absolute; pointer-events: none; z-index: 1;',
    '  opacity: var(--relief-opacity, 0.28);',
    '}',

    '/* 13. Отзывы: скриншоты переписок без круглых аватарок и без кнопки */',
    '.review-card .review-text, .review-card .review-avatar { display: none !important; }',
    '.review-photo-shot {',
    '  width: 100%; aspect-ratio: 3 / 3.7; border-radius: 14px; overflow: hidden;',
    '  background: var(--bg-milk); margin: 10px 0 0; position: relative;',
    '  border: 1px solid var(--border-soft); cursor: zoom-in;',
    '  display: flex; align-items: center; justify-content: center;',
    '}',
    '.review-photo-shot img { width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform 0.45s ease; }',
    '.review-photo-shot:hover img { transform: scale(1.03); }',
    '.review-zoom-tag {',
    '  position: absolute; right: 10px; bottom: 10px;',
    '  background: rgba(63,41,27,0.82); color: #FFFBF5;',
    '  font-size: 0.7rem; font-weight: 600; padding: 5px 11px; border-radius: 999px;',
    '}',
    '.review-empty-placeholder {',
    '  padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 0.82rem; line-height: 1.45;',
    '}',

    '/* 14. Веерная 3D-карусель (Fan Deck) */',
    '.fandeck-wrap { position: relative; padding: 14px 0 8px; user-select: none; }',
    '.fandeck-stage {',
    '  position: relative; width: 100%; max-width: 980px; margin: 0 auto;',
    '  height: 430px; perspective: 1400px; touch-action: pan-y; cursor: grab;',
    '}',
    '.steps-sec .fandeck-stage { height: 270px; }',
    '.fandeck-stage:active { cursor: grabbing; }',
    '.fandeck-item {',
    '  position: absolute; left: 50%; top: 10px;',
    '  width: min(420px, 84vw); margin-left: calc(min(420px, 84vw) / -2);',
    '  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease, box-shadow 0.65s ease;',
    '  border-radius: var(--radius-md); transform-origin: 50% 90%;',
    '}',
    '.fandeck-item > * { height: 100%; margin: 0 !important; }',
    '.fandeck-wrap .c-nav { display: flex !important; align-items: center; justify-content: center; gap: 14px; margin-top: 22px; }',

    '/* 15. Лайтбокс, Cookie и Юридические модалки */',
    '#nastyaLightbox {',
    '  position: fixed; inset: 0; background: rgba(24,15,10,0.88); backdrop-filter: blur(8px);',
    '  z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;',
    '  opacity: 0; visibility: hidden; transition: 0.3s ease; cursor: zoom-out;',
    '}',
    '#nastyaLightbox.open { opacity: 1; visibility: visible; }',
    '#nastyaLightbox img { max-width: min(92vw, 820px); max-height: 88vh; border-radius: 16px; box-shadow: 0 28px 70px rgba(0,0,0,0.5); object-fit: contain; }',
    '.cookie-float {',
    '  position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 9500;',
    '  max-width: 440px; background: rgba(255,251,245,0.96); backdrop-filter: blur(14px);',
    '  border: 1px solid rgba(63,41,27,0.16); border-radius: 18px; padding: 14px 18px;',
    '  box-shadow: 0 18px 42px rgba(63,41,27,0.18); display: flex; align-items: center; gap: 14px;',
    '  font-size: 0.78rem; color: var(--text-main); line-height: 1.45;',
    '}',
    '.cookie-float a { color: var(--accent-brown); text-decoration: underline; font-weight: 600; cursor: pointer; }',
    '.cookie-btn {',
    '  background: var(--deep-choco); color: #FFFBF5; border: none; border-radius: 999px;',
    '  padding: 9px 18px; font-weight: 700; font-size: 0.76rem; cursor: pointer; white-space: nowrap;',
    '}',
    '.legal-check-row {',
    '  display: flex; align-items: flex-start; gap: 9px; margin: 10px 0 12px;',
    '  font-size: 0.73rem; color: var(--text-muted); line-height: 1.4; text-align: left;',
    '}',
    '.legal-check-row input { margin-top: 2px; accent-color: var(--deep-choco); flex-shrink: 0; }',
    '.legal-check-row a { color: var(--deep-choco); text-decoration: underline; cursor: pointer; }',
    '.legal-modal-box { max-width: 680px !important; max-height: 84vh; display: flex; flex-direction: column; }',
    '.legal-modal-body { overflow-y: auto; padding-right: 8px; font-size: 0.84rem; color: var(--text-main); line-height: 1.6; white-space: pre-line; margin-top: 12px; }',
    '.footer-selfemployed { margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(250,247,242,0.08); font-size: 0.73rem; color: rgba(250,247,242,0.45); line-height: 1.55; }'
  ].join('\n');
  document.head.appendChild(styleEl);

  // ==========================================================================
  // 3. ГАНТЕЛЬКА С БАНТИКОМ + ПУЛЬСИРУЮЩИЙ ПАЛЕЦ У КНОПКИ ПОДАРКА
  // ==========================================================================
  var DUMBBELL_BOW_MINI = '<span class="bow-dumbbell-ico" aria-hidden="true"><svg viewBox="0 0 64 36" fill="none"><rect x="3" y="9" width="7" height="18" rx="3" fill="#C9904E"/><rect x="11" y="6" width="8" height="24" rx="3.5" fill="#E0A862"/><rect x="45" y="6" width="8" height="24" rx="3.5" fill="#E0A862"/><rect x="54" y="9" width="7" height="18" rx="3" fill="#C9904E"/><rect x="18" y="15" width="28" height="6" rx="2" fill="#3F291B"/><path d="M32 16C25 6 16 9 20 16C16 21 24 25 32 18C40 25 48 21 44 16C48 9 39 6 32 16Z" fill="#FFF1D6" stroke="#B8733F" stroke-width="1.5"/><path d="M29 19L25 29M35 19L39 29" stroke="#FFF1D6" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="17" r="3" fill="#C9904E"/></svg></span>';

  var DUMBBELL_BOW_HERO_SVG = [
    '<svg class="gift-svg" viewBox="0 0 180 130" aria-hidden="true">',
    '  <defs>',
    '    <linearGradient id="dbPlate" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0%" stop-color="#F6D9A8"/>',
    '      <stop offset="55%" stop-color="#E0A862"/>',
    '      <stop offset="100%" stop-color="#9E6324"/>',
    '    </linearGradient>',
    '    <linearGradient id="dbRibbon" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0%" stop-color="#FFFDF9"/>',
    '      <stop offset="100%" stop-color="#F3DFC1"/>',
    '    </linearGradient>',
    '  </defs>',
    '  <ellipse cx="90" cy="114" rx="56" ry="7" fill="rgba(0,0,0,0.22)"/>',
    '  <g transform="rotate(-8 90 66)">',
    '    <rect x="14" y="42" width="14" height="48" rx="6" fill="url(#dbPlate)"/>',
    '    <rect x="30" y="32" width="18" height="68" rx="7" fill="url(#dbPlate)"/>',
    '    <rect x="46" y="58" width="88" height="16" rx="5" fill="#FFF1D6"/>',
    '    <rect x="132" y="32" width="18" height="68" rx="7" fill="url(#dbPlate)"/>',
    '    <rect x="152" y="42" width="14" height="48" rx="6" fill="url(#dbPlate)"/>',
    '    <g class="gift-lid" style="transform-origin: 90px 62px;">',
    '      <path d="M84 66 L72 98 L82 95 L88 103 L90 68" fill="url(#dbRibbon)" stroke="#C9904E" stroke-width="1.2"/>',
    '      <path d="M96 66 L108 98 L98 95 L92 103 L90 68" fill="url(#dbRibbon)" stroke="#C9904E" stroke-width="1.2"/>',
    '      <path d="M90 62 C68 34, 48 44, 58 62 C64 72, 78 68, 90 62 Z" fill="url(#dbRibbon)" stroke="#C9904E" stroke-width="1.5"/>',
    '      <path d="M90 62 C112 34, 132 44, 122 62 C116 72, 102 68, 90 62 Z" fill="url(#dbRibbon)" stroke="#C9904E" stroke-width="1.5"/>',
    '      <rect x="83" y="54" width="14" height="18" rx="5" fill="#E0A862" stroke="#FFF1D6" stroke-width="1.5"/>',
    '    </g>',
    '  </g>',
    '</svg>'
  ].join('');

  var FINGER_POINTER_SVG = [
    '<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '  <path d="M7 16.5C7 14.8 8.4 13.5 10.1 13.5H27.8C29.5 13.5 30.8 14.8 30.8 16.5C30.8 18.2 29.5 19.5 27.8 19.5H21.2C22.4 19.5 23.4 20.5 23.4 21.7C23.4 22.9 22.4 23.9 21.2 23.9H20.3C21.3 23.9 22.1 24.7 22.1 25.8C22.1 26.8 21.3 27.6 20.3 27.6H18.8C19.6 27.6 20.3 28.3 20.3 29.2C20.3 30.1 19.5 30.8 18.5 30.8H12.8C9.2 30.8 7 28.2 7 24.6V16.5Z" fill="#F6D9A8" stroke="#9E6324" stroke-width="1.6" stroke-linejoin="round"/>',
    '  <path d="M12.5 13.5L15.2 9.2C16 7.9 17.7 7.6 18.9 8.4C20 9.2 20.2 10.8 19.4 11.9L18 13.5" fill="#F6D9A8" stroke="#9E6324" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    '</svg>'
  ].join('');

  function replaceAllGiftIcons() {
    document.querySelectorAll('#contactFormatSelect option').forEach(function (opt) {
      if (opt.textContent.indexOf('🎁') >= 0) opt.textContent = opt.textContent.replace(/🎁/g, '✦');
    });

    document.querySelectorAll('.hero .btn-gold, .form-gift, .step-card h3').forEach(function (el) {
      if (el.innerHTML.indexOf('🎁') >= 0) el.innerHTML = el.innerHTML.replace(/🎁/g, DUMBBELL_BOW_MINI);
    });

    var giftSvg = document.querySelector('.gift-art .gift-svg');
    if (giftSvg) giftSvg.outerHTML = DUMBBELL_BOW_HERO_SVG;

    var giftBtn = document.querySelector('.gift-sec .btn-gold');
    if (giftBtn) {
      giftBtn.classList.add('gift-claim-btn');
      giftBtn.innerHTML = giftBtn.textContent.replace(/🎁/g, '').trim();
      var finger = document.querySelector('.gift-sec .gift-finger-pointer');
      if (finger) {
        finger.innerHTML = FINGER_POINTER_SVG;
      } else {
        var row = document.createElement('div');
        row.className = 'gift-cta-row';
        var span = document.createElement('span');
        span.className = 'gift-finger-pointer';
        span.setAttribute('aria-hidden', 'true');
        span.innerHTML = FINGER_POINTER_SVG;
        giftBtn.parentNode.insertBefore(row, giftBtn);
        row.appendChild(span);
        row.appendChild(giftBtn);
      }
    }
  }

  // ==========================================================================
  // 4. ПОРЯДОК УСЛУГ (Б = МИНИ-ГРУППЫ, В = ПРОГРАММЫ) + УКАЗАТЕЛЬ СВАЙПА НАВЕРХУ
  // ==========================================================================
  function normalizeServicesAndSwipeBar() {
    if (window.SITE_DATA && window.SITE_DATA.services) {
      var srv = window.SITE_DATA.services;
      var ordered = {};
      ['personal', 'groups', 'plans', 'stretch'].forEach(function (k) {
        if (srv[k]) ordered[k] = srv[k];
      });
      Object.keys(srv).forEach(function (k) {
        if (!ordered[k]) ordered[k] = srv[k];
      });
      if (ordered.groups && ordered.groups.label) {
        ordered.groups.label = ordered.groups.label.replace(/^В\./, 'Б.');
      }
      if (ordered.plans && ordered.plans.label) {
        ordered.plans.label = ordered.plans.label.replace(/^Б\./, 'В.');
      }
      window.SITE_DATA.services = ordered;
      if (typeof window.renderServices === 'function') {
        window.renderServices();
        var t = document.getElementById('tariffsContainer');
        if (t && typeof window.initCarousel === 'function') window.initCarousel(t);
      }
    }

    document.querySelectorAll('.services-swipe-bar').forEach(function (el) { el.remove(); });

    var servicesHead = document.querySelector('#services .section-head');
    if (servicesHead) {
      var bar = document.createElement('div');
      bar.className = 'services-swipe-bar';
      bar.innerHTML = [
        '<span class="swipe-text">',
        '  <span>Листайте категории и тарифы вбок</span>',
        '  <svg class="anim-arrow" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">',
        '    <path d="M5 12h14M13 6l6 6-6 6"/>',
        '  </svg>',
        '</span>',
        '<span class="swipe-arrows">',
        '  <button type="button" data-dir="-1" aria-label="Назад">‹</button>',
        '  <button type="button" data-dir="1" aria-label="Вперёд">›</button>',
        '</span>'
      ].join('');

      bar.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var dir = Number(btn.getAttribute('data-dir')) || 1;
          var tabs = document.getElementById('serviceTabs');
          var tariffs = document.getElementById('tariffsContainer');
          if (tabs && tabs.scrollWidth > tabs.clientWidth + 8) {
            tabs.scrollBy({ left: dir * 200, behavior: 'smooth' });
          }
          if (tariffs && tariffs.scrollWidth > tariffs.clientWidth + 8) {
            tariffs.scrollBy({ left: dir * 280, behavior: 'smooth' });
          }
        });
      });

      servicesHead.insertAdjacentElement('afterend', bar);
    }
  }

  // ==========================================================================
  // 5. ДИНАМИЧЕСКАЯ ПОДТЯЖКА АКТУАЛЬНЫХ ЦЕН В ФОРМУ «ОСТАВИТЬ ЗАЯВКУ»
  // ==========================================================================
  function syncFormPrices() {
    var select = document.getElementById('contactFormatSelect');
    if (!select || !window.SITE_DATA || !window.SITE_DATA.services) return;

    var prevVal = select.value;
    var options = [
      { value: 'Пробная тренировка — в подарок (0 ₽)', label: '✦ Пробная тренировка — в подарок (0 ₽)', price: '0 ₽ (в подарок)' }
    ];

    Object.keys(window.SITE_DATA.services).forEach(function (catKey) {
      var cat = window.SITE_DATA.services[catKey];
      if (!cat || !Array.isArray(cat.items)) return;
      var catShort = String(cat.label || '').replace(/^[А-ЯA-Z]\.\s*/, '');
      cat.items.forEach(function (item) {
        var priceText = ((item.price || '') + ' ' + (item.period || '')).trim();
        var fullLabel = catShort + ' — ' + item.title + ' (' + (item.price || '') + ')';
        options.push({
          value: item.title + ' (' + priceText + ')',
          label: fullLabel,
          price: priceText
        });
      });
    });

    options.push({
      value: 'Помочь выбрать подходящий формат',
      label: 'Помочь выбрать подходящий формат',
      price: 'Подберём на бесплатной консультации'
    });

    select.innerHTML = options.map(function (o, idx) {
      return '<option value="' + o.value.replace(/"/g, '&quot;') + '" data-price="' + o.price.replace(/"/g, '&quot;') + '"' + (idx === 0 ? ' selected' : '') + '>' + o.label + '</option>';
    }).join('');

    if (prevVal && Array.prototype.some.call(select.options, function (op) { return op.value === prevVal; })) {
      select.value = prevVal;
    }

    var badge = document.getElementById('contactPriceBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'contactPriceBadge';
      badge.className = 'form-price-badge';
      select.insertAdjacentElement('afterend', badge);
    }

    function updateBadge() {
      var opt = select.options[select.selectedIndex];
      var pr = (opt && opt.getAttribute('data-price')) || '';
      badge.textContent = pr ? 'Актуальная стоимость: ' + pr : '';
    }
    select.onchange = updateBadge;
    updateBadge();
  }

  // ==========================================================================
  // 6. КЕЙСЫ И БЛОК «ЗНАКОМСТВО»: ЧИСТКА НА СЛУЧАЙ ДИНАМИЧЕСКОГО РЕНДЕРА
  // ==========================================================================
  function cleanCasesAndAbout() {
    document.querySelectorAll('.case-photo-tag').forEach(function (el) { el.remove(); });
    document.querySelectorAll('#about-bio p').forEach(function (p) {
      if ((p.textContent || '').indexOf('бездумных марафонов') >= 0) p.remove();
    });
    document.querySelectorAll('.about-point span').forEach(function (s) { s.remove(); });
  }

  // ==========================================================================
  // 7. ОБРАЗОВАНИЕ И СЕРТИФИКАТЫ: РОВНО 2 ФОТО С ТЕКСТОМ СВЕРХУ
  // ==========================================================================
  function setupCertificateScans() {
    window.STOCK = window.STOCK || {};
    var defStock = [
      'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80'
    ];
    for (var i = 1; i <= 2; i++) {
      if (!window.STOCK['photos/cert-' + i]) window.STOCK['photos/cert-' + i] = defStock[i - 1];
    }

    if (window.SITE_DATA) {
      var ovCerts = window.SITE_OVERRIDES && window.SITE_OVERRIDES.lists && window.SITE_OVERRIDES.lists.certs;
      var baseCerts = (Array.isArray(ovCerts) && ovCerts.length) ? ovCerts.slice(0, 2) : [
        { title: 'Диплом о профессиональной переподготовке', img: 'photos/cert-1.jpg' },
        { title: 'Сертификат профильного обучения', img: 'photos/cert-2.jpg' }
      ];
      window.SITE_DATA.certs = baseCerts;
    }

    var certsGrid = document.querySelector('#about-certs .certs-grid');
    if (!certsGrid || !window.SITE_DATA || !window.SITE_DATA.certs) return;
    certsGrid.classList.add('certs-two-grid');
    certsGrid.classList.remove('m-car');
    if (certsGrid.nextElementSibling && certsGrid.nextElementSibling.classList.contains('c-nav')) {
      certsGrid.nextElementSibling.remove();
    }

    var ovPhotos = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.photos) || {};
    certsGrid.innerHTML = window.SITE_DATA.certs.slice(0, 2).map(function (c, idx) {
      var slot = 'cert-' + (idx + 1);
      var src = ovPhotos[slot] || c.img || ('photos/' + slot + '.jpg');
      var safeTitle = (c.title || (idx === 0 ? 'Диплом' : 'Сертификат')).replace(/'/g, "\\'");
      return [
        '<div class="cert-scan-card" onclick="openNastyaLightbox(this.querySelector(\'img\').src, \'' + safeTitle + '\')">',
        '  <div class="cert-scan-top-title">' + (c.title || '') + '</div>',
        '  <div class="cert-scan-img-wrap">',
        '    <img data-slot="' + slot + '" src="' + src + '" onerror="photoFallback(this)" loading="lazy" alt="' + safeTitle + '">',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');
  }

  // ==========================================================================
  // 8. ЛАЙТБОКС + ЧИСТЫЕ ОТЗЫВЫ (СКРИНШОТЫ ПЕРЕПИСОК БЕЗ КРУГЛЫХ ФОТО И КНОПКИ)
  // ==========================================================================
  window.openNastyaLightbox = function (src, alt) {
    if (!src) return;
    var lb = document.getElementById('nastyaLightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'nastyaLightbox';
      lb.innerHTML = '<img src="" alt="">';
      lb.addEventListener('click', function () { lb.classList.remove('open'); });
      document.body.appendChild(lb);
    }
    var img = lb.querySelector('img');
    img.src = src;
    img.alt = alt || '';
    lb.classList.add('open');
  };

  function rebuildPhotoReviews() {
    var container = document.getElementById('reviewsContainer');
    if (!container) return;

    var ov = window.SITE_OVERRIDES || {};
    var ovPhotos = ov.photos || {};
    var list = (Array.isArray(ov.reviewsCustom) && ov.reviewsCustom.length)
      ? ov.reviewsCustom
      : ((window.SITE_DATA && window.SITE_DATA.reviews) || []);

    if (!list.length) return;

    container.innerHTML = list.map(function (r, idx) {
      var screenSlot = 'rev-screen-' + (idx + 1);
      var legacySlot = 'review-' + (idx + 1);
      var imgSrc = r.screenshot || ovPhotos[screenSlot] || ovPhotos[legacySlot] || r.img || '';
      var safeName = (r.name || '').replace(/'/g, "\\'");
      return [
        '<div class="review-card">',
        '  <div>',
        '    <div class="review-top" style="margin-bottom:10px;">',
        '      <div>',
        '        <strong style="display:block; font-size:1.02rem; color:var(--deep-choco);">' + (r.name || '') + '</strong>',
        '        <span style="font-size:0.8rem; color:var(--text-muted);">' + (r.program || '') + '</span>',
        '      </div>',
        '    </div>',
        '    <span class="review-badge">' + (r.badge || '') + '</span>',
        '    <div class="review-photo-shot"' + (imgSrc ? ' onclick="openNastyaLightbox(this.querySelector(\'img\').src, \'' + safeName + '\')"' : '') + '>',
        imgSrc
          ? ('<img data-slot="' + screenSlot + '" src="' + imgSrc + '" onerror="photoFallback(this)" loading="lazy" alt="Отзыв ' + safeName + '"><span class="review-zoom-tag">🔍 Увеличить</span>')
          : ('<div class="review-empty-placeholder">Скриншот переписки #' + (idx + 1) + '<br><small>Загрузите в панели управления</small></div>'),
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');

    var prismMount = document.getElementById('reviewsPrism');
    if (prismMount) rebuildPrismWidget(prismMount, container);
  }

  function rebuildPrismWidget(mount, src) {
    var cards = Array.prototype.slice.call(src.children);
    var n = cards.length;
    if (n < 2) return;
    var idx = 0, drag = 0, w = 0, cw = 0, R = 0, step = 0;
    mount.innerHTML = '<div class="prism-scene"><div class="prism-box"></div></div><div class="c-nav"><button class="c-arr" aria-label="Назад">‹</button><div class="c-dots">' + cards.map(function () { return '<i></i>'; }).join('') + '</div><button class="c-arr" aria-label="Вперёд">›</button></div>';
    var scene = mount.querySelector('.prism-scene'), box = mount.querySelector('.prism-box');
    var faces = cards.map(function (c) {
      var f = document.createElement('div');
      f.className = 'prism-face';
      f.appendChild(c.cloneNode(true));
      box.appendChild(f);
      f._d = null; f._r = 0;
      return f;
    });
    function wrap(d) { return (((d + n / 2) % n) + n) % n - n / 2; }
    function paint(anim) {
      var pos = idx + drag;
      faces.forEach(function (f, i) {
        var d = wrap(i - pos), a = Math.abs(d);
        var jump = f._d !== null && Math.abs(d - f._d) > n / 2 + 0.01;
        f._d = d; f._r = Math.round(d);
        f.style.transition = anim ? (jump ? 'transform 0s, opacity .9s' : '') : 'none';
        f.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (d * step) + 'deg) translateZ(' + R + 'px)';
        f.style.opacity = a <= 1 ? 1 : Math.max(0, 2 - a);
        f.style.setProperty('--sh', (Math.min(1, a) * 0.55).toFixed(3));
        f.style.pointerEvents = a > 1.3 ? 'none' : '';
      });
      var cur = ((idx % n) + n) % n;
      mount.querySelectorAll('.c-dots i').forEach(function (dot, j) { dot.classList.toggle('on', j === cur); });
    }
    function layout() {
      w = scene.clientWidth; if (!w) return;
      var desk = w > 720;
      cw = desk ? Math.min(420, w * 0.38) : Math.min(w * 0.8, 325);
      step = desk ? 40 : 44;
      R = (cw / 2) / Math.tan(step * Math.PI / 360) * 1.02;
      scene.style.perspective = Math.round(cw * (desk ? 3.4 : 3)) + 'px';
      faces.forEach(function (f) { f.style.width = cw + 'px'; f.style.marginLeft = (-cw / 2) + 'px'; f.style.height = ''; f._d = null; });
      var h = Math.max.apply(null, faces.map(function (f) { return f.offsetHeight; }));
      scene.style.height = h + 'px';
      faces.forEach(function (f) { f.style.height = h + 'px'; });
      paint(false);
    }
    var arr = mount.querySelectorAll('.c-arr');
    arr[0].onclick = function () { idx--; drag = 0; paint(true); };
    arr[1].onclick = function () { idx++; drag = 0; paint(true); };
    var sx = 0, down = false, moving = false;
    scene.addEventListener('pointerdown', function (e) { down = true; moving = false; sx = e.clientX; });
    scene.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moving && Math.abs(dx) > 6) moving = true;
      if (moving) { drag = Math.max(-1, Math.min(1, -dx / (cw * 0.7))); paint(false); }
    });
    scene.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      if (moving) { var dx = e.clientX - sx; if (Math.abs(dx) > cw * 0.14) idx += dx < 0 ? 1 : -1; drag = 0; paint(true); }
      moving = false;
    });
    window.addEventListener('resize', layout);
    setTimeout(layout, 60);
  }

  // ==========================================================================
  // 9. ВЕЕРНАЯ 3D-КАРУСЕЛЬ (FAN DECK)
  // ==========================================================================
  function buildFanDeckCarousel(containerId, hidePrismId) {
    var src = document.getElementById(containerId);
    if (!src) return;
    if (hidePrismId) {
      var pr = document.getElementById(hidePrismId);
      if (pr) pr.style.setProperty('display', 'none', 'important');
    }
    src.style.setProperty('display', 'none', 'important');
    var cards = Array.prototype.slice.call(src.children);
    if (!cards.length) return;

    var existing = document.getElementById(containerId + '_fandeck');
    if (existing) existing.remove();

    var wrap = document.createElement('div');
    wrap.className = 'fandeck-wrap';
    wrap.id = containerId + '_fandeck';
    wrap.innerHTML = [
      '<div class="fandeck-stage"></div>',
      '<div class="c-nav">',
      '  <button class="c-arr" type="button" aria-label="Назад">‹</button>',
      '  <div class="c-dots">' + cards.map(function () { return '<i></i>'; }).join('') + '</div>',
      '  <button class="c-arr" type="button" aria-label="Вперёд">›</button>',
      '</div>'
    ].join('');
    src.insertAdjacentElement('afterend', wrap);

    var stage = wrap.querySelector('.fandeck-stage');
    var n = cards.length;
    var active = 0;

    var items = cards.map(function (c, i) {
      var item = document.createElement('div');
      item.className = 'fandeck-item';
      item.appendChild(c.cloneNode(true));
      item.onclick = function () { if (active !== i) { active = i; renderDeck(); } };
      stage.appendChild(item);
      return item;
    });

    function renderDeck() {
      var isMobile = window.innerWidth <= 720;
      var shiftX = isMobile ? 38 : 240;
      var maxH = 0;
      items.forEach(function (el, i) {
        var h = el.offsetHeight;
        if (h > maxH) maxH = h;
        var diff = i - active;
        if (diff > n / 2) diff -= n;
        if (diff < -n / 2) diff += n;
        var abs = Math.abs(diff);

        if (abs === 0) {
          el.style.transform = 'translate3d(0, 0, 60px) rotateZ(0deg) rotateY(0deg) scale(1)';
          el.style.opacity = '1';
          el.style.zIndex = '10';
          el.style.boxShadow = '0 26px 54px rgba(63,41,27,0.20)';
        } else if (abs === 1) {
          var dir = diff > 0 ? 1 : -1;
          el.style.transform = 'translate3d(' + (dir * shiftX) + 'px, 14px, -40px) rotateZ(' + (dir * 4.5) + 'deg) rotateY(' + (-dir * 14) + 'deg) scale(0.91)';
          el.style.opacity = isMobile ? '0.45' : '0.82';
          el.style.zIndex = '6';
          el.style.boxShadow = '0 14px 30px rgba(63,41,27,0.12)';
        } else {
          var dir2 = diff > 0 ? 1 : -1;
          el.style.transform = 'translate3d(' + (dir2 * shiftX * 1.5) + 'px, 28px, -120px) rotateZ(' + (dir2 * 8) + 'deg) scale(0.82)';
          el.style.opacity = '0';
          el.style.zIndex = '2';
          el.style.boxShadow = 'none';
        }
      });
      if (maxH > 120) stage.style.height = (maxH + 28) + 'px';
      wrap.querySelectorAll('.c-dots i').forEach(function (d, idx) { d.classList.toggle('on', idx === active); });
    }

    var btns = wrap.querySelectorAll('.c-arr');
    btns[0].onclick = function () { active = (active - 1 + n) % n; renderDeck(); };
    btns[1].onclick = function () { active = (active + 1) % n; renderDeck(); };

    var startX = 0, dragging = false;
    stage.addEventListener('pointerdown', function (e) { dragging = true; startX = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 36) {
        active = dx < 0 ? (active + 1) % n : (active - 1 + n) % n;
        renderDeck();
      }
    });
    window.addEventListener('resize', renderDeck);
    setTimeout(renderDeck, 80);
  }

  // ==========================================================================
  // 10. КОНТЕЙНЕР 3D LUSION С ОБНОВЛЁННЫМИ ТЕКСТАМИ (СЦЕНА В ШАГЕ 3 — lusion3d.js)
  // ==========================================================================
  function ensureLusionSection() {
    var sec = document.getElementById('lusionSection');
    if (!sec) {
      var hero = document.querySelector('.hero');
      if (!hero) return;
      sec = document.createElement('section');
      sec.className = 'lusion-sec';
      sec.id = 'lusionSection';
      sec.innerHTML = [
        '<div class="container">',
        '  <div class="lusion-card">',
        '    <canvas class="lusion-canvas" id="lusionCanvas"></canvas>',
        '    <div class="lusion-info">',
        '      <span class="eyebrow">Эстетика движения • 3D</span>',
        '      <h3>Твоя форма рождается из <i>баланса</i></h3>',
        '      <p>Проведи курсором сквозь невесомость:\n«тренировки, питание и восстановление — работают в единой системе»</p>',
        '    </div>',
        '    <span class="lusion-hint">✦ Интерактивная 3D-сцена</span>',
        '  </div>',
        '</div>'
      ].join('');
      hero.insertAdjacentElement('afterend', sec);
    }

    if (typeof window.initNastyaLusion3D === 'function') {
      window.initNastyaLusion3D();
    }
  }

  // ==========================================================================
  // 11. ЮРИДИЧЕСКАЯ УПАКОВКА И ЯНДЕКС ФОРМЫ
  // ==========================================================================
  var DEFAULT_PRIVACY = [
    '1. ОБЩИЕ ПОЛОЖЕНИЯ',
    'Настоящая Политика обработки персональных данных составлена в соответствии с Федеральным законом РФ от 27.07.2006 № 152-ФЗ «О персональных данных».',
    'Оператором персональных данных является плательщик налога на профессиональный доход (самозанятая) Парфенова Анастасия.',
    '',
    '2. ДАННЫЕ И ЦЕЛИ ОБРАБОТКИ',
    '• Имя, телефон или ник в мессенджере Telegram / WhatsApp — для обратной связи и записи на занятия;',
    '• Технические файлы cookie — для корректной работы сайта.'
  ].join('\n');

  var DEFAULT_OFFER = [
    'ПУБЛИЧНАЯ ОФЕРТА НА ОКАЗАНИЕ ОНЛАЙН-УСЛУГ ПО ФИТНЕС-СОПРОВОЖДЕНИЮ',
    '',
    'Исполнитель: плательщик НПД (самозанятая, ФЗ № 422-ФЗ) Парфенова Анастасия.',
    'После оплаты выбранного на сайте тарифа Исполнитель формирует официальный чек в приложении ФНС «Мой налог».'
  ].join('\n');

  window.openLegalModal = function (kind) {
    var modal = document.getElementById('nastyaLegalModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.id = 'nastyaLegalModal';
      modal.innerHTML = [
        '<div class="modal-box legal-modal-box">',
        '  <button class="modal-close" type="button" onclick="document.getElementById(\'nastyaLegalModal\').classList.remove(\'open\')">✕</button>',
        '  <span class="eyebrow">Юридическая информация</span>',
        '  <h3 id="legalModalHeading" style="font-size:1.75rem;"></h3>',
        '  <div class="legal-modal-body" id="legalModalText"></div>',
        '</div>'
      ].join('');
      modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });
      document.body.appendChild(modal);
    }
    var st = window.SITE_SETTINGS || {};
    document.getElementById('legalModalHeading').textContent = kind === 'offer'
      ? 'Пользовательское соглашение (Публичная оферта)'
      : 'Политика конфиденциальности и обработки ПДн';
    document.getElementById('legalModalText').textContent = kind === 'offer'
      ? (st.legalOffer || DEFAULT_OFFER)
      : (st.legalPrivacy || DEFAULT_PRIVACY);
    modal.classList.add('open');
  };

  function setupLegalAndCookies() {
    var st = window.SITE_SETTINGS || {};
    var fio = st.legalFio || 'Парфенова Анастасия';
    var inn = st.legalInn || 'уточняется при оформлении чека в «Мой налог»';

    var legalLinks = document.querySelectorAll('.footer-legal a');
    if (legalLinks.length >= 2) {
      legalLinks[0].href = 'javascript:void(0)';
      legalLinks[0].onclick = function (e) { e.preventDefault(); window.openLegalModal('privacy'); };
      legalLinks[1].href = 'javascript:void(0)';
      legalLinks[1].onclick = function (e) { e.preventDefault(); window.openLegalModal('offer'); };
    }

    var footerContainer = document.querySelector('footer .container');
    if (footerContainer && !footerContainer.querySelector('.footer-selfemployed')) {
      var info = document.createElement('div');
      info.className = 'footer-selfemployed';
      info.innerHTML = 'Услуги оказывает плательщик налога на профессиональный доход (самозанятая): ' + fio + ' (ИНН: ' + inn + ').<br>* Социальная сеть Instagram принадлежит компании Meta Platforms Inc., деятельность которой признана экстремистской и запрещена на территории РФ.';
      footerContainer.appendChild(info);
    }

    document.querySelectorAll('#contacts form, #bookingModal form').forEach(function (f) {
      if (f.querySelector('.legal-check-row')) return;
      var note = f.querySelector('.form-note');
      if (note) note.style.display = 'none';
      var btn = f.querySelector('button[type="submit"]');
      var row = document.createElement('label');
      row.className = 'legal-check-row';
      row.innerHTML = '<input type="checkbox" required checked><span>Я соглашаюсь с <a onclick="openLegalModal(\'privacy\'); return false;">Политикой обработки персональных данных</a> и условиями <a onclick="openLegalModal(\'offer\'); return false;">Публичной оферты</a>.</span>';
      if (btn) btn.insertAdjacentElement('beforebegin', row);
      else f.appendChild(row);
    });

    try {
      if (!localStorage.getItem('nastya_cookie_ok') && !document.getElementById('nastyaCookieBar')) {
        var bar = document.createElement('div');
        bar.className = 'cookie-float';
        bar.id = 'nastyaCookieBar';
        bar.innerHTML = '<div>Сайт использует файлы cookie в соответствии с <a onclick="openLegalModal(\'privacy\')">Политикой конфиденциальности</a>.</div><button type="button" class="cookie-btn" onclick="localStorage.setItem(\'nastya_cookie_ok\',\'1\'); this.parentElement.remove();">Принять</button>';
        document.body.appendChild(bar);
      }
    } catch (e) {}
  }

  function hookYandexForms() {
    var origSubmit = window.handleFormSubmit;
    if (!origSubmit || origSubmit._hooked) return;
    window.handleFormSubmit = async function (e) {
      var form = e.target;
      var st = window.SITE_SETTINGS || {};
      var yaUrl = (st.yandexFormUrl || '').trim();
      if (yaUrl) {
        try {
          var fd = new FormData();
          form.querySelectorAll('.form-group').forEach(function (g) {
            var l = g.querySelector('.form-label'), c = g.querySelector('input,select,textarea');
            if (l && c) fd.append(l.textContent.trim(), c.value.trim());
          });
          fetch(yaUrl, { method: 'POST', body: fd, mode: 'no-cors' }).catch(function () {});
        } catch (err) {}
      }
      return origSubmit.apply(this, arguments);
    };
    window.handleFormSubmit._hooked = true;
  }

  // ==========================================================================
  // 12. РЕГИСТРАЦИЯ ПОЛЕЙ ДЛЯ ПАНЕЛИ УПРАВЛЕНИЯ (ADMIN.HTML)
  // ==========================================================================
  function registerAdminConfig() {
    if (!window.SITE_EDIT) return;
    window.SITE_EDIT.lists = window.SITE_EDIT.lists || {};
    window.SITE_EDIT.lists.certs = 'Образование (Диплом и Сертификат)';

    window.SITE_EDIT.photoSlots = window.SITE_EDIT.photoSlots || {};
    delete window.SITE_EDIT.photoSlots['cert-3'];
    delete window.SITE_EDIT.photoSlots['cert-4'];
    window.SITE_EDIT.photoSlots['cert-1'] = { label: 'Фото диплома (Образование №1)', hint: 'текст над фото редактируется в разделе Образование' };
    window.SITE_EDIT.photoSlots['cert-2'] = { label: 'Фото сертификата (Образование №2)', hint: 'текст над фото редактируется в разделе Образование' };

    var extraSettings = [
      { key: 'yandexFormUrl', kind: 'plain', label: 'Ссылка на Яндекс Форму (необязательно)', def: '' },
      { key: 'legalFio', kind: 'plain', label: 'ФИО самозанятой (в подвале и оферте)', def: 'Парфенова Анастасия' },
      { key: 'legalInn', kind: 'plain', label: 'ИНН самозанятой', def: 'уточняется при оформлении чека' },
      { key: 'floatAmp', kind: 'plain', label: 'Амплитуда парения фото Насти на ПК (например 7px)', def: '7px' },
      { key: 'reliefOpacity', kind: 'plain', label: 'Заметность 15 фоновых барельефов (от 0.10 до 0.45)', def: '0.28' }
    ];
    window.SITE_EDIT.settings = window.SITE_EDIT.settings || [];
    extraSettings.forEach(function (es) {
      if (!window.SITE_EDIT.settings.some(function (x) { return x.key === es.key; })) {
        window.SITE_EDIT.settings.push(es);
      }
    });

    var o = (window.SITE_OVERRIDES || {}).settings || {};
    window.SITE_SETTINGS = window.SITE_SETTINGS || {};
    window.SITE_EDIT.settings.forEach(function (s) {
      window.SITE_SETTINGS[s.key] = (o[s.key] != null && o[s.key] !== '') ? o[s.key] : s.def;
    });

    var root = document.documentElement;
    if (window.SITE_SETTINGS.floatAmp) root.style.setProperty('--float-amp', window.SITE_SETTINGS.floatAmp);
    if (window.SITE_SETTINGS.reliefOpacity) root.style.setProperty('--relief-opacity', window.SITE_SETTINGS.reliefOpacity);

    var d = (window.SITE_OVERRIDES || {}).design || {};
    Object.keys(d).forEach(function (cssVar) {
      if (d[cssVar]) root.style.setProperty(cssVar, d[cssVar]);
    });
  }

  // ==========================================================================
  // 13. ЗАПУСК ВСЕХ ПАТЧЕЙ
  // ==========================================================================
  function initAllPatches() {
    registerAdminConfig();
    syncAllPhotos();
    cleanCasesAndAbout();
    ensureLusionSection();
    if (typeof window.initNastyaReliefs === 'function') window.initNastyaReliefs();
    normalizeServicesAndSwipeBar();
    syncFormPrices();
    rebuildPhotoReviews();
    setupCertificateScans();
    replaceAllGiftIcons();
    buildFanDeckCarousel('approachContainer', null);
    buildFanDeckCarousel('stepsContainer', 'stepsPrism');
    setupLegalAndCookies();
    hookYandexForms();
  }

  window.SITE_AFTER_OVERRIDES = initAllPatches;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initAllPatches, 40); });
  } else {
    setTimeout(initAllPatches, 40);
  }
})();

/* === STEP 4 PIXEL DESIGN CONTROLS === */
(function applyPixelDesignVars() {
  var st = document.createElement('style');
  st.id = 'nastya-pixel-controls-css';
  st.textContent = [
    'html { font-size: var(--font-base-px, 16px) !important; }',
    'header { background: var(--header-bg, rgba(54, 34, 21, 0.96)) !important; }',
    '.goals-sec, .cases-sec, .reviews-sec, .about-sec, .approach-sec, .services-sec, .steps-sec, .faq-sec, .cta-sec {',
    '  padding-top: var(--sec-pad-desk, 92px) !important;',
    '  padding-bottom: var(--sec-pad-desk, 92px) !important;',
    '}',
    '@media (max-width: 720px) {',
    '  .goals-sec, .cases-sec, .reviews-sec, .about-sec, .approach-sec, .services-sec, .steps-sec, .faq-sec, .cta-sec {',
    '    padding-top: var(--sec-pad-mob, 44px) !important;',
    '    padding-bottom: var(--sec-pad-mob, 44px) !important;',
    '  }',
    '  .hero-visual { min-height: var(--hero-photo-mob-h, 440px) !important; }',
    '  .lusion-card { height: var(--lusion-h-mob, 390px) !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(st);

  var d = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.design) || {};
  var root = document.documentElement;
  Object.keys(d).forEach(function (k) {
    if (d[k] != null && d[k] !== '') root.style.setProperty(k, d[k]);
  });
})();
