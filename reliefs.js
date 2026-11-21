/**
 * reliefs.js — 15 СКУЛЬПТУРНЫХ 3D-БАРЕЛЬЕФОВ (реальный Three.js PBR-рендер, уровень gift3d.js!)
 * - Вместо плоских SVG-рисунков использует реальную 3D-геометрию Three.js со студийным PMREM-освещением
 * - Один временный offscreen WebGLRenderer (512x512) запекает все 12 скульптур в HD PNG и сразу освобождает GPU
 *   (0 лишних WebGL-контекстов — работает идеально на iPhone Safari и на ПК!)
 * - Материал: матовый архитектурный гипс с лёгким шёлковым бликом на светлых секциях
 *   и скульптурный тёмный шоколадный камень / тёплая бронза на тёмных секциях (стиль immersive-g.com)
 * - Живая реакция на движение мыши (деликатный 3D-наклон и параллакс глубины, как у гантели в Блоке 5)
 * - Сохранены все позиции и правки: гиря «16 КГ» в «Направлениях», сдвинутая вниз гиря и развёрнутый
 *   фитнес-коврик в Блоке 7, спортивная бутылка в блоке FAQ
 */
(function () {
  'use strict';

  var bakedCache = {};
  var tiltBound = false;

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
      '  opacity: var(--relief-strength, 0.94);',
      '  transform-origin: center center;',
      '  perspective: 900px;',
      '  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);',
      '  will-change: transform;',
      '}',
      '/* Плавный гипсовый/каменный наплыв стены за скульптурой — эффект «вылезает из стены» */',
      '.wall-sculpture::before {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 10%;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle at 38% 36%, rgba(255, 255, 255, 0.85) 0%, rgba(215, 198, 176, 0.42) 52%, rgba(215, 198, 176, 0) 76%);',
      '  filter: blur(10px);',
      '  z-index: 0;',
      '}',
      '.wall-sculpture.on-dark {',
      '  opacity: var(--relief-strength-dark, 0.96);',
      '}',
      '.wall-sculpture.on-dark::before {',
      '  background: radial-gradient(circle at 38% 36%, rgba(164, 114, 72, 0.28) 0%, rgba(18, 9, 4, 0.65) 55%, rgba(18, 9, 4, 0) 78%);',
      '}',
      '.wall-sculpture-img {',
      '  position: relative;',
      '  z-index: 1;',
      '  width: 100%;',
      '  height: 100%;',
      '  object-fit: contain;',
      '  display: block;',
      '  filter:',
      '    drop-shadow(-5px -5px 9px rgba(255, 255, 255, 0.90))',
      '    drop-shadow(12px 18px 22px rgba(63, 41, 27, 0.28))',
      '    drop-shadow(3px 6px 7px rgba(63, 41, 27, 0.16));',
      '}',
      '.wall-sculpture.on-dark .wall-sculpture-img {',
      '  filter:',
      '    drop-shadow(-4px -4px 8px rgba(246, 217, 168, 0.16))',
      '    drop-shadow(14px 20px 26px rgba(4, 2, 1, 0.86))',
      '    drop-shadow(3px 6px 8px rgba(0, 0, 0, 0.68));',
      '}',
      '@media (max-width: 1024px) {',
      '  .wall-sculpture { opacity: calc(var(--relief-strength, 0.94) * 0.92); }',
      '}',
      '@media (max-width: 720px) {',
      '  .wall-sculpture {',
      '    opacity: calc(var(--relief-strength, 0.94) * 0.86);',
      '    max-width: 178px !important;',
      '    max-height: 178px !important;',
      '  }',
      '  .wall-sculpture.on-dark {',
      '    opacity: calc(var(--relief-strength-dark, 0.96) * 0.92);',
      '  }',
      '  .wall-sculpture[data-shape="kettlebell16"].on-dark {',
      '    max-width: 205px !important;',
      '    max-height: 205px !important;',
      '  }',
      '  .wall-sculpture[data-shape="barbell"] {',
      '    max-width: 215px !important;',
      '    max-height: 165px !important;',
      '  }',
      '  .about-sec .wall-sculpture[data-shape="yogaMat"] {',
      '    left: auto !important; right: -8px !important; top: 6px !important;',
      '    max-width: 195px !important; max-height: 165px !important;',
      '  }',
      '  .about-sec .wall-sculpture[data-shape="kettlebell16"] {',
      '    top: auto !important; bottom: -14px !important; left: 4px !important;',
      '    max-width: 156px !important; max-height: 156px !important;',
      '  }',
      '  .faq-sec .wall-sculpture[data-shape="sportBottle"] {',
      '    left: auto !important; right: -4px !important; top: 44% !important;',
      '    max-width: 162px !important; max-height: 202px !important;',
      '  }',
      '}',
      '.about-sec .about-photo-main, .about-sec .gallery-card, .about-sec .cert-scan-card { position: relative; z-index: 4; }',
      '.about-sec { padding-bottom: 120px !important; }',
      '@media (max-width: 720px) { .about-sec { padding-bottom: 84px !important; } }'
    ].join('\n');
    document.head.appendChild(st);
  }

  // Студийная среда для скульптурного гипса / тёмного камня
  function createSculptureEnv(THREE, renderer, dark) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 256;
    var cx = cv.getContext('2d');
    var bg = cx.createLinearGradient(0, 0, 0, 256);
    if (dark) {
      bg.addColorStop(0.0, '#785239');
      bg.addColorStop(0.45, '#3E2618');
      bg.addColorStop(0.65, '#1D110A');
      bg.addColorStop(1.0, '#0E0703');
    } else {
      bg.addColorStop(0.0, '#FFFFFF');
      bg.addColorStop(0.45, '#F3E9DC');
      bg.addColorStop(0.65, '#D7C4AE');
      bg.addColorStop(1.0, '#B59E85');
    }
    cx.fillStyle = bg; cx.fillRect(0, 0, 512, 256);

    function box(x, y, rx, ry, c1, c2) {
      cx.save(); cx.translate(x, y); cx.scale(1, ry / rx);
      var g = cx.createRadialGradient(0, 0, rx * 0.06, 0, 0, rx);
      g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, rx, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
    if (dark) {
      box(125, 48, 120, 55, 'rgba(255,244,224,1)', 'rgba(240,196,136,0.55)');
      box(400, 82, 110, 50, 'rgba(224,168,98,0.68)', 'rgba(138,90,50,0.22)');
    } else {
      box(120, 44, 130, 58, 'rgba(255,255,255,1)', 'rgba(255,250,242,0.75)');
      box(395, 95, 115, 52, 'rgba(255,245,232,0.85)', 'rgba(218,196,170,0.35)');
    }

    var tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var env = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
    return env;
  }

  function makeSculptTextTex(THREE, line1, line2, dark, isSquare) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = isSquare ? 512 : 256;
    var cx = cv.getContext('2d');
    var w = cv.width, h = cv.height;

    cx.fillStyle = dark ? '#4E3323' : '#E7DAC8';
    cx.fillRect(0, 0, w, h);

    if (isSquare) {
      cx.strokeStyle = dark ? '#CFA16D' : '#A9927A';
      cx.lineWidth = 14;
      cx.beginPath(); cx.arc(w / 2, h / 2, 214, 0, Math.PI * 2); cx.stroke();
      cx.strokeStyle = dark ? 'rgba(255,244,224,0.45)' : 'rgba(255,255,255,0.85)';
      cx.lineWidth = 5;
      cx.beginPath(); cx.arc(w / 2, h / 2, 194, 0, Math.PI * 2); cx.stroke();
    } else {
      cx.strokeStyle = dark ? '#CFA16D' : '#AE9880';
      cx.lineWidth = 8;
      cx.strokeRect(24, 24, w - 48, h - 48);
    }

    cx.textAlign = 'center';
    var y1 = line2 ? (h * 0.48) : (h * 0.56);
    var sz1 = isSquare ? 128 : 88;
    cx.font = '800 ' + sz1 + 'px Manrope, sans-serif';
    cx.fillStyle = dark ? '#1A0E07' : '#FFFFFF';
    cx.fillText(line1, w / 2 + 3, y1 + 4);
    cx.fillStyle = dark ? '#E8BE8A' : '#735B44';
    cx.fillText(line1, w / 2, y1);

    if (line2) {
      cx.font = '800 ' + (isSquare ? 68 : 42) + 'px Manrope, sans-serif';
      cx.fillStyle = dark ? '#1A0E07' : '#FFFFFF';
      cx.fillText(line2, w / 2 + 2, h * 0.72 + 3);
      cx.fillStyle = dark ? '#E8BE8A' : '#735B44';
      cx.fillText(line2, w / 2, h * 0.72);
    }

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeKnurlBump(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    cx.fillStyle = '#808080'; cx.fillRect(0, 0, 256, 256);
    cx.strokeStyle = '#ffffff'; cx.lineWidth = 4;
    for (var i = -256; i < 512; i += 14) {
      cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + 256, 256); cx.stroke();
      cx.beginPath(); cx.moveTo(i + 256, 0); cx.lineTo(i, 256); cx.stroke();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
  }

  function makeScaleBumpTex(THREE, dark) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    var cx = cv.getContext('2d');
    cx.fillStyle = dark ? '#563928' : '#EFE4D6';
    cx.fillRect(0, 0, 512, 512);
    cx.strokeStyle = dark ? '#CFA16D' : '#967F68';
    cx.fillStyle = dark ? '#E2B682' : '#7B644D';
    cx.lineWidth = 6;
    cx.font = '800 32px Manrope, sans-serif';
    cx.textAlign = 'right';
    [
      { y: 120, lbl: '750' },
      { y: 205, lbl: '' },
      { y: 290, lbl: '500' },
      { y: 375, lbl: '' },
      { y: 440, lbl: '250' }
    ].forEach(function (t) {
      cx.beginPath();
      cx.moveTo(t.lbl ? 250 : 280, t.y);
      cx.lineTo(350, t.y);
      cx.stroke();
      if (t.lbl) cx.fillText(t.lbl, 232, t.y + 11);
    });
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeSculptMaterials(THREE, dark, knurlTex) {
    if (dark) {
      return {
        main: new THREE.MeshPhysicalMaterial({ color: 0x5E3E2B, roughness: 0.42, metalness: 0.34, clearcoat: 0.24, clearcoatRoughness: 0.32 }),
        accent: new THREE.MeshPhysicalMaterial({ color: 0x8F6543, roughness: 0.32, metalness: 0.56, clearcoat: 0.32 }),
        deep: new THREE.MeshPhysicalMaterial({ color: 0x3A2417, roughness: 0.50, metalness: 0.25 }),
        knurl: new THREE.MeshStandardMaterial({ color: 0x8A6242, roughness: 0.36, metalness: 0.58, bumpMap: knurlTex, bumpScale: 0.035 })
      };
    }
    return {
      main: new THREE.MeshPhysicalMaterial({ color: 0xEDE2D3, roughness: 0.46, metalness: 0.06, clearcoat: 0.22, clearcoatRoughness: 0.38 }),
      accent: new THREE.MeshPhysicalMaterial({ color: 0xD9C5AE, roughness: 0.38, metalness: 0.14, clearcoat: 0.30 }),
      deep: new THREE.MeshPhysicalMaterial({ color: 0xC6B097, roughness: 0.54, metalness: 0.06 }),
      knurl: new THREE.MeshStandardMaterial({ color: 0xDCC9B3, roughness: 0.42, metalness: 0.16, bumpMap: knurlTex, bumpScale: 0.038 })
    };
  }

  function buildSculptureMesh(THREE, shape, dark, knurlTex) {
    var m = makeSculptMaterials(THREE, dark, knurlTex);
    var g = new THREE.Group();

    function makeBeveledPlate(outerR, thick) {
      return new THREE.LatheGeometry([
        new THREE.Vector2(0.11, -thick * 0.5),
        new THREE.Vector2(outerR * 0.80, -thick * 0.5),
        new THREE.Vector2(outerR * 0.94, -thick * 0.38),
        new THREE.Vector2(outerR, -thick * 0.22),
        new THREE.Vector2(outerR, thick * 0.22),
        new THREE.Vector2(outerR * 0.94, thick * 0.38),
        new THREE.Vector2(outerR * 0.80, thick * 0.5),
        new THREE.Vector2(0.11, thick * 0.5)
      ], 44);
    }

    if (shape === 'kettlebell16') {
      // Реалистичная пудовая гиря с плоским дном, литыми рогами и чёткой отливкой «16 КГ»
      var kbPts = [
        new THREE.Vector2(0.0, -0.88), new THREE.Vector2(0.62, -0.88), new THREE.Vector2(0.72, -0.80),
        new THREE.Vector2(0.92, -0.58), new THREE.Vector2(1.02, -0.06), new THREE.Vector2(0.88, 0.46),
        new THREE.Vector2(0.56, 0.74), new THREE.Vector2(0.0, 0.78)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(kbPts, 52), m.main));

      // Анатомическая дужка-рукоять
      var horn = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.145, 22, 48, Math.PI * 1.24), m.accent);
      horn.rotation.z = -Math.PI * 0.12;
      horn.position.y = 0.78;
      g.add(horn);

      // Литой медальон «16 КГ»
      var tex16 = makeSculptTextTex(THREE, '16', 'КГ', dark, true);
      var badgeMat = new THREE.MeshPhysicalMaterial({ map: tex16, roughness: 0.38, metalness: dark ? 0.38 : 0.10, clearcoat: 0.25 });
      var badge = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 0.08, 40), badgeMat);
      badge.rotation.x = Math.PI / 2;
      badge.position.set(0, -0.04, 0.96);
      g.add(badge);
      var bRim = new THREE.Mesh(new THREE.TorusGeometry(0.505, 0.032, 14, 40), m.accent);
      bRim.position.set(0, -0.04, 0.985);
      g.add(bRim);

      g.rotation.set(0.14, -0.22, -0.06);
      g.position.y = -0.18;
      return g;
    }

    if (shape === 'dumbbell') {
      var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 2.35, 34), m.knurl);
      shaft.rotation.z = Math.PI / 2; g.add(shaft);
      var colGeo = new THREE.LatheGeometry([
        new THREE.Vector2(0.135, -0.08), new THREE.Vector2(0.21, -0.08),
        new THREE.Vector2(0.23, -0.04), new THREE.Vector2(0.23, 0.04),
        new THREE.Vector2(0.21, 0.08), new THREE.Vector2(0.135, 0.08)
      ], 34);
      var pBig = makeBeveledPlate(0.74, 0.26);
      var pSm = makeBeveledPlate(0.56, 0.21);
      var rBig = new THREE.TorusGeometry(0.54, 0.024, 14, 42);
      var capG = new THREE.SphereGeometry(0.18, 22, 18); capG.scale(0.65, 1, 1);

      [-1, 1].forEach(function (s) {
        var col = new THREE.Mesh(colGeo, m.accent); col.rotation.z = Math.PI / 2; col.position.x = s * 0.56; g.add(col);
        var b1 = new THREE.Mesh(pBig, m.main); b1.rotation.z = Math.PI / 2; b1.position.x = s * 0.78; g.add(b1);
        var ri = new THREE.Mesh(rBig, m.accent); ri.rotation.y = Math.PI / 2; ri.position.x = s * 0.912; g.add(ri);
        var b2 = new THREE.Mesh(pSm, m.deep); b2.rotation.z = Math.PI / 2; b2.position.x = s * 1.04; g.add(b2);
        var cp = new THREE.Mesh(capG, m.accent); cp.position.x = s * 1.18; g.add(cp);
      });
      g.rotation.set(0.22, -0.32, -0.24);
      return g;
    }

    if (shape === 'barbell') {
      var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 3.25, 28), m.knurl);
      bar.rotation.z = Math.PI / 2; g.add(bar);
      var p1 = makeBeveledPlate(0.84, 0.16);
      var p2 = makeBeveledPlate(0.66, 0.14);
      var p3 = makeBeveledPlate(0.48, 0.12);
      [-1, 1].forEach(function (s) {
        var slv = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.16, 26), m.accent);
        slv.rotation.z = Math.PI / 2; slv.position.x = s * 0.92; g.add(slv);
        var d1 = new THREE.Mesh(p1, m.main); d1.rotation.z = Math.PI / 2; d1.position.x = s * 1.09; g.add(d1);
        var d2 = new THREE.Mesh(p2, m.accent); d2.rotation.z = Math.PI / 2; d2.position.x = s * 1.26; g.add(d2);
        var d3 = new THREE.Mesh(p3, m.deep); d3.rotation.z = Math.PI / 2; d3.position.x = s * 1.41; g.add(d3);
      });
      g.scale.setScalar(0.88);
      g.rotation.set(0.20, -0.30, 0.16);
      return g;
    }

    if (shape === 'weightPlate') {
      var outer = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.19, 24, 56), m.main);
      g.add(outer);
      var web = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.16, 48), m.deep);
      web.rotation.x = Math.PI / 2; g.add(web);
      var hub = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.11, 20, 40), m.accent);
      g.add(hub);
      // 3 рельефных спицы-перемычки (имитируют олимпийский блин с 3 хватами)
      for (var sp = 0; sp < 3; sp++) {
        var ang = (sp / 3) * Math.PI * 2 + Math.PI / 6;
        var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.24), m.main);
        spoke.position.set(Math.cos(ang) * 0.66, Math.sin(ang) * 0.66, 0);
        spoke.rotation.z = ang - Math.PI / 2;
        g.add(spoke);
      }
      var tex10 = makeSculptTextTex(THREE, '10', 'KG', dark, true);
      var lbl = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.19, 36), new THREE.MeshPhysicalMaterial({ map: tex10, roughness: 0.40 }));
      lbl.rotation.x = Math.PI / 2; g.add(lbl);
      g.rotation.set(0.28, -0.36, -0.14);
      return g;
    }

    if (shape === 'sportBottle' || shape === 'shaker') {
      var isBottle = shape === 'sportBottle';
      var pts = isBottle
        ? [
            new THREE.Vector2(0.0, -1.22), new THREE.Vector2(0.46, -1.22), new THREE.Vector2(0.56, -1.10),
            new THREE.Vector2(0.56, -0.42), new THREE.Vector2(0.45, -0.05), new THREE.Vector2(0.55, 0.32),
            new THREE.Vector2(0.54, 0.62), new THREE.Vector2(0.35, 0.80), new THREE.Vector2(0.35, 0.92),
            new THREE.Vector2(0.0, 0.92)
          ]
        : [
            new THREE.Vector2(0.0, -1.16), new THREE.Vector2(0.44, -1.16), new THREE.Vector2(0.50, -1.06),
            new THREE.Vector2(0.62, 0.66), new THREE.Vector2(0.58, 0.78), new THREE.Vector2(0.0, 0.78)
          ];
      var scaleTex = makeScaleBumpTex(THREE, dark);
      var bodyMat = m.main.clone();
      bodyMat.map = scaleTex;
      g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 48), bodyMat));

      // Рельефные кольца хвата на «талии» спортивной бутылки
      if (isBottle) {
        [-0.22, -0.08, 0.06, 0.20].forEach(function (yy) {
          var grip = new THREE.Mesh(new THREE.TorusGeometry(0.495, 0.028, 12, 36), m.accent);
          grip.rotation.x = Math.PI / 2; grip.position.y = yy; g.add(grip);
        });
      }

      // Ребристая спортивная крышка
      var capY = isBottle ? 0.98 : 0.86;
      var capR = isBottle ? 0.42 : 0.64;
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(capR, capR * 1.03, 0.28, 40), m.accent);
      cap.position.y = capY; g.add(cap);

      for (var r = 0; r < 18; r++) {
        var a = (r / 18) * Math.PI * 2;
        var rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.04), m.deep);
        rib.position.set(Math.cos(a) * capR, capY, Math.sin(a) * capR);
        rib.rotation.y = -a; g.add(rib);
      }

      // Откидной спортивный поильник + петля-карабин
      var spout = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.30, 22), m.main);
      spout.position.set(-0.08, capY + 0.24, 0.08);
      spout.rotation.z = 0.16; g.add(spout);

      var loop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.048, 14, 30, Math.PI * 1.25), m.accent);
      loop.position.set(capR * 0.72, capY + 0.10, 0);
      loop.rotation.z = -0.5; g.add(loop);

      g.rotation.set(0.18, -0.34, isBottle ? 0.16 : -0.18);
      return g;
    }

    if (shape === 'proteinJar') {
      var jarPts = [
        new THREE.Vector2(0.0, -1.06), new THREE.Vector2(0.66, -1.06), new THREE.Vector2(0.78, -0.94),
        new THREE.Vector2(0.80, 0.56), new THREE.Vector2(0.72, 0.72), new THREE.Vector2(0.58, 0.82),
        new THREE.Vector2(0.58, 0.92), new THREE.Vector2(0.0, 0.92)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(jarPts, 48), m.main));

      var texWhey = makeSculptTextTex(THREE, 'WHEY', 'ISOLATE', dark, false);
      var lblMat = new THREE.MeshPhysicalMaterial({ map: texWhey, roughness: 0.42, clearcoat: 0.22 });
      var lbl = new THREE.Mesh(new THREE.CylinderGeometry(0.812, 0.812, 1.12, 48, 1, true), lblMat);
      lbl.position.y = -0.16; lbl.rotation.y = -Math.PI / 2; g.add(lbl);

      var lid = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.70, 0.32, 44), m.accent);
      lid.position.y = 1.02; g.add(lid);
      for (var jr = 0; jr < 22; jr++) {
        var ja = (jr / 22) * Math.PI * 2;
        var jrib = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.25, 0.042), m.deep);
        jrib.position.set(Math.cos(ja) * 0.69, 1.02, Math.sin(ja) * 0.69);
        jrib.rotation.y = -ja; g.add(jrib);
      }
      g.rotation.set(0.18, 0.26, 0.12);
      return g;
    }

    if (shape === 'ppPlate') {
      var plPts = [
        new THREE.Vector2(0.0, -0.15), new THREE.Vector2(0.68, -0.15), new THREE.Vector2(0.78, -0.08),
        new THREE.Vector2(1.18, 0.08), new THREE.Vector2(1.30, 0.18), new THREE.Vector2(1.27, 0.23),
        new THREE.Vector2(1.12, 0.14), new THREE.Vector2(0.72, -0.02), new THREE.Vector2(0.0, -0.04)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(plPts, 52), m.main));
      var rim = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.028, 14, 52), m.accent);
      rim.rotation.x = Math.PI / 2; rim.position.y = 0.20; g.add(rim);

      // Скульптурный стейк, авокадо, киноа, черри и яйцо в едином гипсовом материале
      var salm = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 18), m.accent);
      salm.scale.set(1.22, 0.38, 0.76); salm.position.set(0.32, 0.14, -0.24); salm.rotation.y = -0.35; g.add(salm);

      var quin = new THREE.Mesh(new THREE.SphereGeometry(0.38, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), m.deep);
      quin.scale.set(1.15, 0.62, 1.0); quin.position.set(-0.36, 0.0, 0.34); g.add(quin);

      for (var av = 0; av < 4; av++) {
        var sl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.065, 18, 1, false, 0, Math.PI * 1.15), m.main);
        sl.position.set(-0.44 + av * 0.11, 0.10 + av * 0.024, -0.30 + av * 0.08);
        sl.rotation.set(0.22, 0.5 + av * 0.32, -0.18); g.add(sl);
      }

      var eg = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), m.main);
      eg.scale.set(1.1, 0.48, 0.9); eg.position.set(0.36, 0.08, 0.36); g.add(eg);
      var yk = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 14), m.accent);
      yk.position.set(0.36, 0.15, 0.36); g.add(yk);

      [[0.03, 0.12, 0.52], [0.62, 0.13, 0.08], [-0.06, 0.13, -0.60]].forEach(function (c) {
        var ch = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 16), m.accent);
        ch.position.set(c[0], c[1], c[2]); g.add(ch);
      });

      g.rotation.set(0.86, -0.22, 0.12);
      return g;
    }

    if (shape === 'yogaMat') {
      // Частично развёрнутый 3D фитнес-коврик: объёмный рулон с 3-витковой спиралью + полотно + ремень с пряжкой
      var roll = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.95, 42, 1, false), m.main);
      roll.rotation.z = Math.PI / 2;
      roll.position.set(-0.22, 0.28, 0);
      g.add(roll);

      // Глубокая спираль на правом и левом торцах рулона
      [-1.195, 0.755].forEach(function (tx) {
        [0.37, 0.25, 0.13].forEach(function (sr) {
          var ring = new THREE.Mesh(new THREE.TorusGeometry(sr, 0.024, 10, 32), m.deep);
          ring.rotation.y = Math.PI / 2;
          ring.position.set(tx, 0.28, 0);
          g.add(ring);
        });
      });

      // Стягивающий ремень и пряжка
      var strap = new THREE.Mesh(new THREE.TorusGeometry(0.475, 0.055, 14, 40), m.accent);
      strap.rotation.y = Math.PI / 2;
      strap.position.set(-0.22, 0.28, 0);
      g.add(strap);

      // Развёрнутое полотно коврика, выходящее из-под рулона
      var sheet = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.075, 1.48), m.accent);
      sheet.position.set(-0.22, -0.14, 0.72);
      g.add(sheet);

      // Рельефные линии разметки на развёрнутом полотне
      [-0.45, 0.0, 0.45].forEach(function (lz) {
        var ln = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.02, 0.025), m.deep);
        ln.position.set(-0.22, -0.095, 0.72 + lz);
        g.add(ln);
      });

      g.rotation.set(0.48, -0.46, -0.16);
      return g;
    }

    if (shape === 'sneaker') {
      // Объёмный 3D-кроссовок в скульптурном стиле
      var soleShape = new THREE.Shape();
      soleShape.moveTo(-1.35, -0.22);
      soleShape.lineTo(1.22, -0.22);
      soleShape.quadraticCurveTo(1.42, -0.18, 1.38, 0.02);
      soleShape.lineTo(-1.32, 0.04);
      soleShape.quadraticCurveTo(-1.42, -0.06, -1.35, -0.22);
      var sole = new THREE.Mesh(new THREE.ExtrudeGeometry(soleShape, { depth: 0.72, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 6 }), m.accent);
      sole.position.z = -0.36; g.add(sole);

      var upperShape = new THREE.Shape();
      upperShape.moveTo(-1.26, 0.02);
      upperShape.lineTo(-1.12, 0.92);
      upperShape.quadraticCurveTo(-0.82, 0.68, -0.48, 0.88);
      upperShape.lineTo(-0.18, 1.12);
      upperShape.quadraticCurveTo(0.08, 1.12, 0.24, 0.86);
      upperShape.lineTo(0.84, 0.44);
      upperShape.quadraticCurveTo(1.30, 0.34, 1.32, 0.02);
      upperShape.closePath();
      var upper = new THREE.Mesh(new THREE.ExtrudeGeometry(upperShape, { depth: 0.62, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.10, bevelSegments: 8 }), m.main);
      upper.position.z = -0.31; g.add(upper);

      // 4 объёмных шнурка
      for (var lc = 0; lc < 4; lc++) {
        var lace = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.78, 12), m.deep);
        lace.rotation.x = Math.PI / 2;
        lace.position.set(0.16 + lc * 0.16, 0.84 - lc * 0.11, 0);
        g.add(lace);
      }
      g.scale.setScalar(0.88);
      g.rotation.set(0.18, -0.34, -0.18);
      return g;
    }

    if (shape === 'jumprope') {
      var ropeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.78, -0.30, 0.10),
        new THREE.Vector3(-1.02, 0.55, -0.15),
        new THREE.Vector3(0.0, 1.18, 0.05),
        new THREE.Vector3(1.02, 0.55, -0.15),
        new THREE.Vector3(0.78, -0.30, 0.10)
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(ropeCurve, 56, 0.068, 14, false), m.accent));

      [-1, 1].forEach(function (s) {
        var hGrp = new THREE.Group();
        hGrp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.165, 0.96, 28), m.knurl));
        var head = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.18, 24), m.accent);
        head.position.y = 0.55; hGrp.add(head);
        var cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 14), m.main);
        cap.position.y = -0.48; hGrp.add(cap);
        hGrp.position.set(s * 0.74, -0.78, 0.10);
        hGrp.rotation.z = s * -0.22;
        g.add(hGrp);
      });
      g.rotation.set(0.16, -0.24, -0.10);
      return g;
    }

    if (shape === 'pilatesRing') {
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.105, 22, 60), m.main));
      [-1, 1].forEach(function (s) {
        var padOut = new THREE.Mesh(new THREE.TorusGeometry(1.09, 0.075, 16, 22, 0.62), m.accent);
        padOut.rotation.z = s > 0 ? (Math.PI / 2 - 0.31) : (-Math.PI / 2 - 0.31);
        g.add(padOut);
        var padIn = new THREE.Mesh(new THREE.TorusGeometry(0.83, 0.068, 16, 22, 0.52), m.deep);
        padIn.rotation.z = s > 0 ? (Math.PI / 2 - 0.26) : (-Math.PI / 2 - 0.26);
        g.add(padIn);
      });
      g.rotation.set(0.28, -0.34, 0.22);
      return g;
    }

    // stopwatch — 3D спортивный хронограф
    var swCase = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.28, 52), m.main);
    swCase.rotation.x = Math.PI / 2; g.add(swCase);
    var bezel = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.095, 18, 52), m.accent);
    bezel.position.z = 0.10; g.add(bezel);
    var dial = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.06, 48), m.deep);
    dial.rotation.x = Math.PI / 2; dial.position.z = 0.13; g.add(dial);

    // 12 рельефных меток + стрелки
    for (var tk = 0; tk < 12; tk++) {
      var ta = (tk / 12) * Math.PI * 2;
      var tick = new THREE.Mesh(new THREE.BoxGeometry(0.04, tk % 3 === 0 ? 0.16 : 0.09, 0.04), m.accent);
      tick.position.set(Math.sin(ta) * 0.70, Math.cos(ta) * 0.70, 0.17);
      tick.rotation.z = -ta; g.add(tick);
    }
    var h1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.54, 0.05), m.main);
    h1.position.set(0, 0.22, 0.19); g.add(h1);
    var h2 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 0.05), m.accent);
    h2.position.set(0.16, -0.08, 0.21); h2.rotation.z = -1.1; g.add(h2);
    var pin = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 14), m.accent);
    pin.position.z = 0.22; g.add(pin);

    // Верхняя кнопка и дужка + боковая кнопка
    var crown = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.24, 24), m.accent);
    crown.position.y = 1.08; g.add(crown);
    var bow = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.048, 14, 30), m.accent);
    bow.position.y = 1.24; g.add(bow);
    var pusher = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.20, 20), m.accent);
    pusher.position.set(0.76, 0.76, 0); pusher.rotation.z = -0.78; g.add(pusher);

    g.position.y = -0.12;
    g.rotation.set(0.20, -0.32, 0.10);
    return g;
  }

  // Запекаем все нужные скульптуры одним offscreen WebGLRenderer и сразу освобождаем GPU!
  function bakeAllSculptures(THREE, placements) {
    var needed = {};
    placements.forEach(function (p) {
      var key = p.shape + (p.dark ? '_dark' : '_light');
      if (!bakedCache[key]) needed[key] = { shape: p.shape, dark: !!p.dark };
    });
    var keys = Object.keys(needed);
    if (!keys.length) return;

    var size = window.innerWidth <= 720 ? 384 : 512;
    var canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(size, size, false);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.outputEncoding = THREE.sRGBEncoding;

    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.08, 5.2);
    camera.lookAt(0, 0, 0);

    var envLight = createSculptureEnv(THREE, renderer, false);
    var envDark = createSculptureEnv(THREE, renderer, true);
    var knurlTex = makeKnurlBump(THREE);

    keys.forEach(function (key) {
      var item = needed[key];
      var scene = new THREE.Scene();
      scene.environment = item.dark ? envDark : envLight;

      // Скульптурный верхне-левый свет (как на стенах immersive-g.com)
      scene.add(new THREE.HemisphereLight(item.dark ? 0xFFF2DC : 0xFFFFFF, item.dark ? 0x1A0E07 : 0xB8A188, item.dark ? 0.92 : 1.05));
      var keyL = new THREE.DirectionalLight(item.dark ? 0xFFEAD0 : 0xFFFFFF, item.dark ? 1.65 : 1.35);
      keyL.position.set(-4.5, 6.0, 5.5);
      scene.add(keyL);
      var rimL = new THREE.PointLight(item.dark ? 0xE6B06B : 0xFFF5E6, item.dark ? 1.5 : 0.75, 22);
      rimL.position.set(4.5, -3.5, 4.0);
      scene.add(rimL);

      var mesh = buildSculptureMesh(THREE, item.shape, item.dark, knurlTex);
      // Лёгкое скульптурное уплощение по Z — эффект высокого барельефа, выходящего из стены
      mesh.scale.z *= 0.68;
      scene.add(mesh);

      renderer.clear();
      renderer.render(scene, camera);
      bakedCache[key] = canvas.toDataURL('image/png');
    });

    // Полностью освобождаем временный WebGL-контекст
    envLight.dispose();
    envDark.dispose();
    knurlTex.dispose();
    renderer.dispose();
    if (typeof renderer.forceContextLoss === 'function') {
      try { renderer.forceContextLoss(); } catch (e) {}
    }
  }

  // Ровно 15 скульптурных точек равномерно по сайту (все позиции согласованы)
  var PLACEMENTS = [
    { sel: '.hero',         shape: 'dumbbell',     left: '1%',  top: '10%', size: 224, rot: -10 },
    { sel: '.hero',         shape: 'ppPlate',      left: '41%', top: '74%', size: 210, rot: 8 },
    { sel: '.goals-sec',    shape: 'barbell',      left: '2%',  top: '6%',  size: 265, rot: -5, dark: true },
    { sel: '.goals-sec',    shape: 'kettlebell16', left: '75%', top: '46%', size: 256, rot: -6, dark: true },
    { sel: '.cases-sec',    shape: 'sneaker',      left: '72%', top: '4%',  size: 232, rot: -8 },
    { sel: '.cases-sec',    shape: 'shaker',       left: '1%',  top: '66%', size: 210, rot: 12 },
    { sel: '.gift-sec',     shape: 'weightPlate',  left: '81%', top: '8%',  size: 210, rot: -12 },
    { sel: '.reviews-sec',  shape: 'jumprope',     left: '4%',  top: '8%',  size: 218, rot: -8 },
    { sel: '.reviews-sec',  shape: 'proteinJar',   left: '79%', top: '60%', size: 212, rot: 10 },
    { sel: '.about-sec',    shape: 'yogaMat',      left: '67%', top: '2%',  size: 268, rot: 6 },
    { sel: '.about-sec',    shape: 'kettlebell16', left: '1%',  bottom: '-10px', size: 204, rot: -6 },
    { sel: '.approach-sec', shape: 'stopwatch',    left: '76%', top: '8%',  size: 216, rot: 8 },
    { sel: '.services-sec', shape: 'barbell',      left: '2%',  top: '76%', size: 268, rot: -6 },
    { sel: '.steps-sec',    shape: 'pilatesRing',  left: '75%', top: '10%', size: 220, rot: -12 },
    { sel: '.faq-sec',      shape: 'sportBottle',  left: '76%', top: '42%', size: 248, rot: 10 }
  ];

  // Деликатное отслеживание мыши для 3D-скульптур (как у гантели в Блоке 5)
  function bindInteractiveTilt() {
    if (tiltBound || window.matchMedia('(pointer: coarse)').matches) return;
    tiltBound = true;
    var raf = 0;
    var mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      my = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var nodes = document.querySelectorAll('.wall-sculpture');
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          var r = n.getBoundingClientRect();
          if (r.bottom < -60 || r.top > window.innerHeight + 60) continue;
          var baseRot = Number(n.getAttribute('data-rot')) || 0;
          var rx = (-my * 9).toFixed(2);
          var ry = (mx * 11).toFixed(2);
          var tx = (mx * 7).toFixed(1);
          var ty = (my * 5).toFixed(1);
          n.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) rotate(' + baseRot + 'deg) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        }
      });
    }, { passive: true });
  }

  function mountBakedReliefs() {
    injectReliefStyles();
    bakeAllSculptures(window.THREE, PLACEMENTS);
    document.querySelectorAll('.wall-sculpture').forEach(function (el) { el.remove(); });

    PLACEMENTS.forEach(function (p) {
      var host = document.querySelector(p.sel);
      if (!host) return;
      host.classList.add('wall-relief-host');

      var key = p.shape + (p.dark ? '_dark' : '_light');
      var dataUrl = bakedCache[key];
      if (!dataUrl) return;

      var wrap = document.createElement('div');
      wrap.className = 'wall-sculpture' + (p.dark ? ' on-dark' : '');
      wrap.setAttribute('data-shape', p.shape);
      wrap.setAttribute('data-rot', String(p.rot || 0));
      if (p.left != null) wrap.style.left = p.left;
      if (p.right != null) wrap.style.right = p.right;
      if (p.bottom != null) { wrap.style.bottom = p.bottom; wrap.style.top = 'auto'; }
      else if (p.top != null) { wrap.style.top = p.top; }
      wrap.style.width = p.size + 'px';
      wrap.style.height = p.size + 'px';
      wrap.style.transform = 'rotate(' + (p.rot || 0) + 'deg)';

      var img = document.createElement('img');
      img.className = 'wall-sculpture-img';
      img.src = dataUrl;
      img.alt = '';
      img.decoding = 'async';
      wrap.appendChild(img);
      host.insertBefore(wrap, host.firstChild);
    });

    bindInteractiveTilt();
  }

  function initNastyaReliefs() {
    if (window.THREE) {
      mountBakedReliefs();
    } else {
      var existing = document.getElementById('threejs-cdn-script') || document.querySelector('script[src*="three.min.js"]');
      if (existing) {
        existing.addEventListener('load', mountBakedReliefs);
        setTimeout(function () { if (window.THREE) mountBakedReliefs(); }, 800);
      } else {
        var s = document.createElement('script');
        s.id = 'threejs-cdn-script';
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        s.onload = mountBakedReliefs;
        document.head.appendChild(s);
      }
    }
  }

  window.initNastyaReliefs = initNastyaReliefs;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initNastyaReliefs, 110); });
  } else {
    setTimeout(initNastyaReliefs, 110);
  }
})();
