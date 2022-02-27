import './main.css'
import './splitting.css';
import './splitting-cells.css';
import * as bodymovin from './lottie.min';
import * as Splitting from './splitting.min';

import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/CustomOrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { zoom } from './zoom-by-ironex.min';
import fgrVertexShader from '../static/shaders/fgrVertexShader.glsl';

// Efeitos Complexos
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
// import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
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
const instructions = document.getElementById("instructions");
const musicButton = document.getElementById("music");
const backButton = document.getElementById('voltar');
const condoImage = document.getElementById("image-display");
const loadingBarElement = document.querySelector('.loading-bar')
const imgContainer = document.getElementById("condo-image");
const progressBar = document.getElementById("progress");
const compass = document.getElementById("compass-img");
const buttonContinue = document.getElementById("btn-continue-explore");
const buttonViewImage = document.getElementById("btn-view-image");
const menuItem1 = document.getElementById("menu-item-1");
let menuCheck = document.querySelector('input[name="menu-hamburguer"]:checked');
const ftsLoader = document.querySelector(".lds-roller");
const xhr = new XMLHttpRequest();

/////////////////////////////////////////////////////////////////////////
///// MAIN VARIABLES
/////////////////////////////////////////////////////////////////////////
let camera, stats, scene, renderer, light, raycaster, model, controls, intersects, aviao, helicoptero, helice_helicoptero, helice_rotor, helice, bird;
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
const dir = new THREE.Vector3();
const sph = new THREE.Spherical();
const lightShift = new THREE.Vector3(70, 40, 10);
let resampled = false;
let gui;
let car, carro;

let takeRide = false;



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

scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3f5fc);
scene.fog = new THREE.Fog(0x2f3f5fc, 125, 660);

renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
// renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" }); //Performance issue
renderer.autoClear = false;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); //Performance
// renderer.setPixelRatio(0.8); //Performance issue
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.4;
// renderer.gammaFactor = 2.8;
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.gammaOutput = true;
renderer.shadowMap.enabled = false; //Performance main issue
// renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);
// effect = new OutlineEffect( renderer, {

// defaultThickness: 0.002

// } );

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
const api = {
    count: 3200,
    distribution: 'random',
    resample: resample
};

let Arvore;
let stemGeometry;
let stemMaterial;

let sampler;
const count = api.count;
const ages = new Float32Array(count);
const scales = new Float32Array(count);
const dummy = new THREE.Object3D();

const _position = new THREE.Vector3();
const _normal = new THREE.Vector3();

let surface2;

let pickableMeshes = [];

// Source: https://gist.github.com/gre/1650294
const easeOutCubic = function (t) {

    return (--t) * t * t + 1;

};

// Scaling curve causes particles to grow quickly, ease gradually into full scale, then
// disappear quickly. More of the particle's lifetime is spent around full scale.
const scaleCurve = function (t) {

    return Math.abs(easeOutCubic((t > 0.5 ? 1 - t : t) * 2));

};

// Arvores para instancia
const normalMapGreen = textureLoader.load('textures/greenNormal.png'); 
normalMapGreen.wrapS = THREE.RepeatWrapping;
normalMapGreen.wrapT = THREE.RepeatWrapping;
normalMapGreen.repeat.set( 40, 40 );
const materialLambertGreen = new THREE.MeshPhongMaterial({ color: 0x708c63, normalMap: normalMapGreen, normalScale: new THREE.Vector2(0.3, 0.3) });
// const materialLambertGreen2 = new THREE.MeshLambertMaterial({ color: 0x708c63 });
// const materialLambertGreen = new THREE.MeshLambertMaterial({ color: 0x395033 });

const materialLambertGreen2 = new THREE.MeshLambertMaterial({color: 0x708c63});
materialLambertGreen2.onBeforeCompile = function(shader) {

    shader.uniforms.time = { value: 0 }
    // shader.vertexShader = document.getElementById( 'vertexShader' ).textContent;
    shader.vertexShader = fgrVertexShader;
    // shader.fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
    materialLambertGreen2.userData.shader = shader;
};

loader.load('models/gltf/Flower/Flower4.glb', function (gltf) {

    const _Arvore = gltf.scene.getObjectByName('Stem');
    stemMaterial = materialLambertGreen2;
    stemGeometry = _Arvore.geometry.clone();

    const defaultTransform = new THREE.Matrix4()
    .makeRotationX(Math.PI / 2)
    .multiply(new THREE.Matrix4().makeScale(0.6, 0.6, 0.6));

    stemGeometry.applyMatrix4(defaultTransform);
    // stemGeometry.castShadow = true;

    Arvore = new THREE.InstancedMesh(stemGeometry, stemMaterial, count);
    // Arvore.frustumCulled = true;

    var translation = new Float32Array( count * 3 );
    var scale = new Float32Array( count * 3 );

    // and iterators for convenience :)
    var translationIterator = 0;
    var scaleIterator = 5;

    // and a quaternion (rotations are represented by Quaternions, not Eulers)
    var q = new THREE.Quaternion();

    for ( let i = 0; i < count; i++ ) {

        // a random position
        translation[ translationIterator++ ] = ( Math.random() - .5 ) * 1000;
        translation[ translationIterator++ ] = ( Math.random() - .5 ) * 1000;
        translation[ translationIterator++ ] = ( Math.random() - .5 ) * 1000;
  
        // randomize quaternion not sure if it's how you do it but it looks random
        q.set(  ( Math.random() - .5 ) * 2,
          ( Math.random() - .5 ) * 2,
          ( Math.random() - .5 ) * 2,
          Math.random() * Math.PI );
        q.normalize();
  
        // a random scale
        scale[ scaleIterator++ ] = 0.1 + ( Math.random() * 4 );
        scale[ scaleIterator++ ] = 0.1 + ( Math.random() * 4 );
        scale[ scaleIterator++ ] = 0.1 + ( Math.random() * 4 );
  
      }
  
    // for (let i = 0; i < count; i++) {
        
    //     // color.setHex( blossomPalette[ Math.floor( Math.random() * blossomPalette.length ) ] );
    // }

    // Instance matrices will be updated every frame.
    // Arvore.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
    // blossomMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

    // Intance matrices will not be updated every frame
    Arvore.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    // Antes resample era chamado aqui.. passei a chamar só depois
    // de carregar o pedaço que quero dar Scatter. Mas preciso ver o Async.
    // resample();

    ///////////// Instance Scatter
    //Disable Scatter
    scene.add(Arvore);
    // scene.add( blossomMesh );


});

