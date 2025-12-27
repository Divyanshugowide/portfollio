// Physics-based Neural Network Background & UI Interactions

const canvas = document.getElementById('neural-bg');
const ctx = canvas.getContext('2d');
const card = document.getElementById('card'); // Hero 3D card
const typedEl = document.getElementById('typed-sub');
const cursor = document.getElementById('custom-cursor');
const progressBar = document.getElementById('scroll-progress');

// Config
const PARTICLE_COUNT = 80;
const CONNECTION_DIST = 160;
const MOUSE_DIST = 250;

let width, height;
let particles = [];
let mouse = { x: -100, y: -100 };

// Resize
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Particle Class
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseAlpha = Math.random() * 0.3 + 0.1;
        this.alpha = this.baseAlpha;
        this.color = `rgba(56, 189, 248, ${this.alpha})`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce with wrap-around instead for smoother feel
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction (Soft pull/push)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < MOUSE_DIST) {
            const force = (MOUSE_DIST - dist) / MOUSE_DIST;
            this.vx += (dx / dist) * force * 0.02;
            this.vy += (dy / dist) * force * 0.02;
            this.alpha = Math.min(0.8, this.baseAlpha + force * 0.5);
        } else {
            this.alpha = this.baseAlpha;
        }

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.5) {
            this.vx *= 0.95;
            this.vy *= 0.95;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha})`;
        ctx.fill();
    }
}

// Init Particles
function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}
initParticles();

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECTION_DIST) {
                const opacity = (1 - dist / CONNECTION_DIST) * 0.4;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}
animate();

// UI Elements Tracking
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const cursorGlitch = document.querySelector('.cursor-glitch');

let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;
let lastX = 0, lastY = 0;

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    cursorX = e.clientX;
    cursorY = e.clientY;

    if (cursorDot) {
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
    }
    
    if (cursorGlitch) {
        cursorGlitch.style.left = cursorX + 'px';
        cursorGlitch.style.top = cursorY + 'px';
    }

    // Parallax Headers
    document.querySelectorAll('.panel h2').forEach(h2 => {
        const rect = h2.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) / 20;
        const dy = (e.clientY - centerY) / 20;
        h2.style.transform = `translate(${dx}px, ${dy}px)`;
    });
});

function updateCursor() {
    // Lerp for Ring
    ringX += (cursorX - ringX) * 0.15;
    ringY += (cursorY - ringY) * 0.15;

    if (cursorRing) {
        // Calculate Velocity for 3D Tilt
        const vx = cursorX - lastX;
        const vy = cursorY - lastY;
        const tiltX = Math.min(Math.max(vy * 0.5, -20), 20);
        const tiltY = Math.min(Math.max(-vx * 0.5, -20), 20);
        
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        cursorRing.style.transform = `translate(-50%, -50%) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    lastX = cursorX;
    lastY = cursorY;
    requestAnimationFrame(updateCursor);
}
updateCursor();

window.addEventListener('mousedown', () => cursor?.classList.add('click'));
window.addEventListener('mouseup', () => cursor?.classList.remove('click'));

// Hover Effects for Cursor
document.querySelectorAll('a, button, .tech-key, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
});

// Scroll Progress
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';
});

// Magnetic Elements
document.querySelectorAll('.links a, .resume-btn, .cta-row .btn, .cta-row .ghost').forEach(el => {
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
    });
});

// Tech Keyboard Glow Effect
const keyboard = document.querySelector('.tech-keyboard');
if (keyboard) {
    keyboard.addEventListener('mousemove', (e) => {
        const rect = keyboard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        keyboard.style.setProperty('--kb-x', `${x}px`);
        keyboard.style.setProperty('--kb-y', `${y}px`);
    });
}

// Spotlight Cards (Mouse Tracking Gradient)
document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Typing Effect
const phrases = [
    'AI Engineer',
    'Computer Vision',
    'LLM Specialist',
    'RAG Architect',
    'Full Stack Dev'
];
let tp = { i: 0, ch: 0, dir: 1 };

