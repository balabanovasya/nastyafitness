/**
 * patches.js — ЧАСТЬ 1 из 2
 * Визуальные, 3D, структурные и юридические обновления поверх index.html
 */
(function () {
  'use strict';

  // ==========================================================================
  // 1. ПРЕДОХРАНИТЕЛЬ ПРЕЛОАДЕРА И СИНХРОНИЗАЦИЯ ФОТО (БЕЗ ПРОПАДАНИЯ)
  // ==========================================================================
  function unlockPreloader() {
    var pre = document.getElementById('preloader');
    if (pre) pre.classList.add('hidden');
    document.body.classList.add('loaded');
  }
  setTimeout(unlockPreloader, 1200);
  window.addEventListener('load', function () { setTimeout(unlockPreloader, 600); });

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
      if (slot && ph[slot]) {
        img.src = ph[slot];
      }
    });
    if (window.SITE_DATA) {
      if (ov.lists) {
        Object.keys(ov.lists).forEach(function (k) {
          if (ov.lists[k]) window.SITE_DATA[k] = ov.lists[k];
        });
      }
    }
  }

  // ==========================================================================
  // 2. ИНЪЕКЦИЯ СТИЛЕЙ (МАСКИ ФОТО, БАРЕЛЬЕФЫ, 3D LUSION, КАРУСЕЛЬ, ЗАКОН)
  // ==========================================================================
  var styleEl = document.createElement('style');
  styleEl.id = 'nastya-patches-css';
  styleEl.textContent = [
    '/* 1. Убираем плашку с первого фото */',
    '.hero-floating-card { display: none !important; }',

    '/* 2. Плавное слияние фото Насти с фоном и легкое парение */',
    '@keyframes softLevitate {',
    '  0%, 100% { transform: translateY(0px); }',
    '  50% { transform: translateY(calc(-1 * var(--float-amp, 7px))); }',
    '}',
    '.hero-visual, .about-photo-main {',
    '  background: transparent !important;',
    '  box-shadow: none !important;',
    '  overflow: visible !important;',
    '  position: relative;',
    '}',
    '.hero-visual::before, .about-photo-main::before {',
    '  content: "";',
    '  position: absolute;',
    '  inset: 6% 4%;',
    '  border-radius: 50%;',
    '  background: radial-gradient(circle, rgba(224,168,98,0.24) 0%, rgba(138,100,70,0.08) 55%, transparent 78%);',
    '  filter: blur(22px);',
    '  z-index: 0;',
    '  pointer-events: none;',
    '}',
    '.hero-visual img, .about-photo-main img {',
    '  position: relative;',
    '  z-index: 1;',
    '  border-radius: 28px;',
    '  -webkit-mask-image: radial-gradient(ellipse var(--feather-x, 88%) var(--feather-y, 88%) at 50% 48%, #000 58%, rgba(0,0,0,0.65) 78%, transparent 100%);',
    '  mask-image: radial-gradient(ellipse var(--feather-x, 88%) var(--feather-y, 88%) at 50% 48%, #000 58%, rgba(0,0,0,0.65) 78%, transparent 100%);',
    '  animation: softLevitate 6.5s ease-in-out infinite !important;',
    '  filter: drop-shadow(0 22px 38px rgba(63,41,27,0.12));',
    '}',

    '/* 3. Иконка гантельки с бантиком */',
    '. bow-dumbbell-ico { display: inline-flex; align-items: center; vertical-align: middle; width: 28px; height: 18px; margin-right: 6px; flex-shrink: 0; }',
    '.bow-dumbbell-ico svg { width: 100%; height: 100%; overflow: visible; }',

    '/* 4. 3D-блок в стиле Lusion.co (размер под карточку подарка) */',
    '.lusion-sec { padding: 8px 0 76px; position: relative; z-index: 2; }',
    '.lusion-card {',
    '  position: relative;',
    '  height: var(--lusion-h, 330px);',
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
    '.lusion-info { position: relative; z-index: 2; max-width: 390px; pointer-events: none; }',
    '.lusion-info .eyebrow { color: #E7C08A; margin-bottom: 8px; }',
    '.lusion-info h3 { color: #FFF6E8; font-size: clamp(1.75rem, 3.1vw, 2.45rem); margin-bottom: 10px; line-height: 1.12; }',
    '.lusion-info h3 i { background: linear-gradient(100deg, #F6D9A8, #E0A862); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }',
    '.lusion-info p { color: rgba(255,246,232,0.8); font-size: 0.9rem; line-height: 1.55; margin: 0; }',
    '.lusion-hint {',
    '  position: absolute; right: 28px; bottom: 20px; z-index: 2; pointer-events: none;',
    '  font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase;',
    '  color: rgba(246,217,168,0.75); background: rgba(30,20,14,0.38);',
    '  backdrop-filter: blur(8px); padding: 7px 14px; border-radius: 999px;',
    '  border: 1px solid rgba(246,217,168,0.2);',
    '}',
    '@media (max-width: 720px) {',
    '  .lusion-sec { padding: 4px 0 46px; }',
    '  .lusion-card { height: 290px; padding: 24px 20px; align-items: flex-start; border-radius: 26px; }',
    '  .lusion-info { max-width: 100%; }',
    '  .lusion-info h3 { font-size: 1.55rem; }',
    '  .lusion-info p { font-size: 0.82rem; }',
    '  .lusion-hint { right: 16px; bottom: 14px; font-size: 0.65rem; }',
    '}',

    '/* 5. Скульптурные барельефы на стенах (15 точек равномерно по сайту) */',
    '.wall-relief-host { position: relative; overflow: hidden; }',
    '.wall-relief-host > .container, .wall-relief-host > .faq-container { position: relative; z-index: 2; }',
    '.wall-sculpture {',
    '  position: absolute;',
    '  pointer-events: none;',
    '  z-index: 1;',
    '  opacity: var(--relief-opacity, 0.22);',
    '  transition: opacity 0.4s ease;',
    '  filter: drop-shadow(-4px -4px 7px rgba(255,255,255,0.92)) drop-shadow(5px 7px 12px rgba(63,41,27,0.19));',
    '}',
    '.wall-sculpture.on-dark {',
    '  opacity: calc(var(--relief-opacity, 0.22) * 0.9);',
    '  filter: drop-shadow(-3px -3px 6px rgba(255,238,210,0.16)) drop-shadow(5px 8px 14px rgba(0,0,0,0.55));',
    '}',
    '@media (max-width: 720px) {',
    '  .wall-sculpture { transform: scale(0.68); opacity: calc(var(--relief-opacity, 0.22) * 0.75); }',
    '}',

    '/* 6. Отзывы (только фото без цитат) и Сертификаты (сканы) */',
    '.review-card .review-text { display: none !important; }',
    '.review-photo-shot {',
    '  width: 100%; aspect-ratio: 3 / 3.8; border-radius: 14px; overflow: hidden;',
    '  background: var(--bg-taupe); margin: 6px 0 16px; position: relative;',
    '  border: 1px solid var(--border-soft); cursor: zoom-in;',
    '}',
    '.review-photo-shot img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s ease; }',
    '.review-photo-shot:hover img { transform: scale(1.03); }',
    '.review-zoom-tag {',
    '  position: absolute; right: 10px; bottom: 10px;',
    '  background: rgba(63,41,27,0.78); color: #FFFBF5;',
    '  font-size: 0.68rem; font-weight: 600; padding: 4px 10px; border-radius: 999px;',
    '}',
    '.cert-scan-card {',
    '  background: var(--bg-milk); border: 1px solid var(--border-soft);',
    '  border-radius: var(--radius-md); padding: 14px; cursor: zoom-in;',
    '  transition: var(--transition); position: relative; overflow: hidden;',
    '}',
    '.cert-scan-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(63,41,27,0.14); }',
    '.cert-scan-card img { width: 100%; aspect-ratio: 3 / 4.1; object-fit: cover; border-radius: 10px; background: var(--bg-taupe); }',
    '.cert-scan-caption { font-size: 0.8rem; font-weight: 600; color: var(--deep-choco); text-align: center; margin-top: 10px; }',

    '/* 7. Веерная 3D-карусель (Fan Deck) для блока "Как устроена работа" */',
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

    '/* 8. Лайтбокс, Cookie-баннер и Юридические модалки */',
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

  // ==========================================================================
  // 3. ГАНТЕЛЬКА С БАНТИКОМ (ЗАМЕНА ПОДАРКОВ ВЕЗДЕ НА САЙТЕ)
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
    '    <!-- Левые блины гантели -->',
    '    <rect x="14" y="42" width="14" height="48" rx="6" fill="url(#dbPlate)"/>',
    '    <rect x="30" y="32" width="18" height="68" rx="7" fill="url(#dbPlate)"/>',
    '    <!-- Гриф -->',
    '    <rect x="46" y="58" width="88" height="16" rx="5" fill="#FFF1D6"/>',
    '    <!-- Правые блины гантели -->',
    '    <rect x="132" y="32" width="18" height="68" rx="7" fill="url(#dbPlate)"/>',
    '    <rect x="152" y="42" width="14" height="48" rx="6" fill="url(#dbPlate)"/>',
    '    <!-- Праздничный бантик на грифе -->',
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

  function replaceAllGiftIcons() {
    // 1. В <option> селекта убираем 🎁 (внутри option нельзя ставить тег svg)
    document.querySelectorAll('#contactFormatSelect option').forEach(function (opt) {
      if (opt.textContent.indexOf('🎁') >= 0) {
        opt.textContent = opt.textContent.replace(/🎁/g, '✦');
      }
    });
    // 2. В кнопках, плашке формы и заголовках шагов ставим SVG гантельки с бантиком
    document.querySelectorAll('.btn-gold, .form-gift, .step-card h3').forEach(function (el) {
      if (el.innerHTML.indexOf('🎁') >= 0) {
        el.innerHTML = el.innerHTML.replace(/🎁/g, DUMBBELL_BOW_MINI);
      }
    });
    // 3. В секции подарка меняем коробку на большую гантельку с бантиком
    var giftSvg = document.querySelector('.gift-art .gift-svg');
    if (giftSvg) {
      giftSvg.outerHTML = DUMBBELL_BOW_HERO_SVG;
    }
  }

  // ==========================================================================
  // 4. 15 БАРЕЛЬЕФОВ СПОРТ-ИНВЕНТАРЯ (РАВНОМЕРНО ПО ВСЕМУ САЙТУ)
  // ==========================================================================
  var RELIEF_SHAPES = {
    dumbbell: '<g transform="rotate(-22 60 60)"><rect x="14" y="42" width="10" height="36" rx="4"/><rect x="26" y="34" width="13" height="52" rx="5"/><rect x="39" y="53" width="42" height="14" rx="4"/><rect x="81" y="34" width="13" height="52" rx="5"/><rect x="96" y="42" width="10" height="36" rx="4"/></g>',
    kettlebell: '<path d="M42 36 C42 20, 78 20, 78 36 L72 44 C88 52, 92 76, 82 92 C74 102, 46 102, 38 92 C28 76, 32 52, 48 44 Z M50 36 C50 28, 70 28, 70 36 L66 42 L54 42 Z"/>',
    barbell: '<g transform="rotate(16 60 60)"><rect x="6" y="56" width="108" height="8" rx="3"/><rect x="16" y="30" width="9" height="60" rx="3"/><rect x="27" y="38" width="7" height="44" rx="2.5"/><rect x="86" y="38" width="7" height="44" rx="2.5"/><rect x="95" y="30" width="9" height="60" rx="3"/></g>',
    shaker: '<g transform="rotate(-12 60 60)"><path d="M44 20 H76 V28 H82 V38 H38 V28 H44 Z"/><path d="M40 42 H80 L75 102 C75 106, 45 106, 45 102 Z"/><rect x="46" y="56" width="28" height="6" rx="3" fill="rgba(63,41,27,0.12)"/></g>',
    sneaker: '<g transform="rotate(-15 60 60)"><path d="M18 76 C22 60, 38 56, 52 44 L64 56 C76 58, 96 62, 104 74 C106 82, 100 88, 90 88 H22 C16 88, 15 82, 18 76 Z"/><rect x="16" y="84" width="88" height="9" rx="4.5"/></g>',
    pilatesRing: '<g><circle cx="60" cy="60" r="34" stroke="currentColor" stroke-width="10" fill="none"/><rect x="52" y="16" width="16" height="10" rx="4"/><rect x="52" y="94" width="16" height="10" rx="4"/></g>',
    jumprope: '<g><path d="M30 84 C18 42, 42 18, 60 18 C78 18, 102 42, 90 84" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="23" y="80" width="12" height="26" rx="4"/><rect x="85" y="80" width="12" height="26" rx="4"/></g>',
    plate: '<g><circle cx="60" cy="60" r="40" stroke="currentColor" stroke-width="16" fill="none"/><circle cx="60" cy="60" r="12" stroke="currentColor" stroke-width="6" fill="none"/></g>',
    stopwatch: '<g><rect x="52" y="14" width="16" height="8" rx="3"/><circle cx="60" cy="64" r="36" stroke="currentColor" stroke-width="10" fill="none"/><path d="M60 44 V64 L74 72" stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none"/></g>',
    matRoll: '<g transform="rotate(-28 60 60)"><rect x="20" y="44" width="80" height="32" rx="16"/><circle cx="34" cy="60" r="9" fill="rgba(63,41,27,0.15)"/></g>'
  };

  function injectBasReliefs() {
    document.querySelectorAll('.wall-sculpture').forEach(function (e) { e.remove(); });
    // 15 точек РАВНОМЕРНО по всей ширине и высоте сайта (слева, левее центра, по центру, правее центра, справа)
    var placements = [
      { sel: '.hero', shape: 'dumbbell', left: '4%', top: '14%', size: 150, rot: -15 },
      { sel: '.hero', shape: 'pilatesRing', left: '46%', top: '76%', size: 130, rot: 12 },
      { sel: '.goals-sec', shape: 'barbell', left: '18%', top: '10%', size: 165, rot: 8, dark: true },
      { sel: '.goals-sec', shape: 'kettlebell', left: '78%', top: '68%', size: 145, rot: -14, dark: true },
      { sel: '.cases-sec', shape: 'sneaker', left: '62%', top: '8%', size: 155, rot: -8 },
      { sel: '.cases-sec', shape: 'shaker', left: '8%', top: '74%', size: 140, rot: 18 },
      { sel: '.gift-sec', shape: 'plate', left: '86%', top: '18%', size: 140, rot: 0 },
      { sel: '.reviews-sec', shape: 'jumprope', left: '28%', top: '12%', size: 150, rot: -10 },
      { sel: '.reviews-sec', shape: 'dumbbell', left: '84%', top: '70%', size: 145, rot: 24 },
      { sel: '.about-sec', shape: 'matRoll', left: '42%', top: '10%', size: 155, rot: 15 },
      { sel: '.about-sec', shape: 'kettlebell', left: '6%', top: '78%', size: 140, rot: -12 },
      { sel: '.approach-sec', shape: 'stopwatch', left: '72%', top: '14%', size: 145, rot: 10 },
      { sel: '.services-sec', shape: 'barbell', left: '34%', top: '82%', size: 170, rot: -12 },
      { sel: '.steps-sec', shape: 'sneaker', left: '12%', top: '18%', size: 150, rot: 14 },
      { sel: '.faq-sec', shape: 'pilatesRing', left: '82%', top: '52%', size: 150, rot: -18 }
    ];

    placements.forEach(function (p) {
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
      var fillCol = p.dark ? '#4B3222' : '#EFE6D8';
      wrap.innerHTML = '<svg viewBox="0 0 120 120" width="100%" height="100%" style="color:' + fillCol + '; fill:' + fillCol + '; overflow:visible;">' + RELIEF_SHAPES[p.shape] + '</svg>';
      host.insertBefore(wrap, host.firstChild);
    });
  }

  // ==========================================================================
  // 5. 3D-АНИМАЦИЯ В СТИЛЕ LUSION.CO МЕЖДУ 1 И 2 БЛОКАМИ
  // ==========================================================================
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
      '      <p>Коснись или проведи курсором: каждый снаряд и деталь тренировочного процесса работают в единой системе.</p>',
      '    </div>',
      '    <span class="lusion-hint">✦ Интерактивная 3D-сцена</span>',
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
    var camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene.add(new THREE.AmbientLight(0xFFF6E8, 0.75));
    var d1 = new THREE.DirectionalLight(0xF6D9A8, 1.35);
    d1.position.set(6, 8, 7);
    scene.add(d1);
    var d2 = new THREE.PointLight(0xC9904E, 1.1, 20);
    d2.position.set(-6, -4, 5);
    scene.add(d2);

    var mats = [
      new THREE.MeshStandardMaterial({ color: 0xE0A862, metalness: 0.65, roughness: 0.22 }),
      new THREE.MeshStandardMaterial({ color: 0xFFF3E0, metalness: 0.15, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ color: 0x5A3A27, metalness: 0.25, roughness: 0.45 }),
      new THREE.MeshStandardMaterial({ color: 0xC9904E, metalness: 0.8, roughness: 0.18 })
    ];

    function makeItem(kind, m1, m2) {
      var g = new THREE.Group();
      if (kind === 0) {
        // 3D Гантель
        var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.25, 16), m2);
        bar.rotation.z = Math.PI / 2;
        g.add(bar);
        [-0.55, -0.38, 0.38, 0.55].forEach(function (x, idx) {
          var r = (idx === 0 || idx === 3) ? 0.34 : 0.44;
          var w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14, 20), m1);
          w.rotation.z = Math.PI / 2;
          w.position.x = x;
          g.add(w);
        });
      } else if (kind === 1) {
        // 3D Гиря
        var body = new THREE.Mesh(new THREE.SphereGeometry(0.46, 20, 20), m1);
        g.add(body);
        var handle = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 12, 24, Math.PI), m2);
        handle.position.y = 0.38;
        g.add(handle);
      } else if (kind === 2) {
        // 3D Шейкер / спортивная бутылка
        var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.95, 20), m1);
        g.add(cup);
        var lid = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.16, 20), m2);
        lid.position.y = 0.52;
        g.add(lid);
      } else {
        // Стилизованный 3D-кроссовок / кольцо пилатеса
        var sole = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.22, 0.44), m2);
        sole.position.y = -0.18;
        g.add(sole);
        var upper = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.78, 16), m1);
        upper.rotation.z = Math.PI / 2.3;
        upper.position.set(-0.08, 0.06, 0);
        g.add(upper);
      }
      return g;
    }

    var items = [];
    for (var i = 0; i < 16; i++) {
      var m1 = mats[i % mats.length];
      var m2 = mats[(i + 1) % mats.length];
      var mesh = makeItem(i % 4, m1, m2);
      var bx = (Math.random() - 0.32) * 7.5;
      var by = (Math.random() - 0.5) * 3.2;
      var bz = (Math.random() - 0.5) * 2.2;
      mesh.position.set(bx, by, bz);
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      mesh.userData = {
        home: new THREE.Vector3(bx, by, bz),
        vel: new THREE.Vector3(),
        rx: (Math.random() - 0.5) * 0.015,
        ry: (Math.random() - 0.5) * 0.015
      };
      scene.add(mesh);
      items.push(mesh);
    }

    var pointer = new THREE.Vector3(999, 999, 0);
    function movePointer(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      var nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -((clientY - rect.top) / rect.height) * 2 + 1;
      pointer.set(nx * 5.2, ny * 2.4, 0);
    }
    canvas.addEventListener('mousemove', function (e) { movePointer(e.clientX, e.clientY); });
    canvas.addEventListener('mouseleave', function () { pointer.set(999, 999, 0); });
    canvas.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) movePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    function tick() {
      requestAnimationFrame(tick);
      items.forEach(function (it) {
        var u = it.userData;
        // Притяжение к домашней точке (пружина)
        u.vel.x += (u.home.x - it.position.x) * 0.018;
        u.vel.y += (u.home.y - it.position.y) * 0.018;
        u.vel.z += (u.home.z - it.position.z) * 0.018;
        // Отталкивание от курсора как на lusion.co
        var dx = it.position.x - pointer.x;
        var dy = it.position.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 3.6 && d2 > 0.001) {
          var d = Math.sqrt(d2);
          var f = (1.9 - d) * 0.065;
          u.vel.x += (dx / d) * f;
          u.vel.y += (dy / d) * f;
          it.rotation.x += f * 0.4;
          it.rotation.y += f * 0.4;
        }
        u.vel.multiplyScalar(0.9);
        it.position.add(u.vel);
        it.rotation.x += u.rx;
        it.rotation.y += u.ry;
      });
      renderer.render(scene, camera);
    }
    tick();

    window.addEventListener('resize', function () {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  }// ==========================================================================
  // 6. ЛАЙТБОКС ДЛЯ УВЕЛИЧЕНИЯ ОТЗЫВОВ И СЕРТИФИКАТОВ ПО КЛИКУ
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

  // ==========================================================================
  // 7. ОТЗЫВЫ: ТОЛЬКО ФОТО БЕЗ ТЕКСТА С КАВЫЧКАМИ + ПЕРЕСБОРКА 3D-ПРИЗМЫ
  // ==========================================================================
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

    // Пересобираем видимую 3D-призму #reviewsPrism с новыми фото-карточками
    var prismMount = document.getElementById('reviewsPrism');
    if (prismMount) {
      rebuildPrismWidget(prismMount, container);
    }
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

  // ==========================================================================
  // 8. ОБРАЗОВАНИЕ И СЕРТИФИКАТЫ: ТОЛЬКО СКАНЫ С УВЕЛИЧЕНИЕМ ПО КЛИКУ
  // ==========================================================================
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

  // ==========================================================================
  // 9. ВЕЕРНАЯ 3D-КАРУСЕЛЬ (FAN DECK) В БЛОКЕ «КАК УСТРОЕНА РАБОТА»
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
      '<div class="c-nav" style="display:flex; margin-top:24px;">',
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
      item.onclick = function () {
        if (active !== i) { active = i; renderDeck(); }
      };
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
          el.style.transform = 'translate3d(' + (dir2 * shiftX * 1.55) + 'px, 28px, -120px) rotateZ(' + (dir2 * 8) + 'deg) scale(0.82)';
          el.style.opacity = '0';
          el.style.zIndex = '2';
          el.style.boxShadow = 'none';
        }
      });

      if (maxH > 120) stage.style.height = (maxH + 28) + 'px';
      wrap.querySelectorAll('.c-dots i').forEach(function (d, idx) {
        d.classList.toggle('on', idx === active);
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

  // ==========================================================================
  // 10. ЮРИДИЧЕСКАЯ УПАКОВКА (САМОЗАНЯТАЯ, КУКИ, ЧЕКБОКСЫ, ПОЛИТИКА, ОФЕРТА)
  // ==========================================================================
  var DEFAULT_PRIVACY = [
    '1. ОБЩИЕ ПОЛОЖЕНИЯ',
    'Настоящая Политика обработки персональных данных составлена в соответствии с Федеральным законом РФ от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки и защиты персональных данных пользователей сайта.',
    'Оператором персональных данных является плательщик налога на профессиональный доход (самозанятая) Парфенова Анастасия (далее — Оператор).',
    '',
    '2. КАКИЕ ДАННЫЕ ОБРАБАТЫВАЮТСЯ',
    '• Имя пользователя;',
    '• Контактный телефон, никнейм в мессенджере Telegram / WhatsApp или адрес электронной почты;',
    '• Технические данные (файлы cookie) для корректной работы сайта.',
    '',
    '3. ЦЕЛИ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ',
    '• Обратная связь с пользователем для записи на пробную тренировку, консультацию и выбора формата онлайн-ведения;',
    '• Заключение и исполнение договора оказания физкультурно-оздоровительных и консультационных услуг.',
    '',
    '4. ПОРЯДОК ЗАЩИТЫ И ОТЗЫВА СОГЛАСИЯ',
    'Оператор не передает персональные данные третьим лицам без согласия пользователя, за исключением случаев, предусмотренных законодательством РФ. Пользователь вправе в любой момент отозвать согласие, направив обращение по контактам Оператора, указанным на сайте.'
  ].join('\n');

  var DEFAULT_OFFER = [
    'ПУБЛИЧНАЯ ОФЕРТА НА ОКАЗАНИЕ ОНЛАЙН-УСЛУГ ПО ФИТНЕС-СОПРОВОЖДЕНИЮ',
    '',
    '1. ОБЩИЕ ПОЛОЖЕНИЯ',
    'Настоящий документ является официальным публичным предложением (офертой) плательщика налога на профессиональный доход (самозанятой, ФЗ № 422-ФЗ) Парфеновой Анастасии (далее — Исполнитель) заключить договор возмездного оказания услуг по проведению онлайн-тренировок, составлению тренировочных программ и рекомендаций по рациону питания.',
    '',
    '2. ПРЕДМЕТ ДОГОВОРА И ПОРЯДОК ОКАЗАНИЯ УСЛУГ',
    '2.1. Исполнитель оказывает Заказчику услуги в соответствии с выбранным на сайте тарифом (Личное онлайн-ведение, Индивидуальная программа тренировок, Мини-группа или пакет занятий по растяжке).',
    '2.2. Онлайн-тренировки проводятся дистанционно по видеосвязи по согласованному графику.',
    '',
    '3. ОПЛАТА И ЧЕКИ',
    '3.1. Стоимость услуг указана в разделе «Услуги и форматы работы» на сайте.',
    '3.2. После оплаты Исполнитель формирует и направляет Заказчику официальный чек из приложения ФНС «Мой налог».',
    '',
    '4. ОТВЕТСТВЕННОСТЬ И ПРОТИВОПОКАЗАНИЯ',
    'Заказчик подтверждает отсутствие медицинских противопоказаний к физическим нагрузкам и обязуется заблаговременно сообщить Исполнителю об особенностях здоровья, травмах или ограничениях.'
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
    var heading = document.getElementById('legalModalHeading');
    var body = document.getElementById('legalModalText');
    if (kind === 'offer') {
      heading.textContent = 'Пользовательское соглашение (Публичная оферта)';
      body.textContent = st.legalOffer || DEFAULT_OFFER;
    } else {
      heading.textContent = 'Политика конфиденциальности и обработки ПДн';
      body.textContent = st.legalPrivacy || DEFAULT_PRIVACY;
    }
    modal.classList.add('open');
  };

  function setupLegalAndCookies() {
    var st = window.SITE_SETTINGS || {};
    var fio = st.legalFio || 'Парфенова Анастасия';
    var inn = st.legalInn || 'уточняется при оформлении чека в «Мой налог»';

    // 1. Привязываем ссылки в подвале к модальному окну документов
    var legalLinks = document.querySelectorAll('.footer-legal a');
    if (legalLinks.length >= 2) {
      legalLinks[0].href = 'javascript:void(0)';
      legalLinks[0].onclick = function (e) { e.preventDefault(); window.openLegalModal('privacy'); };
      legalLinks[1].href = 'javascript:void(0)';
      legalLinks[1].onclick = function (e) { e.preventDefault(); window.openLegalModal('offer'); };
    }

    // 2. Добавляем строку реквизитов самозанятой и сноску про Meta в подвал
    var footerContainer = document.querySelector('footer .container');
    if (footerContainer && !footerContainer.querySelector('.footer-selfemployed')) {
      var info = document.createElement('div');
      info.className = 'footer-selfemployed';
      info.innerHTML = 'Услуги оказывает плательщик налога на профессиональный доход (самозанятая): ' + fio + ' (ИНН: ' + inn + ').<br>* Социальная сеть Instagram принадлежит компании Meta Platforms Inc., деятельность которой признана экстремистской и запрещена на территории РФ.';
      footerContainer.appendChild(info);
    }

    // 3. Добавляем чекбоксы согласия ПДн в обе формы
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

    // 4. Плашка Cookie внизу экрана
    try {
      if (!localStorage.getItem('nastya_cookie_ok') && !document.getElementById('nastyaCookieBar')) {
        var bar = document.createElement('div');
        bar.className = 'cookie-float';
        bar.id = 'nastyaCookieBar';
        bar.innerHTML = [
          '<div>Сайт использует файлы cookie для вашего удобства в соответствии с <a onclick="openLegalModal(\'privacy\')">Политикой конфиденциальности</a>.</div>',
          '<button type="button" class="cookie-btn" onclick="localStorage.setItem(\'nastya_cookie_ok\',\'1\'); this.parentElement.remove();">Принять</button>'
        ].join('');
        document.body.appendChild(bar);
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 11. ЯНДЕКС ФОРМЫ С ПОЛНЫМ СОХРАНЕНИЕМ НАШЕГО СТИЛЯ
  // ==========================================================================
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

  // ==========================================================================
  // 12. ПРИМЕНЕНИЕ НАСТРОЕК ВИЗУАЛА И РЕГИСТРАЦИЯ ПОЛЕЙ ДЛЯ ADMIN.HTML
  // ==========================================================================
  function registerAdminConfig() {
    if (!window.SITE_EDIT) return;
    window.SITE_EDIT.lists = window.SITE_EDIT.lists || {};
    window.SITE_EDIT.lists.certs = 'Образование и сертификаты (сканы)';

    window.SITE_EDIT.photoSlots = window.SITE_EDIT.photoSlots || {};
    for (var i = 1; i <= 4; i++) {
      window.SITE_EDIT.photoSlots['cert-' + i] = {
        label: 'Скан сертификата / диплома №' + i,
        hint: 'вертикальный или горизонтальный скан'
      };
    }

    var extraSettings = [
      { key: 'yandexFormUrl', kind: 'plain', label: 'Ссылка на Яндекс Форму (необязательно)', def: '', hint: 'Стиль нашей формы полностью сохранится, заявки будут дублироваться в Яндекс Форму.' },
      { key: 'legalFio', kind: 'plain', label: 'ФИО самозанятой (в подвале и оферте)', def: 'Парфенова Анастасия' },
      { key: 'legalInn', kind: 'plain', label: 'ИНН самозанятой', def: 'уточняется при оформлении чека' },
      { key: 'featherEdge', kind: 'plain', label: 'Мягкость слияния краев фото Насти с фоном (75% - 98%)', def: '88%' },
      { key: 'floatAmp', kind: 'plain', label: 'Амплитуда парения фото Насти (в px, например 7px)', def: '7px' },
      { key: 'reliefOpacity', kind: 'plain', label: 'Заметность 15 фоновых барельефов (от 0.08 до 0.35)', def: '0.22' }
    ];
    window.SITE_EDIT.settings = window.SITE_EDIT.settings || [];
    extraSettings.forEach(function (es) {
      if (!window.SITE_EDIT.settings.some(function (x) { return x.key === es.key; })) {
        window.SITE_EDIT.settings.push(es);
      }
    });

    // Пересчитываем SITE_SETTINGS с учетом добавленных полей
    var o = (window.SITE_OVERRIDES || {}).settings || {};
    window.SITE_SETTINGS = window.SITE_SETTINGS || {};
    window.SITE_EDIT.settings.forEach(function (s) {
      window.SITE_SETTINGS[s.key] = (o[s.key] != null && o[s.key] !== '') ? o[s.key] : s.def;
    });

    // Применяем CSS-переменные тонкой настройки дизайна
    var root = document.documentElement;
    if (window.SITE_SETTINGS.featherEdge) {
      root.style.setProperty('--feather-x', window.SITE_SETTINGS.featherEdge);
      root.style.setProperty('--feather-y', window.SITE_SETTINGS.featherEdge);
    }
    if (window.SITE_SETTINGS.floatAmp) root.style.setProperty('--float-amp', window.SITE_SETTINGS.floatAmp);
    if (window.SITE_SETTINGS.reliefOpacity) root.style.setProperty('--relief-opacity', window.SITE_SETTINGS.reliefOpacity);

    // Применяем кастомные цвета, если заданы в SITE_OVERRIDES.design
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
