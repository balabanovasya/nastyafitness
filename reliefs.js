/**
 * reliefs.js — 15 скульптурных 3D-барельефов (эффект «вылезают из стены», стиль immersive-g.com)
 * - Плотный архитектурный гипс / шоколадный камень с глубоким рельефом и тенями
 * - Наплыв поверхности стены у основания (эффект замурованности)
 * - Увеличены на +18–20%, высочайшая детализация и полная адаптивность под телефоны
 */
(function () {
  'use strict';

  function injectReliefStyles() {
    var old = document.getElementById('nastya-reliefs-css');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'nastya-reliefs-css';
    st.textContent = [
      '.wall-relief-host { position: relative; overflow: hidden; }',
      '.wall-relief-host > .container, .wall-relief-host > .faq-container { position: relative; z-index: 2; }',
      '.wall-sculpture {',
      '  position: absolute;',
      '  pointer-events: none;',
      '  user-select: none;',
      '  z-index: 1;',
      '  opacity: var(--relief-strength, 0.92);',
      '  transform-origin: center center;',
      '  filter:',
      '    drop-shadow(-7px -7px 11px rgba(255, 255, 255, 0.96))',
      '    drop-shadow(10px 16px 20px rgba(63, 41, 27, 0.28))',
      '    drop-shadow(3px 5px 5px rgba(63, 41, 27, 0.16));',
      '}',
      '.wall-sculpture.on-dark {',
      '  opacity: var(--relief-strength-dark, 0.94);',
      '  filter:',
      '    drop-shadow(-5px -5px 9px rgba(246, 217, 168, 0.20))',
      '    drop-shadow(12px 18px 24px rgba(5, 2, 1, 0.85))',
      '    drop-shadow(3px 5px 6px rgba(0, 0, 0, 0.65));',
      '}',
      '.wall-sculpture svg {',
      '  width: 100%;',
      '  height: 100%;',
      '  overflow: visible;',
      '  display: block;',
      '  shape-rendering: geometricPrecision;',
      '}',
      '@media (max-width: 1024px) {',
      '  .wall-sculpture { opacity: calc(var(--relief-strength, 0.92) * 0.92); }',
      '}',
      '@media (max-width: 720px) {',
      '  .wall-sculpture {',
      '    opacity: calc(var(--relief-strength, 0.92) * 0.84);',
      '    max-width: 175px !important;',
      '    max-height: 175px !important;',
      '  }',
      '  .wall-sculpture.on-dark {',
      '    opacity: calc(var(--relief-strength-dark, 0.94) * 0.90);',
      '  }',
      '  .wall-sculpture[data-shape="kettlebell16"].on-dark {',
      '    max-width: 196px !important;',
      '    max-height: 196px !important;',
      '  }',
      '  .wall-sculpture[data-shape="barbell"] {',
      '    max-width: 205px !important;',
      '    max-height: 150px !important;',
      '  }',
      '  .about-sec .wall-sculpture[data-shape="yogaMat"] {',
      '    left: auto !important; right: -8px !important; top: 8px !important;',
      '    max-width: 190px !important; max-height: 150px !important;',
      '  }',
      '  .about-sec .wall-sculpture[data-shape="kettlebell16"] {',
      '    top: auto !important; bottom: -14px !important; left: 4px !important;',
      '    max-width: 152px !important; max-height: 152px !important;',
      '  }',
      '  .faq-sec .wall-sculpture[data-shape="sportBottle"] {',
      '    left: auto !important; right: -4px !important; top: 46% !important;',
      '    max-width: 155px !important; max-height: 195px !important;',
      '  }',
      '}',
      '/* Гарантируем, что фотографии в Блоке 7 всегда поверх фоновых барельефов */',
      '.about-sec .about-photo-main, .about-sec .gallery-card, .about-sec .cert-scan-card { position: relative; z-index: 4; }',
      '.about-sec { padding-bottom: 120px !important; }',
      '@media (max-width: 720px) { .about-sec { padding-bottom: 84px !important; } }'
    ].join('\n');
    document.head.appendChild(st);
  }

  // Палитра с глубоким скульптурным контрастом: светлая гипсовая стена / тёмная шоколадно-бронзовая стена
  function paletteFor(dark) {
    if (dark) {
      return {
        wall: '#3A2518',
        moundHi: 'rgba(138, 96, 66, 0.42)',
        moundLow: 'rgba(18, 9, 4, 0.68)',
        hi: '#8F674B',
        hi2: '#735038',
        mid: '#523624',
        low: '#362115',
        deep: '#1F120A',
        rim: '#D7AE7E',
        rimSoft: 'rgba(246, 217, 168, 0.46)',
        groove: '#120904',
        cast: 'rgba(6, 2, 0, 0.72)',
        text: '#E6BD8A',
        textShadow: '#120803'
      };
    }
    return {
      wall: '#F6EFE5',
      moundHi: 'rgba(255, 255, 255, 0.95)',
      moundLow: 'rgba(138, 108, 82, 0.28)',
      hi: '#FFFFFF',
      hi2: '#F6EDE1',
      mid: '#E3D3BE',
      low: '#C8B297',
      deep: '#9E856A',
      rim: '#FFFFFF',
      rimSoft: 'rgba(255, 255, 255, 0.92)',
      groove: '#7F6750',
      cast: 'rgba(84, 58, 38, 0.34)',
      text: '#6F5640',
      textShadow: '#FFFFFF'
    };
  }

  function buildDefs(id, p) {
    return [
      '<defs>',
      '  <!-- 3D-градиенты объёмного света (источник сверху-слева под 315°) -->',
      '  <linearGradient id="' + id + '_lin" x1="8%" y1="6%" x2="92%" y2="94%">',
      '    <stop offset="0%" stop-color="' + p.hi + '"/>',
      '    <stop offset="28%" stop-color="' + p.hi2 + '"/>',
      '    <stop offset="62%" stop-color="' + p.mid + '"/>',
      '    <stop offset="88%" stop-color="' + p.low + '"/>',
      '    <stop offset="100%" stop-color="' + p.deep + '"/>',
      '  </linearGradient>',
      '  <linearGradient id="' + id + '_rev" x1="90%" y1="90%" x2="10%" y2="10%">',
      '    <stop offset="0%" stop-color="' + p.hi2 + '"/>',
      '    <stop offset="48%" stop-color="' + p.mid + '"/>',
      '    <stop offset="100%" stop-color="' + p.deep + '"/>',
      '  </linearGradient>',
      '  <radialGradient id="' + id + '_rad" cx="30%" cy="24%" r="74%">',
      '    <stop offset="0%" stop-color="' + p.hi + '"/>',
      '    <stop offset="30%" stop-color="' + p.hi2 + '"/>',
      '    <stop offset="66%" stop-color="' + p.mid + '"/>',
      '    <stop offset="88%" stop-color="' + p.low + '"/>',
      '    <stop offset="100%" stop-color="' + p.deep + '"/>',
      '  </radialGradient>',
      '  <linearGradient id="' + id + '_met" x1="0%" y1="0%" x2="0%" y2="100%">',
      '    <stop offset="0%" stop-color="' + p.hi + '"/>',
      '    <stop offset="26%" stop-color="' + p.hi2 + '"/>',
      '    <stop offset="56%" stop-color="' + p.low + '"/>',
      '    <stop offset="84%" stop-color="' + p.deep + '"/>',
      '    <stop offset="100%" stop-color="' + p.mid + '"/>',
      '  </linearGradient>',
      '  <!-- Эффект «выдавливания из стены» — плавный гипсовый наплыв вокруг объекта -->',
      '  <radialGradient id="' + id + '_mound" cx="42%" cy="40%" r="58%">',
      '    <stop offset="0%" stop-color="' + p.moundHi + '"/>',
      '    <stop offset="52%" stop-color="' + p.moundLow + '"/>',
      '    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>',
      '  </radialGradient>',
      '  <!-- Глубокий фильтр барельефного объёма -->',
      '  <filter id="' + id + '_emboss" x="-22%" y="-22%" width="144%" height="144%">',
      '    <feDropShadow dx="4" dy="7" stdDeviation="4.5" flood-color="' + p.cast + '"/>',
      '  </filter>',
      '</defs>'
    ].join('');
  }

  function wallMound(id, cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#' + id + '_mound)" opacity="0.88"/>';
  }

  function renderShape(shape, id, dark) {
    var p = paletteFor(dark);
    var defs = buildDefs(id, p);
    var lin = 'url(#' + id + '_lin)';
    var rev = 'url(#' + id + '_rev)';
    var rad = 'url(#' + id + '_rad)';
    var met = 'url(#' + id + '_met)';
    var emb = 'filter="url(#' + id + '_emboss)"';

    if (shape === 'kettlebell16') {
      // Массивная чугунная пудовая гиря «16 КГ», выступающая из стены
      return [
        '<svg viewBox="0 0 260 280" aria-hidden="true">' + defs,
        wallMound(id, 134, 152, 114, 118),
        '<g ' + emb + '>',
        '  <!-- Теневая ниша внутри окна рукояти (эффект погружения в стену) -->',
        '  <path d="M88 118 C82 78, 92 54, 130 54 C168 54, 178 78, 172 118 Z" fill="' + p.cast + '" opacity="0.55"/>',
        '  <!-- Литая массивная дужка с анатомическими рогами -->',
        '  <path d="M72 122 C62 72, 74 28, 130 28 C186 28, 198 72, 188 122 L164 126 C171 84, 166 56, 130 56 C94 56, 89 84, 96 126 Z" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <!-- Внутренняя фаска и световой гребень рукояти -->',
        '  <path d="M90 116 C86 78, 95 52, 130 52 C165 52, 174 78, 170 116" fill="none" stroke="' + p.groove + '" stroke-width="4" stroke-linecap="round"/>',
        '  <path d="M94 37 C114 31, 146 31, 166 37" fill="none" stroke="' + p.rim + '" stroke-width="3.8" stroke-linecap="round" opacity="0.88"/>',
        '  <!-- Тело гири со срезанным плоским основанием и плечевыми рёбрами -->',
        '  <path d="M44 176 C42 126, 76 98, 130 98 C184 98, 218 126, 216 176 C214 214, 196 244, 172 256 L88 256 C64 244, 46 214, 44 176 Z" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <!-- Острая грань плоского дна -->',
        '  <path d="M82 250 Q130 260 178 250 L172 259 Q130 266 88 259 Z" fill="' + p.deep + '"/>',
        '  <!-- Верхний блик на плечах гири -->',
        '  <path d="M62 142 C84 114, 174 114, 198 142" fill="none" stroke="' + p.rim + '" stroke-width="2.8" stroke-linecap="round" opacity="0.72"/>',
        '  <!-- Глубокий вдавленный медальон с двойным кантом -->',
        '  <ellipse cx="130" cy="180" rx="54" ry="37" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="2.4"/>',
        '  <ellipse cx="130" cy="180" rx="49" ry="32" fill="none" stroke="' + p.rim + '" stroke-width="1.5" opacity="0.8"/>',
        '  <!-- Чёткая рельефная отливка 16 КГ -->',
        '  <text x="130" y="186" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="31" fill="' + p.textShadow + '" letter-spacing="0.6" transform="translate(1.6, 2)">16 КГ</text>',
        '  <text x="130" y="186" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="31" fill="' + p.text + '" letter-spacing="0.6">16 КГ</text>',
        '  <line x1="100" y1="197" x2="160" y2="197" stroke="' + p.groove + '" stroke-width="2.2" stroke-linecap="round"/>',
        '  <line x1="100" y1="199" x2="160" y2="199" stroke="' + p.rim + '" stroke-width="1" stroke-linecap="round" opacity="0.7"/>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'dumbbell') {
      // Объёмная разборная гантель с фасками, ромбовидной насечкой, гайками и светотенью
      return [
        '<svg viewBox="0 0 280 180" aria-hidden="true">' + defs,
        wallMound(id, 142, 94, 128, 72),
        '<g transform="rotate(-14 140 90)" ' + emb + '>',
        '  <!-- Стальной гриф -->',
        '  <rect x="74" y="79" width="132" height="22" rx="5" fill="' + met + '" stroke="' + p.rimSoft + '" stroke-width="1.6"/>',
        '  <!-- Рельефная насечка хвата -->',
        '  <g stroke="' + p.groove + '" stroke-width="1.8" opacity="0.82">',
        '    <line x1="104" y1="81" x2="104" y2="99"/><line x1="111" y1="81" x2="111" y2="99"/>',
        '    <line x1="118" y1="81" x2="118" y2="99"/><line x1="125" y1="81" x2="125" y2="99"/>',
        '    <line x1="132" y1="81" x2="132" y2="99"/><line x1="139" y1="81" x2="139" y2="99"/>',
        '    <line x1="146" y1="81" x2="146" y2="99"/><line x1="153" y1="81" x2="153" y2="99"/>',
        '    <line x1="160" y1="81" x2="160" y2="99"/><line x1="167" y1="81" x2="167" y2="99"/>',
        '    <line x1="174" y1="81" x2="174" y2="99"/>',
        '  </g>',
        '  <line x1="80" y1="83" x2="200" y2="83" stroke="' + p.rim + '" stroke-width="2" opacity="0.75"/>',
        '  <!-- Гайки-фиксаторы -->',
        '  <rect x="78" y="72" width="11" height="36" rx="3.5" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.5"/>',
        '  <rect x="191" y="72" width="11" height="36" rx="3.5" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.5"/>',
        '  <!-- Левые блины со скошенными фасками -->',
        '  <rect x="52" y="28" width="24" height="124" rx="10" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <line x1="64" y1="36" x2="64" y2="144" stroke="' + p.groove + '" stroke-width="2" opacity="0.6"/>',
        '  <line x1="58" y1="36" x2="58" y2="144" stroke="' + p.rim + '" stroke-width="2" opacity="0.75"/>',
        '  <rect x="30" y="40" width="20" height="100" rx="8" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="1.8"/>',
        '  <line x1="40" y1="48" x2="40" y2="132" stroke="' + p.groove + '" stroke-width="1.6" opacity="0.55"/>',
        '  <rect x="14" y="55" width="14" height="70" rx="6" fill="' + rev + '" stroke="' + p.rimSoft + '" stroke-width="1.6"/>',
        '  <rect x="4" y="77" width="10" height="26" rx="4" fill="' + met + '" stroke="' + p.groove + '" stroke-width="1.2"/>',
        '  <!-- Правые блины -->',
        '  <rect x="204" y="28" width="24" height="124" rx="10" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <line x1="216" y1="36" x2="216" y2="144" stroke="' + p.groove + '" stroke-width="2" opacity="0.6"/>',
        '  <line x1="210" y1="36" x2="210" y2="144" stroke="' + p.rim + '" stroke-width="2" opacity="0.75"/>',
        '  <rect x="230" y="40" width="20" height="100" rx="8" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="1.8"/>',
        '  <line x1="240" y1="48" x2="240" y2="132" stroke="' + p.groove + '" stroke-width="1.6" opacity="0.55"/>',
        '  <rect x="252" y="55" width="14" height="70" rx="6" fill="' + rev + '" stroke="' + p.rimSoft + '" stroke-width="1.6"/>',
        '  <rect x="266" y="77" width="10" height="26" rx="4" fill="' + met + '" stroke="' + p.groove + '" stroke-width="1.2"/>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'barbell') {
      return [
        '<svg viewBox="0 0 320 165" aria-hidden="true">' + defs,
        wallMound(id, 160, 86, 148, 64),
        '<g transform="rotate(9 160 82)" ' + emb + '>',
        '  <rect x="8" y="76" width="304" height="13" rx="5" fill="' + met + '" stroke="' + p.rimSoft + '" stroke-width="1.4"/>',
        '  <line x1="12" y1="79" x2="308" y2="79" stroke="' + p.rim + '" stroke-width="1.8" opacity="0.75"/>',
        '  <rect x="66" y="70" width="16" height="25" rx="4" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.5"/>',
        '  <rect x="238" y="70" width="16" height="25" rx="4" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.5"/>',
        '  <line x1="112" y1="82.5" x2="208" y2="82.5" stroke="' + p.groove + '" stroke-width="7" stroke-dasharray="3 4" opacity="0.75"/>',
        '  <!-- Левые олимпийские диски -->',
        '  <rect x="44" y="16" width="20" height="133" rx="7" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <line x1="54" y1="24" x2="54" y2="141" stroke="' + p.groove + '" stroke-width="2" opacity="0.6"/>',
        '  <rect x="24" y="30" width="18" height="105" rx="6" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="1.8"/>',
        '  <rect x="10" y="46" width="12" height="73" rx="5" fill="' + rev + '" stroke="' + p.rimSoft + '" stroke-width="1.5"/>',
        '  <!-- Правые диски -->',
        '  <rect x="256" y="16" width="20" height="133" rx="7" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <line x1="266" y1="24" x2="266" y2="141" stroke="' + p.groove + '" stroke-width="2" opacity="0.6"/>',
        '  <rect x="278" y="30" width="18" height="105" rx="6" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="1.8"/>',
        '  <rect x="298" y="46" width="12" height="73" rx="5" fill="' + rev + '" stroke="' + p.rimSoft + '" stroke-width="1.5"/>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'weightPlate') {
      return [
        '<svg viewBox="0 0 240 240" aria-hidden="true">' + defs,
        wallMound(id, 122, 124, 112, 112),
        '<g ' + emb + '>',
        '  <circle cx="120" cy="120" r="102" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2.4"/>',
        '  <circle cx="120" cy="120" r="88" fill="none" stroke="' + p.groove + '" stroke-width="3.2"/>',
        '  <circle cx="120" cy="120" r="84" fill="none" stroke="' + p.rim + '" stroke-width="1.8" opacity="0.85"/>',
        '  <!-- 3 глубокие прорези-хвата -->',
        '  <path d="M86 42 A80 80 0 0 1 154 42 L144 64 A56 56 0 0 0 96 64 Z" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="2.2"/>',
        '  <path d="M196 136 A80 80 0 0 1 162 192 L148 172 A56 56 0 0 0 172 132 Z" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="2.2"/>',
        '  <path d="M78 192 A80 80 0 0 1 44 136 L68 132 A56 56 0 0 0 92 172 Z" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="2.2"/>',
        '  <!-- Центральная ступица с 4 болтами и посадочной втулкой -->',
        '  <circle cx="120" cy="120" r="38" fill="' + rev + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <circle cx="120" cy="120" r="20" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="2.6"/>',
        '  <circle cx="120" cy="90" r="3" fill="' + p.groove + '"/><circle cx="120" cy="150" r="3" fill="' + p.groove + '"/>',
        '  <circle cx="90" cy="120" r="3" fill="' + p.groove + '"/><circle cx="150" cy="120" r="3" fill="' + p.groove + '"/>',
        '  <text x="120" y="82" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="16" fill="' + p.text + '" letter-spacing="1">10 KG</text>',
        '  <text x="120" y="172" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="12" fill="' + p.text + '" letter-spacing="2">OLYMPIC</text>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'sneaker') {
      return [
        '<svg viewBox="0 0 280 190" aria-hidden="true">' + defs,
        wallMound(id, 142, 102, 128, 72),
        '<g transform="rotate(-10 140 96)" ' + emb + '>',
        '  <!-- Основной верх кроссовка -->',
        '  <path d="M30 124 L40 58 C54 74, 74 76, 90 58 L108 42 C118 34, 128 42, 136 54 L186 88 C214 94, 248 100, 254 120 L250 132 L28 132 Z" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <!-- Пяточная петля и мягкий воротник -->',
        '  <path d="M40 60 C32 46, 40 34, 50 48" fill="none" stroke="' + p.rim + '" stroke-width="4.5" stroke-linecap="round"/>',
        '  <path d="M40 66 C56 78, 74 78, 92 60" fill="none" stroke="' + p.groove + '" stroke-width="2.6" stroke-linecap="round"/>',
        '  <!-- Усиленный задник и накладка мыска с прострочкой -->',
        '  <path d="M30 124 L40 78 C62 84, 78 98, 80 124 Z" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '  <path d="M202 94 C228 98, 248 106, 252 124 L196 124 Z" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '  <!-- Детализированная шнуровка с люверсами -->',
        '  <g stroke="' + p.groove + '" stroke-width="5.2" stroke-linecap="round">',
        '    <line x1="124" y1="58" x2="140" y2="50"/><line x1="138" y1="68" x2="154" y2="60"/>',
        '    <line x1="152" y1="78" x2="168" y2="70"/><line x1="166" y1="88" x2="182" y2="80"/>',
        '  </g>',
        '  <g stroke="' + p.rim + '" stroke-width="2.8" stroke-linecap="round">',
        '    <line x1="124" y1="57" x2="140" y2="49"/><line x1="138" y1="67" x2="154" y2="59"/>',
        '    <line x1="152" y1="77" x2="168" y2="69"/><line x1="166" y1="87" x2="182" y2="79"/>',
        '  </g>',
        '  <!-- Боковая скульптурная волна -->',
        '  <path d="M84 114 C122 110, 158 100, 188 88 C164 110, 132 120, 84 120 Z" fill="' + p.groove + '" opacity="0.62"/>',
        '  <!-- Многослойная подошва + воздушная капсула + протектор -->',
        '  <path d="M22 124 L256 124 C262 124, 264 138, 250 146 L34 148 C18 148, 16 132, 22 124 Z" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <rect x="48" y="130" width="48" height="9" rx="4.5" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '  <path d="M32 148 H246" stroke="' + p.groove + '" stroke-width="4" stroke-dasharray="12 6"/>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'shaker') {
      return [
        '<svg viewBox="0 0 210 260" aria-hidden="true">' + defs,
        wallMound(id, 108, 134, 88, 112),
        '<g transform="rotate(-11 105 130)" ' + emb + '>',
        '  <path d="M122 26 C146 24, 154 46, 138 56" fill="none" stroke="' + p.rim + '" stroke-width="6.5" stroke-linecap="round"/>',
        '  <rect x="78" y="18" width="32" height="20" rx="5" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="1.8"/>',
        '  <rect x="52" y="38" width="106" height="28" rx="9" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <g stroke="' + p.groove + '" stroke-width="2" opacity="0.72">',
        '    <line x1="66" y1="43" x2="66" y2="61"/><line x1="80" y1="43" x2="80" y2="61"/>',
        '    <line x1="94" y1="43" x2="94" y2="61"/><line x1="108" y1="43" x2="108" y2="61"/>',
        '    <line x1="122" y1="43" x2="122" y2="61"/><line x1="136" y1="43" x2="136" y2="61"/>',
        '  </g>',
        '  <path d="M58 68 H152 L141 230 C140 240, 70 240, 69 230 Z" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <path d="M62 106 L72 110 L70 168 L62 172" fill="' + p.groove + '" opacity="0.45"/>',
        '  <path d="M148 106 L138 110 L140 168 L148 172" fill="' + p.groove + '" opacity="0.45"/>',
        '  <g stroke="' + p.groove + '" stroke-width="2" stroke-linecap="round">',
        '    <line x1="94" y1="100" x2="118" y2="100"/><line x1="100" y1="122" x2="118" y2="122"/>',
        '    <line x1="94" y1="144" x2="118" y2="144"/><line x1="100" y1="166" x2="118" y2="166"/>',
        '    <line x1="94" y1="188" x2="118" y2="188"/>',
        '  </g>',
        '  <text x="77" y="105" font-family="Manrope, sans-serif" font-size="11" font-weight="800" fill="' + p.text + '">600</text>',
        '  <text x="77" y="149" font-family="Manrope, sans-serif" font-size="11" font-weight="800" fill="' + p.text + '">400</text>',
        '  <text x="77" y="193" font-family="Manrope, sans-serif" font-size="11" font-weight="800" fill="' + p.text + '">200</text>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'proteinJar') {
      return [
        '<svg viewBox="0 0 220 250" aria-hidden="true">' + defs,
        wallMound(id, 112, 130, 96, 110),
        '<g transform="rotate(8 110 125)" ' + emb + '>',
        '  <!-- Ребристая крышка -->',
        '  <rect x="54" y="22" width="112" height="30" rx="8" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <g stroke="' + p.groove + '" stroke-width="2" opacity="0.72">',
        '    <line x1="68" y1="27" x2="68" y2="47"/><line x1="82" y1="27" x2="82" y2="47"/>',
        '    <line x1="96" y1="27" x2="96" y2="47"/><line x1="110" y1="27" x2="110" y2="47"/>',
        '    <line x1="124" y1="27" x2="124" y2="47"/><line x1="138" y1="27" x2="138" y2="47"/>',
        '    <line x1="152" y1="27" x2="152" y2="47"/>',
        '  </g>',
        '  <!-- Корпус банки с объёмными плечиками -->',
        '  <path d="M62 52 H158 L178 76 V214 C178 226, 168 234, 156 234 H64 C52 234, 42 226, 42 214 V76 Z" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <!-- Вдавленная рельефная этикетка -->',
        '  <rect x="44" y="92" width="132" height="104" rx="5" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="2"/>',
        '  <line x1="56" y1="108" x2="164" y2="108" stroke="' + p.rim + '" stroke-width="1.6" opacity="0.85"/>',
        '  <text x="110" y="144" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="24" fill="' + p.text + '" letter-spacing="1.6">WHEY</text>',
        '  <text x="110" y="166" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="11.5" fill="' + p.text + '" letter-spacing="2.4">ISOLATE</text>',
        '  <line x1="66" y1="180" x2="154" y2="180" stroke="' + p.groove + '" stroke-width="2"/>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'ppPlate') {
      return [
        '<svg viewBox="0 0 260 230" aria-hidden="true">' + defs,
        wallMound(id, 120, 118, 114, 102),
        '<g ' + emb + '>',
        '  <!-- Керамическая тарелка с глубоким ободком -->',
        '  <circle cx="114" cy="115" r="96" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2.4"/>',
        '  <circle cx="114" cy="115" r="76" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="2.2"/>',
        '  <circle cx="114" cy="115" r="72" fill="none" stroke="' + p.rim + '" stroke-width="1.4" opacity="0.85"/>',
        '  <!-- Авокадо с объёмной косточкой -->',
        '  <path d="M64 110 C62 84, 84 68, 102 78 C116 86, 110 118, 88 128 C74 132, 66 124, 64 110 Z" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.8"/>',
        '  <circle cx="86" cy="105" r="12" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="1.8"/>',
        '  <!-- Стейк гриль с чёткими полосками -->',
        '  <rect x="116" y="72" width="54" height="38" rx="14" transform="rotate(14 143 91)" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.8"/>',
        '  <g stroke="' + p.groove + '" stroke-width="2.4" stroke-linecap="round">',
        '    <line x1="126" y1="80" x2="138" y2="102"/><line x1="138" y1="78" x2="150" y2="102"/><line x1="150" y1="80" x2="160" y2="102"/>',
        '  </g>',
        '  <!-- Киноа, зелень и 3 томата черри -->',
        '  <path d="M80 148 C92 130, 120 132, 130 154 C116 168, 90 166, 80 148 Z" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '  <circle cx="144" cy="144" r="11.5" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '  <circle cx="162" cy="128" r="9.5" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '  <circle cx="128" cy="158" r="9" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '  <!-- Скульптурная вилка -->',
        '  <g transform="translate(218, 36)">',
        '    <rect x="9" y="64" width="9" height="92" rx="4.5" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <path d="M3 10 V42 C3 56, 24 56, 24 42 V10" fill="none" stroke="' + p.rim + '" stroke-width="3.2" stroke-linecap="round"/>',
        '    <line x1="10" y1="10" x2="10" y2="50" stroke="' + p.rim + '" stroke-width="3" stroke-linecap="round"/>',
        '    <line x1="17" y1="10" x2="17" y2="50" stroke="' + p.rim + '" stroke-width="3" stroke-linecap="round"/>',
        '  </g>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'jumprope') {
      return [
        '<svg viewBox="0 0 240 240" aria-hidden="true">' + defs,
        wallMound(id, 120, 122, 108, 108),
        '<g ' + emb + '>',
        '  <path d="M58 152 C24 80, 68 24, 120 24 C172 24, 216 80, 182 152" fill="none" stroke="' + p.groove + '" stroke-width="10" stroke-linecap="round"/>',
        '  <path d="M58 152 C24 80, 68 24, 120 24 C172 24, 216 80, 182 152" fill="none" stroke="' + p.rim + '" stroke-width="4.2" stroke-linecap="round"/>',
        '  <g transform="rotate(14 60 186)">',
        '    <rect x="52" y="146" width="16" height="12" rx="3.5" fill="' + met + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '    <rect x="47" y="158" width="26" height="68" rx="10" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '    <g stroke="' + p.groove + '" stroke-width="2">',
        '      <line x1="52" y1="174" x2="68" y2="174"/><line x1="52" y1="184" x2="68" y2="184"/>',
        '      <line x1="52" y1="194" x2="68" y2="194"/><line x1="52" y1="204" x2="68" y2="204"/>',
        '    </g>',
        '  </g>',
        '  <g transform="rotate(-14 180 186)">',
        '    <rect x="172" y="146" width="16" height="12" rx="3.5" fill="' + met + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '    <rect x="167" y="158" width="26" height="68" rx="10" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '    <g stroke="' + p.groove + '" stroke-width="2">',
        '      <line x1="172" y1="174" x2="188" y2="174"/><line x1="172" y1="184" x2="188" y2="184"/>',
        '      <line x1="172" y1="194" x2="188" y2="194"/><line x1="172" y1="204" x2="188" y2="204"/>',
        '    </g>',
        '  </g>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'yogaMat') {
      // Чёткий, мгновенно узнаваемый коврик для фитнеса и йоги:
      // объёмный скрученный рулон с глубокой многослойной спиралью + развёрнутое полотно с антискользящей сеткой и ремнём
      return [
        '<svg viewBox="0 0 300 220" aria-hidden="true">' + defs,
        wallMound(id, 150, 114, 138, 86),
        '<g transform="rotate(-11 150 110)" ' + emb + '>',
        '  <!-- Развёрнутое полотно коврика, выходящее из-под рулона направо -->',
        '  <path d="M98 118 L272 118 C280 118, 284 123, 282 131 L270 176 C268 183, 262 187, 254 187 L62 187 C56 187, 54 182, 58 175 Z" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <!-- Толщина кромки (срез материала коврика) -->',
        '  <path d="M60 187 L254 187 C262 187, 268 183, 270 176 L272 184 C269 191, 263 195, 254 195 L64 195 C58 195, 56 191, 60 187 Z" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '  <!-- Чёткая антискользящая перфорация / продольные линии разметки на полотне -->',
        '  <g stroke="' + p.groove + '" stroke-width="1.7" opacity="0.62" stroke-linecap="round">',
        '    <line x1="108" y1="133" x2="266" y2="133"/>',
        '    <line x1="96"  y1="147" x2="261" y2="147"/>',
        '    <line x1="84"  y1="161" x2="256" y2="161"/>',
        '    <line x1="74"  y1="175" x2="251" y2="175"/>',
        '  </g>',
        '  <!-- Поперечная декоративная линия центровки йога-коврика -->',
        '  <line x1="184" y1="126" x2="174" y2="180" stroke="' + p.rim + '" stroke-width="2.2" opacity="0.8"/>',
        '  <circle cx="179" cy="153" r="6" fill="none" stroke="' + p.groove + '" stroke-width="1.8" opacity="0.72"/>',
        '  <!-- Теневой провал под цилиндром рулона -->',
        '  <path d="M58 122 L212 122 L206 134 L52 134 Z" fill="' + p.cast + '" opacity="0.55"/>',
        '  <!-- Основной цилиндр скрученного рулона коврика -->',
        '  <path d="M64 36 L206 36 C225 36, 238 56, 236 81 C234 106, 220 124, 200 124 L60 124 Z" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <!-- Верхний световой блик вдоль цилиндра рулона -->',
        '  <line x1="88" y1="49" x2="212" y2="49" stroke="' + p.rim + '" stroke-width="3" stroke-linecap="round" opacity="0.85"/>',
        '  <!-- Ремень-стяжка вокруг рулона с пряжкой -->',
        '  <path d="M148 35 L166 35 C176 58, 176 102, 164 125 L146 125 C158 102, 158 58, 148 35 Z" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.8"/>',
        '  <rect x="148" y="68" width="24" height="22" rx="5" fill="' + met + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '  <rect x="155" y="74" width="10" height="10" rx="2" fill="' + p.deep + '"/>',
        '  <!-- Левый открытый торец рулона с глубокой 3-витковой спиралью слоёв -->',
        '  <ellipse cx="62" cy="80" rx="30" ry="44" fill="' + rev + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <ellipse cx="62" cy="80" rx="26" ry="39" fill="none" stroke="' + p.groove + '" stroke-width="2.4"/>',
        '  <!-- Спираль скрученных слоёв коврика -->',
        '  <path d="M62 44 C80 44, 86 62, 84 80 C82 102, 66 114, 52 110 C38 106, 36 86, 40 70 C44 54, 58 50, 70 58 C78 64, 78 86, 68 96 C58 104, 46 96, 48 80 C50 68, 62 64, 68 74 C72 80, 62 88, 56 82" fill="none" stroke="' + p.groove + '" stroke-width="3.6" stroke-linecap="round"/>',
        '  <path d="M62 46 C78 46, 84 62, 82 80 C80 100, 66 112, 53 108" fill="none" stroke="' + p.rim + '" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>',
        '  <!-- Тонкая тиснёная надпись MAT -->',
        '  <text x="210" y="169" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="11" fill="' + p.text + '" letter-spacing="2.2" opacity="0.82">YOGA MAT</text>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'sportBottle') {
      // Высокодетализированная спортивная бутылка для воды (для блока FAQ):
      // анатомический приталенный силуэт, крышка с поильником-клапаном, петля-карабин,
      // рельефные рёбра хвата, капля и мерная шкала 750 / 500 / 250 ML
      return [
        '<svg viewBox="0 0 210 290" aria-hidden="true">' + defs,
        wallMound(id, 108, 150, 88, 126),
        '<g transform="rotate(10 105 145)" ' + emb + '>',
        '  <!-- Верхняя дужка-петля для переноски на крышке -->',
        '  <path d="M118 28 C144 24, 152 52, 132 64" fill="none" stroke="' + p.groove + '" stroke-width="10" stroke-linecap="round"/>',
        '  <path d="M118 28 C144 24, 152 52, 132 64" fill="none" stroke="' + lin + '" stroke-width="6.5" stroke-linecap="round"/>',
        '  <path d="M122 26 C142 24, 149 44, 136 56" fill="none" stroke="' + p.rim + '" stroke-width="2" stroke-linecap="round" opacity="0.85"/>',
        '  <!-- Откидной спортивный поильник-мундштук -->',
        '  <path d="M88 18 C88 12, 104 12, 106 18 L108 38 L86 38 Z" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="1.8"/>',
        '  <ellipse cx="97" cy="16" rx="8" ry="3.2" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="1.2"/>',
        '  <!-- Спортивная винтовая крышка с рельефным ободом и замком -->',
        '  <rect x="66" y="34" width="74" height="28" rx="9" fill="' + lin + '" stroke="' + p.rimSoft + '" stroke-width="2"/>',
        '  <g stroke="' + p.groove + '" stroke-width="2" opacity="0.72">',
        '    <line x1="78" y1="39" x2="78" y2="57"/><line x1="88" y1="39" x2="88" y2="57"/>',
        '    <line x1="98" y1="39" x2="98" y2="57"/><line x1="108" y1="39" x2="108" y2="57"/>',
        '    <line x1="118" y1="39" x2="118" y2="57"/><line x1="128" y1="39" x2="128" y2="57"/>',
        '  </g>',
        '  <!-- Горлышко с уплотнительным кольцом -->',
        '  <rect x="74" y="62" width="58" height="12" rx="4" fill="' + met + '" stroke="' + p.groove + '" stroke-width="1.5"/>',
        '  <!-- Эргономичный корпус спортивной бутылки с приталенным перехватом -->',
        '  <path d="M74 74 C56 82, 48 98, 48 118 L48 134 C48 148, 58 156, 58 172 C58 188, 48 196, 48 212 L48 244 C48 260, 62 270, 82 270 L124 270 C144 270, 158 260, 158 244 L158 212 C158 196, 148 188, 148 172 C148 156, 158 148, 158 134 L158 118 C158 98, 150 82, 132 74 Z" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <!-- Световой глянцевый блик вдоль левого борта бутылки -->',
        '  <path d="M62 98 C58 112, 58 128, 60 142 M66 164 C66 174, 64 186, 60 198 L60 242" fill="none" stroke="' + p.rim + '" stroke-width="3.6" stroke-linecap="round" opacity="0.82"/>',
        '  <!-- Рельефная зона хвата в области «талии» (5 горизонтальных противоскользящих канавок) -->',
        '  <g stroke="' + p.groove + '" stroke-width="2.2" stroke-linecap="round" opacity="0.65">',
        '    <path d="M62 154 Q103 160 144 154"/>',
        '    <path d="M62 165 Q103 171 144 165"/>',
        '    <path d="M62 176 Q103 182 144 176"/>',
        '    <path d="M62 187 Q103 193 144 187"/>',
        '  </g>',
        '  <g stroke="' + p.rim + '" stroke-width="1.2" stroke-linecap="round" opacity="0.72">',
        '    <path d="M64 156 Q103 162 142 156"/>',
        '    <path d="M64 167 Q103 173 142 167"/>',
        '    <path d="M64 178 Q103 184 142 178"/>',
        '    <path d="M64 189 Q103 195 142 189"/>',
        '  </g>',
        '  <!-- Рельефный логотип-капля воды на верхней части корпуса -->',
        '  <path d="M103 98 C103 98, 118 118, 118 128 C118 136, 111.5 143, 103 143 C94.5 143, 88 136, 88 128 C88 118, 103 98, 103 98 Z" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.8"/>',
        '  <path d="M97 125 C97 130, 99 135, 103 136" fill="none" stroke="' + p.rim + '" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>',
        '  <!-- Прозрачное мерное окошко со шкалой мл в нижней части -->',
        '  <rect x="86" y="204" width="38" height="48" rx="6" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.6"/>',
        '  <g stroke="' + p.groove + '" stroke-width="1.8" stroke-linecap="round">',
        '    <line x1="108" y1="214" x2="120" y2="214"/>',
        '    <line x1="112" y1="224" x2="120" y2="224"/>',
        '    <line x1="108" y1="234" x2="120" y2="234"/>',
        '    <line x1="112" y1="244" x2="120" y2="244"/>',
        '  </g>',
        '  <text x="104" y="217" text-anchor="end" font-family="Manrope, sans-serif" font-size="8.5" font-weight="800" fill="' + p.text + '">750</text>',
        '  <text x="104" y="237" text-anchor="end" font-family="Manrope, sans-serif" font-size="8.5" font-weight="800" fill="' + p.text + '">500</text>',
        '  <!-- Противоскользящая нижняя окантовка дна -->',
        '  <path d="M54 256 Q103 266 152 256" fill="none" stroke="' + p.groove + '" stroke-width="2.2" opacity="0.55"/>',
        '</g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'pilatesRing') {
      return [
        '<svg viewBox="0 0 240 240" aria-hidden="true">' + defs,
        wallMound(id, 120, 122, 108, 108),
        '<g transform="rotate(14 120 120)" ' + emb + '>',
        '  <circle cx="120" cy="120" r="84" fill="none" stroke="' + lin + '" stroke-width="22"/>',
        '  <circle cx="120" cy="120" r="95" fill="none" stroke="' + p.rimSoft + '" stroke-width="2.2"/>',
        '  <circle cx="120" cy="120" r="73" fill="none" stroke="' + p.groove + '" stroke-width="2.6"/>',
        '  <path d="M84 24 Q120 12 156 24 L151 39 Q120 30 89 39 Z" fill="' + rev + '" stroke="' + p.rimSoft + '" stroke-width="1.8"/>',
        '  <path d="M94 46 Q120 55 146 46 L143 56 Q120 63 97 56 Z" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.6"/>',
        '  <path d="M84 216 Q120 228 156 216 L151 201 Q120 210 89 201 Z" fill="' + rev + '" stroke="' + p.rimSoft + '" stroke-width="1.8"/>',
        '  <path d="M94 194 Q120 185 146 194 L143 184 Q120 177 97 184 Z" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.6"/>',
        '</g>',
        '</svg>'
      ].join('');
    }

    // stopwatch — детализированный хронограф
    return [
      '<svg viewBox="0 0 230 255" aria-hidden="true">' + defs,
      wallMound(id, 116, 144, 102, 104),
      '<g ' + emb + '>',
      '  <circle cx="115" cy="28" r="16" fill="none" stroke="' + p.rim + '" stroke-width="5.5"/>',
      '  <rect x="101" y="40" width="28" height="16" rx="5" fill="' + met + '" stroke="' + p.rimSoft + '" stroke-width="1.6"/>',
      '  <rect x="170" y="62" width="18" height="12" rx="4" transform="rotate(38 179 68)" fill="' + met + '" stroke="' + p.rimSoft + '" stroke-width="1.6"/>',
      '  <circle cx="115" cy="146" r="88" fill="' + rad + '" stroke="' + p.rimSoft + '" stroke-width="2.4"/>',
      '  <circle cx="115" cy="146" r="72" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="2.4"/>',
      '  <g stroke="' + p.text + '" stroke-width="3" stroke-linecap="round">',
      '    <line x1="115" y1="84" x2="115" y2="96"/><line x1="115" y1="196" x2="115" y2="208"/>',
      '    <line x1="53" y1="146" x2="65" y2="146"/><line x1="165" y1="146" x2="177" y2="146"/>',
      '    <line x1="71" y1="102" x2="78" y2="109"/><line x1="159" y1="102" x2="152" y2="109"/>',
      '    <line x1="71" y1="190" x2="78" y2="183"/><line x1="159" y1="190" x2="152" y2="183"/>',
      '  </g>',
      '  <circle cx="115" cy="118" r="15" fill="none" stroke="' + p.groove + '" stroke-width="1.6"/>',
      '  <line x1="115" y1="118" x2="122" y2="110" stroke="' + p.text + '" stroke-width="2" stroke-linecap="round"/>',
      '  <line x1="115" y1="146" x2="115" y2="98" stroke="' + p.text + '" stroke-width="4.4" stroke-linecap="round"/>',
      '  <line x1="115" y1="146" x2="150" y2="162" stroke="' + p.text + '" stroke-width="3.4" stroke-linecap="round"/>',
      '  <circle cx="115" cy="146" r="7.5" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.8"/>',
      '</g>',
      '</svg>'
    ].join('');
  }

  // 15 скульптурных точек равномерно по сайту — УВЕЛИЧЕНЫ НА +18–20%
  var PLACEMENTS = [
    { sel: '.hero',         shape: 'dumbbell',     left: '1%',  top: '10%', size: 212, rot: -12 },
    { sel: '.hero',         shape: 'ppPlate',      left: '42%', top: '74%', size: 198, rot: 8 },
    { sel: '.goals-sec',    shape: 'barbell',      left: '2%',  top: '6%',  size: 252, rot: -6, dark: true },
    { sel: '.goals-sec',    shape: 'kettlebell16', left: '76%', top: '48%', size: 242, rot: -8, dark: true },
    { sel: '.cases-sec',    shape: 'sneaker',      left: '73%', top: '4%',  size: 222, rot: -10 },
    { sel: '.cases-sec',    shape: 'shaker',       left: '1%',  top: '68%', size: 198, rot: 14 },
    { sel: '.gift-sec',     shape: 'weightPlate',  left: '82%', top: '8%',  size: 198, rot: -15 },
    { sel: '.reviews-sec',  shape: 'jumprope',     left: '4%',  top: '8%',  size: 210, rot: -10 },
    { sel: '.reviews-sec',  shape: 'proteinJar',   left: '80%', top: '62%', size: 198, rot: 12 },
    { sel: '.about-sec',    shape: 'yogaMat',      left: '68%', top: '2%',  size: 256, rot: 8 },
    { sel: '.about-sec',    shape: 'kettlebell16', left: '1%',  bottom: '-10px', size: 196, rot: -8 },
    { sel: '.approach-sec', shape: 'stopwatch',    left: '77%', top: '8%',  size: 204, rot: 10 },
    { sel: '.services-sec', shape: 'barbell',      left: '2%',  top: '78%', size: 258, rot: -8 },
    { sel: '.steps-sec',    shape: 'pilatesRing',  left: '76%', top: '10%', size: 210, rot: -14 },
    { sel: '.faq-sec',      shape: 'sportBottle',  left: '77%', top: '44%', size: 236, rot: 12 }
  ];

  function initNastyaReliefs() {
    injectReliefStyles();
    document.querySelectorAll('.wall-sculpture').forEach(function (el) { el.remove(); });

    PLACEMENTS.forEach(function (p, idx) {
      var host = document.querySelector(p.sel);
      if (!host) return;
      host.classList.add('wall-relief-host');

      var wrap = document.createElement('div');
      wrap.className = 'wall-sculpture' + (p.dark ? ' on-dark' : '');
      wrap.setAttribute('data-shape', p.shape);
      if (p.left != null) wrap.style.left = p.left;
      if (p.right != null) wrap.style.right = p.right;
      if (p.bottom != null) { wrap.style.bottom = p.bottom; wrap.style.top = 'auto'; }
      else if (p.top != null) { wrap.style.top = p.top; }
      wrap.style.width = p.size + 'px';
      wrap.style.height = p.size + 'px';
      wrap.style.transform = 'rotate(' + (p.rot || 0) + 'deg)';
      wrap.innerHTML = renderShape(p.shape, 'rlf_' + idx, !!p.dark);
      host.insertBefore(wrap, host.firstChild);
    });
  }

  window.initNastyaReliefs = initNastyaReliefs;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initNastyaReliefs, 60); });
  } else {
    setTimeout(initNastyaReliefs, 60);
  }
})();