/////////////////////////////////////////////////////////////////////////
///// AIRPLANE
/////////////////////////////////////////////////////////////////////////
const materialLambertWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });
const materialLambertWhite2 = new THREE.MeshPhongMaterial({ color: 0xffffff });
const materialLambertBlue = new THREE.MeshLambertMaterial({ color: 0x305778 });
const materialBasicRed = new THREE.MeshPhongMaterial({ color: 0x9D1A17 });
loader.load('models/gltf/aviao.glb', function (gltf) {
    aviao = gltf.scene;

    helice = gltf.scene.getObjectByName('Helice');
    helice.material = materialBasicRed;

    gltf.scene.traverse((obj) => {
        if (obj.isMesh & obj.name == "Aviao") {
            obj.material = materialLambertWhite;
            obj.castShadow = true;
        }
    });

    aviao.scale.set(2,2,2);
    aviao.position.set(-80, 17, -100);
    scene.add(aviao);

});


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
    helicoptero.scale.set(2.0, 2.0, 2.0)

    helicoptero.position.set(0, 1, -140)
    helicoptero.name = 'helicopter';
    scene.add(helicoptero);
    pickableMeshes.push(helicoptero)

});

/////////////////////////////////////////////////////////////////////////
///// CAR
/////////////////////////////////////////////////////////////////////////
loader.load('models/gltf/car.glb', function (gltf) {
    car = gltf.scene;

    // helice = gltf.scene.getObjectByName('Helice');
    // helice.material = materialBasicRed;

    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            pickableMeshes.push(obj);
        }
    });

    car.scale.set(2,2,2);
    car.name = "car";
    scene.add(car);
    carro = scene.getObjectByName('car');

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
    
    bird.scale.set(0.03, 0.03, 0.03)
    bird.position.set(-40, 8, -200)
    bird.rotation.y = 0.6;
    bird.name = 'bird';
    scene.add(bird);
    
});


//////////////////////////////////////////////////////////////
////// RAYCASTER
//////////////////////////////////////////////////////////////
mouse = new THREE.Vector2()
raycaster = new THREE.Raycaster();
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
camera = new THREE.PerspectiveCamera(31, window.innerWidth / window.innerHeight, 2, 420);
camera.position.set(-50, 300, -50);

const debugCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 1250);
let debugHelper; 
if (debug == true) {
    debugCamera.position.set(200,45,90);
    debugHelper = new THREE.CameraHelper( camera );
    scene.add( debugHelper) ;
}

cameraOrtho = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, 1, 10);
cameraOrtho.position.z = 2;
sceneOrtho = new THREE.Scene();

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
controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.target.set(6.4,-1.7,-107);
controls.enableRotate = false;
controls.screenSpacePanning = false;
controls.minDistance = 40;
controls.maxDistance = 400;
controls.enabled = false;
controls.autoRotateSpeed = 0.4;
controls.maxPolarAngle = (Math.PI / 2.2);
// controls.maxAzimuthAngle = 25

if(debug == true) debugCamera.lookAt(controls.target);

/////////////////////////////////////////////////////////////////////////
///// LIGHTS CONFIG
/////////////////////////////////////////////////////////////////////////

//Ambient Light
// const ambient = new THREE.AmbientLight(0x3e4266, 0.847); //Performance issue
const ambient = new THREE.AmbientLight(0x7e80a2, 0.82); //Performance issue


scene.add(ambient);

//Directional Light
light = new THREE.DirectionalLight(0xd7af87, 1.6); //Performance issue


// light = new THREE.DirectionalLight(0xf0dbb7, 1.6); //Performance issue
// light.position.set(20, 55, 3);
// light.position.set(10, 22, 40);
scene.add( light.target );
// light.target.position.set(20,0,0);

// light.position.set(100, 33, 100);
scene.add(light);
// Sombras dentro do Three
light.castShadow = true; // default false
light.shadow.camera.near = 10;
light.shadow.camera.far = 140;
light.shadow.camera.right = 70;
light.shadow.camera.left = - 70;
light.shadow.camera.top = 70;
light.shadow.camera.bottom = -70;
light.shadow.mapSize.width = 1192;
light.shadow.mapSize.height = 1192;
// light.shadow.radius = 40;
light.shadow.bias = -0.0001;
light.shadow.normalBias = 0.09;
// light.shadow.blurSamples = 10


