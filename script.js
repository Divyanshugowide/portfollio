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
document.querySelectorAll('.skill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.style.transform = 'translateY(1px) scale(0.98)';
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
        subtitle: 'PostgreSQL, MongoDB, Vector DBs',
        description: 'I work with various database systems including PostgreSQL for structured data, MongoDB for document storage, and vector databases like Pinecone and ChromaDB for embedding storage. I design efficient schemas for AI applications.',
        experience: '3+',
        projects: '12',
        proficiency: '85%',
        relatedProjects: [
            'Vector storage for RAG systems',
            'Document indexing pipelines',
            'Metadata management systems'
        ]
    },
    faiss: {
        name: 'FAISS',
        icon: 'fa-solid fa-magnifying-glass-chart',
        subtitle: 'Vector Similarity Search',
        description: 'FAISS (Facebook AI Similarity Search) is my go-to library for efficient similarity search. I use it for building fast vector retrieval systems, implementing hybrid search with BM25, and optimizing embedding search at scale.',
        experience: '2+',
        projects: '5',
        proficiency: '82%',
        relatedProjects: [
            'Offline Article Finder - FAISS indexing',
            'Arabic Article Finder - Hybrid retrieval',
            'Product Search AI - Vector search'
        ]
    },
    bm25: {
        name: 'BM25',
        icon: 'fa-solid fa-ranking-star',
        subtitle: 'Lexical Search Algorithm',
        description: 'BM25 is a powerful lexical search algorithm I use for keyword-based retrieval. Combined with FAISS for semantic search, I build hybrid retrieval systems that leverage both exact matching and semantic understanding.',
        experience: '2+',
        projects: '4',
        proficiency: '80%',
        relatedProjects: [
            'Offline Article Finder - BM25 ranking',
            'Hybrid search systems',
            'Document retrieval pipelines'
        ]
    },
    embeddings: {
        name: 'Embeddings',
        icon: 'fa-solid fa-vector-square',
        subtitle: 'Text & Document Embeddings',
        description: 'I specialize in generating and managing embeddings using SentenceTransformers, OpenAI, and custom models. I design embedding pipelines for RAG systems, handle dimensionality reduction, and optimize for retrieval quality.',
        experience: '2+',
        projects: '8',
        proficiency: '88%',
        relatedProjects: [
            'Crystal AI - Custom embeddings',
            'Arabic Article Finder - Multilingual embeddings',
            'Product Search AI - E-commerce embeddings'
        ]
    },
    chunking: {
        name: 'Chunking',
        icon: 'fa-solid fa-cubes',
        subtitle: 'Document Chunking Strategies',
        description: 'Effective chunking is crucial for RAG systems. I implement various strategies including semantic chunking, recursive splitting, and overlap management. I optimize chunk sizes for retrieval accuracy and LLM context windows.',
        experience: '2+',
        projects: '6',
        proficiency: '85%',
        relatedProjects: [
            'Arabic Article Finder - Smart chunking',
            'Crystal AI - Context-aware splitting',
            'Document processing pipelines'
        ]
    },
    render: {
        name: 'Render',
        icon: 'fa-solid fa-cloud',
        subtitle: 'Cloud Deployment Platform',
        description: 'Render is my preferred platform for deploying AI services. I deploy FastAPI backends, Docker containers, and background workers. I handle auto-scaling, environment management, and continuous deployment from GitHub.',
        experience: '2+',
        projects: '8',
        proficiency: '85%',
        relatedProjects: [
            'Crystal AI deployment',
            'RAG service hosting',
            'API endpoint management'
        ]
    },
    vercel: {
        name: 'Vercel',
        icon: 'fa-solid fa-bolt',
        subtitle: 'Frontend & Serverless Deployment',
        description: 'Vercel powers my frontend deployments and serverless functions. I use it for Next.js applications, static sites, and edge functions. Its seamless GitHub integration enables rapid iteration and preview deployments.',
        experience: '2+',
        projects: '5',
        proficiency: '82%',
        relatedProjects: [
            'Portfolio website',
            'AI demo frontends',
            'Serverless API routes'
        ]
    },
    llms: {
        name: 'LLMs',
        icon: 'fa-solid fa-brain',
        subtitle: 'Large Language Models',
        description: 'I have extensive experience with various LLMs including Mistral 7B Instruct, Vicuna, Tulu-2, LLaMA 70B, and LLaMA 8B. I fine-tune models, implement prompt engineering, and deploy local inference servers.',
        experience: '2+',
        projects: '10',
        proficiency: '90%',
        relatedProjects: [
            'Crystal AI - Multi-model inference',
            'Garuda AI - Gemini integration',
            'Arabic Article Finder - LLM reasoning'
        ],
        models: ['Mistral 7B Instruct', 'Vicuna', 'Tulu-2', 'LLaMA 70B', 'LLaMA 8B']
    },
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
    
    let modelsSection = '';
    if (skill.models && skill.models.length > 0) {
        modelsSection = `
            <div class="skill-models">
                <h3><i class="fa-solid fa-microchip"></i> Models Experience</h3>
                <div class="models-list">
                    ${skill.models.map(m => `<span class="model-tag">${m}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
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
            
            ${modelsSection}
            
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