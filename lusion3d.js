/**
 * lusion3d.js — Интерактивная 3D-сцена в стиле lusion.co (Шаг 3)
 * Высокодетализированные PBR-объекты в невесомости с физикой столкновений:
 * - Тарелки с ПП-едой (лосось-гриль, веер авокадо, киноа, черри, яйцо, шпинат)
 * - Премиальная банка спортивного питания с HD-этикеткой и ребристой крышкой
 * - Сглаженные премиальные гантели с насечкой и литая гиря 16 KG
 * - Студийное освещение PMREM + ACESFilmicToneMapping + 60 FPS на мобильных
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

  function injectLusionEnhancementsCSS() {
    if (document.getElementById('nastya-lusion3d-css')) return;
    var st = document.createElement('style');
    st.id = 'nastya-lusion3d-css';
    st.textContent = [
      '.lusion-card {',
      '  height: var(--lusion-h, 400px) !important;',
      '  background: radial-gradient(760px 420px at 72% 28%, rgba(224,168,98,0.28), transparent 64%), radial-gradient(520px 340px at 14% 92%, rgba(168,112,60,0.22), transparent 62%), linear-gradient(140deg, #2D1C12 0%, #462B1A 52%, #1D120B 100%) !important;',
      '}',
      '.lusion-info {',
      '  background: rgba(28, 17, 10, 0.44) !important;',
      '  backdrop-filter: blur(10px) !important;',
      '  -webkit-backdrop-filter: blur(10px) !important;',
      '  box-shadow: 0 18px 42px rgba(0,0,0,0.26);',
      '}',
      '@media (max-width: 720px) {',
      '  .lusion-card { height: 390px !important; padding: 18px 16px !important; }',
      '  .lusion-info { max-width: 100% !important; padding: 14px 16px !important; border-radius: 18px !important; }',
      '  .lusion-info h3 { font-size: 1.44rem !important; margin-bottom: 6px !important; }',
      '  .lusion-info p { font-size: 0.78rem !important; line-height: 1.45 !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  // ==========================================================================
  // ПРОЦЕДУРНЫЕ HD-ТЕКСТУРЫ И СТУДИЙНАЯ КАРТА ОТРАЖЕНИЙ (PMREM)
  // ==========================================================================
  function createStudioEnvironment(THREE, renderer) {
    var cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 512;
    var cx = cv.getContext('2d');

    // Базовый тёплый студийный градиент
    var bg = cx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0.0, '#4E3524');
    bg.addColorStop(0.45, '#2A1B12');
    bg.addColorStop(0.55, '#1D120B');
    bg.addColorStop(1.0, '#120B06');
    cx.fillStyle = bg;
    cx.fillRect(0, 0, 1024, 512);

    // Главный верхний тёплый софтбокс
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

    softbox(260, 110, 210, 95, 'rgba(255, 246, 232, 1)', 'rgba(246, 217, 168, 0.55)');
    softbox(780, 140, 190, 90, 'rgba(255, 232, 194, 0.95)', 'rgba(224, 168, 98, 0.45)');
    softbox(520, 60, 140, 55, 'rgba(255, 255, 255, 0.9)', 'rgba(255, 240, 215, 0.35)');
    softbox(140, 320, 160, 70, 'rgba(224, 168, 98, 0.45)', 'rgba(138, 90, 50, 0.15)');
    softbox(890, 340, 150, 75, 'rgba(255, 235, 200, 0.38)', 'rgba(138, 90, 50, 0.12)');

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

  function makeProteinLabelTexture(THREE) {
    var cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 512;
    var cx = cv.getContext('2d');

    // Премиальный кремово-золотой фон этикетки
    var bg = cx.createLinearGradient(0, 0, 1024, 512);
    bg.addColorStop(0, '#F7EFE2');
    bg.addColorStop(0.5, '#FFFBF4');
    bg.addColorStop(1, '#EADAC4');
    cx.fillStyle = bg;
    cx.fillRect(0, 0, 1024, 512);

    // Верхняя и нижняя золотые фольгированные полосы
    var gold = cx.createLinearGradient(0, 0, 1024, 0);
    gold.addColorStop(0, '#B57B3A');
    gold.addColorStop(0.3, '#F2CF97');
    gold.addColorStop(0.55, '#C9904E');
    gold.addColorStop(0.8, '#F6D9A8');
    gold.addColorStop(1, '#9E6324');
    cx.fillStyle = gold;
    cx.fillRect(0, 0, 1024, 34);
    cx.fillRect(0, 478, 1024, 34);

    // Тёмно-шоколадный центральный блок лицевой стороны
    cx.fillStyle = '#332014';
    cx.fillRect(140, 62, 744, 388);
    cx.strokeStyle = '#E0A862';
    cx.lineWidth = 4;
    cx.strokeRect(156, 78, 712, 356);

    // Надписи на банке
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

    // Аккуратные значки-капсулы внизу этикетки
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

    // Светлые прожилки лосося
    cx.strokeStyle = 'rgba(255, 224, 200, 0.55)';
    cx.lineWidth = 7;
    for (var i = -100; i < 620; i += 34) {
      cx.beginPath();
      cx.moveTo(i, 0);
      cx.bezierCurveTo(i + 40, 170, i - 30, 340, i + 25, 512);
      cx.stroke();
    }

    // Аппетитные полоски от гриля
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
      color: 0xFAF3E8,
      roughness: 0.16,
      metalness: 0.04,
      clearcoat: 0.92,
      clearcoatRoughness: 0.1
    });
    var goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xE2AF6B,
      roughness: 0.2,
      metalness: 0.88,
      clearcoat: 0.4
    });
    var darkChocoMat = new THREE.MeshPhysicalMaterial({
      color: 0x2F1E14,
      roughness: 0.34,
      metalness: 0.18,
      clearcoat: 0.32
    });
    var matteCastIron = new THREE.MeshStandardMaterial({
      color: 0x3A271C,
      roughness: 0.42,
      metalness: 0.58
    });
    var knurlMetal = new THREE.MeshStandardMaterial({
      color: 0xE8C490,
      roughness: 0.28,
      metalness: 0.85,
      bumpMap: textures.knurl,
      bumpScale: 0.025
    });
    var proteinLabelMat = new THREE.MeshPhysicalMaterial({
      map: textures.proteinLabel,
      roughness: 0.28,
      metalness: 0.12,
      clearcoat: 0.45
    });
    var salmonMat = new THREE.MeshPhysicalMaterial({
      map: textures.salmon,
      roughness: 0.36,
      metalness: 0.02,
      clearcoat: 0.38,
      clearcoatRoughness: 0.25
    });
    var avocadoOuterMat = new THREE.MeshStandardMaterial({ color: 0x3E6B2F, roughness: 0.55 });
    var avocadoInnerMat = new THREE.MeshPhysicalMaterial({ color: 0xA9CF6A, roughness: 0.34, clearcoat: 0.2 });
    var spinachMat = new THREE.MeshStandardMaterial({ color: 0x3B7A36, roughness: 0.42, side: THREE.DoubleSide });
    var cherryMat = new THREE.MeshPhysicalMaterial({
      color: 0xCF2E26,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });
    var quinoaMat = new THREE.MeshStandardMaterial({
      map: textures.quinoa,
      bumpMap: textures.quinoa,
      bumpScale: 0.03,
      roughness: 0.72
    });
    var eggWhiteMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFDF8, roughness: 0.18, clearcoat: 0.7 });
    var eggYolkMat = new THREE.MeshPhysicalMaterial({ color: 0xF5A623, roughness: 0.14, clearcoat: 0.85 });
    var kbBadgeMat = new THREE.MeshStandardMaterial({ map: textures.kbBadge, roughness: 0.3, metalness: 0.45 });

    // 1. ВЫСОКОДЕТАЛИЗИРОВАННАЯ ТАРЕЛКА С ПП-ЕДОЙ
    function makePPPlate() {
      var g = new THREE.Group();

      // Профиль керамической тарелки (LatheGeometry — 48 сегментов)
      var pts = [
        new THREE.Vector2(0.0, -0.10),
        new THREE.Vector2(0.48, -0.10),
        new THREE.Vector2(0.55, -0.06),
        new THREE.Vector2(0.84, 0.06),
        new THREE.Vector2(0.92, 0.13),
        new THREE.Vector2(0.90, 0.16),
        new THREE.Vector2(0.80, 0.10),
        new THREE.Vector2(0.52, -0.02),
        new THREE.Vector2(0.0, -0.03)
      ];
      var plate = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), ceramicMat);
      g.add(plate);

      // Тонкая золотая кайма по ободку тарелки
      var rim = new THREE.Mesh(new THREE.TorusGeometry(0.91, 0.015, 14, 56), goldMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.145;
      g.add(rim);

      // А) Стейк лосося гриль (сглаженный 3D-брусок)
      var salmonGeo = new THREE.SphereGeometry(0.32, 28, 22);
      salmonGeo.scale(1.22, 0.36, 0.74);
      var salmon = new THREE.Mesh(salmonGeo, salmonMat);
      salmon.position.set(0.22, 0.09, -0.18);
      salmon.rotation.y = -0.35;
      g.add(salmon);

      // Б) Горка киноа с травами
      var quinoaGeo = new THREE.SphereGeometry(0.28, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.6);
      quinoaGeo.scale(1.15, 0.62, 1.0);
      var quinoa = new THREE.Mesh(quinoaGeo, quinoaMat);
      quinoa.position.set(-0.26, -0.01, 0.24);
      g.add(quinoa);

      // В) Веер из 4 долек авокадо
      for (var a = 0; a < 4; a++) {
        var slice = new THREE.Group();
        var meat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.045, 22, 1, false, 0, Math.PI * 1.1), avocadoInnerMat);
        var skin = new THREE.Mesh(new THREE.CylinderGeometry(0.172, 0.172, 0.04, 22, 1, true, 0, Math.PI * 1.1), avocadoOuterMat);
        slice.add(meat);
        slice.add(skin);
        slice.position.set(-0.32 + a * 0.08, 0.06 + a * 0.018, -0.22 + a * 0.06);
        slice.rotation.set(0.22, 0.5 + a * 0.32, -0.18);
        g.add(slice);
      }

      // Г) Половинка варёного яйца (белок + яркий желток)
      var eggW = new THREE.Mesh(new THREE.SphereGeometry(0.15, 22, 18), eggWhiteMat);
      eggW.scale.set(1.1, 0.45, 0.9);
      eggW.position.set(0.26, 0.05, 0.26);
      g.add(eggW);
      var eggY = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 16), eggYolkMat);
      eggY.scale.set(1.0, 0.65, 1.0);
      eggY.position.set(0.26, 0.095, 0.26);
      g.add(eggY);

      // Д) 4 глянцевых томата черри с листиками
      var cherryCoords = [
        [0.02, 0.08, 0.38],
        [0.44, 0.09, 0.06],
        [-0.04, 0.09, -0.44],
        [0.12, 0.075, 0.10]
      ];
      cherryCoords.forEach(function (c) {
        var ch = new THREE.Mesh(new THREE.SphereGeometry(0.082, 22, 22), cherryMat);
        ch.position.set(c[0], c[1], c[2]);
        g.add(ch);
      });

      // Е) Листья свежего шпината под композицией
      for (var l = 0; l < 5; l++) {
        var leafGeo = new THREE.SphereGeometry(0.16, 16, 12);
        leafGeo.scale(1.3, 0.08, 0.8);
        var leaf = new THREE.Mesh(leafGeo, spinachMat);
        var ang = (l / 5) * Math.PI * 2 + 0.4;
        leaf.position.set(Math.cos(ang) * 0.34, 0.035, Math.sin(ang) * 0.32);
        leaf.rotation.set((Math.random() - 0.5) * 0.25, ang, (Math.random() - 0.5) * 0.2);
        g.add(leaf);
      }

      // Небольшой наклон, чтобы содержимое тарелки сразу красиво читалось на камеру
      g.rotation.x = 0.72;
      return g;
    }

    // 2. ПРЕМИАЛЬНАЯ БАНКА СПОРТИВНОГО ПИТАНИЯ (WHEY ISOLATE)
    function makeProteinJar() {
      var g = new THREE.Group();

      // Плавный профиль банки с фасками и плечиками (LatheGeometry)
      var jarPts = [
        new THREE.Vector2(0.0, -0.66),
        new THREE.Vector2(0.40, -0.66),
        new THREE.Vector2(0.47, -0.60),
        new THREE.Vector2(0.48, 0.36),
        new THREE.Vector2(0.44, 0.45),
        new THREE.Vector2(0.36, 0.51),
        new THREE.Vector2(0.36, 0.58),
        new THREE.Vector2(0.0, 0.58)
      ];
      var body = new THREE.Mesh(new THREE.LatheGeometry(jarPts, 48), darkChocoMat);
      g.add(body);

      // HD-этикетка вокруг корпуса
      var label = new THREE.Mesh(
        new THREE.CylinderGeometry(0.486, 0.486, 0.72, 48, 1, true),
        proteinLabelMat
      );
      label.position.y = -0.10;
      g.add(label);

      // Полированная золотая крышка с ребристой накаткой
      var lidPts = [
        new THREE.Vector2(0.0, 0.55),
        new THREE.Vector2(0.41, 0.55),
        new THREE.Vector2(0.42, 0.57),
        new THREE.Vector2(0.42, 0.73),
        new THREE.Vector2(0.39, 0.76),
        new THREE.Vector2(0.0, 0.76)
      ];
      var lid = new THREE.Mesh(new THREE.LatheGeometry(lidPts, 48), goldMat);
      g.add(lid);

      // 24 аккуратных ребра хвата по окружности крышки
      var ribGeo = new THREE.BoxGeometry(0.018, 0.14, 0.024);
      for (var r = 0; r < 24; r++) {
        var a = (r / 24) * Math.PI * 2;
        var rib = new THREE.Mesh(ribGeo, goldMat);
        rib.position.set(Math.cos(a) * 0.418, 0.65, Math.sin(a) * 0.418);
        rib.rotation.y = -a;
        g.add(rib);
      }

      // Металлическое кольцо у основания горлышка
      var neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.014, 12, 40), goldMat);
      neckRing.rotation.x = Math.PI / 2;
      neckRing.position.y = 0.54;
      g.add(neckRing);

      return g;
    }

    // 3. ПРЕМИАЛЬНАЯ ГАНТЕЛЬ СО СГЛАЖЕННЫМИ ФАСКАМИ И НАСЕЧКОЙ
    function makeLuxuryDumbbell() {
      var g = new THREE.Group();

      // Гриф с ромбовидной насечкой
      var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 1.38, 28), knurlMetal);
      handle.rotation.z = Math.PI / 2;
      g.add(handle);

      // Профиль сглаженного диска (не острый цилиндр, а объёмный диск со скошенной фаской)
      function makePlate(outerR, thick, mat) {
        var pts = [
          new THREE.Vector2(0.09, -thick / 2),
          new THREE.Vector2(outerR * 0.86, -thick / 2),
          new THREE.Vector2(outerR, -thick * 0.28),
          new THREE.Vector2(outerR, thick * 0.28),
          new THREE.Vector2(outerR * 0.86, thick / 2),
          new THREE.Vector2(0.09, thick / 2)
        ];
        var m = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), mat);
        m.rotation.z = Math.PI / 2;
        return m;
      }

      [-1, 1].forEach(function (side) {
        var p1 = makePlate(0.44, 0.16, matteCastIron);
        p1.position.x = side * 0.40;
        g.add(p1);

        var ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.016, 12, 36), goldMat);
        ring1.rotation.y = Math.PI / 2;
        ring1.position.x = side * 0.482;
        g.add(ring1);

        var p2 = makePlate(0.34, 0.14, darkChocoMat);
        p2.position.x = side * 0.56;
        g.add(p2);

        var cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), goldMat);
        cap.scale.set(0.6, 1, 1);
        cap.position.x = side * 0.67;
        g.add(cap);
      });

      return g;
    }

    // 4. ЛИТАЯ ГИРЯ 16 КГ (С ПЛОСКИМ ДНОМ И РЕАЛИСТИЧНОЙ ДУЖКОЙ)
    function makeLuxuryKettlebell() {
      var g = new THREE.Group();

      // Тело гири со срезанным плоским основанием
      var kbPts = [
        new THREE.Vector2(0.0, -0.46),
        new THREE.Vector2(0.32, -0.46),
        new THREE.Vector2(0.46, -0.34),
        new THREE.Vector2(0.52, -0.05),
        new THREE.Vector2(0.44, 0.26),
        new THREE.Vector2(0.28, 0.40),
        new THREE.Vector2(0.0, 0.42)
      ];
      var body = new THREE.Mesh(new THREE.LatheGeometry(kbPts, 42), matteCastIron);
      g.add(body);

      // Анатомическая дужка-рукоять
      var handle = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.072, 18, 40, Math.PI * 1.18), goldMat);
      handle.rotation.z = -Math.PI * 0.09;
      handle.position.y = 0.42;
      g.add(handle);

      // Золотой медальон «16 КГ» на передней стенке
      var badge = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32), kbBadgeMat);
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
  // ЗАПУСК СЦЕНЫ И ФИЗИКИ В СТИЛЕ LUSION.CO
  // ==========================================================================
  function startLusionScene() {
    if (started) return;
    var canvas = document.getElementById('lusionCanvas');
    if (!canvas || !window.THREE) return;
    started = true;

    var THREE = window.THREE;
    var isMobile = window.innerWidth <= 720;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, Math.max(1, canvas.clientWidth) / Math.max(1, canvas.clientHeight), 0.1, 100);
    camera.position.set(0, 0, isMobile ? 11.8 : 10.6);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Студийная среда отражений — убирает плоский вид
    scene.environment = createStudioEnvironment(THREE, renderer);

    // 3-точечный киношный свет
    scene.add(new THREE.HemisphereLight(0xFFF6E8, 0x2B1A10, 0.85));

    var keyLight = new THREE.DirectionalLight(0xFFF2DC, 1.45);
    keyLight.position.set(6, 9, 8);
    scene.add(keyLight);

    var rimLight = new THREE.PointLight(0xE8AF64, 1.65, 26);
    rimLight.position.set(-7, -3, 6);
    scene.add(rimLight);

    var fillLight = new THREE.PointLight(0xFFF3E2, 0.75, 20);
    fillLight.position.set(2, -6, 7);
    scene.add(fillLight);

    var textures = {
      proteinLabel: makeProteinLabelTexture(THREE),
      salmon: makeSalmonTexture(THREE),
      quinoa: makeQuinoaTexture(THREE),
      knurl: makeKnurlBumpTexture(THREE),
      kbBadge: makeKettlebellBadgeTexture(THREE)
    };
    var factory = createModelFactory(THREE, textures);

    // Набор объектов: акцент на тарелки ПП-еды и банки спортпита + гантели и гиря 16 кг
    var recipe = isMobile
      ? ['ppPlate', 'proteinJar', 'ppPlate', 'dumbbell', 'proteinJar', 'kettlebell', 'ppPlate', 'dumbbell', 'proteinJar']
      : ['ppPlate', 'proteinJar', 'dumbbell', 'ppPlate', 'proteinJar', 'kettlebell', 'ppPlate', 'proteinJar', 'dumbbell', 'ppPlate', 'kettlebell', 'proteinJar', 'dumbbell'];

    // Центр «гравитационного облака»: на ПК правее текста, на мобильном чуть ниже текста
    var clusterCenter = new THREE.Vector3(isMobile ? 0.0 : 1.75, isMobile ? -0.95 : 0.0, 0);
    var bodies = [];

    recipe.forEach(function (kind, i) {
      var mesh = factory[kind]();
      var baseScale = isMobile ? 0.76 : 0.88;
      if (kind === 'ppPlate') baseScale *= 1.06;
      if (kind === 'proteinJar') baseScale *= 0.98;
      mesh.scale.setScalar(baseScale);

      var angle = (i / recipe.length) * Math.PI * 2;
      var spreadX = isMobile ? 2.1 : 3.2;
      var spreadY = isMobile ? 1.55 : 1.65;
      var px = clusterCenter.x + Math.cos(angle) * spreadX * (0.45 + Math.random() * 0.6);
      var py = clusterCenter.y + Math.sin(angle) * spreadY * (0.45 + Math.random() * 0.6);
      var pz = (Math.random() - 0.5) * 2.1;

      mesh.position.set(px, py, pz);
      mesh.rotation.set(
        kind === 'ppPlate' ? 0.85 + (Math.random() - 0.5) * 0.45 : (Math.random() - 0.5) * 0.7,
        (Math.random() - 0.5) * 1.1,
        (Math.random() - 0.5) * 0.55
      );

      var radius = (kind === 'ppPlate' ? 0.94 : kind === 'proteinJar' ? 0.74 : 0.76) * baseScale;
      scene.add(mesh);
      bodies.push({
        mesh: mesh,
        kind: kind,
        radius: radius,
        vel: new THREE.Vector3(),
        angVel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.011,
          (Math.random() - 0.5) * 0.006
        ),
        phase: Math.random() * Math.PI * 2
      });
    });

    // Интерактивный указатель (мышь + тач)
    var pointer = new THREE.Vector3(999, 999, 0);
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
      pointer.set(nx * visibleW * 0.5, ny * visibleH * 0.5, 0);
      pointerActive = true;
    }

    function pulseAtPointer() {
      if (!pointerActive) return;
      bodies.forEach(function (b) {
        var dir = new THREE.Vector3().subVectors(b.mesh.position, pointer);
        var dist = dir.length();
        if (dist < 4.0 && dist > 0.01) {
          dir.normalize();
          var power = (4.0 - dist) * 0.055;
          b.vel.addScaledVector(dir, power);
          b.angVel.x += (Math.random() - 0.5) * 0.05;
          b.angVel.y += (Math.random() - 0.5) * 0.05;
        }
      });
    }

    canvas.addEventListener('pointermove', function (e) { updatePointer(e.clientX, e.clientY); });
    canvas.addEventListener('pointerdown', function (e) { updatePointer(e.clientX, e.clientY); pulseAtPointer(); });
    canvas.addEventListener('pointerleave', function () { pointerActive = false; pointer.set(999, 999, 0); });
    canvas.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', function () { pointerActive = false; pointer.set(999, 999, 0); });

    // Экономим заряд: рендерим только когда блок виден в окне браузера
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

      // 1. Мягкий параллакс камеры за курсором
      var targetCamX = pointerActive ? pointerNorm.x * 0.45 : Math.sin(t * 0.35) * 0.25;
      var targetCamY = pointerActive ? pointerNorm.y * 0.3 : Math.cos(t * 0.28) * 0.16;
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // 2. Гравитация к центру облака + невесомое дыхание + отталкивание от курсора
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];
        var pos = b.mesh.position;

        // Притяжение к центру (создаёт эффект плотного живого роя Lusion)
        b.vel.x += (clusterCenter.x - pos.x) * 0.0052;
        b.vel.y += (clusterCenter.y - pos.y) * 0.0068;
        b.vel.z += (clusterCenter.z - pos.z) * 0.0085;

        // Мягкое колебание в невесомости
        b.vel.y += Math.sin(t * 1.1 + b.phase) * 0.0007;
        b.vel.x += Math.cos(t * 0.8 + b.phase) * 0.0005;

        // Отталкивание от курсора/пальца
        if (pointerActive) {
          diffVec.set(pos.x - pointer.x, pos.y - pointer.y, pos.z * 0.45);
          var dist = diffVec.length();
          var repulseR = b.radius + 1.55;
          if (dist < repulseR && dist > 0.001) {
            var force = (repulseR - dist) / repulseR;
            diffVec.divideScalar(dist);
            b.vel.addScaledVector(diffVec, force * 0.048);
            b.angVel.x += diffVec.y * force * 0.009;
            b.angVel.y -= diffVec.x * force * 0.009;
          }
        }
      }

      // 3. Межобъектные упругие столкновения (чтобы объекты не проникали друг в друга)
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
            b1.mesh.position.addScaledVector(diffVec, -overlap * 0.7);
            b2.mesh.position.addScaledVector(diffVec, overlap * 0.7);

            b1.vel.addScaledVector(diffVec, -overlap * 0.09);
            b2.vel.addScaledVector(diffVec, overlap * 0.09);

            // Лёгкое подкручивание при соприкосновении
            b1.angVel.z -= overlap * 0.004;
            b2.angVel.z += overlap * 0.004;
          }
        }
      }

      // 4. Интегрирование скоростей и демпфирование
      for (var k = 0; k < bodies.length; k++) {
        var bd = bodies[k];
        bd.vel.multiplyScalar(0.935);
        bd.mesh.position.add(bd.vel);

        // Мягкое ограничение глубины
        if (bd.mesh.position.z > 2.2) bd.mesh.position.z = 2.2;
        if (bd.mesh.position.z < -2.2) bd.mesh.position.z = -2.2;

        bd.mesh.rotation.x += bd.angVel.x;
        bd.mesh.rotation.y += bd.angVel.y;
        bd.mesh.rotation.z += bd.angVel.z;

        // Постепенно возвращаем угловую скорость к спокойному парению
        bd.angVel.x = bd.angVel.x * 0.985 + Math.sin(t * 0.5 + bd.phase) * 0.00009;
        bd.angVel.y = bd.angVel.y * 0.985 + 0.00012;
        bd.angVel.z *= 0.985;
      }

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      var mob = window.innerWidth <= 720;
      clusterCenter.set(mob ? 0.0 : 1.75, mob ? -0.95 : 0.0, 0);
      camera.position.z = mob ? 11.8 : 10.6;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    });
  }

  function initNastyaLusion3D() {
    injectLusionEnhancementsCSS();
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