// Light GUI
var params = {color: light.color.getHex(), color2: ambient.color.getHex(), color3: "#3e4266" };
const update = function () {
	var colorObj = new THREE.Color( color );
	var colorObj2 = new THREE.Color( color2 );
	var colorObj3 = new THREE.Color( params.color3 );
	light.color.set(colorObj);
	ambient.color.set(colorObj2);
    cloudsMaterial.color.set(colorObj3);
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
            }else{ 
                maxConfig = true; 
            }
        }
      };

    gui.add(light, 'intensity').min(0).max(10).step(0.0001).name('Dir intensity');
    // gui.add(light.position, 'y').min(0).max(100).step(0.00001).name('Dir Y pos');
    // gui.add(light.position, 'x').min(-100).max(100).step(0.00001).name('Dir X pos');
    // gui.add(light.position, 'z').min(-100).max(100).step(0.00001).name('Dir Z pos');
    gui.addColor(params,'color').name('Dir color').onChange(update);
    gui.addColor(params,'color2').name('Amb color').onChange(update);
    gui.addColor(params,'color3').name('Clouds color').onChange(update);
    gui.add(ambient, 'intensity').min(0).max(10).step(0.001).name('Amb intensity');
    // gui.add(renderer.shadowMap, 'enabled').name('Shadows').listen();
    gui.add(options, 'reset').name('Toggle Shadows');
    gui.add(options, 'setmaxconfig').name('Toggle Effects');

    // Directional Light Helper
    // helper = new THREE.CameraHelper( light.shadow.camera );
    // scene.add( helper );
}

/////////////////////////////////////////////////////////////////////////
///// LOADER 
/////////////////////////////////////////////////////////////////////////

const overlayMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true})

// const overlayMaterial = new THREE.ShaderMaterial({
//     uniforms:
//     {
//         uAlpha: { value: 1.0 }
//     },
//     transparent: true,
//     depthWrite: false,
//     depthTest: false,
//     alphaTest: 0.5,
//     vertexShader: `
// 					void main()
// 					{
// 						gl_Position = vec4(position, 1.0);
// 					}
// 				`,
//     fragmentShader: `
// 					uniform float uAlpha;

// 					void main()
// 					{
// 						gl_FragColor = vec4(1.0, 1.0, 1.0, uAlpha);
// 					}
// 				`
// })

const overlayGeometry = new THREE.PlaneGeometry(width *2, height, 1, 1)
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
overlay.position.set(0,60,2)
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
const cloudsMaterial = new THREE.MeshBasicMaterial({color: 0xdc9c9cd, map: cloudsTexture, transparent: true, alphaTest: 0.01, depthWrite: false})
const cloudsGeometry = new THREE.PlaneGeometry(300, 250, 1, 1)
const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
const cloudsMesh2 = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
cloudsMesh.position.set(-Math.random() *120, 120, - (Math.random() * 8));
cloudsMesh.rotation.set(- Math.PI /2, 0, 0);
scene.add(cloudsMesh);

cloudsMesh2.position.set(100, 180, -120);
cloudsMesh2.rotation.set(- Math.PI /2, 0, 0);
scene.add(cloudsMesh2);

// overlay.lookAt(camera.position)




/////////////////////////////////////////////////////////////////////////
///// LOADING MODEL
/////////////////////////////////////////////////////////////////////////
const floorTexture = textureLoader.load('textures/alphamap.jpg');

