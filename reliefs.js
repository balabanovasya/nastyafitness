/**
 * reliefs.js — 15 матовых скульптурных 3D-барельефов (без свечения и сливания с фоном)
 * - Реальный Three.js PBR-рендер в матовом травертине/глине (светлые блоки) и шоколадной бронзе (тёмные блоки)
 * - Чёткое направленное боковое освещение — видны каждая грань, фаска, шнуровка, стрелки и насечка
 * - Исправлена ориентация всех надписей: «16 КГ», «10 KG» и «WHEY ISOLATE» стоят строго ровно и лицом к зрителю
 * - Один временный offscreen WebGLRenderer (512px) — мгновенная работа и 100% стабильность на iPhone
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
      '  opacity: var(--relief-strength, 0.88);',
      '  transform-origin: center center;',
      '  perspective: 900px;',
      '  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);',
      '  will-change: transform;',
      '}',
      '/* Никакого белого свечения вокруг фигур — только естественный объёмный рельеф и мягкая падающая тень */',
      '.wall-sculpture::before { display: none !important; content: none !important; }',
      '.wall-sculpture.on-dark {',
      '  opacity: var(--relief-strength-dark, 0.92);',
      '}',
      '.wall-sculpture-img {',
      '  position: relative;',
      '  z-index: 1;',
      '  width: 100%;',
      '  height: 100%;',
      '  object-fit: contain;',
      '  display: block;',
      '  filter:',
      '    drop-shadow(10px 15px 18px rgba(63, 41, 27, 0.22))',
      '    drop-shadow(3px 5px 5px rgba(63, 41, 27, 0.14));',
      '}',
      '.wall-sculpture.on-dark .wall-sculpture-img {',
      '  filter:',
      '    drop-shadow(12px 18px 22px rgba(6, 3, 1, 0.78))',
      '    drop-shadow(3px 5px 6px rgba(0, 0, 0, 0.58));',
      '}',
      '@media (max-width: 1024px) {',
      '  .wall-sculpture { opacity: calc(var(--relief-strength, 0.88) * 0.90); }',
      '}',
      '@media (max-width: 720px) {',
      '  .wall-sculpture {',
      '    opacity: calc(var(--relief-strength, 0.88) * 0.78);',
      '    max-width: 174px !important;',
      '    max-height: 174px !important;',
      '  }',
      '  .wall-sculpture.on-dark {',
      '    opacity: calc(var(--relief-strength-dark, 0.92) * 0.88);',
      '  }',
      '  .wall-sculpture[data-shape="kettlebell16"].on-dark {',
      '    max-width: 198px !important;',
      '    max-height: 198px !important;',
      '  }',
      '  .wall-sculpture[data-shape="barbell"] {',
      '    max-width: 210px !important;',
      '    max-height: 160px !important;',
      '  }',
      '  .about-sec .wall-sculpture[data-shape="yogaMat"] {',
      '    left: auto !important; right: -8px !important; top: 6px !important;',
      '    max-width: 192px !important; max-height: 162px !important;',
      '  }',
      '  .about-sec .wall-sculpture[data-shape="kettlebell16"] {',
      '    top: auto !important; bottom: -14px !important; left: 4px !important;',
      '    max-width: 154px !important; max-height: 154px !important;',
      '  }',
      '  .faq-sec .wall-sculpture[data-shape="sportBottle"] {',
      '    left: auto !important; right: -4px !important; top: 44% !important;',
      '    max-width: 158px !important; max-height: 198px !important;',
      '  }',
      '}',
      '.about-sec .about-photo-main, .about-sec .gallery-card, .about-sec .cert-scan-card { position: relative; z-index: 4; }',
      '.about-sec { padding-bottom: 120px !important; }',
      '@media (max-width: 720px) { .about-sec { padding-bottom: 84px !important; } }'
    ].join('\n');
    document.head.appendChild(st);
  }

  // Спокойная матовая студийная карта без выжженных белых пятен
  function createSculptureEnv(THREE, renderer, dark) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 256;
    var cx = cv.getContext('2d');
    var bg = cx.createLinearGradient(0, 0, 0, 256);
    if (dark) {
      bg.addColorStop(0.0, '#4E3322');
      bg.addColorStop(0.45, '#2A190F');
      bg.addColorStop(0.70, '#160C06');
      bg.addColorStop(1.0, '#0B0502');
    } else {
      bg.addColorStop(0.0, '#DFD2C2');
      bg.addColorStop(0.45, '#BFA992');
      bg.addColorStop(0.72, '#8F7964');
      bg.addColorStop(1.0, '#624F3F');
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
      box(120, 48, 105, 48, 'rgba(235, 198, 152, 0.72)', 'rgba(168, 118, 72, 0.28)');
      box(400, 90, 95, 44, 'rgba(176, 126, 78, 0.36)', 'rgba(92, 58, 34, 0.12)');
    } else {
      box(115, 46, 110, 48, 'rgba(255, 249, 240, 0.78)', 'rgba(222, 204, 182, 0.36)');
      box(405, 100, 95, 44, 'rgba(232, 214, 192, 0.42)', 'rgba(155, 134, 112, 0.14)');
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

  function makeSculptTextTex(THREE, line1, line2, dark, isCircle) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = isCircle ? 512 : 256;
    var cx = cv.getContext('2d');
    var w = cv.width, h = cv.height;

    cx.fillStyle = dark ? '#3C2518' : '#B8A28B';
    cx.fillRect(0, 0, w, h);

    if (isCircle) {
      cx.strokeStyle = dark ? '#C79662' : '#6A5542';
      cx.lineWidth = 16;
      cx.beginPath(); cx.arc(w / 2, h / 2, 224, 0, Math.PI * 2); cx.stroke();
      cx.strokeStyle = dark ? 'rgba(246,217,168,0.42)' : 'rgba(255,248,238,0.55)';
      cx.lineWidth = 6;
      cx.beginPath(); cx.arc(w / 2, h / 2, 200, 0, Math.PI * 2); cx.stroke();
    } else {
      cx.fillStyle = dark ? '#2E1B11' : '#A68F78';
      cx.fillRect(0, 0, w, h);
      cx.strokeStyle = dark ? '#C79662' : '#5D4938';
      cx.lineWidth = 10;
      cx.strokeRect(20, 20, w - 40, h - 40);
    }

    cx.textAlign = 'center';
    var y1 = line2 ? (h * 0.48) : (h * 0.56);
    var sz1 = isCircle ? 140 : 88;
    cx.font = '800 ' + sz1 + 'px Manrope, sans-serif';
    cx.fillStyle = dark ? '#140A05' : '#EFE4D6';
    cx.fillText(line1, w / 2 + 3, y1 + 4);
    cx.fillStyle = dark ? '#E2B682' : '#4C3929';
    cx.fillText(line1, w / 2, y1);

    if (line2) {
      cx.font = '800 ' + (isCircle ? 72 : 42) + 'px Manrope, sans-serif';
      cx.fillStyle = dark ? '#140A05' : '#EFE4D6';
      cx.fillText(line2, w / 2 + 2, h * 0.74 + 3);
      cx.fillStyle = dark ? '#E2B682' : '#4C3929';
      cx.fillText(line2, w / 2, h * 0.74);
    }

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeKnurlBump(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    cx.fillStyle = '#707070'; cx.fillRect(0, 0, 256, 256);
    cx.strokeStyle = '#ffffff'; cx.lineWidth = 5;
    for (var i = -256; i < 512; i += 14) {
      cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + 256, 256); cx.stroke();
      cx.beginPath(); cx.moveTo(i + 256, 0); cx.lineTo(i, 256); cx.stroke();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
  }

  function makeScaleTex(THREE, dark) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    var cx = cv.getContext('2d');
    cx.fillStyle = dark ? '#4E3323' : '#C8B6A1';
    cx.fillRect(0, 0, 512, 512);
    cx.strokeStyle = dark ? '#D4A570' : '#5E4B3A';
    cx.fillStyle = dark ? '#E2B682' : '#4C3A2B';
    cx.lineWidth = 7;
    cx.font = '800 34px Manrope, sans-serif';
    cx.textAlign = 'right';
    [
      { y: 125, lbl: '750' },
      { y: 205, lbl: '' },
      { y: 285, lbl: '500' },
      { y: 365, lbl: '' },
      { y: 435, lbl: '250' }
    ].forEach(function (t) {
      cx.beginPath();
      cx.moveTo(t.lbl ? 245 : 278, t.y);
      cx.lineTo(355, t.y);
      cx.stroke();
      if (t.lbl) cx.fillText(t.lbl, 228, t.y + 12);
    });
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // Матовая скульптурная палитра: читается на любом фоне, НИКОГДА не выгорает в белый!
  function makeSculptMaterials(THREE, dark, knurlTex) {
    if (dark) {
      return {
        main:   new THREE.MeshStandardMaterial({ color: 0x5A3C29, roughness: 0.56, metalness: 0.24 }),
        accent: new THREE.MeshStandardMaterial({ color: 0x865E40, roughness: 0.46, metalness: 0.36 }),
        deep:   new THREE.MeshStandardMaterial({ color: 0x2F1D12, roughness: 0.68, metalness: 0.16 }),
        knurl:  new THREE.MeshStandardMaterial({ color: 0x7A553A, roughness: 0.48, metalness: 0.38, bumpMap: knurlTex, bumpScale: 0.045 })
      };
    }
    // Благородный тёплый травертин / глина (в палитре сайта #CDC7BF / #A49E95 / #6A6257)
    return {
      main:   new THREE.MeshStandardMaterial({ color: 0xCAB9A5, roughness: 0.64, metalness: 0.05 }),
      accent: new THREE.MeshStandardMaterial({ color: 0xA6917B, roughness: 0.56, metalness: 0.08 }),
      deep:   new THREE.MeshStandardMaterial({ color: 0x7D6855, roughness: 0.70, metalness: 0.05 }),
      knurl:  new THREE.MeshStandardMaterial({ color: 0xB39E88, roughness: 0.58, metalness: 0.10, bumpMap: knurlTex, bumpScale: 0.05 })
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
      // Пудовая гиря с плоским основанием, дужкой и СТРОГО РОВНОЙ надписью «16 КГ»
      var kbPts = [
        new THREE.Vector2(0.0, -0.88), new THREE.Vector2(0.62, -0.88), new THREE.Vector2(0.72, -0.80),
        new THREE.Vector2(0.92, -0.58), new THREE.Vector2(1.02, -0.06), new THREE.Vector2(0.88, 0.46),
        new THREE.Vector2(0.56, 0.74), new THREE.Vector2(0.0, 0.78)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(kbPts, 52), m.main));

      var horn = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.148, 22, 48, Math.PI * 1.24), m.accent);
      horn.rotation.z = -Math.PI * 0.12;
      horn.position.y = 0.78;
      g.add(horn);

      // Основа медальона + плоский диск CircleGeometry (у него UV всегда 0° — надпись «16 КГ» стоит идеально ровно!)
      var badgeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.08, 40), m.deep);
      badgeBase.rotation.x = Math.PI / 2;
      badgeBase.position.set(0, -0.04, 0.96);
      g.add(badgeBase);

      var tex16 = makeSculptTextTex(THREE, '16', 'КГ', dark, true);
      var faceMat = new THREE.MeshStandardMaterial({ map: tex16, roughness: 0.56, metalness: dark ? 0.24 : 0.05 });
      var badgeFace = new THREE.Mesh(new THREE.CircleGeometry(0.50, 44), faceMat);
      badgeFace.position.set(0, -0.04, 1.005);
      g.add(badgeFace);

      var bRim = new THREE.Mesh(new THREE.TorusGeometry(0.508, 0.036, 14, 42), m.accent);
      bRim.position.set(0, -0.04, 1.002);
      g.add(bRim);

      g.rotation.set(0.14, -0.20, -0.04);
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
      var rBig = new THREE.TorusGeometry(0.54, 0.028, 14, 42);
      var capG = new THREE.SphereGeometry(0.18, 22, 18); capG.scale(0.65, 1, 1);

      [-1, 1].forEach(function (s) {
        var col = new THREE.Mesh(colGeo, m.deep); col.rotation.z = Math.PI / 2; col.position.x = s * 0.56; g.add(col);
        var b1 = new THREE.Mesh(pBig, m.main); b1.rotation.z = Math.PI / 2; b1.position.x = s * 0.78; g.add(b1);
        var ri = new THREE.Mesh(rBig, m.deep); ri.rotation.y = Math.PI / 2; ri.position.x = s * 0.912; g.add(ri);
        var b2 = new THREE.Mesh(pSm, m.accent); b2.rotation.z = Math.PI / 2; b2.position.x = s * 1.04; g.add(b2);
        var cp = new THREE.Mesh(capG, m.deep); cp.position.x = s * 1.18; g.add(cp);
      });
      g.rotation.set(0.24, -0.34, -0.22);
      return g;
    }

    if (shape === 'barbell') {
      var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 3.25, 28), m.knurl);
      bar.rotation.z = Math.PI / 2; g.add(bar);
      var p1 = makeBeveledPlate(0.84, 0.16);
      var p2 = makeBeveledPlate(0.66, 0.14);
      var p3 = makeBeveledPlate(0.48, 0.12);
      [-1, 1].forEach(function (s) {
        var slv = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 26), m.deep);
        slv.rotation.z = Math.PI / 2; slv.position.x = s * 0.92; g.add(slv);
        var d1 = new THREE.Mesh(p1, m.main); d1.rotation.z = Math.PI / 2; d1.position.x = s * 1.09; g.add(d1);
        var d2 = new THREE.Mesh(p2, m.accent); d2.rotation.z = Math.PI / 2; d2.position.x = s * 1.26; g.add(d2);
        var d3 = new THREE.Mesh(p3, m.deep); d3.rotation.z = Math.PI / 2; d3.position.x = s * 1.41; g.add(d3);
      });
      g.scale.setScalar(0.88);
      g.rotation.set(0.22, -0.30, 0.16);
      return g;
    }

    if (shape === 'weightPlate') {
      g.add(new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.19, 24, 56), m.main));
      var web = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.16, 48), m.deep);
      web.rotation.x = Math.PI / 2; g.add(web);
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.11, 20, 40), m.accent));
      for (var sp = 0; sp < 3; sp++) {
        var ang = (sp / 3) * Math.PI * 2 + Math.PI / 6;
        var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.24), m.main);
        spoke.position.set(Math.cos(ang) * 0.66, Math.sin(ang) * 0.66, 0);
        spoke.rotation.z = ang - Math.PI / 2;
        g.add(spoke);
      }
      // Строго горизонтальная надпись «10 KG» через CircleGeometry
      var tex10 = makeSculptTextTex(THREE, '10', 'KG', dark, true);
      var lblFace = new THREE.Mesh(new THREE.CircleGeometry(0.32, 36), new THREE.MeshStandardMaterial({ map: tex10, roughness: 0.56 }));
      lblFace.position.z = 0.115; g.add(lblFace);
      g.rotation.set(0.26, -0.34, -0.10);
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
      var scaleTex = makeScaleTex(THREE, dark);
      var bodyMat = new THREE.MeshStandardMaterial({ map: scaleTex, roughness: 0.60, metalness: 0.06 });
      var bodyMesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), bodyMat);
      bodyMesh.rotation.y = Math.PI * 0.5;
      g.add(bodyMesh);

      if (isBottle) {
        [-0.22, -0.08, 0.06, 0.20].forEach(function (yy) {
          var grip = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.032, 12, 36), m.deep);
          grip.rotation.x = Math.PI / 2; grip.position.y = yy; g.add(grip);
        });
      }

      var capY = isBottle ? 0.98 : 0.86;
      var capR = isBottle ? 0.42 : 0.64;
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(capR, capR * 1.03, 0.28, 40), m.accent);
      cap.position.y = capY; g.add(cap);

      for (var r = 0; r < 18; r++) {
        var a = (r / 18) * Math.PI * 2;
        var rib = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.22, 0.044), m.deep);
        rib.position.set(Math.cos(a) * capR, capY, Math.sin(a) * capR);
        rib.rotation.y = -a; g.add(rib);
      }

      var spout = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.30, 22), m.deep);
      spout.position.set(-0.08, capY + 0.24, 0.08);
      spout.rotation.z = 0.16; g.add(spout);

      var loop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.052, 14, 30, Math.PI * 1.25), m.deep);
      loop.position.set(capR * 0.72, capY + 0.10, 0);
      loop.rotation.z = -0.5; g.add(loop);

      g.rotation.set(0.18, -0.28, isBottle ? 0.14 : -0.16);
      return g;
    }

    if (shape === 'proteinJar') {
      var jarPts = [
        new THREE.Vector2(0.0, -1.06), new THREE.Vector2(0.66, -1.06), new THREE.Vector2(0.78, -0.94),
        new THREE.Vector2(0.80, 0.56), new THREE.Vector2(0.72, 0.72), new THREE.Vector2(0.58, 0.82),
        new THREE.Vector2(0.58, 0.92), new THREE.Vector2(0.0, 0.92)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(jarPts, 48), m.main));

      // Разворот rotation.y = Math.PI ставит центр этикетки «WHEY ISOLATE» СТРОГО ЛИЦОМ К ЗРИТЕЛЮ (+Z)
      var texWhey = makeSculptTextTex(THREE, 'WHEY', 'ISOLATE', dark, false);
      var lblMat = new THREE.MeshStandardMaterial({ map: texWhey, roughness: 0.58 });
      var lbl = new THREE.Mesh(new THREE.CylinderGeometry(0.812, 0.812, 1.12, 48, 1, true), lblMat);
      lbl.position.y = -0.16;
      lbl.rotation.y = Math.PI;
      g.add(lbl);

      var lid = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.70, 0.32, 44), m.accent);
      lid.position.y = 1.02; g.add(lid);
      for (var jr = 0; jr < 22; jr++) {
        var ja = (jr / 22) * Math.PI * 2;
        var jrib = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.25, 0.044), m.deep);
        jrib.position.set(Math.cos(ja) * 0.69, 1.02, Math.sin(ja) * 0.69);
        jrib.rotation.y = -ja; g.add(jrib);
      }
      g.rotation.set(0.18, -0.16, 0.08);
      return g;
    }

    if (shape === 'ppPlate') {
      var plPts = [
        new THREE.Vector2(0.0, -0.15), new THREE.Vector2(0.68, -0.15), new THREE.Vector2(0.78, -0.08),
        new THREE.Vector2(1.18, 0.08), new THREE.Vector2(1.30, 0.18), new THREE.Vector2(1.27, 0.23),
        new THREE.Vector2(1.12, 0.14), new THREE.Vector2(0.72, -0.02), new THREE.Vector2(0.0, -0.04)
      ];
      g.add(new THREE.Mesh(new THREE.LatheGeometry(plPts, 52), m.main));
      var rim = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.032, 14, 52), m.deep);
      rim.rotation.x = Math.PI / 2; rim.position.y = 0.20; g.add(rim);

      var salm = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 18), m.accent);
      salm.scale.set(1.22, 0.38, 0.76); salm.position.set(0.32, 0.14, -0.24); salm.rotation.y = -0.35; g.add(salm);

      var quin = new THREE.Mesh(new THREE.SphereGeometry(0.38, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), m.deep);
      quin.scale.set(1.15, 0.62, 1.0); quin.position.set(-0.36, 0.0, 0.34); g.add(quin);

      for (var av = 0; av < 4; av++) {
        var sl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.068, 18, 1, false, 0, Math.PI * 1.15), m.accent);
        sl.position.set(-0.44 + av * 0.11, 0.10 + av * 0.024, -0.30 + av * 0.08);
        sl.rotation.set(0.22, 0.5 + av * 0.32, -0.18); g.add(sl);
      }

      var eg = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), m.main);
      eg.scale.set(1.1, 0.48, 0.9); eg.position.set(0.36, 0.08, 0.36); g.add(eg);
      var yk = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 14), m.deep);
      yk.position.set(0.36, 0.15, 0.36); g.add(yk);

      [[0.03, 0.12, 0.52], [0.62, 0.13, 0.08], [-0.06, 0.13, -0.60]].forEach(function (c) {
        var ch = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 16), m.deep);
        ch.position.set(c[0], c[1], c[2]); g.add(ch);
      });

      g.rotation.set(0.86, -0.22, 0.12);
      return g;
    }

    if (shape === 'yogaMat') {
      var roll = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.95, 42, 1, false), m.main);
      roll.rotation.z = Math.PI / 2;
      roll.position.set(-0.22, 0.28, 0);
      g.add(roll);

      [-1.195, 0.755].forEach(function (tx) {
        [0.37, 0.25, 0.13].forEach(function (sr) {
          var ring = new THREE.Mesh(new THREE.TorusGeometry(sr, 0.030, 10, 32), m.deep);
          ring.rotation.y = Math.PI / 2;
          ring.position.set(tx, 0.28, 0);
          g.add(ring);
        });
      });

      var strap = new THREE.Mesh(new THREE.TorusGeometry(0.478, 0.062, 14, 40), m.deep);
      strap.rotation.y = Math.PI / 2;
      strap.position.set(-0.22, 0.28, 0);
      g.add(strap);

      var sheet = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.085, 1.48), m.accent);
      sheet.position.set(-0.22, -0.14, 0.72);
      g.add(sheet);

      [-0.45, 0.0, 0.45].forEach(function (lz) {
        var ln = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.025, 0.032), m.deep);
        ln.position.set(-0.22, -0.09, 0.72 + lz);
        g.add(ln);
      });

      g.rotation.set(0.48, -0.46, -0.16);
      return g;
    }

    if (shape === 'sneaker') {
      var soleShape = new THREE.Shape();
      soleShape.moveTo(-1.35, -0.22);
      soleShape.lineTo(1.22, -0.22);
      soleShape.quadraticCurveTo(1.42, -0.18, 1.38, 0.02);
      soleShape.lineTo(-1.32, 0.04);
      soleShape.quadraticCurveTo(-1.42, -0.06, -1.35, -0.22);
      var sole = new THREE.Mesh(new THREE.ExtrudeGeometry(soleShape, { depth: 0.74, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 6 }), m.deep);
      sole.position.z = -0.37; g.add(sole);

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

      // Боковая рельефная полоса кроссовка + 4 контрастных шнурка
      var stripe = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 0.86), m.accent);
      stripe.position.set(-0.12, 0.34, 0); stripe.rotation.z = -0.22; g.add(stripe);

      for (var lc = 0; lc < 4; lc++) {
        var lace = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.82, 12), m.deep);
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
      g.add(new THREE.Mesh(new THREE.TubeGeometry(ropeCurve, 56, 0.072, 14, false), m.deep));

      [-1, 1].forEach(function (s) {
        var hGrp = new THREE.Group();
        hGrp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.168, 0.96, 28), m.knurl));
        var head = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.18, 24), m.deep);
        head.position.y = 0.55; hGrp.add(head);
        var cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 14), m.accent);
        cap.position.y = -0.48; hGrp.add(cap);
        hGrp.position.set(s * 0.74, -0.78, 0.10);
        hGrp.rotation.z = s * -0.22;
        g.add(hGrp);
      });
      g.rotation.set(0.16, -0.24, -0.10);
      return g;
    }

    if (shape === 'pilatesRing') {
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.112, 22, 60), m.main));
      [-1, 1].forEach(function (s) {
        var padOut = new THREE.Mesh(new THREE.TorusGeometry(1.09, 0.082, 16, 22, 0.62), m.deep);
        padOut.rotation.z = s > 0 ? (Math.PI / 2 - 0.31) : (-Math.PI / 2 - 0.31);
        g.add(padOut);
        var padIn = new THREE.Mesh(new THREE.TorusGeometry(0.83, 0.075, 16, 22, 0.52), m.accent);
        padIn.rotation.z = s > 0 ? (Math.PI / 2 - 0.26) : (-Math.PI / 2 - 0.26);
        g.add(padIn);
      });
      g.rotation.set(0.28, -0.34, 0.22);
      return g;
    }

    // stopwatch — контрастный 3D-хронограф с чётким циферблатом, 12 делениями и стрелками
    var swCase = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.28, 52), m.main);
    swCase.rotation.x = Math.PI / 2; g.add(swCase);
    var bezel = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.10, 18, 52), m.accent);
    bezel.position.z = 0.10; g.add(bezel);
    var dial = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.06, 48), m.main);
    dial.rotation.x = Math.PI / 2; dial.position.z = 0.13; g.add(dial);
    var innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.028, 12, 48), m.deep);
    innerRing.position.z = 0.16; g.add(innerRing);

    for (var tk = 0; tk < 12; tk++) {
      var ta = (tk / 12) * Math.PI * 2;
      var tick = new THREE.Mesh(new THREE.BoxGeometry(0.052, tk % 3 === 0 ? 0.18 : 0.10, 0.05), m.deep);
      tick.position.set(Math.sin(ta) * 0.68, Math.cos(ta) * 0.68, 0.18);
      tick.rotation.z = -ta; g.add(tick);
    }
    var h1 = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.56, 0.06), m.deep);
    h1.position.set(0, 0.23, 0.20); g.add(h1);
    var h2 = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.44, 0.06), m.deep);
    h2.position.set(0.17, -0.09, 0.22); h2.rotation.z = -1.1; g.add(h2);
    var pin = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 14), m.accent);
    pin.position.z = 0.23; g.add(pin);

    var crown = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.24, 24), m.deep);
    crown.position.y = 1.08; g.add(crown);
    var bow = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.052, 14, 30), m.accent);
    bow.position.y = 1.24; g.add(bow);
    var pusher = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.20, 20), m.deep);
    pusher.position.set(0.76, 0.76, 0); pusher.rotation.z = -0.78; g.add(pusher);

    g.position.y = -0.12;
    g.rotation.set(0.20, -0.32, 0.10);
    return g;
  }

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
    renderer.toneMappingExposure = 0.96;
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

      // Чёткое направленное скульптурное освещение (без выжигания в белый!)
      scene.add(new THREE.HemisphereLight(
        item.dark ? 0xE8C89E : 0xF7EFE4,
        item.dark ? 0x160B05 : 0x6F5B48,
        item.dark ? 0.52 : 0.48
      ));
      var keyL = new THREE.DirectionalLight(item.dark ? 0xFFE6C2 : 0xFFFBF5, item.dark ? 1.35 : 1.15);
      keyL.position.set(-5.0, 5.8, 4.2);
      scene.add(keyL);
      var fillL = new THREE.DirectionalLight(item.dark ? 0xB8824D : 0xBFA890, item.dark ? 0.45 : 0.32);
      fillL.position.set(5.2, -3.6, 3.0);
      scene.add(fillL);

      var mesh = buildSculptureMesh(THREE, item.shape, item.dark, knurlTex);
      mesh.scale.z *= 0.72;
      scene.add(mesh);

      renderer.clear();
      renderer.render(scene, camera);
      bakedCache[key] = canvas.toDataURL('image/png');
    });

    envLight.dispose();
    envDark.dispose();
    knurlTex.dispose();
    renderer.dispose();
    if (typeof renderer.forceContextLoss === 'function') {
      try { renderer.forceContextLoss(); } catch (e) {}
    }
  }

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
