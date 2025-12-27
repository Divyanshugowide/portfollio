import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

let scene, camera, renderer, controls;
let monitor, keyboard, mouse, skillPad, desk;
let ambientLight, pointLight1, pointLight2, spotLight;

const COLORS = {
    desk: 0x3d2a1c,
    deskMat: 0x0a0f1a,
    monitor: 0x1a1a2e,
    monitorScreen: 0x000000,
    keyboard: 0x1a1a2e,
    keys: 0x374151,
    keysHighlight: 0x38bdf8,
    mouse: 0x1a2744,
    skillPad: 0x1a1a2e,
    skillBtn: 0x0a0f1a,
    accent: 0x38bdf8,
    accent2: 0x818cf8,
    cable: 0x2d2d4a
};

function init() {
    const container = document.getElementById('desktop-scene');
    const canvas = document.getElementById('three-canvas');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.Fog(0x020617, 10, 50);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 1, 0);

    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minPolarAngle = Math.PI / 6;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    setupLights();
    createDesk();
    createMonitor();
    createKeyboard();
    createMouse();
    createSkillPad();
    createCables();

    window.addEventListener('resize', onWindowResize);
    container.addEventListener('mouseenter', () => { controls.autoRotate = false; });
    container.addEventListener('mouseleave', () => { controls.autoRotate = true; });

    animate();
}

function setupLights() {
    ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);

    pointLight1 = new THREE.PointLight(COLORS.accent, 1, 20);
    pointLight1.position.set(-5, 8, 5);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 1024;
    pointLight1.shadow.mapSize.height = 1024;
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(COLORS.accent2, 0.6, 15);
    pointLight2.position.set(5, 6, 3);
    scene.add(pointLight2);

    spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(0, 15, 5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    scene.add(spotLight);

    const screenGlow = new THREE.PointLight(COLORS.accent, 0.5, 8);
    screenGlow.position.set(0, 3.5, 1);
    scene.add(screenGlow);
}

function createDesk() {
    const deskGroup = new THREE.Group();

    const woodTexture = createWoodTexture();
    const deskGeometry = new THREE.BoxGeometry(16, 0.3, 8);
    const deskMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.7,
        metalness: 0.1
    });
    const deskTop = new THREE.Mesh(deskGeometry, deskMaterial);
    deskTop.position.y = 0;
    deskTop.receiveShadow = true;
    deskGroup.add(deskTop);

    const matGeometry = new THREE.BoxGeometry(12, 0.05, 6);
    const matMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.deskMat,
        roughness: 0.9,
        metalness: 0
    });
    const deskMat = new THREE.Mesh(matGeometry, matMaterial);
    deskMat.position.y = 0.18;
    deskMat.receiveShadow = true;
    deskGroup.add(deskMat);

    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 3, 16);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.3,
        metalness: 0.8
    });
    
    const legPositions = [
        [-7, -1.5, 3], [7, -1.5, 3], [-7, -1.5, -3], [7, -1.5, -3]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        deskGroup.add(leg);
    });

    scene.add(deskGroup);
    desk = deskGroup;
}

function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#3d2a1c');
    gradient.addColorStop(0.3, '#5c4230');
    gradient.addColorStop(0.6, '#4a3525');
    gradient.addColorStop(1, '#3d2a1c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 10 + Math.random() * 5);
        ctx.lineTo(512, i * 10 + Math.random() * 5);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
}

function createMonitor() {
    const monitorGroup = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(7, 4, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.monitor,
        roughness: 0.3,
        metalness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    monitorGroup.add(body);

    const bezelGeometry = new THREE.BoxGeometry(6.6, 3.7, 0.05);
    const bezelMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.1,
        metalness: 0.9
    });
    const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
    bezel.position.z = 0.16;
    monitorGroup.add(bezel);

    const screenGeometry = new THREE.PlaneGeometry(6.4, 3.5);
    const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a1628,
        emissive: 0x0a1628,
        emissiveIntensity: 0.3,
        roughness: 0.1,
        metalness: 0.9
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.17;
    monitorGroup.add(screen);

    const standNeckGeo = new THREE.BoxGeometry(0.4, 1.2, 0.3);
    const standMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.monitor,
        roughness: 0.3,
        metalness: 0.8
    });
    const standNeck = new THREE.Mesh(standNeckGeo, standMaterial);
    standNeck.position.set(0, -2.6, 0);
    standNeck.castShadow = true;
    monitorGroup.add(standNeck);

    const standBaseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.15, 32);
    const standBase = new THREE.Mesh(standBaseGeo, standMaterial);
    standBase.position.set(0, -3.25, 0);
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    monitorGroup.add(standBase);

    const ledGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    const ledMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.accent,
        emissive: COLORS.accent,
        emissiveIntensity: 2
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(0, -1.85, 0.16);
    monitorGroup.add(led);

    monitorGroup.position.set(0, 5.2, -2);
    scene.add(monitorGroup);
    monitor = monitorGroup;
}

