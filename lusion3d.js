/**
 * lusion3d.js — 3D-портал в невесомость (крупные фигурки, ~90% заполнения как на lusion.co)
 * - 32 крупных объекта на ПК / 24 на смартфоне (увеличены в ~2.2 раза)
 * - Многослойная 3D-глубина Z без слипаний и дёрганий + мягкий уход за края портала
 * - Общие PBR-геометрии повышенной гладкости для стабильных 60 FPS на телефоне и ПК
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
      '  height: var(--lusion-h, 450px) !important;',
      '  border-radius: 32px !important;',
      '  overflow: hidden !important;',
      '  background:',
      '    radial-gradient(66% 64% at 54% 48%, rgba(168, 112, 60, 0.26) 0%, rgba(44, 26, 15, 0.56) 56%, rgba(15, 8, 4, 0.96) 100%),',
      '    linear-gradient(145deg, #21130B 0%, #3A2315 52%, #130A05 100%) !important;',
      '  box-shadow:',
      '    0 32px 72px rgba(32, 18, 10, 0.36),',
      '    inset 0 0 85px rgba(8, 4, 2, 0.78),',
      '    inset 0 1px 0 rgba(246, 217, 168, 0.24),',
      '    inset 0 -1px 0 rgba(224, 168, 98, 0.16) !important;',
      '}',
      '.lusion-card::after {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 0;',
      '  border-radius: inherit;',
      '  pointer-events: none;',
      '  z-index: 2;',
      '  box-shadow: inset 0 0 68px rgba(10, 5, 2, 0.68), inset 0 0 0 1px rgba(246, 217, 168, 0.15);',
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
      '  background: rgba(18, 10, 5, 0.54) !important;',
      '  backdrop-filter: blur(12px) !important;',
      '  -webkit-backdrop-filter: blur(12px) !important;',
      '  padding: 20px 24px !important;',
      '  border-radius: 22px !important;',
      '  border: 1px solid rgba(246, 217, 168, 0.22) !important;',
      '  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);',
      '}',
      '.lusion-hint { z-index: 3 !important; }',
      '@media (max-width: 720px) {',
      '  .lusion-card { height: var(--lusion-h-mob, 440px) !important; padding: 18px 14px !important; border-radius: 26px !important; }',
      '  .lusion-info { max-width: 100% !important; padding: 13px 16px !important; border-radius: 18px !important; background: rgba(18, 10, 5, 0.58) !important; }',
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
    bg.addColorStop(0.0, '#62442E');
    bg.addColorStop(0.45, '#311F14');
    bg.addColorStop(0.55, '#1B100A');
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
    softbox(240, 96, 230, 98, 'rgba(255, 249, 238, 1)', 'rgba(246, 217, 168, 0.62)');
    softbox(790, 128, 210, 95, 'rgba(255, 238, 204, 0.96)', 'rgba(224, 168, 98, 0.52)');
    softbox(512, 52, 168, 62, 'rgba(255, 255, 255, 0.94)', 'rgba(255, 242, 218, 0.38)');
    softbox(130, 330, 180, 78, 'rgba(224, 168, 98, 0.50)', 'rgba(138, 90, 50, 0.18)');
    softbox(890, 350, 170, 78, 'rgba(255, 236, 204, 0.44)', 'rgba(138, 90, 50, 0.15)');

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

    cx.fillStyle = '#332014'; cx.fillRect(140, 62, 744, 388);
    cx.strokeStyle = '#E0A862'; cx.lineWidth = 4; cx.strokeRect(156, 78, 712, 356);

    cx.fillStyle = '#E7C08A'; cx.font = '600 24px Manrope, sans-serif'; cx.textAlign = 'center';
    cx.fillText('ANASTASIA • PREMIUM NUTRITION', 512, 138);
    cx.fillStyle = '#FFFBF5'; cx.font = '700 84px Georgia, serif';
    cx.fillText('WHEY ISOLATE', 512, 238);
    cx.fillStyle = '#E0A862'; cx.fillRect(352, 266, 320, 3);
    cx.fillStyle = '#F6D9A8'; cx.font = '600 28px Manrope, sans-serif';
    cx.fillText('24g PROTEIN  •  0g SUGAR  •  BCAA', 512, 318);
    cx.fillStyle = 'rgba(246, 217, 168, 0.14)'; cx.fillRect(262, 350, 500, 52);
    cx.fillStyle = '#FFF3DF'; cx.font = '500 22px Manrope, sans-serif';
    cx.fillText('VANILLA CREAM  |  NET WT 900g', 512, 384);

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    return tex;
  }

  function makeSalmonTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    var cx = cv.getContext('2d');
    var g = cx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, '#F38A62'); g.addColorStop(0.5, '#E4724C'); g.addColorStop(1, '#CC5838');
    cx.fillStyle = g; cx.fillRect(0, 0, 512, 512);
    cx.strokeStyle = 'rgba(255, 224, 200, 0.55)'; cx.lineWidth = 7;
    for (var i = -100; i < 620; i += 34) {
      cx.beginPath(); cx.moveTo(i, 0); cx.bezierCurveTo(i + 40, 170, i - 30, 340, i + 25, 512); cx.stroke();
    }
    cx.strokeStyle = 'rgba(92, 36, 18, 0.42)'; cx.lineWidth = 14;
    for (var j = 60; j < 520; j += 96) {
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
    var colors = ['#EED4A2', '#CFA465', '#F7E5BE', '#B8894C', '#6A9447'];
    for (var i = 0; i < 1800; i++) {
      cx.fillStyle = colors[i % 19 === 0 ? 4 : (i % 4)];
      cx.beginPath(); cx.arc(Math.random() * 512, Math.random() * 512, 2.2 + Math.random() * 4, 0, Math.PI * 2); cx.fill();
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
    for (var i = -256; i < 512; i += 14) {
      cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + 256, 256); cx.stroke();
      cx.beginPath(); cx.moveTo(i + 256, 0); cx.lineTo(i, 256); cx.stroke();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);
    return tex;
  }

  function makeKettlebellBadgeTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    var g = cx.createRadialGradient(128, 128, 18, 128, 128, 120);
    g.addColorStop(0, '#5A3B27'); g.addColorStop(1, '#2B1A10');
    cx.fillStyle = g; cx.fillRect(0, 0, 256, 256);
    cx.strokeStyle = '#E0A862'; cx.lineWidth = 10;
    cx.beginPath(); cx.arc(128, 128, 108, 0, Math.PI * 2); cx.stroke();
    cx.fillStyle = '#F6D9A8'; cx.font = '800 66px Manrope, sans-serif'; cx.textAlign = 'center';
    cx.fillText('16', 128, 132);
    cx.font = '700 32px Manrope, sans-serif';
    cx.fillText('КГ', 128, 174);
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // ==========================================================================
  // ФАБРИКА 3D-МОДЕЛЕЙ ПОВЫШЕННОЙ ГЛАДКОСТИ (ОБЩИЕ ГЕОМЕТРИИ — 60 FPS)
  // ==========================================================================
  function createModelFactory(THREE, textures) {
    var mats = {
      ceramic: new THREE.MeshPhysicalMaterial({ color: 0xFAF3E8, roughness: 0.15, metalness: 0.04, clearcoat: 0.94, clearcoatRoughness: 0.09 }),
      gold: new THREE.MeshPhysicalMaterial({ color: 0xE2AF6B, roughness: 0.18, metalness: 0.9, clearcoat: 0.45 }),
      choco: new THREE.MeshPhysicalMaterial({ color: 0x2F1E14, roughness: 0.30, metalness: 0.22, clearcoat: 0.38 }),
      iron: new THREE.MeshStandardMaterial({ color: 0x3D291D, roughness: 0.38, metalness: 0.62 }),
      knurl: new THREE.MeshStandardMaterial({ color: 0xE8C490, roughness: 0.25, metalness: 0.86, bumpMap: textures.knurl, bumpScale: 0.028 }),
      label: new THREE.MeshPhysicalMaterial({ map: textures.proteinLabel, roughness: 0.25, metalness: 0.14, clearcoat: 0.46 }),
      salmon: new THREE.MeshPhysicalMaterial({ map: textures.salmon, roughness: 0.34, metalness: 0.02, clearcoat: 0.40, clearcoatRoughness: 0.24 }),
      avoOut: new THREE.MeshStandardMaterial({ color: 0x3E6B2F, roughness: 0.55 }),
      avoIn: new THREE.MeshPhysicalMaterial({ color: 0xA9CF6A, roughness: 0.32, clearcoat: 0.22 }),
      spinach: new THREE.MeshStandardMaterial({ color: 0x3B7A36, roughness: 0.42, side: THREE.DoubleSide }),
      cherry: new THREE.MeshPhysicalMaterial({ color: 0xCF2E26, roughness: 0.07, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
      quinoa: new THREE.MeshStandardMaterial({ map: textures.quinoa, bumpMap: textures.quinoa, bumpScale: 0.032, roughness: 0.72 }),
      eggW: new THREE.MeshPhysicalMaterial({ color: 0xFFFDF8, roughness: 0.16, clearcoat: 0.72 }),
      eggY: new THREE.MeshPhysicalMaterial({ color: 0xF5A623, roughness: 0.13, clearcoat: 0.86 }),
      kbBadge: new THREE.MeshStandardMaterial({ map: textures.kbBadge, roughness: 0.28, metalness: 0.45 })
    };

    var plateGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, -0.10), new THREE.Vector2(0.48, -0.10), new THREE.Vector2(0.55, -0.06),
      new THREE.Vector2(0.84, 0.06), new THREE.Vector2(0.92, 0.13), new THREE.Vector2(0.90, 0.16),
      new THREE.Vector2(0.80, 0.10), new THREE.Vector2(0.52, -0.02), new THREE.Vector2(0.0, -0.03)
    ], 44);
    var plateRimGeo = new THREE.TorusGeometry(0.91, 0.015, 12, 48);
    var salmonGeo = new THREE.SphereGeometry(0.32, 24, 18); salmonGeo.scale(1.22, 0.36, 0.74);
    var quinoaGeo = new THREE.SphereGeometry(0.28, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.6); quinoaGeo.scale(1.15, 0.62, 1.0);
    var avoInGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.045, 18, 1, false, 0, Math.PI * 1.1);
    var avoOutGeo = new THREE.CylinderGeometry(0.172, 0.172, 0.04, 18, 1, true, 0, Math.PI * 1.1);
    var eggWGeo = new THREE.SphereGeometry(0.15, 18, 14); eggWGeo.scale(1.1, 0.45, 0.9);
    var eggYGeo = new THREE.SphereGeometry(0.085, 16, 14); eggYGeo.scale(1.0, 0.65, 1.0);
    var cherryGeo = new THREE.SphereGeometry(0.082, 16, 16);
    var leafGeo = new THREE.SphereGeometry(0.16, 12, 10); leafGeo.scale(1.3, 0.08, 0.8);

    var jarBodyGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, -0.66), new THREE.Vector2(0.40, -0.66), new THREE.Vector2(0.47, -0.60),
      new THREE.Vector2(0.48, 0.36), new THREE.Vector2(0.44, 0.45), new THREE.Vector2(0.36, 0.51),
      new THREE.Vector2(0.36, 0.58), new THREE.Vector2(0.0, 0.58)
    ], 44);
    var jarLabelGeo = new THREE.CylinderGeometry(0.486, 0.486, 0.72, 44, 1, true);
    var jarLidGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, 0.55), new THREE.Vector2(0.41, 0.55), new THREE.Vector2(0.42, 0.57),
      new THREE.Vector2(0.42, 0.73), new THREE.Vector2(0.39, 0.76), new THREE.Vector2(0.0, 0.76)
    ], 44);
    var jarRibGeo = new THREE.BoxGeometry(0.018, 0.14, 0.024);
    var jarNeckGeo = new THREE.TorusGeometry(0.40, 0.014, 12, 36);

    var dbHandleGeo = new THREE.CylinderGeometry(0.095, 0.095, 1.38, 24);
    function plateProfileGeo(outerR, thick) {
      return new THREE.LatheGeometry([
        new THREE.Vector2(0.09, -thick / 2), new THREE.Vector2(outerR * 0.86, -thick / 2),
        new THREE.Vector2(outerR, -thick * 0.28), new THREE.Vector2(outerR, thick * 0.28),
        new THREE.Vector2(outerR * 0.86, thick / 2), new THREE.Vector2(0.09, thick / 2)
      ], 34);
    }
    var dbPlate1Geo = plateProfileGeo(0.44, 0.16);
    var dbPlate2Geo = plateProfileGeo(0.34, 0.14);
    var dbRingGeo = new THREE.TorusGeometry(0.32, 0.016, 12, 34);
    var dbCapGeo = new THREE.SphereGeometry(0.11, 16, 14); dbCapGeo.scale(0.6, 1, 1);

    var kbBodyGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, -0.46), new THREE.Vector2(0.32, -0.46), new THREE.Vector2(0.46, -0.34),
      new THREE.Vector2(0.52, -0.05), new THREE.Vector2(0.44, 0.26), new THREE.Vector2(0.28, 0.40),
      new THREE.Vector2(0.0, 0.42)
    ], 38);
    var kbHandleGeo = new THREE.TorusGeometry(0.30, 0.072, 16, 34, Math.PI * 1.18);
    var kbBadgeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 28);

    function makePPPlate() {
      var g = new THREE.Group();
      g.add(new THREE.Mesh(plateGeo, mats.ceramic));
      var rim = new THREE.Mesh(plateRimGeo, mats.gold);
      rim.rotation.x = Math.PI / 2; rim.position.y = 0.145; g.add(rim);

      var salmon = new THREE.Mesh(salmonGeo, mats.salmon);
      salmon.position.set(0.22, 0.09, -0.18); salmon.rotation.y = -0.35; g.add(salmon);

      var quinoa = new THREE.Mesh(quinoaGeo, mats.quinoa);
      quinoa.position.set(-0.26, -0.01, 0.24); g.add(quinoa);

      for (var a = 0; a < 4; a++) {
        var slice = new THREE.Group();
        slice.add(new THREE.Mesh(avoInGeo, mats.avoIn));
        slice.add(new THREE.Mesh(avoOutGeo, mats.avoOut));
        slice.position.set(-0.32 + a * 0.08, 0.06 + a * 0.018, -0.22 + a * 0.06);
        slice.rotation.set(0.22, 0.5 + a * 0.32, -0.18);
        g.add(slice);
      }

      var eggW = new THREE.Mesh(eggWGeo, mats.eggW); eggW.position.set(0.26, 0.05, 0.26); g.add(eggW);
      var eggY = new THREE.Mesh(eggYGeo, mats.eggY); eggY.position.set(0.26, 0.095, 0.26); g.add(eggY);

      [[0.02, 0.08, 0.38], [0.44, 0.09, 0.06], [-0.04, 0.09, -0.44], [0.12, 0.075, 0.10]].forEach(function (c) {
        var ch = new THREE.Mesh(cherryGeo, mats.cherry); ch.position.set(c[0], c[1], c[2]); g.add(ch);
      });

      for (var l = 0; l < 4; l++) {
        var leaf = new THREE.Mesh(leafGeo, mats.spinach);
        var ang = (l / 4) * Math.PI * 2 + 0.4;
        leaf.position.set(Math.cos(ang) * 0.34, 0.035, Math.sin(ang) * 0.32);
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
      for (var r = 0; r < 20; r++) {
        var a = (r / 20) * Math.PI * 2;
        var rib = new THREE.Mesh(jarRibGeo, mats.gold);
        rib.position.set(Math.cos(a) * 0.418, 0.65, Math.sin(a) * 0.418);
        rib.rotation.y = -a;
        g.add(rib);
      }
      var neck = new THREE.Mesh(jarNeckGeo, mats.gold); neck.rotation.x = Math.PI / 2; neck.position.y = 0.54; g.add(neck);
      return g;
    }

    function makeLuxuryDumbbell() {
      var g = new THREE.Group();
      var handle = new THREE.Mesh(dbHandleGeo, mats.knurl); handle.rotation.z = Math.PI / 2; g.add(handle);
      [-1, 1].forEach(function (side) {
        var p1 = new THREE.Mesh(dbPlate1Geo, mats.iron); p1.rotation.z = Math.PI / 2; p1.position.x = side * 0.40; g.add(p1);
        var ring1 = new THREE.Mesh(dbRingGeo, mats.gold); ring1.rotation.y = Math.PI / 2; ring1.position.x = side * 0.482; g.add(ring1);
        var p2 = new THREE.Mesh(dbPlate2Geo, mats.choco); p2.rotation.z = Math.PI / 2; p2.position.x = side * 0.56; g.add(p2);
        var cap = new THREE.Mesh(dbCapGeo, mats.gold); cap.position.x = side * 0.67; g.add(cap);
      });
      return g;
    }

    function makeLuxuryKettlebell() {
      var g = new THREE.Group();
      g.add(new THREE.Mesh(kbBodyGeo, mats.iron));
      var handle = new THREE.Mesh(kbHandleGeo, mats.gold);
      handle.rotation.z = -Math.PI * 0.09; handle.position.y = 0.42; g.add(handle);
      var badge = new THREE.Mesh(kbBadgeGeo, mats.kbBadge);
      badge.rotation.x = Math.PI / 2; badge.position.set(0, -0.02, 0.50); g.add(badge);
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
    scene.fog = new THREE.FogExp2(0x180D07, 0.032);

    // Камера чуть ближе — крупные скульптурные объекты заполняют ~90% окна-портала
    var camera = new THREE.PerspectiveCamera(isMobile ? 44 : 42, Math.max(1, canvas.clientWidth) / Math.max(1, canvas.clientHeight), 0.1, 100);
    camera.position.set(0, 0, isMobile ? 11.0 : 10.6);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.outputEncoding = THREE.sRGBEncoding;

    scene.environment = createStudioEnvironment(THREE, renderer);

    scene.add(new THREE.HemisphereLight(0xFFF6E8, 0x26150C, 0.96));
    var keyLight = new THREE.DirectionalLight(0xFFF2DC, 1.55); keyLight.position.set(7, 9, 10); scene.add(keyLight);
    var rimLight = new THREE.PointLight(0xE8AF64, 1.9, 36); rimLight.position.set(-8, -4, 6); scene.add(rimLight);
    var cursorLight = new THREE.PointLight(0xF6D9A8, 1.55, 16); cursorLight.position.set(0, 0, 5.5); scene.add(cursorLight);

    var dustCount = isMobile ? 60 : 110;
    var dustPositions = new Float32Array(dustCount * 3);
    for (var di = 0; di < dustCount; di++) {
      dustPositions[di * 3]     = (Math.random() - 0.5) * 22;
      dustPositions[di * 3 + 1] = (Math.random() - 0.5) * 11;
      dustPositions[di * 3 + 2] = (Math.random() - 0.5) * 9 - 1.5;
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    var dustPoints = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      map: makeGlowDotTexture(THREE), size: isMobile ? 0.16 : 0.19,
      transparent: true, opacity: 0.62, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(dustPoints);

    var factory = createModelFactory(THREE, {
      proteinLabel: makeProteinLabelTexture(THREE),
      salmon: makeSalmonTexture(THREE),
      quinoa: makeQuinoaTexture(THREE),
      knurl: makeKnurlBumpTexture(THREE),
      kbBadge: makeKettlebellBadgeTexture(THREE)
    });

    // 32 фигурки на ПК / 24 на смартфоне — увеличены в ~2.1–2.3 раза!
    var basePattern = ['ppPlate', 'proteinJar', 'dumbbell', 'kettlebell', 'ppPlate', 'proteinJar', 'dumbbell', 'ppPlate'];
    var totalCount = isMobile ? 24 : 32;
    var recipe = [];
    for (var ri = 0; ri < totalCount; ri++) {
      recipe.push(basePattern[ri % basePattern.length]);
    }

    function getPortalBounds() {
      var vFOV = THREE.MathUtils.degToRad(camera.fov);
      var visH = 2 * Math.tan(vFOV / 2) * camera.position.z;
      var visW = visH * camera.aspect;
      return {
        halfW: visW * 0.52,
        halfH: visH * 0.50,
        minZ: isMobile ? -4.4 : -4.2,
        maxZ: 2.3
      };
    }

    var bounds = getPortalBounds();
    var bodies = [];
    var cols = isMobile ? 4 : 8;
    var rows = Math.ceil(recipe.length / cols);

    recipe.forEach(function (kind, i) {
      var mesh = factory[kind]();
      // Крупный масштаб (~2.15–2.3x от прежнего) с естественной вариацией размеров
      var sizeVar = 0.88 + (i % 4) * 0.085;
      var baseScale = (isMobile ? 1.18 : 1.48) * sizeVar;
      if (kind === 'ppPlate') baseScale *= 1.04;
      if (kind === 'proteinJar') baseScale *= 0.96;
      mesh.scale.setScalar(baseScale);

      var col = i % cols;
      var row = Math.floor(i / cols);
      var nx = (col + 0.5) / cols * 2 - 1;
      var ny = (row + 0.5) / rows * 2 - 1;

      var jitterX = (Math.random() - 0.5) * (bounds.halfW * 2 / cols) * 0.35;
      var jitterY = (Math.random() - 0.5) * (bounds.halfH * 2 / rows) * 0.35;
      var px = nx * bounds.halfW * 0.92 + jitterX;
      var py = -ny * bounds.halfH * 0.88 + jitterY;
      // Чёткое расслоение по Z (4 глубинных слоя), чтобы 32 крупных объекта плотно заполняли кадр без толкучки
      var layerIdx = (col + row * 2) % 4;
      var pz = bounds.minZ + ((layerIdx + 0.5) / 4) * (bounds.maxZ - bounds.minZ) + (Math.random() - 0.5) * 0.45;

      mesh.position.set(px, py, pz);
      mesh.rotation.set(
        kind === 'ppPlate' ? 0.78 + (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 1.1,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 0.75
      );

      // Компактный физический радиус (0.82 от визуального), чтобы объекты красиво подплывали вплотную
      var rawRadius = (kind === 'ppPlate' ? 0.86 : kind === 'proteinJar' ? 0.68 : 0.70) * baseScale;
      var collRadius = rawRadius * 0.82;
      scene.add(mesh);

      var driftAngle = Math.random() * Math.PI * 2;
      var driftSpeed = 0.007 + Math.random() * 0.009;
      bodies.push({
        mesh: mesh,
        radius: collRadius,
        vel: new THREE.Vector3(Math.cos(driftAngle) * driftSpeed, Math.sin(driftAngle) * driftSpeed, (Math.random() - 0.5) * 0.004),
        baseDrift: new THREE.Vector3(Math.cos(driftAngle) * driftSpeed, Math.sin(driftAngle) * driftSpeed, (Math.random() - 0.5) * 0.0025),
        angVel: new THREE.Vector3((Math.random() - 0.5) * 0.0075, (Math.random() - 0.5) * 0.0095, (Math.random() - 0.5) * 0.0055),
        phase: Math.random() * Math.PI * 2,
        freq: 0.38 + Math.random() * 0.38
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
      pointer.set(wx, wy, 0.5);
      pointerActive = true;
    }

    function burstAtPointer(strength) {
      if (!pointerActive) return;
      var tmp = new THREE.Vector3();
      bodies.forEach(function (b) {
        tmp.set(b.mesh.position.x - pointer.x, b.mesh.position.y - pointer.y, (b.mesh.position.z - 0.3) * 0.35);
        var dist = tmp.length();
        var maxR = 5.4;
        if (dist < maxR && dist > 0.001) {
          tmp.divideScalar(dist);
          var impulse = ((maxR - dist) / maxR) * strength;
          b.vel.addScaledVector(tmp, impulse);
          b.vel.z += (Math.random() - 0.5) * impulse * 0.32;
          b.angVel.x += (Math.random() - 0.5) * impulse * 0.38;
          b.angVel.y += (Math.random() - 0.5) * impulse * 0.38;
          b.angVel.z += (Math.random() - 0.5) * impulse * 0.30;
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

      var targetCamX = pointerActive ? pointerNorm.x * 0.65 : Math.sin(t * 0.26) * 0.30;
      var targetCamY = pointerActive ? pointerNorm.y * 0.42 : Math.cos(t * 0.22) * 0.18;
      camera.position.x += (targetCamX - camera.position.x) * 0.045;
      camera.position.y += (targetCamY - camera.position.y) * 0.045;
      camera.lookAt(0, 0, -0.6);

      if (pointerActive) {
        cursorLight.position.x += (pointer.x - cursorLight.position.x) * 0.16;
        cursorLight.position.y += (pointer.y - cursorLight.position.y) * 0.16;
        cursorLight.intensity += (2.25 - cursorLight.intensity) * 0.1;
      } else {
        cursorLight.position.x += (Math.sin(t * 0.55) * 4.2 - cursorLight.position.x) * 0.04;
        cursorLight.position.y += (Math.cos(t * 0.42) * 1.9 - cursorLight.position.y) * 0.04;
        cursorLight.intensity += (1.2 - cursorLight.intensity) * 0.06;
      }

      dustPoints.rotation.y = t * 0.022;
      dustPoints.rotation.x = Math.sin(t * 0.14) * 0.05;
      pointerVel.multiplyScalar(0.82);

      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];
        var pos = b.mesh.position;

        b.vel.x += Math.sin(t * b.freq + b.phase) * 0.00034;
        b.vel.y += Math.cos(t * (b.freq * 0.85) + b.phase * 1.3) * 0.00034;
        b.vel.z += Math.sin(t * 0.50 + b.phase * 0.7) * 0.00022;

        if (pointerActive) {
          diffVec.set(pos.x - pointer.x, pos.y - pointer.y, (pos.z - 0.3) * 0.32);
          var dist = diffVec.length();
          var repulseR = b.radius + 2.35;
          if (dist < repulseR && dist > 0.001) {
            var k = (repulseR - dist) / repulseR;
            diffVec.divideScalar(dist);
            b.vel.addScaledVector(diffVec, k * 0.050);
            b.vel.x += pointerVel.x * k * 0.12;
            b.vel.y += pointerVel.y * k * 0.12;
            b.angVel.x += (diffVec.y * 0.011 - pointerVel.y * 0.032) * k;
            b.angVel.y += (-diffVec.x * 0.011 + pointerVel.x * 0.032) * k;
            b.angVel.z += (pointerVel.x * diffVec.y - pointerVel.y * diffVec.x) * 0.026 * k;
          }
        }
      }

      // Мягкие упругие столкновения в 3D (крупные объекты плавно обтекают друг друга)
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
            b1.mesh.position.addScaledVector(diffVec, -overlap * 0.55);
            b2.mesh.position.addScaledVector(diffVec, overlap * 0.55);

            var relVx = b2.vel.x - b1.vel.x;
            var relVy = b2.vel.y - b1.vel.y;
            var relVz = b2.vel.z - b1.vel.z;
            var sepVel = relVx * diffVec.x + relVy * diffVec.y + relVz * diffVec.z;
            if (sepVel < 0) {
              var bounce = -sepVel * 0.58;
              b1.vel.addScaledVector(diffVec, -bounce);
              b2.vel.addScaledVector(diffVec, bounce);
            } else {
              b1.vel.addScaledVector(diffVec, -overlap * 0.028);
              b2.vel.addScaledVector(diffVec, overlap * 0.028);
            }
            b1.angVel.z -= overlap * 0.003;
            b2.angVel.z += overlap * 0.003;
          }
        }
      }

      var padX = bounds.halfW;
      var padY = bounds.halfH;
      for (var k = 0; k < bodies.length; k++) {
        var bd = bodies[k];
        var p = bd.mesh.position;

        var speed = bd.vel.length();
        if (speed > 0.24) bd.vel.multiplyScalar(0.24 / speed);
        if (speed > 0.020) bd.vel.multiplyScalar(0.962);
        else if (speed < 0.005) {
          bd.vel.x += bd.baseDrift.x * 0.05;
          bd.vel.y += bd.baseDrift.y * 0.05;
        }
        p.add(bd.vel);

        // Позволяем крупным фигуркам слегка заходить за края рамки портала (эффект Lusion)
        var limX = Math.max(1.5, padX - bd.radius * 0.12);
        var limY = Math.max(1.2, padY - bd.radius * 0.12);

        if (p.x > limX)  { p.x = limX;  bd.vel.x = -Math.abs(bd.vel.x) * 0.80 - 0.003; }
        if (p.x < -limX) { p.x = -limX; bd.vel.x =  Math.abs(bd.vel.x) * 0.80 + 0.003; }
        if (p.y > limY)  { p.y = limY;  bd.vel.y = -Math.abs(bd.vel.y) * 0.80 - 0.003; }
        if (p.y < -limY) { p.y = -limY; bd.vel.y =  Math.abs(bd.vel.y) * 0.80 + 0.003; }
        if (p.z > bounds.maxZ) { p.z = bounds.maxZ; bd.vel.z = -Math.abs(bd.vel.z) * 0.78; }
        if (p.z < bounds.minZ) { p.z = bounds.minZ; bd.vel.z =  Math.abs(bd.vel.z) * 0.78; }

        bd.mesh.rotation.x += bd.angVel.x;
        bd.mesh.rotation.y += bd.angVel.y;
        bd.mesh.rotation.z += bd.angVel.z;

        bd.angVel.x = bd.angVel.x * 0.985 + Math.sin(t * 0.42 + bd.phase) * 0.00010;
        bd.angVel.y = bd.angVel.y * 0.985 + 0.00013;
        bd.angVel.z *= 0.985;
      }

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      var mob = window.innerWidth <= 720;
      camera.fov = mob ? 44 : 42;
      camera.position.z = mob ? 11.0 : 10.6;
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
