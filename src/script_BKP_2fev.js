import './main.css'
import './splitting.css';
import './splitting-cells.css';
import * as bodymovin from './lottie.min';
import * as Splitting from './splitting.min';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
// import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import fgrVertexShader from '../static/shaders/fgrVertexShader.glsl';
import oceanVertexShader from '../static/shaders/oceanVertexShader.glsl';
import oceanFragShader from '../static/shaders/oceanFragShader.glsl';

// Efeitos Complexos
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
// import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
// import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
// import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
// import { ACESFilmicToneMappingShader } from './jsm/shaders/ACESFilmicToneMappingShader.js';
// import { LuminosityShader } from './jsm/shaders/LuminosityShader.js';
// import { SepiaShader } from '../jsm/shaders/SepiaShader.js';
// import { SobelOperatorShader } from './jsm/shaders/SobelOperatorShader.js';
// import { OutlineEffect } from './jsm/effects/OutlineEffect.js';
// import { Reflector } from '../jsm/objects/Reflector.js';
// import { RGBELoader } from './jsm/loaders/RGBELoader.js';


/////////////////////////////////////////////////////////////////////////
///// INTERFACE ELEMENTS
/////////////////////////////////////////////////////////////////////////
const elem = document.getElementById("containerWebsite");
const nome = document.getElementById("jardins");
const buttonVoltar = document.getElementById("btnVoltar");
const buttonMapa = document.getElementById("mapmode");
const header = document.getElementById("header");
const menuHamburguer = document.getElementById("menu-hamburguer");
const introDiv = document.getElementById('intro');
const buttonExplore = document.getElementById("btnExplorar");
// const instructions = document.getElementById("instructions");
const musicButton = document.getElementById("music");
const backButton = document.getElementById('voltar');
const condoImage = document.getElementById("image-display");
const loadingBarElement = document.querySelector('.loading-bar')
const imgContainer = document.getElementById("condo-image");
const progressBar = document.getElementById("progress");
// const compass = document.getElementById("compass-img");
const buttonContinue = document.getElementById("btn-continue-explore");
// const buttonViewImage = document.getElementById("btn-view-image");
const activateEffects = document.getElementById("activate-effects");
let menuCheck = document.querySelector('input[name="menu-hamburguer"]:checked');
const ftsLoader = document.querySelector(".lds-roller");
// const xhr = new XMLHttpRequest();

/////////////////////////////////////////////////////////////////////////
///// MAIN VARIABLES
/////////////////////////////////////////////////////////////////////////
let camera, stats, scene, renderer, light, raycaster, raycaster2, model, controls, intersects, helicoptero, helice_helicoptero, helice_rotor, helice, bird;
let cameraOrtho, sceneOrtho, posx, posy;
let mapMode = false;
let mouse = new THREE.Vector2();
let firstPlay = true;
let listener, backgroundMusic, backgroundMusicFile, backgroundMusicMediaElement, loaderAudio, textureLoader, loader, loadingManager, mixer;
let displayImageMode = false;
let isMobile = false;
let musicPlay = false;
let lastCalledTime, delta, fps;
let loadedAll = false;
let canAnimate = false;
let gui;
let car;
// let takeRide = false;



/////////////////////////////////////////////////////////////////////////
///// DEBUG ENABLER
/////////////////////////////////////////////////////////////////////////
let debug = false;

if(window.location.hash) {
    
    var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
    // hash found
} else {
    introDiv.classList.add('show');
    buttonVoltar.style.display = 'block;';
    buttonContinue.style.display = 'block';
    ftsLoader.parentNode.removeChild(ftsLoader);
    Splitting();
    // No hash found
}

if (hash == "debug") {
    debug = true;
    gui = new GUI();
    window.setTimeout(debuger, 200);
    window.setTimeout(setLoadedAll, 500);
    ftsLoader.parentNode.removeChild(ftsLoader);
    buttonVoltar.style.display = 'block;';
    buttonContinue.style.display = 'block';
}

function setLoadedAll() {
    loadedAll = true;
    // teleport = true;
}

/////////////////////////////////////////////////////////////////////////
///// MAX CONFIGS FOR QUALITY AND POST EFFECTS
/////////////////////////////////////////////////////////////////////////
let maxConfig = false;

if (hash == "max") {
    maxConfig = true;
    Splitting();
    introDiv.classList.add('show');
    buttonVoltar.style.display = 'block';
    buttonContinue.style.display = 'block';
    ftsLoader.parentNode.removeChild(ftsLoader);
    
}

function activateMaxConfig(){
    if (maxConfig) {
        maxConfig = false; 
        // activateEffects.innerText = 'Ativar efeitos';
    }else{ 
        // activateEffects.innerText = 'Desativar efeitos';
        maxConfig = true;
    }
}

//////////////////////////////////////////////////
//// LOADING MANAGER
/////////////////////////////////////////////////
elem.style.display = "none";
if (debug == false) {

    loadingManager = new THREE.LoadingManager(
        // Loaded
        () => {
            new TWEEN.Tween(overlayMaterial)
                .to({ opacity: 0.8 }, 2000)
                .easing(TWEEN.Easing.Quartic.InOut)
                .start()
                .onStart(function () {
                    controls.autoRotate = true;
                    controls.autoRotateSpeed = 0.2;
                })
                .onUpdate(function (object) {
                    // console.log(overlayMaterial.uniforms.uAlpha);
                })
                .onComplete(function () {
                    TWEEN.remove(this);

                });
            // console.log('loaded');
            loadingBarElement.style.transform = '';
            loadingBarElement.classList.add('ended');
            // introText.classList.add('ended');
            buttonExplore.classList.add('ended');
            loadedAll = true;
        },

        // Progress
        (itemUrl, itemsLoaded, itemsTotal) => {
            const progressRatio = itemsLoaded / itemsTotal
            loadingBarElement.style.transform = `scaleX(${progressRatio})`
        }
    )
}
//////////////////////////////////////////////////
//// DRACO LOADER CONFIG
/////////////////////////////////////////////////
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({ type: 'js' });
if (debug == false) {
    ///// Loaders
    textureLoader = new THREE.TextureLoader(loadingManager);
    loader = new GLTFLoader(loadingManager);
    loader.setDRACOLoader(dracoLoader);
} else {
    textureLoader = new THREE.TextureLoader();
    loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
}


/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION AND RENDERER CONFIG
/////////////////////////////////////////////////////////////////////////
const container = document.createElement('div');
document.body.appendChild(container);

// const renderer2 = new THREE.WebGLRenderer({ antialias: true });
// renderer2.setPixelRatio(2); //Performance
// const container2 = document.createElement('div');
// document.body.appendChild(container2);
// container2.appendChild(renderer2.domElement);
// container2.childNodes[0].style.position = 'absolute';
// container2.childNodes[0].style.width = '400px';
// container2.childNodes[0].style.height = '200px';
// container2.childNodes[0].style.top = '60px';

scene = new THREE.Scene();
// let sceneMap = new THREE.Scene();
// let sceneFinal = new THREE.Scene();

scene.background = new THREE.Color(0xe1f2ff);
// scene.fog = new THREE.Fog(new THREE.Color(0xc5c482), 35, 85);
scene.fog = new THREE.Fog(new THREE.Color(0xdff5fa), 35, 75);

// sceneFinal.background = new THREE.Color(0xf3f5fc).convertLinearToGamma(2.2);
// sceneFinal.fog = new THREE.Fog(new THREE.Color(0x2f3f5fc).convertLinearToGamma(2.2), 125, 660);

renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
// renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" }); //Performance issue
renderer.autoClear = false;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //Performance
// renderer.setPixelRatio(0.8); //Performance issue
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.4;
// renderer.gammaFactor = 2.8;
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.gammaOutput = true;
renderer.shadowMap.enabled = false; //Performance main issue
// renderer.shadowMap.type = THREE.VSMShadowMap;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);



/////////////////////////////////////////////////////////////////////////
///// BACKGROUND MUSIC
/////////////////////////////////////////////////////////////////////////
function playMusic() {
    if (firstPlay) {
        listener = new THREE.AudioListener();
        backgroundMusic = new THREE.Audio(listener);
        backgroundMusicFile = './sounds/music_loop.mp3';
        backgroundMusicMediaElement = new Audio(backgroundMusicFile);
        loaderAudio = new THREE.AudioLoader(loadingManager);
        // backgroundMusic.setbackgroundMusicMediaElementSource(backgroundMusicMediaElement);
        firstPlay = false;
    }

    if (!musicPlay) {
        if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
            loaderAudio.load(backgroundMusicFile, function (buffer) {
                backgroundMusic.setBuffer(buffer);
                backgroundMusic.play();
            })
        } else {
            backgroundMusicMediaElement.play();
            backgroundMusicMediaElement.loop = true;
            backgroundMusic.setVolume(0.3);
            // backgroundMusic.setLoop(true);
        }
        musicPlay = true;
        backgroundMusicMediaElement.volume = 0.3;
    } else {
        musicPlay = false;
        backgroundMusicMediaElement.pause();
    }
}

//////////////////////////////////////////////////
//// CLICK AUDIO
/////////////////////////////////////////////////
const clickSound = './sounds/click.wav';
const clickEfect = new Audio(clickSound);


/////////////////////////////////////////////////////////////////////////
///// DETEC MOBILE
/////////////////////////////////////////////////////////////////////////
if (navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)) {
    isMobile = true;
}


/////////////////////////////////////////////////////////////////////////
///// INSTANCE SCATTER CONFIG
/////////////////////////////////////////////////////////////////////////
// const api = {
//     count: 3200,
//     distribution: 'random',
//     resample: resample
// };

// let Arvore, Caule;
// let stemGeometry;
// let stemMaterial;

// let sampler;
// const count = api.count;
// const ages = new Float32Array(count);
// const scales = new Float32Array(count);
// const dummy = new THREE.Object3D();

// const _position = new THREE.Vector3();
// const _normal = new THREE.Vector3();

// let surface2;

let pickableMeshes = [];

// // Source: https://gist.github.com/gre/1650294
// const easeOutCubic = function (t) {

//     return (--t) * t * t + 1;

// };

// // Scaling curve causes particles to grow quickly, ease gradually into full scale, then
// // disappear quickly. More of the particle's lifetime is spent around full scale.
// const scaleCurve = function (t) {

//     return Math.abs(easeOutCubic((t > 0.5 ? 1 - t : t) * 2));

// };