function createKeyboard() {
    const kbGroup = new THREE.Group();

    const baseGeometry = new THREE.BoxGeometry(5.5, 0.3, 1.8);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.keyboard,
        roughness: 0.4,
        metalness: 0.6
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    kbGroup.add(base);

    const plateGeometry = new THREE.BoxGeometry(5.2, 0.08, 1.5);
    const plateMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.5,
        metalness: 0.4
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.y = 0.18;
    kbGroup.add(plate);

    const keyMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.keys,
        roughness: 0.6,
        metalness: 0.3
    });

    const keyRows = [
        { count: 14, width: 0.28, startX: -2.35 },
        { count: 14, width: 0.28, startX: -2.35 },
        { count: 13, width: 0.28, startX: -2.2 },
        { count: 12, width: 0.28, startX: -2.05 },
        { count: 8, width: 0.35, startX: -2.35 }
    ];

    keyRows.forEach((row, rowIndex) => {
        for (let i = 0; i < row.count; i++) {
            let keyWidth = row.width;
            if (rowIndex === 4 && i === 3) keyWidth = 1.6;
            
            const keyGeo = new THREE.BoxGeometry(keyWidth, 0.12, 0.28);
            const key = new THREE.Mesh(keyGeo, keyMaterial.clone());
            
            let xPos = row.startX + i * 0.34;
            if (rowIndex === 4 && i > 3) xPos += 1.2;
            
            key.position.set(xPos, 0.28, -0.55 + rowIndex * 0.32);
            key.castShadow = true;
            kbGroup.add(key);
        }
    });

    const glowGeometry = new THREE.PlaneGeometry(5.5, 1.8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.accent,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.1;
    kbGroup.add(glow);

    kbGroup.position.set(0, 0.4, 1.5);
    kbGroup.rotation.x = -0.08;
    scene.add(kbGroup);
    keyboard = kbGroup;
}

function createMouse() {
    const mouseGroup = new THREE.Group();

    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-0.35, -0.6);
    bodyShape.quadraticCurveTo(-0.4, 0, -0.3, 0.5);
    bodyShape.quadraticCurveTo(0, 0.7, 0.3, 0.5);
    bodyShape.quadraticCurveTo(0.4, 0, 0.35, -0.6);
    bodyShape.quadraticCurveTo(0, -0.7, -0.35, -0.6);

    const extrudeSettings = {
        steps: 2,
        depth: 0.25,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelSegments: 8
    };

    const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.mouse,
        roughness: 0.3,
        metalness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = -Math.PI / 2;
    body.castShadow = true;
    mouseGroup.add(body);

    const scrollGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16);
    const scrollMaterial = new THREE.MeshStandardMaterial({
        color: 0x0d0d1a,
        roughness: 0.2,
        metalness: 0.8
    });
    const scroll = new THREE.Mesh(scrollGeometry, scrollMaterial);
    scroll.rotation.x = Math.PI / 2;
    scroll.position.set(0, 0.2, 0.3);
    mouseGroup.add(scroll);

    const ledGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.05);
    const ledMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.accent,
        emissive: COLORS.accent,
        emissiveIntensity: 2
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(0, 0.15, -0.4);
    mouseGroup.add(led);

    mouseGroup.position.set(4, 0.25, 1.5);
    scene.add(mouseGroup);
    mouse = mouseGroup;
}

