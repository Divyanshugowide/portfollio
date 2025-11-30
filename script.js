// Improved interactive 3D tilt, smooth scroll, reveal and tiny UI utilities
const card = document.getElementById('card');
const scene = document.getElementById('scene');
const typedEl = document.getElementById('typed-sub');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.links');

/* NAV toggle for mobile */
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('hide');
    });
}

/* Smooth scroll for internal links */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (ev) => {
        const href = a.getAttribute('href');
        if (href.length > 1) {
            ev.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* Typing effect for hero subtitle */
const phrases = [
    'AI Engineer — LLMs · RAG · Deployments',
    'Embeddings · Retrieval Systems · Production Microservices',
    'TensorFlow · OpenCV · Scalable Pipelines'
];
let tp = { i: 0, ch: 0, dir: 1 };

function typeTick() {
    const text = phrases[tp.i];
    tp.ch += tp.dir;
    if (tp.ch > text.length) {
        tp.dir = -1;
        tp.ch = text.length;
        setTimeout(typeTick, 900);
        return;
    }
    if (tp.ch < 0) {
        tp.dir = 1;
        tp.i = (tp.i + 1) % phrases.length;
        tp.ch = 0;
    }
    typedEl.textContent = text.slice(0, tp.ch);
    setTimeout(typeTick, tp.dir > 0 ? 60 : 28);
}
typeTick();

/* Smooth 3D tilt with RAF loop */
let mouseX = 0,
    mouseY = 0,
    targetX = 0,
    targetY = 0,
    rafId = null;
scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    // parallax orbs
    document.querySelectorAll('.orb').forEach((orb, i) => {
        const depth = (i + 1) * 10;
        orb.style.transform = `translate3d(${mouseX * depth * -1}px, ${mouseY * depth}px, 0) scale(${1 - i*0.03})`;
    });
    if (!rafId) rafLoop();
});
scene.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
    document.querySelectorAll('.orb').forEach(o => o.style.transform = '');
});

function rafLoop() {
    targetX += (mouseX - targetX) * 0.1;
    targetY += (mouseY - targetY) * 0.1;
    const rx = (-targetY * 10).toFixed(2);
    const ry = (targetX * 18).toFixed(2);
    const floatY = Math.sin(Date.now() / 900) * 6;
    card.style.transform = `translateY(${floatY}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    rafId = requestAnimationFrame(rafLoop);
}

/* Scroll reveal using IntersectionObserver */
const revealables = document.querySelectorAll('.panel, .exp, .project-card, .skill');
const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.12 });
revealables.forEach(r => {
    r.classList.add('reveal');
    obs.observe(r)
});

/* Accessibility: reset transforms on focus */
card.addEventListener('focus', () => {
    mouseX = 0;
    mouseY = 0;
});

/* Project modal logic */
const projectData = {
    nrrc: {
        title: 'NRRC AI — GoWide',
        body: 'Multi-stage reasoning engine that performs tokenizer-aware parsing, document chunking, embeddings generation, and layered retrieval with structured outputs and microservice orchestration for inference and indexing.',
        tags: ['RAG', 'Embeddings', 'FastAPI']
    },
    chatbot: {
        title: 'Prototype AI Chatbot',
        body: 'Enterprise-ready chatbot with intent detection, session memory, vector search, and RAG pipelines. Dockerized as microservices for easy deployment and scaling.',
        tags: ['RAG', 'Embeddings', 'Docker']
    },
    face: {
        title: 'Face Emotion Detection',
        body: 'Real-time CNN-based emotion detector integrated with OpenCV for webcam capture, dataset labeling tools and training pipeline in TensorFlow/Keras.',
        tags: ['OpenCV', 'TensorFlow']
    },
    finder: {
        title: 'Offline Article Finder',
        body: 'Hybrid FAISS + BM25 retrieval system using SentenceTransformer embeddings and a lightweight FastAPI backend for local inference and research workflows.',
        tags: ['FAISS', 'BM25']
    }
};

const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalTags = document.getElementById('modalTags');

function openModal(key) {
    const d = projectData[key];
    if (!d) return;
    modalTitle.textContent = d.title;
    modalBody.textContent = d.body;
    modalTags.innerHTML = '';
    d.tags.forEach(t => {
        const s = document.createElement('span');
        s.textContent = t;
        s.style.marginRight = '8px';
        s.className = 'tag';
        modalTags.appendChild(s);
    });
    modal.classList.remove('hide');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    modal.classList.add('hide');
    modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.open-project').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        const key = card && card.dataset.project;
        if (key) openModal(key);
    });
});

// close handlers
document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
    el.addEventListener('click', closeModal);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* Contact form simple validation */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const name = contactForm.querySelector('input[type="text"]').value.trim();
        const email = contactForm.querySelector('input[type="email"]').value.trim();
        const msg = contactForm.querySelector('textarea').value.trim();
        if (!name || !email || !msg) {
            alert('Please fill name, email and message.');
            return;
        }
        // In this static build we just simulate success
        alert('Thanks — message simulated as sent.');
        contactForm.reset();
    });
}