function typeTick() {
    if (!typedEl) return;
    const text = phrases[tp.i];
    tp.ch += tp.dir;

    if (tp.ch > text.length + 10) { // Wait at end
        tp.dir = -1;
        tp.ch = text.length;
    } else if (tp.ch < 0) {
        tp.dir = 1;
        tp.i = (tp.i + 1) % phrases.length;
        tp.ch = 0;
    }

    typedEl.textContent = text.slice(0, Math.max(0, tp.ch));
    let speed = 80;
    if (tp.dir === -1) speed = 40;
    if (tp.ch === text.length) speed = 2000; 

    setTimeout(typeTick, speed);
}
typeTick();

// 3D Hero Card Tilt
if (card) {
    const scene = document.getElementById('scene');
    scene.addEventListener('mousemove', (e) => {
        const rect = scene.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `
            perspective(1000px)
            rotateY(${mouseX * 12}deg)
            rotateX(${-mouseY * 12}deg)
            scale3d(1.02, 1.02, 1.02)
        `;
    });

    scene.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
    });
}

// Scroll Reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.panel, .exp, .project-card, .skill-category, .tech-keyboard').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// Modal Logic
const projectData = {
    garuda: { 
        title: 'Garuda AI — Neural Surveillance', 
        tags: ['AI', 'Computer Vision', 'Surveillance', 'Gemini 3 Pro'], 
        body: 'Garuda AI is an autonomous neural surveillance platform engineered for real-time threat detection, defence-grade monitoring, and precision analytics. From identifying human intrusion and hostile movements to alerting early fire ignition or drone activity, Garuda delivers superhuman situational awareness, 24/7. Built for industry, critical infrastructure, defence, and border security, it transforms ordinary cameras into intelligent vision systems—capable of understanding intent, predicting behavior, and capturing forensic-level evidence. Powered by Google Gemini 3 Pro AI.' 
    },
    nrrc: { title: 'Arabic Article Finder', tags: ['RAG', 'Embeddings', 'FastAPI'], body: 'Multi-stage reasoning engine for document parsing, embeddings, and retrieval with production microservices.' },
    crystal: { title: 'Crystal AI', tags: ['LLM', 'RAG', 'FastAPI', 'Docker'], body: 'Personal AI with long-term memory, contextual reasoning, and modular skills.' },
    face: { title: 'Face Emotion Detection', tags: ['OpenCV', 'TensorFlow'], body: 'Real-time CNN + OpenCV pipeline for seven emotion classes.' },
    finder: { title: 'Offline Article Finder', tags: ['FAISS', 'BM25'], body: 'FAISS + BM25 hybrid retrieval system using SentenceTransformer embeddings.' }
};
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalTags = document.getElementById('modalTags');

function openModal(key) {
    const d = projectData[key];
    if (d && modal) {
        modalTitle.textContent = d.title;
        modalBody.textContent = d.body;
        modalTags.innerHTML = d.tags.map(t => `<span class="skill-tag">${t}</span>`).join('');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden'; // Lock scroll
    }
}

document.querySelectorAll('.open-project').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const key = e.target.closest('.project-card').dataset.project;
        openModal(key);
    });
});

document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
    el.addEventListener('click', () => {
        modal.classList.add('hide');
        document.body.style.overflow = ''; // Unlock scroll
    });
});

// ===================================
// 3D DESKTOP SETUP - REFINED LOGIC
// ===================================

const setupContainer = document.querySelector('.setup-container');
const keyboard3d = document.getElementById('keyboard3d');
const mouse3d = document.getElementById('mouse3d');
const sidePad3d = document.getElementById('sidePad3d');
const monitorScreen = document.getElementById('monitorScreen');
const virtualCursor = document.getElementById('virtualCursor');
const cablesSvg = document.getElementById('cablesSvg');
const keyboardCable = document.getElementById('keyboardCable');
const mouseCable = document.getElementById('mouseCable');
const padCable = document.getElementById('padCable');

// Virtual Browser elements
const virtualBrowser = document.getElementById('virtualBrowser');
const closeBrowser = document.getElementById('closeBrowser');
const skillTitle = document.getElementById('skillTitle');
const skillDesc = document.getElementById('skillDesc');
const browserUrl = document.getElementById('browserUrl');

