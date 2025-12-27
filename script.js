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
    llm: {
        name: 'LLM Experience',
        icon: 'fa-solid fa-brain',
        subtitle: 'Large Language Models',
        description: 'Extensive hands-on experience with various open-source and proprietary LLMs. I specialize in fine-tuning, prompt engineering, and deploying LLMs for production use cases including RAG systems, conversational AI, and reasoning tasks.',
        experience: '2+',
        projects: '8',
        proficiency: '90%',
        relatedProjects: [
            'Mistral 7B Instruct - RAG & reasoning tasks',
            'Vicuna - Conversational AI systems',
            'Tulu-2 - Instruction following',
            'LLaMA 70B - Complex reasoning pipelines',
            'LLaMA 8B - Efficient inference deployments'
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
    database: {
        name: 'Database',
        icon: 'fa-solid fa-database',
        subtitle: 'Data Storage & Management',
        description: 'Proficient in designing and managing databases for AI applications. I work with PostgreSQL for structured data, vector databases for embeddings, and optimize queries for high-performance retrieval in production systems.',
        experience: '3+',
        projects: '10+',
        proficiency: '85%',
        relatedProjects: [
            'PostgreSQL - Structured data storage',
            'Vector databases for embedding storage',
            'Database optimization for RAG systems'
        ]
    },
    embeddings: {
        name: 'Embeddings',
        icon: 'fa-solid fa-vector-square',
        subtitle: 'Vector Representations',
        description: 'Expert in generating and utilizing text embeddings for semantic search, similarity matching, and RAG systems. I work with SentenceTransformers, OpenAI embeddings, and custom embedding models for domain-specific applications.',
        experience: '2+',
        projects: '7',
        proficiency: '90%',
        relatedProjects: [
            'Arabic Article Finder - Multi-lingual embeddings',
            'Product Search AI - Semantic embeddings',
            'Custom embedding pipelines for RAG'
        ]
    },
    faiss: {
        name: 'FAISS',
        icon: 'fa-solid fa-magnifying-glass-chart',
        subtitle: 'Vector Similarity Search',
        description: 'FAISS (Facebook AI Similarity Search) is my go-to library for efficient similarity search and clustering of dense vectors. I use it to build scalable retrieval systems that handle millions of vectors with sub-millisecond query times.',
        experience: '2+',
        projects: '5',
        proficiency: '88%',
        relatedProjects: [
            'Offline Article Finder - FAISS indexing',
            'RAG retrieval optimization',
            'Large-scale document search systems'
        ]
    },
    bm25: {
        name: 'BM25',
        icon: 'fa-solid fa-filter',
        subtitle: 'Lexical Search Algorithm',
        description: 'BM25 is a powerful ranking function for keyword-based retrieval. I combine BM25 with dense retrieval (FAISS) to create hybrid search systems that leverage both lexical and semantic matching for superior recall and precision.',
        experience: '2+',
        projects: '4',
        proficiency: '85%',
        relatedProjects: [
            'Offline Article Finder - Hybrid retrieval',
            'Arabic Article Finder - BM25 + embeddings',
            'Document ranking systems'
        ]
    },
    chunking: {
        name: 'Chunking',
        icon: 'fa-solid fa-cubes',
        subtitle: 'Document Segmentation',
        description: 'Chunking is critical for RAG systems. I implement various strategies including fixed-size, semantic, and recursive chunking to optimize document retrieval. Proper chunking ensures context preservation and improves LLM response quality.',
        experience: '2+',
        projects: '6',
        proficiency: '87%',
        relatedProjects: [
            'RAG pipeline optimization',
            'PDF processing for AI systems',
            'Context-aware document splitting'
        ]
    },
    render: {
        name: 'Render',
        icon: 'fa-solid fa-cloud',
        subtitle: 'Cloud Deployment Platform',
        description: 'Render is my preferred platform for deploying AI backends and web services. I use it for hosting FastAPI applications, Docker containers, and background workers with easy scaling and automatic SSL.',
        experience: '1+',
        projects: '5',
        proficiency: '82%',
        relatedProjects: [
            'Crystal AI - Backend deployment',
            'FastAPI microservices hosting',
            'AI inference endpoints'
        ]
    },
    vercel: {
        name: 'Vercel',
        icon: 'fa-solid fa-triangle-exclamation',
        subtitle: 'Frontend & Serverless Platform',
        description: 'Vercel powers my frontend deployments and serverless functions. I use it for hosting React/Next.js applications, API routes, and edge functions with global CDN distribution and instant deployments.',
        experience: '1+',
        projects: '4',
        proficiency: '80%',
        relatedProjects: [
            'Portfolio website deployment',
            'Frontend applications',
            'Serverless API endpoints'
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

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const navActions = document.querySelector('.nav-actions');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('show');
        navActions.classList.toggle('show');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('show');
            navActions.classList.remove('show');
        });
    });
}

// Close menu on resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 767) {
        mobileMenuToggle?.classList.remove('active');
        navLinks?.classList.remove('show');
        navActions?.classList.remove('show');
    }
});