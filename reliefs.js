/**
 * reliefs.js — 15 высокодетализированных скульптурных барельефов (стиль immersive-g.com)
 * «Замурованные» в поверхность стены объёмные объекты спортинвентаря и ПП:
 * - Многослойные градиенты, фаски, рифление, тени и верхние блики (без мультяшности)
 * - Реалистичная пудовая гиря с рельефной отливкой «16 КГ» в блоке «Направления работы»
 * - Отдельная палитра для светлых и тёмных секций
 * - Полная адаптация под смартфоны (масштаб, контрастность и безопасные отступы от текста)
 */
(function () {
  'use strict';

  function injectReliefStyles() {
    if (document.getElementById('nastya-reliefs-css')) return;
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
      '  opacity: var(--relief-opacity, 0.34);',
      '  will-change: transform;',
      '  filter: drop-shadow(-6px -6px 10px rgba(255, 255, 255, 0.92)) drop-shadow(8px 12px 18px rgba(63, 41, 27, 0.22));',
      '}',
      '.wall-sculpture.on-dark {',
      '  opacity: calc(var(--relief-opacity, 0.34) * 1.15);',
      '  filter: drop-shadow(-4px -4px 8px rgba(246, 217, 168, 0.16)) drop-shadow(8px 14px 20px rgba(8, 4, 2, 0.72));',
      '}',
      '.wall-sculpture svg { width: 100%; height: 100%; overflow: visible; display: block; }',
      '@media (max-width: 1024px) {',
      '  .wall-sculpture { opacity: calc(var(--relief-opacity, 0.34) * 0.88); }',
      '}',
      '@media (max-width: 720px) {',
      '  .wall-sculpture {',
      '    opacity: calc(var(--relief-opacity, 0.34) * 0.72);',
      '    max-width: 145px !important;',
      '    max-height: 145px !important;',
      '  }',
      '  .wall-sculpture.on-dark {',
      '    opacity: calc(var(--relief-opacity, 0.34) * 0.92);',
      '  }',
      '  .wall-sculpture[data-shape="kettlebell16"].on-dark {',
      '    max-width: 168px !important;',
      '    max-height: 168px !important;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function paletteFor(dark) {
    if (dark) {
      return {
        hi: '#6A4934',
        mid: '#4B3121',
        low: '#321F14',
        deep: '#1F120A',
        rim: 'rgba(246, 217, 168, 0.34)',
        groove: 'rgba(14, 7, 3, 0.62)',
        text: '#C79B6B',
        accent: '#7D583F'
      };
    }
    return {
      hi: '#FFFDF9',
      mid: '#EFE5D6',
      low: '#DDD0BC',
      deep: '#C3B198',
      rim: 'rgba(255, 255, 255, 0.92)',
      groove: 'rgba(92, 67, 48, 0.28)',
      text: '#8A735D',
      accent: '#E4D6C3'
    };
  }

  function buildDefs(id, p) {
    return [
      '<defs>',
      '  <linearGradient id="' + id + '_lin" x1="12%" y1="8%" x2="88%" y2="92%">',
      '    <stop offset="0%" stop-color="' + p.hi + '"/>',
      '    <stop offset="48%" stop-color="' + p.mid + '"/>',
      '    <stop offset="100%" stop-color="' + p.low + '"/>',
      '  </linearGradient>',
      '  <linearGradient id="' + id + '_rev" x1="88%" y1="92%" x2="12%" y2="8%">',
      '    <stop offset="0%" stop-color="' + p.hi + '"/>',
      '    <stop offset="55%" stop-color="' + p.mid + '"/>',
      '    <stop offset="100%" stop-color="' + p.deep + '"/>',
      '  </linearGradient>',
      '  <radialGradient id="' + id + '_rad" cx="34%" cy="28%" r="72%">',
      '    <stop offset="0%" stop-color="' + p.hi + '"/>',
      '    <stop offset="46%" stop-color="' + p.mid + '"/>',
      '    <stop offset="82%" stop-color="' + p.low + '"/>',
      '    <stop offset="100%" stop-color="' + p.deep + '"/>',
      '  </radialGradient>',
      '  <linearGradient id="' + id + '_met" x1="0%" y1="0%" x2="0%" y2="100%">',
      '    <stop offset="0%" stop-color="' + p.hi + '"/>',
      '    <stop offset="30%" stop-color="' + p.mid + '"/>',
      '    <stop offset="70%" stop-color="' + p.deep + '"/>',
      '    <stop offset="100%" stop-color="' + p.low + '"/>',
      '  </linearGradient>',
      '</defs>'
    ].join('');
  }

  function renderShape(shape, id, dark) {
    var p = paletteFor(dark);
    var defs = buildDefs(id, p);
    var lin = 'url(#' + id + '_lin)';
    var rev = 'url(#' + id + '_rev)';
    var rad = 'url(#' + id + '_rad)';
    var met = 'url(#' + id + '_met)';

    if (shape === 'kettlebell16') {
      // Реалистичная пудовая гиря с литой дужкой, плоским устойчивым дном и чёткой отливкой «16 КГ»
      return [
        '<svg viewBox="0 0 220 240" aria-hidden="true">' + defs,
        '  <!-- Литая ручка-дужка с анатомическими рогами -->',
        '  <path d="M62 104 C54 64, 62 28, 110 28 C158 28, 166 64, 158 104 L139 108 C144 74, 140 50, 110 50 C80 50, 76 74, 81 108 Z" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '  <!-- Внутренний теневой контур дужки (объём окна хвата) -->',
        '  <path d="M77 98 C73 68, 80 46, 110 46 C140 46, 147 68, 143 98" fill="none" stroke="' + p.groove + '" stroke-width="3.2" stroke-linecap="round"/>',
        '  <!-- Верхний световой блик на перекладине рукояти -->',
        '  <path d="M84 35 C98 31, 122 31, 136 35" fill="none" stroke="' + p.rim + '" stroke-width="3" stroke-linecap="round"/>',
        '  <!-- Массивное чугунное тело гири со срезанным плоским основанием -->',
        '  <path d="M40 150 C38 110, 66 86, 110 86 C154 86, 182 110, 180 150 C179 180, 164 206, 144 218 L76 218 C56 206, 41 180, 40 150 Z" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '  <!-- Плоское устойчивое основание (фаска дна) -->',
        '  <path d="M72 214 Q110 222 148 214 L144 221 Q110 227 76 221 Z" fill="' + p.deep + '" opacity="0.9"/>',
        '  <!-- Скульптурное литейное ребро по плечам гири -->',
        '  <path d="M56 124 C74 102, 146 102, 164 124" fill="none" stroke="' + p.rim + '" stroke-width="2" opacity="0.65"/>',
        '  <!-- Вдавленный овальный медальон на корпусе -->',
        '  <ellipse cx="110" cy="154" rx="44" ry="30" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.8"/>',
        '  <ellipse cx="110" cy="154" rx="40" ry="26" fill="none" stroke="' + p.rim + '" stroke-width="1.1" opacity="0.75"/>',
        '  <!-- Отлитый вес 16 КГ -->',
        '  <text x="110" y="159" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="25" fill="' + p.groove + '" letter-spacing="0.5" transform="translate(1,1.5)">16 КГ</text>',
        '  <text x="110" y="159" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="25" fill="' + p.text + '" letter-spacing="0.5">16 КГ</text>',
        '  <line x1="88" y1="168" x2="132" y2="168" stroke="' + p.groove + '" stroke-width="1.5" stroke-linecap="round"/>',
        '</svg>'
      ].join('');
    }

    if (shape === 'dumbbell') {
      // Детализированная разборная гантель с насечкой грифа, замками и многоступенчатыми блинами
      return [
        '<svg viewBox="0 0 240 150" aria-hidden="true">' + defs,
        '  <g transform="rotate(-14 120 75)">',
        '    <!-- Гриф -->',
        '    <rect x="64" y="66" width="112" height="18" rx="4" fill="' + met + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '    <!-- Насечка (рифление хвата) по центру грифа -->',
        '    <g stroke="' + p.groove + '" stroke-width="1.3" opacity="0.75">',
        '      <line x1="92" y1="68" x2="92" y2="82"/><line x1="98" y1="68" x2="98" y2="82"/>',
        '      <line x1="104" y1="68" x2="104" y2="82"/><line x1="110" y1="68" x2="110" y2="82"/>',
        '      <line x1="116" y1="68" x2="116" y2="82"/><line x1="122" y1="68" x2="122" y2="82"/>',
        '      <line x1="128" y1="68" x2="128" y2="82"/><line x1="134" y1="68" x2="134" y2="82"/>',
        '      <line x1="140" y1="68" x2="140" y2="82"/><line x1="146" y1="68" x2="146" y2="82"/>',
        '    </g>',
        '    <!-- Внутренние гайки-фиксаторы -->',
        '    <rect x="68" y="61" width="9" height="28" rx="3" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1"/>',
        '    <rect x="163" y="61" width="9" height="28" rx="3" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1"/>',
        '    <!-- Левые блины (большой + средний + малый + заглушка) -->',
        '    <rect x="46" y="26" width="20" height="98" rx="8" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <line x1="56" y1="32" x2="56" y2="118" stroke="' + p.groove + '" stroke-width="1.5" opacity="0.5"/>',
        '    <rect x="27" y="36" width="17" height="78" rx="7" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.4"/>',
        '    <rect x="13" y="48" width="12" height="54" rx="5" fill="' + rev + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '    <rect x="5" y="65" width="8" height="20" rx="3" fill="' + met + '"/>',
        '    <!-- Правые блины -->',
        '    <rect x="174" y="26" width="20" height="98" rx="8" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <line x1="184" y1="32" x2="184" y2="118" stroke="' + p.groove + '" stroke-width="1.5" opacity="0.5"/>',
        '    <rect x="196" y="36" width="17" height="78" rx="7" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.4"/>',
        '    <rect x="215" y="48" width="12" height="54" rx="5" fill="' + rev + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '    <rect x="227" y="65" width="8" height="20" rx="3" fill="' + met + '"/>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'barbell') {
      // Олимпийская штанга с втулками, замками и тремя парами дисков
      return [
        '<svg viewBox="0 0 280 140" aria-hidden="true">' + defs,
        '  <g transform="rotate(10 140 70)">',
        '    <rect x="6" y="65" width="268" height="10" rx="4" fill="' + met + '" stroke="' + p.rim + '" stroke-width="1"/>',
        '    <!-- Втулки (стаканы) -->',
        '    <rect x="56" y="61" width="14" height="18" rx="3" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1"/>',
        '    <rect x="210" y="61" width="14" height="18" rx="3" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1"/>',
        '    <!-- Центральная насечка -->',
        '    <line x1="100" y1="70" x2="180" y2="70" stroke="' + p.groove + '" stroke-width="5" stroke-dasharray="2.5 3.5" opacity="0.65"/>',
        '    <!-- Левые диски -->',
        '    <rect x="38" y="16" width="16" height="108" rx="6" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <rect x="22" y="26" width="14" height="88" rx="5" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.3"/>',
        '    <rect x="10" y="40" width="10" height="60" rx="4" fill="' + rev + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '    <!-- Правые диски -->',
        '    <rect x="226" y="16" width="16" height="108" rx="6" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <rect x="244" y="26" width="14" height="88" rx="5" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.3"/>',
        '    <rect x="260" y="40" width="10" height="60" rx="4" fill="' + rev + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'weightPlate') {
      // Олимпийский блин с 3 эргономичными прорезями-хватами, втулкой и маркировкой 10 KG
      return [
        '<svg viewBox="0 0 200 200" aria-hidden="true">' + defs,
        '  <circle cx="100" cy="100" r="88" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="2"/>',
        '  <circle cx="100" cy="100" r="76" fill="none" stroke="' + p.groove + '" stroke-width="2.5"/>',
        '  <circle cx="100" cy="100" r="73" fill="none" stroke="' + p.rim + '" stroke-width="1.2" opacity="0.8"/>',
        '  <!-- 3 выреза-хвата -->',
        '  <path d="M72 34 A68 68 0 0 1 128 34 L120 52 A48 48 0 0 0 80 52 Z" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="1.5"/>',
        '  <path d="M164 114 A68 68 0 0 1 136 162 L124 146 A48 48 0 0 0 144 112 Z" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="1.5"/>',
        '  <path d="M64 162 A68 68 0 0 1 36 114 L56 112 A48 48 0 0 0 76 146 Z" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="1.5"/>',
        '  <!-- Центральная ступица и втулка -->',
        '  <circle cx="100" cy="100" r="30" fill="' + rev + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '  <circle cx="100" cy="100" r="16" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="2"/>',
        '  <text x="100" y="70" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="13" fill="' + p.text + '" letter-spacing="1">10 KG</text>',
        '  <text x="100" y="142" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="10" fill="' + p.text + '" letter-spacing="1.5">FITNESS</text>',
        '</svg>'
      ].join('');
    }

    if (shape === 'sneaker') {
      // Реалистичный спортивный кроссовок в профиль с протектором, шнуровкой и прошивкой
      return [
        '<svg viewBox="0 0 240 160" aria-hidden="true">' + defs,
        '  <g transform="rotate(-10 120 84)">',
        '    <!-- Основной верх кроссовка -->',
        '    <path d="M26 106 L34 52 C44 64, 62 66, 76 52 L92 38 C100 32, 108 38, 114 48 L156 76 C178 80, 212 86, 216 104 L214 112 L24 112 Z" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '    <!-- Задняя петля -->',
        '    <path d="M34 54 C28 42, 34 32, 42 44" fill="none" stroke="' + p.rim + '" stroke-width="4" stroke-linecap="round"/>',
        '    <!-- Усиленный задник и накладка мыска -->',
        '    <path d="M26 106 L34 68 C52 72, 64 84, 66 106 Z" fill="' + rev + '" opacity="0.85"/>',
        '    <path d="M174 82 C196 86, 212 92, 215 106 L170 106 Z" fill="' + rev + '" opacity="0.8"/>',
        '    <!-- Шнуровка (4 чётких стежка) -->',
        '    <g stroke="' + p.rim + '" stroke-width="3.2" stroke-linecap="round">',
        '      <line x1="106" y1="50" x2="118" y2="44"/>',
        '      <line x1="118" y1="58" x2="130" y2="52"/>',
        '      <line x1="130" y1="66" x2="142" y2="60"/>',
        '      <line x1="142" y1="74" x2="154" y2="68"/>',
        '    </g>',
        '    <!-- Боковая динамическая полоса -->',
        '    <path d="M74 96 C104 94, 134 86, 158 76 C138 94, 112 102, 74 102 Z" fill="' + p.groove + '" opacity="0.5"/>',
        '    <!-- Многослойная амортизирующая подошва -->',
        '    <path d="M20 106 L218 106 C222 106, 224 116, 214 122 L30 124 C18 124, 16 112, 20 106 Z" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <!-- Воздушная капсула в пятке -->',
        '    <rect x="42" y="111" width="38" height="7" rx="3.5" fill="' + p.groove + '" opacity="0.55"/>',
        '    <!-- Рисунок протектора -->',
        '    <path d="M28 124 H210" stroke="' + p.groove + '" stroke-width="3" stroke-dasharray="10 5"/>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'shaker') {
      // Спортивный шейкер с мерной шкалой, крышкой-клапаном и рёбрами хвата
      return [
        '<svg viewBox="0 0 170 220" aria-hidden="true">' + defs,
        '  <g transform="rotate(-11 85 110)">',
        '    <!-- Петля для переноски на крышке -->',
        '    <path d="M98 22 C118 20, 124 38, 112 46" fill="none" stroke="' + p.rim + '" stroke-width="5" stroke-linecap="round"/>',
        '    <!-- Носик-клапан -->',
        '    <rect x="64" y="16" width="26" height="16" rx="4" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.4"/>',
        '    <!-- Винтовая крышка -->',
        '    <rect x="42" y="32" width="86" height="22" rx="7" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '    <g stroke="' + p.groove + '" stroke-width="1.4" opacity="0.6">',
        '      <line x1="54" y1="36" x2="54" y2="50"/><line x1="66" y1="36" x2="66" y2="50"/>',
        '      <line x1="78" y1="36" x2="78" y2="50"/><line x1="90" y1="36" x2="90" y2="50"/>',
        '      <line x1="102" y1="36" x2="102" y2="50"/><line x1="114" y1="36" x2="114" y2="50"/>',
        '    </g>',
        '    <!-- Конический стакан шейкера -->',
        '    <path d="M46 56 H124 L115 194 C114 202, 56 202, 55 194 Z" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '    <!-- Боковые эргономичные рёбра хвата -->',
        '    <path d="M49 88 L56 90 L55 138 L49 140" fill="' + p.groove + '" opacity="0.35"/>',
        '    <path d="M121 88 L114 90 L115 138 L121 140" fill="' + p.groove + '" opacity="0.35"/>',
        '    <!-- Мерная шкала мл -->',
        '    <g stroke="' + p.groove + '" stroke-width="1.5" stroke-linecap="round" opacity="0.7">',
        '      <line x1="76" y1="84" x2="94" y2="84"/>',
        '      <line x1="80" y1="102" x2="94" y2="102"/>',
        '      <line x1="76" y1="120" x2="94" y2="120"/>',
        '      <line x1="80" y1="138" x2="94" y2="138"/>',
        '      <line x1="76" y1="156" x2="94" y2="156"/>',
        '    </g>',
        '    <text x="64" y="88" font-family="Manrope, sans-serif" font-size="8.5" font-weight="700" fill="' + p.text + '">600</text>',
        '    <text x="64" y="124" font-family="Manrope, sans-serif" font-size="8.5" font-weight="700" fill="' + p.text + '">400</text>',
        '    <text x="64" y="160" font-family="Manrope, sans-serif" font-size="8.5" font-weight="700" fill="' + p.text + '">200</text>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'proteinJar') {
      // Банка спортивного питания с ребристой крышкой и рельефной этикеткой
      return [
        '<svg viewBox="0 0 180 210" aria-hidden="true">' + defs,
        '  <g transform="rotate(8 90 105)">',
        '    <!-- Ребристая крышка -->',
        '    <rect x="44" y="20" width="92" height="24" rx="6" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <g stroke="' + p.groove + '" stroke-width="1.5" opacity="0.6">',
        '      <line x1="56" y1="24" x2="56" y2="40"/><line x1="68" y1="24" x2="68" y2="40"/>',
        '      <line x1="80" y1="24" x2="80" y2="40"/><line x1="92" y1="24" x2="92" y2="40"/>',
        '      <line x1="104" y1="24" x2="104" y2="40"/><line x1="116" y1="24" x2="116" y2="40"/>',
        '      <line x1="126" y1="24" x2="126" y2="40"/>',
        '    </g>',
        '    <!-- Плечики и цилиндрический корпус банки -->',
        '    <path d="M52 44 H128 L144 64 V178 C144 188, 136 194, 126 194 H54 C44 194, 36 188, 36 178 V64 Z" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '    <!-- Вдавленная полоса этикетки -->',
        '    <rect x="37" y="78" width="106" height="84" rx="4" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '    <line x1="48" y1="92" x2="132" y2="92" stroke="' + p.rim + '" stroke-width="1.2" opacity="0.8"/>',
        '    <text x="90" y="122" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="18" fill="' + p.text + '" letter-spacing="1.5">WHEY</text>',
        '    <text x="90" y="140" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="9.5" fill="' + p.text + '" letter-spacing="2">PROTEIN</text>',
        '    <line x1="58" y1="150" x2="122" y2="150" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'ppPlate') {
      // Скульптурная тарелка ПП (вид сверху): авокадо, филе гриль, черри, листья зелени + вилка
      return [
        '<svg viewBox="0 0 220 200" aria-hidden="true">' + defs,
        '  <!-- Керамическая тарелка с двойным рельефным кантом -->',
        '  <circle cx="96" cy="100" r="82" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="2"/>',
        '  <circle cx="96" cy="100" r="64" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.6"/>',
        '  <circle cx="96" cy="100" r="61" fill="none" stroke="' + p.rim + '" stroke-width="1" opacity="0.8"/>',
        '  <!-- Половинка авокадо с косточкой -->',
        '  <path d="M56 96 C54 74, 72 60, 86 68 C98 76, 94 102, 76 110 C64 114, 57 108, 56 96 Z" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.4"/>',
        '  <circle cx="74" cy="92" r="10" fill="' + p.deep + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '  <!-- Филе-гриль с диагональными насечками -->',
        '  <rect x="98" y="64" width="44" height="32" rx="12" transform="rotate(14 120 80)" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.4"/>',
        '  <g stroke="' + p.groove + '" stroke-width="1.6" stroke-linecap="round" opacity="0.65">',
        '    <line x1="106" y1="70" x2="116" y2="88"/><line x1="116" y1="68" x2="126" y2="88"/><line x1="126" y1="70" x2="134" y2="88"/>',
        '  </g>',
        '  <!-- Гарнир / зелень и 3 томата черри -->',
        '  <path d="M68 128 C78 112, 102 114, 110 132 C98 144, 76 142, 68 128 Z" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '  <circle cx="122" cy="124" r="9.5" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '  <circle cx="136" cy="110" r="8" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '  <circle cx="108" cy="136" r="7.5" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '  <!-- Вилка справа от тарелки -->',
        '  <g transform="translate(184, 34)">',
        '    <rect x="8" y="54" width="7" height="76" rx="3.5" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '    <path d="M3 10 V36 C3 46, 20 46, 20 36 V10" fill="none" stroke="' + p.rim + '" stroke-width="2.6" stroke-linecap="round"/>',
        '    <line x1="9" y1="10" x2="9" y2="42" stroke="' + p.rim + '" stroke-width="2.4" stroke-linecap="round"/>',
        '    <line x1="14" y1="10" x2="14" y2="42" stroke="' + p.rim + '" stroke-width="2.4" stroke-linecap="round"/>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'jumprope') {
      // Скоростная скакалка с анатомическими рукоятками и изогнутым тросом
      return [
        '<svg viewBox="0 0 210 210" aria-hidden="true">' + defs,
        '  <!-- Объёмная петля троса -->',
        '  <path d="M52 132 C24 72, 60 22, 105 22 C150 22, 186 72, 158 132" fill="none" stroke="' + p.groove + '" stroke-width="7" stroke-linecap="round"/>',
        '  <path d="M52 132 C24 72, 60 22, 105 22 C150 22, 186 72, 158 132" fill="none" stroke="' + p.rim + '" stroke-width="3.2" stroke-linecap="round"/>',
        '  <!-- Левая рукоять с подшипниковой головкой и насечками -->',
        '  <g transform="rotate(14 54 162)">',
        '    <rect x="47" y="128" width="14" height="10" rx="3" fill="' + met + '"/>',
        '    <rect x="43" y="138" width="22" height="58" rx="9" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <g stroke="' + p.groove + '" stroke-width="1.4" opacity="0.65">',
        '      <line x1="47" y1="152" x2="61" y2="152"/><line x1="47" y1="160" x2="61" y2="160"/>',
        '      <line x1="47" y1="168" x2="61" y2="168"/><line x1="47" y1="176" x2="61" y2="176"/>',
        '    </g>',
        '  </g>',
        '  <!-- Правая рукоять -->',
        '  <g transform="rotate(-14 156 162)">',
        '    <rect x="149" y="128" width="14" height="10" rx="3" fill="' + met + '"/>',
        '    <rect x="145" y="138" width="22" height="58" rx="9" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <g stroke="' + p.groove + '" stroke-width="1.4" opacity="0.65">',
        '      <line x1="149" y1="152" x2="163" y2="152"/><line x1="149" y1="160" x2="163" y2="160"/>',
        '      <line x1="149" y1="168" x2="163" y2="168"/><line x1="149" y1="176" x2="163" y2="176"/>',
        '    </g>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'yogaMat') {
      // Скрученный коврик для фитнеса и растяжки со спиралью торца и ремнём-стяжкой
      return [
        '<svg viewBox="0 0 230 160" aria-hidden="true">' + defs,
        '  <g transform="rotate(-20 115 80)">',
        '    <!-- Тело скрученного коврика -->',
        '    <rect x="26" y="42" width="176" height="72" rx="34" fill="' + lin + '" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '    <!-- Текстура коврика -->',
        '    <line x1="88" y1="54" x2="180" y2="54" stroke="' + p.rim + '" stroke-width="1.2" opacity="0.6"/>',
        '    <line x1="92" y1="98" x2="184" y2="98" stroke="' + p.groove + '" stroke-width="1.2" opacity="0.45"/>',
        '    <!-- Спиральный торец слева -->',
        '    <ellipse cx="54" cy="78" rx="22" ry="34" fill="' + rev + '" stroke="' + p.rim + '" stroke-width="1.5"/>',
        '    <path d="M54 52 C66 52, 70 66, 68 78 C66 94, 44 96, 42 78 C40 66, 54 60, 60 72 C64 80, 50 86, 48 76" fill="none" stroke="' + p.groove + '" stroke-width="2.6" stroke-linecap="round"/>',
        '    <!-- Стягивающий ремень с пряжкой -->',
        '    <rect x="116" y="40" width="16" height="76" rx="4" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
        '    <rect x="113" y="68" width="22" height="18" rx="4" fill="' + met + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
        '    <rect x="162" y="40" width="14" height="76" rx="4" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.3"/>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    if (shape === 'pilatesRing') {
      // Кольцо для пилатеса с анатомическими мягкими упорами
      return [
        '<svg viewBox="0 0 210 210" aria-hidden="true">' + defs,
        '  <g transform="rotate(14 105 105)">',
        '    <circle cx="105" cy="105" r="72" fill="none" stroke="' + lin + '" stroke-width="18"/>',
        '    <circle cx="105" cy="105" r="81" fill="none" stroke="' + p.rim + '" stroke-width="1.6"/>',
        '    <circle cx="105" cy="105" r="63" fill="none" stroke="' + p.groove + '" stroke-width="1.8"/>',
        '    <!-- Верхний и нижний мягкие упоры (внешний + внутренний) -->',
        '    <path d="M76 22 Q105 12 134 22 L130 34 Q105 26 80 34 Z" fill="' + rev + '" stroke="' + p.rim + '" stroke-width="1.4"/>',
        '    <path d="M84 39 Q105 46 126 39 L124 47 Q105 53 86 47 Z" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.2"/>',
        '    <path d="M76 188 Q105 198 134 188 L130 176 Q105 184 80 176 Z" fill="' + rev + '" stroke="' + p.rim + '" stroke-width="1.4"/>',
        '    <path d="M84 171 Q105 164 126 171 L124 163 Q105 157 86 163 Z" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.2"/>',
        '  </g>',
        '</svg>'
      ].join('');
    }

    // stopwatch — детализированный спортивный секундомер
    return [
      '<svg viewBox="0 0 200 220" aria-hidden="true">' + defs,
      '  <!-- Кольцо и верхняя кнопка старта -->',
      '  <circle cx="100" cy="24" r="14" fill="none" stroke="' + p.rim + '" stroke-width="4.5"/>',
      '  <rect x="88" y="34" width="24" height="14" rx="4" fill="' + met + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
      '  <!-- Боковая кнопка сброса -->',
      '  <rect x="148" y="54" width="16" height="10" rx="3" transform="rotate(38 156 59)" fill="' + met + '" stroke="' + p.rim + '" stroke-width="1.2"/>',
      '  <!-- Корпус и циферблат -->',
      '  <circle cx="100" cy="126" r="76" fill="' + rad + '" stroke="' + p.rim + '" stroke-width="2"/>',
      '  <circle cx="100" cy="126" r="62" fill="' + rev + '" stroke="' + p.groove + '" stroke-width="1.8"/>',
      '  <!-- 12 делений циферблата -->',
      '  <g stroke="' + p.text + '" stroke-width="2.4" stroke-linecap="round">',
      '    <line x1="100" y1="72" x2="100" y2="82"/><line x1="100" y1="170" x2="100" y2="180"/>',
      '    <line x1="46" y1="126" x2="56" y2="126"/><line x1="144" y1="126" x2="154" y2="126"/>',
      '    <line x1="62" y1="88" x2="68" y2="94"/><line x1="138" y1="88" x2="132" y2="94"/>',
      '    <line x1="62" y1="164" x2="68" y2="158"/><line x1="138" y1="164" x2="132" y2="158"/>',
      '  </g>',
      '  <!-- Малый суб-циферблат -->',
      '  <circle cx="100" cy="103" r="13" fill="none" stroke="' + p.groove + '" stroke-width="1.2"/>',
      '  <line x1="100" y1="103" x2="106" y2="96" stroke="' + p.text + '" stroke-width="1.6" stroke-linecap="round"/>',
      '  <!-- Основные стрелки -->',
      '  <line x1="100" y1="126" x2="100" y2="86" stroke="' + p.text + '" stroke-width="3.6" stroke-linecap="round"/>',
      '  <line x1="100" y1="126" x2="130" y2="140" stroke="' + p.text + '" stroke-width="2.8" stroke-linecap="round"/>',
      '  <circle cx="100" cy="126" r="6" fill="' + lin + '" stroke="' + p.groove + '" stroke-width="1.4"/>',
      '</svg>'
    ].join('');
  }

  // Ровно 15 скульптурных точек равномерно по всему сайту
  var PLACEMENTS = [
    { sel: '.hero',         shape: 'dumbbell',     left: '2%',  top: '12%', size: 175, rot: -12 },
    { sel: '.hero',         shape: 'ppPlate',      left: '44%', top: '76%', size: 165, rot: 8 },
    { sel: '.goals-sec',    shape: 'barbell',      left: '4%',  top: '8%',  size: 210, rot: -6, dark: true },
    { sel: '.goals-sec',    shape: 'kettlebell16', left: '78%', top: '54%', size: 200, rot: -8, dark: true },
    { sel: '.cases-sec',    shape: 'sneaker',      left: '74%', top: '6%',  size: 185, rot: -10 },
    { sel: '.cases-sec',    shape: 'shaker',       left: '2%',  top: '72%', size: 165, rot: 14 },
    { sel: '.gift-sec',     shape: 'weightPlate',  left: '84%', top: '12%', size: 165, rot: -15 },
    { sel: '.reviews-sec',  shape: 'jumprope',     left: '6%',  top: '10%', size: 175, rot: -10 },
    { sel: '.reviews-sec',  shape: 'proteinJar',   left: '82%', top: '66%', size: 165, rot: 12 },
    { sel: '.about-sec',    shape: 'yogaMat',      left: '72%', top: '6%',  size: 190, rot: 12 },
    { sel: '.about-sec',    shape: 'kettlebell16', left: '2%',  top: '74%', size: 175, rot: -10 },
    { sel: '.approach-sec', shape: 'stopwatch',    left: '78%', top: '10%', size: 170, rot: 10 },
    { sel: '.services-sec', shape: 'barbell',      left: '4%',  top: '80%', size: 215, rot: -8 },
    { sel: '.steps-sec',    shape: 'pilatesRing',  left: '78%', top: '12%', size: 175, rot: -14 },
    { sel: '.faq-sec',      shape: 'dumbbell',     left: '80%', top: '56%', size: 185, rot: 16 }
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
      wrap.style.left = p.left;
      wrap.style.top = p.top;
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