const skillDetails = {
    pytorch: {
        title: 'PyTorch',
        url: 'https://portfolio.ai/skills/pytorch',
        desc: '<p>Deep Learning research and production model development.</p><ul><li>Distributed training</li><li>TorchScript optimization</li><li>Custom Autograd functions</li></ul>'
    },
    nlp: {
        title: 'Natural Language Processing',
        url: 'https://portfolio.ai/skills/nlp',
        desc: '<p>Advanced text understanding and generation systems.</p><ul><li>Transformer architectures</li><li>Tokenization & Embeddings</li><li>Semantic Search (RAG)</li></ul>'
    },
    docker: {
        title: 'Docker',
        url: 'https://portfolio.ai/skills/docker',
        desc: '<p>Containerization and deployment workflows for production AI systems.</p><ul class="skill-list"><li>Multi-stage builds</li><li>GPU-accelerated containers</li><li>Microservices orchestration</li></ul>'
    },
    tensorflow: {
        title: 'TensorFlow',
        url: 'https://portfolio.ai/skills/tensorflow',
        desc: '<p>Scalable machine learning pipelines and mobile deployment.</p><ul><li>TF Data pipelines</li><li>TFLite for Edge AI</li><li>Keras functional API</li></ul>'
    },
    network: {
        title: 'Neural Networks',
        url: 'https://portfolio.ai/skills/networks',
        desc: '<p>Fundamental and advanced neural architecture design.</p><ul><li>CNNs for Vision</li><li>RNNs/LSTMs for Sequences</li><li>GANs & VAEs</li></ul>'
    }
};

let isDragging = null;
let dragOffset = { x: 0, y: 0 };
let peripheralPositions = {
    keyboard: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },
    pad: { x: 0, y: 0 }
};

// Initialize positions
function initSetupPositions() {
    if (!setupContainer) return;
    
    const containerRect = setupContainer.getBoundingClientRect();
    
    // Set initial keyboard position (centered)
    if (keyboard3d) {
        peripheralPositions.keyboard = {
            x: containerRect.width / 2 - keyboard3d.offsetWidth / 2,
            y: containerRect.height - 180
        };
    }
    
    // Set initial mouse position (right)
    if (mouse3d) {
        peripheralPositions.mouse = {
            x: containerRect.width - 250,
            y: containerRect.height - 160
        };
    }

    // Set initial pad position (left)
    if (sidePad3d) {
        peripheralPositions.pad = {
            x: 80,
            y: containerRect.height - 180
        };
    }
    
    updatePeripheralPositions();
    updateCables();
}

function updatePeripheralPositions() {
    if (keyboard3d) {
        keyboard3d.style.left = peripheralPositions.keyboard.x + 'px';
        keyboard3d.style.top = peripheralPositions.keyboard.y + 'px';
    }
    if (mouse3d) {
        mouse3d.style.left = peripheralPositions.mouse.x + 'px';
        mouse3d.style.top = peripheralPositions.mouse.y + 'px';
    }
    if (sidePad3d) {
        sidePad3d.style.left = peripheralPositions.pad.x + 'px';
        sidePad3d.style.top = peripheralPositions.pad.y + 'px';
    }
}