// // Arvores para instancia
// const normalMapGreen = textureLoader.load('textures/greenNormal.png'); 
// normalMapGreen.wrapS = THREE.RepeatWrapping;
// normalMapGreen.wrapT = THREE.RepeatWrapping;
// normalMapGreen.repeat.set( 40, 40 );
// const materialLambertGreen = new THREE.MeshPhongMaterial({ color: 0x708c63, normalMap: normalMapGreen, normalScale: new THREE.Vector2(0.3, 0.3) });
// // const materialLambertGreen2 = new THREE.MeshLambertMaterial({ color: 0x708c63 });
// // const materialLambertGreen = new THREE.MeshLambertMaterial({ color: 0x395033 });

const materialLambertGreen2 = new THREE.MeshLambertMaterial({color: 0x21400F});
materialLambertGreen2.onBeforeCompile = function(shader) {

    shader.uniforms.time = { value: 0 }
    // shader.vertexShader = document.getElementById( 'vertexShader' ).textContent;
    shader.vertexShader = fgrVertexShader;
    // shader.fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
    materialLambertGreen2.userData.shader = shader;
};

// loader.load('models/gltf/Flower/Flower6.glb', function (gltf) {
//     console.log(gltf.scene)

//     const _Arvore = gltf.scene.getObjectByName('Stem_1');
//     const _Caule = gltf.scene.getObjectByName('Stem_2');
//     // stemMaterial = materialLambertGreen2;
//     stemMaterial = _Arvore.material;
//     const cauleMaterial = _Caule.material;
//     stemGeometry = _Arvore.geometry.clone();
//     const cauleGeometry = _Caule.geometry.clone();

//     const defaultTransform = new THREE.Matrix4()
//     .makeRotationX(Math.PI / 2)
//     .multiply(new THREE.Matrix4().makeScale(1, 1, 1));

//     stemGeometry.applyMatrix4(defaultTransform);
//     cauleGeometry.applyMatrix4(defaultTransform);
//     // stemGeometry.castShadow = true;

//     Arvore = new THREE.InstancedMesh(stemGeometry, stemMaterial, count);
//     Caule = new THREE.InstancedMesh(cauleGeometry, cauleMaterial, count);
//     // Arvore.frustumCulled = true;

//     // var translation = new Float32Array( count * 3 );
//     // var scale = new Float32Array( count * 3 );

//     // // and iterators for convenience :)
//     // var translationIterator = 0;
//     // var scaleIterator = 5;

//     // // and a quaternion (rotations are represented by Quaternions, not Eulers)
//     // var q = new THREE.Quaternion();

//     // for ( let i = 0; i < count; i++ ) {

//     //     // a random position
//     //     translation[ translationIterator++ ] = ( Math.random() - .5 ) * 1000;
//     //     translation[ translationIterator++ ] = ( Math.random() - .5 ) * 1000;
//     //     translation[ translationIterator++ ] = ( Math.random() - .5 ) * 1000;
  
//     //     // randomize quaternion not sure if it's how you do it but it looks random
//     //     q.set(  ( Math.random() - .5 ) * 2,
//     //       ( Math.random() - .5 ) * 2,
//     //       ( Math.random() - .5 ) * 2,
//     //       Math.random() * Math.PI );
//     //     q.normalize();
  
//     //     // a random scale
//     //     scale[ scaleIterator++ ] = 0.1 + ( Math.random() * 4 );
//     //     scale[ scaleIterator++ ] = 0.1 + ( Math.random() * 4 );
//     //     scale[ scaleIterator++ ] = 0.1 + ( Math.random() * 4 );
  
//     //   }
  
//     // for (let i = 0; i < count; i++) {
        
//     //     // color.setHex( blossomPalette[ Math.floor( Math.random() * blossomPalette.length ) ] );
//     // }

//     // Instance matrices will be updated every frame.
//     // Arvore.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
//     // blossomMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

//     // Intance matrices will not be updated every frame
//     // Arvore.instanceMatrix.setUsage(THREE.StaticDrawUsage);

//     // Antes resample era chamado aqui.. passei a chamar só depois
//     // de carregar o pedaço que quero dar Scatter. Mas preciso ver o Async.
//     // resample();

//     ///////////// Instance Scatter
//     //Disable Scatter
//     scene.add(Arvore);
//     scene.add( Caule );


// });

// /////////////////////////////////////////////////////////////////////////
// ///// AIRPLANE
// /////////////////////////////////////////////////////////////////////////
// const materialLambertWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });
// const materialLambertWhite2 = new THREE.MeshPhongMaterial({ color: 0xffffff });
// const materialLambertBlue = new THREE.MeshLambertMaterial({ color: 0x305778 });
// const materialBasicRed = new THREE.MeshPhongMaterial({ color: 0x9D1A17 });
// loader.load('models/gltf/aviao.glb', function (gltf) {
//     aviao = gltf.scene;

//     helice = gltf.scene.getObjectByName('Helice');
//     helice.material = materialBasicRed;

//     gltf.scene.traverse((obj) => {
//         if (obj.isMesh & obj.name == "Aviao") {
//             obj.material = materialLambertWhite;
//             obj.castShadow = true;
//         }
//     });

//     aviao.scale.set(0.4,0.4,0.4);
//     aviao.position.set(-20, 8, -20);
//     scene.add(aviao);

// });


/////////////////////////////////////////////////////////////////////////
///// HELICOPTER
/////////////////////////////////////////////////////////////////////////
loader.load('models/gltf/helicoptero.glb', function (gltf) {
    helicoptero = gltf.scene;
    // console.log(helicoptero);

    helice_helicoptero = gltf.scene.getObjectByName('Helice');
    helice_rotor = gltf.scene.getObjectByName('Rotor');

    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            // obj.material = materialLambertWhite;
            obj.castShadow = true;
        }
    });
    helicoptero.scale.set(0.5, 0.5, 0.5)

    helicoptero.position.set(-5, 4, -20)
    helicoptero.name = 'helicopter';
    scene.add(helicoptero);
    // pickableMeshes.push(helicoptero)

});

/////////////////////////////////////////////////////////////////////////
///// CAR
/////////////////////////////////////////////////////////////////////////
loader.load('models/gltf/car2.glb', function (gltf) {
    car = gltf.scene;

    // helice = gltf.scene.getObjectByName('Helice');
    // helice.material = materialBasicRed;

    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            // pickableMeshes.push(obj);
        }
    });

    car.scale.set(0.5,0.5,0.5);
    car.position.set(0, 0.4, -0.5);
    car.rotation.y = Math.PI /2
    car.name = "car";
    scene.add(car);
});

/////////////////////////////////////////////////////////////////////////
///// BIRDS
/////////////////////////////////////////////////////////////////////////
loader.load('models/gltf/bird.glb', function (gltf) {
    
    bird = gltf.scene;

    gltf.scene.traverse((obj) => {
        if (obj.isMesh ) {
            obj.castShadow = true;
        }
    });
    
    mixer = new THREE.AnimationMixer( gltf.scene );
        
    gltf.animations.forEach( ( clip ) => {
        
        mixer.clipAction( clip ).play();
        
    } );
    
    bird.scale.set(0.008, 0.008, 0.008)
    bird.position.set(-15, 3, -10)
    bird.rotation.y = 0.6;
    bird.name = 'bird';
    scene.add(bird);
    
});


//////////////////////////////////////////////////////////////
////// RAYCASTER
//////////////////////////////////////////////////////////////
mouse = new THREE.Vector2()
raycaster = new THREE.Raycaster();
raycaster2 = new THREE.Raycaster();
let currentIntersect = null;
let width = window.innerWidth;
let height = window.innerHeight;


//////////////////////////////////////////////////////////////
////// WINDOW FOCUS AND PLAY METHODS
//////////////////////////////////////////////////////////////
let isFocused = true;

document.addEventListener("visibilitychange", function() {
    if(document.hidden){
        console.log( "ESCONDIDO "+ document.hidden );
        if (backgroundMusicMediaElement !== undefined & musicPlay) {
            pause();
        }
    } else {
        console.log( "NAO ESCONDIDO "+ document.hidden );
        if (backgroundMusicMediaElement !== undefined & musicPlay) {
            play();
        }
    }
  });

function pause() {
    console.log('FOCUS LOST!');
    isFocused = false;
    if (backgroundMusicMediaElement !== undefined) backgroundMusicMediaElement.pause();

    // if (backgroundMusicMediaElement !== undefined & musicPlay) {
    //     new TWEEN.Tween({volume: 0.3}).to({volume: 0}, 1500)
    //     .easing(TWEEN.Easing.Linear.None)
    //     .start()
    //     .onUpdate(function (value) {
    //         backgroundMusicMediaElement.volume = value.volume;
    //     }).onComplete(function () {
    //         // backgroundMusicMediaElement.pause();
    //         TWEEN.remove(this);
    //     });
    // }

    // console.log("RESULTADO " + backgroundMusicMediaElement +"  "+  document.hidden)
    
}

function play() {
    isFocused = true;
    if (musicPlay){ 
        backgroundMusicMediaElement.play();
        backgroundMusicMediaElement.volume = 0.3;
    }
    // if (backgroundMusicMediaElement) {
    //     var musicUp = new TWEEN.Tween({volume: backgroundMusicMediaElement.volume}).to({volume: 0.3}, 3000)
    //     .easing(TWEEN.Easing.Linear.None)
    //     .start()
    //     .onUpdate(function (value) {
    //         console.log(value.volume)
    //         console.log(musicPlay)
    //         backgroundMusicMediaElement.volume = value.volume;
    //     }).onComplete(function () {
    //         TWEEN.remove(this);
    //     });
    // }
    // console.log('This document has focus. Click outside the document to lose focus.');

}

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
/////////////////////////////////////////////////////////////////////////
camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 2, 85);
camera.position.set(-10, 55, -50);

const debugCamera = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, -1000, 1000);
let debugHelper; 
if (debug == true) {
    // debugCamera.position.set(0,0,200);
    // scene.background = new THREE.Color(0x000000);
    // debugHelper = new THREE.CameraHelper( camera );
    // scene.add( debugHelper) ;
}

// let cameraRide = new THREE.PerspectiveCamera(31, window.innerWidth / window.innerHeight, 2, 420);

cameraOrtho = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, 1, 10);
cameraOrtho.position.z = 2;
sceneOrtho = new THREE.Scene();

// let cameraFinal = new THREE.OrthographicCamera(1 / - 2, 1 / 2, 1 / 2, 1 / - 2, -1000, 1000);


/////////////////////////////////////////////////////////////////////////
///// CUSTOM MOUSE CURSOR
/////////////////////////////////////////////////////////////////////////
document.getElementById('body').style.cursor = 'grab';
const map = textureLoader.load('textures/mouse.png');
const material = new THREE.SpriteMaterial({ map: map });
const sprite = new THREE.Sprite(material);
sprite.scale.set(40, 40, 1);
sceneOrtho.add(sprite);


