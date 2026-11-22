/**
 * lusion3d.js — Премиальный 3D-портал в невесомость (уровень детализации gift3d.js)
 * - 42 крупных объекта на ПК / 32 на смартфоне (увеличен масштаб + плотное заполнение ~92–95% блока)
 * - Ювелирная PBR-проработка: гантели с замками и золотыми кольцами, гиря 16 КГ,
 *   банка WHEY ISOLATE, керамическая тарелка ПП с лососем, авокадо, киноа, яйцом, черри и вилкой
 * - Студийный PMREM, ACESFilmicToneMapping, живой свет за курсором и плавные 60 FPS
 */
(function () {
  'use strict';

  var started = false;

  function ensureCopyUpdated() {
    var sec = document.getElementById('lusionSection');
    if (!sec) return;
    var h3 = sec.querySelector('.lusion-info h3');
    var p = sec.querySelector('.lusion-info p');
    if (h3) h3.innerHTML = 'Твоя форма рождается из <i>баланса</i>';
    if (p) p.textContent = 'Проведи курсором сквозь невесомость:\n«тренировки, питание и восстановление — работают в единой системе»';
  }

  function injectLusionPortalCSS() {
    var old = document.getElementById('nastya-lusion3d-css');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'nastya-lusion3d-css';
    st.textContent = [
      '.lusion-card {',
      '  position: relative !important;',
      '  height: var(--lusion-h, 460px) !important;',
      '  border-radius: 32px !important;',
      '  overflow: hidden !important;',
      '  background:',
      '    radial-gradient(68% 66% at 54% 48%, rgba(176, 118, 64, 0.28) 0%, rgba(44, 26, 15, 0.58) 56%, rgba(14, 7, 3, 0.97) 100%),',
      '    linear-gradient(145deg, #21130B 0%, #3A2315 52%, #130A05 100%) !important;',
      '  box-shadow:',
      '    0 32px 72px rgba(32, 18, 10, 0.38),',
      '    inset 0 0 88px rgba(8, 4, 2, 0.80),',
      '    inset 0 1px 0 rgba(246, 217, 168, 0.25),',
      '    inset 0 -1px 0 rgba(224, 168, 98, 0.16) !important;',
      '}',
      '.lusion-card::after {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 0;',
      '  border-radius: inherit;',
      '  pointer-events: none;',
      '  z-index: 2;',
      '  box-shadow: inset 0 0 70px rgba(10, 5, 2, 0.68), inset 0 0 0 1px rgba(246, 217, 168, 0.16);',
      '}',
      '.lusion-canvas {',
      '  position: absolute !important;',
      '  inset: 0 !important;',
      '  width: 100% !important;',
      '  height: 100% !important;',
      '  z-index: 1 !important;',
      '  touch-action: pan-y;',
      '}',
      '.lusion-info {',
      '  position: relative !important;',
      '  z-index: 3 !important;',
      '  max-width: 420px !important;',
      '  pointer-events: none !important;',
      '  background: rgba(18, 10, 5, 0.58) !important;',
      '  backdrop-filter: blur(12px) !important;',
      '  -webkit-backdrop-filter: blur(12px) !important;',
      '  padding: 20px 24px !important;',
      '  border-radius: 22px !important;',
      '  border: 1px solid rgba(246, 217, 168, 0.24) !important;',
      '  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.42);',
      '}',
      '.lusion-hint { z-index: 3 !important; }',
      '@media (max-width: 720px) {',
      '  .lusion-card { height: var(--lusion-h-mob, 445px) !important; padding: 18px 14px !important; border-radius: 26px !important; }',
      '  .lusion-info { max-width: 100% !important; padding: 13px 16px !important; border-radius: 18px !important; background: rgba(18, 10, 5, 0.62) !important; }',
      '  .lusion-info h3 { font-size: 1.42rem !important; margin-bottom: 6px !important; }',
      '  .lusion-info p { font-size: 0.77rem !important; line-height: 1.45 !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function createStudioEnvironment(THREE, renderer) {
    var cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 512;
    var cx = cv.getContext('2d');
    var bg = cx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0.0, '#6B4932');
    bg.addColorStop(0.45, '#342014');
    bg.addColorStop(0.56, '#1B100A');
    bg.addColorStop(1.0, '#0F0804');
    cx.fillStyle = bg;
    cx.fillRect(0, 0, 1024, 512);

    function softbox(x, y, rx, ry, col1, col2) {
      cx.save(); cx.translate(x, y); cx.scale(1, ry / rx);
      var g = cx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
      g.addColorStop(0, col1); g.addColorStop(0.55, col2); g.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, rx, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
    softbox(240, 96, 235, 100, 'rgba(255, 250, 240, 1)', 'rgba(246, 217, 168, 0.65)');
    softbox(790, 128, 215, 96, 'rgba(255, 240, 208, 0.98)', 'rgba(224, 168, 98, 0.54)');
    softbox(512, 48, 175, 65, 'rgba(255, 255, 255, 0.95)', 'rgba(255, 244, 224, 0.40)');
    softbox(130, 335, 185, 80, 'rgba(224, 168, 98, 0.50)', 'rgba(138, 90, 50, 0.18)');
    softbox(890, 355, 175, 80, 'rgba(255, 238, 206, 0.45)', 'rgba(138, 90, 50, 0.15)');

    var tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var envRT = pmrem.fromEquirectangular(tex);
    tex.dispose(); pmrem.dispose();
    return envRT.texture;
  }

  function makeGlowDotTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 64; cv.height = 64;
    var cx = cv.getContext('2d');
    var g = cx.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(255, 244, 220, 1)');
    g.addColorStop(0.35, 'rgba(232, 180, 112, 0.65)');
    g.addColorStop(1, 'rgba(232, 180, 112, 0)');
    cx.fillStyle = g; cx.fillRect(0, 0, 64, 64);
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeProteinLabelTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 512;
    var cx = cv.getContext('2d');
    var bg = cx.createLinearGradient(0, 0, 1024, 512);
    bg.addColorStop(0, '#F7EFE2'); bg.addColorStop(0.5, '#FFFBF4'); bg.addColorStop(1, '#EADAC4');
    cx.fillStyle = bg; cx.fillRect(0, 0, 1024, 512);

    var gold = cx.createLinearGradient(0, 0, 1024, 0);
    gold.addColorStop(0, '#B57B3A'); gold.addColorStop(0.3, '#F2CF97');
    gold.addColorStop(0.55, '#C9904E'); gold.addColorStop(0.8, '#F6D9A8'); gold.addColorStop(1, '#9E6324');
    cx.fillStyle = gold; cx.fillRect(0, 0, 1024, 34); cx.fillRect(0, 478, 1024, 34);

    cx.fillStyle = '#2B190E'; cx.fillRect(130, 58, 764, 396);
    cx.strokeStyle = '#E6B672'; cx.lineWidth = 4; cx.strokeRect(146, 74, 732, 364);
    cx.strokeStyle = 'rgba(246, 217, 168, 0.38)'; cx.lineWidth = 1.5; cx.strokeRect(158, 86, 708, 340);

    cx.fillStyle = '#E7C08A'; cx.font = '600 24px Manrope, sans-serif'; cx.textAlign = 'center';
    cx.fillText('ANASTASIA • PREMIUM NUTRITION', 512, 136);
    cx.fillStyle = '#FFFBF5'; cx.font = '700 84px Georgia, serif';
    cx.fillText('WHEY ISOLATE', 512, 236);
    cx.fillStyle = '#E6B672'; cx.fillRect(342, 264, 340, 3);
    cx.fillStyle = '#F6D9A8'; cx.font = '600 27px Manrope, sans-serif';
    cx.fillText('24g PROTEIN  •  0g SUGAR  •  BCAA', 512, 316);
    cx.fillStyle = 'rgba(246, 217, 168, 0.14)'; cx.fillRect(256, 348, 512, 52);
    cx.fillStyle = '#FFF3DF'; cx.font = '500 22px Manrope, sans-serif';
    cx.fillText('VANILLA CREAM  |  NET WT 900g', 512, 382);

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    return tex;
  }

  function makeSalmonTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    var cx = cv.getContext('2d');
    var g = cx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, '#F59168'); g.addColorStop(0.5, '#E4724C'); g.addColorStop(1, '#C95434');
    cx.fillStyle = g; cx.fillRect(0, 0, 512, 512);
    cx.strokeStyle = 'rgba(255, 228, 206, 0.58)'; cx.lineWidth = 7;
    for (var i = -100; i < 620; i += 32) {
      cx.beginPath(); cx.moveTo(i, 0); cx.bezierCurveTo(i + 40, 170, i - 30, 340, i + 25, 512); cx.stroke();
    }
    cx.strokeStyle = 'rgba(84, 30, 14, 0.45)'; cx.lineWidth = 14;
    for (var j = 56; j < 520; j += 92) {
      cx.beginPath(); cx.moveTo(0, j); cx.lineTo(512, j - 70); cx.stroke();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeQuinoaTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    var cx = cv.getContext('2d');
    cx.fillStyle = '#D7B57E'; cx.fillRect(0, 0, 512, 512);
    var colors = ['#F1D9AA', '#CFA465', '#F9E8C4', '#B8894C', '#5E8E40'];
    for (var i = 0; i < 2000; i++) {
      cx.fillStyle = colors[i % 17 === 0 ? 4 : (i % 4)];
      cx.beginPath(); cx.arc(Math.random() * 512, Math.random() * 512, 2.2 + Math.random() * 4.2, 0, Math.PI * 2); cx.fill();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeKnurlBumpTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    cx.fillStyle = '#808080'; cx.fillRect(0, 0, 256, 256);
    cx.strokeStyle = '#ffffff'; cx.lineWidth = 3;
    for (var i = -256; i < 512; i += 12) {
      cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + 256, 256); cx.stroke();
      cx.beginPath(); cx.moveTo(i + 256, 0); cx.lineTo(i, 256); cx.stroke();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(4, 2);
    return tex;
  }

  function makeKettlebellBadgeTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    var g = cx.createRadialGradient(128, 128, 16, 128, 128, 122);
    g.addColorStop(0, '#5A3B27'); g.addColorStop(1, '#22130A');
    cx.fillStyle = g; cx.fillRect(0, 0, 256, 256);
    cx.strokeStyle = '#E6B672'; cx.lineWidth = 10;
    cx.beginPath(); cx.arc(128, 128, 108, 0, Math.PI * 2); cx.stroke();
    cx.strokeStyle = 'rgba(255, 244, 220, 0.55)'; cx.lineWidth = 2.5;
    cx.beginPath(); cx.arc(128, 128, 96, 0, Math.PI * 2); cx.stroke();
    cx.fillStyle = '#F6D9A8'; cx.font = '800 68px Manrope, sans-serif'; cx.textAlign = 'center';
    cx.fillText('16', 128, 134);
    cx.font = '700 32px Manrope, sans-serif';
    cx.fillText('КГ', 128, 176);
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // ==========================================================================
  // ФАБРИКА ЮВЕЛИРНЫХ PBR-МОДЕЛЕЙ (КАЧЕСТВО GIFT3D.JS + ОБЩИЕ ГЕОМЕТРИИ)
  // ==========================================================================
  function createModelFactory(THREE, textures) {
    var mats = {
      ceramic: new THREE.MeshPhysicalMaterial({ color: 0xFAF4EA, roughness: 0.14, metalness: 0.04, clearcoat: 0.96, clearcoatRoughness: 0.08 }),
      gold: new THREE.MeshPhysicalMaterial({ color: 0xE6B672, roughness: 0.20, metalness: 0.92, clearcoat: 0.45, clearcoatRoughness: 0.14 }),
      choco: new THREE.MeshPhysicalMaterial({ color: 0x2B1A11, roughness: 0.30, metalness: 0.36, clearcoat: 0.42, clearcoatRoughness: 0.20 }),
      espresso: new THREE.MeshPhysicalMaterial({ color: 0x3F2719, roughness: 0.36, metalness: 0.44, clearcoat: 0.34 }),
      iron: new THREE.MeshPhysicalMaterial({ color: 0x352217, roughness: 0.38, metalness: 0.58, clearcoat: 0.30 }),
      knurl: new THREE.MeshStandardMaterial({ color: 0xEBC286, roughness: 0.26, metalness: 0.88, bumpMap: textures.knurl, bumpScale: 0.028 }),
      label: new THREE.MeshPhysicalMaterial({ map: textures.proteinLabel, roughness: 0.24, metalness: 0.14, clearcoat: 0.48 }),
      salmon: new THREE.MeshPhysicalMaterial({ map: textures.salmon, roughness: 0.32, metalness: 0.02, clearcoat: 0.44, clearcoatRoughness: 0.22 }),
      avoOut: new THREE.MeshStandardMaterial({ color: 0x3A642B, roughness: 0.52 }),
      avoIn: new THREE.MeshPhysicalMaterial({ color: 0xAED46E, roughness: 0.30, clearcoat: 0.26 }),
      spinach: new THREE.MeshStandardMaterial({ color: 0x387733, roughness: 0.40, side: THREE.DoubleSide }),
      cherry: new THREE.MeshPhysicalMaterial({ color: 0xD22D25, roughness: 0.06, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
      quinoa: new THREE.MeshStandardMaterial({ map: textures.quinoa, bumpMap: textures.quinoa, bumpScale: 0.032, roughness: 0.70 }),
      eggW: new THREE.MeshPhysicalMaterial({ color: 0xFFFDF8, roughness: 0.15, clearcoat: 0.75 }),
      eggY: new THREE.MeshPhysicalMaterial({ color: 0xF5A41F, roughness: 0.12, clearcoat: 0.88 }),
      kbBadge: new THREE.MeshStandardMaterial({ map: textures.kbBadge, roughness: 0.28, metalness: 0.48 })
    };

    // 1. Керамическая тарелка ПП-еды (детализированный ободок + вилка + ингредиенты)
    var plateGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, -0.11), new THREE.Vector2(0.46, -0.11), new THREE.Vector2(0.55, -0.06),
      new THREE.Vector2(0.84, 0.06), new THREE.Vector2(0.92, 0.13), new THREE.Vector2(0.90, 0.165),
      new THREE.Vector2(0.79, 0.10), new THREE.Vector2(0.51, -0.02), new THREE.Vector2(0.0, -0.03)
    ], 44);
    var plateRimOuter = new THREE.TorusGeometry(0.912, 0.016, 12, 48);
    var plateRimInner = new THREE.TorusGeometry(0.60, 0.009, 10, 40);
    var salmonGeo = new THREE.SphereGeometry(0.32, 24, 18); salmonGeo.scale(1.24, 0.38, 0.76);
    var quinoaGeo = new THREE.SphereGeometry(0.28, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.6); quinoaGeo.scale(1.16, 0.64, 1.0);
    var avoInGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.046, 18, 1, false, 0, Math.PI * 1.12);
    var avoOutGeo = new THREE.CylinderGeometry(0.174, 0.174, 0.042, 18, 1, true, 0, Math.PI * 1.12);
    var eggWGeo = new THREE.SphereGeometry(0.155, 18, 14); eggWGeo.scale(1.12, 0.46, 0.92);
    var eggYGeo = new THREE.SphereGeometry(0.088, 16, 14); eggYGeo.scale(1.0, 0.68, 1.0);
    var cherryGeo = new THREE.SphereGeometry(0.084, 16, 16);
    var cherryStemGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.05, 6);
    var leafGeo = new THREE.SphereGeometry(0.165, 12, 10); leafGeo.scale(1.32, 0.08, 0.82);

    // 2. Банка спортпита (многоступенчатые плечики + крышка с накаткой и верхним кольцом)
    var jarBodyGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, -0.68), new THREE.Vector2(0.40, -0.68), new THREE.Vector2(0.47, -0.61),
      new THREE.Vector2(0.48, -0.48), new THREE.Vector2(0.47, -0.45), new THREE.Vector2(0.48, 0.36),
      new THREE.Vector2(0.44, 0.46), new THREE.Vector2(0.36, 0.52), new THREE.Vector2(0.36, 0.59),
      new THREE.Vector2(0.0, 0.59)
    ], 44);
    var jarLabelGeo = new THREE.CylinderGeometry(0.487, 0.487, 0.72, 44, 1, true);
    var jarLidGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, 0.55), new THREE.Vector2(0.415, 0.55), new THREE.Vector2(0.425, 0.575),
      new THREE.Vector2(0.425, 0.74), new THREE.Vector2(0.39, 0.77), new THREE.Vector2(0.33, 0.77),
      new THREE.Vector2(0.31, 0.755), new THREE.Vector2(0.0, 0.755)
    ], 44);
    var jarRibGeo = new THREE.BoxGeometry(0.019, 0.145, 0.024);
    var jarNeckGeo = new THREE.TorusGeometry(0.405, 0.015, 12, 36);

    // 3. Гантель — ТОЧНОЕ ювелирное качество gift3d.js (насечка, замки-втулки, фаски, двойные золотые кольца, торцевые колпачки)
    var dbHandleGeo = new THREE.CylinderGeometry(0.095, 0.095, 1.54, 28);
    var dbCollarGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.095, -0.055), new THREE.Vector2(0.142, -0.055),
      new THREE.Vector2(0.155, -0.03), new THREE.Vector2(0.155, 0.03),
      new THREE.Vector2(0.142, 0.055), new THREE.Vector2(0.095, 0.055)
    ], 28);
    function makeBeveledPlateGeo(outerR, thick) {
      return new THREE.LatheGeometry([
        new THREE.Vector2(0.09, -thick * 0.5),
        new THREE.Vector2(outerR * 0.80, -thick * 0.5),
        new THREE.Vector2(outerR * 0.94, -thick * 0.38),
        new THREE.Vector2(outerR, -thick * 0.22),
        new THREE.Vector2(outerR, thick * 0.22),
        new THREE.Vector2(outerR * 0.94, thick * 0.38),
        new THREE.Vector2(outerR * 0.80, thick * 0.5),
        new THREE.Vector2(0.09, thick * 0.5)
      ], 40);
    }
    var dbPlate1Geo = makeBeveledPlateGeo(0.49, 0.175);
    var dbPlate2Geo = makeBeveledPlateGeo(0.37, 0.145);
    var dbRingBigGeo = new THREE.TorusGeometry(0.36, 0.016, 12, 36);
    var dbRingSmGeo = new THREE.TorusGeometry(0.26, 0.013, 10, 32);
    var dbCapGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.14, 0.0),
      new THREE.Vector2(0.14, 0.055), new THREE.Vector2(0.105, 0.09), new THREE.Vector2(0.0, 0.095)
    ], 26);

    // 4. Литая гиря 16 КГ (многоступенчатый профиль с плоским дном + золотые втулки дужки + медальон)
    var kbBodyGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, -0.48), new THREE.Vector2(0.34, -0.48), new THREE.Vector2(0.38, -0.44),
      new THREE.Vector2(0.49, -0.32), new THREE.Vector2(0.54, -0.04), new THREE.Vector2(0.46, 0.26),
      new THREE.Vector2(0.30, 0.41), new THREE.Vector2(0.0, 0.43)
    ], 42);
    var kbHandleGeo = new THREE.TorusGeometry(0.31, 0.075, 18, 38, Math.PI * 1.18);
    var kbBadgeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.036, 32);
    var kbBadgeRimGeo = new THREE.TorusGeometry(0.252, 0.014, 10, 32);

    function makePPPlate() {
      var g = new THREE.Group();
      g.add(new THREE.Mesh(plateGeo, mats.ceramic));
      var rim1 = new THREE.Mesh(plateRimOuter, mats.gold);
      rim1.rotation.x = Math.PI / 2; rim1.position.y = 0.148; g.add(rim1);
      var rim2 = new THREE.Mesh(plateRimInner, mats.gold);
      rim2.rotation.x = Math.PI / 2; rim2.position.y = 0.015; g.add(rim2);

      var salmon = new THREE.Mesh(salmonGeo, mats.salmon);
      salmon.position.set(0.22, 0.095, -0.18); salmon.rotation.y = -0.35; g.add(salmon);

      var quinoa = new THREE.Mesh(quinoaGeo, mats.quinoa);
      quinoa.position.set(-0.26, -0.01, 0.24); g.add(quinoa);

      for (var a = 0; a < 4; a++) {
        var slice = new THREE.Group();
        slice.add(new THREE.Mesh(avoInGeo, mats.avoIn));
        slice.add(new THREE.Mesh(avoOutGeo, mats.avoOut));
        slice.position.set(-0.32 + a * 0.08, 0.065 + a * 0.018, -0.22 + a * 0.06);
        slice.rotation.set(0.22, 0.5 + a * 0.32, -0.18);
        g.add(slice);
      }

      var eggW = new THREE.Mesh(eggWGeo, mats.eggW); eggW.position.set(0.26, 0.055, 0.26); g.add(eggW);
      var eggY = new THREE.Mesh(eggYGeo, mats.eggY); eggY.position.set(0.26, 0.10, 0.26); g.add(eggY);

      [[0.02, 0.085, 0.38], [0.44, 0.095, 0.06], [-0.04, 0.095, -0.44], [0.12, 0.08, 0.10]].forEach(function (c) {
        var ch = new THREE.Mesh(cherryGeo, mats.cherry); ch.position.set(c[0], c[1], c[2]); g.add(ch);
        var st = new THREE.Mesh(cherryStemGeo, mats.spinach); st.position.set(c[0], c[1] + 0.08, c[2]); g.add(st);
      });

      for (var l = 0; l < 4; l++) {
        var leaf = new THREE.Mesh(leafGeo, mats.spinach);
        var ang = (l / 4) * Math.PI * 2 + 0.4;
        leaf.position.set(Math.cos(ang) * 0.34, 0.038, Math.sin(ang) * 0.32);
        leaf.rotation.set((Math.random() - 0.5) * 0.2, ang, (Math.random() - 0.5) * 0.2);
        g.add(leaf);
      }
      return g;
    }

    function makeProteinJar() {
      var g = new THREE.Group();
      g.add(new THREE.Mesh(jarBodyGeo, mats.choco));
      var label = new THREE.Mesh(jarLabelGeo, mats.label); label.position.y = -0.10; g.add(label);
      g.add(new THREE.Mesh(jarLidGeo, mats.gold));
      for (var r = 0; r < 22; r++) {
        var a = (r / 22) * Math.PI * 2;
        var rib = new THREE.Mesh(jarRibGeo, mats.gold);
        rib.position.set(Math.cos(a) * 0.422, 0.655, Math.sin(a) * 0.422);
        rib.rotation.y = -a;
        g.add(rib);
      }
      var neck = new THREE.Mesh(jarNeckGeo, mats.gold); neck.rotation.x = Math.PI / 2; neck.position.y = 0.545; g.add(neck);
      return g;
    }

    function makeLuxuryDumbbell() {
      var g = new THREE.Group();
      var handle = new THREE.Mesh(dbHandleGeo, mats.knurl); handle.rotation.z = Math.PI / 2; g.add(handle);
      [-1, 1].forEach(function (side) {
        var collar = new THREE.Mesh(dbCollarGeo, mats.gold); collar.rotation.z = Math.PI / 2; collar.position.x = side * 0.36; g.add(collar);
        var p1 = new THREE.Mesh(dbPlate1Geo, mats.choco); p1.rotation.z = Math.PI / 2; p1.position.x = side * 0.50; g.add(p1);
        var ringIn = new THREE.Mesh(dbRingBigGeo, mats.gold); ringIn.rotation.y = Math.PI / 2; ringIn.position.x = side * 0.412; g.add(ringIn);
        var ringOut = new THREE.Mesh(dbRingBigGeo, mats.gold); ringOut.rotation.y = Math.PI / 2; ringOut.position.x = side * 0.588; g.add(ringOut);
        var p2 = new THREE.Mesh(dbPlate2Geo, mats.espresso); p2.rotation.z = Math.PI / 2; p2.position.x = side * 0.68; g.add(p2);
        var ringSm = new THREE.Mesh(dbRingSmGeo, mats.gold); ringSm.rotation.y = Math.PI / 2; ringSm.position.x = side * 0.752; g.add(ringSm);
        var cap = new THREE.Mesh(dbCapGeo, mats.gold); cap.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2; cap.position.x = side * 0.745; g.add(cap);
      });
      return g;
    }

    function makeLuxuryKettlebell() {
      var g = new THREE.Group();
      g.add(new THREE.Mesh(kbBodyGeo, mats.iron));
      var handle = new THREE.Mesh(kbHandleGeo, mats.gold);
      handle.rotation.z = -Math.PI * 0.09; handle.position.y = 0.43; g.add(handle);
      var badge = new THREE.Mesh(kbBadgeGeo, mats.kbBadge);
      badge.rotation.x = Math.PI / 2; badge.position.set(0, -0.02, 0.52); g.add(badge);
      var bRim = new THREE.Mesh(kbBadgeRimGeo, mats.gold);
      bRim.position.set(0, -0.02, 0.535); g.add(bRim);
      return g;
    }

    return { ppPlate: makePPPlate, proteinJar: makeProteinJar, dumbbell: makeLuxuryDumbbell, kettlebell: makeLuxuryKettlebell };
  }

  function startLusionScene() {
    if (started) return;
    var canvas = document.getElementById('lusionCanvas');
    if (!canvas || !window.THREE) return;
    started = true;

    var THREE = window.THREE;
    var isMobile = window.innerWidth <= 720;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x160C06, 0.026);

    var camera = new THREE.PerspectiveCamera(isMobile ? 44 : 42, Math.max(1, canvas.clientWidth) / Math.max(1, canvas.clientHeight), 0.1, 100);
    camera.position.set(0, 0, isMobile ? 11.4 : 11.0);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.26;
    renderer.outputEncoding = THREE.sRGBEncoding;

    scene.environment = createStudioEnvironment(THREE, renderer);

    scene.add(new THREE.HemisphereLight(0xFFF6E8, 0x26150C, 0.98));
    var keyLight = new THREE.DirectionalLight(0xFFF2DC, 1.6); keyLight.position.set(7, 9, 10); scene.add(keyLight);
    var rimLight = new THREE.PointLight(0xE8AF64, 2.0, 38); rimLight.position.set(-8, -4, 6); scene.add(rimLight);
    var cursorLight = new THREE.PointLight(0xF6D9A8, 1.7, 18); cursorLight.position.set(0, 0, 6); scene.add(cursorLight);

    var dustCount = isMobile ? 55 : 105;
    var dustPositions = new Float32Array(dustCount * 3);
    for (var di = 0; di < dustCount; di++) {
      dustPositions[di * 3]     = (Math.random() - 0.5) * 24;
      dustPositions[di * 3 + 1] = (Math.random() - 0.5) * 12;
      dustPositions[di * 3 + 2] = (Math.random() - 0.5) * 10 - 1.5;
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    var dustPoints = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      map: makeGlowDotTexture(THREE), size: isMobile ? 0.16 : 0.20,
      transparent: true, opacity: 0.58, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(dustPoints);

    var factory = createModelFactory(THREE, {
      proteinLabel: makeProteinLabelTexture(THREE),
      salmon: makeSalmonTexture(THREE),
      quinoa: makeQuinoaTexture(THREE),
      knurl: makeKnurlBumpTexture(THREE),
      kbBadge: makeKettlebellBadgeTexture(THREE)
    });

    // +10 элементов: 42 крупных объекта на ПК / 32 на смартфоне!
    var basePattern = ['ppPlate', 'proteinJar', 'dumbbell', 'kettlebell', 'ppPlate', 'dumbbell', 'proteinJar', 'ppPlate', 'kettlebell', 'dumbbell'];
    var totalCount = isMobile ? 32 : 42;
    var recipe = [];
    for (var ri = 0; ri < totalCount; ri++) {
      recipe.push(basePattern[ri % basePattern.length]);
    }

    function getPortalBounds() {
      var vFOV = THREE.MathUtils.degToRad(camera.fov);
      var visH = 2 * Math.tan(vFOV / 2) * camera.position.z;
      var visW = visH * camera.aspect;
      return {
        halfW: visW * 0.54,
        halfH: visH * 0.52,
        minZ: isMobile ? -4.8 : -4.6,
        maxZ: 2.5
      };
    }

    var bounds = getPortalBounds();
    var bodies = [];
    var cols = isMobile ? 4 : 7;
    var rows = Math.ceil(recipe.length / cols);

    recipe.forEach(function (kind, i) {
      var mesh = factory[kind]();
      // Увеличенный в ~1.55–1.65x масштаб — плотное заполнение ~92–95% кадра без пробелов!
      var sizeVar = 0.90 + (i % 4) * 0.08;
      var baseScale = (isMobile ? 1.78 : 2.26) * sizeVar;
      if (kind === 'ppPlate') baseScale *= 1.04;
      if (kind === 'proteinJar') baseScale *= 0.95;
      if (kind === 'dumbbell') baseScale *= 1.06;
      mesh.scale.setScalar(baseScale);

      var col = i % cols;
      var row = Math.floor(i / cols);
      var nx = (col + 0.5) / cols * 2 - 1;
      var ny = (row + 0.5) / rows * 2 - 1;

      var jitterX = (Math.random() - 0.5) * (bounds.halfW * 2 / cols) * 0.32;
      var jitterY = (Math.random() - 0.5) * (bounds.halfH * 2 / rows) * 0.32;
      var px = nx * bounds.halfW * 0.94 + jitterX;
      var py = -ny * bounds.halfH * 0.90 + jitterY;
      // 5 глубинных слоёв по Z, чтобы 42 крупных объекта плотно и мягко заполняли весь объём
      var layerIdx = (col * 2 + row * 3) % 5;
      var pz = bounds.minZ + ((layerIdx + 0.5) / 5) * (bounds.maxZ - bounds.minZ) + (Math.random() - 0.5) * 0.35;

      mesh.position.set(px, py, pz);
      mesh.rotation.set(
        kind === 'ppPlate' ? 0.78 + (Math.random() - 0.5) * 0.48 : (Math.random() - 0.5) * 1.15,
        (Math.random() - 0.5) * 1.9,
        (Math.random() - 0.5) * 0.8
      );

      // Компактный физический радиус (0.68 от визуального), чтобы крупные фигуры ложились плотным объёмом
      var rawRadius = (kind === 'ppPlate' ? 0.85 : kind === 'proteinJar' ? 0.66 : 0.70) * baseScale;
      var collRadius = rawRadius * 0.68;
      scene.add(mesh);

      var driftAngle = Math.random() * Math.PI * 2;
      var driftSpeed = 0.0065 + Math.random() * 0.0085;
      bodies.push({
        mesh: mesh,
        radius: collRadius,
        vel: new THREE.Vector3(Math.cos(driftAngle) * driftSpeed, Math.sin(driftAngle) * driftSpeed, (Math.random() - 0.5) * 0.0035),
        baseDrift: new THREE.Vector3(Math.cos(driftAngle) * driftSpeed, Math.sin(driftAngle) * driftSpeed, (Math.random() - 0.5) * 0.002),
        angVel: new THREE.Vector3((Math.random() - 0.5) * 0.0068, (Math.random() - 0.5) * 0.0085, (Math.random() - 0.5) * 0.0048),
        phase: Math.random() * Math.PI * 2,
        freq: 0.35 + Math.random() * 0.35
      });
    });

    var pointer = new THREE.Vector3(999, 999, 0);
    var pointerVel = new THREE.Vector3(0, 0, 0);
    var pointerNorm = { x: 0, y: 0 };
    var pointerActive = false;

    function updatePointer(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -((clientY - rect.top) / rect.height) * 2 + 1;
      pointerNorm.x = nx; pointerNorm.y = ny;

      var vFOV = THREE.MathUtils.degToRad(camera.fov);
      var visibleH = 2 * Math.tan(vFOV / 2) * camera.position.z;
      var visibleW = visibleH * camera.aspect;
      var wx = nx * visibleW * 0.5;
      var wy = ny * visibleH * 0.5;

      if (pointerActive) {
        pointerVel.set(Math.max(-0.9, Math.min(0.9, wx - pointer.x)), Math.max(-0.9, Math.min(0.9, wy - pointer.y)), 0);
      } else {
        pointerVel.set(0, 0, 0);
      }
      pointer.set(wx, wy, 0.7);
      pointerActive = true;
    }

    function burstAtPointer(strength) {
      if (!pointerActive) return;
      var tmp = new THREE.Vector3();
      bodies.forEach(function (b) {
        tmp.set(b.mesh.position.x - pointer.x, b.mesh.position.y - pointer.y, (b.mesh.position.z - 0.4) * 0.32);
        var dist = tmp.length();
        var maxR = 6.2;
        if (dist < maxR && dist > 0.001) {
          tmp.divideScalar(dist);
          var impulse = ((maxR - dist) / maxR) * strength;
          b.vel.addScaledVector(tmp, impulse);
          b.vel.z += (Math.random() - 0.5) * impulse * 0.28;
          b.angVel.x += (Math.random() - 0.5) * impulse * 0.34;
          b.angVel.y += (Math.random() - 0.5) * impulse * 0.34;
          b.angVel.z += (Math.random() - 0.5) * impulse * 0.26;
        }
      });
    }

    canvas.addEventListener('pointermove', function (e) { updatePointer(e.clientX, e.clientY); });
    canvas.addEventListener('pointerdown', function (e) { updatePointer(e.clientX, e.clientY); burstAtPointer(0.24); });
    canvas.addEventListener('pointerleave', function () { pointerActive = false; pointer.set(999, 999, 0); pointerVel.set(0, 0, 0); });
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) { updatePointer(e.touches[0].clientX, e.touches[0].clientY); burstAtPointer(0.22); }
    }, { passive: true });
    canvas.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', function () { pointerActive = false; pointer.set(999, 999, 0); pointerVel.set(0, 0, 0); });

    var inViewport = true;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        inViewport = entries[0] && entries[0].isIntersecting;
      }, { threshold: 0.05 });
      io.observe(canvas);
    }

    var diffVec = new THREE.Vector3();
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!inViewport || document.hidden) return;

      var t = clock.getElapsedTime();

      var targetCamX = pointerActive ? pointerNorm.x * 0.72 : Math.sin(t * 0.24) * 0.32;
      var targetCamY = pointerActive ? pointerNorm.y * 0.45 : Math.cos(t * 0.20) * 0.20;
      camera.position.x += (targetCamX - camera.position.x) * 0.045;
      camera.position.y += (targetCamY - camera.position.y) * 0.045;
      camera.lookAt(0, 0, -0.7);

      if (pointerActive) {
        cursorLight.position.x += (pointer.x - cursorLight.position.x) * 0.16;
        cursorLight.position.y += (pointer.y - cursorLight.position.y) * 0.16;
        cursorLight.intensity += (2.35 - cursorLight.intensity) * 0.1;
      } else {
        cursorLight.position.x += (Math.sin(t * 0.52) * 4.5 - cursorLight.position.x) * 0.04;
        cursorLight.position.y += (Math.cos(t * 0.40) * 2.1 - cursorLight.position.y) * 0.04;
        cursorLight.intensity += (1.25 - cursorLight.intensity) * 0.06;
      }

      dustPoints.rotation.y = t * 0.020;
      dustPoints.rotation.x = Math.sin(t * 0.13) * 0.05;
      pointerVel.multiplyScalar(0.82);

      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];
        var pos = b.mesh.position;

        b.vel.x += Math.sin(t * b.freq + b.phase) * 0.00030;
        b.vel.y += Math.cos(t * (b.freq * 0.85) + b.phase * 1.3) * 0.00030;
        b.vel.z += Math.sin(t * 0.48 + b.phase * 0.7) * 0.00020;

        if (pointerActive) {
          diffVec.set(pos.x - pointer.x, pos.y - pointer.y, (pos.z - 0.4) * 0.30);
          var dist = diffVec.length();
          var repulseR = b.radius + 2.65;
          if (dist < repulseR && dist > 0.001) {
            var k = (repulseR - dist) / repulseR;
            diffVec.divideScalar(dist);
            b.vel.addScaledVector(diffVec, k * 0.048);
            b.vel.x += pointerVel.x * k * 0.12;
            b.vel.y += pointerVel.y * k * 0.12;
            b.angVel.x += (diffVec.y * 0.010 - pointerVel.y * 0.028) * k;
            b.angVel.y += (-diffVec.x * 0.010 + pointerVel.x * 0.028) * k;
            b.angVel.z += (pointerVel.x * diffVec.y - pointerVel.y * diffVec.x) * 0.022 * k;
          }
        }
      }

      // Мягкие 3D-столкновения (сохраняют плотность портала без взрывов и дёрганий)
      for (var a = 0; a < bodies.length; a++) {
        for (var c = a + 1; c < bodies.length; c++) {
          var b1 = bodies[a];
          var b2 = bodies[c];
          diffVec.subVectors(b2.mesh.position, b1.mesh.position);
          var d = diffVec.length();
          var minDist = b1.radius + b2.radius;
          if (d < minDist && d > 0.0001) {
            var overlap = (minDist - d) * 0.5;
            diffVec.divideScalar(d);
            b1.mesh.position.addScaledVector(diffVec, -overlap * 0.42);
            b2.mesh.position.addScaledVector(diffVec, overlap * 0.42);

            var relVx = b2.vel.x - b1.vel.x;
            var relVy = b2.vel.y - b1.vel.y;
            var relVz = b2.vel.z - b1.vel.z;
            var sepVel = relVx * diffVec.x + relVy * diffVec.y + relVz * diffVec.z;
            if (sepVel < 0) {
              var bounce = -sepVel * 0.50;
              b1.vel.addScaledVector(diffVec, -bounce);
              b2.vel.addScaledVector(diffVec, bounce);
            } else {
              b1.vel.addScaledVector(diffVec, -overlap * 0.020);
              b2.vel.addScaledVector(diffVec, overlap * 0.020);
            }
            b1.angVel.z -= overlap * 0.0022;
            b2.angVel.z += overlap * 0.0022;
          }
        }
      }

      var padX = bounds.halfW;
      var padY = bounds.halfH;
      for (var k = 0; k < bodies.length; k++) {
        var bd = bodies[k];
        var p = bd.mesh.position;

        var speed = bd.vel.length();
        if (speed > 0.22) bd.vel.multiplyScalar(0.22 / speed);
        if (speed > 0.018) bd.vel.multiplyScalar(0.958);
        else if (speed < 0.0045) {
          bd.vel.x += bd.baseDrift.x * 0.05;
          bd.vel.y += bd.baseDrift.y * 0.05;
        }
        p.add(bd.vel);

        // Крупные объекты частично заходят за края портала, закрывая пустые углы
        var limX = Math.max(1.8, padX + bd.radius * 0.08);
        var limY = Math.max(1.4, padY + bd.radius * 0.08);

        if (p.x > limX)  { p.x = limX;  bd.vel.x = -Math.abs(bd.vel.x) * 0.78 - 0.0025; }
        if (p.x < -limX) { p.x = -limX; bd.vel.x =  Math.abs(bd.vel.x) * 0.78 + 0.0025; }
        if (p.y > limY)  { p.y = limY;  bd.vel.y = -Math.abs(bd.vel.y) * 0.78 - 0.0025; }
        if (p.y < -limY) { p.y = -limY; bd.vel.y =  Math.abs(bd.vel.y) * 0.78 + 0.0025; }
        if (p.z > bounds.maxZ) { p.z = bounds.maxZ; bd.vel.z = -Math.abs(bd.vel.z) * 0.75; }
        if (p.z < bounds.minZ) { p.z = bounds.minZ; bd.vel.z =  Math.abs(bd.vel.z) * 0.75; }

        bd.mesh.rotation.x += bd.angVel.x;
        bd.mesh.rotation.y += bd.angVel.y;
        bd.mesh.rotation.z += bd.angVel.z;

        bd.angVel.x = bd.angVel.x * 0.985 + Math.sin(t * 0.40 + bd.phase) * 0.00009;
        bd.angVel.y = bd.angVel.y * 0.985 + 0.00012;
        bd.angVel.z *= 0.985;
      }

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      var mob = window.innerWidth <= 720;
      camera.fov = mob ? 44 : 42;
      camera.position.z = mob ? 11.4 : 11.0;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      bounds = getPortalBounds();
    });
  }

  function initNastyaLusion3D() {
    injectLusionPortalCSS();
    ensureCopyUpdated();
    var canvas = document.getElementById('lusionCanvas');
    if (!canvas) return;
    if (window.THREE) {
      startLusionScene();
    } else if (!document.getElementById('threejs-cdn-script')) {
      var s = document.createElement('script');
      s.id = 'threejs-cdn-script';
      s.src = 'vendor/three.min.js';
      s.onload = startLusionScene;
      document.head.appendChild(s);
    }
  }

  window.initNastyaLusion3D = initNastyaLusion3D;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initNastyaLusion3D, 90); });
  } else {
    setTimeout(initNastyaLusion3D, 90);
  }
})();
