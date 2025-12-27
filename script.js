// Physics-based Neural Network Background & UI Interactions

const canvas = document.getElementById('neural-bg');
const ctx = canvas.getContext('2d');
const card = document.getElementById('card'); // Hero 3D card
const typedEl = document.getElementById('typed-sub');

// Config
const PARTICLE_COUNT = 60;
const CONNECTION_DIST = 150;
const MOUSE_DIST = 200;

let width, height;
let particles = [];
let mouse = { x: null, y: null };

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
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.color = `rgba(56, 189, 248, ${Math.random() * 0.5 + 0.1})`; // Cyan-ish
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_DIST) {
                const forceDirectionX = dx / dist;
                const forceDirectionY = dy / dist;
                const force = (MOUSE_DIST - dist) / MOUSE_DIST;
                const directionX = forceDirectionX * force * 0.6; // Push strength
                const directionY = forceDirectionY * force * 0.6;
                this.vx -= directionX;
                this.vy -= directionY;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
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
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECTION_DIST) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dist / CONNECTION_DIST})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}
animate();

// Mouse Move for Canvas
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});


// --- UI INTERACTIONS ---

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

    // Smooth typing randomizer
    typedEl.textContent = text.slice(0, Math.max(0, tp.ch));
    let speed = 100;
    if (tp.dir === -1) speed = 50;
    if (tp.ch === text.length) speed = 1500; // Pause at full word

    setTimeout(typeTick, speed);
}
typeTick();


// 3D Hero Card Tilt (Simplified & Cleaner)
if (card) {
    const scene = document.getElementById('scene');
    scene.addEventListener('mousemove', (e) => {
        const rect = scene.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `
            perspective(1000px)
            rotateY(${mouseX * 10}deg)
            rotateX(${-mouseY * 10}deg)
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
}, { threshold: 0.1 });

document.querySelectorAll('.panel, .exp, .project-card, .skill-category').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});


// Mobile Menu
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.links');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

// Contact Form Animation & Logic
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.send-btn');
        const originalText = btn.innerHTML; // Save state

        // Basic Validation (HTML5 handles most)
        if (!contactForm.checkValidity()) return;

        // Trigger Fly Animation
        btn.classList.add('flying');

        // Simulate Network Request (or use Fetch for Formspree)
        // const formData = new FormData(contactForm);
        // fetch(contactForm.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });

        // Visual Success Delay (Waiting for flight)
        setTimeout(() => {
            btn.classList.remove('flying');
            btn.classList.add('success');
            contactForm.reset();

            // Revert button after 3 seconds
            setTimeout(() => {
                btn.classList.remove('success');
            }, 3000);
        }, 1500); // 1.5s matches animation duration
    });
}

// Modal Logic (Reused)
const projectData = {
    garuda: { 
        title: 'Garuda AI — Neural Surveillance', 
        tags: ['AI', 'Computer Vision', 'Surveillance', 'Gemini 3 Pro'], 
        body: 'Garuda AI is an autonomous neural surveillance platform engineered for real-time threat detection, defence-grade monitoring, and precision analytics. From identifying human intrusion and hostile movements to alerting early fire ignition or drone activity, Garuda delivers superhuman situational awareness, 24/7. Built for industry, critical infrastructure, defence, and border security, it transforms ordinary cameras into intelligent vision systems—capable of understanding intent, predicting behavior, and capturing forensic-level evidence. Powered by Google Gemini 3 Pro AI.' 
    },
    nrrc: { title: 'NRRC AI', tags: ['RAG', 'Embeddings'], body: 'Full-stack AI retrieval system.' },
    crystal: { title: 'Crystal AI', tags: ['LLM', 'FastAPI'], body: 'Personal assistant with memory.' },
    face: { title: 'Emotion Detection', tags: ['CV', 'TensorFlow'], body: 'Real-time emotion classification.' },
    finder: { title: 'Article Finder', tags: ['FAISS', 'Local'], body: 'Offline semantic search engine.' }
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
    }
}
document.querySelectorAll('.open-project').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const key = e.target.closest('.project-card').dataset.project;
        openModal(key);
    });
});
document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
    el.addEventListener('click', () => modal.classList.add('hide'));
});