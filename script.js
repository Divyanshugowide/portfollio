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
// 3D DESKTOP SETUP - Draggable Peripherals & Virtual Cursor
// ===================================

const setupContainer = document.querySelector('.setup-container');
const keyboard3d = document.getElementById('keyboard3d');
const mouse3d = document.getElementById('mouse3d');
const monitorScreen = document.getElementById('monitorScreen');
const virtualCursor = document.getElementById('virtualCursor');
const cablesSvg = document.getElementById('cablesSvg');
const keyboardCable = document.getElementById('keyboardCable');
const mouseCable = document.getElementById('mouseCable');

let isDragging = null;
let dragOffset = { x: 0, y: 0 };
let peripheralPositions = {
    keyboard: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 }
};

// Initialize positions
function initSetupPositions() {
    if (!setupContainer || !keyboard3d || !mouse3d) return;
    
    const containerRect = setupContainer.getBoundingClientRect();
    
    // Set initial keyboard position (centered bottom)
    peripheralPositions.keyboard = {
        x: containerRect.width / 2 - keyboard3d.offsetWidth / 2,
        y: containerRect.height - 220
    };
    
    // Set initial mouse position (right side)
    peripheralPositions.mouse = {
        x: containerRect.width - 280,
        y: containerRect.height - 180
    };
    
    updatePeripheralPositions();
    updateCables();
}

function updatePeripheralPositions() {
    if (keyboard3d) {
        keyboard3d.style.left = peripheralPositions.keyboard.x + 'px';
        keyboard3d.style.top = peripheralPositions.keyboard.y + 'px';
        keyboard3d.style.transform = 'translateZ(0)';
    }
    if (mouse3d) {
        mouse3d.style.left = peripheralPositions.mouse.x + 'px';
        mouse3d.style.top = peripheralPositions.mouse.y + 'px';
    }
}

// Dragging Logic
function startDrag(e, element, type) {
    if (e.target.closest('.tech-key') || e.target.closest('.mouse-left-btn') || 
        e.target.closest('.mouse-right-btn') || e.target.closest('.mouse-scroll')) {
        return;
    }
    
    e.preventDefault();
    isDragging = { element, type };
    element.classList.add('dragging');
    
    const rect = element.getBoundingClientRect();
    const containerRect = setupContainer.getBoundingClientRect();
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
    
    newX = Math.max(0, Math.min(newX, containerRect.width - elementWidth));
    newY = Math.max(300, Math.min(newY, containerRect.height - elementHeight));
    
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
    if (!cablesSvg || !keyboardCable || !mouseCable || !setupContainer) return;
    
    const containerRect = setupContainer.getBoundingClientRect();
    cablesSvg.setAttribute('width', containerRect.width);
    cablesSvg.setAttribute('height', containerRect.height);
    
    // Monitor connection point (center bottom of stand)
    const monitorCenterX = containerRect.width / 2;
    const monitorBottomY = 550;
    
    // Keyboard cable
    if (keyboard3d) {
        const kbRect = keyboard3d.getBoundingClientRect();
        const kbX = peripheralPositions.keyboard.x + keyboard3d.offsetWidth;
        const kbY = peripheralPositions.keyboard.y + keyboard3d.offsetHeight / 2;
        
        const kbPath = generateCablePath(kbX, kbY, monitorCenterX, monitorBottomY);
        keyboardCable.setAttribute('d', kbPath);
    }
    
    // Mouse cable
    if (mouse3d) {
        const mouseX = peripheralPositions.mouse.x + mouse3d.offsetWidth / 2;
        const mouseY = peripheralPositions.mouse.y;
        
        const mousePath = generateCablePath(mouseX, mouseY, monitorCenterX, monitorBottomY);
        mouseCable.setAttribute('d', mousePath);
    }
}

function generateCablePath(startX, startY, endX, endY) {
    const midY = (startY + endY) / 2;
    const controlOffset = Math.abs(startX - endX) * 0.3;
    
    return `M${startX},${startY} 
            Q${startX},${midY + 30} ${(startX + endX) / 2},${midY + 50}
            Q${endX},${midY + 30} ${endX},${endY}`;
}

// Virtual Cursor on Screen
let virtualCursorPos = { x: 0, y: 0 };
let isMouseOverScreen = false;

function updateVirtualCursor(e) {
    if (!monitorScreen || !virtualCursor) return;
    
    const screenRect = monitorScreen.getBoundingClientRect();
    const x = e.clientX - screenRect.left;
    const y = e.clientY - screenRect.top;
    
    if (x >= 0 && x <= screenRect.width && y >= 0 && y <= screenRect.height) {
        isMouseOverScreen = true;
        virtualCursor.classList.add('active');
        virtualCursor.style.left = (screenRect.left + x - setupContainer.getBoundingClientRect().left) + 'px';
        virtualCursor.style.top = (screenRect.top + y - setupContainer.getBoundingClientRect().top) + 'px';
    } else {
        isMouseOverScreen = false;
        virtualCursor.classList.remove('active');
    }
}

// Event Listeners for Desktop Setup
if (keyboard3d) {
    keyboard3d.addEventListener('mousedown', (e) => startDrag(e, keyboard3d, 'keyboard'));
    keyboard3d.addEventListener('touchstart', (e) => startDrag(e, keyboard3d, 'keyboard'), { passive: false });
}

if (mouse3d) {
    mouse3d.addEventListener('mousedown', (e) => startDrag(e, mouse3d, 'mouse'));
    mouse3d.addEventListener('touchstart', (e) => startDrag(e, mouse3d, 'mouse'), { passive: false });
}

document.addEventListener('mousemove', (e) => {
    onDrag(e);
    updateVirtualCursor(e);
});
document.addEventListener('touchmove', (e) => onDrag(e), { passive: false });
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

// Mouse button clicks on 3D mouse
const mouseLeftBtn = document.querySelector('.mouse-left-btn');
const mouseRightBtn = document.querySelector('.mouse-right-btn');

if (mouseLeftBtn) {
    mouseLeftBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Simulate click on screen buttons
        if (isMouseOverScreen) {
            const screenBtns = monitorScreen.querySelectorAll('.monitor-btn');
            screenBtns.forEach(btn => {
                const rect = btn.getBoundingClientRect();
                const cursorRect = virtualCursor.getBoundingClientRect();
                if (cursorRect.left >= rect.left && cursorRect.left <= rect.right &&
                    cursorRect.top >= rect.top && cursorRect.top <= rect.bottom) {
                    btn.click();
                }
            });
        }
    });
}

// Key press effects
document.querySelectorAll('.tech-key').forEach(key => {
    key.addEventListener('click', (e) => {
        e.stopPropagation();
        key.style.transform = 'translateZ(2px) translateY(4px)';
        setTimeout(() => {
            key.style.transform = '';
        }, 150);
    });
});

// Initialize on load
window.addEventListener('load', () => {
    setTimeout(initSetupPositions, 100);
});

window.addEventListener('resize', () => {
    initSetupPositions();
});