loader.load('models/gltf/map18.glb', function (gltf) {
    
    const roads = gltf.scene.getObjectByName( 'RuasSecundarias001' );
    roads.material.color = new THREE.Color(0x898eac)
    // console.log(roads)
    // console.log(gltf.scene)
    gltf.scene.traverse((o) => {
        if (o.isMesh) {
            // o.material.side = THREE.DoubleSide;

            if (o.name == 'Chao') {
                o.receiveShadow = true;
                o.material = materialLambertWhite;
                o.position.y = 0.25
                o.material.transparent = true;
                o.material.alphaMap = floorTexture;
                o.material.alphaTest = 0.1;
            }

            if (o.name == 'Predios_1') {
                o.material = materialLambertWhite2;
                // o.receiveShadow = true;
                o.castShadow = true;
            }
            // console.log(o.name.match(/p_/));
            
            if (o.name.match(/p_/)) {
                o.material = materialBasicRed;
                o.material.side = THREE.DoubleSide
                pickableMeshes.push(o);
                o.castShadow = true;
            }
            // if (o.name == 'p_verona') {
            //     o.material = materialBasicRed;
            //     o.material.side = THREE.DoubleSide
            //     pickableMeshes.push(o);
            //     o.castShadow = true;
            // }
            // if (o.name == 'p_valencia') {
            //     o.material = materialBasicRed;
            //     o.material.side = THREE.DoubleSide
            //     pickableMeshes.push(o);
            //     o.castShadow = true;
            // }
            if (o.name == 'Vegetacao_1') {
                surface2 = o;
                o.material = materialLambertGreen;
                o.receiveShadow = true;
                // o.material.color = new THREE.Color(0x708c63);
            }
            // if (o.name == 'Roads001') {
            //     // o.material.color = new THREE.Color(0x424359);
            // }
        }
    });

    scene.add(gltf.scene);

    resample();

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
document.addEventListener('wheel', onMouseWheel, false);
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
buttonViewImage.addEventListener('click', displayImage);
menuHamburguer.addEventListener('click', menuHamburguerAtivado);

/////////////////////////////////////////////////////////////////////////
///// POST PROCESSING EFFECTS
/////////////////////////////////////////////////////////////////////////

// const renderTarget = new THREE.WebGLMultisampleRenderTarget(
//     1024,
//     768,
//     {
//         minFilter: THREE.LinearFilter,
//         magFilter: THREE.LinearFilter,
//         format: THREE.RGBAFormat,
//     }
// )

const composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera );

///// VIGNETTE ///////////////////////////////////////////////////////////////

const effectVignette = new ShaderPass(VignetteShader);
effectVignette.uniforms[ "offset" ].value = 0.6;
effectVignette.uniforms[ "darkness" ].value = 2.2;

//////FILM EFFECT ////////////////////////////////////////////////////////////
// const effectFilm = new FilmPass( 0.09, 0.005, 648, false );

const gammaCorrection = new ShaderPass(GammaCorrectionShader)

// const smaaPass = new SMAAPass()

/////Bokeh //////////////////////////////////////////////////////////////

const bokehPass = new BokehPass( scene, camera, {   
       width: width,
       height: height
   } );

    const effectController = {

       focus: 55,
       aperture: 3.0,
       maxblur: 0.02

   };

   const matChanger = function ( ) {

	bokehPass.uniforms[ "focus" ].value = effectController.focus;
	bokehPass.uniforms[ "aperture" ].value = effectController.aperture * 0.00001;
	bokehPass.uniforms[ "maxblur" ].value = effectController.maxblur;

   };

   matChanger();

if (debug){
    gui.add( effectController, "focus", 0, 90.0, 0.001 ).onChange( matChanger );
    gui.add( effectController, "aperture", 0, 60, 0.1 ).onChange( matChanger );
    gui.add( effectController, "maxblur", 0.01, 5, 0.001 ).onChange( matChanger );
}
bokehPass.needsSwap = true;

composer.addPass( renderPass );
composer.addPass( effectVignette );
// composer.addPass( smaaPass );
composer.addPass( bokehPass );
composer.addPass( gammaCorrection );


/////////////////////////////////////////////////////////////////////////
///// INSTANCE SCATTER
/////////////////////////////////////////////////////////////////////////
function resample() {

    if (surface2) {
        // const vertexCount = surface2.geometry.getAttribute('position').count;
        const surface3 = new THREE.Mesh(surface2.geometry.toNonIndexed())
        sampler = new MeshSurfaceSampler(surface3)
            .setWeightAttribute(api.distribution === 'weighted' ? 'color' : null)
            .build();


        for (let i = 0; i < count; i++) {

            ages[i] = Math.random();
            scales[i] = scaleCurve(ages[i]);

            resampleParticle(i);

        }

        Arvore.instanceMatrix.needsUpdate = true;
        resampled = true;
    }
}

function resampleParticle(i) {

    sampler.sample(_position, _normal);
    _normal.add(_position);

    dummy.position.copy(_position);

    dummy.lookAt(_normal);
    dummy.updateMatrix();

    Arvore.setMatrixAt(i, dummy.matrix);
    Arvore.castShadow = true;
    Arvore.name = 'Vegetation';

}


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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    //Composer
    if (maxConfig || debug) composer.setSize( width/1.5, height/1.5 );
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

    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(pickableMeshes);

    // console.log(intersects.length)
    if (intersects.length > 0 & controls.enabled) {
        if (!currentIntersect) {

            console.log(intersects[0].object.parent.name);
            if (!isMobile) {
                document.getElementById('body').style.cursor = 'pointer';
                
            }
            if (intersects[0].object.parent.name === 'Car' || intersects[0].object.parent.name === 'Helicoptero'){

            }else{
                animarTexto();
            }

        }
        currentIntersect = intersects[0]
        const condoName = currentIntersect.object.name.substring(2);
        nome.innerHTML = (this != "Jardins " + `${condoName}`) ? "Jardins " + `${condoName}` : "";
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

    if (document.body.contains(instructions) && instructions.classList.contains('visible')){
        instructions.parentNode.removeChild(instructions);
        dragIcon.loop = false;
    }
}


//////////////////////////////////////////////////
//// CLICK ON TARGET
/////////////////////////////////////////////////
function onTargetClick(event) {

    if (currentIntersect) {
        if (currentIntersect.object.parent.name === 'Car' || currentIntersect.object.parent.name === 'Helicoptero'){
            cameraTurnTravel(currentIntersect.object.parent);
        } else{
            cameraTurnAndLook(currentIntersect.object);
            controls.autoRotate = true;
        }

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

    if (buttonContinue.classList.contains('visible') && takeRide === false){
        continueExploration();
    }
}

/////////////////////////////////////////////////////////////////////////
///// CHANGE IMAGE ON CLICK
/////////////////////////////////////////////////////////////////////////
function changeImage(target){
    // console.log(target);
    if(target.name == "p_itália") {
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
            buttonViewImage.classList.add('visible');
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

    new TWEEN.Tween(controls.target).to({
        x: target.position.x,
        y: target.position.y,
        z: target.position.z
    }, 2000)
        .easing(TWEEN.Easing.Quartic.InOut).start().onUpdate(function () {
            
        }).onComplete(function () {
            TWEEN.remove(this);
        });

    new TWEEN.Tween(camera.position).to({
        x: target.position.x + 20,
        y: target.position.y + 10,
        z: target.position.z + 40
    }
    , 2000)
    .easing(TWEEN.Easing.Quartic.InOut).start().onUpdate(function () {
        camera.lookAt(controls.target);
    }).onComplete(function () {
        camera.lookAt(target.position)
        TWEEN.remove(this);
        changeImage(target);
        buttonContinue.classList.add('visible');
    });     
        
}

//////////////////////////////////////////////////
//// CAMERA TRAVEL
/////////////////////////////////////////////////
function cameraTurnTravel(target) {
    clickEfect.play();
    header.classList.add('up');
    header.classList.remove('down');

    takeRide = target.name;
    buttonContinue.classList.add('visible');
    
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
    buttonViewImage.classList.remove('visible');
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
        buttonVoltar.classList.add('visible');
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
    buttonViewImage.classList.remove('visible');
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
                x: camera.position.x -18,
                y: camera.position.y + 10,
                z: camera.position.z + 30
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
                });

        });

}

