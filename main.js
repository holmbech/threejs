import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

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

const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x606060, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
floor.position.y = -1;

scene.add(floor);

const r1 = addRack(2, 0, -3, 0x0000ff, 0x00ff00);
const r2 = addRack(-2, 0, -2, 0x00ff00, 0x0000ff);
const r3 = addRack(-2, 0, 1, 0x00ff00, 0x0000ff);
const r4 = addRack(2, 0, 1, 0x0000ff, 0x00ff00);


r1.add(createDegreesLabel("20", 1));
r1.add(createDegreesLabel("18", -1));

camera.position.z = 8;
camera.position.y = 2;
camera.position.x = 1;

const controls = new OrbitControls(camera, labelRenderer.domElement);
controls.addEventListener('change', render);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

function createDegreesLabel(temp, y) {
    const degrees = document.createElement('div');
    degrees.textContent = temp + ' °C';
    degrees.style.backgroundColor = 'transparent';
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

function render() {

    renderer.render(scene, camera);

}
function addRack(x, y, z, color1, color2) {
    const rackGeometry = new THREE.BoxGeometry(1, 2, 1);
    const rackMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            color1: { value: new THREE.Color(color1) }, // Green
            color2: { value: new THREE.Color(color2) }  // Blue
        }
    });
    const rack = new THREE.Mesh(rackGeometry, rackMaterial);
    rack.position.set(x, y, z);
    scene.add(rack);


    return rack;
}
