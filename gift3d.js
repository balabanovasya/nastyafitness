/**
 * gift3d.js — Реалистичная 3D-гантелька с атласным шёлковым бантом для Блока 5
 * Построена на Three.js PBR + студийном свете PMREM (единое качество с 3D-порталом Блока 2).
 */
(function () {
  'use strict';

  var mounted = false;

  function injectGift3DCSS() {
    var old = document.getElementById('nastya-gift3d-css');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'nastya-gift3d-css';
    st.textContent = [
      '.gift-art {',
      '  position: relative !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  min-height: 220px;',
      '}',
      '.gift-art .gift-svg { display: none !important; }',
      '.gift-3d-stage {',
      '  position: relative;',
      '  width: 280px;',
      '  height: 225px;',
      '  max-width: 100%;',
      '  z-index: 2;',
      '  cursor: grab;',
      '  touch-action: pan-y;',
      '}',
      '.gift-3d-stage:active { cursor: grabbing; }',
      '.gift-3d-canvas {',
      '  width: 100% !important;',
      '  height: 100% !important;',
      '  display: block !important;',
      '}',
      '@media (max-width: 720px) {',
      '  .gift-art { min-height: 175px; }',
      '  .gift-3d-stage { width: 235px; height: 185px; }',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function createWarmStudioEnv(THREE, renderer) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 256;
    var cx = cv.getContext('2d');

    var bg = cx.createLinearGradient(0, 0, 0, 256);
    bg.addColorStop(0.0, '#6B4932');
    bg.addColorStop(0.45, '#342014');
    bg.addColorStop(0.58, '#1E120A');
    bg.addColorStop(1.0, '#120A05');
    cx.fillStyle = bg;
    cx.fillRect(0, 0, 512, 256);

    function box(x, y, rx, ry, c1, c2) {
      cx.save(); cx.translate(x, y); cx.scale(1, ry / rx);
      var g = cx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
      g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, rx, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
    box(130, 52, 118, 52, 'rgba(255,250,240,1)', 'rgba(246,217,168,0.62)');
    box(395, 68, 108, 48, 'rgba(255,238,205,0.96)', 'rgba(224,168,98,0.48)');
    box(256, 26, 90, 34, 'rgba(255,255,255,0.94)', 'rgba(255,244,224,0.38)');
    box(90, 180, 95, 40, 'rgba(224,168,98,0.42)', 'rgba(138,90,50,0.14)');
    box(420, 185, 90, 42, 'rgba(255,235,205,0.38)', 'rgba(138,90,50,0.12)');

    var tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var env = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
    return env;
  }

  function makeKnurlTex(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    cx.fillStyle = '#808080';
    cx.fillRect(0, 0, 256, 256);
    cx.strokeStyle = '#ffffff';
    cx.lineWidth = 3;
    for (var i = -256; i < 512; i += 12) {
      cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + 256, 256); cx.stroke();
      cx.beginPath(); cx.moveTo(i + 256, 0); cx.lineTo(i, 256); cx.stroke();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
  }

  function makeSilkWeaveBump(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    cx.fillStyle = '#808080';
    cx.fillRect(0, 0, 256, 256);
    // Мелкое переплетение шёлковой нити + тонкая золотая кромка по краям ленты
    cx.fillStyle = 'rgba(255,255,255,0.18)';
    for (var y = 0; y < 256; y += 3) cx.fillRect(0, y, 256, 1);
    cx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var x = 0; x < 256; x += 6) cx.fillRect(x, 0, 1, 256);
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 2);
    return tex;
  }

  function makeSilkColorTex(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    var g = cx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.00, '#DFB479');
    g.addColorStop(0.05, '#FFFBF4');
    g.addColorStop(0.22, '#FFF2DF');
    g.addColorStop(0.50, '#FFFDF9');
    g.addColorStop(0.78, '#F6DFC0');
    g.addColorStop(0.95, '#FFFBF4');
    g.addColorStop(1.00, '#DFB479');
    cx.fillStyle = g;
    cx.fillRect(0, 0, 256, 256);
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeShadowPlaneTex(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    var cx = cv.getContext('2d');
    var g = cx.createRadialGradient(128, 128, 10, 128, 128, 122);
    g.addColorStop(0, 'rgba(8, 3, 1, 0.62)');
    g.addColorStop(0.55, 'rgba(12, 5, 2, 0.22)');
    g.addColorStop(1, 'rgba(12, 5, 2, 0)');
    cx.fillStyle = g;
    cx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(cv);
  }

  // Генератор настоящей 3D-атласной ленты (плоская полоса с толщиной, изгибом, сужением у узла и V-вырезом на конце)
  function buildRibbonGeometry(THREE, curve, segments, widthFn, thickness, swallowTail) {
    var positions = [];
    var uvs = [];
    var indices = [];

    var pts = curve.getPoints(segments);
    var frames = curve.computeFrenetFrames(segments, false);
    var upHint = new THREE.Vector3(0, 0, 1);

    for (var i = 0; i <= segments; i++) {
      var u = i / segments;
      var p = pts[i];
      var tangent = frames.tangents[i].clone().normalize();

      // Стабильная ориентация ленты лицом к камере с плавным естественным поворотом
      var side = new THREE.Vector3().crossVectors(tangent, upHint);
      if (side.lengthSq() < 0.0005) side.set(1, 0, 0);
      side.normalize();
      var normal = new THREE.Vector3().crossVectors(side, tangent).normalize();

      var halfW = widthFn(u) * 0.5;
      var halfT = thickness * 0.5;

      // 4 вершины поперечного сечения ленты (верх-лево, верх-право, низ-право, низ-лево)
      // и лёгкий прогиб ленты для объёмной складки
      var notchShift = (swallowTail && i === segments) ? -0.14 : 0;
      var pCenter = p.clone().addScaledVector(tangent, notchShift);

      var v0 = p.clone().addScaledVector(side, -halfW).addScaledVector(normal, halfT);
      var vMidTop = pCenter.clone().addScaledVector(normal, halfT * 1.45);
      var v1 = p.clone().addScaledVector(side, halfW).addScaledVector(normal, halfT);
      var v2 = p.clone().addScaledVector(side, halfW).addScaledVector(normal, -halfT);
      var vMidBot = pCenter.clone().addScaledVector(normal, -halfT * 1.45);
      var v3 = p.clone().addScaledVector(side, -halfW).addScaledVector(normal, -halfT);

      var ring = [v0, vMidTop, v1, v2, vMidBot, v3];
      var uvV = [0, 0.5, 1, 1, 0.5, 0];
      for (var k = 0; k < 6; k++) {
        positions.push(ring[k].x, ring[k].y, ring[k].z);
        uvs.push(u, uvV[k]);
      }
    }

    for (var s = 0; s < segments; s++) {
      var a0 = s * 6;
      var b0 = (s + 1) * 6;
      for (var j = 0; j < 6; j++) {
        var jn = (j + 1) % 6;
        indices.push(a0 + j, b0 + j, b0 + jn);
        indices.push(a0 + j, b0 + jn, a0 + jn);
      }
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  function buildLuxuryGiftDumbbell(THREE) {
    var root = new THREE.Group();

    var knurlTex = makeKnurlTex(THREE);
    var silkColor = makeSilkColorTex(THREE);
    var silkBump = makeSilkWeaveBump(THREE);

    var brushedGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xE6B672,
      roughness: 0.22,
      metalness: 0.92,
      clearcoat: 0.45,
      clearcoatRoughness: 0.14
    });
    var knurlGoldMat = new THREE.MeshStandardMaterial({
      color: 0xEBC286,
      roughness: 0.28,
      metalness: 0.88,
      bumpMap: knurlTex,
      bumpScale: 0.028
    });
    var darkIronMat = new THREE.MeshPhysicalMaterial({
      color: 0x2A1A11,
      roughness: 0.34,
      metalness: 0.52,
      clearcoat: 0.42,
      clearcoatRoughness: 0.22
    });
    var espressoMat = new THREE.MeshPhysicalMaterial({
      color: 0x3F2719,
      roughness: 0.38,
      metalness: 0.42,
      clearcoat: 0.32
    });
    var silkMat = new THREE.MeshPhysicalMaterial({
      map: silkColor,
      bumpMap: silkBump,
      bumpScale: 0.012,
      roughness: 0.28,
      metalness: 0.10,
      clearcoat: 0.52,
      clearcoatRoughness: 0.24,
      side: THREE.DoubleSide
    });

    // 1. ГРИФ С РОМБОВИДНОЙ НАСЕЧКОЙ И ЗАМКАМИ
    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 2.35, 36), knurlGoldMat);
    handle.rotation.z = Math.PI / 2;
    root.add(handle);

    // Декоративные гладкие втулки-замки у дисков
    var collarPts = [
      new THREE.Vector2(0.145, -0.09),
      new THREE.Vector2(0.215, -0.09),
      new THREE.Vector2(0.235, -0.05),
      new THREE.Vector2(0.235, 0.05),
      new THREE.Vector2(0.215, 0.09),
      new THREE.Vector2(0.145, 0.09)
    ];
    var collarGeo = new THREE.LatheGeometry(collarPts, 40);

    // 2. ДВУХСТУПЕНЧАТЫЕ СГЛАЖЕННЫЕ ЛИТЫЕ БЛИНЫ С ФАСКАМИ И ЗОЛОТЫМИ КОЛЬЦАМИ
    function makeBeveledPlate(outerR, thick) {
      var pts = [
        new THREE.Vector2(0.14, -thick * 0.5),
        new THREE.Vector2(outerR * 0.80, -thick * 0.5),
        new THREE.Vector2(outerR * 0.94, -thick * 0.38),
        new THREE.Vector2(outerR, -thick * 0.22),
        new THREE.Vector2(outerR, thick * 0.22),
        new THREE.Vector2(outerR * 0.94, thick * 0.38),
        new THREE.Vector2(outerR * 0.80, thick * 0.5),
        new THREE.Vector2(0.14, thick * 0.5)
      ];
      return new THREE.LatheGeometry(pts, 52);
    }

    var bigPlateGeo = makeBeveledPlate(0.76, 0.27);
    var smallPlateGeo = makeBeveledPlate(0.58, 0.22);
    var goldAccentRingBig = new THREE.TorusGeometry(0.56, 0.024, 16, 48);
    var goldAccentRingSmall = new THREE.TorusGeometry(0.41, 0.020, 14, 42);
    var endCapGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.22, 0.0),
      new THREE.Vector2(0.22, 0.09),
      new THREE.Vector2(0.17, 0.14),
      new THREE.Vector2(0.0, 0.15)
    ], 36);

    [-1, 1].forEach(function (side) {
      var collar = new THREE.Mesh(collarGeo, brushedGoldMat);
      collar.rotation.z = Math.PI / 2;
      collar.position.x = side * 0.56;
      root.add(collar);

      var bigP = new THREE.Mesh(bigPlateGeo, darkIronMat);
      bigP.rotation.z = Math.PI / 2;
      bigP.position.x = side * 0.78;
      root.add(bigP);

      // Золотое декоративное кольцо с внутренней и внешней сторон большого блина
      var ringIn = new THREE.Mesh(goldAccentRingBig, brushedGoldMat);
      ringIn.rotation.y = Math.PI / 2;
      ringIn.position.x = side * 0.642;
      root.add(ringIn);

      var ringOut = new THREE.Mesh(goldAccentRingBig, brushedGoldMat);
      ringOut.rotation.y = Math.PI / 2;
      ringOut.position.x = side * 0.918;
      root.add(ringOut);

      var smallP = new THREE.Mesh(smallPlateGeo, espressoMat);
      smallP.rotation.z = Math.PI / 2;
      smallP.position.x = side * 1.05;
      root.add(smallP);

      var ringSm = new THREE.Mesh(goldAccentRingSmall, brushedGoldMat);
      ringSm.rotation.y = Math.PI / 2;
      ringSm.position.x = side * 1.162;
      root.add(ringSm);

      var cap = new THREE.Mesh(endCapGeo, brushedGoldMat);
      cap.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      cap.position.x = side * 1.15;
      root.add(cap);
    });

    // 3. НАСТОЯЩИЙ ОБЪЁМНЫЙ АТЛАСНЫЙ ШЁЛКОВЫЙ БАНТ НА ГРИФЕ
    var bowGroup = new THREE.Group();

    // Обмотка ленты вокруг грифа
    var wrapBand = new THREE.Mesh(new THREE.CylinderGeometry(0.168, 0.168, 0.24, 36), silkMat);
    wrapBand.rotation.z = Math.PI / 2;
    bowGroup.add(wrapBand);

    // Пышный центральный узел банта со складками
    var knotGeo = new THREE.SphereGeometry(0.175, 28, 22);
    knotGeo.scale(0.82, 1.08, 1.05);
    var knot = new THREE.Mesh(knotGeo, silkMat);
    knot.position.set(0, 0.15, 0.11);
    bowGroup.add(knot);

    // Две объёмные пышные петли банта (левая и правая) из плоской атласной ленты
    [-1, 1].forEach(function (side) {
      var loopCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.04, 0.15, 0.10),
        new THREE.Vector3(side * 0.34, 0.56, 0.18),
        new THREE.Vector3(side * 0.72, 0.44, 0.06),
        new THREE.Vector3(side * 0.62, 0.10, -0.04),
        new THREE.Vector3(side * 0.05, 0.12, 0.06)
      ]);
      var loopGeo = buildRibbonGeometry(
        THREE,
        loopCurve,
        44,
        function (u) {
          // Сужается у узла, пышно раскрывается на дуге петли
          return 0.13 + Math.sin(u * Math.PI) * 0.24;
        },
        0.022,
        false
      );
      bowGroup.add(new THREE.Mesh(loopGeo, silkMat));

      // Струящийся хвостик ленты вниз с V-образным срезом
      var tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.05, 0.09, 0.13),
        new THREE.Vector3(side * 0.20, -0.22, 0.22),
        new THREE.Vector3(side * 0.36, -0.56, 0.12),
        new THREE.Vector3(side * 0.46, -0.82, 0.19)
      ]);
      var tailGeo = buildRibbonGeometry(
        THREE,
        tailCurve,
        32,
        function (u) {
          return 0.15 + u * 0.11;
        },
        0.018,
        true
      );
      bowGroup.add(new THREE.Mesh(tailGeo, silkMat));
    });

    root.add(bowGroup);
    root.userData.bow = bowGroup;

    // Благородный журнальный ракурс 3/4
    root.rotation.set(0.18, -0.34, -0.14);
    return root;
  }

  function mountGift3D() {
    if (mounted) return;
    var art = document.querySelector('.gift-sec .gift-art');
    if (!art || !window.THREE) return;
    mounted = true;

    injectGift3DCSS();

    var stage = art.querySelector('.gift-3d-stage');
    if (!stage) {
      stage = document.createElement('div');
      stage.className = 'gift-3d-stage';
      stage.innerHTML = '<canvas class="gift-3d-canvas" id="gift3dCanvas"></canvas>';
      art.appendChild(stage);
    }

    var canvas = stage.querySelector('canvas');
    var THREE = window.THREE;
    var w = stage.clientWidth || 260;
    var h = stage.clientHeight || 210;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 50);
    camera.position.set(0, 0.18, 5.15);
    camera.lookAt(0, -0.02, 0);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.outputEncoding = THREE.sRGBEncoding;

    scene.environment = createWarmStudioEnv(THREE, renderer);

    // Студийное 3-точечное освещение
    scene.add(new THREE.HemisphereLight(0xFFF6E8, 0x26150C, 0.95));
    var key = new THREE.DirectionalLight(0xFFF3DF, 1.55);
    key.position.set(4.5, 6.5, 6.5);
    scene.add(key);

    var rim = new THREE.PointLight(0xF0BC74, 1.8, 18);
    rim.position.set(-4.5, 2.2, -3.5);
    scene.add(rim);

    var fill = new THREE.PointLight(0xFFF5E6, 0.9, 16);
    fill.position.set(2.5, -3.0, 5.0);
    scene.add(fill);

    // Контактная мягкая тень под парящей гантелькой
    var shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 1.15),
      new THREE.MeshBasicMaterial({ map: makeShadowPlaneTex(THREE), transparent: true, opacity: 0.72, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.16;
    scene.add(shadowPlane);

    var dumbbell = buildLuxuryGiftDumbbell(THREE);
    scene.add(dumbbell);

    // Мягкий интерактивный поворот за курсором/пальцем
    var targetRotY = -0.34;
    var targetRotX = 0.18;
    var isDragging = false;
    var lastX = 0;

    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (isDragging) {
        targetRotY += (e.clientX - lastX) * 0.015;
        lastX = e.clientX;
      } else {
        var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        targetRotY = -0.34 + nx * 0.42;
        targetRotX = 0.18 + ny * 0.22;
      }
    });
    stage.addEventListener('pointerdown', function (e) { isDragging = true; lastX = e.clientX; });
    window.addEventListener('pointerup', function () { isDragging = false; });
    stage.addEventListener('pointerleave', function () {
      if (!isDragging) { targetRotY = -0.34; targetRotX = 0.18; }
    });

    var visible = true;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0] && entries[0].isIntersecting;
      }, { threshold: 0.05 });
      io.observe(stage);
    }

    var clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      var t = clock.getElapsedTime();

      // Плавное парение + дыхание тени
      var hoverY = Math.sin(t * 1.65) * 0.11;
      dumbbell.position.y = hoverY + 0.02;
      shadowPlane.scale.setScalar(1 - hoverY * 0.45);
      shadowPlane.material.opacity = 0.68 - hoverY * 0.5;

      // Плавный поворот + лёгкое колыхание бантика
      var autoYaw = Math.sin(t * 0.72) * 0.22;
      dumbbell.rotation.y += ((targetRotY + autoYaw) - dumbbell.rotation.y) * 0.06;
      dumbbell.rotation.x += ((targetRotX + Math.cos(t * 0.9) * 0.05) - dumbbell.rotation.x) * 0.06;
      dumbbell.rotation.z = -0.14 + Math.sin(t * 1.1) * 0.035;

      if (dumbbell.userData.bow) {
        dumbbell.userData.bow.rotation.z = Math.sin(t * 2.2) * 0.028;
      }

      renderer.render(scene, camera);
    }
    tick();

    window.addEventListener('resize', function () {
      var nw = stage.clientWidth;
      var nh = stage.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
    });
  }

  function initGift3D() {
    if (window.THREE) {
      mountGift3D();
    } else {
      var existing = document.getElementById('threejs-cdn-script') || document.querySelector('script[src*="three.min.js"]');
      if (existing) {
        existing.addEventListener('load', mountGift3D);
        setTimeout(function () { if (window.THREE) mountGift3D(); }, 900);
      } else {
        var s = document.createElement('script');
        s.id = 'threejs-cdn-script';
        s.src = 'vendor/three.min.js';
        s.onload = mountGift3D;
        document.head.appendChild(s);
      }
    }
  }

  window.initNastyaGift3D = initGift3D;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initGift3D, 180); });
  } else {
    setTimeout(initGift3D, 180);
  }
})();