/////////////////////////////////////////////////////////////////////////
///// CONTROLS
/////////////////////////////////////////////////////////////////////////
controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
controls.enableZoom = true;
controls.zoomSpeed = 0.3;
controls.target.set(0,2,0);
// controls.enableRotate = false;
controls.screenSpacePanning = false;
controls.minDistance = 15;
controls.maxDistance = 50;
controls.enabled = false;
controls.autoRotateSpeed = 0.4;
controls.maxPolarAngle = (Math.PI / 2.4);
controls.maxAzimuthAngle = 25

var minPan = new THREE.Vector3( - 10, - 10, - 10 );
var maxPan = new THREE.Vector3( 10, 10, 10 );
var _v = new THREE.Vector3();

controls.addEventListener("change", function() {
    _v.copy(controls.target);
    controls.target.clamp(minPan, maxPan);
    _v.sub(controls.target);
    camera.position.sub(_v);
})

if(debug == true) debugCamera.lookAt(controls.target);

/////////////////////////////////////////////////////////////////////////
///// LIGHTS CONFIG
/////////////////////////////////////////////////////////////////////////

//Ambient Light
// const ambient = new THREE.AmbientLight(0x3e4266, 0.847); //Performance issue
const ambient = new THREE.AmbientLight(0x7e80a2, 1.9); //Performance issue
scene.add(ambient);

//Directional Light
light = new THREE.DirectionalLight(0xd7af87, 5.8); //Performance issue


//Point Car Light
const spotLightCar = new THREE.SpotLight(0xd7af87, 0.4, 6, 0.8, 0.4, 0);
spotLightCar.rotation.set(0,0,0);
spotLightCar.target.position.set(1,0,0);
spotLightCar.add( spotLightCar.target );
scene.add(spotLightCar);

//Point Helicopter Light
const spotLightHeli = new THREE.SpotLight(0xd7af87, 0.3, 6, 0.8, 0.4, 0);
spotLightHeli.rotation.set(0,0,0);
spotLightHeli.target.position.set(0,-1,0);
spotLightHeli.add( spotLightHeli.target );
scene.add(spotLightHeli);

// const spotLightHelper = new THREE.SpotLightHelper( spotLightHeli );
// scene.add( spotLightHelper );


// light = new THREE.DirectionalLight(0xf0dbb7, 1.6); //Performance issue
light.position.set(46, 1.9, 27);
// light.position.set(10, 22, 40);
scene.add( light.target );
// light.target.position.set(20,0,0);

// light.position.set(100, 33, 100);
scene.add(light);
// Sombras dentro do Three
// light.castShadow = false; // default false
// light.shadow.camera.near = 0;
// light.shadow.camera.far = 80;
// light.shadow.camera.right = 20;
// light.shadow.camera.left = - 20;
// light.shadow.camera.top = 20;
// light.shadow.camera.bottom = -20;
// light.shadow.mapSize.width = 1024;
// light.shadow.mapSize.height = 1024;
// light.shadow.radius = 40;
// light.shadow.bias = -0.001;
// light.shadow.normalBias = 0;
// light.shadow.blurSamples = 10


// Light GUI
var params = {color: light.color.getHex(), color2: ambient.color.getHex(), color3: "#e1f4ff", color4: "#d5f7f7" };
const update = function () {
	var colorObj = new THREE.Color( params.color );
	var colorObj2 = new THREE.Color( params.color2 );
	var colorObj3 = new THREE.Color( params.color3 );
	var colorObj4 = new THREE.Color( params.color4 );
	light.color.set(colorObj);
	ambient.color.set(colorObj2);
    scene.background.set(colorObj3);
	scene.fog.color.set(colorObj4);
};



if (debug ==true){
    let helper;

    var options = {
        reset: function() {
            if (renderer.shadowMap.enabled){
                renderer.shadowMap.enabled = false;
                light.shadow.map.dispose();
                materialLambertGreen.needsUpdate = true;
                materialLambertWhite.needsUpdate = true;
                // renderer.antialias = false;
                renderer.shadowMap.autoUpdate = false;
            }else{
                renderer.shadowMap.enabled = true;
                materialLambertGreen.needsUpdate = true;
                materialLambertWhite.needsUpdate = true;
                renderer.shadowMap.autoUpdate = true;
            }
        },
        setmaxconfig: function() {
            if (maxConfig) {
                maxConfig = false; 
                // scene.background.set(0xaae1ff);
                scene.background.set(0xe1f2ff);
                // scene.fog.color.set(0x91d4ff); 
                scene.fog.color.set(0xdff5fa); 

            }else{ 
                maxConfig = true; 
                // scene.background.set(0xaae1ff);
                scene.background.set(0x90c1e8);
                // scene.fog.color.set(0x91d4ff); 
                scene.fog.color.set(0x80b6e8); 
                // console.log('here');
            }
        }
      };

    gui.add(light, 'intensity').min(0).max(10).step(0.0001).name('Dir intensity');
    gui.add(light.position, 'y').min(0).max(100).step(0.00001).name('Dir Y pos');
    gui.add(light.position, 'x').min(-100).max(100).step(0.00001).name('Dir X pos');
    gui.add(light.position, 'z').min(-100).max(100).step(0.00001).name('Dir Z pos');
    gui.addColor(params,'color').name('Dir color').onChange(update);
    gui.addColor(params,'color2').name('Amb color').onChange(update);
    gui.addColor(params,'color3').name('Clouds color').onChange(update);
    gui.addColor(params,'color4').name('Fog color').onChange(update);
    gui.add(ambient, 'intensity').min(0).max(10).step(0.001).name('Amb intensity');
    // gui.add(renderer.shadowMap, 'enabled').name('Shadows').listen();
    // gui.add(options, 'reset').name('Toggle Shadows');
    gui.add(options, 'setmaxconfig').name('Toggle Effects');

    // Directional Light Helper
    // helper = new THREE.CameraHelper( light.shadow.camera );
    // scene.add( helper );
}


/////////////////////////////////////////////////////////////////////////
///// OCEAN 
/////////////////////////////////////////////////////////////////////////
// const debugObject = {}

// // Colors
// debugObject.depthColor = '#186691'
// debugObject.surfaceColor = '#9bd8ff'

// const materialOcean = new THREE.MeshLambertMaterial({color: 0x3469a0})

// materialOcean.onBeforeCompile = function(shader) {
    
//     shader.uniforms.uTime = { value: 0 };
//     shader.vertexShader = oceanVertexShader;
//     // shader.fragmentShader = oceanFragShader;
//     // shader.vertexShader = shader.vertexShader.replace(
//     //     '#include <begin_vertex>',
//     //     `
//     //         #include <begin_vertex>

//     //      float uTime;
//     //          float uBigWavesElevation;
//     //          vec2 uBigWavesFrequency;
//     //          float uBigWavesSpeed;

//     //          float uSmallWavesElevation;
//     //          float uSmallWavesFrequency;
//     //          float uSmallWavesSpeed;
//     //          float uSmallIterations;

//     //          float vElevation;
//     //     `
//     // )
//     shader.uBigWavesElevation= { value: 0.253 },
//     shader.uBigWavesFrequency= { value: new THREE.Vector2(1.53, 0.3) },
//     shader.uBigWavesSpeed= { value: 0.96 },

//     shader.uSmallWavesElevation= { value: 0.12 },
//     shader.uSmallWavesFrequency= { value: 1.2 },
//     shader.uSmallWavesSpeed= { value: 0.96 },
//     shader.uSmallIterations= { value: 5 },

//     shader.uDepthColor= { value: new THREE.Color(debugObject.depthColor) },
//     shader.uSurfaceColor= { value: new THREE.Color(debugObject.surfaceColor) },
//     shader.uColorOffset= { value: 0.075 },
//     shader.uColorMultiplier= { value: 2.3 }
    // materialOcean.shader = shader;
    //  console.log(shader);
// };

// const materialOcean = new THREE.ShaderMaterial({
//     vertexShader: oceanVertexShader,
//     fragmentShader: oceanFragShader,
//     uniforms:
//     {
//         uTime: { value: 0 },
        
//         uBigWavesElevation: { value: 0.253 },
//         uBigWavesFrequency: { value: new THREE.Vector2(1.53, 0.3) },
//         uBigWavesSpeed: { value: 0.96 },

//         uSmallWavesElevation: { value: 0.12 },
//         uSmallWavesFrequency: { value: 1.2 },
//         uSmallWavesSpeed: { value: 0.96 },
//         uSmallIterations: { value: 5 },

//         uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
//         uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
//         uColorOffset: { value: 0.075 },
//         uColorMultiplier: { value: 2.3 },
//         lights: true,
//         fog: true
//     }
// });

// gui.addColor(debugObject, 'depthColor').onChange(() => { materialOcean.uniforms.uDepthColor.value.set(debugObject.depthColor) })
// gui.addColor(debugObject, 'surfaceColor').onChange(() => { materialOcean.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })

// gui.add(materialOcean.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
// gui.add(materialOcean.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
// gui.add(materialOcean.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
// gui.add(materialOcean.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')


// gui.add(materialOcean.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
// gui.add(materialOcean.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
// gui.add(materialOcean.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
// gui.add(materialOcean.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations')

// gui.add(materialOcean.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
// gui.add(materialOcean.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')


// materialOcean.onBeforeCompile = function(shader) {
//     side: THREE.DoubleSide;
//     shader.uniforms.time = { value: 0 };
//     shader.vertexShader = oceanVertexShader;
//     shader.fragmentShader = oceanFragShader;
//     materialOcean.userData.shader = shader;
// };

// const materialOcean = new THREE.MeshBasicMaterial({color: 0x3469a0, transparent: true})

// const oceanGeometry = new THREE.BoxBufferGeometry(5, 5, 2, 64, 64,2)
// const oceanMesh = new THREE.Mesh(oceanGeometry, materialOcean)
// oceanMesh.position.set(0,5,0)
// oceanMesh.rotation.set(- Math.PI /2, 0, 0)
// scene.add(oceanMesh)



/////////////////////////////////////////////////////////////////////////
///// LOADER 
/////////////////////////////////////////////////////////////////////////

const overlayMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true})
const overlayGeometry = new THREE.PlaneGeometry(width *2, height, 1, 1)
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
overlay.position.set(0,5,0)
overlay.rotation.set(- Math.PI /2, 0, 0)
// overlay.lookAt(camera.position)