function createSkillPad() {
    const padGroup = new THREE.Group();

    const baseGeometry = new THREE.BoxGeometry(2.2, 0.25, 3);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.skillPad,
        roughness: 0.4,
        metalness: 0.6
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    padGroup.add(base);

    const btnMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.skillBtn,
        roughness: 0.3,
        metalness: 0.5,
        emissive: COLORS.accent,
        emissiveIntensity: 0.05
    });

    const rows = 4;
    const cols = 3;
    const btnSize = 0.5;
    const gap = 0.15;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const btnGeometry = new THREE.BoxGeometry(btnSize, 0.15, btnSize);
            const btn = new THREE.Mesh(btnGeometry, btnMaterial.clone());
            
            const x = (col - 1) * (btnSize + gap);
            const z = (row - 1.5) * (btnSize + gap);
            
            btn.position.set(x, 0.2, z);
            btn.castShadow = true;
            
            const edgeGeometry = new THREE.BoxGeometry(btnSize + 0.02, 0.02, btnSize + 0.02);
            const edgeMaterial = new THREE.MeshStandardMaterial({
                color: COLORS.accent,
                emissive: COLORS.accent,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.5
            });
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.position.set(x, 0.13, z);
            padGroup.add(edge);
            
            padGroup.add(btn);
        }
    }

    const stripGeometry = new THREE.BoxGeometry(1.8, 0.03, 0.08);
    const stripMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.accent,
        emissive: COLORS.accent,
        emissiveIntensity: 1
    });
    const strip = new THREE.Mesh(stripGeometry, stripMaterial);
    strip.position.set(0, 0.12, 1.4);
    padGroup.add(strip);

    padGroup.position.set(-4, 0.3, 1);
    padGroup.rotation.x = -0.1;
    scene.add(padGroup);
    skillPad = padGroup;
}

function createCables() {
    const cableMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.cable,
        roughness: 0.6,
        metalness: 0.3
    });

    const monitorCablePoints = [
        new THREE.Vector3(0, 1.95, -2),
        new THREE.Vector3(0, 0.5, -2),
        new THREE.Vector3(0, 0.3, -2.5),
        new THREE.Vector3(0, 0.2, -3.5)
    ];
    const monitorCableCurve = new THREE.CatmullRomCurve3(monitorCablePoints);
    const monitorCableGeo = new THREE.TubeGeometry(monitorCableCurve, 20, 0.04, 8, false);
    const monitorCable = new THREE.Mesh(monitorCableGeo, cableMaterial);
    scene.add(monitorCable);

    const keyboardCablePoints = [
        new THREE.Vector3(-2.75, 0.4, 1.5),
        new THREE.Vector3(-4, 0.3, 1.5),
        new THREE.Vector3(-5, 0.25, 1),
        new THREE.Vector3(-6, 0.2, 0)
    ];
    const keyboardCableCurve = new THREE.CatmullRomCurve3(keyboardCablePoints);
    const keyboardCableGeo = new THREE.TubeGeometry(keyboardCableCurve, 20, 0.03, 8, false);
    const keyboardCable = new THREE.Mesh(keyboardCableGeo, cableMaterial);
    scene.add(keyboardCable);

    const mouseCablePoints = [
        new THREE.Vector3(4, 0.25, 0.8),
        new THREE.Vector3(4.5, 0.25, 0),
        new THREE.Vector3(5.5, 0.22, -1),
        new THREE.Vector3(6.5, 0.2, -2)
    ];
    const mouseCableCurve = new THREE.CatmullRomCurve3(mouseCablePoints);
    const mouseCableGeo = new THREE.TubeGeometry(mouseCableCurve, 20, 0.025, 8, false);
    const mouseCable = new THREE.Mesh(mouseCableGeo, cableMaterial);
    scene.add(mouseCable);

    const padCablePoints = [
        new THREE.Vector3(-4, 0.3, -0.5),
        new THREE.Vector3(-4.5, 0.25, -1.5),
        new THREE.Vector3(-5.5, 0.22, -2.5),
        new THREE.Vector3(-6.5, 0.2, -3)
    ];
    const padCableCurve = new THREE.CatmullRomCurve3(padCablePoints);
    const padCableGeo = new THREE.TubeGeometry(padCableCurve, 20, 0.03, 8, false);
    const padCable = new THREE.Mesh(padCableGeo, cableMaterial);
    scene.add(padCable);
}

function onWindowResize() {
    const container = document.getElementById('desktop-scene');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    
    const time = Date.now() * 0.001;
    if (skillPad) {
        skillPad.children.forEach((child, i) => {
            if (child.material && child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + i) * 0.2;
            }
        });
    }
    
    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', init);
