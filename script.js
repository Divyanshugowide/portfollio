const canvas = document.getElementById('neural-bg');
const ctx = canvas.getContext('2d');
const cursor = document.getElementById('custom-cursor');
const progressBar = document.getElementById('scroll-progress');

const PARTICLE_COUNT = 80;
const CONNECTION_DIST = 160;
const MOUSE_DIST = 250;

let width, height;
let particles = [];
let mouse = { x: -100, y: -100 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

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
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

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

function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}
initParticles();

function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

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

const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    cursorX = e.clientX;
    cursorY = e.clientY;

    if (cursorDot) {
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
    }
});

function updateCursor() {
    ringX += (cursorX - ringX) * 0.15;
    ringY += (cursorY - ringY) * 0.15;

    if (cursorRing) {
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
    }
    requestAnimationFrame(updateCursor);
}
updateCursor();

document.querySelectorAll('a, button, .key, .deck-btn, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
});

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';
});

document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

const projectData = {
    garuda: { 
        title: 'Garuda AI — Neural Surveillance', 
        tags: ['AI', 'Computer Vision', 'Surveillance', 'Gemini 3 Pro'], 
        body: 'Garuda AI is an autonomous neural surveillance platform engineered for real-time threat detection, defence-grade monitoring, and precision analytics. From identifying human intrusion and hostile movements to alerting early fire ignition or drone activity, Garuda delivers superhuman situational awareness, 24/7. Built for industry, critical infrastructure, defence, and border security.' 
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
        document.body.style.overflow = 'hidden';
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
        document.body.style.overflow = '';
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.panel, .exp, .project-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});