/////////////////////////////////////////////////////////////////////////
///// LOADER OVERLAY
/////////////////////////////////////////////////////////////////////////
if (debug == false) {
    scene.add(overlay)
}

/////////////////////////////////////////////////////////////////////////
///// CLOUDS
/////////////////////////////////////////////////////////////////////////
const cloudsTexture = textureLoader.load('textures/cloud.png'); 
const cloudsMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, map: cloudsTexture, transparent: true, depthWrite: false, depthTest: false, depthFunc: THREE.LessEqualDepth})
const cloudsGeometry = new THREE.PlaneGeometry(20, 6, 1, 1)
const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
const cloudsMesh2 = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
cloudsMesh.position.set(-Math.random() *20, 12, 0);
cloudsMesh.rotation.set(- Math.PI /2, -1, -8);
cloudsMesh.scale.set(0.6,0.6, 0);
cloudsMesh.name = "Cloud1"
scene.add(cloudsMesh);

cloudsMesh2.position.set(Math.random() *20, 12, 0);
cloudsMesh2.rotation.set(Math.PI /2, 0, 0);
cloudsMesh2.name = "Cloud2"
scene.add(cloudsMesh2);

// overlay.lookAt(camera.position)


let windHeads =[];

/////////////////////////////////////////////////////////////////////////
///// LOADING MODEL
/////////////////////////////////////////////////////////////////////////
// const floorTexture = textureLoader.load('textures/alphamap.jpg');
let rodaGigante;
loader.load('models/gltf/isometric-cityscape13.glb', function (gltf) {
    
    // console.log(gltf.scene)
    gltf.scene.traverse((o) => {
        if (o.name.match(/p_/)) {
            // o.material = materialBasicRed;
            // o.material.side = THREE.DoubleSide
            pickableMeshes.push(o);
            // o.castShadow = true;
        }

        if (o.name.match(/wind2_/)) {
            // o.material = materialBasicRed;
            // o.material.side = THREE.DoubleSide
            windHeads.push (o);
            // o.castShadow = true;
        }

        if (o.isMesh) {
            //  o.receiveShadow = true;
            //  o.castShadow = true;

            // if (o.name == 'Chao') {
            //     o.receiveShadow = true;
            //     o.material = materialLambertWhite;
            //     o.position.y = 0.25
            //     o.material.transparent = true;
            //     o.material.alphaMap = floorTexture;
            //     o.material.alphaTest = 0.1;
            // }

            if (o.name == 'Roda_Gigante') {
                rodaGigante = o;
                // console.log(rodaGigante);
                // o.receiveShadow = true;
                // o.castShadow = true;
            }

            // if (o.name == 'Ocean') {
            //     o.material = materialOcean;
            //     // console.log(rodaGigante);
            //     // o.receiveShadow = true;
            //     // o.castShadow = true;
            // }
            // console.log(o.name.match(/p_/));
            if (o.name == 'Landskape_plane_Landscape_color_1_0001') {
                // console.log(o.name)
                // surface2 = o;
                o.material = materialLambertGreen2;
                o.material.side = THREE.DoubleSide

                // o.receiveShadow = true;
            }

            if (o.name == 'PineTrees_2') {
                // console.log(o.name)
                // surface2 = o;
                o.material = materialLambertGreen2;
                o.material.side = THREE.DoubleSide
                // o.receiveShadow = true;
            }
            // if (o.name == 'Roads001') {
            //     // o.material.color = new THREE.Color(0x424359);
            // }
        }
    });
  

    scene.add(gltf.scene);
    // resample();

});


/////////////////////////////////////////////////////////////////////////
///// MIRROR ON THR FLOR
/////////////////////////////////////////////////////////////////////////
// const mirrorBack1 = new Reflector(
//     new THREE.PlaneBufferGeometry(20, 20),
//     {
//         clipBias: 0.001, 
//         textureWidth: window.innerWidth * window.devicePixelRatio,
//         textureHeight: window.innerHeight * window.devicePixelRatio,
//         color: 0x777777, 
//         recursion: 4,
//     }
// )
// mirrorBack1.scale.set(20,20,20)
// mirrorBack1.rotation.set(-1.58,0,0)
// mirrorBack1.position.y = -0.2
// mirrorBack1.position.x = -10
// mirrorBack1.transparent = true;
// mirrorBack1.alpha = 0.1;
// scene.add(mirrorBack1)

/////////////////////////////////////////////////////////////////////////
///// EVENT LISTENERS
/////////////////////////////////////////////////////////////////////////

document.addEventListener('mousemove', onMouseMove, false);
// document.addEventListener('wheel', onMouseWheel, false);
document.addEventListener('click', onTargetClick);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
window.addEventListener('blur', pause);
window.addEventListener('focus', play);
window.addEventListener('resize', onWindowResize);
musicButton.addEventListener('click', playMusic);
buttonExplore.addEventListener('click', exploreAnimation);
backButton.addEventListener('click', backToMap);
buttonMapa.addEventListener('click', mapModeButton);
buttonContinue.addEventListener('click', continueExploration);
activateEffects.addEventListener('click', activateMaxConfig);
// buttonViewImage.addEventListener('click', displayImage);
menuHamburguer.addEventListener('click', menuHamburguerAtivado);

/////////////////////////////////////////////////////////////////////////
///// POST PROCESSING EFFECTS
/////////////////////////////////////////////////////////////////////////

const renderPass = new RenderPass( scene, camera );
const renderTarget = new THREE.WebGLMultisampleRenderTarget(
    width/2,
    height/2,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    }
)

const composer = new EffectComposer(renderer, renderTarget);
composer.setSize(width, height)
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

///// VIGNETTE ///////////////////////////////////////////////////////////////

const effectVignette = new ShaderPass(VignetteShader);
effectVignette.uniforms[ "offset" ].value = 0.6;
effectVignette.uniforms[ "darkness" ].value = 1;

//////FILM EFFECT ////////////////////////////////////////////////////////////
// const effectFilm = new FilmPass( .07, 0.05, 0, false );

const gammaCorrection = new ShaderPass(GammaCorrectionShader)

// const smaaPass = new SMAAPass();

/////Bokeh //////////////////////////////////////////////////////////////

const bokehPass = new BokehPass( scene, camera, {   
       width: 1024,
       height: 512
   } );

    const effectController = {

       focus: 0,
       aperture: 60,
       maxblur: 0.01

   };

   const matChanger = function ( ) {

	bokehPass.uniforms[ "focus" ].value = effectController.focus;
	bokehPass.uniforms[ "aperture" ].value = effectController.aperture * 0.00001;
	bokehPass.uniforms[ "maxblur" ].value = effectController.maxblur;

   };

matChanger();

/////BLoom //////////////////////////////////////////////////////////////
const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(256,256))
unrealBloomPass.strength = 0.5
unrealBloomPass.radius = 0.07
unrealBloomPass.threshold = 0.99



if (debug){
    gui.add( effectController, "focus", 0, 90.0, 0.001 ).onChange( matChanger );
    gui.add( effectController, "aperture", 0, 90, 0.1 ).onChange( matChanger );
    gui.add( effectController, "maxblur", 0.01, 5, 0.001 ).onChange( matChanger );
    gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
    gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
    gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)
}
bokehPass.needsSwap = true;
composer.addPass( renderPass );
composer.addPass( gammaCorrection );
composer.addPass( unrealBloomPass );
composer.addPass( bokehPass );
// composer.addPass( effectVignette );
// composer.addPass( effectFilm );
// composer.addPass( smaaPass );


/////////////////////////////////////////////////////////////////////////
///// INSTANCE SCATTER
/////////////////////////////////////////////////////////////////////////
// function resample() {

//     if (surface2) {
//         // const vertexCount = surface2.geometry.getAttribute('position').count;
//         const surface3 = new THREE.Mesh(surface2.geometry.toNonIndexed())
//         sampler = new MeshSurfaceSampler(surface3)
//             .setWeightAttribute(api.distribution === 'weighted' ? 'color' : null)
//             .build();


//         for (let i = 0; i < count; i++) {

//             ages[i] = Math.random();
//             scales[i] = scaleCurve(ages[i]);

//             resampleParticle(i);

//         }

//         Arvore.instanceMatrix.needsUpdate = true;
//         Caule.instanceMatrix.needsUpdate = true;

//         resampled = true;
//     }
// }

// function resampleParticle(i) {

//     sampler.sample(_position, _normal);
//     _normal.add(_position);

//     dummy.position.copy(_position);

//     dummy.lookAt(_normal);
//     dummy.updateMatrix();

//     Arvore.setMatrixAt(i, dummy.matrix);
//     Arvore.castShadow = true;
//     Caule.setMatrixAt(i, dummy.matrix);
//     Caule.castShadow = true;
//     Arvore.name = 'Vegetation';

// }


/////////////////////////////////////////////////////////////////////////
///// MOUSE FUNCTIONS
/////////////////////////////////////////////////////////////////////////

function onWindowResize() {

    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    cameraOrtho.left = - width / 2;
    cameraOrtho.right = width / 2;
    cameraOrtho.top = height / 2;
    cameraOrtho.bottom = - height / 2;
    cameraOrtho.updateProjectionMatrix();

    renderer.setSize(width, height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    //Composer
    if (maxConfig || debug) composer.setSize( width, height );
}

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    posx = event.clientX - window.innerWidth / 2;
    posy = event.clientY - window.innerHeight / 2;

    if (!isMobile) {
        sprite.position.set(posx, -(posy), 1);
    }


    // console.log(camera.position)

    // raycaster.setFromCamera(mouse, camera);
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(pickableMeshes);

    // console.log(intersects.length)
    if (intersects.length > 0 & controls.enabled) {
        if (!currentIntersect) {

            // console.log(intersects[0].object.parent.name);
            if (!isMobile) {
                document.getElementById('body').style.cursor = 'pointer';
                
            }
            animarTexto();
           

        }
        currentIntersect = intersects[0].object.parent
        const condoName = currentIntersect.name.substring(2);
        nome.innerHTML = (this != `${condoName}`) ? `${condoName}` : "";
        // console.log(condoName)

        // if (currentIntersect.object.name === 'p_italia') {
        //     nome.innerHTML = (this != 'Jardins Itália') ? 'Jardins Itália' : "";
        // }

        // if (currentIntersect.object.name === 'p_verona') {
        //     nome.innerHTML = (this != 'Jardins Verona') ? 'Jardins Verona' : "";
        // }

        // if (currentIntersect.object.name === 'p_valencia') {
        //     nome.innerHTML = (this != 'Jardins Valência') ? 'Jardins Valência' : "";
        // }

        // if (currentIntersect.object.name === 'p_monaco') {
        //     nome.innerHTML = (this != 'Jardins Mônaco') ? 'Jardins Mônaco' : "";
        // }


    }
    else {
        if (currentIntersect) {
            // console.log(currentIntersect)
            // console.log('mouse leave');
            document.getElementById('body').style.cursor = 'grab';
            if (!isMobile) {
                // TWEEN.remove(cursorAnim);

                
            }

            if (controls.enabled) {
                animarTextoOut()
                
            }

        }

        currentIntersect = null
    }
}

