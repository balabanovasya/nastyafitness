/**
 * patches.js
 * Senior Creative Frontend Patch Layer
 * Применяет визуальные, структурные, 3D и логические изменения поверх index.html
 */

(function() {
    'use strict';

    // ========================================================================
    // 0. ЖЕЛЕЗОБЕТОННЫЙ ПРЕДОХРАНИТЕЛЬ ПРЕЛОАДЕРА (КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ)
    // ========================================================================
    function forceRemovePreloader() {
        const pre = document.getElementById('preloader');
        if (pre) {
            pre.classList.add('hidden');
        }
        document.body.classList.add('loaded');
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(forceRemovePreloader, 800);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(forceRemovePreloader, 800);
        });
    }
    window.addEventListener('load', function() {
        setTimeout(forceRemovePreloader, 800);
    });

    // ========================================================================
    // 1. ГЛОБАЛЬНЫЕ КОНСТАНТЫ И SVG-АССЕТЫ
    // ========================================================================
    
    const SVG_DUMBBELL_BOW = `
        <svg viewBox="0 0 120 60" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width: 48px; max-height: 24px; vertical-align: middle; margin-right: 8px;">
            <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#E0A862"/>
                    <stop offset="50%" stop-color="#C9904E"/>
                    <stop offset="100%" stop-color="#A67035"/>
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#3F291B" flood-opacity="0.3"/>
                </filter>
            </defs>
            <rect x="10" y="22" width="15" height="16" rx="4" fill="url(#goldGrad)" filter="url(#shadow)"/>
            <rect x="95" y="22" width="15" height="16" rx="4" fill="url(#goldGrad)" filter="url(#shadow)"/>
            <rect x="25" y="26" width="70" height="8" rx="4" fill="url(#goldGrad)"/>
            <path d="M60 26 C 50 15, 40 20, 45 30 C 40 20, 30 25, 35 35 C 45 40, 55 35, 60 30 C 65 35, 75 40, 85 35 C 90 25, 80 20, 75 30 C 80 20, 70 15, 60 26 Z" fill="#FFF1D6" stroke="#C9904E" stroke-width="1.5"/>
            <circle cx="60" cy="30" r="4" fill="#C9904E"/>
        </svg>
    `;

    const SVG_BAS_RELIEF_FILTER = `
        <filter id="basRelief" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
            <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.8" specularExponent="15" lighting-color="#FFFBF5" result="specOut">
                <fePointLight x="100" y="100" z="200"/>
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
            <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#3F291B" flood-opacity="0.15"/>
        </filter>
    `;

    // ========================================================================
    // 2. ИСПРАВЛЕНИЕ БАГА С ИСЧЕЗНОВЕНИЕМ ФОТО
    // ========================================================================

    window.photoFallback = function(img) {
        const slot = img.getAttribute('data-slot');
        if (window.SITE_OVERRIDES && window.SITE_OVERRIDES.photos && window.SITE_OVERRIDES.photos[slot]) {
            img.src = window.SITE_OVERRIDES.photos[slot];
            img.onerror = null;
            return;
        }
        img.style.display = 'none';
    };

    function applyPhotoOverrides() {
        if (!window.SITE_OVERRIDES || !window.SITE_OVERRIDES.photos) return;
        
        document.querySelectorAll('img[data-slot]').forEach(function(img) {
            const slot = img.getAttribute('data-slot');
            if (window.SITE_OVERRIDES.photos[slot]) {
                img.src = window.SITE_OVERRIDES.photos[slot];
                img.onerror = null;
            }
        });
    }

    // ========================================================================
    // 3. ИНЪЕКЦИЯ CSS
    // ========================================================================

    const patchStyles = document.createElement('style');
    patchStyles.textContent = `
        .hero-floating-card { display: none !important; }

        @keyframes levitate {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
        }
        .hero-visual img, .about-photo-main img {
            -webkit-mask-image: radial-gradient(ellipse at center, black 75%, transparent 100%);
            mask-image: radial-gradient(ellipse at center, black 75%, transparent 100%);
            animation: levitate 6s ease-in-out infinite;
            filter: drop-shadow(0 20px 40px rgba(63, 41, 27, 0.15));
            border-radius: 0 !important;
        }

        .coverflow-container {
            perspective: 1000px;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
            height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .coverflow-track {
            position: relative;
            width: 300px;
            height: 350px;
            transform-style: preserve-3d;
            transition: transform 0.5s ease-out;
        }
        .coverflow-card {
            position: absolute;
            width: 280px;
            height: 320px;
            left: 10px;
            top: 15px;
            background: var(--bg-soft, #FFFBF5);
            border: 1px solid var(--bg-taupe, #E9DCC9);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 10px 30px rgba(63, 41, 27, 0.1);
            transition: all 0.5s ease;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            backface-visibility: hidden;
            cursor: grab;
        }
        .coverflow-card:active { cursor: grabbing; }
        .coverflow-card.active {
            transform: translateZ(100px) scale(1.05);
            border-color: var(--gold, #C9904E);
            z-index: 10;
            opacity: 1;
        }
        .coverflow-card.prev { transform: translateX(-180px) translateZ(-50px) rotateY(25deg); opacity: 0.6; z-index: 5; }
        .coverflow-card.next { transform: translateX(180px) translateZ(-50px) rotateY(-25deg); opacity: 0.6; z-index: 5; }
        .coverflow-card.hidden { transform: translateZ(-200px) rotateY(45deg); opacity: 0; pointer-events: none; }
        
        .coverflow-nav {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-top: 24px;
        }
        .coverflow-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--bg-taupe, #E9DCC9);
            cursor: pointer;
            transition: background 0.3s;
        }
        .coverflow-dot.active { background: var(--gold, #C9904E); }

        .bas-relief-svg {
            position: absolute;
            pointer-events: none;
            opacity: 0.08;
            z-index: 0;
            filter: url(#basRelief);
        }

        #cookie-banner {
            position: fixed;
            bottom: 24px;
            left: 24px;
            right: 24px;
            max-width: 400px;
            background: var(--bg-soft, #FFFBF5);
            border: 1px solid var(--bg-taupe, #E9DCC9);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(63, 41, 27, 0.15);
            z-index: 9999;
            display: none;
            font-family: 'Manrope', sans-serif;
            font-size: 14px;
            color: var(--deep-choco, #3F291B);
        }
        #cookie-banner.show { display: block; animation: slideUp 0.5s ease; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        #lightbox {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(63, 41, 27, 0.9);
            z-index: 10000;
            display: none;
            justify-content: center;
            align-items: center;
            cursor: zoom-out;
        }
        #lightbox img {
            max-width: 90%;
            max-height: 90%;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .legal-checkbox {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 12px;
            color: var(--deep-choco, #3F291B);
            margin-top: 12px;
            opacity: 0.8;
        }
        .legal-checkbox input { margin-top: 3px; accent-color: var(--gold, #C9904E); }
        .footer-legal {
            font-size: 12px;
            color: var(--deep-choco, #3F291B);
            opacity: 0.6;
            margin-top: 24px;
            line-height: 1.6;
        }
        .footer-legal a { color: var(--gold, #C9904E); text-decoration: underline; cursor: pointer; }

        #legalModal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(63, 41, 27, 0.8);
            z-index: 10001;
            display: none;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        #legalModalContent {
            background: var(--bg-soft, #FFFBF5);
            width: 100%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            border-radius: 24px;
            padding: 32px;
            position: relative;
            color: var(--deep-choco, #3F291B);
        }
        #legalModalClose {
            position: absolute;
            top: 16px; right: 16px;
            background: none; border: none;
            font-size: 24px; cursor: pointer;
            color: var(--deep-choco, #3F291B);
        }

        .lusion-sec {
            width: 100%;
            max-width: 800px;
            margin: -40px auto 60px;
            height: 300px;
            border-radius: 32px;
            background: linear-gradient(135deg, var(--bg-milk, #F7EFE4), var(--bg-taupe, #E9DCC9));
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 40px rgba(255,255,255,0.5), 0 20px 40px rgba(63, 41, 27, 0.1);
            z-index: 5;
        }
        #lusion-canvas { width: 100%; height: 100%; display: block; }
        .lusion-overlay {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            pointer-events: none;
            color: var(--deep-choco, #3F291B);
        }
        .lusion-overlay h3 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            margin: 0;
            font-weight: 600;
        }
    `;
    document.head.appendChild(patchStyles);

    // ========================================================================
    // 4. ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ЗАГРУЗКИ DOM
    // ========================================================================

    document.addEventListener('DOMContentLoaded', function() {
        applyPhotoOverrides();

        const floatingCard = document.querySelector('.hero-floating-card');
        if (floatingCard) floatingCard.remove();

        replaceGiftIcon();

        const hero = document.querySelector('.hero');
        const goals = document.querySelector('.goals-sec');
        if (hero && goals) {
            const lusionSec = document.createElement('div');
            lusionSec.className = 'lusion-sec';
            lusionSec.innerHTML = `
                <canvas id="lusion-canvas"></canvas>
                <div class="lusion-overlay">
                    <h3>Двигай мышкой ✦</h3>
                </div>
            `;
            hero.parentNode.insertBefore(lusionSec, goals);
            initLusion3D();
        }

        injectBasReliefs();
        rebuildReviews();
        rebuildCerts();
        rebuildStepsCarousel();
        injectLegalElements();
        interceptForms();
    });

    // ========================================================================
    // 5. ФУНКЦИОНАЛЬНЫЕ БЛОКИ
    // ========================================================================

    function replaceGiftIcon() {
        document.querySelectorAll('.btn-gold, .form-gift, #contactFormatSelect option, .step-item, #bookingModal').forEach(function(el) {
            if (el.textContent.includes('🎁') || el.innerHTML.includes('🎁')) {
                el.innerHTML = el.innerHTML.replace(/🎁/g, SVG_DUMBBELL_BOW);
            }
        });
        const giftArt = document.querySelector('.gift-art .gift-svg');
        if (giftArt) {
            giftArt.innerHTML = `
                <svg viewBox="0 0 200 120" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="goldGrad2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#E0A862"/>
                            <stop offset="100%" stop-color="#C9904E"/>
                        </linearGradient>
                    </defs>
                    <g class="sp" style="animation: levitate 4s ease-in-out infinite;">
                        <rect x="20" y="40" width="30" height="40" rx="8" fill="url(#goldGrad2)"/>
                        <rect x="150" y="40" width="30" height="40" rx="8" fill="url(#goldGrad2)"/>
                        <rect x="50" y="55" width="100" height="10" rx="5" fill="url(#goldGrad2)"/>
                        <path d="M100 55 C 80 30, 50 40, 60 65 C 50 40, 30 50, 40 75 C 60 85, 80 75, 100 65 C 120 75, 140 85, 160 75 C 170 50, 150 40, 140 65 C 150 40, 120 30, 100 55 Z" fill="#FFF1D6" stroke="#C9904E" stroke-width="2"/>
                        <circle cx="100" cy="65" r="8" fill="#C9904E"/>
                    </g>
                </svg>
            `;
        }
    }

    function initLusion3D() {
        if (window.THREE) {
            buildThreeScene();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = buildThreeScene;
            document.head.appendChild(script);
        }
    }

    function buildThreeScene() {
        const canvas = document.getElementById('lusion-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.background = null; 

        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xE0A862, 0.8);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);
        const pointLight = new THREE.PointLight(0xC9904E, 1, 10);
        pointLight.position.set(-2, 3, 2);
        scene.add(pointLight);

        const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xC9904E, metalness: 0.7, roughness: 0.2, clearcoat: 1.0 });
        const chocoMat = new THREE.MeshPhysicalMaterial({ color: 0x3F291B, metalness: 0.1, roughness: 0.8 });
        const milkMat = new THREE.MeshPhysicalMaterial({ color: 0xF7EFE4, metalness: 0.1, roughness: 0.5, transmission: 0.1 });

        const objects = [];
        const geometries = [
            new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16),
            new THREE.SphereGeometry(0.4, 16, 16),
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            new THREE.TorusGeometry(0.4, 0.1, 8, 16)
        ];

        for (let i = 0; i < 20; i++) {
            const geom = geometries[Math.floor(Math.random() * geometries.length)];
            const mat = [goldMat, chocoMat, milkMat][Math.floor(Math.random() * 3)];
            const mesh = new THREE.Mesh(geom, mat);
            
            mesh.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 2
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            
            if (geom.type === 'CylinderGeometry') {
                mesh.rotation.z = Math.PI / 2;
                const weight1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.4), goldMat);
                weight1.position.x = -0.8;
                mesh.add(weight1);
                const weight2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.4), goldMat);
                weight2.position.x = 0.8;
                mesh.add(weight2);
            }

            mesh.userData = {
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, 0),
                rotVelocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0)
            };
            
            scene.add(mesh);
            objects.push(mesh);
        }

        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        let targetX = 0, targetY = 0;

        canvas.addEventListener('mousemove', function(e) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            targetX = mouse.x * 2;
            targetY = mouse.y * 2;
        });

        function animate() {
            requestAnimationFrame(animate);

            objects.forEach(function(obj) {
                obj.position.add(obj.userData.velocity);
                obj.rotation.x += obj.userData.rotVelocity.x;
                obj.rotation.y += obj.userData.rotVelocity.y;

                raycaster.setFromCamera(mouse, camera);
                const dx = obj.position.x - targetX;
                const dy = obj.position.y - targetY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 1.5) {
                    const force = (1.5 - dist) * 0.05;
                    obj.userData.velocity.x += (dx / dist) * force;
                    obj.userData.velocity.y += (dy / dist) * force;
                }

                obj.userData.velocity.multiplyScalar(0.95);
                obj.userData.rotVelocity.multiplyScalar(0.95);

                if (Math.abs(obj.position.x) > 3) obj.userData.velocity.x *= -1;
                if (Math.abs(obj.position.y) > 2) obj.userData.velocity.y *= -1;
            });

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', function() {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });
    }

    function injectBasReliefs() {
        const positions = [
            '.hero', '.goals-sec', '.cases-sec', '.gift-sec', '.reviews-sec',
            '.about-sec', '.services-sec', '.approach-sec', '.faq-sec', '.contacts-sec',
            'footer', '.hero-visual', '.about-photo-main', '.cases-grid', '.services-grid'
        ];

        const reliefSVGs = [
            '<path d="M10,30 Q30,10 50,30 T90,30" stroke="#3F291B" stroke-width="8" fill="none" stroke-linecap="round"/>',
            '<rect x="20" y="20" width="60" height="60" rx="10" stroke="#3F291B" stroke-width="6" fill="none"/>',
            '<circle cx="50" cy="50" r="30" stroke="#3F291B" stroke-width="8" fill="none"/>',
            '<path d="M20,70 L40,30 L60,70 Z" stroke="#3F291B" stroke-width="6" fill="none"/>',
            '<rect x="10" y="40" width="80" height="20" rx="10" stroke="#3F291B" stroke-width="6" fill="none"/>'
        ];

        positions.forEach(function(selector, index) {
            const target = document.querySelector(selector);
            if (target) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("class", "bas-relief-svg");
                svg.setAttribute("viewBox", "0 0 100 100");
                svg.setAttribute("width", "150");
                svg.setAttribute("height", "150");
                svg.style.right = (index % 2 === 0 ? '5%' : 'auto');
                svg.style.left = (index % 2 !== 0 ? '5%' : 'auto');
                svg.style.top = (20 + (index * 5) % 60) + '%';
                svg.innerHTML = '<defs>' + SVG_BAS_RELIEF_FILTER + '</defs><g filter="url(#basRelief)">' + reliefSVGs[index % reliefSVGs.length] + '</g>';
                
                if (getComputedStyle(target).position === 'static') {
                    target.style.position = 'relative';
                }
                target.appendChild(svg);
            }
        });
    }

    function rebuildReviews() {
        const reviewsContainer = document.querySelector('.reviews-grid') || document.querySelector('.reviews-sec');
        if (!reviewsContainer || !window.SITE_DATA || !window.SITE_DATA.reviews) return;

        reviewsContainer.innerHTML = '';
        
        window.SITE_DATA.reviews.forEach(function(review, idx) {
            const card = document.createElement('div');
            card.className = 'review-card';
            card.style.cssText = 'background: var(--bg-soft); border-radius: 24px; padding: 24px; border: 1px solid var(--bg-taupe); text-align: center; cursor: pointer; transition: transform 0.3s;';
            card.onmouseover = function() { card.style.transform = 'translateY(-5px)'; };
            card.onmouseout = function() { card.style.transform = 'translateY(0)'; };
            
            const imgSrc = review.photo || review.avatar || 'photos/review-1.jpg';
            
            card.innerHTML = `
                <div style="font-family: 'Cormorant Garamond'; font-size: 20px; font-weight: 600; color: var(--deep-choco); margin-bottom: 8px;">${review.name}</div>
                <div style="font-size: 14px; color: var(--gold); margin-bottom: 16px;">${review.result || 'Результат'}</div>
                <img src="${imgSrc}" alt="Отзыв ${review.name}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 12px; border: 1px solid var(--bg-taupe);" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'">
                <div style="margin-top: 12px; font-size: 12px; color: var(--deep-choco); opacity: 0.6;">Нажмите для увеличения</div>
            `;
            
            card.onclick = function() { openLightbox(imgSrc); };
            reviewsContainer.appendChild(card);
        });
    }

    function rebuildCerts() {
        const certsContainer = document.querySelector('#about-certs') || document.querySelector('.certs-grid');
        if (!certsContainer || !window.SITE_DATA || !window.SITE_DATA.certs) return;

        certsContainer.innerHTML = '';
        certsContainer.style.display = 'grid';
        certsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
        certsContainer.style.gap = '24px';

        window.SITE_DATA.certs.forEach(function(cert, idx) {
            const imgSrc = cert.image || ('photos/cert-' + (idx + 1) + '.jpg');
            const item = document.createElement('div');
            item.style.cssText = 'cursor: pointer; border-radius: 16px; overflow: hidden; border: 1px solid var(--bg-taupe); transition: transform 0.3s;';
            item.onmouseover = function() { item.style.transform = 'scale(1.03)'; };
            item.onmouseout = function() { item.style.transform = 'scale(1)'; };
            
            item.innerHTML = `
                <img src="${imgSrc}" alt="${cert.title || 'Сертификат'}" style="width: 100%; height: 250px; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1589330694653-4d5c953217e2?w=400&h=500&fit=crop'">
                <div style="padding: 12px; background: var(--bg-soft); font-size: 14px; color: var(--deep-choco); text-align: center;">${cert.title || 'Сертификат'}</div>
            `;
            item.onclick = function() { openLightbox(imgSrc); };
            certsContainer.appendChild(item);
        });
    }

    function rebuildStepsCarousel() {
        const stepsContainer = document.getElementById('stepsContainer');
        if (!stepsContainer || !window.SITE_DATA || !window.SITE_DATA.steps) return;

        stepsContainer.innerHTML = `
            <div class="coverflow-container">
                <div class="coverflow-track" id="coverflowTrack"></div>
            </div>
            <div class="coverflow-nav" id="coverflowNav"></div>
        `;

        const track = document.getElementById('coverflowTrack');
        const nav = document.getElementById('coverflowNav');
        let currentIndex = 0;
        const total = window.SITE_DATA.steps.length;

        window.SITE_DATA.steps.forEach(function(step, idx) {
            const card = document.createElement('div');
            card.className = 'coverflow-card ' + (idx === 0 ? 'active' : (idx === 1 ? 'next' : 'hidden'));
            card.innerHTML = `
                <div style="font-family: 'Cormorant Garamond'; font-size: 48px; color: var(--gold); opacity: 0.3; margin-bottom: 16px;">0${idx + 1}</div>
                <h3 style="font-family: 'Cormorant Garamond'; font-size: 24px; color: var(--deep-choco); margin: 0 0 12px;">${step.title}</h3>
                <p style="font-size: 15px; color: var(--deep-choco); opacity: 0.8; line-height: 1.5; margin: 0;">${step.desc}</p>
            `;
            track.appendChild(card);

            const dot = document.createElement('div');
            dot.className = 'coverflow-dot ' + (idx === 0 ? 'active' : '');
            dot.onclick = function() { goToSlide(idx); };
            nav.appendChild(dot);
        });

        function updateCarousel() {
            const cards = track.querySelectorAll('.coverflow-card');
            const dots = nav.querySelectorAll('.coverflow-dot');
            
            cards.forEach(function(card, idx) {
                card.className = 'coverflow-card';
                if (idx === currentIndex) card.classList.add('active');
                else if (idx === (currentIndex - 1 + total) % total) card.classList.add('prev');
                else if (idx === (currentIndex + 1) % total) card.classList.add('next');
                else card.classList.add('hidden');
            });

            dots.forEach(function(dot, idx) {
                if (idx === currentIndex) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        let isDown = false;
        let startX = 0;
        
        track.addEventListener('mousedown', function(e) { isDown = true; startX = e.pageX; });
        track.addEventListener('mouseleave', function() { isDown = false; });
        track.addEventListener('mouseup', function(e) {
            if (!isDown) return;
            isDown = false;
            const diff = startX - e.pageX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goToSlide((currentIndex + 1) % total);
                else goToSlide((currentIndex - 1 + total) % total);
            }
        });
        
        track.addEventListener('touchstart', function(e) { startX = e.touches[0].pageX; });
        track.addEventListener('touchend', function(e) {
            const diff = startX - e.changedTouches[0].pageX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goToSlide((currentIndex + 1) % total);
                else goToSlide((currentIndex - 1 + total) % total);
            }
        });
    }

    function injectLegalElements() {
        if (!localStorage.getItem('cookie_accepted')) {
            const banner = document.createElement('div');
            banner.id = 'cookie-banner';
            banner.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                    <p style="margin: 0;">Мы используем файлы cookie для улучшения работы сайта. Продолжая использовать сайт, вы соглашаетесь с <a href="#" onclick="openLegalModal('privacy'); return false;" style="color: var(--gold); text-decoration: underline;">Политикой конфиденциальности</a>.</p>
                    <button onclick="acceptCookies()" style="background: var(--gold); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap;">Принять</button>
                </div>
            `;
            document.body.appendChild(banner);
            setTimeout(function() { banner.classList.add('show'); }, 1000);
        }

        const forms = document.querySelectorAll('#contacts form, #bookingModal form');
        forms.forEach(function(form) {
            const checkbox = document.createElement('label');
            checkbox.className = 'legal-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" required checked>
                <span>Я даю согласие на обработку персональных данных в соответствии с <a href="#" onclick="openLegalModal('privacy'); return false;" style="color: var(--gold);">Политикой конфиденциальности</a> и принимаю условия <a href="#" onclick="openLegalModal('offer'); return false;" style="color: var(--gold);">Оферты</a>.</span>
            `;
            form.appendChild(checkbox);
        });

        const footer = document.querySelector('footer');
        if (footer) {
            const legalDiv = document.createElement('div');
            legalDiv.className = 'footer-legal';
            
            const settings = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.settings) ? window.SITE_OVERRIDES.settings : {};
            const fio = settings.fio || 'Иванова Анастасия Сергеевна';
            const inn = settings.inn || '123456789012';
            
            legalDiv.innerHTML = `
                <p>Исполнитель: ${fio}, ИНН: ${inn}, Статус: Плательщик налога на профессиональный доход (НПД).</p>
                <p>* Instagram принадлежит компании Meta Platforms Inc., деятельность которой признана экстремистской и запрещена на территории РФ.</p>
                <p>
                    <a onclick="openLegalModal('privacy')">Политика конфиденциальности</a> | 
                    <a onclick="openLegalModal('offer')">Пользовательское соглашение (Оферта)</a>
                </p>
            `;
            footer.appendChild(legalDiv);
        }

        const modal = document.createElement('div');
        modal.id = 'legalModal';
        modal.innerHTML = `
            <div id="legalModalContent">
                <button id="legalModalClose" onclick="document.getElementById('legalModal').style.display='none'">&times;</button>
                <h2 id="legalModalTitle" style="font-family: 'Cormorant Garamond'; margin-top: 0;"></h2>
                <div id="legalModalBody" style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    window.openLightbox = function(src) {
        let lb = document.getElementById('lightbox');
        if (!lb) {
            lb = document.createElement('div');
            lb.id = 'lightbox';
            lb.innerHTML = '<img src="" alt="Увеличенное изображение">';
            lb.onclick = function() { lb.style.display = 'none'; };
            document.body.appendChild(lb);
        }
        lb.querySelector('img').src = src;
        lb.style.display = 'flex';
    };

    window.acceptCookies = function() {
        localStorage.setItem('cookie_accepted', 'true');
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.remove('show');
    };

    window.openLegalModal = function(type) {
        const modal = document.getElementById('legalModal');
        const title = document.getElementById('legalModalTitle');
        const body = document.getElementById('legalModalBody');
        
        const legalData = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.legal) ? window.SITE_OVERRIDES.legal : {};
        
        if (type === 'privacy') {
            title.textContent = 'Политика конфиденциальности';
            body.textContent = legalData.privacy || 'Здесь размещается полный текст Политики конфиденциальности в соответствии с 152-ФЗ. Вы можете отредактировать его в панели управления (admin.html).';
        } else {
            title.textContent = 'Пользовательское соглашение (Оферта)';
            body.textContent = legalData.offer || 'Здесь размещается полный текст Оферты для самозанятых (422-ФЗ). Вы можете отредактировать его в панели управления (admin.html).';
        }
        
        modal.style.display = 'flex';
    };

    function interceptForms() {
        const forms = document.querySelectorAll('#contacts form, #bookingModal form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Отправка...';
                btn.disabled = true;

                const legalData = (window.SITE_OVERRIDES && window.SITE_OVERRIDES.legal) ? window.SITE_OVERRIDES.legal : {};
                const yandexUrl = legalData.yandex_form;

                if (yandexUrl) {
                    fetch(yandexUrl, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors'
                    }).catch(function(err) {
                        console.warn('Ошибка отправки в Яндекс.Форму:', err);
                    });
                }

                setTimeout(function() {
                    alert('Спасибо! Ваша заявка успешно отправлена. Я свяжусь с вами в ближайшее время.');
                    form.reset();
                    btn.textContent = originalText;
                    btn.disabled = false;
                    
                    const modal = document.getElementById('bookingModal');
                    if (modal) modal.style.display = 'none';
                }, 1000);
            });
        });
    }

})();