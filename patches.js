/**
 * patches.js — Полный пакет обновлений (Lusion 3D HD, 3D-гантелька 3/4,
 * коричневая шапка, 15 гипсовых барельефов, карусель, фото-отзывы, сканы, закон)
 */
(function () {
  'use strict';

  // 1. ПРЕДОХРАНИТЕЛЬ ПРЕЛОАДЕРА И ЗАЩИТА ФОТО ОТ ПРОПАДАНИЯ
  function unlockPreloader() {
    var pre = document.getElementById('preloader');
    if (pre) pre.classList.add('hidden');
    document.body.classList.add('loaded');
  }
  setTimeout(unlockPreloader, 1000);
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

  // 2. СТИЛИ: КОРИЧНЕВАЯ ШАПКА, 3D-ГАНТЕЛЬКА, КАРУСЕЛЬ, БАРЕЛЬЕФЫ, LUSION
  var styleEl = document.createElement('style');
  styleEl.id = 'nastya-patches-css';
  styleEl.textContent = [
    '/* Убираем плашку с первого фото */',
    '.hero-floating-card { display: none !important; }',

    '/* Коричневая верхняя панель (шапка) в тон темным блокам */',
    'header {',
    '  background: linear-gradient(135deg, rgba(63, 41, 27, 0.96), rgba(42, 26, 16, 0.96)) !important;',
    '  backdrop-filter: blur(18px) !important;',
    '  -webkit-backdrop-filter: blur(18px) !important;',
    '  border-bottom: 1px solid rgba(224, 168, 98, 0.22) !important;',
    '  box-shadow: 0 10px 30px rgba(30, 20, 14, 0.22) !important;',
    '}',
    'header .logo, header .logo-text { color: #FFF6E8 !important; }',
    'header .logo span, header .logo-text span {',
    '  background: linear-gradient(90deg, #F6D9A8, #E0A862) !important;',
    '  -webkit-background-clip: text !important; background-clip: text !important;',
    '  -webkit-text-fill-color: transparent !important; color: #E0A862 !important;',
    '}',
    'header .nav-links a { color: rgba(255, 246, 232, 0.88) !important; font-weight: 500; }',
    'header .nav-links a:hover { color: #F6D9A8 !important; }',
    'header .btn-primary {',
    '  background: linear-gradient(135deg, #F6D9A8, #C9904E) !important;',
    '  color: #2B1A0E !important; font-weight: 700 !important;',
    '  box-shadow: 0 8px 20px rgba(201, 144, 78, 0.32) !important;',
    '}',
    'header .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(201, 144, 78, 0.48) !important; }',
    'header .burger { border-color: rgba(246, 217, 168, 0.35) !important; background: rgba(255, 251, 245, 0.1) !important; }',
    'header .burger span { background: #FFF6E8 !important; }',

    '/* Плавное слияние фото Насти с фоном и легкое парение */',
    '@keyframes softLevitate {',
    '  0%, 100% { transform: translateY(0px); }',
    '  50% { transform: translateY(calc(-1 * var(--float-amp, 7px))); }',
    '}',
    '.hero-visual, .about-photo-main {',
    '  background: transparent !important; box-shadow: none !important; overflow: visible !important; position: relative;',
    '}',
    '.hero-visual::before, .about-photo-main::before {',
    '  content: ""; position: absolute; inset: 5% 3%; border-radius: 50%;',
    '  background: radial-gradient(circle, rgba(224,168,98,0.26) 0%, rgba(138,100,70,0.09) 55%, transparent 78%);',
    '  filter: blur(24px); z-index: 0; pointer-events: none;',
    '}',
    '.hero-visual img, .about-photo-main img {',
    '  position: relative; z-index: 1; border-radius: 28px;',
    '  -webkit-mask-image: radial-gradient(ellipse var(--feather-x, 88%) var(--feather-y, 88%) at 50% 48%, #000 58%, rgba(0,0,0,0.65) 78%, transparent 100%);',
    '  mask-image: radial-gradient(ellipse var(--feather-x, 88%) var(--feather-y, 88%) at 50% 48%, #000 58%, rgba(0,0,0,0.65) 78%, transparent 100%);',
    '  animation: softLevitate 6.5s ease-in-out infinite !important;',
    '  filter: drop-shadow(0 22px 38px rgba(63,41,27,0.12));',
    '}',

    '/* Компактная 3D-иконка гантельки с бантиком (вполоборота) */',
    '.bow-dumbbell-ico {',
    '  display: inline-flex !important; align-items: center; justify-content: center;',
    '  vertical-align: middle; width: 26px !important; height: 22px !important;',
    '  margin-right: 7px; flex-shrink: 0; transform: translateY(-1px);',
    '}',
    '.bow-dumbbell-ico svg { width: 26px !important; height: 22px !important; display: block; overflow: visible; }',

    '/* 3D-блок в стиле Lusion.co (эффект глубокого окна в невесомость) */',
    '.lusion-sec { padding: 10px 0 80px; position: relative; z-index: 2; }',
    '.lusion-card {',
    '  position: relative; height: var(--lusion-h, 360px); border-radius: 32px; overflow: hidden;',
    '  background: radial-gradient(750px 380px at 72% 45%, rgba(224,168,98,0.28), transparent 65%), radial-gradient(500px 300px at 20% 15%, rgba(138,100,70,0.22), transparent 60%), linear-gradient(145deg, #24150D 0%, #3F291B 48%, #1B100A 100%);',
    '  box-shadow: 0 32px 74px rgba(42,26,16,0.34), inset 0 0 65px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,246,232,0.22);',
    '  display: flex; align-items: center; justify-content: space-between; padding: 40px 52px; color: #FFF6E8; user-select: none;',
    '}',
    '.lusion-canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; cursor: grab; }',
    '.lusion-canvas:active { cursor: grabbing; }',
    '.lusion-info {',
    '  position: relative; z-index: 2; max-width: 360px; pointer-events: none;',
    '  background: radial-gradient(circle at 30% 50%, rgba(36,21,13,0.68), transparent 85%);',
    '  padding: 12px 16px 12px 0; border-radius: 20px;',
    '}',
    '.lusion-info .eyebrow { color: #E7C08A; margin-bottom: 8px; }',
    '.lusion-info h3 { color: #FFF6E8; font-size: clamp(1.85rem, 3.2vw, 2.55rem); margin-bottom: 10px; line-height: 1.1; }',
    '.lusion-info h3 i { background: linear-gradient(100deg, #F6D9A8, #E0A862); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }',
    '.lusion-info p { color: rgba(255,246,232,0.84); font-size: 0.9rem; line-height: 1.55; margin: 0; }',
    '.lusion-hint {',
    '  position: absolute; right: 28px; bottom: 20px; z-index: 2; pointer-events: none;',
    '  font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase;',
    '  color: #F6D9A8; background: rgba(27,16,10,0.55);',
    '  backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 999px;',
    '  border: 1px solid rgba(246,217,168,0.28); box-shadow: 0 8px 20px rgba(0,0,0,0.25);',
    '}',
    '@media (max-width: 720px) {',
    '  .lusion-sec { padding: 6px 0 48px; }',
    '  .lusion-card { height: 320px; padding: 24px 20px; align-items: flex-start; border-radius: 26px; }',
    '  .lusion-info { max-width: 100%; }',
    '  .lusion-info h3 { font-size: 1.6rem; }',
    '  .lusion-info p { font-size: 0.82rem; }',
    '  .lusion-hint { right: 16px; bottom: 14px; font-size: 0.65rem; }',
    '}',

    '/* 15 скульптурных гипсовых барельефов (четкий объем и рельеф на стене) */',
    '.wall-relief-host { position: relative; overflow: hidden; }',
    '.wall-relief-host > .container, .wall-relief-host > .faq-container { position: relative; z-index: 2; }',
    '.wall-sculpture {',
    '  position: absolute; pointer-events: none; z-index: 1;',
    '  opacity: var(--relief-opacity, 0.68);',
    '  filter: drop-shadow(-6px -6px 9px rgba(255,255,255,0.96)) drop-shadow(7px 10px 15px rgba(63,41,27,0.28));',
    '}',
    '.wall-sculpture.on-dark {',
    '  opacity: calc(var(--relief-opacity, 0.68) * 0.85);',
    '  filter: drop-shadow(-4px -4px 8px rgba(255,235,205,0.22)) drop-shadow(7px 11px 16px rgba(0,0,0,0.68));',
    '}',
    '@media (max-width: 720px) {',
    '  .wall-sculpture { transform: scale(0.65); opacity: calc(var(--relief-opacity, 0.68) * 0.65); }',
    '}',

    '/* Стильные центрированные кнопки и точки для всех каруселей */',
    '.fandeck-wrap .c-nav {',
    '  display: flex !important; align-items: center; justify-content: center;',
    '  gap: 18px; margin: 30px auto 4px; width: 100%;',
    '}',
    '.fandeck-wrap .c-arr {',
    '  width: 46px !important; height: 46px !important; border-radius: 50% !important;',
    '  border: 1px solid rgba(63, 41, 27, 0.18) !important;',
    '  background: linear-gradient(145deg, #FFFBF5, #F2E6D3) !important;',
    '  color: #3F291B !important; font-size: 1.45rem !important; font-weight: 600;',
    '  display: inline-flex !important; align-items: center; justify-content: center;',
    '  cursor: pointer; box-shadow: 0 10px 24px rgba(63, 41, 27, 0.12) !important;',
    '  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1) !important; line-height: 1; padding: 0 !important;',
    '}',
    '.fandeck-wrap .c-arr:hover {',
    '  background: linear-gradient(135deg, #4A2F20, #2E1C11) !important;',
    '  color: #F6D9A8 !important; border-color: #3F291B !important;',
    '  transform: translateY(-2px) scale(1.05); box-shadow: 0 14px 28px rgba(63, 41, 27, 0.24) !important;',
    '}',
    '.fandeck-wrap .c-dots {',
    '  display: flex !important; align-items: center; gap: 8px;',
    '}',
    '.fandeck-wrap .c-dots i {',
    '  display: block; width: 8px; height: 8px; border-radius: 999px;',
    '  background: rgba(63, 41, 27, 0.24); cursor: pointer; transition: all 0.35s ease;',
    '}',
    '.fandeck-wrap .c-dots i.on {',
    '  width: 26px; background: linear-gradient(90deg, #E0A862, #B8733F);',
    '}',

    '/* Отзывы (только фото) и Сертификаты (сканы) */',
    '.review-card .review-text { display: none !important; }',
    '.review-photo-shot {',
    '  width: 100%; aspect-ratio: 3 / 3.8; border-radius: 14px; overflow: hidden;',
    '  background: var(--bg-taupe); margin: 6px 0 16px; position: relative;',
    '  border: 1px solid var(--border-soft); cursor: zoom-in;',
    '}',
    '.review-photo-shot img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s ease; }',
    '.review-photo-shot:hover img { transform: scale(1.03); }',
    '.review-zoom-tag {',
    '  position: absolute; right: 10px; bottom: 10px; background: rgba(63,41,27,0.78);',
    '  color: #FFFBF5; font-size: 0.68rem; font-weight: 600; padding: 4px 10px; border-radius: 999px;',
    '}',
    '.cert-scan-card {',
    '  background: var(--bg-milk); border: 1px solid var(--border-soft); border-radius: var(--radius-md);',
    '  padding: 14px; cursor: zoom-in; transition: var(--transition); position: relative; overflow: hidden;',
    '}',
    '.cert-scan-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(63,41,27,0.14); }',
    '.cert-scan-card img { width: 100%; aspect-ratio: 3 / 4.1; object-fit: cover; border-radius: 10px; background: var(--bg-taupe); }',
    '.cert-scan-caption { font-size: 0.8rem; font-weight: 600; color: var(--deep-choco); text-align: center; margin-top: 10px; }',

    '/* Веерная 3D-карусель (Fan Deck) */',
    '.fandeck-wrap { position: relative; padding: 18px 0 10px; user-select: none; }',
    '.fandeck-stage {',
    '  position: relative; width: 100%; max-width: 980px; margin: 0 auto;',
    '  height: 430px; perspective: 1400px; touch-action: pan-y; cursor: grab;',
    '}',
    '.steps-sec .fandeck-stage { height: 280px; }',
    '.fandeck-stage:active { cursor: grabbing; }',
    '.fandeck-item {',
    '  position: absolute; left: 50%; top: 10px;',
    '  width: min(420px, 84vw); margin-left: calc(min(420px, 84vw) / -2);',
    '  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease, box-shadow 0.65s ease;',
    '  border-radius: var(--radius-md); transform-origin: 50% 90%;',
    '}',
    '.fandeck-item > * { height: 100%; margin: 0 !important; }',

    '/* Лайтбокс, Cookie и Юридические модалки */',
    '#nastyaLightbox {',
    '  position: fixed; inset: 0; background: rgba(24,15,10,0.88); backdrop-filter: blur(8px);',
    '  z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;',
    '  opacity: 0; visibility: hidden; transition: 0.3s ease; cursor: zoom-out;',
    '}',
    '#nastyaLightbox.open { opacity: 1; visibility: visible; }',
    '#nastyaLightbox img { max-width: min(92vw, 760px); max-height: 88vh; border-radius: 16px; box-shadow: 0 28px 70px rgba(0,0,0,0.5); object-fit: contain; }',
    '.cookie-float {',
    '  position: fixed; left: 20px; bottom: 20px; z-index: 9500;',
    '  max-width: 430px; background: rgba(255,251,245,0.96); backdrop-filter: blur(14px);',
    '  border: 1px solid rgba(63,41,27,0.16); border-radius: 18px; padding: 16px 20px;',
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
    '.footer-selfemployed { margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(250,247,242,0.08); font-size: 0.73rem; color: rgba(250,247,242,0.42); line-height: 1.55; }'
  ].join('\n');
  document.head.appendChild(styleEl);

  // 3. 3D-ГАНТЕЛЬКА ВПОЛОБОРОТА (3/4 ИЗОМЕТРИЯ) С ЧЕТКИМ АТЛАСНЫМ БАНТИКОМ
  var DUMBBELL_BOW_MINI = [
    '<span class="bow-dumbbell-ico" aria-hidden="true">',
    '<svg viewBox="0 0 64 52" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '  <defs>',
    '    <linearGradient id="isoGold1" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0%" stop-color="#FFF3D1"/><stop offset="45%" stop-color="#E5AE63"/><stop offset="100%" stop-color="#8C5219"/>',
    '    </linearGradient>',
    '    <linearGradient id="isoDark1" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0%" stop-color="#5C3B24"/><stop offset="100%" stop-color="#26170D"/>',
    '    </linearGradient>',
    '    <linearGradient id="isoBow1" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="60%" stop-color="#FFE8C2"/><stop offset="100%" stop-color="#D99B4E"/>',
    '    </linearGradient>',
    '  </defs>',
    '  <!-- Тень под гантелькой -->',
    '  <ellipse cx="33" cy="45" rx="24" ry="4.5" fill="rgba(43,26,14,0.28)" transform="rotate(-14 33 45)"/>',
    '  <!-- Задний правый диск (перспектива 3/4) -->',
    '  <g transform="rotate(-16 32 28)">',
    '    <ellipse cx="50" cy="28" rx="6.5" ry="13.5" fill="url(#isoDark1)"/>',
    '    <ellipse cx="47" cy="28" rx="6.5" ry="13.5" fill="url(#isoGold1)" stroke="#6E3F11" stroke-width="0.8"/>',
    '    <ellipse cx="53.5" cy="28" rx="4.5" ry="9.5" fill="url(#isoGold1)" stroke="#6E3F11" stroke-width="0.7"/>',
    '    <!-- Гриф в перспективе -->',
    '    <path d="M18 24.5 L47 24.5 C49 24.5 49 31.5 47 31.5 L18 31.5 Z" fill="url(#isoDark1)"/>',
    '    <path d="M18 25.5 L46 25.5 C47.5 25.5 47.5 28.5 46 28.5 L18 28.5 Z" fill="#FFF5E4" opacity="0.65"/>',
    '    <!-- Передний левый диск (крупнее, с 3D-фаской) -->',
    '    <ellipse cx="18" cy="28" rx="7" ry="14.5" fill="url(#isoDark1)"/>',
    '    <ellipse cx="15" cy="28" rx="7" ry="14.5" fill="url(#isoGold1)" stroke="#6E3F11" stroke-width="0.9"/>',
    '    <ellipse cx="11.5" cy="28" rx="5" ry="10.5" fill="url(#isoDark1)"/>',
    '    <ellipse cx="9.5" cy="28" rx="5" ry="10.5" fill="url(#isoGold1)" stroke="#FFF6E5" stroke-width="0.7"/>',
    '    <ellipse cx="9.5" cy="28" rx="2.2" ry="4.5" fill="#4A2E1B"/>',
    '    <!-- Объемный 3D-бантик сверху -->',
    '    <path d="M29 25 L23 41 L28 39 L31 43 L33 26 Z" fill="url(#isoBow1)" stroke="#8C5219" stroke-width="0.9"/>',
    '    <path d="M35 25 L42 40 L37 38 L34 42 L32 26 Z" fill="url(#isoBow1)" stroke="#8C5219" stroke-width="0.9"/>',
    '    <path d="M32 24 C21 10, 12 17, 19 25 C22 29, 28 27, 32 24 Z" fill="url(#isoBow1)" stroke="#8C5219" stroke-width="1"/>',
    '    <path d="M32 24 C43 10, 52 17, 45 25 C42 29, 36 27, 32 24 Z" fill="url(#isoBow1)" stroke="#8C5219" stroke-width="1"/>',
    '    <path d="M23 19 C26 17, 29 20, 31 23" stroke="#B8733F" stroke-width="1" stroke-linecap="round"/>',
    '    <path d="M41 19 C38 17, 35 20, 33 23" stroke="#B8733F" stroke-width="1" stroke-linecap="round"/>',
    '    <ellipse cx="32" cy="24" rx="4.2" ry="4.8" fill="url(#isoGold1)" stroke="#FFFFFF" stroke-width="0.9"/>',
    '  </g>',
    '</svg></span>'
  ].join('');

  var DUMBBELL_BOW_HERO_SVG = [
    '<svg class="gift-svg" viewBox="0 0 220 165" aria-hidden="true">',
    '  <defs>',
    '    <linearGradient id="hdGold" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0%" stop-color="#FFF6DF"/><stop offset="38%" stop-color="#F0BE78"/><stop offset="75%" stop-color="#C48337"/><stop offset="100%" stop-color="#6E3F12"/>',
    '    </linearGradient>',
    '    <linearGradient id="hdSide" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0%" stop-color="#784B22"/><stop offset="50%" stop-color="#3F2613"/><stop offset="100%" stop-color="#1E1108"/>',
    '    </linearGradient>',
    '    <linearGradient id="hdRibbon" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="55%" stop-color="#FFF0D4"/><stop offset="100%" stop-color="#E2AE6C"/>',
    '    </linearGradient>',
    '  </defs>',
    '  <ellipse cx="112" cy="144" rx="74" ry="12" fill="rgba(0,0,0,0.32)" transform="rotate(-12 112 144)"/>',
    '  <g transform="rotate(-14 110 86)">',
    '    <!-- Дальний правый блок дисков в изометрии -->',
    '    <ellipse cx="164" cy="86" rx="18" ry="40" fill="url(#hdSide)"/>',
    '    <ellipse cx="154" cy="86" rx="18" ry="40" fill="url(#hdGold)" stroke="#FFF3D6" stroke-width="1.2"/>',
    '    <ellipse cx="176" cy="86" rx="13" ry="29" fill="url(#hdSide)"/>',
    '    <ellipse cx="170" cy="86" rx="13" ry="29" fill="url(#hdGold)" stroke="#9E6324" stroke-width="1"/>',
    '    <!-- Хромированный гриф -->',
    '    <path d="M62 76 L156 76 C162 76 162 96 156 96 L62 96 Z" fill="url(#hdSide)"/>',
    '    <path d="M62 79 L154 79 C158 79 158 87 154 87 L62 87 Z" fill="#FFFDF9" opacity="0.8"/>',
    '    <!-- Ближний левый блок дисков в изометрии 3/4 -->',
    '    <ellipse cx="66" cy="86" rx="20" ry="44" fill="url(#hdSide)"/>',
    '    <ellipse cx="55" cy="86" rx="20" ry="44" fill="url(#hdGold)" stroke="#FFF6DF" stroke-width="1.5"/>',
    '    <ellipse cx="44" cy="86" rx="15" ry="32" fill="url(#hdSide)"/>',
    '    <ellipse cx="36" cy="86" rx="15" ry="32" fill="url(#hdGold)" stroke="#FFF6DF" stroke-width="1.3"/>',
    '    <ellipse cx="34" cy="86" rx="6.5" ry="13" fill="url(#hdSide)" stroke="#F0BE78" stroke-width="1.2"/>',
    '    <!-- Пышный 3D-бантик сверху -->',
    '    <g class="gift-lid" style="transform-origin: 108px 78px;">',
    '      <path d="M100 84 L82 132 L96 126 L104 137 L108 86 Z" fill="url(#hdRibbon)" stroke="#B8733F" stroke-width="1.5"/>',
    '      <path d="M116 84 L136 130 L122 124 L114 135 L110 86 Z" fill="url(#hdRibbon)" stroke="#B8733F" stroke-width="1.5"/>',
    '      <path d="M108 78 C76 34, 44 50, 62 78 C70 92, 92 88, 108 78 Z" fill="url(#hdRibbon)" stroke="#B8733F" stroke-width="1.8"/>',
    '      <path d="M108 78 C140 34, 172 50, 154 78 C146 92, 124 88, 108 78 Z" fill="url(#hdRibbon)" stroke="#B8733F" stroke-width="1.8"/>',
    '      <path d="M74 64 C84 58, 96 66, 104 75" stroke="#C9904E" stroke-width="2.2" stroke-linecap="round"/>',
    '      <path d="M142 64 C132 58, 120 66, 112 75" stroke="#C9904E" stroke-width="2.2" stroke-linecap="round"/>',
    '      <rect x="98" y="65" width="20" height="24" rx="8" fill="url(#hdGold)" stroke="#FFFFFF" stroke-width="1.8"/>',
    '    </g>',
    '  </g>',
    '</svg>'
  ].join('');

  function replaceAllGiftIcons() {
    document.querySelectorAll('#contactFormatSelect option').forEach(function (opt) {
      if (opt.textContent.indexOf('🎁') >= 0) opt.textContent = opt.textContent.replace(/🎁/g, '✦');
    });
    document.querySelectorAll('.btn-gold, .form-gift, .step-card h3').forEach(function (el) {
      if (el.innerHTML.indexOf('🎁') >= 0) el.innerHTML = el.innerHTML.replace(/🎁/g, DUMBBELL_BOW_MINI);
    });
    var giftSvg = document.querySelector('.gift-art .gift-svg');
    if (giftSvg) giftSvg.outerHTML = DUMBBELL_BOW_HERO_SVG;
  }

  // 4. 15 ВЫСОКОРЕЛЬЕФНЫХ БАРЕЛЬЕФОВ СПОРТ-ИНВЕНТАРЯ (РАВНОМЕРНО ПО САЙТУ)
  var RELIEF_SHAPES = {
    dumbbell: '<g transform="rotate(-22 60 60)"><rect x="12" y="40" width="11" height="40" rx="4.5"/><rect x="25" y="30" width="15" height="60" rx="6"/><rect x="40" y="52" width="40" height="16" rx="4"/><rect x="80" y="30" width="15" height="60" rx="6"/><rect x="97" y="40" width="11" height="40" rx="4.5"/></g>',
    kettlebell: '<path d="M40 35 C40 17, 80 17, 80 35 L74 44 C90 53, 94 78, 83 94 C74 105, 46 105, 37 94 C26 78, 30 53, 46 44 Z M49 35 C49 26, 71 26, 71 35 L67 42 L53 42 Z"/>',
    barbell: '<g transform="rotate(15 60 60)"><rect x="4" y="55" width="112" height="10" rx="4"/><rect x="15" y="28" width="10" height="64" rx="4"/><rect x="27" y="36" width="8" height="48" rx="3"/><rect x="85" y="36" width="8" height="48" rx="3"/><rect x="95" y="28" width="10" height="64" rx="4"/></g>',
    shaker: '<g transform="rotate(-12 60 60)"><rect x="43" y="18" width="34" height="9" rx="3"/><rect x="37" y="27" width="46" height="11" rx="4"/><path d="M40 40 H80 L74 102 C74 107, 46 107, 46 102 Z"/></g>',
    sneaker: '<g transform="rotate(-14 60 60)"><path d="M16 75 C20 58, 38 54, 52 42 L65 55 C78 57, 98 61, 105 74 C107 82, 101 88, 90 88 H20 C15 88, 14 82, 16 75 Z"/><rect x="14" y="84" width="92" height="10" rx="5"/></g>',
    pilatesRing: '<g><circle cx="60" cy="60" r="35" stroke="url(#relGrad)" stroke-width="12" fill="none"/><rect x="50" y="14" width="20" height="11" rx="4.5"/><rect x="50" y="95" width="20" height="11" rx="4.5"/></g>',
    jumprope: '<g><path d="M28 84 C16 40, 42 16, 60 16 C78 16, 104 40, 92 84" stroke="url(#relGrad)" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="21" y="79" width="14" height="28" rx="5"/><rect x="85" y="79" width="14" height="28" rx="5"/></g>',
    plate: '<g><circle cx="60" cy="60" r="41" stroke="url(#relGrad)" stroke-width="18" fill="none"/><circle cx="60" cy="60" r="13" stroke="url(#relGrad)" stroke-width="7" fill="none"/></g>',
    stopwatch: '<g><rect x="50" y="12" width="20" height="9" rx="3.5"/><circle cx="60" cy="64" r="37" stroke="url(#relGrad)" stroke-width="11" fill="none"/><path d="M60 43 V64 L75 73" stroke="url(#relGrad)" stroke-width="8" stroke-linecap="round" fill="none"/></g>',
    matRoll: '<g transform="rotate(-26 60 60)"><rect x="18" y="42" width="84" height="36" rx="18"/></g>'
  };

  function injectBasReliefs() {
    document.querySelectorAll('.wall-sculpture').forEach(function (e) { e.remove(); });
    var placements = [
      { sel: '.hero', shape: 'dumbbell', left: '3%', top: '15%', size: 165, rot: -15 },
      { sel: '.hero', shape: 'pilatesRing', left: '44%', top: '74%', size: 145, rot: 12 },
      { sel: '.goals-sec', shape: 'barbell', left: '16%', top: '12%', size: 180, rot: 8, dark: true },
      { sel: '.goals-sec', shape: 'kettlebell', left: '78%', top: '64%', size: 155, rot: -14, dark: true },
      { sel: '.cases-sec', shape: 'sneaker', left: '64%', top: '6%', size: 170, rot: -8 },
      { sel: '.cases-sec', shape: 'shaker', left: '6%', top: '72%', size: 155, rot: 18 },
      { sel: '.gift-sec', shape: 'plate', left: '86%', top: '12%', size: 155, rot: 0 },
      { sel: '.reviews-sec', shape: 'jumprope', left: '24%', top: '10%', size: 165, rot: -10 },
      { sel: '.reviews-sec', shape: 'dumbbell', left: '83%', top: '68%', size: 160, rot: 24 },
      { sel: '.about-sec', shape: 'matRoll', left: '42%', top: '8%', size: 165, rot: 15 },
      { sel: '.about-sec', shape: 'kettlebell', left: '5%', top: '74%', size: 155, rot: -12 },
      { sel: '.approach-sec', shape: 'stopwatch', left: '74%', top: '10%', size: 160, rot: 10 },
      { sel: '.services-sec', shape: 'barbell', left: '32%', top: '78%', size: 185, rot: -12 },
      { sel: '.steps-sec', shape: 'sneaker', left: '10%', top: '16%', size: 165, rot: 14 },
      { sel: '.faq-sec', shape: 'pilatesRing', left: '82%', top: '48%', size: 165, rot: -18 }
    ];

    placements.forEach(function (p, i) {
      var host = document.querySelector(p.sel);
      if (!host) return;
      host.classList.add('wall-relief-host');
      var wrap = document.createElement('div');
      wrap.className = 'wall-sculpture' + (p.dark ? ' on-dark' : '');
      wrap.style.left = p.left;
      wrap.style.top = p.top;
      wrap.style.width = p.size + 'px';
      wrap.style.height = p.size + 'px';
      wrap.style.transform = 'rotate(' + (p.rot || 0) + 'deg)';
      var gid = 'relGrad_' + i;
      var stops = p.dark
        ? '<stop offset="0%" stop-color="#6E4B34"/><stop offset="55%" stop-color="#472E1E"/><stop offset="100%" stop-color="#22140C"/>'
        : '<stop offset="0%" stop-color="#FFFDF9"/><stop offset="52%" stop-color="#E5D6C2"/><stop offset="100%" stop-color="#C4AF95"/>';
      var strokeCol = p.dark ? 'rgba(255,235,205,0.28)' : 'rgba(255,255,255,0.92)';
      var shapeHtml = RELIEF_SHAPES[p.shape].replace(/url\(#relGrad\)/g, 'url(#' + gid + ')');
      wrap.innerHTML = '<svg viewBox="0 0 120 120" width="100%" height="100%" style="fill:url(#' + gid + '); stroke:' + strokeCol + '; stroke-width:1.4; overflow:visible;"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' + stops + '</linearGradient></defs>' + shapeHtml + '</svg>';
      host.insertBefore(wrap, host.firstChild);
    });
  }

  // 5. 3D-ОКНО В СТИЛЕ LUSION.CO (28 КРУПНЫХ HD-СНАРЯДОВ В НЕВЕСОМОСТИ + КОЛЛИЗИИ)
  function insertLusionBlock() {
    if (document.getElementById('lusionSection')) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var sec = document.createElement('section');
    sec.className = 'lusion-sec';
    sec.id = 'lusionSection';
    sec.innerHTML = [
      '<div class="container">',
      '  <div class="lusion-card">',
      '    <canvas class="lusion-canvas" id="lusionCanvas"></canvas>',
      '    <div class="lusion-info">',
      '      <span class="eyebrow">Эстетика движения • 3D</span>',
      '      <h3>Твоя форма — это <i>искусство</i></h3>',
      '      <p>Проведи курсором сквозь невесомость: каждый снаряд и деталь тренировочного процесса работают в единой системе.</p>',
      '    </div>',
      '    <span class="lusion-hint">✦ Интерактивное 3D-измерение</span>',
      '  </div>',
      '</div>'
    ].join('');
    hero.insertAdjacentElement('afterend', sec);

    if (window.THREE) {
      startLusionScene();
    } else {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = startLusionScene;
      document.head.appendChild(s);
    }
  }

  function startLusionScene() {
    var canvas = document.getElementById('lusionCanvas');
    if (!canvas || !window.THREE) return;
    var THREE = window.THREE;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 12.5);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;

    // Генерируем студийную HDR-карту окружения (PMREM) для реалистичных бликов как на lusion.co
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x2A1A10);
    var lBox1 = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.MeshBasicMaterial({ color: 0xFFF5E1, side: THREE.DoubleSide }));
    lBox1.position.set(8, 9, 10); lBox1.lookAt(0, 0, 0); envScene.add(lBox1);
    var lBox2 = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshBasicMaterial({ color: 0xE0A862, side: THREE.DoubleSide }));
    lBox2.position.set(-10, -6, 6); lBox2.lookAt(0, 0, 0); envScene.add(lBox2);
    var lBox3 = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide }));
    lBox3.position.set(0, 12, -6); lBox3.lookAt(0, 0, 0); envScene.add(lBox3);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;

    scene.add(new THREE.AmbientLight(0xFFF6E8, 0.55));
    var keyLight = new THREE.DirectionalLight(0xFFF3D6, 1.8);
    keyLight.position.set(7, 10, 9);
    scene.add(keyLight);
    var rimLight = new THREE.SpotLight(0xE0A862, 2.2, 30, 0.8, 0.5);
    rimLight.position.set(-8, 6, 8);
    scene.add(rimLight);
    var fillLight = new THREE.PointLight(0xC9904E, 1.4, 25);
    fillLight.position.set(4, -6, 6);
    scene.add(fillLight);

    // Премиальные PBR-материалы с гладким лаком (clearcoat) и металлом
    var matGold = new THREE.MeshPhysicalMaterial({ color: 0xE5AE63, metalness: 0.88, roughness: 0.14, clearcoat: 0.6, clearcoatRoughness: 0.1 });
    var matCream = new THREE.MeshPhysicalMaterial({ color: 0xFFF5E6, metalness: 0.08, roughness: 0.18, clearcoat: 0.85, clearcoatRoughness: 0.12 });
    var matChoco = new THREE.MeshPhysicalMaterial({ color: 0x3D2516, metalness: 0.15, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.2 });
    var matBronze = new THREE.MeshPhysicalMaterial({ color: 0xB8733F, metalness: 0.78, roughness: 0.2, clearcoat: 0.5 });
    var matChrome = new THREE.MeshPhysicalMaterial({ color: 0xF5EFE6, metalness: 0.95, roughness: 0.08 });
    var matList = [matGold, matCream, matChoco, matBronze];

    // Высокополигональный сглаженный диск с фаской через LatheGeometry
    function makeBevelPlateGeo(radius, thickness) {
      var r = radius, t = thickness / 2, b = Math.min(0.05, t * 0.45);
      var pts = [
        new THREE.Vector2(0.08, -t),
        new THREE.Vector2(r - b, -t),
        new THREE.Vector2(r, -t + b),
        new THREE.Vector2(r, t - b),
        new THREE.Vector2(r - b, t),
        new THREE.Vector2(0.08, t)
      ];
      return new THREE.LatheGeometry(pts, 48);
    }

    var plateBigGeo = makeBevelPlateGeo(0.54, 0.18);
    var plateSmallGeo = makeBevelPlateGeo(0.42, 0.15);
    var barPlateGeo = makeBevelPlateGeo(0.62, 0.16);

    function createProItem(kind, mMain, mSub) {
      var g = new THREE.Group();
      if (kind === 0) {
        // 1. Детальная 3D-гантель с гладкими фасками и хромированным грифом
        var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.55, 36), matChrome);
        handle.rotation.z = Math.PI / 2;
        g.add(handle);
        [-0.44, 0.44].forEach(function (x) {
          var p1 = new THREE.Mesh(plateBigGeo, mMain);
          p1.rotation.z = Math.PI / 2; p1.position.x = x; g.add(p1);
        });
        [-0.64, 0.64].forEach(function (x) {
          var p2 = new THREE.Mesh(plateSmallGeo, mSub);
          p2.rotation.z = Math.PI / 2; p2.position.x = x; g.add(p2);
        });
      } else if (kind === 1) {
        // 2. Скульптурная 3D-гиря (LatheGeometry + изогнутая дужка)
        var kbPts = [
          new THREE.Vector2(0, -0.52),
          new THREE.Vector2(0.36, -0.52),
          new THREE.Vector2(0.55, -0.25),
          new THREE.Vector2(0.58, 0.08),
          new THREE.Vector2(0.42, 0.38),
          new THREE.Vector2(0.22, 0.45),
          new THREE.Vector2(0, 0.45)
        ];
        var kbBody = new THREE.Mesh(new THREE.LatheGeometry(kbPts, 48), mMain);
        kbBody.position.y = -0.1;
        g.add(kbBody);
        var kbRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.095, 24, 48), mSub);
        kbRing.position.y = 0.36;
        g.add(kbRing);
      } else if (kind === 2) {
        // 3. Спортивная бутылка / шейкер с талией, крышкой и золотым кольцом
        var bPts = [
          new THREE.Vector2(0, -0.62),
          new THREE.Vector2(0.32, -0.62),
          new THREE.Vector2(0.36, -0.52),
          new THREE.Vector2(0.35, -0.05),
          new THREE.Vector2(0.30, 0.15),
          new THREE.Vector2(0.37, 0.38),
          new THREE.Vector2(0.34, 0.46),
          new THREE.Vector2(0, 0.46)
        ];
        var bottle = new THREE.Mesh(new THREE.LatheGeometry(bPts, 48), mMain);
        g.add(bottle);
        var band = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.035, 16, 48), matGold);
        band.rotation.x = Math.PI / 2; band.position.y = 0.32; g.add(band);
        var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.22, 36), mSub);
        cap.position.y = 0.56; g.add(cap);
        var spout = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.16, 24), matGold);
        spout.position.set(0.1, 0.70, 0); g.add(spout);
      } else if (kind === 3) {
        // 4. Кольцо для пилатеса / эспандер с мягкими накладками
        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.075, 28, 64), mMain);
        g.add(ring);
        [-0.58, 0.58].forEach(function (y) {
          var pad = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.36, 28), mSub);
          pad.rotation.z = Math.PI / 2; pad.position.y = y; g.add(pad);
        });
      } else if (kind === 4) {
        // 5. Мини-штанга с тройными блинами и замками
        var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 2.2, 32), matChrome);
        bar.rotation.z = Math.PI / 2; g.add(bar);
        [-0.68, 0.68].forEach(function (x) {
          var p = new THREE.Mesh(barPlateGeo, mMain);
          p.rotation.z = Math.PI / 2; p.position.x = x; g.add(p);
        });
        [-0.86, 0.86].forEach(function (x) {
          var p = new THREE.Mesh(plateSmallGeo, mSub);
          p.rotation.z = Math.PI / 2; p.position.x = x; g.add(p);
        });
      } else {
        // 6. Рельефный массажный МФР-ролл
        var core = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.35, 40), mMain);
        core.rotation.z = Math.PI / 2; g.add(core);
        var capInner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.38, 32), mSub);
        capInner.rotation.z = Math.PI / 2; g.add(capInner);
        [-0.45, -0.15, 0.15, 0.45].forEach(function (x) {
          var rib = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 16, 40), mMain);
          rib.rotation.y = Math.PI / 2; rib.position.x = x; g.add(rib);
        });
      }
      return g;
    }

    // Создаем 28 крупных снарядов, распределенных по всему объему "окна"
    var items = [];
    var totalItems = 28;
    for (var i = 0; i < totalItems; i++) {
      var m1 = matList[i % matList.length];
      var m2 = matList[(i + 1) % matList.length];
      var mesh = createProItem(i % 6, m1, m2);
      var scale = 1.12 + (i % 4) * 0.12;
      mesh.scale.set(scale, scale, scale);

      // Равномерная сетка + глубина по всему окну (с акцентом на центр и правую часть)
      var col = i % 7;
      var row = Math.floor(i / 7);
      var bx = -4.2 + col * 1.65 + (Math.random() - 0.5) * 0.9;
      var by = -1.95 + row * 1.3 + (Math.random() - 0.5) * 0.7;
      var bz = (Math.random() - 0.5) * 3.4;
      mesh.position.set(bx, by, bz);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      mesh.userData = {
        home: new THREE.Vector3(bx, by, bz),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0),
        rx: (Math.random() - 0.5) * 0.012,
        ry: (Math.random() - 0.5) * 0.014,
        rz: (Math.random() - 0.5) * 0.01,
        phase: Math.random() * Math.PI * 2,
        radius: 0.78 * scale
      };
      scene.add(mesh);
      items.push(mesh);
    }

    var pointer = new THREE.Vector3(999, 999, 0);
    var camTarget = new THREE.Vector2(0, 0);

    function movePointer(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      var nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -((clientY - rect.top) / rect.height) * 2 + 1;
      pointer.set(nx * 6.8, ny * 2.9, 0);
      camTarget.set(nx * 0.55, ny * 0.35);
    }
    canvas.addEventListener('mousemove', function (e) { movePointer(e.clientX, e.clientY); });
    canvas.addEventListener('mouseleave', function () { pointer.set(999, 999, 0); camTarget.set(0, 0); });
    canvas.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) movePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    var clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      var t = clock.getElapsedTime();

      // Параллакс камеры (эффект "окна в другое измерение")
      camera.position.x += (camTarget.x - camera.position.x) * 0.05;
      camera.position.y += (camTarget.y - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var u = it.userData;

        // Невесомое парение вокруг своей орбиты
        var floatX = u.home.x + Math.sin(t * 0.9 + u.phase) * 0.28;
        var floatY = u.home.y + Math.cos(t * 1.1 + u.phase) * 0.28;
        var floatZ = u.home.z + Math.sin(t * 0.7 + u.phase) * 0.25;

        u.vel.x += (floatX - it.position.x) * 0.012;
        u.vel.y += (floatY - it.position.y) * 0.012;
        u.vel.z += (floatZ - it.position.z) * 0.012;

        // Мощное упругое отталкивание от мышки (как на lusion.co)
        var dx = it.position.x - pointer.x;
        var dy = it.position.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        var hitR = 2.65;
        if (d2 < hitR * hitR && d2 > 0.0001) {
          var d = Math.sqrt(d2);
          var force = Math.pow((hitR - d) / hitR, 1.5) * 0.14;
          u.vel.x += (dx / d) * force;
          u.vel.y += (dy / d) * force;
          u.vel.z += (Math.sin(u.phase) * 0.5) * force;
          it.rotation.x += force * 0.45;
          it.rotation.y += force * 0.45;
        }

        // Упругие столкновения предметов друг с другом в невесомости
        for (var j = i + 1; j < items.length; j++) {
          var other = items[j];
          var ox = it.position.x - other.position.x;
          var oy = it.position.y - other.position.y;
          var oz = it.position.z - other.position.z;
          var distSq = ox * ox + oy * oy + oz * oz;
          var minDist = u.radius + other.userData.radius;
          if (distSq < minDist * minDist && distSq > 0.0001) {
            var dist = Math.sqrt(distSq);
            var push = (minDist - dist) * 0.025;
            var nx = ox / dist, ny = oy / dist, nz = oz / dist;
            u.vel.x += nx * push; u.vel.y += ny * push; u.vel.z += nz * push;
            other.userData.vel.x -= nx * push; other.userData.vel.y -= ny * push; other.userData.vel.z -= nz * push;
          }
        }

        u.vel.multiplyScalar(0.91);
        it.position.add(u.vel);
        it.rotation.x += u.rx;
        it.rotation.y += u.ry;
        it.rotation.z += u.rz;
      }
      renderer.render(scene, camera);
    }
    tick();

    window.addEventListener('resize', function () {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  }

  // 6. ЛАЙТБОКС, ОТЗЫВЫ (ФОТО), СКАНЫ СЕРТИФИКАТОВ И КАРУСЕЛЬ
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
    img.src = src; img.alt = alt || '';
    lb.classList.add('open');
  };

  function rebuildPhotoReviews() {
    if (!window.SITE_DATA || !window.SITE_DATA.reviews) return;
    var container = document.getElementById('reviewsContainer');
    if (!container) return;
    var ovPhotos = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.photos) || {};
    container.innerHTML = window.SITE_DATA.reviews.map(function (r, idx) {
      var slotKey = 'review-' + (idx + 1);
      var imgSrc = ovPhotos[slotKey] || r.img || ('photos/' + slotKey + '.jpg');
      var safeName = (r.name || '').replace(/'/g, "\\'");
      var safeProg = (r.program || '').replace(/'/g, "\\'");
      return [
        '<div class="review-card">',
        '  <div>',
        '    <div class="review-top">',
        '      <div class="review-avatar">',
        '        <img data-slot="' + slotKey + '" src="' + imgSrc + '" onerror="photoFallback(this)" loading="lazy" alt="' + safeName + '">',
        '      </div>',
        '      <div>',
        '        <strong style="display:block; font-size:0.95rem; color:var(--deep-choco);">' + (r.name || '') + '</strong>',
        '        <span style="font-size:0.78rem; color:var(--text-muted);">' + (r.program || '') + '</span>',
        '      </div>',
        '    </div>',
        '    <span class="review-badge">' + (r.badge || '') + '</span>',
        '    <div class="review-photo-shot" onclick="openNastyaLightbox(this.querySelector(\'img\').src, \'' + safeName + '\')">',
        '      <img data-slot="' + slotKey + '" src="' + imgSrc + '" onerror="photoFallback(this)" loading="lazy" alt="Отзыв ' + safeName + '">',
        '      <span class="review-zoom-tag">🔍 Увеличить</span>',
        '    </div>',
        '  </div>',
        '  <button class="btn btn-outline" style="width:100%; padding:10px 16px; font-size:0.78rem;" onclick="openModal(\'' + safeProg + '\')">Выбрать этот формат</button>',
        '</div>'
      ].join('');
    }).join('');
    var prismMount = document.getElementById('reviewsPrism');
    if (prismMount) rebuildPrismWidget(prismMount, container);
  }

  function rebuildPrismWidget(mount, src) {
    var cards = Array.prototype.slice.call(src.children);
    var n = cards.length;
    if (n < 3) return;
    var idx = 0, drag = 0, w = 0, cw = 0, R = 0, step = 0;
    mount.innerHTML = '<div class="prism-scene"><div class="prism-box"></div></div><div class="c-nav"><button class="c-arr" aria-label="Назад">‹</button><div class="c-dots">' + cards.map(function () { return '<i></i>'; }).join('') + '</div><button class="c-arr" aria-label="Вперёд">›</button></div>';
    var scene = mount.querySelector('.prism-scene'), box = mount.querySelector('.prism-box');
    var faces = cards.map(function (c) {
      var f = document.createElement('div');
      f.className = 'prism-face'; f.appendChild(c.cloneNode(true)); box.appendChild(f);
      f._d = null; f._r = 0; return f;
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
        f.style.setProperty('--sh', (Math.min(1, a) * 0.6).toFixed(3));
        f.style.pointerEvents = a > 1.3 ? 'none' : '';
      });
      var cur = ((idx % n) + n) % n;
      mount.querySelectorAll('.c-dots i').forEach(function (dot, j) { dot.classList.toggle('on', j === cur); });
    }
    function layout() {
      w = scene.clientWidth; if (!w) return;
      var desk = w > 720;
      cw = desk ? Math.min(430, w * 0.38) : Math.min(w * 0.78, 320);
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

  function setupCertificateScans() {
    window.STOCK = window.STOCK || {};
    var defaultCertStock = [
      'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80'
    ];
    for (var i = 1; i <= 4; i++) {
      if (!window.STOCK['photos/cert-' + i]) window.STOCK['photos/cert-' + i] = defaultCertStock[i - 1];
    }
    if (window.SITE_DATA && !window.SITE_DATA.certs) {
      var ovCerts = window.SITE_OVERRIDES && window.SITE_OVERRIDES.lists && window.SITE_OVERRIDES.lists.certs;
      window.SITE_DATA.certs = ovCerts || [
        { title: 'Диплом • Персональный фитнес-тренер', img: 'photos/cert-1.jpg' },
        { title: 'Сертификат • Биомеханика и осанка', img: 'photos/cert-2.jpg' },
        { title: 'Сертификат • Нутрициология и КБЖУ', img: 'photos/cert-3.jpg' },
        { title: 'Сертификат • Стретчинг и МФР', img: 'photos/cert-4.jpg' }
      ];
    }
    var certsGrid = document.querySelector('#about-certs .certs-grid');
    if (!certsGrid || !window.SITE_DATA || !window.SITE_DATA.certs) return;
    var ovPhotos = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.photos) || {};
    certsGrid.innerHTML = window.SITE_DATA.certs.map(function (c, idx) {
      var slot = 'cert-' + (idx + 1);
      var src = ovPhotos[slot] || c.img || ('photos/' + slot + '.jpg');
      var safeTitle = (c.title || 'Сертификат').replace(/'/g, "\\'");
      return [
        '<div class="cert-scan-card" onclick="openNastyaLightbox(this.querySelector(\'img\').src, \'' + safeTitle + '\')">',
        '  <img data-slot="' + slot + '" src="' + src + '" onerror="photoFallback(this)" loading="lazy" alt="' + safeTitle + '">',
        '  <div class="cert-scan-caption">' + (c.title || '') + '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  function buildFanDeckCarousel(containerId, hidePrismId) {
    var src = document.getElementById(containerId);
    if (!src) return;
    if (hidePrismId) {
      var pr = document.getElementById(hidePrismId);
      if (pr) pr.style.setProperty('display', 'none', 'important');
    }
    src.style.setProperty('display', 'none', 'important');
    var nextNav = src.nextElementSibling;
    if (nextNav && nextNav.classList.contains('c-nav')) nextNav.style.display = 'none';

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
      var shiftX = isMobile ? 42 : 240;
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
          el.style.opacity = '1'; el.style.zIndex = '10';
          el.style.boxShadow = '0 26px 54px rgba(63,41,27,0.20)';
        } else if (abs === 1) {
          var dir = diff > 0 ? 1 : -1;
          el.style.transform = 'translate3d(' + (dir * shiftX) + 'px, 14px, -40px) rotateZ(' + (dir * 4.5) + 'deg) rotateY(' + (-dir * 14) + 'deg) scale(0.91)';
          el.style.opacity = isMobile ? '0.45' : '0.82'; el.style.zIndex = '6';
          el.style.boxShadow = '0 14px 30px rgba(63,41,27,0.12)';
        } else {
          var dir2 = diff > 0 ? 1 : -1;
          el.style.transform = 'translate3d(' + (dir2 * shiftX * 1.55) + 'px, 28px, -120px) rotateZ(' + (dir2 * 8) + 'deg) scale(0.82)';
          el.style.opacity = '0'; el.style.zIndex = '2'; el.style.boxShadow = 'none';
        }
      });
      if (maxH > 120) stage.style.height = (maxH + 28) + 'px';
      wrap.querySelectorAll('.c-dots i').forEach(function (d, idx) {
        d.classList.toggle('on', idx === active);
        d.onclick = function () { active = idx; renderDeck(); };
      });
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
      if (Math.abs(dx) > 40) {
        active = dx < 0 ? (active + 1) % n : (active - 1 + n) % n;
        renderDeck();
      }
    });
    window.addEventListener('resize', renderDeck);
    setTimeout(renderDeck, 80);
  }

  // 7. ЮРИДИЧЕСКАЯ УПАКОВКА И ЯНДЕКС ФОРМЫ
  var DEFAULT_PRIVACY = '1. ОБЩИЕ ПОЛОЖЕНИЯ\nНастоящая Политика обработки персональных данных составлена в соответствии с ФЗ РФ от 27.07.2006 № 152-ФЗ «О персональных данных».\nОператором персональных данных является плательщик налога на профессиональный доход (самозанятая) Парфенова Анастасия.\n\n2. ОБРАБАТЫВАЕМЫЕ ДАННЫЕ\n• Имя пользователя;\n• Контактный телефон, никнейм в Telegram / WhatsApp или e-mail;\n• Файлы cookie.\n\n3. ЦЕЛИ ОБРАБОТКИ\nСвязь с пользователем для записи на пробную тренировку, консультацию и оказание услуг онлайн-ведения.';
  var DEFAULT_OFFER = 'ПУБЛИЧНАЯ ОФЕРТА НА ОКАЗАНИЕ ОНЛАЙН-УСЛУГ ПО ФИТНЕС-СОПРОВОЖДЕНИЮ\n\n1. ОБЩИЕ ПОЛОЖЕНИЯ\nОфициальное предложение плательщика НПД (самозанятой, ФЗ № 422-ФЗ) Парфеновой Анастасии заключить договор возмездного оказания услуг по проведению онлайн-тренировок и составлению рекомендаций по рациону.\n\n2. ОПЛАТА И ЧЕКИ\nСтоимость указана в разделе «Услуги и форматы работы». После оплаты формируется чек в приложении ФНС «Мой налог».';

  window.openLegalModal = function (kind) {
    var modal = document.getElementById('nastyaLegalModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.id = 'nastyaLegalModal';
      modal.innerHTML = '<div class="modal-box legal-modal-box"><button class="modal-close" type="button" onclick="document.getElementById(\'nastyaLegalModal\').classList.remove(\'open\')">✕</button><span class="eyebrow">Юридическая информация</span><h3 id="legalModalHeading" style="font-size:1.75rem;"></h3><div class="legal-modal-body" id="legalModalText"></div></div>';
      modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });
      document.body.appendChild(modal);
    }
    var st = window.SITE_SETTINGS || {};
    document.getElementById('legalModalHeading').textContent = kind === 'offer' ? 'Пользовательское соглашение (Публичная оферта)' : 'Политика конфиденциальности и обработки ПДн';
    document.getElementById('legalModalText').textContent = kind === 'offer' ? (st.legalOffer || DEFAULT_OFFER) : (st.legalPrivacy || DEFAULT_PRIVACY);
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
      var note = f.querySelector('.form-note'); if (note) note.style.display = 'none';
      var btn = f.querySelector('button[type="submit"]');
      var row = document.createElement('label');
      row.className = 'legal-check-row';
      row.innerHTML = '<input type="checkbox" required checked><span>Я соглашаюсь с <a onclick="openLegalModal(\'privacy\'); return false;">Политикой обработки персональных данных</a> и условиями <a onclick="openLegalModal(\'offer\'); return false;">Публичной оферты</a>.</span>';
      if (btn) btn.insertAdjacentElement('beforebegin', row); else f.appendChild(row);
    });
    try {
      if (!localStorage.getItem('nastya_cookie_ok') && !document.getElementById('nastyaCookieBar')) {
        var bar = document.createElement('div');
        bar.className = 'cookie-float'; bar.id = 'nastyaCookieBar';
        bar.innerHTML = '<div>Сайт использует файлы cookie в соответствии с <a onclick="openLegalModal(\'privacy\')">Политикой конфиденциальности</a>.</div><button type="button" class="cookie-btn" onclick="localStorage.setItem(\'nastya_cookie_ok\',\'1\'); this.parentElement.remove();">Принять</button>';
        document.body.appendChild(bar);
      }
    } catch (e) {}
  }

  function hookYandexForms() {
    var origSubmit = window.handleFormSubmit;
    if (!origSubmit || origSubmit._hooked) return;
    window.handleFormSubmit = async function (e, sourceName) {
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

  function registerAdminConfig() {
    if (!window.SITE_EDIT) return;
    window.SITE_EDIT.lists = window.SITE_EDIT.lists || {};
    window.SITE_EDIT.lists.certs = 'Образование и сертификаты (сканы)';
    window.SITE_EDIT.photoSlots = window.SITE_EDIT.photoSlots || {};
    for (var i = 1; i <= 4; i++) {
      window.SITE_EDIT.photoSlots['cert-' + i] = { label: 'Скан сертификата / диплома №' + i, hint: 'вертикальный или горизонтальный скан' };
    }
    var extraSettings = [
      { key: 'yandexFormUrl', kind: 'plain', label: 'Ссылка на Яндекс Форму (необязательно)', def: '' },
      { key: 'legalFio', kind: 'plain', label: 'ФИО самозанятой (в подвале и оферте)', def: 'Парфенова Анастасия' },
      { key: 'legalInn', kind: 'plain', label: 'ИНН самозанятой', def: 'уточняется при оформлении чека' },
      { key: 'featherEdge', kind: 'plain', label: 'Мягкость слияния краев фото Насти с фоном (75% - 98%)', def: '88%' },
      { key: 'floatAmp', kind: 'plain', label: 'Амплитуда парения фото Насти (например 7px)', def: '7px' },
      { key: 'reliefOpacity', kind: 'plain', label: 'Заметность 15 фоновых барельефов (от 0.25 до 0.85)', def: '0.68' }
    ];
    window.SITE_EDIT.settings = window.SITE_EDIT.settings || [];
    extraSettings.forEach(function (es) {
      if (!window.SITE_EDIT.settings.some(function (x) { return x.key === es.key; })) window.SITE_EDIT.settings.push(es);
    });
    var o = (window.SITE_OVERRIDES || {}).settings || {};
    window.SITE_SETTINGS = window.SITE_SETTINGS || {};
    window.SITE_EDIT.settings.forEach(function (s) {
      window.SITE_SETTINGS[s.key] = (o[s.key] != null && o[s.key] !== '') ? o[s.key] : s.def;
    });
    var root = document.documentElement;
    if (window.SITE_SETTINGS.featherEdge) {
      root.style.setProperty('--feather-x', window.SITE_SETTINGS.featherEdge);
      root.style.setProperty('--feather-y', window.SITE_SETTINGS.featherEdge);
    }
    if (window.SITE_SETTINGS.floatAmp) root.style.setProperty('--float-amp', window.SITE_SETTINGS.floatAmp);
    if (window.SITE_SETTINGS.reliefOpacity) root.style.setProperty('--relief-opacity', window.SITE_SETTINGS.reliefOpacity);
    var d = (window.SITE_OVERRIDES || {}).design || {};
    Object.keys(d).forEach(function (cssVar) { if (d[cssVar]) root.style.setProperty(cssVar, d[cssVar]); });
  }

  function initAllPatches() {
    registerAdminConfig();
    syncAllPhotos();
    insertLusionBlock();
    injectBasReliefs();
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
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initAllPatches, 30); });
  } else {
    setTimeout(initAllPatches, 30);
  }
})();