function onMouseWheel(event) {
    if(controls.enabled){
        camera.position.y += event.deltaY / 18;
        // camera.position.clampScalar(-40, 180.0);
    }
}

function onMouseDown() {
    document.getElementById('body').style.cursor = 'grabbing';    
}

function onMouseUp() {
    document.getElementById('body').style.cursor = 'grab';

    // if (document.body.contains(instructions) && instructions.classList.contains('visible')){
    //     instructions.parentNode.removeChild(instructions);
    //     dragIcon.loop = false;
    // }
}


//////////////////////////////////////////////////
//// CLICK ON TARGET
/////////////////////////////////////////////////
function onTargetClick(event) {

    if (currentIntersect) {

        cameraTurnAndLook(currentIntersect);
        // controls.autoRotate = true;
        
        // if (currentIntersect.object.name === 'p_verona') {
        //     // console.log('click on object 2')
        //     cameraTurnAndLook(currentIntersect.object);
        //     // nome.innerHTML = "Jardins Verona";
        //     controls.enabled = false;
        // }

        new TWEEN.Tween(sprite.scale).to({
            x: 40,
            y: 40,
            z: 1
        }, 800)
        .easing(TWEEN.Easing.Cubic.InOut).start();
    }

    if (buttonContinue.classList.contains('visible')){
        continueExploration();
    }
}

/////////////////////////////////////////////////////////////////////////
///// CHANGE IMAGE ON CLICK
/////////////////////////////////////////////////////////////////////////
function changeImage(target){
    // console.log(target);
    if(target.name == "p_Utility") {
        imageUrl = 'textures/condominios/italia-portaria.jpg';
        
     }else if (target.name == "p_verona"){
        var imageUrl = 'textures/condominios/verona.jpg';

    } else if (target.name == "p_valencia"){
        var imageUrl = 'textures/condominios/valencia.jpg';
  
    }

    if(imageUrl != undefined){
        loadImage(imageUrl, (ratio) => {
            if (ratio == -1) {
            // Ratio not computable. Let's make this bar an undefined one.
            // Remember that since ratio isn't computable, calling this function
            // makes no further sense, so it won't be called again.
            progressBar.removeAttribute('value');
            } else {
            // We have progress ratio; update the bar.
            progressBar.value = ratio;
            progressBar.classList.add('show');
            }
        })
        .then(imgSrc => {
            // Loading successfuly complete; set the image and probably do other stuff.
            imgContainer.src = imgSrc;
            // buttonViewImage.classList.add('visible');
            progressBar.classList.remove('show');
        }, xhr => {
            // An error occured. We have the XHR object to see what happened.
        });
    }
}



//////////////////////////////////////////////////
//// CAMERA LOOT AT TURN
/////////////////////////////////////////////////

function cameraTurnAndLook(target) {
    clickEfect.play();
    animarTexto();
    controls.enabled = false;
    header.classList.add('up');
    header.classList.remove('down');

    // TWEEN.remove(this);
    // for (var i = 0; i < pickableMeshes.length; i++){
    //     new TWEEN.Tween(pickableMeshes[i].scale).to({x: 0, y: 0, z:0}, 500).easing(TWEEN.Easing.Circular.Out).start();

    // }  

    controls.maxPolarAngle = Math.PI *2;


    new TWEEN.Tween(controls.target).to({
        x: target.position.x,
        y: target.position.y,
        z: target.position.z
    }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut).start().onUpdate(function () {
            
        }).onComplete(function () {
            TWEEN.remove(this);
        });

    new TWEEN.Tween(camera.position).to({
        x: target.position.x + Math.PI *2,
        y: target.position.y + 0.5,
        z: target.position.z - 0.5
    }
    , 2000)
    .easing(TWEEN.Easing.Quartic.InOut).start().onUpdate(function () {
        camera.lookAt(controls.target);
    }).onComplete(function () {
        camera.lookAt(target.position)
        TWEEN.remove(this);
        // changeImage(target);
        buttonContinue.classList.add('visible');
    });     
        
}

//////////////////////////////////////////////////
//// CAMERA TRAVEL
/////////////////////////////////////////////////
// let teleport = false;
function cameraTurnTravel(target) {
    clickEfect.play();
    header.classList.add('up');
    header.classList.remove('down');
    buttonContinue.classList.add('visible');

    // takeRide = target.name;

    new TWEEN.Tween(controls.target).to({
        x: target.parent.position.x,
        y: 5,
        z: target.parent.position.z
    }, 800)
    .easing(TWEEN.Easing.Quartic.InOut)
    .start()
    .onStart(function(){
        new TWEEN.Tween({progress: 0})
        .to({ progress: 1}, 2000)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()
        .delay(200)
        .onStart(function(){
            // teleport = true;        
        })
        .onUpdate(function(value){
        })
        .onComplete(function () {
            TWEEN.remove(this);
        });
    })
    .onUpdate(function () {
        // console.log(target)
        camera.lookAt(controls.target)
    }).onComplete(function () {
        TWEEN.remove(this);

        

    });
    
}

//////////////////////////////////////////////////
//// CIRCULAR OVERLAY FOR CONDO IMAGE
/////////////////////////////////////////////////

const textureImage = textureLoader.load('textures/circle.jpg')
textureImage.encoding = THREE.sRGBEncoding;
const imageMaterial = new THREE.SpriteMaterial({color: 0xFFFFFF, transparent: true, fog: true, alphaMap: textureImage});

let spriteCircular = new THREE.Sprite( imageMaterial );
spriteCircular.center.set( 0.5, 0.5 );
spriteCircular.scale.set( 0, 0, 1 );
sceneOrtho.add( spriteCircular );
spriteCircular.position.set( 0, (!isMobile) ? height * 0.18 : height * 0.1, 1 );

//////////////////////////////////////////////////
//// DISPLAY CONDO IMAGE
/////////////////////////////////////////////////

function displayImage (){
    
    nome.classList.add('opened');
    // buttonViewImage.classList.remove('visible');
    buttonContinue.classList.remove('visible');

    new TWEEN.Tween({x: 5, y: 5}).to({x: width*3, y: width*3}, 1000)
    .easing(TWEEN.Easing.Exponential.InOut)
    .start()
    .onStart(function(){
        spriteCircular.material.opacity = 1;
    })
    .onUpdate(function (value) {
        spriteCircular.scale.set(value.x, value.y)
    }).onComplete(function () {
        TWEEN.remove(this);
        condoImage.classList.add('visible');
        zoom();
        displayImageMode = true;
        // buttonVoltar.classList.add('visible');
    });
}

//////////////////////////////////////////////////
//// HIDE CONDO IMAGE
/////////////////////////////////////////////////
function hideImage(){
    animate();
    elem.style.display = "none";
    nome.classList.remove('opened');
    condoImage.classList.remove('visible');
    imgContainer.removeAttribute('src');
    new TWEEN.Tween({x: width*3, y: width*3}).to({x: 0, y: 0}, 400)
    .easing(TWEEN.Easing.Quartic.Out)
    .start()
    .onUpdate(function (value) {
        spriteCircular.scale.set(value.x, value.y)
    }).onComplete(function () {
        TWEEN.remove(this);
        spriteCircular.material.opacity = 0;
    });
}

//////////////////////////////////////////////////
//// TELEPORT TRANSITION
/////////////////////////////////////////////////

// function createFinalScene(){
//     textureMapView = new THREE.WebGLRenderTarget(width*2, height*2, {
//         format: THREE.RGBAFormat,
//         minFilter: THREE.LinearFilter,
//         magFilter: THREE.LinearFilter,
//         anisotropy: 4,
//     })

//     textureRideView = new THREE.WebGLRenderTarget(width*2, height*2, {
//         format: THREE.RGBAFormat,
//         minFilter: THREE.LinearFilter,
//         magFilter: THREE.LinearFilter,
//         anisotropy: 4,
//     })

//     materialSceneFinal = new THREE.ShaderMaterial(
//         {
//             uniforms : {
//                 progress: {value : 0},
//                 sceneMap: { value: null},
//                 sceneRide: { value: null },
//             },
//             vertexShader: tlVertShader,
//             fragmentShader: tlFragShader
//         }
//     )

//     let geoFinal = new THREE.PlaneBufferGeometry(1,1)
//     let meshFinal = new THREE.Mesh(geoFinal, materialSceneFinal)  
//     sceneFinal.add(meshFinal);
// }

// createFinalScene();

//////////////////////////////////////////////////
//// BACK TO MAP
/////////////////////////////////////////////////
function backToMap() {
    displayImageMode = false;
    hideImage();
    clickEfect.play();
    controls.autoRotate = false;
    controls.mapMode = false;
    exitMapMode();

    buttonContinue.classList.remove('visible');
    // buttonViewImage.classList.remove('visible');
    buttonVoltar.classList.remove('visible');

    new TWEEN.Tween(elem.style).to({
        opacity: 0
    }, 700)
        .easing(TWEEN.Easing.Circular.Out).start().onComplete(function () {
            TWEEN.remove(this);

        }).onStart(function () {
            // for (var i = 0; i < pickableMeshes.length; i++){
            //     new TWEEN.Tween(pickableMeshes[i].scale).to({x: 1, y: 1, z:1}).easing(TWEEN.Easing.Circular.Out).start();
            //     // pickableMeshes[i].scale.set(1,1,1);
            // }  
            new TWEEN.Tween(camera.position).to({
                x: 20,
                y: 15,
                z: -40
            }, 2000)
                .easing(TWEEN.Easing.Exponential.InOut).start().onUpdate(function () {
                    camera.lookAt(controls.target);
                }).onComplete(function () {
                    camera.lookAt(controls.target)
                    elem.style.display = "none";
                    controls.enabled = true;
                    // controls.enableRotate = true;
                    TWEEN.remove(this);
                    header.classList.remove('up');
                    header.classList.add('down');
                    controls.maxPolarAngle = (Math.PI / 2.4);
                });

        });

}

