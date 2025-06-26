// ===== YEKUN 3D SAYT MÜHƏRRİKİ (LOQO PROPORSİYASI DÜZƏLİŞİ İLƏ) =====

if (window.matchMedia('(min-width: 1025px)').matches) {
    let scene, camera, webGLRenderer, css3DRenderer;
    let contentGroup = new THREE.Group();
    let sections = [];
    const sectionDistance = 950; 

    let particles, logoGroup;
    const mouse = new THREE.Vector2();
    let currentScrollY = 0;
    let targetScrollY = 0;

    function init() {
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000000, 100, 2500);
        
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 3000);
        camera.position.z = 900; 

        const webglContainer = document.getElementById('webgl-container');
        webGLRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        webglContainer.appendChild(webGLRenderer.domElement);
        
        const css3dContainer = document.getElementById('css3d-container');
        css3DRenderer = new THREE.CSS3DRenderer();
        css3DRenderer.setSize(window.innerWidth, window.innerHeight);
        css3dContainer.appendChild(css3DRenderer.domElement);

        createParticles();
        createLogoCloud();
        create3DContent();
        
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('wheel', onMouseWheel, { passive: false });
        window.addEventListener('mousemove', onMouseMove);

        createNavigation();
        animate();
    }

    function createParticles() {
        const particlesGeometry = new THREE.BufferGeometry;
        const count = 5000;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) { positions[i] = (Math.random() - 0.5) * 2500; }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({ size: 1.5, color: 0xaaaaee, blending: THREE.AdditiveBlending });
        particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
    }

    // DƏYİŞİKLİK: Bu funksiya loqoların orijinal proporsiyasını qorumaq üçün tamamilə yenidən yazıldı
    function createLogoCloud() {
        logoGroup = new THREE.Group();
        const textureLoader = new THREE.TextureLoader();
        const logos = ['hbomax-logo.png','images/mubi-logo','images/netflix-logo.png', 'images/prime-logo.png', 'images/youtube-logo.png', 'images/chatgpt-logo.png','images/disney-logo','images/canva-logo'];
        const basePlaneHeight = 25; // 3D səhnədəki loqoların baza hündürlüyü

        for (let i = 0; i < 40; i++) {
            const logoPath = logos[i % logos.length];
            
            // Hər bir teksturanı asinxron olaraq yükləyirik
            textureLoader.load(
                logoPath,
                // Funksiya yalnız şəkil tam yükləndikdən sonra işə düşür
                (texture) => {
                    // Yüklənmiş şəklin orijinal en/hündürlük nisbətini (aspect ratio) alırıq
                    const aspectRatio = texture.image.naturalWidth / texture.image.naturalHeight;
                    
                    // Orijinal nisbətə uyğun eni hesablayırıq
                    const planeWidth = basePlaneHeight * aspectRatio;
                    
                    // Düzgün nisbətdə yeni bir həndəsə (plane) yaradırıq
                    const geometry = new THREE.PlaneGeometry(planeWidth, basePlaneHeight);
                    
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        opacity: 0.7,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    });
                    
                    const mesh = new THREE.Mesh(geometry, material);
                    
                    // Obyekti təsadüfi bir mövqeyə yerləşdiririk
                    mesh.position.set(
                        (Math.random() - 0.5) * 800,
                        (Math.random() - 0.5) * 800,
                        (Math.random() - 0.5) * 800 - 150
                    );
                    mesh.rotation.y = Math.random() * Math.PI;
                    
                    logoGroup.add(mesh);
                }
            );
        }
        scene.add(logoGroup);
    }
    
    function create3DContent() {
        const sectionElements = document.querySelectorAll('.html-section');
        sectionElements.forEach((el, i) => {
            const object = new THREE.CSS3DObject(el);
            object.position.y = -i * sectionDistance;
            contentGroup.add(object);
            sections.push({ element: el, object3d: object });
        });
        scene.add(contentGroup);
    }

    function createNavigation() {
        const navLinksContainer = document.querySelector('.nav-links');
        sections.forEach((section, i) => {
            if (section.element.id) {
                const link = document.createElement('a');
                link.href = `#${section.element.id}`;
                link.textContent = section.element.id.charAt(0).toUpperCase() + section.element.id.slice(1);
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    targetScrollY = i * sectionDistance;
                });
                navLinksContainer.appendChild(link);
            }
        });
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    function onMouseWheel(event) {
        event.preventDefault();
        targetScrollY += event.deltaY * 0.8;
        const maxScroll = (sections.length - 1) * sectionDistance;
        targetScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));
    }
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function animate() {
        requestAnimationFrame(animate);
        currentScrollY += (targetScrollY - currentScrollY) * 0.07;
        contentGroup.position.y = currentScrollY;
        
        const parallaxX = mouse.x * 50;
        const parallaxY = -mouse.y * 50;
        camera.position.x += (parallaxX - camera.position.x) * 0.05;
        camera.position.y += (parallaxY - camera.position.y) * 0.05;
        
        const elapsedTime = Date.now() * 0.0001;
        logoGroup.rotation.y = elapsedTime * 0.5;
        if(particles) particles.rotation.y = -elapsedTime * 0.2;

        const currentSectionIndex = Math.round(currentScrollY / sectionDistance);
        document.querySelectorAll('.nav-links a').forEach((link, index) => {
            link.classList.toggle('active', index === currentSectionIndex);
        });
        webGLRenderer.render(scene, camera);
        css3DRenderer.render(scene, camera);
    }
    init();

} else {
    // ===== TELEFON VƏ PLANŞET ÜÇÜN 2D TƏCRÜBƏ =====
    document.getElementById('content-sections').style.display = 'block';
    document.body.style.overflow = 'auto';

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    const sectionsMobile = document.querySelectorAll('.html-section');
    sectionsMobile.forEach(section => {
        if(section.id) {
            const link = document.createElement('a');
            link.href = `#${section.id}`;
            link.textContent = section.id.charAt(0).toUpperCase() + section.id.slice(1);
            navLinks.appendChild(link);
        }
    });

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    const cards = document.querySelectorAll('.service-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    cards.forEach(card => observer.observe(card));
}