//////////////////////////////////////////////////
//// CONTINUE EXPLORATION
/////////////////////////////////////////////////
function continueExploration() {
    clickEfect.play();
    controls.autoRotate = false;

    if(takeRide){
        takeRide = false;
        buttonContinue.classList.remove('visible');
        header.classList.remove('up');
        header.classList.add('down');
        controls.enabled = true;
        camera.position.set(camera.position.x -18, camera.position.y + 10, camera.position.z + 30);
        camera.lookAt(controls.target);
        controls.target.set(6.4,-1.7,-107)
        carro.remove(camera);
        helicoptero.remove(camera);
    } else {

        buttonContinue.classList.remove('visible');
        buttonViewImage.classList.remove('visible');
        if (imgContainer.hasAttribute('src')) imgContainer.removeAttribute('src');
        animarTextoOut();
        xhr.abort();
        progressBar.value = 0;
        progressBar.classList.remove('show');

        new TWEEN.Tween(camera.position).to({
            x: camera.position.x -18,
            y: camera.position.y + 10,
            z: camera.position.z + 30
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
        });
    }

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

var currentParam = "map";

function setMapIcon(param){
    if (param != currentParam){
        document.getElementById("map-icon").src = "./icons/" + `${param}` + ".svg";
        currentParam = param;
    }
}


//////////////////////////////////////////////////
//// MAP MODE
/////////////////////////////////////////////////

function mapModeButton() {
    if (mapMode == false)
    {
        controls.mapMode = true;
        controls.maxDistance = 390;
        controls.enabled = false;
        clickEfect.play();
        mapMode = true;
        // renderer.shadowMap.autoUpdate = false;
        document.getElementById("map-icon").src = "./icons/camera.svg";

        new TWEEN.Tween(camera.position).to({
            x: camera.position.x,
            y: 380,
            z: camera.position.z
        }, 2000)
            .easing(TWEEN.Easing.Exponential.InOut).start().onUpdate(function () {
                camera.lookAt(controls.target);
            }).onComplete(function () {
                camera.lookAt(controls.target);
                // controls.autoRotate = false;
                controls.enabled = true;
                TWEEN.remove(this);
                camera.translateZ(0);
                // spriteShopping.scale.set(spriteShopping.scale.x *4,spriteShopping.scale.y *4,spriteShopping.scale.z *4);
            });
    } else{
        exitMapMode();
        // renderer.shadowMap.autoUpdate = true;
        // renderer.shadowMap.needsUpdate = true;
    }
};

//////////////////////////////////////////////////
//// EXIT MAP MODE
/////////////////////////////////////////////////

function exitMapMode() {
    controls.mapMode = false;
    // renderer.shadowMap.autoUpdate = true;
    document.getElementById("map-icon").src = "./icons/map.svg";
    new TWEEN.Tween(camera.position).to({
        x: camera.position.x,
        y: 12,
        z: camera.position.z
    }, 2000)
    .easing(TWEEN.Easing.Exponential.InOut).start().onUpdate(function () {
        camera.lookAt(controls.target);
    }).onComplete(function () {
        
        camera.lookAt(controls.target);
        // controls.autoRotate = false;
        controls.enabled = true;
        // spriteShopping.scale.set(spriteShopping.scale.x /4,spriteShopping.scale.y /4,spriteShopping.scale.z /4)
        TWEEN.remove(this);
    });

    mapMode = false;
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
//// CREATE SPRITE TEXTS
/////////////////////////////////////////////////
function makeTextSprite( message, parameters )
{
    if ( parameters === undefined ) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
    var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
    var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;
    var metrics = context.measureText( message );

    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    // roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 4);

    context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
    context.fillText( message, borderThickness, fontsize + borderThickness);

    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;


    var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
    spriteMaterial.alphaTest = 0.5;    
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    return sprite;  
}

//////////////////////////////////////////////////
//// DEFINE SPRITES POSITIONS
/////////////////////////////////////////////////
var spriteShopping = makeTextSprite( "Shopping Flamboyant", 
{ fontface: 'Arial' , fontsize: 24, borderColor: {r:100, g:100, b:100, a:1.0}, backgroundColor: {r:0, g:0, b:0, a:0.0} } );
spriteShopping.position.set(-10.8,2,-104);
scene.add( spriteShopping );

var spriteEstadio = makeTextSprite( "Estádio Serra Dourada", 
{ fontface: 'Arial' , fontsize: 24, borderColor: {r:100, g:100, b:100, a:1.0}, backgroundColor: {r:0, g:0, b:0, a:0.0} } );
spriteEstadio.position.set(-5,2,-145);
scene.add( spriteEstadio );


if (debug ==true){
    const spritesFolder = gui.addFolder('SPRITES')
    spritesFolder.add(spriteEstadio.position, 'x').min(-200).max(200).step(0.1).name('SPRITES X');
    spritesFolder.add(spriteEstadio.position, 'y').min(-200).max(200).step(0.1).name('SPRITES Y');
    spritesFolder.add(spriteEstadio.position, 'z').min(-200).max(200).step(0.1).name('SPRITES Z');
    spritesFolder.close()
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
            x: 4,
            y: (!isMobile) ? 18 : 25,
            z: -45
        }, 3500)
            .easing(TWEEN.Easing.Quartic.InOut).start()
            .onUpdate(function () {
                camera.lookAt(controls.target); // atualiza a posicao do target para evitar engasgos
            })
            .onStart(function () {
                controls.autoRotate = false;
            })
            .onComplete(function () {
                camera.lookAt(controls.target); //olha para o target
                controls.enabled = true;
                TWEEN.remove(this);
                instructions.classList.add('visible');
                header.style.display = 'flex';
                header.classList.add('down');
                introDiv.parentNode.removeChild(introDiv);
                loadingBarElement.parentNode.removeChild(loadingBarElement);
                dragIcon.play();
                // new TWEEN.Tween(menuSobe) // anima o menu.
                //     .to({ y: 0 }, 700)
                //     .easing(TWEEN.Easing.Quartic.InOut)
                //     .onUpdate(function () {
                //         header.style.setProperty('transform', `translateY(${menuSobe.y}px)`); // atualiza a posicao do menu
                //     }).start().onComplete(function () {
                //         TWEEN.remove(this);
                //         instructions.classList.add('visible');
                //         dragIcon.play();
                //     });
                // Desliga a atualização da sombra
                // renderer.shadowMap.autoUpdate = false;
                // renderer.shadowMap.needsUpdate = true;
            });
    }

    aviao.position.set(-90, 17, -100);
    helicoptero.position.set(0, 1, -140);
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
// const geometryTest = new THREE.BoxGeometry( 1, 1, 1 );
// const materialTest = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
// const meshTest = new THREE.Mesh( geometryTest, materialTest );
// meshTest.scale.set(50,50,50)
// scene.add( meshTest );