//////////////////////////////////////////////////
//// CONTINUE EXPLORATION
/////////////////////////////////////////////////
function continueExploration() {
    clickEfect.play();
    controls.autoRotate = true;

        buttonContinue.classList.remove('visible');
        // buttonViewImage.classList.remove('visible');
        if (imgContainer.hasAttribute('src')) imgContainer.removeAttribute('src');
        animarTextoOut();
        // xhr.abort();
        progressBar.value = 0;
        progressBar.classList.remove('show');

        new TWEEN.Tween(controls.target).to({
            x: 0,
            y: 2,
            z: 0
        }, 2000)
            .easing(TWEEN.Easing.Quartic.InOut).start().onUpdate(function () {
                
            }).onComplete(function () {
                TWEEN.remove(this);
            });

        new TWEEN.Tween(camera.position).to({
            x: 20,
            y: 15,
            z: -40
        }, 2000)
        .easing(TWEEN.Easing.Exponential.InOut).start().onUpdate(function () {
            camera.lookAt(controls.target);
        }).onComplete(function () {
            camera.lookAt(controls.target)
            elem.style.display = "none";
            controls.enabled = true;
            // controls.enableRotate = true;
            header.classList.remove('up');
            header.classList.add('down');
            TWEEN.remove(this);
            controls.maxPolarAngle = (Math.PI / 2.4);
        });

}

//////////////////////////////////////////////////
//// HAMBURGUER MENU
/////////////////////////////////////////////////

function menuHamburguerAtivado() {
    clickEfect.play();
    menuCheck = document.querySelector('input[name="menu-hamburguer"]:checked');

    if (menuCheck) {
        controls.enabled = false;
    } else {
        controls.enabled = true;
    }
};


//////////////////////////////////////////////////
//// SET MAP ICON REAL IN TIME
/////////////////////////////////////////////////

// var currentParam = "camera";

// function setMapIcon(param){
//     if (param != currentParam){
//         document.getElementById("map-icon").src = "./icons/" + `${param}` + ".svg";
//         currentParam = param;
//     }
// }

//////////////////////////////////////////////////
//// NIGHT MODE
/////////////////////////////////////////////////
// mapModeButton();
function mapModeButton() {
    if (mapMode == false)
    {
        clickEfect.play();
        // renderer.shadowMap.autoUpdate = false;
        document.getElementById("map-icon").src = "./icons/camera.svg";
        document.getElementById("map-icon").classList.add('invert');
        musicButton.classList.add('invert');
        document.getElementById("menu_hamburguer").classList.add('invert');
        cloudsMaterial.color.setHex(0x000000);
        // light.intensity = 0.5;
        light.color.set(0x1eff)
        // light.color.set(0x606ca)
        ambient.color.set(0xff)
        light.position.set(-22, 3, -70);
        // ambient.intensity = 0.08;ƒ
        // unrealBloomPass.strength = 2;
        unrealBloomPass.radius = 0.1;
        unrealBloomPass.threshold = 0.2;
        scene.fog.color.set(0x000005);
        scene.background.set(0x000005);
        header.style.color = "#fff";
        mapMode = true;

        new TWEEN.Tween({intensity: 0, ambient: 0, strength: 0}).to({
            intensity: 0.5,
            ambient: 0.08,
            strength: 1.2
        }, 3000)
            .easing(TWEEN.Easing.Exponential.InOut).start().onUpdate(function (value) {
                // console.log(value);
                light.intensity = value.intensity;
                ambient.intensity = value.ambient;
                unrealBloomPass.strength = value.strength;
            }).onComplete(function () {
                TWEEN.remove(this);
            });
    } else{
        exitMapMode();
    }
};



//////////////////////////////////////////////////
//// MAP MODE
/////////////////////////////////////////////////

// function mapModeButton() {
//     if (mapMode == false)
//     {
//         controls.mapMode = true;
//         controls.enabled = false;
//         clickEfect.play();
//         mapMode = true;
//         // renderer.shadowMap.autoUpdate = false;
//         document.getElementById("map-icon").src = "./icons/camera.svg";

//         new TWEEN.Tween(camera.position).to({
//             x: camera.position.x,
//             y: 65,
//             z: camera.position.z
//         }, 2000)
//             .easing(TWEEN.Easing.Exponential.InOut).start().onUpdate(function () {
//                 camera.lookAt(controls.target);
//             }).onComplete(function () {
//                 camera.lookAt(controls.target);
//                 // controls.autoRotate = false;
//                 controls.enabled = true;
//                 TWEEN.remove(this);
//                 camera.translateZ(0);
//                 // spriteShopping.scale.set(spriteShopping.scale.x *4,spriteShopping.scale.y *4,spriteShopping.scale.z *4);
//             });
//     } else{
//         exitMapMode();
//         // renderer.shadowMap.autoUpdate = true;
//         // renderer.shadowMap.needsUpdate = true;
//     }
// };

//////////////////////////////////////////////////
//// EXIT MAP MODE
/////////////////////////////////////////////////

function exitMapMode() {
    cloudsMaterial.color.setHex(0xffffff);
    light.intensity = 5.8;
    light.color.set(0xd7af87)
    ambient.color.set(0x7e80a2)
    light.position.set(46, 1.9, 36);
    ambient.intensity = 1.9;
    unrealBloomPass.strength = 0.5
    unrealBloomPass.radius = 0.07
    unrealBloomPass.threshold = 0.99
    scene.background.set(0x90c1e8);
    scene.fog.color.set(0x80b6e8); 
    mapMode = false;
    header.style.color = "#000";
    document.getElementById("map-icon").classList.remove('invert');
    musicButton.classList.remove('invert');
    document.getElementById("menu_hamburguer").classList.remove('invert');

}

//////////////////////////////////////////////////
//// TITLE ANIMATIONS
/////////////////////////////////////////////////

var textoEntra = new TWEEN.Tween(elem.style).to({
    opacity: 1, translateY: -70
    }, 1000).delay(200)
    .easing(TWEEN.Easing.Quadratic.In).onStart(function () {
        elem.style.display = "flex";
    }).onUpdate(function () {
        //
    }).onComplete(function () {
        TWEEN.remove(this);
    });

var textoSai = new TWEEN.Tween(elem.style).to({
    opacity: 0
    }, 1000)
    .easing(TWEEN.Easing.Quadratic.In).onStart(function () {
    }).onComplete(function () {
        TWEEN.remove(this);
        elem.style.display = "none";
    })

function animarTexto() {
    textoEntra.start();
    textoSai.stop();
    new TWEEN.Tween(sprite.scale).to({
        x: 180,
        y: 180,
        z: 1
    }, 600)
        .easing(TWEEN.Easing.Cubic.InOut).start().onComplete(function () {
            TWEEN.remove(this);
        });
}

function animarTextoOut() {
    textoEntra.stop();
    textoSai.start();
    new TWEEN.Tween(sprite.scale).to({
        x: 40,
        y: 40,
        z: 1
    }, 800)
        .easing(TWEEN.Easing.Cubic.InOut).start().onComplete(function () {
            TWEEN.remove(this);
        });

}

//////////////////////////////////////////////////
//// INTERFACE ICONS ANIMATIONS
/////////////////////////////////////////////////

var tapIcon = bodymovin.loadAnimation({

    container: document.getElementById('tap-container'),
    path: 'icons/tap.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
});

var dragIcon = bodymovin.loadAnimation({

    container: document.getElementById('drag-container'),
    path: 'icons/drag-right.json',
    renderer: 'svg',
    loop: true,
    autoplay: false,
});

//////////////////////////////////////////////////
//// EXPLORE FIRST CAMERA ANIMATION
/////////////////////////////////////////////////

function exploreAnimation() {
    controls.autoRotate = true;

    if(tapIcon) tapIcon.loop = false;
    playMusic();
    buttonExplore.classList.remove('ended');

    if (debug == false) {
        introDiv.classList.add('ended');

        // remove e div loader
        new TWEEN.Tween(overlayMaterial)
            .to({ opacity: 0 }, 1000)
            .easing(TWEEN.Easing.Quartic.InOut)
            .start()
            .onComplete(function () {
                scene.remove(overlay);
                TWEEN.remove(this);
            });

        // Anima a camera
        new TWEEN.Tween(camera.position).to({
            x: 20,
            y: 15,
            z: -40
        }, 4500)
            .easing(TWEEN.Easing.Quartic.InOut).start()
            .onUpdate(function () {
                camera.lookAt(controls.target); // atualiza a posicao do target para evitar engasgos
            })
            .onStart(function () {
            })
            .onComplete(function () {
                camera.lookAt(controls.target); //olha para o target
                controls.enabled = true;
                canAnimate = true;
                // instructions.classList.add('visible');
                header.style.display = 'flex';
                header.classList.add('down');
                introDiv.parentNode.removeChild(introDiv);
                loadingBarElement.parentNode.removeChild(loadingBarElement);
                // dragIcon.play();
                TWEEN.remove(this);
                
            });
    }

    // aviao.position.set(-8, 5, -9);
    // helicoptero.position.set(-6, 4, -8);
}

//////////////////////////////////////////////////
//// PARTICLE SYSTEM
/////////////////////////////////////////////////
// let vertices = [];
// let geometry = new THREE.BufferGeometry();
// const particleCount = 400;
// var particles = [];
// const spritePartitle = new THREE.TextureLoader().load( './textures/particle.png' );

// for ( let i = 0; i < particleCount; i ++ ) {

//     const x = 800 * Math.random() - 400;
//     const y = 40 * Math.random() - 20;
//     const z = 800 * Math.random() - 400;
//     vertices.push( x, y, z );
// }

// geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

// let materialParticle = new THREE.PointsMaterial( { size: 1, sizeAttenuation: true, map: spritePartitle, alphaMap: spritePartitle, alphaTest: 0.5, transparent: true } );
// materialParticle.color.set( new THREE.Color(0x3e4266) );

// for (var i = 0; i < particleCount; i++) {
    
//     particles[i] = new THREE.Points( geometry, materialParticle );
//     // particles[i] = new THREE.Mesh( particleGeometry, particleMaterial );

//     //randomize positions
//     particles[i].position.x = Math.random() * window.innerWidth * 2 - window.innerWidth;;
//     particles[i].position.y = Math.random() * window.innerHeight * 2 - window.innerHeight;
//     particles[i].position.z = Math.random() * window.innerWidth * 2 - window.innerWidth;

//     particles[i]. direction = {
//         x: Math.random(),
//         y: Math.random(),
//     }

//     scene.add(particles[i]);
// }

//////////////////////////////////////////////////
//// MOVE ALONG SPLINE
/////////////////////////////////////////////////

