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

// Key Interaction for Virtual Keyboard
window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    const virtualKeys = document.querySelectorAll('.key');
    virtualKeys.forEach(vk => {
        if (vk.textContent.toUpperCase() === key || 
            (key === 'BACKSPACE' && vk.classList.contains('backspace')) ||
            (key === 'TAB' && vk.classList.contains('tab')) ||
            (key === 'CAPSLOCK' && vk.classList.contains('caps')) ||
            (key === 'ENTER' && vk.classList.contains('enter')) ||
            (key === 'SHIFT' && (vk.classList.contains('shift-l') || vk.classList.contains('shift-r'))) ||
            (key === 'CONTROL' && vk.classList.contains('ctrl')) ||
            (key === 'ALT' && vk.classList.contains('alt')) ||
            (key === ' ' && vk.classList.contains('space'))) {
            vk.classList.add('pressed');
            setTimeout(() => vk.classList.remove('pressed'), 150);
        }
    });
});

// Sound simulation or visual feedback for Stream Deck
document.querySelectorAll('.deck-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.style.transform = 'translateZ(-5px)';
        setTimeout(() => btn.style.transform = '', 100);
        
        const skill = btn.getAttribute('data-skill');
        if (skill) {
            openSkillBrowser(skill);
        }
    });
});

const skillsData = {
    pytorch: {
        name: 'PyTorch',
        icon: 'devicon-pytorch-plain',
        subtitle: 'Deep Learning Framework',
        description: 'PyTorch is my go-to framework for building neural networks and deep learning models. I use it extensively for computer vision tasks, NLP models, and custom AI architectures. Its dynamic computation graph makes experimentation fast and intuitive.',
        experience: '3+',
        projects: '8',
        proficiency: '90%',
        relatedProjects: [
            'Face Emotion Detection - CNN model training',
            'Garuda AI - Neural surveillance system',
            'Custom embedding models for RAG'
        ]
    },
    nlp: {
        name: 'NLP',
        icon: 'fa-solid fa-language',
        subtitle: 'Natural Language Processing',
        description: 'Natural Language Processing is at the core of my AI work. I specialize in building LLM applications, text embeddings, semantic search, and conversational AI systems. From tokenization to transformer architectures, I handle the full NLP pipeline.',
        experience: '2+',
        projects: '6',
        proficiency: '85%',
        relatedProjects: [
            'Arabic Article Finder - Multi-language retrieval',
            'Crystal AI - Contextual reasoning engine',
            'Product Search AI - Semantic search system'
        ]
    },
    docker: {
        name: 'Docker',
        icon: 'devicon-docker-plain',
        subtitle: 'Containerization & DevOps',
        description: 'Docker is essential for my production deployments. I containerize AI microservices, manage multi-container applications with Docker Compose, and ensure consistent environments from development to production. All my FastAPI backends are Docker-ready.',
        experience: '2+',
        projects: '10',
        proficiency: '88%',
        relatedProjects: [
            'Crystal AI - Dockerized deployment',
            'RAG microservices architecture',
            'FastAPI inference backends'
        ]
    },
    tensorflow: {
        name: 'TensorFlow',
        icon: 'devicon-tensorflow-original',
        subtitle: 'ML Framework & Production',
        description: 'TensorFlow powers many of my production ML models. I use it for training CNNs, deploying models with TensorFlow Serving, and building end-to-end ML pipelines. Its ecosystem including TensorBoard and TF Lite enables comprehensive model management.',
        experience: '3+',
        projects: '5',
        proficiency: '82%',
        relatedProjects: [
            'Face Emotion Detection - CNN classifier',
            'Real-time object detection systems',
            'Model optimization for edge deployment'
        ]
    },
    network: {
        name: 'Network Architecture',
        icon: 'fa-solid fa-network-wired',
        subtitle: 'System Design & APIs',
        description: 'I design and implement robust network architectures for AI systems. This includes building RESTful APIs, WebSocket connections for real-time features, microservices communication patterns, and optimizing latency for production AI inference.',
        experience: '2+',
        projects: '7',
        proficiency: '80%',
        relatedProjects: [
            'Multi-service RAG architecture',
            'Real-time surveillance API',
            'Distributed embedding pipelines'
        ]
    },
    python: {
        name: 'Python',
        icon: 'devicon-python-plain',
        subtitle: 'Primary Development Language',
        description: 'Python is my primary language for AI/ML development. I write clean, efficient, and well-documented code. From data processing with Pandas to building FastAPI backends, Python enables me to move quickly from prototype to production.',
        experience: '4+',
        projects: '15+',
        proficiency: '95%',
        relatedProjects: [
            'All AI/ML projects',
            'FastAPI microservices',
            'Data analysis & visualization'
        ]
    }
};

function openSkillBrowser(skillKey) {
    const skill = skillsData[skillKey];
    if (!skill) return;

    const screenDefault = document.getElementById('screen-default');
    const screenBrowser = document.getElementById('screen-browser');
    const browserUrl = document.getElementById('browser-url');
    const browserContent = document.getElementById('browser-content');

    screenDefault.classList.add('hidden');
    screenBrowser.classList.add('active');
    
    browserUrl.textContent = `https://skills.divyanshu.dev/${skillKey}`;
    
    browserContent.innerHTML = `
        <div class="skill-page">
            <div class="skill-header">
                <div class="skill-icon-large">
                    <i class="${skill.icon}"></i>
                </div>
                <div class="skill-title-section">
                    <h2>${skill.name}</h2>
                    <span class="skill-subtitle">${skill.subtitle}</span>
                </div>
            </div>
            
            <div class="skill-description">
                <p>${skill.description}</p>
            </div>
            
            <div class="skill-stats">
                <div class="stat-item">
                    <span class="stat-value">${skill.experience}</span>
                    <span class="stat-label">Years Exp</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${skill.projects}</span>
                    <span class="stat-label">Projects</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${skill.proficiency}</span>
                    <span class="stat-label">Proficiency</span>
                </div>
            </div>
            
            <div class="skill-projects">
                <h3><i class="fa-solid fa-folder-open"></i> Related Projects</h3>
                <div class="project-list">
                    ${skill.relatedProjects.map(p => `
                        <div class="project-item">
                            <i class="fa-solid fa-chevron-right"></i>
                            <span>${p}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function closeSkillBrowser() {
    const screenDefault = document.getElementById('screen-default');
    const screenBrowser = document.getElementById('screen-browser');
    
    screenBrowser.classList.remove('active');
    screenDefault.classList.remove('hidden');
}

document.getElementById('browser-close')?.addEventListener('click', closeSkillBrowser);

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