let heartShape = new THREE.Shape();
// const x = 0, y = 0;
// heartShape.moveTo( x + 5, y + 5 );
// heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
// heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
// heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
// heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
// heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
// heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

const mainRoad = [
    [39.30022430419922, 276.9957275390625, 0.0] ,
    [33.64874267578125, 268.2709655761719, 0.0] ,
    [28.174224853515625, 259.7655944824219, 0.0] ,
    [24.469337463378906, 253.45420837402344, 0.0] ,
    [20.614673614501953, 246.6876678466797, 0.0] ,
    [13.492613792419434, 233.17562866210938, 0.0] ,
    [6.423304557800293, 219.69253540039062, 0.0] ,
    [3.1489052772521973, 213.244384765625, 0.0] ,
    [0.4007476568222046, 207.6870574951172, 0.0] ,
    [-0.8799116611480713, 204.00283813476562, 0.0] ,
    [-1.9245303869247437, 200.51609802246094, 0.0] ,
    [-2.076241970062256, 197.1312255859375, 0.0] ,
    [-2.0723249912261963, 193.5623779296875, 0.0] ,
    [-1.405028223991394, 188.05198669433594, 0.0] ,
    [-0.6277146935462952, 182.36795043945312, 0.0] ,
    [0.5863856673240662, 176.88845825195312, 0.0] ,
    [1.768083930015564, 171.70579528808594, 0.0] ,
    [2.1889736652374268, 169.2866973876953, 0.0] ,
    [2.5614869594573975, 167.0520477294922, 0.0] ,
    [3.211047410964966, 163.89779663085938, 0.0] ,
    [3.844454526901245, 160.81375122070312, 0.0] ,
    [4.039285659790039, 159.35147094726562, 0.0] ,
    [4.2353034019470215, 157.57080078125, 0.0] ,
    [4.881760597229004, 150.98451232910156, 0.0] ,
    [5.563279151916504, 143.8057098388672, 0.0] ,
    [6.144970893859863, 135.50747680664062, 0.0] ,
    [6.728176116943359, 127.15615844726562, 0.0] ,
    [7.426346302032471, 119.393310546875, 0.0] ,
    [8.015249252319336, 112.26436614990234, 0.0] ,
    [7.396510124206543, 110.88609313964844, 0.0] ,
    [6.7424211502075195, 110.02021026611328, 0.0] ,
    [6.942468643188477, 108.52764892578125, 0.0] ,
    [7.142681121826172, 107.02630615234375, 0.0] ,
    [6.490403175354004, 106.06385040283203, 0.0] ,
    [5.666007041931152, 105.01490783691406, 0.0] ,
    [3.9729154109954834, 102.56217956542969, 0.0] ,
    [2.156219482421875, 99.94255828857422, 0.0] ,
    [-0.0278165340423584, 97.05781555175781, 0.0] ,
    [-2.5201337337493896, 93.80934143066406, 0.0] ,
    [-7.7279205322265625, 87.18856811523438, 0.0] ,
    [-12.90706729888916, 80.57099914550781, 0.0] ,
    [-15.084346771240234, 77.35771942138672, 0.0] ,
    [-16.913389205932617, 74.4356918334961, 0.0] ,
    [-18.261940002441406, 71.02177429199219, 0.0] ,
    [-19.832311630249023, 66.91744232177734, 0.0] ,
    [-24.101381301879883, 56.40082550048828, 0.0] ,
    [-28.373043060302734, 46.01555633544922, 0.0] ,
    [-29.971961975097656, 43.35600662231445, 0.0] ,
    [-31.273611068725586, 41.46550369262695, 0.0] ,
    [-32.27533721923828, 39.53972625732422, 0.0] ,
    [-33.21403121948242, 37.59868240356445, 0.0] ,
    [-33.822288513183594, 35.54020690917969, 0.0] ,
    [-34.379310607910156, 33.48250198364258, 0.0] ,
    [-34.754390716552734, 31.54996109008789, 0.0] ,
    [-35.05633544921875, 29.529787063598633, 0.0] ,
    [-34.80888366699219, 26.50812530517578, 0.0] ,
    [-34.403602600097656, 23.09564781188965, 0.0] ,
    [-32.96936798095703, 16.776473999023438, 0.0] ,
    [-31.44827651977539, 10.285364151000977, 0.0] ,
    [-30.08757781982422, 4.981601715087891, 0.0] ,
    [-28.76702880859375, -0.1274758130311966, 0.0] ,
    [-27.687562942504883, -4.477056980133057, 0.0] ,
    [-26.67332649230957, -8.631962776184082, 0.0] ,
    [-26.070293426513672, -11.599613189697266, 0.0] ,
    [-25.543642044067383, -14.478448867797852, 0.0] ,
    [-25.369619369506836, -17.6563777923584, 0.0] ,
    [-25.31757164001465, -21.005390167236328, 0.0] ,
    [-26.13265609741211, -25.766136169433594, 0.0] ,
    [-26.969179153442383, -30.550731658935547, 0.0] ,
    [-27.152950286865234, -34.162052154541016, 0.0] ,
    [-27.204038619995117, -37.79267501831055, 0.0] ,
    [-26.581066131591797, -42.78957748413086, 0.0] ,
    [-25.901248931884766, -47.92850875854492, 0.0] ,
    [-25.32701873779297, -53.1214599609375, 0.0] ,
    [-24.772212982177734, -58.309471130371094, 0.0] ,
    [-24.306072235107422, -63.39410400390625, 0.0] ,
    [-23.80496597290039, -68.68960571289062, 0.0] ,
    [-22.865554809570312, -76.19721984863281, 0.0] ,
    [-21.920780181884766, -83.5586929321289, 0.0] ,
    [-21.360681533813477, -87.24653625488281, 0.0] ,
    [-20.861732482910156, -90.57963562011719, 0.0] ,
    [-20.589595794677734, -94.03901672363281, 0.0] ,
    [-20.31688117980957, -97.44127655029297, 0.0] ,
    [-19.811532974243164, -100.14617919921875, 0.0] ,
    [-19.249893188476562, -102.79264068603516, 0.0] ,
    [-18.357982635498047, -105.55204772949219, 0.0] ,
    [-17.40191650390625, -108.38772583007812, 0.0] ,
    [-16.134578704833984, -111.87315368652344, 0.0] ,
    [-14.8628568649292, -115.41205596923828, 0.0] ,
    [-13.858556747436523, -118.83587646484375, 0.0] ,
    [-12.959501266479492, -122.39697265625, 0.0] ,
    [-12.845479965209961, -127.44601440429688, 0.0] ,
    [-12.91529655456543, -133.37591552734375, 0.0] ,
    [-14.038433074951172, -146.62655639648438, 0.0] ,
    [-15.201496124267578, -160.024658203125, 0.0] ,
    [-15.710495948791504, -167.5768585205078, 0.0] ,
    [-16.175945281982422, -174.72940063476562, 0.0] ,
    [-16.859962463378906, -183.73126220703125, 0.0] ,
    [-17.534378051757812, -192.42376708984375, 0.0] ,
    [-17.89420509338379, -196.17294311523438, 0.0] ,
    [-18.229618072509766, -199.59152221679688, 0.0] ,
    [-18.635507583618164, -204.64743041992188, 0.0] ,
    [-19.078609466552734, -209.9652557373047, 0.0] ,
    [-19.823366165161133, -216.26519775390625, 0.0] ,
    [-20.574115753173828, -222.57061767578125, 0.0] ,
    [-21.083087921142578, -227.94900512695312, 0.0] ,
    [-21.56756019592285, -233.04739379882812, 0.0] ,
    [-22.04880714416504, -236.27279663085938, 0.0] ,
    [-22.529733657836914, -239.3109130859375, 0.0] ,
]

