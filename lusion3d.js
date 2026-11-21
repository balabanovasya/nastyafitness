/**
 * lusion3d.js — Портал в отдельное измерение (стиль lusion.co, Часть 4)
 * - Настоящая невесомость по ВСЕМУ объёму блока (без сбивания в кучу в центре)
 * - +30% фигурок (17 на ПК / 12 на смартфоне): тарелки ПП-еды, банки WHEY ISOLATE, гантели и гири 16 КГ
 * - Атмосфера глубокого 3D-портала: экспоненциальная глубина, звёздная золотая пыль, объёмная виньетка
 * - Живая реакция на движение курсора, свайпы и касания (упругий разлёт + вращение + столкновения)
 */
(function () {
  'use strict';

  var started = false;

  function ensureCopyUpdated() {
    var sec = document.getElementById('lusionSection');
    if (!sec) return;
    var h3 = sec.querySelector('.lusion-info h3');
    var p = sec.querySelector('.lusion-info p');
    if (h3) {
      h3.innerHTML = 'Твоя форма рождается из <i>баланса</i>';
    }
    if (p) {
      p.textContent = 'Проведи курсором сквозь невесомость:\n«тренировки, питание и восстановление — работают в единой системе»';
    }
  }

  function injectLusionPortalCSS() {
    var old = document.getElementById('nastya-lusion3d-css');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'nastya-lusion3d-css';
    st.textContent = [
      '.lusion-card {',
      '  position: relative !important;',
      '  height: var(--lusion-h, 430px) !important;',
      '  border-radius: 32px !important;',
      '  overflow: hidden !important;',
      '  background:',
      '    radial-gradient(64% 62% at 54% 48%, rgba(164, 108, 58, 0.24) 0%, rgba(44, 26, 15, 0.55) 56%, rgba(15, 8, 4, 0.96) 100%),',
      '    linear-gradient(145deg, #21130B 0%, #3A2315 52%, #130A05 100%) !important;',
      '  box-shadow:',
      '    0 32px 72px rgba(32, 18, 10, 0.36),',
      '    inset 0 0 85px rgba(8, 4, 2, 0.78),',
      '    inset 0 1px 0 rgba(246, 217, 168, 0.24),',
      '    inset 0 -1px 0 rgba(224, 168, 98, 0.16) !important;',
      '}',
      '/* Внутренняя рамка-глубина портала */',
      '.lusion-card::after {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 0;',
      '  border-radius: inherit;',
      '  pointer-events: none;',
      '  z-index: 2;',
      '  box-shadow: inset 0 0 64px rgba(10, 5, 2, 0.65), inset 0 0 0 1px rgba(246, 217, 168, 0.14);',
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
      '  background: rgba(20, 11, 6, 0.42) !important;',
      '  backdrop-filter: blur(8px) !important;',
      '  -webkit-backdrop-filter: blur(8px) !important;',
      '  padding: 20px 24px !important;',
      '  border-radius: 22px !important;',
      '  border: 1px solid rgba(246, 217, 168, 0.18) !important;',
      '  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.30);',
      '}',
      '.lusion-hint {',
      '  z-index: 3 !important;',
      '}',
      '@media (max-width: 720px) {',
      '  .lusion-card { height: var(--lusion-h-mob, 420px) !important; padding: 18px 14px !important; border-radius: 26px !important; }',
      '  .lusion-info { max-width: 100% !important; padding: 13px 16px !important; border-radius: 18px !important; background: rgba(20, 11, 6, 0.46) !important; }',
      '  .lusion-info h3 { font-size: 1.42rem !important; margin-bottom: 6px !important; }',
      '  .lusion-info p { font-size: 0.77rem !important; line-height: 1.45 !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  // ==========================================================================
  // ПРОЦЕДУРНЫЕ HD-ТЕКСТУРЫ И СТУДИЙНАЯ СРЕДА ОТРАЖЕНИЙ (PMREM)
  // ==========================================================================
  function createStudioEnvironment(THREE, renderer) {
    var cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 512;
    var cx = cv.getContext('2d');

    var bg = cx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0.0, '#5A3E2A');
    bg.addColorStop(0.45, '#2E1D13');
    bg.addColorStop(0.55, '#1A100A');
    bg.addColorStop(1.0, '#0F0804');
    cx.fillStyle = bg;
    cx.fillRect(0, 0, 1024, 512);

    function softbox(x, y, rx, ry, col1, col2) {
      cx.save();
      cx.translate(x, y);
      cx.scale(1, ry / rx);
      var g = cx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
      g.addColorStop(0, col1);
      g.addColorStop(0.55, col2);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = g;
      cx.beginPath();
      cx.arc(0, 0, rx, 0, Math.PI * 2);
      cx.fill();
      cx.restore();
    }

    softbox(240, 100, 220, 95, 'rgba(255, 248, 236, 1)', 'rgba(246, 217, 168, 0.6)');
    softbox(790, 130, 200, 92, 'rgba(255, 236, 200, 0.96)', 'rgba(224, 168, 98, 0.5)');
    softbox(512, 55, 160, 60, 'rgba(255, 255, 255, 0.92)', 'rgba(255, 240, 215, 0.36)');
    softbox(130, 330, 170, 75, 'rgba(224, 168, 98, 0.48)', 'rgba(138, 90, 50, 0.16)');
    softbox(890, 350, 160, 75, 'rgba(255, 235, 200, 0.42)', 'rgba(138, 90, 50, 0.14)');

    var tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;

    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var envRT = pmrem.fromEquirectangular(tex);
    tex.dispose();
    pmrem.dispose();
    return envRT.texture;
  }

  function makeGlowDotTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 64;
    cv.height = 64;
    var cx = cv.getContext('2d');
    var g = cx.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(255, 244, 220, 1)');
    g.addColorStop(0.35, 'rgba(232, 180, 112, 0.65)');
    g.addColorStop(1, 'rgba(232, 180, 112, 0)');
    cx.fillStyle = g;
    cx.fillRect(0, 0, 64, 64);
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeProteinLabelTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 512;
    var cx = cv.getContext('2d');

    var bg = cx.createLinearGradient(0, 0, 1024, 512);
    bg.addColorStop(0, '#F7EFE2');
    bg.addColorStop(0.5, '#FFFBF4');
    bg.addColorStop(1, '#EADAC4');
    cx.fillStyle = bg;
    cx.fillRect(0, 0, 1024, 512);

    var gold = cx.createLinearGradient(0, 0, 1024, 0);
    gold.addColorStop(0, '#B57B3A');
    gold.addColorStop(0.3, '#F2CF97');
    gold.addColorStop(0.55, '#C9904E');
    gold.addColorStop(0.8, '#F6D9A8');
    gold.addColorStop(1, '#9E6324');
    cx.fillStyle = gold;
    cx.fillRect(0, 0, 1024, 34);
    cx.fillRect(0, 478, 1024, 34);

    cx.fillStyle = '#332014';
    cx.fillRect(140, 62, 744, 388);
    cx.strokeStyle = '#E0A862';
    cx.lineWidth = 4;
    cx.strokeRect(156, 78, 712, 356);

    cx.fillStyle = '#E7C08A';
    cx.font = '600 24px Manrope, sans-serif';
    cx.textAlign = 'center';
    cx.fillText('ANASTASIA • PREMIUM NUTRITION', 512, 138);

    cx.fillStyle = '#FFFBF5';
    cx.font = '700 84px Georgia, serif';
    cx.fillText('WHEY ISOLATE', 512, 238);

    cx.fillStyle = '#E0A862';
    cx.fillRect(352, 266, 320, 3);

    cx.fillStyle = '#F6D9A8';
    cx.font = '600 28px Manrope, sans-serif';
    cx.fillText('24g PROTEIN  •  0g SUGAR  •  BCAA', 512, 318);

    cx.fillStyle = 'rgba(246, 217, 168, 0.14)';
    cx.fillRect(262, 350, 500, 52);
    cx.fillStyle = '#FFF3DF';
    cx.font = '500 22px Manrope, sans-serif';
    cx.fillText('VANILLA CREAM  |  NET WT 900g', 512, 384);

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 8;
    return tex;
  }

  function makeSalmonTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 512;
    var cx = cv.getContext('2d');

    var g = cx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, '#F38A62');
    g.addColorStop(0.5, '#E4724C');
    g.addColorStop(1, '#CC5838');
    cx.fillStyle = g;
    cx.fillRect(0, 0, 512, 512);

    cx.strokeStyle = 'rgba(255, 224, 200, 0.55)';
    cx.lineWidth = 7;
    for (var i = -100; i < 620; i += 34) {
      cx.beginPath();
      cx.moveTo(i, 0);
      cx.bezierCurveTo(i + 40, 170, i - 30, 340, i + 25, 512);
      cx.stroke();
    }

    cx.strokeStyle = 'rgba(92, 36, 18, 0.42)';
    cx.lineWidth = 14;
    for (var j = 60; j < 520; j += 96) {
      cx.beginPath();
      cx.moveTo(0, j);
      cx.lineTo(512, j - 70);
      cx.stroke();
    }

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeQuinoaTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 512;
    var cx = cv.getContext('2d');
    cx.fillStyle = '#D7B57E';
    cx.fillRect(0, 0, 512, 512);

    var colors = ['#EED4A2', '#CFA465', '#F7E5BE', '#B8894C', '#6A9447'];
    for (var i = 0; i < 1800; i++) {
      var x = Math.random() * 512;
      var y = Math.random() * 512;
      var r = 2.2 + Math.random() * 4.2;
      cx.fillStyle = colors[i % 19 === 0 ? 4 : (i % 4)];
      cx.beginPath();
      cx.arc(x, y, r, 0, Math.PI * 2);
      cx.fill();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeKnurlBumpTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 256;
    var cx = cv.getContext('2d');
    cx.fillStyle = '#808080';
    cx.fillRect(0, 0, 256, 256);
    cx.strokeStyle = '#ffffff';
    cx.lineWidth = 3;
    for (var i = -256; i < 512; i += 14) {
      cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + 256, 256); cx.stroke();
      cx.beginPath(); cx.moveTo(i + 256, 0); cx.lineTo(i, 256); cx.stroke();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    return tex;
  }

  function makeKettlebellBadgeTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 256;
    var cx = cv.getContext('2d');
    var g = cx.createRadialGradient(128, 128, 18, 128, 128, 120);
    g.addColorStop(0, '#5A3B27');
    g.addColorStop(1, '#2B1A10');
    cx.fillStyle = g;
    cx.fillRect(0, 0, 256, 256);

    cx.strokeStyle = '#E0A862';
    cx.lineWidth = 10;
    cx.beginPath();
    cx.arc(128, 128, 108, 0, Math.PI * 2);
    cx.stroke();

    cx.fillStyle = '#F6D9A8';
    cx.font = '800 66px Manrope, sans-serif';
    cx.textAlign = 'center';
    cx.fillText('16', 128, 132);
    cx.font = '700 32px Manrope, sans-serif';
    cx.fillText('КГ', 128, 174);

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // ==========================================================================
  // ВЫСОКОДЕТАЛИЗИРОВАННЫЕ 3D-МОДЕЛИ (PBR)
  // ==========================================================================
  function createModelFactory(THREE, textures) {
    var ceramicMat = new THREE.MeshPhysicalMaterial({
      color: 0xFAF3E8, roughness: 0.16, metalness: 0.04, clearcoat: 0.92, clearcoatRoughness: 0.1
    });
    var goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xE2AF6B, roughness: 0.18, metalness: 0.9, clearcoat: 0.45
    });
    var darkChocoMat = new THREE.MeshPhysicalMaterial({
      color: 0x2F1E14, roughness: 0.32, metalness: 0.2, clearcoat: 0.35
    });
    var matteCastIron = new THREE.MeshStandardMaterial({
      color: 0x3D291D, roughness: 0.4, metalness: 0.6
    });
    var knurlMetal = new THREE.MeshStandardMaterial({
      color: 0xE8C490, roughness: 0.26, metalness: 0.86, bumpMap: textures.knurl, bumpScale: 0.025
    });
    var proteinLabelMat = new THREE.MeshPhysicalMaterial({
      map: textures.proteinLabel, roughness: 0.26, metalness: 0.14, clearcoat: 0.45
    });
    var salmonMat = new THREE.MeshPhysicalMaterial({
      map: textures.salmon, roughness: 0.35, metalness: 0.02, clearcoat: 0.38, clearcoatRoughness: 0.25
    });
    var avocadoOuterMat = new THREE.MeshStandardMaterial({ color: 0x3E6B2F, roughness: 0.55 });
    var avocadoInnerMat = new THREE.MeshPhysicalMaterial({ color: 0xA9CF6A, roughness: 0.34, clearcoat: 0.2 });
    var spinachMat = new THREE.MeshStandardMaterial({ color: 0x3B7A36, roughness: 0.42, side: THREE.DoubleSide });
    var cherryMat = new THREE.MeshPhysicalMaterial({
      color: 0xCF2E26, roughness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.05
    });
    var quinoaMat = new THREE.MeshStandardMaterial({
      map: textures.quinoa, bumpMap: textures.quinoa, bumpScale: 0.03, roughness: 0.72
    });
    var eggWhiteMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFDF8, roughness: 0.18, clearcoat: 0.7 });
    var eggYolkMat = new THREE.MeshPhysicalMaterial({ color: 0xF5A623, roughness: 0.14, clearcoat: 0.85 });
    var kbBadgeMat = new THREE.MeshStandardMaterial({ map: textures.kbBadge, roughness: 0.3, metalness: 0.45 });

    function makePPPlate() {
      var g = new THREE.Group();
      var pts = [
        new THREE.Vector2(0.0, -0.10), new THREE.Vector2(0.48, -0.10),
        new THREE.Vector2(0.55, -0.06), new THREE.Vector2(0.84, 0.06),
        new THREE.Vector2(0.92, 0.13), new THREE.Vector2(0.90, 0.16),
        new THREE.Vector2(0.80, 0.10), new THREE.Vector2(0.52, -0.02),
        new THREE.Vector2(0.0, -0.03)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 44), ceramicMat));

      var rim = new THREE.Mesh(new THREE.TorusGeometry(0.91, 0.015, 14, 52), goldMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.145;
      g.add(rim);

      var salmonGeo = new THREE.SphereGeometry(0.32, 26, 20);
      salmonGeo.scale(1.22, 0.36, 0.74);
      var salmon = new THREE.Mesh(salmonGeo, salmonMat);
      salmon.position.set(0.22, 0.09, -0.18);
      salmon.rotation.y = -0.35;
      g.add(salmon);

      var quinoaGeo = new THREE.SphereGeometry(0.28, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.6);
      quinoaGeo.scale(1.15, 0.62, 1.0);
      var quinoa = new THREE.Mesh(quinoaGeo, quinoaMat);
      quinoa.position.set(-0.26, -0.01, 0.24);
      g.add(quinoa);

      for (var a = 0; a < 4; a++) {
        var slice = new THREE.Group();
        slice.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.045, 20, 1, false, 0, Math.PI * 1.1), avocadoInnerMat));
        slice.add(new THREE.Mesh(new THREE.CylinderGeometry(0.172, 0.172, 0.04, 20, 1, true, 0, Math.PI * 1.1), avocadoOuterMat));
        slice.position.set(-0.32 + a * 0.08, 0.06 + a * 0.018, -0.22 + a * 0.06);
        slice.rotation.set(0.22, 0.5 + a * 0.32, -0.18);
        g.add(slice);
      }

      var eggW = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 16), eggWhiteMat);
      eggW.scale.set(1.1, 0.45, 0.9);
      eggW.position.set(0.26, 0.05, 0.26);
      g.add(eggW);
      var eggY = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 14), eggYolkMat);
      eggY.scale.set(1.0, 0.65, 1.0);
      eggY.position.set(0.26, 0.095, 0.26);
      g.add(eggY);

      [[0.02, 0.08, 0.38], [0.44, 0.09, 0.06], [-0.04, 0.09, -0.44], [0.12, 0.075, 0.10]].forEach(function (c) {
        var ch = new THREE.Mesh(new THREE.SphereGeometry(0.082, 20, 20), cherryMat);
        ch.position.set(c[0], c[1], c[2]);
        g.add(ch);
      });

      for (var l = 0; l < 5; l++) {
        var leafGeo = new THREE.SphereGeometry(0.16, 14, 10);
        leafGeo.scale(1.3, 0.08, 0.8);
        var leaf = new THREE.Mesh(leafGeo, spinachMat);
        var ang = (l / 5) * Math.PI * 2 + 0.4;
        leaf.position.set(Math.cos(ang) * 0.34, 0.035, Math.sin(ang) * 0.32);
        leaf.rotation.set((Math.random() - 0.5) * 0.25, ang, (Math.random() - 0.5) * 0.2);
        g.add(leaf);
      }
      return g;
    }

    function makeProteinJar() {
      var g = new THREE.Group();
      var jarPts = [
        new THREE.Vector2(0.0, -0.66), new THREE.Vector2(0.40, -0.66),
        new THREE.Vector2(0.47, -0.60), new THREE.Vector2(0.48, 0.36),
        new THREE.Vector2(0.44, 0.45), new THREE.Vector2(0.36, 0.51),
        new THREE.Vector2(0.36, 0.58), new THREE.Vector2(0.0, 0.58)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(jarPts, 44), darkChocoMat));

      var label = new THREE.Mesh(new THREE.CylinderGeometry(0.486, 0.486, 0.72, 44, 1, true), proteinLabelMat);
      label.position.y = -0.10;
      g.add(label);

      var lidPts = [
        new THREE.Vector2(0.0, 0.55), new THREE.Vector2(0.41, 0.55),
        new THREE.Vector2(0.42, 0.57), new THREE.Vector2(0.42, 0.73),
        new THREE.Vector2(0.39, 0.76), new THREE.Vector2(0.0, 0.76)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(lidPts, 44), goldMat));

      var ribGeo = new THREE.BoxGeometry(0.018, 0.14, 0.024);
      for (var r = 0; r < 24; r++) {
        var a = (r / 24) * Math.PI * 2;
        var rib = new THREE.Mesh(ribGeo, goldMat);
        rib.position.set(Math.cos(a) * 0.418, 0.65, Math.sin(a) * 0.418);
        rib.rotation.y = -a;
        g.add(rib);
      }

      var neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.014, 12, 36), goldMat);
      neckRing.rotation.x = Math.PI / 2;
      neckRing.position.y = 0.54;
      g.add(neckRing);
      return g;
    }

    function makeLuxuryDumbbell() {
      var g = new THREE.Group();
      var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 1.38, 24), knurlMetal);
      handle.rotation.z = Math.PI / 2;
      g.add(handle);

      function makePlate(outerR, thick, mat) {
        var pts = [
          new THREE.Vector2(0.09, -thick / 2), new THREE.Vector2(outerR * 0.86, -thick / 2),
          new THREE.Vector2(outerR, -thick * 0.28), new THREE.Vector2(outerR, thick * 0.28),
          new THREE.Vector2(outerR * 0.86, thick / 2), new THREE.Vector2(0.09, thick / 2)
        ];
        var m = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), mat);
        m.rotation.z = Math.PI / 2;
        return m;
      }

      [-1, 1].forEach(function (side) {
        var p1 = makePlate(0.44, 0.16, matteCastIron);
        p1.position.x = side * 0.40;
        g.add(p1);

        var ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.016, 12, 32), goldMat);
        ring1.rotation.y = Math.PI / 2;
        ring1.position.x = side * 0.482;
        g.add(ring1);

        var p2 = makePlate(0.34, 0.14, darkChocoMat);
        p2.position.x = side * 0.56;
        g.add(p2);

        var cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), goldMat);
        cap.scale.set(0.6, 1, 1);
        cap.position.x = side * 0.67;
        g.add(cap);
      });
      return g;
    }

    function makeLuxuryKettlebell() {
      var g = new THREE.Group();
      var kbPts = [
        new THREE.Vector2(0.0, -0.46), new THREE.Vector2(0.32, -0.46),
        new THREE.Vector2(0.46, -0.34), new THREE.Vector2(0.52, -0.05),
        new THREE.Vector2(0.44, 0.26), new THREE.Vector2(0.28, 0.40),
        new THREE.Vector2(0.0, 0.42)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(kbPts, 38), matteCastIron));

      var handle = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.072, 16, 36, Math.PI * 1.18), goldMat);
      handle.rotation.z = -Math.PI * 0.09;
      handle.position.y = 0.42;
      g.add(handle);

      var badge = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 30), kbBadgeMat);
      badge.rotation.x = Math.PI / 2;
      badge.position.set(0, -0.02, 0.50);
      g.add(badge);
      return g;
    }

    return {
      ppPlate: makePPPlate,
      proteinJar: makeProteinJar,
      dumbbell: makeLuxuryDumbbell,
      kettlebell: makeLuxuryKettlebell
    };
  }

  // ==========================================================================
  // ПОРТАЛ В НЕВЕСОМОСТЬ: ПОЛНОЕ ЗАПОЛНЕНИЕ БЛОКА + ТАКТИЛЬНАЯ ФИЗИКА
  // ==========================================================================
  function startLusionScene() {
    if (started) return;
    var canvas = document.getElementById('lusionCanvas');
    if (!canvas || !window.THREE) return;
    started = true;

    var THREE = window.THREE;
    var isMobile = window.innerWidth <= 720;

    var scene = new THREE.Scene();
    // Лёгкий атмосферный туман создаёт ощущение глубокого портала в другое измерение
    scene.fog = new THREE.FogExp2(0x190E08, 0.042);

    var camera = new THREE.PerspectiveCamera(40, Math.max(1, canvas.clientWidth) / Math.max(1, canvas.clientHeight), 0.1, 100);
    camera.position.set(0, 0, isMobile ? 11.4 : 10.8);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.outputEncoding = THREE.sRGBEncoding;

    scene.environment = createStudioEnvironment(THREE, renderer);

    // Освещение портала
    scene.add(new THREE.HemisphereLight(0xFFF6E8, 0x26150C, 0.92));

    var keyLight = new THREE.DirectionalLight(0xFFF2DC, 1.5);
    keyLight.position.set(7, 9, 9);
    scene.add(keyLight);

    var rimLight = new THREE.PointLight(0xE8AF64, 1.85, 32);
    rimLight.position.set(-8, -4, 6);
    scene.add(rimLight);

    var cursorLight = new THREE.PointLight(0xF6D9A8, 1.4, 14);
    cursorLight.position.set(0, 0, 5);
    scene.add(cursorLight);

    // Парящие микрочастицы света в глубине портала (создают эффект измерения)
    var dustCount = isMobile ? 55 : 95;
    var dustPositions = new Float32Array(dustCount * 3);
    for (var di = 0; di < dustCount; di++) {
      dustPositions[di * 3]     = (Math.random() - 0.5) * 18;
      dustPositions[di * 3 + 1] = (Math.random() - 0.5) * 9;
      dustPositions[di * 3 + 2] = (Math.random() - 0.5) * 8 - 1.5;
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    var dustMat = new THREE.PointsMaterial({
      map: makeGlowDotTexture(THREE),
      size: isMobile ? 0.16 : 0.18,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    var textures = {
      proteinLabel: makeProteinLabelTexture(THREE),
      salmon: makeSalmonTexture(THREE),
      quinoa: makeQuinoaTexture(THREE),
      knurl: makeKnurlBumpTexture(THREE),
      kbBadge: makeKettlebellBadgeTexture(THREE)
    };
    var factory = createModelFactory(THREE, textures);

    // +30% фигурок: 17 на ПК, 12 на смартфоне
    var recipe = isMobile
      ? [
          'ppPlate', 'proteinJar', 'dumbbell', 'ppPlate',
          'kettlebell', 'proteinJar', 'ppPlate', 'dumbbell',
          'proteinJar', 'ppPlate', 'kettlebell', 'dumbbell'
        ]
      : [
          'ppPlate', 'proteinJar', 'dumbbell', 'ppPlate', 'kettlebell', 'proteinJar',
          'dumbbell', 'ppPlate', 'proteinJar', 'ppPlate', 'dumbbell', 'kettlebell',
          'proteinJar', 'ppPlate', 'dumbbell', 'proteinJar', 'kettlebell'
        ];

    // Вычисляем реальные границы видимого портала
    function getPortalBounds() {
      var vFOV = THREE.MathUtils.degToRad(camera.fov);
      var visH = 2 * Math.tan(vFOV / 2) * camera.position.z;
      var visW = visH * camera.aspect;
      return {
        halfW: visW * 0.48,
        halfH: visH * 0.46,
        minZ: -2.8,
        maxZ: 1.9
      };
    }

    var bounds = getPortalBounds();
    var bodies = [];
    var cols = isMobile ? 3 : 6;
    var rows = Math.ceil(recipe.length / cols);

    recipe.forEach(function (kind, i) {
      var mesh = factory[kind]();
      // Разные размеры для ощущения глубины пространства
      var depthFactor = 0.86 + (i % 3) * 0.12;
      var baseScale = (isMobile ? 0.72 : 0.84) * depthFactor;
      if (kind === 'ppPlate') baseScale *= 1.05;
      if (kind === 'proteinJar') baseScale *= 0.96;
      mesh.scale.setScalar(baseScale);

      // Равномерно распределяем по всей площади портала (от левого края до правого, сверху донизу)
      var col = i % cols;
      var row = Math.floor(i / cols);
      var nx = (col + 0.5) / cols * 2 - 1;
      var ny = (row + 0.5) / rows * 2 - 1;

      var jitterX = (Math.random() - 0.5) * (bounds.halfW * 2 / cols) * 0.48;
      var jitterY = (Math.random() - 0.5) * (bounds.halfH * 2 / rows) * 0.45;
      var px = nx * bounds.halfW * 0.92 + jitterX;
      var py = -ny * bounds.halfH * 0.88 + jitterY;
      var pz = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);

      mesh.position.set(px, py, pz);
      mesh.rotation.set(
        kind === 'ppPlate' ? 0.82 + (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 1.1,
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 0.7
      );

      var radius = (kind === 'ppPlate' ? 0.92 : kind === 'proteinJar' ? 0.72 : 0.74) * baseScale;
      scene.add(mesh);

      // Начальный плавный дрейф в невесомости (в разные стороны)
      var driftAngle = Math.random() * Math.PI * 2;
      var driftSpeed = 0.008 + Math.random() * 0.011;
      bodies.push({
        mesh: mesh,
        kind: kind,
        radius: radius,
        vel: new THREE.Vector3(
          Math.cos(driftAngle) * driftSpeed,
          Math.sin(driftAngle) * driftSpeed,
          (Math.random() - 0.5) * 0.005
        ),
        baseDrift: new THREE.Vector3(
          Math.cos(driftAngle) * driftSpeed,
          Math.sin(driftAngle) * driftSpeed,
          (Math.random() - 0.5) * 0.003
        ),
        angVel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.009,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.007
        ),
        phase: Math.random() * Math.PI * 2,
        freq: 0.45 + Math.random() * 0.45
      });
    });

    // Интерактивный указатель со скоростью движения (создаёт «волну» при проведении курсором/пальцем)
    var pointer = new THREE.Vector3(999, 999, 0);
    var prevPointer = new THREE.Vector3(999, 999, 0);
    var pointerVel = new THREE.Vector3(0, 0, 0);
    var pointerNorm = { x: 0, y: 0 };
    var pointerActive = false;

    function updatePointer(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -((clientY - rect.top) / rect.height) * 2 + 1;
      pointerNorm.x = nx;
      pointerNorm.y = ny;

      var vFOV = THREE.MathUtils.degToRad(camera.fov);
      var visibleH = 2 * Math.tan(vFOV / 2) * camera.position.z;
      var visibleW = visibleH * camera.aspect;
      var wx = nx * visibleW * 0.5;
      var wy = ny * visibleH * 0.5;

      if (pointerActive) {
        pointerVel.set(
          Math.max(-0.9, Math.min(0.9, wx - pointer.x)),
          Math.max(-0.9, Math.min(0.9, wy - pointer.y)),
          0
        );
      } else {
        pointerVel.set(0, 0, 0);
      }
      prevPointer.copy(pointer);
      pointer.set(wx, wy, 0.3);
      pointerActive = true;
    }

    function burstAtPointer(strength) {
      if (!pointerActive) return;
      var tmp = new THREE.Vector3();
      bodies.forEach(function (b) {
        tmp.set(b.mesh.position.x - pointer.x, b.mesh.position.y - pointer.y, b.mesh.position.z * 0.4);
        var dist = tmp.length();
        var maxR = 4.6;
        if (dist < maxR && dist > 0.001) {
          tmp.divideScalar(dist);
          var impulse = ((maxR - dist) / maxR) * strength;
          b.vel.addScaledVector(tmp, impulse);
          b.vel.z += (Math.random() - 0.5) * impulse * 0.35;
          b.angVel.x += (Math.random() - 0.5) * impulse * 0.45;
          b.angVel.y += (Math.random() - 0.5) * impulse * 0.45;
          b.angVel.z += (Math.random() - 0.5) * impulse * 0.35;
        }
      });
    }

    canvas.addEventListener('pointermove', function (e) { updatePointer(e.clientX, e.clientY); });
    canvas.addEventListener('pointerdown', function (e) {
      updatePointer(e.clientX, e.clientY);
      burstAtPointer(0.24);
    });
    canvas.addEventListener('pointerleave', function () {
      pointerActive = false;
      pointer.set(999, 999, 0);
      pointerVel.set(0, 0, 0);
    });
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        burstAtPointer(0.22);
      }
    }, { passive: true });
    canvas.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    canvas.addEventListener('touchend', function () {
      pointerActive = false;
      pointer.set(999, 999, 0);
      pointerVel.set(0, 0, 0);
    });

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

      // 1. Эффект «окна в портал»: лёгкий параллакс камеры за взглядом/курсором
      var targetCamX = pointerActive ? pointerNorm.x * 0.65 : Math.sin(t * 0.28) * 0.32;
      var targetCamY = pointerActive ? pointerNorm.y * 0.42 : Math.cos(t * 0.23) * 0.20;
      camera.position.x += (targetCamX - camera.position.x) * 0.045;
      camera.position.y += (targetCamY - camera.position.y) * 0.045;
      camera.lookAt(0, 0, -0.4);

      // Свет следует за курсором в портале, красиво подсвечивая грани пролетающих объектов
      if (pointerActive) {
        cursorLight.position.x += (pointer.x - cursorLight.position.x) * 0.16;
        cursorLight.position.y += (pointer.y - cursorLight.position.y) * 0.16;
        cursorLight.intensity += (2.1 - cursorLight.intensity) * 0.1;
      } else {
        cursorLight.position.x += (Math.sin(t * 0.6) * 3.5 - cursorLight.position.x) * 0.04;
        cursorLight.position.y += (Math.cos(t * 0.45) * 1.6 - cursorLight.position.y) * 0.04;
        cursorLight.intensity += (1.1 - cursorLight.intensity) * 0.06;
      }

      // Медленное вращение звёздной пыли портала
      dustPoints.rotation.y = t * 0.025;
      dustPoints.rotation.x = Math.sin(t * 0.15) * 0.06;

      // Затухание скорости курсора между кадрами
      pointerVel.multiplyScalar(0.82);

      // 2. Свободная невесомость по всему объёму + отталкивание и волна от курсора
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];
        var pos = b.mesh.position;

        // Плавное космическое плавание (никакого притяжения в центр!)
        b.vel.x += Math.sin(t * b.freq + b.phase) * 0.00042;
        b.vel.y += Math.cos(t * (b.freq * 0.85) + b.phase * 1.3) * 0.00042;
        b.vel.z += Math.sin(t * 0.55 + b.phase * 0.7) * 0.00025;

        // Реакция на курсор / касание пальцем (отталкивание + увлечение потоком свайпа)
        if (pointerActive) {
          diffVec.set(pos.x - pointer.x, pos.y - pointer.y, (pos.z - 0.2) * 0.38);
          var dist = diffVec.length();
          var repulseR = b.radius + 2.05;
          if (dist < repulseR && dist > 0.001) {
            var k = (repulseR - dist) / repulseR;
            diffVec.divideScalar(dist);
            // Упругое отталкивание + импульс в сторону движения курсора
            b.vel.addScaledVector(diffVec, k * 0.052);
            b.vel.x += pointerVel.x * k * 0.11;
            b.vel.y += pointerVel.y * k * 0.11;
            // Красивое закручивание при касании
            b.angVel.x += (diffVec.y * 0.012 - pointerVel.y * 0.035) * k;
            b.angVel.y += (-diffVec.x * 0.012 + pointerVel.x * 0.035) * k;
            b.angVel.z += (pointerVel.x * diffVec.y - pointerVel.y * diffVec.x) * 0.03 * k;
          }
        }
      }

      // 3. Реалистичные упругие столкновения между объектами (чтобы не слипались и не проникали)
      for (var a = 0; a < bodies.length; a++) {
        for (var c = a + 1; c < bodies.length; c++) {
          var b1 = bodies[a];
          var b2 = bodies[c];
          diffVec.subVectors(b2.mesh.position, b1.mesh.position);
          var d = diffVec.length();
          var minDist = (b1.radius + b2.radius) * 1.04;
          if (d < minDist && d > 0.0001) {
            var overlap = (minDist - d) * 0.5;
            diffVec.divideScalar(d);
            b1.mesh.position.addScaledVector(diffVec, -overlap * 0.85);
            b2.mesh.position.addScaledVector(diffVec, overlap * 0.85);

            // Обмен импульсом по нормали столкновения
            var relVx = b2.vel.x - b1.vel.x;
            var relVy = b2.vel.y - b1.vel.y;
            var relVz = b2.vel.z - b1.vel.z;
            var sepVel = relVx * diffVec.x + relVy * diffVec.y + relVz * diffVec.z;
            if (sepVel < 0) {
              var bounce = -sepVel * 0.72;
              b1.vel.addScaledVector(diffVec, -bounce);
              b2.vel.addScaledVector(diffVec, bounce);
            } else {
              b1.vel.addScaledVector(diffVec, -overlap * 0.05);
              b2.vel.addScaledVector(diffVec, overlap * 0.05);
            }

            b1.angVel.z -= overlap * 0.005;
            b2.angVel.z += overlap * 0.005;
          }
        }
      }

      // 4. Интегрирование и мягкое отражение от невидимых стенок портала (равномерно по всему блоку)
      var padX = bounds.halfW;
      var padY = bounds.halfH;
      for (var k = 0; k < bodies.length; k++) {
        var bd = bodies[k];
        var p = bd.mesh.position;

        // Ограничиваем максимальную скорость и сохраняем вечный плавный дрейф
        var speed = bd.vel.length();
        if (speed > 0.28) {
          bd.vel.multiplyScalar(0.28 / speed);
        }
        // Мягкое гашение резких толчков обратно к спокойной невесомости
        if (speed > 0.022) {
          bd.vel.multiplyScalar(0.968);
        } else if (speed < 0.006) {
          bd.vel.x += bd.baseDrift.x * 0.05;
          bd.vel.y += bd.baseDrift.y * 0.05;
        }

        p.add(bd.vel);

        // Мягкое упругое отталкивание от границ портала
        var limX = Math.max(1.2, padX - bd.radius * 0.45);
        var limY = Math.max(1.0, padY - bd.radius * 0.45);

        if (p.x > limX)  { p.x = limX;  bd.vel.x = -Math.abs(bd.vel.x) * 0.85 - 0.003; }
        if (p.x < -limX) { p.x = -limX; bd.vel.x =  Math.abs(bd.vel.x) * 0.85 + 0.003; }
        if (p.y > limY)  { p.y = limY;  bd.vel.y = -Math.abs(bd.vel.y) * 0.85 - 0.003; }
        if (p.y < -limY) { p.y = -limY; bd.vel.y =  Math.abs(bd.vel.y) * 0.85 + 0.003; }
        if (p.z > bounds.maxZ) { p.z = bounds.maxZ; bd.vel.z = -Math.abs(bd.vel.z) * 0.8; }
        if (p.z < bounds.minZ) { p.z = bounds.minZ; bd.vel.z =  Math.abs(bd.vel.z) * 0.8; }

        bd.mesh.rotation.x += bd.angVel.x;
        bd.mesh.rotation.y += bd.angVel.y;
        bd.mesh.rotation.z += bd.angVel.z;

        // Плавное возвращение вращения к спокойному парению в невесомости
        bd.angVel.x = bd.angVel.x * 0.985 + Math.sin(t * 0.45 + bd.phase) * 0.00012;
        bd.angVel.y = bd.angVel.y * 0.985 + 0.00015;
        bd.angVel.z *= 0.985;
      }

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      var mob = window.innerWidth <= 720;
      camera.position.z = mob ? 11.4 : 10.8;
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
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
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
