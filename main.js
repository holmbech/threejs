import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

const vertexShader = `
    varying vec3 vPosition;
    void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec3 vPosition;
    void main() {
        float mixValue = (vPosition.y + 1.0) / 2.0;
        gl_FragColor = vec4(mix(color1, color2, mixValue), 1.0);
    }
`;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.backgroundColor = '0px';
document.body.appendChild(labelRenderer.domElement);

addFloor();
addWall();

const rack1 = addRack(2, 0, -3, 0x0000ff, 0x00ff00);
const rack2 = addRack(-2, 0, -2, 0x00ff00, 0x0000ff);
const rack3 = addRack(-2, 0, 1, 0x00ff00, 0x0000ff);
const rack4 = addRack(2, 0, 1, 0x0000ff, 0x00ff00);

addRack(3, 0, 1, 0xaaaaaa, 0xaaaaaa);
addRack(4, 0, 1, 0xaaaaaa, 0xaaaaaa);

// Adding temperature labels to the racks
rack1.add(createDegreesLabel("20", 1));
rack1.add(createDegreesLabel("18", -1));

// Adding temperature labels to all the racks
rack2.add(createDegreesLabel("22", 1));
rack2.add(createDegreesLabel("19", -1));
rack3.add(createDegreesLabel("21", 1));
rack3.add(createDegreesLabel("20", -1));
rack4.add(createDegreesLabel("23", 1));
rack4.add(createDegreesLabel("22", -1));

camera.position.z = 8;
camera.position.y = 2;
camera.position.x = 1;

const controls = new OrbitControls(camera, labelRenderer.domElement);
controls.addEventListener('change', render);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// add hemisphere lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight.position.set(0, 10, 0);
scene.add(hemiLight);

function addFloor() {
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x606060,
        side: THREE.DoubleSide,
        metalness: 0.5,
        roughness: 0.5
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -1;
    scene.add(floor);
}

function createDegreesLabel(temp, y) {
    const degrees = document.createElement('div');
    degrees.textContent = temp + ' °C';
    degrees.style.backgroundColor = 'black';
    degrees.style.color = 'white';

    const degreesLabel = new CSS2DObject(degrees);
    degreesLabel.position.set(0, y, 0);
    return degreesLabel;
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function addWall() {
    const wallGeometry = new THREE.PlaneGeometry(10, 5);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 1.5, -5);
    scene.add(wall);
}

function addRack(x, y, z, color1, color2) {
    // Create beveled box
    const size = 1;
    const height = 2;
    const bevelSize = 0.05;
    
    // Create main box
    const boxGeometry = new THREE.BoxGeometry(size, height, size, 1, 1, 1, bevelSize);
    const boxMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            color1: { value: new THREE.Color(color1) },
            color2: { value: new THREE.Color(color2) }
        }
    });
    
    // Create edges for bevel effect
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ 
        color: 0x000000,
        linewidth: 2,
        transparent: true,
        opacity: 0.3
    });
    
    // Create group to hold both box and edges
    const rack = new THREE.Group();
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
    // Scale down the box slightly to make room for the bevel
    box.scale.set(0.97, 0.97, 0.97);
    
    // Add both to the group
    rack.add(box);
    rack.add(edges);
    
    // Position the rack
    rack.position.set(x, y, z);
    scene.add(rack);
    
    return rack;
}

function render() {
    renderer.render(scene, camera);
}