let fraction = 0;
const mainRoadNormalized = []

// Normalize Blender Curve Positions
for (var i = 0; i < mainRoad.length; i++) {
    var x = mainRoad[i][0];
    var y = mainRoad[i][1]
    var z = mainRoad[i][2];
    mainRoad[i] = new THREE.Vector3(x, z, -y);
    mainRoadNormalized[i] = new THREE.Vector2(mainRoad[i].x, mainRoad[i].z)
  }

const shapePoints = new THREE.SplineCurve(mainRoadNormalized);



function takeRides(){

    if(takeRide === 'Car'){
        carro.add(camera);
        controls.enabled = false;
        camera.lookAt(carro.position);
        camera.position.set(Math.PI*0.5 -2, 1.5, -Math.PI *2.5 +2);

    }else if(takeRide === 'Helicoptero'){
        helicoptero.add(camera);
        controls.enabled = false;
        camera.lookAt(helicoptero.position);
        camera.position.set(Math.PI*0.5 -16, 2, -Math.PI *2.5 +4);
    }
}

function carAnimation(){
     // Car animation
     const newPosition = shapePoints.getPoint(fraction);
     const tangent = shapePoints.getTangent(fraction).normalize();
     carro.position.set(newPosition.x -0.75, 0.3, newPosition.y);
     carro.rotation.set(0, tangent.x, 0)
     
     fraction +=0.0002;
     
     if (fraction > 1) {
         fraction = 0;
     }    
}