// const mainRoad = [
//     [39.30022430419922, 276.9957275390625, 0.0] ,
//     [33.64874267578125, 268.2709655761719, 0.0] ,
//     [28.174224853515625, 259.7655944824219, 0.0] ,
//     [24.469337463378906, 253.45420837402344, 0.0] ,
//     [20.614673614501953, 246.6876678466797, 0.0] ,
//     [13.492613792419434, 233.17562866210938, 0.0] ,
//     [6.423304557800293, 219.69253540039062, 0.0] ,
//     [3.1489052772521973, 213.244384765625, 0.0] ,
//     [0.4007476568222046, 207.6870574951172, 0.0] ,
//     [-0.8799116611480713, 204.00283813476562, 0.0] ,
//     [-1.9245303869247437, 200.51609802246094, 0.0] ,
//     [-2.076241970062256, 197.1312255859375, 0.0] ,
//     [-2.0723249912261963, 193.5623779296875, 0.0] ,
//     [-1.405028223991394, 188.05198669433594, 0.0] ,
//     [-0.6277146935462952, 182.36795043945312, 0.0] ,
//     [0.5863856673240662, 176.88845825195312, 0.0] ,
//     [1.768083930015564, 171.70579528808594, 0.0] ,
//     [2.1889736652374268, 169.2866973876953, 0.0] ,
//     [2.5614869594573975, 167.0520477294922, 0.0] ,
//     [3.211047410964966, 163.89779663085938, 0.0] ,
//     [3.844454526901245, 160.81375122070312, 0.0] ,
//     [4.039285659790039, 159.35147094726562, 0.0] ,
//     [4.2353034019470215, 157.57080078125, 0.0] ,
//     [4.881760597229004, 150.98451232910156, 0.0] ,
//     [5.563279151916504, 143.8057098388672, 0.0] ,
//     [6.144970893859863, 135.50747680664062, 0.0] ,
//     [6.728176116943359, 127.15615844726562, 0.0] ,
//     [7.426346302032471, 119.393310546875, 0.0] ,
//     [8.015249252319336, 112.26436614990234, 0.0] ,
//     [7.396510124206543, 110.88609313964844, 0.0] ,
//     [6.7424211502075195, 110.02021026611328, 0.0] ,
//     [6.942468643188477, 108.52764892578125, 0.0] ,
//     [7.142681121826172, 107.02630615234375, 0.0] ,
//     [6.490403175354004, 106.06385040283203, 0.0] ,
//     [5.666007041931152, 105.01490783691406, 0.0] ,
//     [3.9729154109954834, 102.56217956542969, 0.0] ,
//     [2.156219482421875, 99.94255828857422, 0.0] ,
//     [-0.0278165340423584, 97.05781555175781, 0.0] ,
//     [-2.5201337337493896, 93.80934143066406, 0.0] ,
//     [-7.7279205322265625, 87.18856811523438, 0.0] ,
//     [-12.90706729888916, 80.57099914550781, 0.0] ,
//     [-15.084346771240234, 77.35771942138672, 0.0] ,
//     [-16.913389205932617, 74.4356918334961, 0.0] ,
//     [-18.261940002441406, 71.02177429199219, 0.0] ,
//     [-19.832311630249023, 66.91744232177734, 0.0] ,
//     [-24.101381301879883, 56.40082550048828, 0.0] ,
//     [-28.373043060302734, 46.01555633544922, 0.0] ,
//     [-29.971961975097656, 43.35600662231445, 0.0] ,
//     [-31.273611068725586, 41.46550369262695, 0.0] ,
//     [-32.27533721923828, 39.53972625732422, 0.0] ,
//     [-33.21403121948242, 37.59868240356445, 0.0] ,
//     [-33.822288513183594, 35.54020690917969, 0.0] ,
//     [-34.379310607910156, 33.48250198364258, 0.0] ,
//     [-34.754390716552734, 31.54996109008789, 0.0] ,
//     [-35.05633544921875, 29.529787063598633, 0.0] ,
//     [-34.80888366699219, 26.50812530517578, 0.0] ,
//     [-34.403602600097656, 23.09564781188965, 0.0] ,
//     [-32.96936798095703, 16.776473999023438, 0.0] ,
//     [-31.44827651977539, 10.285364151000977, 0.0] ,
//     [-30.08757781982422, 4.981601715087891, 0.0] ,
//     [-28.76702880859375, -0.1274758130311966, 0.0] ,
//     [-27.687562942504883, -4.477056980133057, 0.0] ,
//     [-26.67332649230957, -8.631962776184082, 0.0] ,
//     [-26.070293426513672, -11.599613189697266, 0.0] ,
//     [-25.543642044067383, -14.478448867797852, 0.0] ,
//     [-25.369619369506836, -17.6563777923584, 0.0] ,
//     [-25.31757164001465, -21.005390167236328, 0.0] ,
//     [-26.13265609741211, -25.766136169433594, 0.0] ,
//     [-26.969179153442383, -30.550731658935547, 0.0] ,
//     [-27.152950286865234, -34.162052154541016, 0.0] ,
//     [-27.204038619995117, -37.79267501831055, 0.0] ,
//     [-26.581066131591797, -42.78957748413086, 0.0] ,
//     [-25.901248931884766, -47.92850875854492, 0.0] ,
//     [-25.32701873779297, -53.1214599609375, 0.0] ,
//     [-24.772212982177734, -58.309471130371094, 0.0] ,
//     [-24.306072235107422, -63.39410400390625, 0.0] ,
//     [-23.80496597290039, -68.68960571289062, 0.0] ,
//     [-22.865554809570312, -76.19721984863281, 0.0] ,
//     [-21.920780181884766, -83.5586929321289, 0.0] ,
//     [-21.360681533813477, -87.24653625488281, 0.0] ,
//     [-20.861732482910156, -90.57963562011719, 0.0] ,
//     [-20.589595794677734, -94.03901672363281, 0.0] ,
//     [-20.31688117980957, -97.44127655029297, 0.0] ,
//     [-19.811532974243164, -100.14617919921875, 0.0] ,
//     [-19.249893188476562, -102.79264068603516, 0.0] ,
//     [-18.357982635498047, -105.55204772949219, 0.0] ,
//     [-17.40191650390625, -108.38772583007812, 0.0] ,
//     [-16.134578704833984, -111.87315368652344, 0.0] ,
//     [-14.8628568649292, -115.41205596923828, 0.0] ,
//     [-13.858556747436523, -118.83587646484375, 0.0] ,
//     [-12.959501266479492, -122.39697265625, 0.0] ,
//     [-12.845479965209961, -127.44601440429688, 0.0] ,
//     [-12.91529655456543, -133.37591552734375, 0.0] ,
//     [-14.038433074951172, -146.62655639648438, 0.0] ,
//     [-15.201496124267578, -160.024658203125, 0.0] ,
//     [-15.710495948791504, -167.5768585205078, 0.0] ,
//     [-16.175945281982422, -174.72940063476562, 0.0] ,
//     [-16.859962463378906, -183.73126220703125, 0.0] ,
//     [-17.534378051757812, -192.42376708984375, 0.0] ,
//     [-17.89420509338379, -196.17294311523438, 0.0] ,
//     [-18.229618072509766, -199.59152221679688, 0.0] ,
//     [-18.635507583618164, -204.64743041992188, 0.0] ,
//     [-19.078609466552734, -209.9652557373047, 0.0] ,
//     [-19.823366165161133, -216.26519775390625, 0.0] ,
//     [-20.574115753173828, -222.57061767578125, 0.0] ,
//     [-21.083087921142578, -227.94900512695312, 0.0] ,
//     [-21.56756019592285, -233.04739379882812, 0.0] ,
//     [-22.04880714416504, -236.27279663085938, 0.0] ,
//     [-22.529733657836914, -239.3109130859375, 0.0] ,
// ]

// let fraction = 0;
// const mainRoadNormalized = []

// // Normalize Blender Curve Positions
// for (var i = 0; i < mainRoad.length; i++) {
//     var x = mainRoad[i][0];
//     var y = mainRoad[i][1]
//     var z = mainRoad[i][2];
//     mainRoad[i] = new THREE.Vector3(x, z, -y);
//     mainRoadNormalized[i] = new THREE.Vector2(mainRoad[i].x, mainRoad[i].z)
//   }

// const shapePoints = new THREE.SplineCurve(mainRoadNormalized);


// function takeRides(){

//     if(takeRide === 'Car'){
//         carro.add(cameraRide);
//         controls.enabled = false;
//         cameraRide.lookAt(carro.position);
//         cameraRide.position.set(Math.PI*0.5 -2, 1.5, -Math.PI *2.5 +2);

//     }else if(takeRide === 'Helicoptero'){
//         helicoptero.add(cameraRide);
//         controls.enabled = false;
//         cameraRide.lookAt(helicoptero.position);
//         cameraRide.position.set(Math.PI*0.5 -16, 2, -Math.PI *2.5 +4);
//     }
// }

// function carAnimation(){
//      // Car animation
//      const newPosition = shapePoints.getPoint(fraction);
//      const tangent = shapePoints.getTangent(fraction).normalize();
//      carro.position.set(newPosition.x -0.75, 0.3, newPosition.y);
//      carro.rotation.set(0, tangent.x, 0)
     
//      fraction +=0.0002;
     
//      if (fraction > 1) {
//          fraction = 0;
//      }    
// }

// function sceneConfig(){

//     if(teleport){

//         renderer.setRenderTarget(textureMapView);
//         renderer.render(scene, camera);

//         renderer.setRenderTarget(textureRideView);
//         renderer.render(scene, cameraRide);

//         materialSceneFinal.uniforms.sceneRide.value = textureRideView.texture;
//         materialSceneFinal.uniforms.sceneMap.value = textureMapView.texture;

//         renderer.setRenderTarget(null);
//         renderer.render(sceneFinal, cameraFinal);
//     } else {
//         if (debug){
//             renderer.render(scene, camera);
//             // renderer2.render(scene, debugCamera)
//         } else{
//             renderer.render(scene, camera);
//         }
//     }

// }

let focus = {}
focus.value = 0
focus.target = focus.value
focus.easing = 0.05
const lightShift = new THREE.Vector3(0.2, 1, 0);

