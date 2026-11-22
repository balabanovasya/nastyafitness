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
    '  background: #3F291B !important;',
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
    '  object-position: 50% 60%;',
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
    '  opacity: var(--relief-strength, 0.92);',
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
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNzUwIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0iI0Y3RUZFNCIvPjxyZWN0IHg9IjI0IiB5PSIyNCIgd2lkdGg9IjU1MiIgaGVpZ2h0PSI3MDIiIHJ4PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzk5MDRFIiBzdHJva2Utb3BhY2l0eT0iMC4zNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNzUwIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0iI0Y3RUZFNCIvPjxyZWN0IHg9IjI0IiB5PSIyNCIgd2lkdGg9IjU1MiIgaGVpZ2h0PSI3MDIiIHJ4PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzk5MDRFIiBzdHJva2Utb3BhY2l0eT0iMC4zNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'
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
  // 11. ЮРИДИЧЕСКАЯ УПАКОВКА РФ (152-ФЗ С 01.09.2025, 422-ФЗ, ЗоЗПП, META)
  // ==========================================================================
  var LEGAL_DEFAULTS = {
    fio: 'Парфенова Анастасия Сергеевна',
    inn: '632512011220',
    email: 'fitness.nastya@mail.ru',
    phone: '8 (937) 791-32-53',
    site: 'https://anastasia-fitness.ru'
  };

  function injectStep2LegalCSS() {
    if (document.getElementById('nastya-step2-legal-css')) return;
    var st = document.createElement('style');
    st.id = 'nastya-step2-legal-css';
    st.textContent = [
      '/* Две отдельные аккуратные галочки согласия (ПК + Телефон) */',
      '.legal-check-row {',
      '  display: flex !important;',
      '  align-items: flex-start !important;',
      '  gap: 10px !important;',
      '  margin: 8px 0 6px 0 !important;',
      '  font-size: 0.78rem !important;',
      '  line-height: 1.45 !important;',
      '  color: rgba(63, 41, 27, 0.86) !important;',
      '  text-align: left !important;',
      '  cursor: pointer !important;',
      '  user-select: none;',
      '}',
      '.legal-check-row + .legal-check-row { margin-top: 4px !important; margin-bottom: 14px !important; }',
      '.legal-check-row input[type="checkbox"] {',
      '  flex: 0 0 18px !important;',
      '  width: 18px !important;',
      '  height: 18px !important;',
      '  margin: 2px 0 0 0 !important;',
      '  accent-color: #3F291B !important;',
      '  cursor: pointer !important;',
      '}',
      '.legal-check-row a {',
      '  color: #7A471E !important;',
      '  text-decoration: underline !important;',
      '  text-underline-offset: 2px !important;',
      '  font-weight: 600 !important;',
      '  cursor: pointer !important;',
      '}',
      '.legal-check-row a:hover { color: #3F291B !important; }',
      '',
      '/* Статус заявки и кнопки перехода в Telegram / копирования */',
      '.form-status {',
      '  margin-top: 14px !important;',
      '  padding: 14px 16px !important;',
      '  border-radius: 16px !important;',
      '  font-size: 0.84rem !important;',
      '  line-height: 1.48 !important;',
      '  text-align: left !important;',
      '}',
      '.form-status.ok {',
      '  background: rgba(246, 236, 222, 0.92) !important;',
      '  border: 1px solid rgba(201, 144, 78, 0.55) !important;',
      '  color: #3F291B !important;',
      '}',
      '.form-status.err {',
      '  background: rgba(196, 72, 54, 0.10) !important;',
      '  border: 1px solid rgba(196, 72, 54, 0.36) !important;',
      '  color: #8C2318 !important;',
      '}',
      '.tg-status-actions {',
      '  display: flex !important;',
      '  flex-wrap: wrap !important;',
      '  gap: 8px !important;',
      '  margin-top: 10px !important;',
      '}',
      '.tg-action-primary {',
      '  display: inline-flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  padding: 9px 16px !important;',
      '  border-radius: 999px !important;',
      '  background: linear-gradient(135deg, #4A2F20 0%, #3F291B 100%) !important;',
      '  color: #FFFBF5 !important;',
      '  font-weight: 600 !important;',
      '  font-size: 0.80rem !important;',
      '  text-decoration: none !important;',
      '  box-shadow: 0 6px 14px rgba(63, 41, 27, 0.18) !important;',
      '}',
      '.tg-action-secondary {',
      '  display: inline-flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  padding: 9px 14px !important;',
      '  border-radius: 999px !important;',
      '  background: #FFFDF9 !important;',
      '  border: 1px solid rgba(63, 41, 27, 0.28) !important;',
      '  color: #3F291B !important;',
      '  font-family: inherit !important;',
      '  font-weight: 600 !important;',
      '  font-size: 0.80rem !important;',
      '  cursor: pointer !important;',
      '}',
      '',
      '/* Подвал: 3 ссылки документов и реквизиты самозанятой */',
      '.footer-legal {',
      '  display: flex !important;',
      '  flex-wrap: wrap !important;',
      '  justify-content: center !important;',
      '  gap: 10px 22px !important;',
      '}',
      '.footer-selfemployed {',
      '  margin-top: 16px !important;',
      '  padding-top: 14px !important;',
      '  border-top: 1px solid rgba(246, 217, 168, 0.16) !important;',
      '  font-size: 0.74rem !important;',
      '  line-height: 1.55 !important;',
      '  opacity: 0.82;',
      '  text-align: center;',
      '}',
      '',
      '/* Модалка юридических документов (удобный скролл на телефоне и ПК) */',
      '.legal-modal-box {',
      '  width: min(700px, 94vw) !important;',
      '  max-height: 88vh !important;',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  overflow: hidden !important;',
      '}',
      '.legal-modal-body {',
      '  overflow-y: auto !important;',
      '  -webkit-overflow-scrolling: touch;',
      '  white-space: pre-wrap !important;',
      '  font-size: 0.86rem !important;',
      '  line-height: 1.58 !important;',
      '  padding-right: 6px !important;',
      '  margin-top: 12px !important;',
      '  color: #3F291B;',
      '}',
      '@media (max-width: 720px) {',
      '  .legal-check-row { font-size: 0.75rem !important; gap: 9px !important; }',
      '  .tg-status-actions { flex-direction: column !important; }',
      '  .tg-action-primary, .tg-action-secondary { width: 100% !important; min-height: 42px !important; }',
      '  .footer-legal { gap: 8px 16px !important; font-size: 0.78rem !important; }',
      '  .footer-selfemployed { font-size: 0.71rem !important; }',
      '  .legal-modal-box { padding: 22px 18px !important; max-height: 86vh !important; }',
      '  .legal-modal-body { font-size: 0.81rem !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function getLegalRequisites() {
    var st = window.SITE_SETTINGS || {};
    var fio = (st.legalFio && st.legalFio.trim() && st.legalFio.trim() !== 'Парфенова Анастасия')
      ? st.legalFio.trim()
      : LEGAL_DEFAULTS.fio;
    var inn = (st.legalInn && st.legalInn.trim() && st.legalInn.indexOf('уточн') < 0)
      ? st.legalInn.trim()
      : LEGAL_DEFAULTS.inn;
    var email = (st.leadEmail && st.leadEmail.trim() && st.leadEmail.indexOf('gmail.com') < 0)
      ? st.leadEmail.trim()
      : LEGAL_DEFAULTS.email;
    return {
      fio: fio,
      inn: inn,
      email: email,
      phone: (st.phone && st.phone.trim()) || LEGAL_DEFAULTS.phone,
      site: LEGAL_DEFAULTS.site
    };
  }

  function buildDefaultPrivacy(r) {
    return [
      'ПОЛИТИКА ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ',
      'Редакция от 22.11.2026 | Сайт: ' + r.site,
      '',
      '1. ОБЩИЕ ПОЛОЖЕНИЯ И ОПЕРАТОР ПДН',
      'Настоящая Политика разработана в соответствии с Федеральным законом РФ от 27.07.2006 № 152-ФЗ «О персональных данных» (ст. 18.1) и определяет порядок обработки и меры по защите персональных данных посетителей сайта ' + r.site + '.',
      'Оператор персональных данных: физическое лицо, плательщик налога на профессиональный доход (самозанятая, 422-ФЗ) ' + r.fio + ', ИНН ' + r.inn + ', контактный e-mail: ' + r.email + '.',
      '',
      '2. СОСТАВ ОБРАБАТЫВАЕМЫХ ДАННЫХ',
      'Оператор обрабатывает исключительно общие персональные данные, добровольно предоставленные Пользователем: имя, контактные данные (номер телефона, никнейм в Telegram, e-mail при указании), выбранный формат работы.',
      'ЗАПРЕТ НА СПЕЦИАЛЬНЫЕ КАТЕГОРИИ ПДН: сайт НЕ собирает сведения о состоянии здоровья, диагнозах, травмах и биометрические данные. Пользователям прямо запрещается вносить сведения о состоянии здоровья в формы на сайте.',
      'На сайте используются только технические файлы cookie (и локальное хранилище браузера) для корректной работы интерфейса — без сторонних рекламных трекеров и зарубежной аналитики.',
      '',
      '3. ЦЕЛИ И ПРАВОВЫЕ ОСНОВАНИЯ',
      '• Цель: обработка обращений и заявок, обратная связь, консультирование, заключение и исполнение договора (Публичной оферты) на оказание дистанционных физкультурно-оздоровительных и консультационных услуг.',
      '• Правовые основания: ст. 6 152-ФЗ — отдельное Согласие субъекта персональных данных, а также заключение и исполнение договора по инициативе субъекта ПДн.',
      '',
      '4. ЛОКАЛИЗАЦИЯ В РФ И ПЕРЕЧЕНЬ ДЕЙСТВИЙ',
      '• Сайт и все его ресурсы (шрифты, скрипты, изображения) размещены на территории Российской Федерации (ЦОД ООО «Яндекс.Облако», РФ). При заполнении формы сайт не передаёт данные через зарубежные почтовые или формулярные шлюзы — браузер формирует сообщение для прямой отправки самим Пользователем в мессенджер Telegram.',
      '• Перечень действий с ПДн: сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, блокирование, удаление, уничтожение.',
      '• Персональные данные не передаются третьим лицам, за исключением случаев, прямо предусмотренных законом РФ.',
      '',
      '5. СРОКИ ХРАНЕНИЯ И ОТЗЫВ СОГЛАСИЯ',
      'Персональные данные хранятся до достижения целей обработки либо до отзыва согласия Пользователем, но не более 3 (трёх) лет с момента последнего взаимодействия.',
      'Пользователь вправе в любой момент запросить уточнение, блокирование, уничтожение своих данных или отозвать согласие, направив обращение на e-mail: ' + r.email + ' с темой «Отзыв согласия на обработку ПДн». Обработка прекращается в срок не более 10 (десяти) рабочих дней.'
    ].join('\n');
  }

  function buildDefaultConsent(r) {
    return [
      'СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ',
      '(самостоятельный документ в соответствии со ст. 9 Федерального закона № 152-ФЗ в редакции от 01.09.2025)',
      '',
      'Я, действуя свободно, своей волей и в своём интересе, подтверждая свою дееспособность, даю конкретное, предметное, информированное, сознательное и однозначное согласие Оператору персональных данных:',
      '• Оператор: физическое лицо, плательщик НПД (самозанятая, 422-ФЗ) ' + r.fio + ', ИНН ' + r.inn + ', e-mail: ' + r.email + ', сайт: ' + r.site + '.',
      '',
      '1. ПЕРЕЧЕНЬ ПЕРСОНАЛЬНЫХ ДАННЫХ',
      'Имя, номер телефона, имя пользователя (никнейм) в Telegram, адрес электронной почты (при предоставлении), сведения о выбранном формате фитнес-услуг. Настоящее согласие не распространяется на специальные категории ПДн (сведения о состоянии здоровья).',
      '',
      '2. ЦЕЛЬ ОБРАБОТКИ',
      'Обработка входящего обращения/заявки с сайта ' + r.site + ', связь со мной, консультирование по форматам и стоимости услуг, запись на пробную тренировку, а также подготовка к заключению и исполнению Публичной оферты.',
      '',
      '3. ПЕРЕЧЕНЬ ДЕЙСТВИЙ И СПОСОБЫ ОБРАБОТКИ',
      'Сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, блокирование, удаление и уничтожение персональных данных с использованием средств автоматизации и без их использования.',
      '',
      '4. СРОК ДЕЙСТВИЯ И ПОРЯДОК ОТЗЫВА',
      'Согласие действует до достижения целей обработки или до момента его отзыва, но не более 3 (трёх) лет. Согласие может быть отозвано в любой момент путём направления уведомления на e-mail ' + r.email + ' (обработка прекращается в срок до 10 рабочих дней).',
      'Проставление отметки (галочки) в соответствующем поле формы на сайте ' + r.site + ' подтверждает предоставление настоящего Согласия.'
    ].join('\n');
  }

  function buildDefaultOffer(r) {
    return [
      'ПУБЛИЧНАЯ ОФЕРТА НА ОКАЗАНИЕ ДИСТАНЦИОННЫХ ФИЗКУЛЬТУРНО-ОЗДОРОВИТЕЛЬНЫХ И КОНСУЛЬТАЦИОННЫХ УСЛУГ ОНЛАЙН',
      'Редакция от 22.11.2026 | Сайт: ' + r.site,
      '',
      '1. ОБЩИЕ ПОЛОЖЕНИЯ И РЕКВИЗИТЫ ИСПОЛНИТЕЛЯ',
      'Настоящий документ является официальным предложением (публичной офертой в соответствии со ст. 437 ГК РФ) физического лица, применяющего специальный налоговый режим «Налог на профессиональный доход» (самозанятая, Федеральный закон от 27.11.2018 № 422-ФЗ):',
      '• Исполнитель: ' + r.fio,
      '• ИНН: ' + r.inn,
      '• Контактный e-mail: ' + r.email + ' | Телефон: ' + r.phone,
      'Акцептом (полным и безоговорочным принятием) настоящей Оферты является оплата Заказчиком выбранного тарифа на реквизиты, согласованные с Исполнителем.',
      '',
      '2. ПРЕДМЕТ ДОГОВОРА И СПЕЦИАЛИЗАЦИЯ',
      'Исполнитель оказывает Заказчику дистанционные физкультурно-оздоровительные и консультационные услуги онлайн (индивидуальное сопровождение, занятия в мини-группе, онлайн-тренировки по видеосвязи, составление плана тренировок и рекомендаций по сбалансированному питанию, разбор техники) в объёме оплаченного тарифа, указанного на сайте ' + r.site + '.',
      'Программы Исполнителя разработаны с учётом женской физиологии и биомеханики. Исполнитель вправе отказать в заключении договора при наличии медицинских противопоказаний или несоответствии запроса Заказчика профилю программы.',
      '',
      '3. ВАЖНЫЙ МЕДИЦИНСКИЙ ДИСКЛЕЙМЕР (НЕ МЕДИЦИНСКИЕ УСЛУГИ)',
      '• Услуги Исполнителя НЕ являются медицинскими услугами, лечением, медицинской диагностикой или реабилитацией.',
      '• Заказчик самостоятельно несёт полную ответственность за состояние своего здоровья, обязан убедиться в отсутствии медицинских противопоказаний к физическим нагрузкам до старта (при необходимости — проконсультироваться с врачом) и незамедлительно сообщать Исполнителю о любом ухудшении самочувствия.',
      '• Результаты тренировок индивидуальны и зависят от физиологических особенностей, регулярности занятий, режима сна и соблюдения рекомендаций самим Заказчиком. Исполнитель не гарантирует достижение конкретных числовых показателей веса или объёмов (кг/см).',
      '',
      '4. СТОИМОСТЬ, ОПЛАТА И ЧЕКИ «МОЙ НАЛОГ»',
      'Стоимость услуг указана на сайте ' + r.site + ' в рублях РФ (НДС не облагается в связи с применением НПД по 422-ФЗ).',
      'После получения оплаты Исполнитель формирует официальный фискальный чек в приложении ФНС России «Мой налог» и направляет его Заказчику в мессенджер или на e-mail.',
      '',
      '5. ПОРЯДОК ПЕРЕНОСА ТРЕНИРОВОК',
      'Перенос согласованной онлайн-тренировки возможен по предварительному уведомлению Исполнителя не позднее чем за 12 (двенадцать) часов до назначенного времени. При отмене менее чем за 12 часов или неявке время тренера считается зарезервированным, а занятие — проведённым.',
      '',
      '6. ОТКАЗ ОТ УСЛУГ И ВОЗВРАТ ДЕНЕЖНЫХ СРЕДСТВ (СТ. 32 ЗоЗПП И СТ. 782 ГК РФ)',
      'В соответствии со ст. 32 Закона РФ «О защите прав потребителей» и ст. 782 ГК РФ Заказчик вправе в любой момент отказаться от исполнения договора, направив уведомление в мессенджер или на e-mail ' + r.email + ':',
      '• До старта оказания услуг возвращается 100% оплаченной суммы.',
      '• После старта сопровождения возврат рассчитывается пропорционально неоказанным занятиям/дням — за вычетом стоимости фактически оказанных услуг и уже составленной и переданной персональной программы.',
      '• Для разовых программ тренировок и/или питания услуга считается оказанной в полном объёме в момент передачи Заказчику готового файла/таблицы программы.',
      '• Возврат денежных средств осуществляется на реквизиты Заказчика в течение 10 (десяти) календарных дней с даты получения заявления.',
      '',
      '7. АВТОРСКИЕ ПРАВА И РАЗРЕШЕНИЕ СПОРОВ',
      'Передаваемые материалы предназначены строго для личного использования Заказчиком и не подлежат копированию, перепродаже или публикации.',
      'Споры решаются путём переговоров (срок ответа на претензию на ' + r.email + ' — 10 календарных дней), а при недостижении согласия — в порядке, установленном законодательством РФ.'
    ].join('\n');
  }

  window.openLegalModal = function (kind) {
    injectStep2LegalCSS();
    var modal = document.getElementById('nastyaLegalModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.id = 'nastyaLegalModal';
      modal.innerHTML = [
        '<div class="modal-box legal-modal-box">',
        '  <button class="modal-close" type="button" onclick="document.getElementById(\'nastyaLegalModal\').classList.remove(\'open\')">✕</button>',
        '  <span class="eyebrow">Юридическая информация</span>',
        '  <h3 id="legalModalHeading" style="font-size:1.55rem; margin-bottom:4px;"></h3>',
        '  <div class="legal-modal-body" id="legalModalText"></div>',
        '</div>'
      ].join('');
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('open');
      });
      document.body.appendChild(modal);
    }

    var st = window.SITE_SETTINGS || {};
    var req = getLegalRequisites();
    var heading = 'Политика обработки персональных данных';
    var body = (st.legalPrivacy && st.legalPrivacy.trim()) ? st.legalPrivacy : buildDefaultPrivacy(req);

    if (kind === 'consent') {
      heading = 'Согласие на обработку персональных данных';
      body = (st.legalConsent && st.legalConsent.trim()) ? st.legalConsent : buildDefaultConsent(req);
    } else if (kind === 'offer') {
      heading = 'Публичная оферта на оказание онлайн-услуг';
      body = (st.legalOffer && st.legalOffer.trim()) ? st.legalOffer : buildDefaultOffer(req);
    }

    document.getElementById('legalModalHeading').textContent = heading;
    document.getElementById('legalModalText').textContent = body;
    modal.classList.add('open');
  };

  function setupLegalAndCookies() {
    injectStep2LegalCSS();
    var req = getLegalRequisites();

    // 1. Три отдельные ссылки документов в подвале (.footer-legal)
    var legalWrap = document.querySelector('.footer-legal');
    if (legalWrap) {
      legalWrap.innerHTML = [
        '<a href="javascript:void(0)" onclick="openLegalModal(\'privacy\'); return false;">Политика обработки ПДн</a>',
        '<a href="javascript:void(0)" onclick="openLegalModal(\'consent\'); return false;">Согласие на обработку ПДн</a>',
        '<a href="javascript:void(0)" onclick="openLegalModal(\'offer\'); return false;">Публичная оферта</a>'
      ].join('');
    }

    // 2. Реквизиты самозанятой и обязательная сноска Meta/Instagram* в подвале
    var footerContainer = document.querySelector('footer .container');
    if (footerContainer) {
      footerContainer.querySelectorAll('.footer-selfemployed').forEach(function (el) { el.remove(); });
      var info = document.createElement('div');
      info.className = 'footer-selfemployed';
      info.innerHTML =
        'Услуги оказывает плательщик налога на профессиональный доход (самозанятая, 422-ФЗ): ' +
        req.fio + ' (ИНН: ' + req.inn + ', e-mail: <a href="mailto:' + req.email + '" style="text-decoration:underline;color:inherit;">' + req.email + '</a>). ' +
        'Услуги не являются медицинскими.<br>' +
        '* Instagram — продукт компании Meta Platforms Inc., деятельность которой признана экстремистской и запрещена на территории РФ.';
      footerContainer.appendChild(info);
    }

    // 3. Два отдельных НЕпроставленных чекбокса в обеих формах (без checked!)
    document.querySelectorAll('#contacts form, #bookingModal form').forEach(function (f) {
      f.querySelectorAll('.legal-check-row').forEach(function (old) { old.remove(); });
      var note = f.querySelector('.form-note');
      if (note) note.style.display = 'none';
      var btn = f.querySelector('button[type="submit"]');

      var row1 = document.createElement('label');
      row1.className = 'legal-check-row';
      row1.innerHTML =
        '<input type="checkbox" name="consent_pdn" required>' +
        '<span>Даю отдельное <a href="javascript:void(0)" onclick="openLegalModal(\'consent\'); return false;">Согласие на обработку персональных данных</a> в соответствии с <a href="javascript:void(0)" onclick="openLegalModal(\'privacy\'); return false;">Политикой обработки ПДн</a>.</span>';

      var row2 = document.createElement('label');
      row2.className = 'legal-check-row';
      row2.innerHTML =
        '<input type="checkbox" name="consent_offer" required>' +
        '<span>Ознакомлена и согласна с условиями <a href="javascript:void(0)" onclick="openLegalModal(\'offer\'); return false;">Публичной оферты</a> (включая отсутствие медицинских противопоказаний).</span>';

      if (btn) {
        btn.insertAdjacentElement('beforebegin', row1);
        btn.insertAdjacentElement('beforebegin', row2);
      } else {
        f.appendChild(row1);
        f.appendChild(row2);
      }
    });

    // 4. Уточнённый Cookie-баннер (только технические cookie)
    try {
      if (!localStorage.getItem('nastya_cookie_ok') && !document.getElementById('nastyaCookieBar')) {
        var bar = document.createElement('div');
        bar.className = 'cookie-float';
        bar.id = 'nastyaCookieBar';
        bar.innerHTML =
          '<div>Сайт использует только технические файлы cookie для корректной работы интерфейса (<a href="javascript:void(0)" onclick="openLegalModal(\'privacy\'); return false;">Политика обработки ПДн</a>).</div>' +
          '<button type="button" class="cookie-btn" onclick="localStorage.setItem(\'nastya_cookie_ok\',\'1\'); this.parentElement.remove();">Понятно</button>';
        document.body.appendChild(bar);
      }
    } catch (e) {}
  }

  function hookYandexForms() {
    // Заявки работают напрямую в Telegram по инициативе клиента (без formsubmit.co и Яндекс Форм).
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
      { key: 'yandexFormUrl', kind: 'plain', label: 'Ссылка на Яндекс Форму (отключено — заявки идут в Telegram)', def: '' },
      { key: 'legalFio', kind: 'plain', label: 'ФИО самозанятой (в подвале и оферте)', def: 'Парфенова Анастасия Сергеевна' },
      { key: 'legalInn', kind: 'plain', label: 'ИНН самозанятой', def: '632512011220' },
      { key: 'floatAmp', kind: 'plain', label: 'Амплитуда парения фото Насти на ПК (например 7px)', def: '7px' },
      { key: 'reliefOpacity', kind: 'plain', label: 'Заметность 15 фоновых барельефов (от 0.10 до 0.45)', def: '0.92' }
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
    'header { background: var(--header-bg, linear-gradient(160deg, #3F291B 0%, #2A1A10 100%)) !important; }',
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
/* === FIX 03: БЛОК 1 (ФОТО +8-10%, РАВНЫЕ КНОПКИ, HD МИНИ-ГАНТЕЛЬКА В РАЗМЕР БУКВ) === */
(function applyFix03Hero() {
  var old = document.getElementById('nastya-fix03-hero-css');
  if (old) old.remove();

  var st = document.createElement('style');
  st.id = 'nastya-fix03-hero-css';
  st.textContent = [
    '/* 1. Главное фото +8–10% крупнее на ПК и мобильном */',
    '.hero-grid {',
    '  grid-template-columns: 0.98fr 1.04fr !important;',
    '  gap: 44px !important;',
    '}',
    '.hero-visual {',
    '  aspect-ratio: 4 / 5.05 !important;',
    '  width: 100% !important;',
    '  transform-origin: center center;',
    '}',
    '@media (max-width: 1024px) {',
    '  .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }',
    '}',
    '@media (max-width: 720px) {',
    '  .hero-visual {',
    '    aspect-ratio: 3 / 4.55 !important;',
    '    min-height: var(--hero-photo-mob-h, 485px) !important;',
    '    height: auto !important;',
    '    border-radius: 26px !important;',
    '  }',
    '  .hero-visual img {',
    '    min-height: var(--hero-photo-mob-h, 485px) !important;',
    '  }',
    '}',

    '/* 2. Одинаковые размеры кнопок «Пробная тренировка в подарок» и «Выбрать формат работы» */',
    '.hero-actions {',
    '  display: grid !important;',
    '  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;',
    '  gap: 14px !important;',
    '  max-width: 560px !important;',
    '  align-items: stretch !important;',
    '}',
    '.hero-actions .btn {',
    '  width: 100% !important;',
    '  min-height: 54px !important;',
    '  height: 54px !important;',
    '  padding: 0 18px !important;',
    '  font-size: 0.83rem !important;',
    '  line-height: 1.15 !important;',
    '  gap: 7px !important;',
    '  white-space: nowrap !important;',
    '  box-sizing: border-box !important;',
    '}',
    '@media (max-width: 720px) {',
    '  .hero-actions {',
    '    grid-template-columns: 1fr !important;',
    '    max-width: 100% !important;',
    '    gap: 12px !important;',
    '  }',
    '  .hero-actions .btn {',
    '    width: 100% !important;',
    '    min-height: 52px !important;',
    '    height: 52px !important;',
    '    padding: 0 16px !important;',
    '    font-size: 0.84rem !important;',
    '  }',
    '}',
    '@media (max-width: 360px) {',
    '  .hero-actions .btn { font-size: 0.78rem !important; padding: 0 12px !important; }',
    '}',

    '/* 3. Компактная HD-гантелька с бантиком в размер букв (чуть выше строчной) */',
    '.bow-dumbbell-ico {',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  justify-content: center !important;',
    '  width: 21px !important;',
    '  height: 15px !important;',
    '  margin-right: 1px !important;',
    '  vertical-align: -2px !important;',
    '  flex-shrink: 0 !important;',
    '  filter: drop-shadow(0 1px 1.5px rgba(43, 26, 14, 0.32));',
    '}',
    '.bow-dumbbell-ico svg {',
    '  width: 100% !important;',
    '  height: 100% !important;',
    '  overflow: visible !important;',
    '  shape-rendering: geometricPrecision;',
    '}'
  ].join('\n');
  document.head.appendChild(st);

  var uid = 0;
  function makeHdMiniDumbbellSvg() {
    var p = 'mdb_' + (++uid);
    return [
      '<svg viewBox="0 0 88 58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
      '  <defs>',
      '    <linearGradient id="' + p + '_plate" x1="0%" y1="0%" x2="100%" y2="100%">',
      '      <stop offset="0%" stop-color="#6A452D"/>',
      '      <stop offset="45%" stop-color="#3F2617"/>',
      '      <stop offset="100%" stop-color="#1E1109"/>',
      '    </linearGradient>',
      '    <linearGradient id="' + p + '_gold" x1="0%" y1="0%" x2="0%" y2="100%">',
      '      <stop offset="0%" stop-color="#FFF5E0"/>',
      '      <stop offset="45%" stop-color="#E7B773"/>',
      '      <stop offset="100%" stop-color="#9A6126"/>',
      '    </linearGradient>',
      '    <linearGradient id="' + p + '_rib" x1="0%" y1="0%" x2="100%" y2="100%">',
      '      <stop offset="0%" stop-color="#FFFFFF"/>',
      '      <stop offset="55%" stop-color="#FCECD3"/>',
      '      <stop offset="100%" stop-color="#DFB884"/>',
      '    </linearGradient>',
      '    <linearGradient id="' + p + '_ribSh" x1="0%" y1="0%" x2="0%" y2="100%">',
      '      <stop offset="0%" stop-color="#F6DFBC"/>',
      '      <stop offset="100%" stop-color="#C28D50"/>',
      '    </linearGradient>',
      '  </defs>',
      '  <g transform="rotate(-7 44 30)">',
      '    <!-- Стальной гриф с золотым отблеском и насечкой -->',
      '    <rect x="22" y="25.5" width="44" height="7" rx="3" fill="url(#' + p + '_gold)" stroke="#3F2617" stroke-width="1"/>',
      '    <line x1="25" y1="27.3" x2="63" y2="27.3" stroke="#FFFDF8" stroke-width="1" opacity="0.8"/>',
      '    <!-- Левые диски (внешний малый + основной с фаской и золотым кантом) -->',
      '    <rect x="4" y="16" width="8.5" height="26" rx="4" fill="url(#' + p + '_plate)" stroke="#23130A" stroke-width="1"/>',
      '    <line x1="6.5" y1="19" x2="6.5" y2="39" stroke="#A67652" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>',
      '    <rect x="13" y="10.5" width="11" height="37" rx="5" fill="url(#' + p + '_plate)" stroke="#23130A" stroke-width="1.1"/>',
      '    <rect x="15.5" y="14" width="2.4" height="30" rx="1.2" fill="url(#' + p + '_gold)" opacity="0.9"/>',
      '    <!-- Правые диски -->',
      '    <rect x="64" y="10.5" width="11" height="37" rx="5" fill="url(#' + p + '_plate)" stroke="#23130A" stroke-width="1.1"/>',
      '    <rect x="66.5" y="14" width="2.4" height="30" rx="1.2" fill="url(#' + p + '_gold)" opacity="0.9"/>',
      '    <rect x="75.5" y="16" width="8.5" height="26" rx="4" fill="url(#' + p + '_plate)" stroke="#23130A" stroke-width="1"/>',
      '    <line x1="78" y1="19" x2="78" y2="39" stroke="#A67652" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>',
      '    <!-- Ленты бантика (объёмные хвостики со срезом) -->',
      '    <path d="M41.5 31 L33 49 L38.5 46.5 L42 51 L44 33 Z" fill="url(#' + p + '_ribSh)" stroke="#8F5924" stroke-width="1" stroke-linejoin="round"/>',
      '    <path d="M46.5 31 L55 49 L49.5 46.5 L46 51 L44 33 Z" fill="url(#' + p + '_ribSh)" stroke="#8F5924" stroke-width="1" stroke-linejoin="round"/>',
      '    <!-- Шёлковые петли бантика со складками -->',
      '    <path d="M43 27.5 C32 13, 21 17.5, 25.5 27.5 C28.5 34, 37 32.5, 43 28.5 Z" fill="url(#' + p + '_rib)" stroke="#8F5924" stroke-width="1.15" stroke-linejoin="round"/>',
      '    <path d="M40 27.5 C34 22.5, 29.5 23.5, 29 27" fill="none" stroke="#C68E4E" stroke-width="1.1" stroke-linecap="round"/>',
      '    <path d="M45 27.5 C56 13, 67 17.5, 62.5 27.5 C59.5 34, 51 32.5, 45 28.5 Z" fill="url(#' + p + '_rib)" stroke="#8F5924" stroke-width="1.15" stroke-linejoin="round"/>',
      '    <path d="M48 27.5 C54 22.5, 58.5 23.5, 59 27" fill="none" stroke="#C68E4E" stroke-width="1.1" stroke-linecap="round"/>',
      '    <!-- Центральный узелок бантика -->',
      '    <rect x="40" y="23.5" width="8" height="9.5" rx="3.4" fill="url(#' + p + '_gold)" stroke="#7A481B" stroke-width="1.1"/>',
      '    <ellipse cx="43.2" cy="26.3" rx="1.6" ry="1.1" fill="#FFFFFF" opacity="0.85"/>',
      '  </g>',
      '</svg>'
    ].join('');
  }

  function upgradeMiniDumbbells() {
    // Обновляем все существующие мини-гантельки на сайте (кроме скрытых)
    document.querySelectorAll('.bow-dumbbell-ico').forEach(function (span) {
      if (span.getAttribute('data-hd') === '1') return;
      span.setAttribute('data-hd', '1');
      span.innerHTML = makeHdMiniDumbbellSvg();
    });
    // Если вдруг на кнопке Блока 1 осталась эмодзи 🎁 — заменяем на HD-гантельку
    document.querySelectorAll('.hero .btn-gold, .step-card h3').forEach(function (el) {
      if (el.innerHTML.indexOf('🎁') >= 0) {
        el.innerHTML = el.innerHTML.replace(/🎁/g, '<span class="bow-dumbbell-ico" data-hd="1" aria-hidden="true">' + makeHdMiniDumbbellSvg() + '</span>');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(upgradeMiniDumbbells, 120);
      setTimeout(upgradeMiniDumbbells, 600);
    });
  } else {
    setTimeout(upgradeMiniDumbbells, 120);
    setTimeout(upgradeMiniDumbbells, 600);
  }
})();

/* === FIX 05: БЛОК 5 — КОМПАКТНЕЕ НА ~18%, «БЕСПЛАТНО», ПРЕМИАЛЬНАЯ 3D-ГАНТЕЛЬКА С ШЁЛКОВЫМ БАНТОМ === */
(function applyFix05Gift() {
  var old = document.getElementById('nastya-fix05-gift-css');
  if (old) old.remove();

  var st = document.createElement('style');
  st.id = 'nastya-fix05-gift-css';
  st.textContent = [
    '/* 1. Компактные пропорции блока подарка (-18% от прежних размеров) */',
    '.gift-sec { padding: 14px 0 64px !important; }',
    '.gift-card {',
    '  max-width: 1020px !important;',
    '  margin: 0 auto !important;',
    '  grid-template-columns: 0.68fr 1.32fr !important;',
    '  gap: 28px !important;',
    '  padding: 32px 40px !important;',
    '  border-radius: 26px !important;',
    '}',
    '.gift-card .eyebrow { margin-bottom: 6px !important; font-size: 0.7rem !important; }',
    '.gift-card h2 { font-size: clamp(1.65rem, 2.9vw, 2.35rem) !important; margin: 4px 0 10px !important; line-height: 1.12 !important; }',
    '.gift-card p { font-size: 0.88rem !important; line-height: 1.5 !important; margin-bottom: 12px !important; }',
    '.gift-list { gap: 6px !important; margin-bottom: 20px !important; }',
    '.gift-list li { font-size: 0.85rem !important; padding-left: 22px !important; }',
    '.gift-art { position: relative; display: flex; justify-content: center; align-items: center; }',
    '.gift-art::before {',
    '  content: "";',
    '  position: absolute;',
    '  width: 210px; height: 210px;',
    '  border-radius: 50%;',
    '  background: radial-gradient(circle, rgba(246, 217, 168, 0.24) 0%, rgba(201, 144, 78, 0.08) 52%, transparent 72%);',
    '  filter: blur(12px);',
    '  pointer-events: none;',
    '}',
    '.gift-svg {',
    '  width: min(230px, 84%) !important;',
    '  height: auto !important;',
    '  position: relative;',
    '  z-index: 1;',
    '  filter: drop-shadow(0 18px 26px rgba(14, 7, 3, 0.45));',
    '  shape-rendering: geometricPrecision;',
    '}',
    '@media (max-width: 720px) {',
    '  .gift-sec { padding: 8px 0 42px !important; }',
    '  .gift-card {',
    '    grid-template-columns: 1fr !important;',
    '    padding: 22px 18px 24px !important;',
    '    gap: 12px !important;',
    '    border-radius: 22px !important;',
    '  }',
    '  .gift-art::before { width: 150px; height: 150px; }',
    '  .gift-svg { width: 162px !important; }',
    '  .gift-card h2 { font-size: 1.62rem !important; margin: 2px 0 8px !important; }',
    '  .gift-card p { font-size: 0.82rem !important; margin-bottom: 10px !important; }',
    '  .gift-list { gap: 5px !important; margin-bottom: 16px !important; }',
    '  .gift-list li { font-size: 0.8rem !important; }',
    '  .gift-card .gift-claim-btn { padding: 13px 22px !important; font-size: 0.82rem !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(st);

  // Высокодетализированная 3D-иллюстрация гантели с атласным шёлковым бантом
  var LUXURY_GIFT_DUMBBELL_SVG = [
    '<svg class="gift-svg" viewBox="0 0 320 230" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '  <defs>',
    '    <!-- Мягкая контактная тень на полу -->',
    '    <radialGradient id="gdFloorSh" cx="50%" cy="50%" r="50%">',
    '      <stop offset="0%" stop-color="#0E0703" stop-opacity="0.62"/>',
    '      <stop offset="58%" stop-color="#140A04" stop-opacity="0.28"/>',
    '      <stop offset="100%" stop-color="#140A04" stop-opacity="0"/>',
    '    </radialGradient>',
    '    <!-- Полированное шампань-золото для блинов -->',
    '    <linearGradient id="gdGoldBody" x1="12%" y1="4%" x2="88%" y2="96%">',
    '      <stop offset="0%" stop-color="#FFF5DE"/>',
    '      <stop offset="22%" stop-color="#F2C887"/>',
    '      <stop offset="50%" stop-color="#C98A42"/>',
    '      <stop offset="78%" stop-color="#8C531D"/>',
    '      <stop offset="100%" stop-color="#5B3310"/>',
    '    </linearGradient>',
    '    <!-- Тёмно-бронзовая фаска дисков -->',
    '    <linearGradient id="gdBronzeFace" x1="0%" y1="0%" x2="100%" y2="100%">',
    '      <stop offset="0%" stop-color="#764C30"/>',
    '      <stop offset="48%" stop-color="#452918"/>',
    '      <stop offset="100%" stop-color="#211209"/>',
    '    </linearGradient>',
    '    <!-- Гриф с цилиндрическим металлическим бликом -->',
    '    <linearGradient id="gdShaft" x1="0%" y1="0%" x2="0%" y2="100%">',
    '      <stop offset="0%" stop-color="#8D5A2A"/>',
    '      <stop offset="22%" stop-color="#FFF4DD"/>',
    '      <stop offset="46%" stop-color="#E6B672"/>',
    '      <stop offset="76%" stop-color="#9A5F24"/>',
    '      <stop offset="100%" stop-color="#4E2D10"/>',
    '    </linearGradient>',
    '    <!-- Атласная шёлковая лента — светлая сторона -->',
    '    <linearGradient id="gdSilkHi" x1="10%" y1="0%" x2="90%" y2="100%">',
    '      <stop offset="0%" stop-color="#FFFFFF"/>',
    '      <stop offset="35%" stop-color="#FFF5E6"/>',
    '      <stop offset="72%" stop-color="#EAD2B0"/>',
    '      <stop offset="100%" stop-color="#C59763"/>',
    '    </linearGradient>',
    '    <!-- Атласная шёлковая лента — внутренняя глубина петли -->',
    '    <linearGradient id="gdSilkDeep" x1="0%" y1="0%" x2="100%" y2="100%">',
    '      <stop offset="0%" stop-color="#DFC097"/>',
    '      <stop offset="55%" stop-color="#B07E49"/>',
    '      <stop offset="100%" stop-color="#744922"/>',
    '    </linearGradient>',
    '    <!-- Хвостики ленты с мягким переливом -->',
    '    <linearGradient id="gdTail" x1="0%" y1="0%" x2="100%" y2="100%">',
    '      <stop offset="0%" stop-color="#F7E4C8"/>',
    '      <stop offset="45%" stop-color="#FFF9F0"/>',
    '      <stop offset="82%" stop-color="#D7B284"/>',
    '      <stop offset="100%" stop-color="#A67440"/>',
    '    </linearGradient>',
    '    <!-- Объёмный фильтр тени для узла и петель -->',
    '    <filter id="gdSoftSh" x="-20%" y="-20%" width="140%" height="140%">',
    '      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#1E1007" flood-opacity="0.52"/>',
    '    </filter>',
    '  </defs>',
    '  <!-- Тень под парящей гантелью -->',
    '  <ellipse cx="160" cy="206" rx="108" ry="13" fill="url(#gdFloorSh)"/>',
    '  <!-- Сдержанные золотые блики-искры -->',
    '  <g opacity="0.88">',
    '    <path d="M54 52 L56.5 44 L59 52 L67 54.5 L59 57 L56.5 65 L54 57 L46 54.5 Z" fill="#FBE4B9"/>',
    '    <path d="M264 42 L265.8 36 L267.6 42 L273.6 43.8 L267.6 45.6 L265.8 51.6 L264 45.6 L258 43.8 Z" fill="#F6D59B"/>',
    '    <circle cx="278" cy="144" r="2.6" fill="#E8B978" opacity="0.8"/>',
    '    <circle cx="42" cy="152" r="2.2" fill="#F6D9A8" opacity="0.7"/>',
    '  </g>',
    '  <!-- ГАНТЕЛЬ В ЛЁГКОМ ДИНАМИЧНОМ НАКЛОНЕ -->',
    '  <g transform="rotate(-7 160 116)">',
    '    <!-- Гриф с ромбовидной насечкой и боковыми замками-кольцами -->',
    '    <rect x="86" y="102" width="148" height="24" rx="7" fill="url(#gdShaft)" stroke="#5A3413" stroke-width="1.2"/>',
    '    <!-- Мелкая ювелирная насечка на рукояти -->',
    '    <g stroke="#6B3F18" stroke-width="1.2" opacity="0.45">',
    '      <line x1="106" y1="105" x2="112" y2="123"/><line x1="114" y1="105" x2="120" y2="123"/>',
    '      <line x1="122" y1="105" x2="128" y2="123"/><line x1="192" y1="105" x2="198" y2="123"/>',
    '      <line x1="200" y1="105" x2="206" y2="123"/><line x1="208" y1="105" x2="214" y2="123"/>',
    '      <line x1="112" y1="105" x2="106" y2="123"/><line x1="120" y1="105" x2="114" y2="123"/>',
    '      <line x1="198" y1="105" x2="192" y2="123"/><line x1="206" y1="105" x2="200" y2="123"/>',
    '    </g>',
    '    <!-- Замки-втулки у блинов -->',
    '    <rect x="87" y="96" width="11" height="36" rx="4" fill="url(#gdGoldBody)" stroke="#5A3413" stroke-width="1.1"/>',
    '    <rect x="222" y="96" width="11" height="36" rx="4" fill="url(#gdGoldBody)" stroke="#5A3413" stroke-width="1.1"/>',
    '    <!-- ЛЕВЫЕ БЛИНЫ (3 ступени + металлический колпачок + фаски и блики) -->',
    '    <!-- Колпачок торца -->',
    '    <rect x="14" y="102" width="14" height="24" rx="6" fill="url(#gdShaft)" stroke="#4E2B10" stroke-width="1.1"/>',
    '    <!-- Внешний малый блин -->',
    '    <rect x="24" y="75" width="24" height="78" rx="11" fill="url(#gdBronzeFace)" stroke="#321B0D" stroke-width="1.3"/>',
    '    <rect x="28" y="79" width="7" height="70" rx="3.5" fill="url(#gdGoldBody)" opacity="0.92"/>',
    '    <line x1="30.5" y1="84" x2="30.5" y2="144" stroke="#FFF9EE" stroke-width="1.5" stroke-linecap="round" opacity="0.78"/>',
    '    <!-- Главный массивный блин (левый) -->',
    '    <rect x="51" y="54" width="34" height="120" rx="14" fill="url(#gdGoldBody)" stroke="#522E10" stroke-width="1.4"/>',
    '    <rect x="58" y="61" width="12" height="106" rx="6" fill="url(#gdBronzeFace)" opacity="0.92"/>',
    '    <line x1="55.5" y1="64" x2="55.5" y2="164" stroke="#FFFDF8" stroke-width="2.2" stroke-linecap="round" opacity="0.82"/>',
    '    <line x1="78" y1="64" x2="78" y2="164" stroke="#4D2B0E" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/>',
    '    <!-- ПРАВЫЕ БЛИНЫ (симметрия с учётом верхне-левого света) -->',
    '    <!-- Главный массивный блин (правый) -->',
    '    <rect x="235" y="54" width="34" height="120" rx="14" fill="url(#gdGoldBody)" stroke="#522E10" stroke-width="1.4"/>',
    '    <rect x="250" y="61" width="12" height="106" rx="6" fill="url(#gdBronzeFace)" opacity="0.92"/>',
    '    <line x1="241" y1="64" x2="241" y2="164" stroke="#FFFDF8" stroke-width="2.2" stroke-linecap="round" opacity="0.82"/>',
    '    <line x1="264" y1="64" x2="264" y2="164" stroke="#4D2B0E" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/>',
    '    <!-- Внешний малый блин -->',
    '    <rect x="272" y="75" width="24" height="78" rx="11" fill="url(#gdBronzeFace)" stroke="#321B0D" stroke-width="1.3"/>',
    '    <rect x="276" y="79" width="7" height="70" rx="3.5" fill="url(#gdGoldBody)" opacity="0.92"/>',
    '    <line x1="278.5" y1="84" x2="278.5" y2="144" stroke="#FFF9EE" stroke-width="1.5" stroke-linecap="round" opacity="0.78"/>',
    '    <!-- Колпачок торца -->',
    '    <rect x="292" y="102" width="14" height="24" rx="6" fill="url(#gdShaft)" stroke="#4E2B10" stroke-width="1.1"/>',
    '    <!-- АТЛАСНЫЙ ШЁЛКОВЫЙ БАНТ НА ГРИФЕ (с лёгким живым покачиванием .gift-lid) -->',
    '    <g class="gift-lid" style="transform-origin: 160px 112px;" filter="url(#gdSoftSh)">',
    '      <!-- Свободные атласные ленты-хвостики с ласточкиным вырезом -->',
    '      <path d="M153 118 C144 136, 134 156, 121 174 L137 167 L144 181 C152 162, 158 142, 161 122 Z" fill="url(#gdTail)" stroke="#9A6935" stroke-width="1.2" stroke-linejoin="round"/>',
    '      <path d="M151 124 C144 140, 138 154, 130 166" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.72"/>',
    '      <path d="M167 118 C176 136, 186 156, 199 174 L183 167 L176 181 C168 162, 162 142, 159 122 Z" fill="url(#gdTail)" stroke="#9A6935" stroke-width="1.2" stroke-linejoin="round"/>',
    '      <path d="M169 124 C176 140, 182 154, 190 166" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.72"/>',
    '      <!-- Задняя глубина петель банта (создаёт объём настоящей ткани) -->',
    '      <path d="M158 108 C132 76, 98 84, 106 112 C112 128, 138 126, 158 115 Z" fill="url(#gdSilkDeep)" stroke="#855526" stroke-width="1.2"/>',
    '      <path d="M162 108 C188 76, 222 84, 214 112 C208 128, 182 126, 162 115 Z" fill="url(#gdSilkDeep)" stroke="#855526" stroke-width="1.2"/>',
    '      <!-- Передние мягкие шёлковые лепестки банта со складками -->',
    '      <path d="M158 106 C134 62, 92 70, 99 102 C104 122, 134 120, 158 112 Z" fill="url(#gdSilkHi)" stroke="#9E6C36" stroke-width="1.35" stroke-linejoin="round"/>',
    '      <path d="M152 106 C134 86, 113 88, 112 102" fill="none" stroke="#C69359" stroke-width="1.6" stroke-linecap="round"/>',
    '      <path d="M148 110 C130 100, 114 102, 112 111" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>',
    '      <path d="M162 106 C186 62, 228 70, 221 102 C216 122, 186 120, 162 112 Z" fill="url(#gdSilkHi)" stroke="#9E6C36" stroke-width="1.35" stroke-linejoin="round"/>',
    '      <path d="M168 106 C186 86, 207 88, 208 102" fill="none" stroke="#C69359" stroke-width="1.6" stroke-linecap="round"/>',
    '      <path d="M172 110 C190 100, 206 102, 208 111" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>',
    '      <!-- Центральная перетяжка / атласный узел -->',
    '      <rect x="148" y="96" width="24" height="30" rx="9" fill="url(#gdGoldBody)" stroke="#75461B" stroke-width="1.35"/>',
    '      <path d="M153 102 C156 100, 164 100, 167 102" stroke="#FFFDF9" stroke-width="2" stroke-linecap="round" opacity="0.85"/>',
    '      <line x1="152" y1="112" x2="168" y2="112" stroke="#8C5621" stroke-width="1.1" opacity="0.45"/>',
    '    </g>',
    '  </g>',
    '</svg>'
  ].join('');

  function upgradeGiftBlock() {
    var giftSec = document.querySelector('.gift-sec');
    if (!giftSec) return;

    // 1. Меняем текст «за мой счёт» -> «бесплатно» (даже если splitWords уже разбил заголовок на спаны)
    var h2 = giftSec.querySelector('h2');
    if (h2 && /за\s*мой\s*сч[её]т/i.test(h2.textContent || '')) {
      var ital = h2.querySelector('i');
      if (ital) {
        ital.innerHTML = 'бесплатно';
      } else {
        h2.innerHTML = 'Первая пробная тренировка — <i>бесплатно</i>';
      }
    }

    // 2. Ставим ювелирную 3D-гантельку с атласным бантом
    var art = giftSec.querySelector('.gift-art');
    if (art) {
      var oldSvg = art.querySelector('.gift-svg');
      if (oldSvg && oldSvg.getAttribute('data-lux') !== '1') {
        var holder = document.createElement('div');
        holder.innerHTML = LUXURY_GIFT_DUMBBELL_SVG;
        var fresh = holder.firstChild;
        fresh.setAttribute('data-lux', '1');
        oldSvg.replaceWith(fresh);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(upgradeGiftBlock, 140);
      setTimeout(upgradeGiftBlock, 650);
    });
  } else {
    setTimeout(upgradeGiftBlock, 140);
    setTimeout(upgradeGiftBlock, 650);
  }
})();

/* === FIX 06: БЛОКИ 8 И 10 — КРАСИВЫЕ КНОПКИ ПРОЛИСТЫВАНИЯ СТРОГО ПО ЦЕНТРУ === */
(function applyFix06Carousels() {
  var old = document.getElementById('nastya-fix06-carousels-css');
  if (old) old.remove();

  var st = document.createElement('style');
  st.id = 'nastya-fix06-carousels-css';
  st.textContent = [
    '/* Убираем любые посторонние старые .c-nav вне .fandeck-wrap в Блоке 8 и Блоке 10 */',
    '.approach-sec .container > .c-nav,',
    '.steps-sec .container > .c-nav {',
    '  display: none !important;',
    '}',

    '/* Гарантируем симметричное центрирование веерной карусели */',
    '.fandeck-wrap {',
    '  position: relative !important;',
    '  width: 100% !important;',
    '  margin: 0 auto !important;',
    '  padding: 14px 0 8px !important;',
    '  display: flex !important;',
    '  flex-direction: column !important;',
    '  align-items: center !important;',
    '}',
    '.fandeck-stage {',
    '  width: 100% !important;',
    '  max-width: 980px !important;',
    '  margin: 0 auto !important;',
    '}',

    '/* Панель навигации строго по центру под карточками */',
    '.fandeck-wrap > .c-nav {',
    '  position: relative !important;',
    '  left: auto !important;',
    '  right: auto !important;',
    '  bottom: auto !important;',
    '  transform: none !important;',
    '  width: auto !important;',
    '  margin: 26px auto 0 auto !important;',
    '  padding: 7px 10px !important;',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  justify-content: center !important;',
    '  gap: 16px !important;',
    '  z-index: 15 !important;',
    '  background: rgba(255, 251, 245, 0.86) !important;',
    '  backdrop-filter: blur(10px) !important;',
    '  -webkit-backdrop-filter: blur(10px) !important;',
    '  border: 1px solid rgba(201, 144, 78, 0.32) !important;',
    '  border-radius: 999px !important;',
    '  box-shadow: 0 12px 28px rgba(63, 41, 27, 0.11) !important;',
    '}',

    '/* Премиальные круглые кнопки со стрелками */',
    '.fandeck-wrap > .c-nav .c-arr {',
    '  position: static !important;',
    '  transform: none !important;',
    '  width: 44px !important;',
    '  height: 44px !important;',
    '  min-width: 44px !important;',
    '  padding: 0 !important;',
    '  margin: 0 !important;',
    '  border-radius: 50% !important;',
    '  border: 1px solid rgba(201, 144, 78, 0.45) !important;',
    '  background: linear-gradient(145deg, #FFFDF9 0%, #F4E9D8 100%) !important;',
    '  color: #3F291B !important;',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  justify-content: center !important;',
    '  cursor: pointer !important;',
    '  box-shadow: 0 6px 14px rgba(63, 41, 27, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;',
    '  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease !important;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '.fandeck-wrap > .c-nav .c-arr svg {',
    '  width: 18px !important;',
    '  height: 18px !important;',
    '  stroke: currentColor !important;',
    '  stroke-width: 2.2 !important;',
    '  fill: none !important;',
    '  stroke-linecap: round !important;',
    '  stroke-linejoin: round !important;',
    '  display: block !important;',
    '}',
    '.fandeck-wrap > .c-nav .c-arr:hover {',
    '  background: linear-gradient(135deg, #4A2F20 0%, #3F291B 100%) !important;',
    '  color: #F6D9A8 !important;',
    '  border-color: #3F291B !important;',
    '  transform: translateY(-2px) scale(1.04) !important;',
    '  box-shadow: 0 10px 22px rgba(63, 41, 27, 0.24) !important;',
    '}',
    '.fandeck-wrap > .c-nav .c-arr:active {',
    '  transform: scale(0.95) !important;',
    '}',

    '/* Точки-индикаторы между кнопками (работают и на ПК, и на телефоне) */',
    '.fandeck-wrap > .c-nav .c-dots {',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  justify-content: center !important;',
    '  gap: 8px !important;',
    '  padding: 0 4px !important;',
    '}',
    '.fandeck-wrap > .c-nav .c-dots i {',
    '  display: block !important;',
    '  width: 7px !important;',
    '  height: 7px !important;',
    '  border-radius: 999px !important;',
    '  background: rgba(63, 41, 27, 0.22) !important;',
    '  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s ease !important;',
    '  cursor: pointer;',
    '}',
    '.fandeck-wrap > .c-nav .c-dots i.on {',
    '  width: 26px !important;',
    '  background: linear-gradient(90deg, #E0A862, #B8733F) !important;',
    '  box-shadow: 0 2px 8px rgba(201, 144, 78, 0.45) !important;',
    '}',

    '/* Мобильная адаптация (чёткий центр, удобное нажатие пальцем) */',
    '@media (max-width: 720px) {',
    '  .fandeck-wrap > .c-nav {',
    '    margin-top: 20px !important;',
    '    padding: 6px 8px !important;',
    '    gap: 14px !important;',
    '  }',
    '  .fandeck-wrap > .c-nav .c-arr {',
    '    width: 40px !important;',
    '    height: 40px !important;',
    '    min-width: 40px !important;',
    '  }',
    '  .fandeck-wrap > .c-nav .c-arr svg {',
    '    width: 17px !important;',
    '    height: 17px !important;',
    '  }',
    '}'
  ].join('\n');
  document.head.appendChild(st);

  var LEFT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  var RIGHT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function polishFanDeckNavs() {
    // 1. Удаляем «сиротские» старые .c-nav, оставшиеся от initCarousel в Блоке 8 и Блоке 10
    document.querySelectorAll('.approach-sec .container > .c-nav, .steps-sec .container > .c-nav').forEach(function (orphan) {
      orphan.remove();
    });

    // 2. Ставим чёткие SVG-стрелки в кнопки обеих веерных каруселей и делаем точки кликабельными
    document.querySelectorAll('.fandeck-wrap > .c-nav').forEach(function (nav) {
      var btns = nav.querySelectorAll('.c-arr');
      if (btns.length >= 2) {
        if (!btns[0].querySelector('svg')) btns[0].innerHTML = LEFT_SVG;
        if (!btns[1].querySelector('svg')) btns[1].innerHTML = RIGHT_SVG;
      }
      var wrap = nav.closest('.fandeck-wrap');
      if (wrap) {
        var cards = wrap.querySelectorAll('.fandeck-item');
        nav.querySelectorAll('.c-dots i').forEach(function (dot, idx) {
          if (dot.getAttribute('data-dot-bound') === '1') return;
          dot.setAttribute('data-dot-bound', '1');
          dot.addEventListener('click', function () {
            if (cards[idx]) cards[idx].click();
          });
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(polishFanDeckNavs, 150);
      setTimeout(polishFanDeckNavs, 650);
    });
  } else {
    setTimeout(polishFanDeckNavs, 150);
    setTimeout(polishFanDeckNavs, 650);
  }
})();

/* === FIX 07: БЛОК 9 — ЗАМЕТНЫЙ УКАЗАТЕЛЬ «ЛИСТАЙТЕ ВБОК» НА САМОМ ВЕРХУ === */
(function applyFix07ServicesSwipe() {
  var old = document.getElementById('nastya-fix07-swipe-css');
  if (old) old.remove();

  var st = document.createElement('style');
  st.id = 'nastya-fix07-swipe-css';
  st.textContent = [
    '/* Выравнивание верхней шапки секции Услуги */',
    '#services .section-head {',
    '  margin-bottom: 20px !important;',
    '  align-items: flex-end !important;',
    '}',

    '/* Контрастная, мгновенно заметная плашка на самом верху секции услуг */',
    '.services-top-swipe-wrap {',
    '  position: relative;',
    '  z-index: 6;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: flex-start;',
    '  margin: 0 0 22px 0 !important;',
    '}',
    '.services-swipe-bar.top-hero-pill {',
    '  position: relative !important;',
    '  z-index: 6 !important;',
    '  margin: 0 !important;',
    '  padding: 9px 12px 9px 18px !important;',
    '  max-width: 100% !important;',
    '  width: auto !important;',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  justify-content: space-between !important;',
    '  gap: 16px !important;',
    '  background: linear-gradient(135deg, #3F291B 0%, #523523 100%) !important;',
    '  color: #FFFBF5 !important;',
    '  border: 1px solid rgba(246, 217, 168, 0.45) !important;',
    '  border-radius: 999px !important;',
    '  box-shadow: 0 12px 28px rgba(63, 41, 27, 0.24), inset 0 1px 0 rgba(255, 246, 232, 0.16) !important;',
    '  font-family: "Manrope", sans-serif !important;',
    '  font-size: 0.84rem !important;',
    '  font-weight: 600 !important;',
    '  letter-spacing: 0.01em !important;',
    '}',
    '.services-swipe-bar.top-hero-pill .swipe-text {',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  gap: 9px !important;',
    '  color: #FFF6E8 !important;',
    '}',
    '.services-swipe-bar.top-hero-pill .swipe-dot {',
    '  width: 7px;',
    '  height: 7px;',
    '  border-radius: 50%;',
    '  background: #F0BE78;',
    '  box-shadow: 0 0 10px rgba(240, 190, 120, 0.85);',
    '  flex-shrink: 0;',
    '}',
    '.services-swipe-bar.top-hero-pill svg.anim-arrow {',
    '  width: 19px !important;',
    '  height: 19px !important;',
    '  stroke: #F6D9A8 !important;',
    '  stroke-width: 2.3 !important;',
    '  fill: none !important;',
    '  flex-shrink: 0;',
    '  animation: nastyaTopSwipeSlide 1.25s ease-in-out infinite !important;',
    '}',
    '@keyframes nastyaTopSwipeSlide {',
    '  0%, 100% { transform: translateX(0); opacity: 0.65; }',
    '  50% { transform: translateX(5px); opacity: 1; }',
    '}',
    '.services-swipe-bar.top-hero-pill .swipe-arrows {',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  gap: 7px !important;',
    '  flex-shrink: 0 !important;',
    '}',
    '.services-swipe-bar.top-hero-pill button {',
    '  width: 32px !important;',
    '  height: 32px !important;',
    '  border-radius: 50% !important;',
    '  border: 1px solid rgba(246, 217, 168, 0.48) !important;',
    '  background: linear-gradient(135deg, #F0C382 0%, #C98A42 100%) !important;',
    '  color: #2B1A0E !important;',
    '  display: inline-flex !important;',
    '  align-items: center !important;',
    '  justify-content: center !important;',
    '  cursor: pointer !important;',
    '  padding: 0 !important;',
    '  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.22) !important;',
    '  transition: transform 0.2s ease, filter 0.2s ease !important;',
    '}',
    '.services-swipe-bar.top-hero-pill button:hover {',
    '  transform: scale(1.07);',
    '  filter: brightness(1.06);',
    '}',
    '.services-swipe-bar.top-hero-pill button:active {',
    '  transform: scale(0.94);',
    '}',
    '.services-swipe-bar.top-hero-pill button svg {',
    '  width: 15px;',
    '  height: 15px;',
    '  stroke: #2B1A0E;',
    '  stroke-width: 2.5;',
    '  fill: none;',
    '  stroke-linecap: round;',
    '  stroke-linejoin: round;',
    '}',

    '/* На мобильных: растягивается ровно по ширине контейнера прямо под заголовком «Услуги и форматы работы» */',
    '@media (max-width: 720px) {',
    '  #services .section-head { margin-bottom: 14px !important; }',
    '  .services-top-swipe-wrap { margin: 0 0 16px 0 !important; width: 100% !important; }',
    '  .services-swipe-bar.top-hero-pill {',
    '    width: 100% !important;',
    '    padding: 8px 10px 8px 14px !important;',
    '    font-size: 0.78rem !important;',
    '    gap: 10px !important;',
    '  }',
    '  .services-swipe-bar.top-hero-pill button {',
    '    width: 30px !important;',
    '    height: 30px !important;',
    '  }',
    '}'
  ].join('\n');
  document.head.appendChild(st);

  function mountTopSwipeIndicator() {
    var sec = document.getElementById('services') || document.querySelector('.services-sec');
    if (!sec) return;

    // Убираем любые старые или продублированные указатели внутри/вокруг секции услуг
    document.querySelectorAll('.services-swipe-bar, .services-top-swipe-wrap').forEach(function (el) {
      el.remove();
    });

    var head = sec.querySelector('.section-head');
    var tabs = document.getElementById('serviceTabs');
    var anchor = head || tabs;
    if (!anchor) return;

    var wrap = document.createElement('div');
    wrap.className = 'services-top-swipe-wrap';
    wrap.innerHTML = [
      '<div class="services-swipe-bar top-hero-pill">',
      '  <span class="swipe-text">',
      '    <span class="swipe-dot" aria-hidden="true"></span>',
      '    <span>Листайте категории и тарифы вбок</span>',
      '    <svg class="anim-arrow" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
      '      <path d="M5 12h14M13 6l6 6-6 6"/>',
      '    </svg>',
      '  </span>',
      '  <span class="swipe-arrows">',
      '    <button type="button" data-dir="-1" aria-label="Листать назад">',
      '      <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
      '    </button>',
      '    <button type="button" data-dir="1" aria-label="Листать вперёд">',
      '      <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
      '    </button>',
      '  </span>',
      '</div>'
    ].join('');

    wrap.querySelectorAll('button[data-dir]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = Number(btn.getAttribute('data-dir')) || 1;
        var tabsRow = document.getElementById('serviceTabs');
        var tariffsRow = document.getElementById('tariffsContainer');

        // 1. На узких экранах плавно пролистываем вкладки категорий и карточки тарифов
        if (tabsRow && tabsRow.scrollWidth > tabsRow.clientWidth + 8) {
          tabsRow.scrollBy({ left: dir * 190, behavior: 'smooth' });
        }
        if (tariffsRow && tariffsRow.scrollWidth > tariffsRow.clientWidth + 8) {
          tariffsRow.scrollBy({ left: dir * 290, behavior: 'smooth' });
        } else if (tabsRow) {
          // 2. На широком ПК, где карточки уже видны целиком — переключаем соседнюю категорию услуг
          var tabBtns = Array.prototype.slice.call(tabsRow.querySelectorAll('.service-tab-btn'));
          if (tabBtns.length > 1) {
            var activeIdx = tabBtns.findIndex(function (b) { return b.classList.contains('active'); });
            if (activeIdx < 0) activeIdx = 0;
            var nextIdx = (activeIdx + dir + tabBtns.length) % tabBtns.length;
            tabBtns[nextIdx].click();
          }
        }
      });
    });

    if (head) {
      // Ставим СТРОГО под заголовком «Услуги и форматы работы» (вверху блока, над вкладками А/Б/В/Г)
      head.insertAdjacentElement('afterend', wrap);
    } else {
      anchor.insertAdjacentElement('beforebegin', wrap);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(mountTopSwipeIndicator, 160);
      setTimeout(mountTopSwipeIndicator, 700);
    });
  } else {
    setTimeout(mountTopSwipeIndicator, 160);
    setTimeout(mountTopSwipeIndicator, 700);
  }
})();

/* === FIX 08: БЛОК 12 — УДАЛЕНИЕ ВСТАВКИ ПРО ПРОБНУЮ ТРЕНИРОВКУ В ФОРМЕ === */
(function applyFix08ContactsClean() {
  var old = document.getElementById('nastya-fix08-contacts-css');
  if (old) old.remove();

  var st = document.createElement('style');
  st.id = 'nastya-fix08-contacts-css';
  st.textContent = [
    '/* Полностью убираем плашку-вставку про пробную тренировку в форме контактов */',
    '#contacts .form-gift, .cta-form-card .form-gift, .form-gift {',
    '  display: none !important;',
    '}',
    '/* Аккуратный отступ под подзаголовком формы на ПК и телефоне */',
    '.cta-form-card p { margin-bottom: 20px !important; }',
    '@media (max-width: 720px) {',
    '  .cta-form-card p { margin-bottom: 16px !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(st);

  function removeFormGiftNodes() {
    document.querySelectorAll('#contacts .form-gift, .cta-form-card .form-gift, .form-gift').forEach(function (el) {
      el.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      removeFormGiftNodes();
      setTimeout(removeFormGiftNodes, 250);
    });
  } else {
    removeFormGiftNodes();
    setTimeout(removeFormGiftNodes, 250);
  }
})();

/* === P01 SYNC: ШАПКА + КНОПКА БЛОКА 1 === */
(function applyP01HeaderAndHeroSync() {
  function syncHeaderAndHero() {
    var d = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.design) || {};
    var customHeader = d['--header-bg'];
    var hdr = document.querySelector('header');
    if (hdr && customHeader && !/^#362215$/i.test(customHeader)) {
      hdr.style.setProperty('background', customHeader, 'important');
    }
    // Проверяем, чтобы на кнопке Блока 1 гарантированно стояла наша HD мини-гантелька нужного размера
    var heroGoldBtn = document.querySelector('.hero .hero-actions .btn-gold');
    if (heroGoldBtn) {
      var ico = heroGoldBtn.querySelector('.bow-dumbbell-ico');
      if (ico && ico.getAttribute('data-hd') !== '2') {
        ico.outerHTML = '<span class="bow-dumbbell-ico" data-hd="2" aria-hidden="true"><svg viewBox="0 0 96 68" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hdbPl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6B462D"/><stop offset="48%" stop-color="#382012"/><stop offset="100%" stop-color="#190D06"/></linearGradient><linearGradient id="hdbGd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF7E6"/><stop offset="45%" stop-color="#E6B672"/><stop offset="100%" stop-color="#8F551D"/></linearGradient><linearGradient id="hdbSk" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="55%" stop-color="#FCECD4"/><stop offset="100%" stop-color="#D7A76B"/></linearGradient></defs><g transform="rotate(-7 48 34)"><rect x="24" y="29.5" width="48" height="8" rx="3.5" fill="url(#hdbGd)" stroke="#321B0E" stroke-width="1.2"/><line x1="27" y1="31.8" x2="69" y2="31.8" stroke="#FFFDF9" stroke-width="1.2" opacity="0.85"/><rect x="4" y="18" width="9.5" height="31" rx="4.5" fill="url(#hdbPl)" stroke="#1A0E07" stroke-width="1.2"/><line x1="7" y1="21.5" x2="7" y2="45.5" stroke="#B6855E" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/><rect x="14.5" y="12" width="12" height="43" rx="5.5" fill="url(#hdbPl)" stroke="#1A0E07" stroke-width="1.2"/><rect x="17.5" y="16" width="2.8" height="35" rx="1.4" fill="url(#hdbGd)"/><rect x="69.5" y="12" width="12" height="43" rx="5.5" fill="url(#hdbPl)" stroke="#1A0E07" stroke-width="1.2"/><rect x="72.5" y="16" width="2.8" height="35" rx="1.4" fill="url(#hdbGd)"/><rect x="82.5" y="18" width="9.5" height="31" rx="4.5" fill="url(#hdbPl)" stroke="#1A0E07" stroke-width="1.2"/><line x1="85.5" y1="21.5" x2="85.5" y2="45.5" stroke="#B6855E" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/><path d="M45 36 L35 58 L41.5 55 L45.5 60.5 L48 38 Z" fill="url(#hdbSk)" stroke="#84511E" stroke-width="1.2" stroke-linejoin="round"/><path d="M51 36 L61 58 L54.5 55 L50.5 60.5 L48 38 Z" fill="url(#hdbSk)" stroke="#84511E" stroke-width="1.2" stroke-linejoin="round"/><path d="M47 32 C34 15, 21 20, 26.5 32 C30 39.5, 40 38, 47 33 Z" fill="url(#hdbSk)" stroke="#84511E" stroke-width="1.35" stroke-linejoin="round"/><path d="M43 32 C36 26.5, 31 27.5, 30.5 31.5" stroke="#BF8644" stroke-width="1.3" stroke-linecap="round"/><path d="M49 32 C62 15, 75 20, 69.5 32 C66 39.5, 56 38, 49 33 Z" fill="url(#hdbSk)" stroke="#84511E" stroke-width="1.35" stroke-linejoin="round"/><path d="M53 32 C60 26.5, 65 27.5, 65.5 31.5" stroke="#BF8644" stroke-width="1.3" stroke-linecap="round"/><rect x="43.5" y="27.5" width="9" height="11" rx="3.8" fill="url(#hdbGd)" stroke="#6C3E14" stroke-width="1.2"/><ellipse cx="47" cy="30.8" rx="1.9" ry="1.3" fill="#FFFFFF" opacity="0.9"/></g></svg></span>';
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      syncHeaderAndHero();
      setTimeout(syncHeaderAndHero, 350);
    });
  } else {
    syncHeaderAndHero();
    setTimeout(syncHeaderAndHero, 350);
  }
})();

/* === P05 SYNC: БЛОКИ 8 И 10 — SVG-СТРЕЛКИ И ЧИСТКА СИРОТСКИХ КНОПОК === */
(function applyP05CarouselSync() {
  var LEFT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  var RIGHT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function syncNavs() {
    document.querySelectorAll('.approach-sec .container > .c-nav, .steps-sec .container > .c-nav').forEach(function (el) {
      el.remove();
    });

    document.querySelectorAll('.fandeck-wrap > .c-nav').forEach(function (nav) {
      var btns = nav.querySelectorAll('.c-arr');
      if (btns.length >= 2) {
        if (!btns[0].querySelector('svg')) btns[0].innerHTML = LEFT_SVG;
        if (!btns[1].querySelector('svg')) btns[1].innerHTML = RIGHT_SVG;
      }
      var wrap = nav.closest('.fandeck-wrap');
      if (wrap) {
        var cards = wrap.querySelectorAll('.fandeck-item');
        nav.querySelectorAll('.c-dots i').forEach(function (dot, idx) {
          if (dot.getAttribute('data-p05-dot') === '1') return;
          dot.setAttribute('data-p05-dot', '1');
          dot.addEventListener('click', function () {
            if (cards[idx]) cards[idx].click();
          });
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(syncNavs, 140);
      setTimeout(syncNavs, 550);
      setTimeout(syncNavs, 1300);
    });
  } else {
    setTimeout(syncNavs, 140);
    setTimeout(syncNavs, 550);
    setTimeout(syncNavs, 1300);
  }
})();

/* === F01 SYNC: ПЕРЕСЧЁТ 3D-ПРИЗМЫ ОТЗЫВОВ ПОСЛЕ ЗАГРУЗКИ СКРИНШОТОВ === */
(function applyF01PhotosAndReviewsSync() {
  function refreshReviewsPrism() {
    var imgs = document.querySelectorAll('#reviewsPrism .review-photo-shot img');
    imgs.forEach(function (img) {
      if (img.getAttribute('data-f01-bound') === '1') return;
      img.setAttribute('data-f01-bound', '1');
      img.addEventListener('load', function () {
        window.dispatchEvent(new Event('resize'));
      });
    });
    window.dispatchEvent(new Event('resize'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(refreshReviewsPrism, 260);
      setTimeout(refreshReviewsPrism, 900);
    });
  } else {
    setTimeout(refreshReviewsPrism, 260);
    setTimeout(refreshReviewsPrism, 900);
  }
})();

/* === PART2 APPROACH PHOTO SYNC === */
(function applyPart2ApproachPhotoSync() {
  function syncApproachPhotos() {
    var ovPhotos = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.photos) || {};
    var cards = document.querySelectorAll('#approach .approach-card img, .approach-sec .fandeck-item img');
    cards.forEach(function (img, idx) {
      var slot = 'approach-' + (idx + 1);
      if (ovPhotos[slot] && img.getAttribute('src') !== ovPhotos[slot]) {
        img.src = ovPhotos[slot];
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(syncApproachPhotos, 140);
      setTimeout(syncApproachPhotos, 600);
    });
  } else {
    setTimeout(syncApproachPhotos, 140);
    setTimeout(syncApproachPhotos, 600);
  }
})();
/* === END PART2 APPROACH PHOTO SYNC === */