//////////////////////////////////////////////////
//// ANIMMATE
/////////////////////////////////////////////////
function animate() {
   if(resampled) {

        // Birds Animation Mixer
        var delta = clock.getDelta();
        if ( mixer ) mixer.update( delta *2);
    

        if(scene.getObjectByName('Vegetation').material.userData.shader){
            scene.getObjectByName('Vegetation').material.userData.shader.uniforms.time.value = performance.now() / 1000;
        }

        carAnimation();
        
        if(takeRide) takeRides();

    }
    
    // scene.traverse( function ( child ) {

    //     if ( child.isMesh ) {
    //         const shader = child.material.userData.shader;

    //         if ( shader ) {
                
    //             child.material.userData.shader.uniforms.time.value = performance.now() / 1000;

    //         }

    //     }

    // } );

    TWEEN.update();

    if (isFocused | document.hidden) {
        if(!takeRide) controls.update();

        //Render sem efeito de linha
        if (!debug) {
            if (maxConfig){
                // default renderer
                composer.render();
            } else {
                renderer.render(scene, camera);
                //Complex effetcs renderer
            }
        }else{
            if (maxConfig){
                //Complex effetcs renderer
                composer.render();
            } else {
                renderer.render(scene, camera);
                // renderer.render(scene, debugCamera);
            }
            // composer.render();
            // renderer.render(scene, camera);
        }
       

        // Render com efeito de linha
        // effect.render(scene, camera);

        if (!isMobile) renderer.render(sceneOrtho, cameraOrtho);
        

        // Animacao do aviao
        if (aviao) {
            // console.log(aviao.position.x)
            if (aviao.position.x > 300) {
                aviao.position.z = Math.random() * 50;
                aviao.position.x = -60;
            }
            aviao.position.x += 0.3;
            helice.rotation.x -= 0.6;
        }

        // Animacao do Helicoptero
        if (helicoptero) {
            // console.log(aviao.position.x)
            if (helicoptero.position.z > 80) {
                helicoptero.position.x = Math.random() * 50;
                helicoptero.position.z = -170;
            }
            helicoptero.position.z += 0.08;
            helice_helicoptero.rotation.y += 0.4;
            helice_rotor.rotation.x += 0.4
        }

        // Birds Animation
        if(bird){
            if(bird.position.z > 200){
                const newBirdPosition = Math.random();
              bird.position.z =-100 *newBirdPosition;
              bird.position.x =-100 *newBirdPosition; 
            }
            bird.position.z += 0.04
            bird.position.x += 0.04
        }


        // Set fog based on Camera altitude
        if (camera.position.y > 90){
            
            controls.mapMode = true;
            mapMode = true;
            // Set clouds position
            cloudsMesh.position.x += 0.09;
            cloudsMesh.position.z = - Math.cos(clock.getElapsedTime()) * 1.2;
            
            if (cloudsMesh.position.x > 320){
                cloudsMesh.position.x = -320;
                cloudsMesh.position.z = Math.random() *10;
                
            }
            
            cloudsMesh2.position.x -= 0.2;
            cloudsMesh2.position.z = - 120 + Math.cos(clock.getElapsedTime()) * 1.1;
            if (cloudsMesh2.position.x < -320){
                cloudsMesh2.position.x = 320;
            }

            if (currentParam == "map"){
                setMapIcon("camera");
                scene.fog.near = 260;
                scene.fog.far = 560;                
            }

        } else {
            controls.mapMode = false;
            mapMode = false;

            if (currentParam == "camera"){
                setMapIcon("map");
                scene.fog.near = 125;
                scene.fog.far = 360;
            }
            /// Pins look at camera
            for (const object of pickableMeshes) {
                if(object.parent.name === 'Car' || object.parent.name === 'Cube_1' || object.name === 'helicopter'){

                }else{
                    object.rotation.y +=0.01;
                }
            }
        }



        // if (isMobile && camera.position.y > 150 ){
        //     scene.fog.far = 4000;
        // } else {
        //     scene.fog.far = 350;
        // }

        // Update light position based on camera position
        light.target.position.set( controls.target.x, controls.target.y, controls.target.z );
        light.position.copy(light.target.position).add( lightShift );

        // Performance degradation
        if (loadedAll == true) {
            CalculateFPS();
        }

    }


    if (debug && stats) stats.update();


    if (!displayImageMode){
        requestAnimationFrame(animate);
    }

   
    //Compass Rotation
    camera.getWorldDirection(dir);
    sph.setFromVector3(dir);
    compass.style.transform = `rotate(${THREE.Math.radToDeg(sph.theta) - 180}deg)`;

    // Raycaster for AutoFocus
    // raycaster2.setFromCamera(new THREE.Vector2(0,-0.5), camera);
    // const focusIntersects = raycaster2.intersectObjects(scene.children, false);
    
    // if(focusIntersects.length){
    //     const focusIntersected = focusIntersects[0];
    //     bokehPass.uniforms[ "focus" ].value = focusIntersected.distance;
    //     console.log(focusIntersected);
    // }



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
            renderer.shadowMap.enabled = true;
            // light.shadow.map.dispose();
            materialLambertGreen.needsUpdate = true;
            materialLambertWhite.needsUpdate = true;
            // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

            // renderer.shadowMap.needsUpdate = true;
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
    camera.position.set(4, 10, -45);
    controls.target.set(6.4,-1.7,-107)
    camera.lookAt(controls.target);
    renderer.shadowMap.enabled = false;
}

//////////////////////////////////////////////////
//// MOBILE CONFIG
/////////////////////////////////////////////////
if(isMobile){
    controls.enableZoom = true;
    scene.fog.near = 200;
    controls.enableRotate = true;
    camera.fov = 55;
    camera.position.set(0,400,-80)
    camera.updateProjectionMatrix();
    controls.maxDistance = 220;
}

animate();