// Dragging Logic
function startDrag(e, element, type) {
    if (e.target.closest('.tech-key') || e.target.closest('.pad-btn') || 
        e.target.closest('.mouse-top') || e.target.closest('a')) {
        return;
    }
    
    e.preventDefault();
    isDragging = { element, type };
    element.classList.add('dragging');
    
    const rect = element.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragOffset = {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function onDrag(e) {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const containerRect = setupContainer.getBoundingClientRect();
    
    let newX = clientX - containerRect.left - dragOffset.x;
    let newY = clientY - containerRect.top - dragOffset.y;
    
    // Constrain to container
    const elementWidth = isDragging.element.offsetWidth;
    const elementHeight = isDragging.element.offsetHeight;
    
    newX = Math.max(-50, Math.min(newX, containerRect.width - elementWidth + 50));
    newY = Math.max(350, Math.min(newY, containerRect.height - elementHeight));
    
    peripheralPositions[isDragging.type] = { x: newX, y: newY };
    
    isDragging.element.style.left = newX + 'px';
    isDragging.element.style.top = newY + 'px';
    
    updateCables();
}

function endDrag() {
    if (isDragging) {
        isDragging.element.classList.remove('dragging');
        isDragging = null;
    }
}

// Cable Drawing
function updateCables() {
    if (!cablesSvg || !setupContainer) return;
    
    const containerRect = setupContainer.getBoundingClientRect();
    cablesSvg.setAttribute('width', containerRect.width);
    cablesSvg.setAttribute('height', containerRect.height);
    
    // Monitor connection point (stand neck area)
    const monitorCenterX = containerRect.width / 2;
    const monitorBottomY = 480; // Adjusted for new monitor height
    
    // Keyboard cable
    if (keyboard3d && keyboardCable) {
        const kbX = peripheralPositions.keyboard.x + keyboard3d.offsetWidth / 2;
        const kbY = peripheralPositions.keyboard.y + 20;
        keyboardCable.setAttribute('d', generateCablePath(kbX, kbY, monitorCenterX, monitorBottomY));
    }
    
    // Mouse cable
    if (mouse3d && mouseCable) {
        const mouseX = peripheralPositions.mouse.x + 30;
        const mouseY = peripheralPositions.mouse.y + 10;
        mouseCable.setAttribute('d', generateCablePath(mouseX, mouseY, monitorCenterX + 40, monitorBottomY));
    }

    // Pad cable
    if (sidePad3d && padCable) {
        const padX = peripheralPositions.pad.x + sidePad3d.offsetWidth / 2;
        const padY = peripheralPositions.pad.y + 20;
        padCable.setAttribute('d', generateCablePath(padX, padY, monitorCenterX - 40, monitorBottomY));
    }
}

function generateCablePath(startX, startY, endX, endY) {
    const cp1y = startY - 50;
    const cp2y = endY + 50;
    return `M${startX},${startY} C${startX},${cp1y} ${endX},${cp2y} ${endX},${endY}`;
}

// Side Pad Skills Logic
document.querySelectorAll('.pad-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const skill = btn.dataset.skill;
        const data = skillDetails[skill];
        if (data && virtualBrowser) {
            skillTitle.textContent = data.title;
            skillDesc.innerHTML = data.desc;
            browserUrl.textContent = data.url;
            virtualBrowser.classList.remove('hide');
            
            // Play a small click sound or haptic if desired
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 100);
        }
    });
});

if (closeBrowser) {
    closeBrowser.addEventListener('click', () => {
        virtualBrowser.classList.add('hide');
    });
}

// Monitor Screen Button Scrolling
document.querySelectorAll('.os-cta-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Event Listeners for Desktop Setup
if (keyboard3d) {
    keyboard3d.addEventListener('mousedown', (e) => startDrag(e, keyboard3d, 'keyboard'));
    keyboard3d.addEventListener('touchstart', (e) => startDrag(e, keyboard3d, 'keyboard'), { passive: false });
}
if (mouse3d) {
    mouse3d.addEventListener('mousedown', (e) => startDrag(e, mouse3d, 'mouse'));
    mouse3d.addEventListener('touchstart', (e) => startDrag(e, mouse3d, 'mouse'), { passive: false });
}
if (sidePad3d) {
    sidePad3d.addEventListener('mousedown', (e) => startDrag(e, sidePad3d, 'pad'));
    sidePad3d.addEventListener('touchstart', (e) => startDrag(e, sidePad3d, 'pad'), { passive: false });
}

document.addEventListener('mousemove', (e) => {
    onDrag(e);
    // Virtual cursor logic
    if (monitorScreen && virtualCursor) {
        const rect = monitorScreen.getBoundingClientRect();
        const isIn = e.clientX >= rect.left && e.clientX <= rect.right && 
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
        
        if (isIn) {
            virtualCursor.style.opacity = '1';
            const setupRect = setupContainer.getBoundingClientRect();
            virtualCursor.style.left = (e.clientX - setupRect.left) + 'px';
            virtualCursor.style.top = (e.clientY - setupRect.top) + 'px';
        } else {
            virtualCursor.style.opacity = '0';
        }
    }
});

document.addEventListener('touchmove', (e) => onDrag(e), { passive: false });
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

// Initial Load
window.addEventListener('load', () => {
    initSetupPositions();
    // Trigger typing effect from original script if needed
});

window.addEventListener('resize', initSetupPositions);