//////////////////////////////////////////////////
//// ANIMMATE
/////////////////////////////////////////////////
function animate() {
//    if(resampled) {


    

//         if(scene.getObjectByName('Vegetation').material.userData.shader){
//             scene.getObjectByName('Vegetation').material.userData.shader.uniforms.time.value = performance.now() / 1000;
//         }

//         // carAnimation();
        
//         // if(takeRide) takeRides();

//     }

    // if(scene.getObjectByName('PineTree').material.userData.shader){
    //     scene.getObjectByName('Vegetation').material.userData.shader.uniforms.time.value = performance.now() / 1000;
    // }

    
    delta = clock.getDelta();

    // Birds Animation Mixer
    if ( mixer ) mixer.update( delta *6);
    
    scene.traverse( function ( child ) {
        if ( child.isMesh ) {
            const shader = child.material.userData.shader;
            if ( shader ) {
                child.material.userData.shader.uniforms.time.value = performance.now() / 1000;
            }

            // if (child.material.userData.shader){
            //     child.material.userData.shader.uniforms.uTime.value = performance.now() / 1000; 
            // }
            // console.log(child.material);
        }

    } );

    // if(scene.getObjectByName('Ocean')){
    // console.log(scene.getObjectByName('Ocean').material)
    // // scene.getObjectByName('Ocean').material.shader.uniforms.time.value = performance.now() / 1000;
    // }

    // materialOcean.uniforms.uTime.value = performance.now() / 1000;
    
    TWEEN.update();
    
    if (isFocused | document.hidden) {
        controls.update();

        //Render sem efeito de linha
        if (!debug) {
            // composer.render();

            if (maxConfig){
                // default renderer
                composer.render();
            } else {
                // sceneConfig();
                //Complex effetcs renderer
                renderer.render(scene, camera);

            }
        }else{
            if (maxConfig){
                //Complex effetcs renderer
                composer.render();
            } else {
                renderer.render(scene, camera);
                // sceneConfig();
                // renderer.render(scene, debugCamera);
            }
            // composer.render();
            // renderer.render(scene, camera);
        }
       

        // Render com efeito de linha
        // effect.render(scene, camera);

        if (!isMobile) renderer.render(sceneOrtho, cameraOrtho);
        

        // Animacao do aviao
        // if (aviao) {
        //     // console.log(aviao.position.x)
        //     if (aviao.position.x > 50) {
        //         aviao.position.z = Math.random() * 5;
        //         aviao.position.x = -50;
        //     }
        //     aviao.position.x += 0.1;
        //     helice.rotation.x -= 0.4;
        // }

        if (canAnimate){
            // Animacao do Helicoptero
            if (helicoptero) {
                spotLightHeli.position.copy(new THREE.Vector3(helicoptero.position.x +1, helicoptero.position.y +3, helicoptero.position.z -1))
                // spotLightHeli.intensity = Math.cos(clock.getElapsedTime());
                // console.log(aviao.position.x)
                if (helicoptero.position.z > 35) {
                    helicoptero.position.x = Math.random() * 2;
                    helicoptero.position.z = -35;
                }
                helicoptero.position.z += 0.04;
                helice_helicoptero.rotation.y += 0.4;
                helice_rotor.rotation.x += 0.4
            }

            // Birds Animation
            if(bird){
                if(bird.position.z > 40){
                    const newBirdPosition = Math.random();
                bird.position.z =-40 *newBirdPosition;
                bird.position.x =-40 *newBirdPosition; 
                }
                bird.position.z += 0.01
                bird.position.x += 0.01
            }

            // Car Animation
            if (car){
                spotLightCar.position.copy(new THREE.Vector3(car.position.x, 0, car.position.z)).add(lightShift)
                if (car.position.x > 32){
                    car.position.x = 0;
                }else{
                    car.position.x += 0.03
                }
            }

        }

        // Ferrys Animation
        if(rodaGigante){
            rodaGigante.rotation.y += 0.01
        }

        cloudsMesh.lookAt(camera.position)
        cloudsMesh2.lookAt(camera.position)

        // Set clouds position
        cloudsMesh.position.x += 0.01;
        // cloudsMesh.position.z = - Math.cos(clock.getElapsedTime()) * 2.2;
        
        if (cloudsMesh.position.x > 45){
            cloudsMesh.position.x = -45;
            cloudsMesh.position.z = Math.random() *10;
            
        }
        
        
        cloudsMesh2.position.x -= 0.02;
        // cloudsMesh2.position.z = Math.cos(clock.getElapsedTime()) * 6.5;
        if (cloudsMesh2.position.x < -45){
            cloudsMesh2.position.x = 45;
        }

        // Wind Energy Animation
        if (windHeads){
            for (const object of windHeads) {
                object.rotation.z +=0.1;
            }
        }


        // Set fog based on Camera altitude
        // if (camera.position.y > 30){
            
        //     controls.mapMode = true;
        //     mapMode = true;

        //     if (currentParam == "map"){
        //         setMapIcon("camera");
        //         // scene.fog.near = 260;
        //         // scene.fog.far = 560;                
        //     }

        // } else {
        //     controls.mapMode = false;
        //     mapMode = false;

        //     if (currentParam == "camera"){
        //         setMapIcon("map");
        //         // scene.fog.near = 125;
        //         // scene.fog.far = 360;
        //     }
        //     /// Pins look at camera
        //     // for (const object of pickableMeshes) {
        //     //     if(object.parent.name === 'Car' || object.parent.name === 'Cube_1' || object.name === 'helicopter'){

        //     //     }else{
        //     //         object.rotation.y +=0.01;
        //     //     }
        //     // }
        // }



        // if (isMobile && camera.position.y > 150 ){
        //     scene.fog.far = 4000;
        // } else {
        //     scene.fog.far = 350;
        // }

        // Update light position based on camera position
        // if(light.target.position.distanceTo(controls.target) > 60) {
        //     light.target.position.set( controls.target.x, controls.target.y, controls.target.z );
        //     light.position.copy(controls.target).add( lightShift );
            
        // }

        // Performance degradation
        if (loadedAll == true) {
            CalculateFPS();
        }

        // Raycaster for AutoFocus
    
        raycaster2.setFromCamera(new THREE.Vector2(0,0.1), camera);
        const focusIntersects = raycaster2.intersectObjects(scene.children, true);

        if(focusIntersects.length){
            const focusIntersected = focusIntersects[0];
            if (focusIntersected.object.name != "Cloud1"){
                focus.target = Math.fround(focusIntersected.distance);
            } else if ( focusIntersected.object.name != "Cloud2") {
                focus.target = Math.fround(focusIntersects[1].distance);
            }
            // console.log(focusIntersected.object.name)
            // bokehPass.uniforms[ "focus" ].value = Math.floor(focusIntersected.distance);
        }
        
        focus.value += (focus.target - focus.value ) * focus.easing;
        bokehPass.uniforms[ "focus" ].value = Math.fround(focus.value);
        // console.log(Math.fround(focus.value) + "//" + Math.fround(focus.target));


    }


    if (debug && stats) stats.update();


    if (!displayImageMode){
        requestAnimationFrame(animate);
    }

   
    //Compass Rotation
    // camera.getWorldDirection(dir);
    // sph.setFromVector3(dir);
    // compass.style.transform = `rotate(${THREE.Math.radToDeg(sph.theta) - 180}deg)`;



    //PARTICLE SYSTEM
    // for (var i = 0; i < particleCount; i++) {
    //     particles[i].position.x += particles[i].direction.x;
    //     particles[i].position.y += particles[i].direction.y;

    //     // if edge is reached, bounce back
    //     if (particles[i].position.x < -window.innerWidth ||
    //     particles[i].position.x > window.innerWidth) {
    //         particles[i].direction.x = -particles[i].direction.x;
    //     }
    //     if (particles[i].position.y < -window.innerHeight ||
    //     particles[i].position.y > window.innerHeight) {
    //         particles[i].direction.y = -particles[i].direction.y;
    //     }
    // }
    // materialLambertGreen2.uniforms.time.value = performance.now() / 1000;
    // materialLambertGreen2.uniformsNeedUpdate = true;
    
    // materialLambertGreen2.uniforms[ 'time' ].value = .00025 * ( Date.now() );
    
}

//////////////////////////////////////////////////
//// CALCULATE FPS 
/////////////////////////////////////////////////

const clock = new THREE.Clock();

function CalculateFPS() {
    const elapsedTime = clock.getElapsedTime()
    
    if (elapsedTime < 10) {
        // console.log(elapsedTime);
        if (!lastCalledTime) {
            lastCalledTime = Date.now();
            fps = 0;
            return;
        }
        delta = (Date.now() - lastCalledTime) / 1000;
        lastCalledTime = Date.now();
        fps = 1 / delta;
        // console.log(fps)

        if (fps > 50) {
            // console.log(fps + "Half Quality")
            // renderer.shadowMap.enabled = true;
            // light.shadow.map.dispose();
            // materialLambertGreen.needsUpdate = true;
            // materialLambertWhite.needsUpdate = true;
            // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

            // renderer.shadowMap.needsUpdate = true;
            maxConfig = true;
            scene.background.set(0x90c1e8);
            scene.fog.color.set(0x80b6e8); 
        }
    }
    
}


//////////////////////////////////////////////////
//// LOADING IMAGE WITH LOADER
/////////////////////////////////////////////////
function loadImage(imageUrl, onprogress) {
  return new Promise((resolve, reject) => {
    var notifiedNotComputable = false;

    xhr.open('GET', imageUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onprogress = function(ev) {
      if (ev.lengthComputable) {
        onprogress(parseInt((ev.loaded / ev.total) * 100));
      } else {
        if (!notifiedNotComputable) {
          notifiedNotComputable = true;
          onprogress(-1);
        }
      }
    }

    xhr.onloadend = function() {
      if (!xhr.status.toString().match(/^2/)) {
        reject(xhr);
      } else {
        if (!notifiedNotComputable) {
          onprogress(100);
        }

        var options = {}
        var headers = xhr.getAllResponseHeaders();
        var m = headers.match(/^Content-Type\:\s*(.*?)$/mi);

        if (m && m[1]) {
          options.type = m[1];
        }

        var blob = new Blob([this.response], options);

        resolve(window.URL.createObjectURL(blob));
      }
    }

    xhr.send();
  });
}


//////////////////////////////////////////////////
//// DEBUGGER
/////////////////////////////////////////////////
function debuger() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    scene.remove(overlay);
    controls.autoRotate = false;
    controls.enabled = true;
    controls.enableRotate = true;
    camera.position.set(-20, 20, -20);
    controls.target.set(0,2,0)
    camera.lookAt(controls.target);
    // renderer.shadowMap.enabled = false;
}

//////////////////////////////////////////////////
//// MOBILE CONFIG
/////////////////////////////////////////////////
if(isMobile){
    controls.enableZoom = true;
    // scene.fog.near = 200;
    controls.enableRotate = true;
    camera.fov = 55;
    // camera.position.set(0,400,-80)
    camera.updateProjectionMatrix();
    // controls.maxDistance = 220;
}

animate();