import './main.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

// Efeitos Complexos
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import glowFragmentShader from '../static/shaders/glowFragmentShader.glsl';
import glowVertexShader from '../static/shaders/glowVertexShader.glsl';

// import { MathUtils } from 'three';
// import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
// import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
// import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
// import { ACESFilmicToneMappingShader } from './jsm/shaders/ACESFilmicToneMappingShader.js';
// import { LuminosityShader } from './jsm/shaders/LuminosityShader.js';
// import { SepiaShader } from '../jsm/shaders/SepiaShader.js';
// import { SobelOperatorShader } from './jsm/shaders/SobelOperatorShader.js';
// import { OutlineEffect } from './jsm/effects/OutlineEffect.js';
// import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
// import { ReflectorRTT } from 'three/examples/jsm/objects/ReflectorRTT.js';
import { MeshReflectorMaterial } from '../static/shaders/MeshReflectorMaterial.js';

/////////////////////////////////////////////////////////////////////////
///// INTERFACE ELEMENTS
/////////////////////////////////////////////////////////////////////////
const containerTexts = document.getElementById("containerWebsite");
const nome = document.getElementById("jardins");
const buttonVoltar = document.getElementById("btnVoltar");
const buttonMapa = document.getElementById("mapmode");
const header = document.getElementById("header");
const menuHamburguer = document.getElementById("menu-hamburguer");
const introDiv = document.getElementById('intro');
const buttonExplore = document.getElementById("btnExplorar");
const titleExplorar = document.getElementById("titulo-explorar");
const subTitleExplorar = document.getElementById("sub-title-explorar");
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
let camera, stats, scene, renderer, light, raycaster, raycaster2, model, controls, controlsGame, intersects, helicoptero, helice_helicoptero, helice_rotor, helice, bird;
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
let intersectableObjects = [];
// let takeRide = false;
let pisoExterno;


/////////////////////////////////////////////////////////////////////////
///// DEBUG ENABLER
/////////////////////////////////////////////////////////////////////////
let debug = false;

if(window.location.hash) {
    
    var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
    // hash found
} else {
    introDiv.classList.add('show');
    // buttonVoltar.style.display = 'block;';
    // buttonContinue.style.display = 'block';
    ftsLoader.parentNode.removeChild(ftsLoader);
    // Splitting();
    // No hash found
}

if (hash == "debug") {
    debug = true;
    gui = new GUI();
    window.setTimeout(setLoadedAll, 500);
    ftsLoader.parentNode.removeChild(ftsLoader);
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
    // Splitting();
    // introDiv.classList.add('show');
    // buttonVoltar.style.display = 'block';
    // buttonContinue.style.display = 'block';
    // ftsLoader.parentNode.removeChild(ftsLoader);
    
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
// elem.style.display = "none";


    loadingManager = new THREE.LoadingManager(
        // Loaded
        () => {
            loadingBarElement.parentNode.removeChild(loadingBarElement);
            // scene.remove(overlay);
            gsap.to("#loading-text-intro", {y: '100%', onComplete: function(){
                
                document.getElementById("loading-text-intro").parentNode.removeChild(document.getElementById("loading-text-intro"));
                }, 
                duration: 0.9, ease: 'power3.inOut'})
                
            // introText.classList.add('ended');
            if(debug) debuger();
            // window.setTimeout(debuger, 200);

            loadedAll = true;
        
            if(!debug) introAnimation();
        },

        // Progress
        (itemUrl, itemsLoaded, itemsTotal) => {
            const progressRatio = itemsLoaded / itemsTotal
            loadingBarElement.style.transform = `scaleX(${progressRatio})`
        }
    )


//////////////////////////////////////////////////
//// INTRO ANIMATION
/////////////////////////////////////////////////

const tlIntro = gsap.timeline();
function introAnimation() {
    
        
    
    // ftsLoader.parentNode.removeChild(ftsLoader);

    loadingBarElement.style.transform = '';
    // introText.classList.add('ended');
    document.getElementById("intro").style.display = 'flex';

    // buttonExplore.classList.add('ended');
    titleExplorar.classList.add('ended');
    subTitleExplorar.classList.add('ended');
    // introDiv.classList.add('show');
    // buttonVoltar.style.display = 'block;';
    buttonContinue.style.display = 'block';
    buttonExplore.style.display = 'block';
    buttonExplore.style.opacity = '1'
    buttonExplore.style.visibility = 'visible';
    containerTexts.style.opacity = '1';


    // console.log('loaded');
    loadingBarElement.style.transform = '';
    loadingBarElement.classList.add('ended');


    tlIntro
    .to(controls.target.set(16.6, 3.4, 8.8), { x: -3.6, y: 2.74, z: -0.1, duration: 6, ease: 'sine.inOut' })
    .to(camera.position.set(16.6, 3.8, 24), {x: -7, y: 2.5, z: 24, duration: 6, ease: 'sine.inOut' }, "-=6")
//  .to(camera.position, {, duration: 2, ease: 'sine.easeIn' }, "-=2")
    .fromTo("#intro h1 span", {yPercent: 150, autoAlpha: 0}, {yPercent: 45, autoAlpha: 1, duration: 0.8, ease: 'power3.easeInOut', stagger: 0.05 }, "-=1")
    .fromTo("#intro h2 span", {yPercent: 150, autoAlpha: 0}, {yPercent: 45, autoAlpha: 1, duration: 0.7, ease: 'power3.easeInOut', stagger: 0.1 }, "-=0.6")
    .from("#intro p", {x: 120, autoAlpha: 0, duration: 0.4, ease: 'power3.easeInOut'})
    .from("#btnExplorar", {y: 150, autoAlpha: 0, duration: 0.5,
    //  onComplete: animateMenu
    }
        )
//  .from("#button-zoom", {y: "120%", autoAlpha: 0, duration: 0.5, ease: 'Elastic.easeOut', onComplete: animateMenu }, "-=0.2")

// function animateMenu(){
//     header.style.display = 'flex';
//     header.classList.add('down');
//     tlIntro.kill();
// }

}


//////////////////////////////////////////////////
//// DRACO LOADER CONFIG
/////////////////////////////////////////////////
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({ type: 'js' });

textureLoader = new THREE.TextureLoader(loadingManager);
loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);


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

scene.background = new THREE.Color(0xffffff);
// scene.fog = new THREE.Fog(new THREE.Color(0xc5c482), 35, 85);
// scene.fog = new THREE.Fog(new THREE.Color(0xffffff), 35, 75);


// sceneFinal.background = new THREE.Color(0xf3f5fc).convertLinearToGamma(2.2);
// sceneFinal.fog = new THREE.Fog(new THREE.Color(0x2f3f5fc).convertLinearToGamma(2.2), 125, 660);

renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
// renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" }); //Performance issue
renderer.autoClear = true;
renderer.setPixelRatio(2); //Performance
// renderer.setPixelRatio(0.8); //Performance issue
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.4;
// renderer.gammaFactor = 2.8;
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.gammaOutput = true;
// renderer.shadowMap.enabled = false; //Performance main issue
// renderer.shadowMap.type = THREE.VSMShadowMap;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry( 50, 50, 50 );
// invert the geometry on the x-axis so that all of the faces point inward
// geometry.scale( - 40, 40, 40 );

const texture = textureLoader.load( 'textures/je_gray_park_2k.jpg' );
texture.flipY = true;
const material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.BackSide, depthTest: false } );

const mesh = new THREE.Mesh( geometry, material );
mesh.position.set(13.9,3.3,0)
mesh.rotation.set(0, 0.8,0)

// gui.add(mesh.rotation, 'y').min(0).max(Math.PI*2).step(0.1)
// gui.add(mesh.position, 'x').min(0).max(100).step(0.1)
// gui.add(mesh.position, 'y').min(0).max(100).step(0.1)
scene.add( mesh );

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
let newEnvMap
textureLoader
.load(
    "textures/dreifaltigkeitsberg_1k.jpg",
    function (texture) {
        let exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
        // exrBackground.offset.y = 20
        // loadObjectAndAndEnvMap(); // Add envmap once the texture has been loaded
        // loadObjectAndAndEnvMap();
        texture.dispose();
    }
);

// function loadObjectAndAndEnvMap() {
//     // scene.traverse(function (child) {
//     //     //This allow us to check if the children is an instance of the Mesh constructor
//     //     if (child.isMesh) {
//     //         // child.material = new THREE.MeshStandardMaterial({
//     //         //     color: "#555",
//     //         //     roughness: 0.2,
//     //         //     metalness: 2.0,
//     //         //     envMapIntensity: 5.0
//     //         // });
//     //         //child.material.flatShading = false;

//     //         // console.log("setting envmap");
//     //         // child.material.envMap = newEnvMap;
//     //         // child.metalness= 2.0;
//     //         //Sometimes there are some vertex normals missing in the .obj files, ThreeJs will compute them
//     //         // child.material.envMapIntensity = 1.9;
//     //         // child.material.roughness = 0.8
//     //         child.material.needsUpdate = true;

//     //     }
//     //     // console.log(child)
//     // });

//     // scene.environment = newEnvMap
//     // scene.background = newEnvMap
//     // scene.environment = newEnvMap
    
    
// }




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
// const normalMapGreen = textureLoader.load('textures/MarblePolishedSlab001a_Normals.png'); 
// normalMapGreen.wrapS = THREE.RepeatWrapping;
// normalMapGreen.wrapT = THREE.RepeatWrapping;
// normalMapGreen.repeat.set( 40, 40 );
// const materialLambertGreen = new THREE.MeshPhongMaterial({ color: 0x708c63, normalMap: normalMapGreen, normalScale: new THREE.Vector2(0.3, 0.3) });
// // const materialLambertGreen2 = new THREE.MeshLambertMaterial({ color: 0x708c63 });
// // const materialLambertGreen = new THREE.MeshLambertMaterial({ color: 0x395033 });

// const materialLambertGreen2 = new THREE.MeshLambertMaterial({color: 0x21400F});
// materialLambertGreen2.onBeforeCompile = function(shader) {

//     shader.uniforms.time = { value: 0 }
//     // shader.vertexShader = document.getElementById( 'vertexShader' ).textContent;
//     shader.vertexShader = fgrVertexShader;
//     // shader.fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
//     materialLambertGreen2.userData.shader = shader;
// };

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
        // console.log( "ESCONDIDO "+ document.hidden );
        if (backgroundMusicMediaElement !== undefined & musicPlay) {
            pause();
        }
    } else {
        // console.log( "NAO ESCONDIDO "+ document.hidden );
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
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 100);
// camera.position.set(38.2, 2.85, -26.45);
camera.position.set(-9.3, 2.8, 19);

cameraGroup.add(camera)


// const debugCamera = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, -1000, 1000);
// let debugHelper; 
// if (debug == true) {
//     // debugCamera.position.set(0,0,200);
//     // scene.background = new THREE.Color(0x000000);
//     // debugHelper = new THREE.CameraHelper( camera );
//     // scene.add( debugHelper) ;
// }

// let cameraRide = new THREE.PerspectiveCamera(31, window.innerWidth / window.innerHeight, 2, 420);

// cameraOrtho = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, 1, 10);
// cameraOrtho.position.z = 2;
// sceneOrtho = new THREE.Scene();

// let cameraFinal = new THREE.OrthographicCamera(1 / - 2, 1 / 2, 1 / 2, 1 / - 2, -1000, 1000);


/////////////////////////////////////////////////////////////////////////
///// CUSTOM MOUSE CURSOR
/////////////////////////////////////////////////////////////////////////
// document.getElementById('body').style.cursor = 'grab';
// const map = textureLoader.load('textures/mouse.png');
// const materialCursor = new THREE.SpriteMaterial({ map: map });
// const sprite = new THREE.Sprite(materialCursor);
// sprite.scale.set(40, 40, 1);
// sceneOrtho.add(sprite);


/////////////////////////////////////////////////////////////////////////
///// CONTROLS
/////////////////////////////////////////////////////////////////////////
controls = new OrbitControls(camera, renderer.domElement);
// controlsGame = new PointerLockControls( camera, renderer.domElement );
controls.target.set(3.41,2,-10);
// controls.enableRotate = false;
// controls.screenSpacePanning = false;
controls.enabled = false;

// controls.autoRotateSpeed = 0.4;
// camera.lookAt(controls.target);

// var minPan = new THREE.Vector3( - 10, - 10, - 10 );
// var maxPan = new THREE.Vector3( 10, 10, 10 );
// var _v = new THREE.Vector3();

// controls.addEventListener("change", function() {
//     _v.copy(controls.target);
//     controls.target.clamp(minPan, maxPan);
//     _v.sub(controls.target);
//     camera.position.sub(_v);
// })

// if(debug == true) debugCamera.lookAt(controls.target);
// document.getElementById('easter').addEventListener( 'click', function () {

//     // controlsGame.lock();

// } );

// scene.add( controlsGame.getObject() );

// let moveForward = false;
// let moveBackward = false;
// let moveLeft = false;
// let moveRight = false;
// let canJump = false;

// // let prevTime = performance.now();
// const velocity = new THREE.Vector3();
// const direction = new THREE.Vector3();


// const onKeyDown = function ( event ) {

//     switch ( event.code ) {

//         case 'ArrowUp':
//         case 'KeyW':
//             moveForward = true;
//             break;

//         case 'ArrowLeft':
//         case 'KeyA':
//             moveLeft = true;
//             break;

//         case 'ArrowDown':
//         case 'KeyS':
//             moveBackward = true;
//             break;

//         case 'ArrowRight':
//         case 'KeyD':
//             moveRight = true;
//             break;

//         case 'Space':
//             if ( canJump === true ) velocity.y += 350;
//             canJump = false;
//             break;

//     }

// };

// const onKeyUp = function ( event ) {

//     switch ( event.code ) {

//         case 'ArrowUp':
//         case 'KeyW':
//             moveForward = false;
//             break;

//         case 'ArrowLeft':
//         case 'KeyA':
//             moveLeft = false;
//             break;

//         case 'ArrowDown':
//         case 'KeyS':
//             moveBackward = false;
//             break;

//         case 'ArrowRight':
//         case 'KeyD':
//             moveRight = false;
//             break;

//     }

// };

// document.addEventListener( 'keydown', onKeyDown );
// document.addEventListener( 'keyup', onKeyUp );

/////////////////////////////////////////////////////////////////////////
///// LIGHTS CONFIG
/////////////////////////////////////////////////////////////////////////

//Ambient Light
const ambient = new THREE.AmbientLight(0xd9d9eb, 0.15); //Performance issue
scene.add(ambient);

//Directional Light
light = new THREE.PointLight(0xefeff7, 0.196); //Performance issue
light.position.set(75, 62, -90);
scene.add(light);

/////////////////////////////////////////////////////////////////////////
///// FAKE VOLUMETRICS
/////////////////////////////////////////////////////////////////////////
// let fakeVolumetrics = new THREE.ShaderMaterial( 
// {
//     uniforms: 
//     { 
//         "c":   { type: "f", value: 0.3 },
//         "p":   { type: "f", value: 5 },
//         glowColor: { type: "c", value: new THREE.Color('#fcfcdd') },
//         viewVector: { type: "v3", value: camera.position },
//         "op": { type: "f", value: 1.0 }
//     },
//     vertexShader: glowVertexShader,
//     fragmentShader: glowFragmentShader,
//     side: THREE.FrontSide,
//     blending: THREE.AdditiveBlending,
//     transparent: true,
//     depthWrite	: false,
// });



// gui.add(fakeVolumetrics.uniforms[ "c" ], 'value').min(0).max(7).step(0.001)
// gui.add(fakeVolumetrics.uniforms[ "p" ], 'value').min(-100).max(100).step(0.001)

/////////////////////////////////////////////////////////////////////////
///// LOADING MODEL
/////////////////////////////////////////////////////////////////////////
const floorTexture = textureLoader.load('textures/normal_floor.png');
let pisoMadeira;
loader.load('models/gltf/art-gallery26.glb', function (gltf) {
    
    console.log(gltf.scene)
    gltf.scene.traverse((o) => {
    //     if (o.name.match(/p_/)) {
    //         // o.material = materialBasicRed;
    //         // o.material.side = THREE.DoubleSide
    //         // pickableMeshes.push(o);
    //         // o.castShadow = true;
    //     }

    //     if (o.name.match(/wind2_/)) {
    //         // o.material = materialBasicRed;
    //         // o.material.side = THREE.DoubleSide
    //         // windHeads.push (o);
    //         // o.castShadow = true;
    //     }

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

            // if (o.name == 'Chao_entrada') {
            //     pisoExterno = o;
            //     const pisoExternoDifuse = o.material.map;
            //     const pisoExternoNormal = o.material.normalMap;
            //     pisoExterno.material = new MeshReflectorMaterial(renderer, camera, scene, pisoExterno,
            //         {
            //             resolution: 2048,
            //             blur: [2048, 1024],
            //             mixStrength: 82.3,
            //             planeNormal: new THREE.Vector3(0, 1, 0),
            //             depthToBlurRatioBias: 0.03,
            //             mixBlur: 2.2,
            //             mixContrast: 0.92,
            //             minDepthThreshold: 0.64,
            //             maxDepthThreshold: 1.67,
            //             depthScale: 2.7,
            //             mirror: 0,
            //             bufferSamples: 8,
            //             distortionMap: pisoExternoNormal
            //         });
            //         pisoExterno.material.setValues({
            //             roughnessMap: pisoExternoNormal,
            //             map: pisoExternoDifuse,
            //             normalScale: new THREE.Vector2(0.5, 15.5),
            //             normalMap: pisoExternoNormal,
            //             emissiveMap: pisoExternoDifuse,
            //             emissive: new THREE.Color(0xffffff),
            //             emissiveIntensity: 0.49,
            //             envMapIntensity: 0.08,
            //             roughness:0.891,
            //             color: 0xffffff,
            //             // metalness: 0.5
            //         })
            //         addReflectorGUI();
            // }

            if (o.name == 'Chao_entrada') {
                pisoExterno = o;
                const pisoExternoDifuse = o.material.map;
                // const pisoExternoNormal = floorTexture;
                pisoExterno.material = new MeshReflectorMaterial(renderer, camera, scene, pisoExterno,
                    {
                        resolution: 2048,
                        blur: [1024, 1024],
                        mixStrength: 6.9,
                        planeNormal: new THREE.Vector3(0, 1, 0),
                        depthToBlurRatioBias: 0.65,
                        mixBlur: 7,
                        mixContrast: 0.42,
                        minDepthThreshold: 0.91,
                        maxDepthThreshold: 0.61,
                        depthScale: 0.4,
                        mirror: 0,
                        bufferSamples: 8,
                        // distortionMap: pisoExternoNormal
                    });
                    pisoExterno.material.setValues({
                        roughnessMap: floorTexture,
                        map: pisoExternoDifuse,
                        normalScale: new THREE.Vector2(0.3, 5.5),
                        normalMap: floorTexture,
                        emissiveMap: pisoExternoDifuse,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0,
                        // envMapIntensity: 0.02,
                        roughness:1.02,
                        color: 0xffffff,
                        // metalness: 0.5
                    })
                    addReflectorGUI();
            }

            if (o.name == 'Chao_madeira') {
                pisoMadeira = o;
                const pisoMadeiraDifuse = o.material.map;
                const pisoMadeiraNormal = o.material.normalMap
                pisoMadeira.material = new MeshReflectorMaterial(renderer, camera, scene, pisoMadeira,
                    {
                        resolution: 512,
                        blur: [1,1],
                        mixStrength: 8,
                        planeNormal: new THREE.Vector3(0, 1, 0),
                        mixContrast: 0.26,
                        // bufferSamples: 8,
                        distortionMap: pisoMadeiraNormal
                    });
                    pisoMadeira.material.setValues({
                        roughnessMap: pisoMadeiraNormal,
                        map: pisoMadeiraDifuse,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        normalMap: pisoMadeiraNormal,
                        emissiveMap: pisoMadeiraDifuse,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.62,
                        envMapIntensity: 0.08,
                        roughness:1.13,
                        color: 0xffffff,
                        // metalness: 0.5
                    })
                    addReflectorGUI2();

            }


            if (o.name.match(/Metais_/)) {
                o.material.envMap = newEnvMap;
                // console.log(rodaGigante);
                // o.receiveShadow = true;
                // o.castShadow = true;
            }

            if (o.name.match(/p_Shaders/)) {
                // o.material.envMap = newEnvMap;
                const materialVidro = new THREE.MeshPhysicalMaterial({  
                    roughness: 0,  
                    transmission: 0.85,  
                    thickness: 0.5, // Add refraction!
                    envMap: newEnvMap,
                  });
                // gui.add(materialVidro, 'roughness').min(0).max(3).step(0.01)
                // gui.add(materialVidro, 'transmission').min(0).max(1).step(0.01)
                // gui.add(materialVidro, 'thickness').min(-9).max(9).step(0.01)

                o.material = materialVidro
                o.material.needsUpdate = true;
            }

            if (o.name.match(/p_/)) {
                o.material.envMap = newEnvMap;
                pickableMeshes.push(o);
            }
            if (o.name == "fake_volume001") {
                // changedMaterial = o.material;
                changeMaterialVolume(o)


            }


            
            
            // console.log(o.name.match(/p_/));
            // if (o.name == 'Landskape_plane_Landscape_color_1_0001') {
            //     // console.log(o.name)
            //     // surface2 = o;
            //     o.material = materialLambertGreen2;
            //     o.material.side = THREE.DoubleSide

            //     // reflectorObject = o;

            //     // o.receiveShadow = true;
            // }

            // if (o.name == 'ParedesPrincipais') {
            //     // console.log(o.name)
            //     // surface2 = o;
            //     o.material.roughness = 1;
            //     // o.receiveShadow = true;
            // }
            // if (o.name == 'Paredes') {
            //     // console.log(o.name)
            //     // surface2 = o;
            //     o.material.roughness = 1;
            //     // o.receiveShadow = true;
            // }
            // if (o.name == 'Roads001') {
            //     // o.material.color = new THREE.Color(0x424359);
            // }
        }
    });
  

    scene.add(gltf.scene);
    // intersectableObjects.push(gltf.scene);
    // resample();

});

let changedMaterial;

function changeMaterialVolume(materialToBeChanged){
    changedMaterial =  new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite:  false,
    })

    changedMaterial.onBeforeCompile = function(shader) {
        shader.uniforms.c = { type: "f", value: -0.74 };
        shader.uniforms.p = { type: "f", value: 1 };
        shader.uniforms.glowColor = { type: "c", value: new THREE.Color('#fcfcdd') }; //#fcfcdd
        shader.uniforms.viewVector =  { type: "v3", value: camera.position };
        shader.uniforms.op =  { type: "f", value: 0.12 };

        shader.vertexShader= glowVertexShader
        shader.fragmentShader = glowFragmentShader

        changedMaterial.userData.shader = shader;
        // gui.add(shader.uniforms["c"], 'value').min(-1).max(1).step(0.01)
        // gui.add(shader.uniforms["p"], 'value').min(-1).max(6).step(0.01)
        // gui.add(shader.uniforms["op"], 'value').min(-1).max(1).step(0.01)
    };
    materialToBeChanged.material = changedMaterial;
    materialToBeChanged.needsUpdate = true;

    // const testSphere = new THREE.Mesh(
    //     new THREE.BoxGeometry(5,5,5,25,25,25), changedMaterial
    // )
    // scene.add(testSphere);
}

let canCheck = false;

function addReflectorGUI(){
    if (debug){
        const reflectorFolder = gui.addFolder('Reflector')
        reflectorFolder.add(pisoExterno.material, 'roughness').min(0).max(2).step(0.001)
        reflectorFolder.add(pisoExterno.material, 'envMapIntensity').min(0).max(2).step(0.001)
        reflectorFolder.add(pisoExterno.material, 'emissiveIntensity').min(0).max(2).step(0.001)
        reflectorFolder.add(pisoExterno.material, 'metalness').min(0).max(2).step(0.001)
        // reflectorFolder.addColor(pisoExterno.material, 'color')
        reflectorFolder.add(pisoExterno.material.reflectorProps, 'mixBlur').min(0).max(7).step(0.001)
        reflectorFolder.add(pisoExterno.material.reflectorProps, 'mixStrength').min(0).max(200).step(0.001)
        reflectorFolder.add(pisoExterno.material.reflectorProps, 'depthScale').min(0).max(20).step(0.1)
        reflectorFolder.add(pisoExterno.material.reflectorProps, 'mixContrast').min(0).max(7).step(0.001)
        reflectorFolder.add(pisoExterno.material.reflectorProps, 'minDepthThreshold').min(0).max(7).step(0.001)
        reflectorFolder.add(pisoExterno.material.reflectorProps, 'depthToBlurRatioBias').min(0).max(7).step(0.001)
        reflectorFolder.add(pisoExterno.material.reflectorProps, 'maxDepthThreshold').min(-5).max(7).step(0.001).onChange(function(){
            pisoExterno.material.needsUpdate = true;
        })
    }
    canCheck = true;
}

function addReflectorGUI2(){
    if (debug){
        const reflectorFolder2 = gui.addFolder('Reflector2')
        reflectorFolder2.add(pisoMadeira.material, 'roughness').min(0).max(2).step(0.001)
        reflectorFolder2.add(pisoMadeira.material, 'envMapIntensity').min(0).max(2).step(0.001)
        reflectorFolder2.add(pisoMadeira.material, 'emissiveIntensity').min(0).max(2).step(0.001)
        reflectorFolder2.add(pisoMadeira.material, 'metalness').min(0).max(2).step(0.001)
        // reflectorFolder2.addColor(pisoMadeira.material, 'color')
        reflectorFolder2.add(pisoMadeira.material.reflectorProps, 'mixBlur').min(0).max(7).step(0.001)
        reflectorFolder2.add(pisoMadeira.material.reflectorProps, 'mixStrength').min(0).max(200).step(0.001)
        reflectorFolder2.add(pisoMadeira.material.reflectorProps, 'depthScale').min(0).max(20).step(0.1)
        reflectorFolder2.add(pisoMadeira.material.reflectorProps, 'mixContrast').min(0).max(7).step(0.001)
        reflectorFolder2.add(pisoMadeira.material.reflectorProps, 'minDepthThreshold').min(0).max(7).step(0.001)
        reflectorFolder2.add(pisoMadeira.material.reflectorProps, 'depthToBlurRatioBias').min(0).max(7).step(0.001)
        reflectorFolder2.add(pisoMadeira.material.reflectorProps, 'maxDepthThreshold').min(-5).max(7).step(0.001).onChange(function(){
            pisoMadeira.material.needsUpdate = true;
        })
    }
}


/////////////////////////////////////////////////////////////////////////
///// MIRROR ON THR FLOR
/////////////////////////////////////////////////////////////////////////
// const mirrorBack1 = new Reflector(
//     new THREE.PlaneBufferGeometry(10, 10),
//     {
//         clipBias: 0.001, 
//         textureWidth: window.innerWidth * window.devicePixelRatio,
//         textureHeight: window.innerHeight * window.devicePixelRatio,
//         color: 0x777777, 
//         recursion: 2,
//     }
// )
// mirrorBack1.scale.set(5,5,5)
// mirrorBack1.rotation.set(-1.573,0,0)
// mirrorBack1.position.y =  0.2
// mirrorBack1.position.x = -10
// // mirrorBack1.transparent = true;
// // mirrorBack1.alpha = 0.1;
// scene.add(mirrorBack1)






/////////////////////////////////////////////////////////////////////////
///// MIRROR ON THR FLOR 2
/////////////////////////////////////////////////////////////////////////
// const frame = new NodeFrame();
// const planeGeo = new THREE.PlaneGeometry( 20.1, 20.1 );
// const planeGeo2 = new THREE.PlaneGeometry( 20.1, 20.1 );
// const woodNormal = textureLoader.load( 'textures/wood_normal.jpg' );
// woodNormal.wrapS = woodNormal.wrapT = THREE.RepeatWrapping;
// woodNormal.repeat.set(20,20)
// const coresChao = new THREE.TextureLoader().load( 'textures/chao.jpg' );

// const decalDiffuse = new THREE.TextureLoader().load( 'textures/chao.jpg' );
// decalDiffuse.wrapS = decalDiffuse.wrapT = THREE.RepeatWrapping;
// decalDiffuse.repeat.set(20,20)

// let groundMirror;
// let groundMirror2;
// let blurMirror;
// let blurMirror2;

// let geometryEspelho, groundMirrorMaterial;
// let geometryEspelho2, groundMirrorMaterial2;

// reflector/mirror plane
// geometryEspelho = new THREE.PlaneGeometry( 20, 20 );
// geometryEspelho2 = new THREE.PlaneGeometry( 20, 20 );
// groundMirror = new ReflectorRTT( geometryEspelho, {
//     clipBias: 0.01,
//     textureWidth: window.innerWidth/4 * window.devicePixelRatio,
//     textureHeight: window.innerHeight/4 * window.devicePixelRatio
// } );
// groundMirror2 = new ReflectorRTT( geometryEspelho2, {
//     clipBias: 0.01,
//     textureWidth: window.innerWidth * window.devicePixelRatio,
//     textureHeight: window.innerHeight * window.devicePixelRatio
// } );

// const mask = new SwitchNode( new TextureNode( decalDiffuse ), 'rgb' );

// const mirror = new ReflectorNode( groundMirror );
// const mirror2 = new ReflectorNode( groundMirror2 );

// const normalMap = new TextureNode( decalNormal );
// const normalXY = new SwitchNode( normalMap, 'xy' );
// const normalXYFlip = new MathNode(
//     normalXY,
//     MathNode.INVERT
// );

// const offsetNormal = new OperatorNode(
//     normalXYFlip,
//     new FloatNode( 0 ),
//     OperatorNode.ADD
// );

// mirror.offset = new OperatorNode(
//     offsetNormal, // normal
//     new FloatNode(2), // scale
//     OperatorNode.MUL
// );

// blurMirror = new BlurNode( mirror );
// blurMirror.size = new THREE.Vector2(
//     window.innerWidth/2 * window.devicePixelRatio,
//     window.innerHeight/2 * window.devicePixelRatio
// );
// blurMirror.uv = new ExpressionNode( 'projCoord.xyz / projCoord.q', 'vec3' );
// blurMirror.uv.keywords[ 'projCoord' ] =  mirror.uv
// blurMirror.radius.x = blurMirror.radius.y = 4;

// blurMirror2 = new BlurNode( mirror2 );
// blurMirror2.size = new THREE.Vector2(
//     window.innerWidth * window.devicePixelRatio,
//     window.innerHeight * window.devicePixelRatio
// );
// blurMirror2.uv = new ExpressionNode( 'projCoord.xyz / projCoord.q', 'vec3' );
// blurMirror2.uv.keywords[ 'projCoord' ] =  mirror2.uv
// blurMirror2.radius.x = blurMirror2.radius.y = 2;

// // gui.add( { blur: blurMirror.radius.x }, 'blur', 0, 25 ).onChange( function ( v ) {

// //     blurMirror.radius.x = blurMirror.radius.y = v;

// // } );

// groundMirrorMaterial = new PhongNodeMaterial();
// groundMirrorMaterial2 = new PhongNodeMaterial();
// groundMirrorMaterial.environment = blurMirror; // or add "mirror" variable to disable blur
// groundMirrorMaterial2.environment = blurMirror2; // or add "mirror" variable to disable blur
// // groundMirrorMaterial.environmentAlpha = mask;
// groundMirrorMaterial.normal = new NormalMapNode( normalMap );
// groundMirrorMaterial.normalScale = new FloatNode( 10 );

// test serialization
/*
        let library = {};
        library[ groundMirror.uuid ] = groundMirror;
        library[ decalDiffuse.uuid ] = decalDiffuse;
        library[ decalNormal.uuid ] = decalNormal;
        library[ mirror.textureMatrix.uuid ] = mirror.textureMatrix; // use textureMatrix to projection
        let json = groundMirrorMaterial.toJSON();
        groundMirrorMaterial = new NodeMaterialLoader( null, library ).parse( json );
    */
//--

// const mirrorMesh = new THREE.Mesh( planeGeo, groundMirrorMaterial );
// // add all alternative mirror materials inside the ReflectorRTT to prevent:
// // glDrawElements: Source and destination textures of the draw are the same.
// groundMirror.add( mirrorMesh );
// groundMirror.rotateX( - Math.PI / 2 );
// groundMirror.position.set(16.9, -0.001, 7.5);
// groundMirror.scale.set(1.75,1.2,1);
// scene.add( groundMirror );


// const mirrorMesh2 = new THREE.Mesh( planeGeo2, groundMirrorMaterial2 );
// groundMirror2.add( mirrorMesh2 );
// groundMirror2.rotateX( - Math.PI / 2 );
// groundMirror2.position.set(-10, -0.001, 9.1)
// groundMirror2.scale.set(1,0.79, 1)
// // groundMirror.position.x = -10
// scene.add( groundMirror2 );


// gui.add( groundMirror2.position, 'x').min(-10).max(10).step(0.001);
// gui.add( groundMirror2.position, 'y').min(-10).max(10).step(0.001);
// gui.add( groundMirror2.position, 'z').min(-10).max(10).step(0.001);
// gui.add( groundMirror2.scale, 'x').min(-10).max(10).step(0.001);
// gui.add( groundMirror2.scale, 'y').min(-10).max(10).step(0.001);
// gui.add( groundMirror2.scale, 'z').min(-10).max(10).step(0.001);

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
composer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

///// VIGNETTE ///////////////////////////////////////////////////////////////

const effectVignette = new ShaderPass(VignetteShader);
effectVignette.uniforms[ "offset" ].value = 0.6;
effectVignette.uniforms[ "darkness" ].value = 0.5;

//////FILM EFFECT ////////////////////////////////////////////////////////////
// const effectFilm = new FilmPass( .09, 0, 0, false );

const gammaCorrection = new ShaderPass(GammaCorrectionShader)

// const smaaPass = new SMAAPass(width, height);

/////Bokeh //////////////////////////////////////////////////////////////

// const bokehPass = new BokehPass( scene, camera, {   
//        width: 512,
//        height: 512
//    } );

//     const effectController = {

//        focus: 0,
//        aperture: 0,
//        maxblur: 0.01

//    };

//    const matChanger = function ( ) {

// 	bokehPass.uniforms[ "focus" ].value = effectController.focus;
// 	bokehPass.uniforms[ "aperture" ].value = effectController.aperture * 0.00001;
// 	bokehPass.uniforms[ "maxblur" ].value = effectController.maxblur;

//    };

// matChanger();

/////BLoom //////////////////////////////////////////////////////////////
const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(256,256))
unrealBloomPass.strength = 0.18
unrealBloomPass.radius = 0.4
unrealBloomPass.threshold = 0.98

///////////RGBSHIFT/////////////////////////////////////////////////////
const rgbShift = new ShaderPass(RGBShiftShader);
rgbShift.uniforms[ "amount" ].value = 0.0006
rgbShift.uniforms[ "angle" ].value = 0.5

/////////// DISTORT ////////////////////////////////////////////////////
function getDistortionShaderDefinition()
{
    return {

        uniforms: {
            "tDiffuse":         { type: "t", value: null },
            "strength":         { type: "f", value: 0 },
            "height":           { type: "f", value: 1 },
            "aspectRatio":      { type: "f", value: 1 },
            "cylindricalRatio": { type: "f", value: 1 }
        },

        vertexShader: [
            "uniform float strength;",          // s: 0 = perspective, 1 = stereographic
            "uniform float height;",            // h: tan(verticalFOVInRadians / 2)
            "uniform float aspectRatio;",       // a: screenWidth / screenHeight
            "uniform float cylindricalRatio;",  // c: cylindrical distortion ratio. 1 = spherical

            "varying vec3 vUV;",                // output to interpolate over screen
            "varying vec2 vUVDot;",             // output to interpolate over screen

            "void main() {",
                "gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));",

                "float scaledHeight = strength * height;",
                "float cylAspectRatio = aspectRatio * cylindricalRatio;",
                "float aspectDiagSq = aspectRatio * aspectRatio + 1.0;",
                "float diagSq = scaledHeight * scaledHeight * aspectDiagSq;",
                "vec2 signedUV = (2.0 * uv + vec2(-1.0, -1.0));",

                "float z = 0.5 * sqrt(diagSq + 1.0) + 0.5;",
                "float ny = (z - 1.0) / (cylAspectRatio * cylAspectRatio + 1.0);",

                "vUVDot = sqrt(ny) * vec2(cylAspectRatio, 1.0) * signedUV;",
                "vUV = vec3(0.5, 0.5, 1.0) * z + vec3(-0.5, -0.5, 0.0);",
                "vUV.xy += uv;",
            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform sampler2D tDiffuse;",      // sampler of rendered scene?s render target
            "varying vec3 vUV;",                // interpolated vertex output data
            "varying vec2 vUVDot;",             // interpolated vertex output data

            "void main() {",
                "vec3 uv = dot(vUVDot, vUVDot) * vec3(-0.5, -0.5, -1.0) + vUV;",
                "gl_FragColor = texture2DProj(tDiffuse, uv);",
            "}"
        ].join("\n")

    };
}

var distortEffect = new ShaderPass( getDistortionShaderDefinition() );
distortEffect.uniforms[ "strength" ].value = 0.52;
distortEffect.uniforms[ "height" ].value = Math.tan(THREE.Math.degToRad(85) / 2) / camera.aspect;;
distortEffect.uniforms[ "aspectRatio" ].value = camera.aspect;
distortEffect.uniforms[ "cylindricalRatio" ].value = 2;

if (debug){
    // gui.add( effectController, "focus", 0, 90.0, 0.001 ).onChange( matChanger );
    // gui.add( effectController, "aperture", 0, 90, 0.1 ).onChange( matChanger );
    // gui.add( effectController, "maxblur", 0.01, 5, 0.001 ).onChange( matChanger );
}
composer.addPass( renderPass );
// composer.addPass( bokehPass );
// composer.addPass( rgbShift );
composer.addPass( gammaCorrection );
composer.addPass( unrealBloomPass );
// composer.addPass( effectFilm );
composer.addPass( distortEffect );
composer.addPass( effectVignette );
// composer.addPass( smaaPass );
// distortEffect.renderToScreen = true;



/////////////////////////////////////////////////////////////////////////
///// MOUSE FUNCTIONS
/////////////////////////////////////////////////////////////////////////

function onWindowResize() {

    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // cameraOrtho.left = - width / 2;
    // cameraOrtho.right = width / 2;
    // cameraOrtho.top = height / 2;
    // cameraOrtho.bottom = - height / 2;
    // cameraOrtho.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(1)
    //Composer
    if (maxConfig || debug) composer.setSize( width, height );

    // groundMirror.getRenderTarget().setSize(
    //     window.innerWidth/4 * window.devicePixelRatio,
    //     window.innerHeight/4 * window.devicePixelRatio
    // );

    // blurMirror.size.set(
    //     window.innerWidth/2 * window.devicePixelRatio,
    //     window.innerHeight/2 * window.devicePixelRatio
    // );
    
    // blurMirror.updateFrame();

    // groundMirror2.getRenderTarget().setSize(
    //     window.innerWidth/4 * window.devicePixelRatio,
    //     window.innerHeight/4 * window.devicePixelRatio
    // );

    // blurMirror2.size.set(
    //     window.innerWidth/2 * window.devicePixelRatio,
    //     window.innerHeight/2 * window.devicePixelRatio
    // );
    
    // blurMirror2.updateFrame();
}

const cursor = {}
cursor.x = 0
cursor.y = 0

function onMouseMove(event) {
    // console.log(composer.passes)

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    cursor.x = event.clientX / window.innerWidth - 0.5
    cursor.y = event.clientY / window.innerHeight - 0.5

    // if (!isMobile) {
    //     sprite.position.set(posx, -(posy), 1);
    // }


    // console.log(`Camera : ${camera.position.x} , ${camera.position.y}, ${camera.position.z}`)
    // console.log(controls.target)

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

        currentIntersect = intersects[0].object
        const clickableitemName = currentIntersect.name.substring(2);
        let resultTest = clickableitemName.replace(/_/g, " ");
        nome.innerHTML = (this != `${resultTest}`) ? `${resultTest}` : "";
    }
    else {
        if (currentIntersect) {
            // console.log('mouse leave');
            document.getElementById('body').style.cursor = 'grab';

            if (controls.enabled) {
                animarTextoOut()
                
            }

        }

        currentIntersect = null
    }
}

function onMouseDown() {
    document.getElementById('body').style.cursor = 'grabbing';    
}

function onMouseUp() {
    document.getElementById('body').style.cursor = 'grab';

}

//////////////////////////////////////////////////
//// CLICK ON TARGET
/////////////////////////////////////////////////
function onTargetClick() {

    if (currentIntersect && document.getElementById('body').style.cursor != 'grabbing' ) {
        cameraTurnAndLook(currentIntersect);
        nomeDiv.parentElement.style.opacity = '0';
    }
}

/////////////////////////////////////////////////////////////////////////
///// CHANGE IMAGE ON CLICK
/////////////////////////////////////////////////////////////////////////
// function changeImage(target){
//     // console.log(target);
//     if(target.name == "p_Utility") {
//         imageUrl = 'textures/condominios/italia-portaria.jpg';
        
//      }else if (target.name == "p_verona"){
//         var imageUrl = 'textures/condominios/verona.jpg';

//     } else if (target.name == "p_valencia"){
//         var imageUrl = 'textures/condominios/valencia.jpg';
  
//     }

//     if(imageUrl != undefined){
//         loadImage(imageUrl, (ratio) => {
//             if (ratio == -1) {
//             // Ratio not computable. Let's make this bar an undefined one.
//             // Remember that since ratio isn't computable, calling this function
//             // makes no further sense, so it won't be called again.
//             progressBar.removeAttribute('value');
//             } else {
//             // We have progress ratio; update the bar.
//             progressBar.value = ratio;
//             progressBar.classList.add('show');
//             }
//         })
//         .then(imgSrc => {
//             // Loading successfuly complete; set the image and probably do other stuff.
//             imgContainer.src = imgSrc;
//             // buttonViewImage.classList.add('visible');
//             progressBar.classList.remove('show');
//         }, xhr => {
//             // An error occured. We have the XHR object to see what happened.
//         });
//     }
// }



/////////////////////////////////////////////////
//// CAMERA LOOT AT TURN
/////////////////////////////////////////////////
const tlCameraLook = gsap.timeline()
function cameraTurnAndLook(target) {
    // clickEfect.play();
    controls.enabled = false;
    // header.classList.add('up');
    // header.classList.remove('down');
    // controls.minDistance = 0;

    tlCameraLook
    .to(controls.target, { x: target.position.x -2, y: target.position.y, z: target.position.z, duration: 3, ease: 'power1.inOut' })
    .to(camera.position, { x: target.position.x, y: target.position.y + 0.5, z: -target.rotation.z + 6, duration: 3, ease: 'power1.inOut'}, "-=3")
    buttonContinue.classList.add('visible');
    
        
}

//////////////////////////////////////////////////
//// CAMERA TRAVEL
/////////////////////////////////////////////////
// // let teleport = false;
// function cameraTurnTravel(target) {
//     clickEfect.play();
//     header.classList.add('up');
//     header.classList.remove('down');
//     buttonContinue.classList.add('visible');

//     // takeRide = target.name;

//     new TWEEN.Tween(controls.target).to({
//         x: target.parent.position.x,
//         y: 5,
//         z: target.parent.position.z
//     }, 800)
//     .easing(TWEEN.Easing.Quartic.InOut)
//     .start()
//     .onStart(function(){
//         new TWEEN.Tween({progress: 0})
//         .to({ progress: 1}, 2000)
//         .easing(TWEEN.Easing.Quartic.InOut)
//         .start()
//         .delay(200)
//         .onStart(function(){
//             // teleport = true;        
//         })
//         .onUpdate(function(value){
//         })
//         .onComplete(function () {
//             TWEEN.remove(this);
//         });
//     })
//     .onUpdate(function () {
//         // console.log(target)
//         camera.lookAt(controls.target)
//     }).onComplete(function () {
//         TWEEN.remove(this);

        

//     });
    
// }

//////////////////////////////////////////////////
//// CIRCULAR OVERLAY FOR CONDO IMAGE
/////////////////////////////////////////////////

// const textureImage = textureLoader.load('textures/circle.jpg')
// textureImage.encoding = THREE.sRGBEncoding;
// const imageMaterial = new THREE.SpriteMaterial({color: 0xFFFFFF, transparent: true, fog: true, alphaMap: textureImage});

// let spriteCircular = new THREE.Sprite( imageMaterial );
// spriteCircular.center.set( 0.5, 0.5 );
// spriteCircular.scale.set( 0, 0, 1 );
// sceneOrtho.add( spriteCircular );
// spriteCircular.position.set( 0, (!isMobile) ? height * 0.18 : height * 0.1, 1 );

//////////////////////////////////////////////////
//// DISPLAY CONDO IMAGE
/////////////////////////////////////////////////

// function displayImage (){
    
//     nome.classList.add('opened');
//     // buttonViewImage.classList.remove('visible');
//     buttonContinue.classList.remove('visible');

//     new TWEEN.Tween({x: 5, y: 5}).to({x: width*3, y: width*3}, 1000)
//     .easing(TWEEN.Easing.Exponential.InOut)
//     .start()
//     .onStart(function(){
//         spriteCircular.material.opacity = 1;
//     })
//     .onUpdate(function (value) {
//         spriteCircular.scale.set(value.x, value.y)
//     }).onComplete(function () {
//         TWEEN.remove(this);
//         condoImage.classList.add('visible');
//         zoom();
//         displayImageMode = true;
//         // buttonVoltar.classList.add('visible');
//     });
// }

//////////////////////////////////////////////////
//// HIDE CONDO IMAGE
/////////////////////////////////////////////////
// function hideImage(){
//     animate();
//     elem.style.display = "none";
//     nome.classList.remove('opened');
//     condoImage.classList.remove('visible');
//     imgContainer.removeAttribute('src');
//     new TWEEN.Tween({x: width*3, y: width*3}).to({x: 0, y: 0}, 400)
//     .easing(TWEEN.Easing.Quartic.Out)
//     .start()
//     .onUpdate(function (value) {
//         spriteCircular.scale.set(value.x, value.y)
//     }).onComplete(function () {
//         TWEEN.remove(this);
//         spriteCircular.material.opacity = 0;
//     });
// }

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
    // hideImage();
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
    // controls.autoRotate = true;

    buttonContinue.classList.remove('visible');
    nomeDiv.parentElement.style.opacity = '1';
    nomeDiv.style.opacity = '0';

    // buttonViewImage.classList.remove('visible');
    // animarTextoOut();
    
    tlCameraLook
    .to(camera.position, {x: camera.position.x, y: 3.4, z: camera.position.z+6, duration: 2, ease: 'power1.inOut' })
    .to(controls.target, { x: controls.target.x, y: controls.target.y, z: controls.target.z, duration: 2, ease: 'power1.inOut', onComplete: enableControls }, "-=2");

    // header.classList.remove('up');
    // header.classList.add('down');

        // new TWEEN.Tween(controls.target).to({
        //     x: 0,
        //     y: 2,
        //     z: 0
        // }, 2000)
        //     .easing(TWEEN.Easing.Quartic.InOut).start().onUpdate(function () {
                
        //     }).onComplete(function () {
        //         TWEEN.remove(this);
        //     });

        // new TWEEN.Tween(camera.position).to({
        //     x: 20,
        //     y: 15,
        //     z: -40
        // }, 2000)
        // .easing(TWEEN.Easing.Exponential.InOut).start().onUpdate(function () {
        //     camera.lookAt(controls.target);
        // }).onComplete(function () {
        //     camera.lookAt(controls.target)
        //     elem.style.display = "none";
        //     controls.enabled = true;
        //     // controls.enableRotate = true;
        //     TWEEN.remove(this);
        //     controls.maxPolarAngle = (Math.PI / 2.4);
        //     controls.minDistance = 15;
        // });

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
        document.getElementById("menu-list").classList.add('invert');
        document.getElementById("menu_hamburguer").classList.add('invert');
        // cloudsMaterial.color.setHex(0x000000);
        // light.intensity = 0.5;
        light.color.set(0x1eff)
        // light.color.set(0x606ca)
        ambient.color.set(0xff)
        light.position.set(-22, 3, -70);
        // ambient.intensity = 0.08;ƒ
        // unrealBloomPass.strength = 2;
        // unrealBloomPass.radius = 0.1;
        // unrealBloomPass.threshold = 0.2;
        scene.fog.color.set(0x000005);
        scene.background.set(0x000005);
        header.style.color = "#fff";
        mapMode = true;
        composer.insertPass(unrealBloomPass,1);
        // composer.removePass( bokehPass );
        composer.removePass( gammaCorrection );

        new TWEEN.Tween({intensity: 0, ambient: 0}).to({
            intensity: 0.4,
            ambient: 0.08,
        }, 3000)
            .easing(TWEEN.Easing.Exponential.InOut).start().onUpdate(function (value) {
                // console.log(value);
                light.intensity = value.intensity;
                ambient.intensity = value.ambient;
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
    // cloudsMaterial.color.setHex(0xffffff);
    light.intensity = 5.8;
    light.color.set(0xd7af87)
    ambient.color.set(0x7e80a2)
    light.position.set(46, 1.9, 36);
    ambient.intensity = 1.9;
    // unrealBloomPass.strength = 0.5
    // unrealBloomPass.radius = 0.07
    // unrealBloomPass.threshold = 0.99
    scene.background.set(0x90c1e8);
    scene.fog.color.set(0x80b6e8); 
    mapMode = false;
    header.style.color = "#000";
    document.getElementById("map-icon").classList.remove('invert');
    musicButton.classList.remove('invert');
    document.getElementById("menu_hamburguer").classList.remove('invert');
    document.getElementById("menu-list").classList.remove('invert');
    composer.removePass( unrealBloomPass );
    // composer.insertPass(bokehPass,1);
    composer.insertPass( gammaCorrection,2 );
}

//////////////////////////////////////////////////
//// TITLE ANIMATIONS
/////////////////////////////////////////////////

// var textoEntra = new TWEEN.Tween(elem.style).to({
//     opacity: 1, translateY: -70
//     }, 1000).delay(200)
//     .easing(TWEEN.Easing.Quadratic.In).onStart(function () {
//         elem.style.display = "flex";
//     }).onUpdate(function () {
//         //
//     }).onComplete(function () {
//         TWEEN.remove(this);
//     });

// var textoSai = new TWEEN.Tween(elem.style).to({
//     opacity: 0
//     }, 1000)
//     .easing(TWEEN.Easing.Quadratic.In).onStart(function () {
//     }).onComplete(function () {
//         TWEEN.remove(this);
//         elem.style.display = "none";
//     })

let nomeDiv = document.getElementById("nome")   
function animarTexto() {
    gsap.to(nomeDiv, {yPercent: -50, duration: 0.8, opacity: 1, ease: 'power4.easeInOut'})
    // new TWEEN.Tween(sprite.scale).to({
    //     x: 180,
    //     y: 180,
    //     z: 1
    // }, 600)
    //     .easing(TWEEN.Easing.Cubic.InOut).start().onComplete(function () {
    //         TWEEN.remove(this);
    //     });
}

function animarTextoOut() {
    gsap.to(nomeDiv, {yPercent: 0, duration: 0.8, opacity: 0, ease: 'power3.easeIn'})

    // new TWEEN.Tween(sprite.scale).to({
    //     x: 40,
    //     y: 40,
    //     z: 1
    // }, 800)
    //     .easing(TWEEN.Easing.Cubic.InOut).start().onComplete(function () {
    //         TWEEN.remove(this);
    //     });

}

//////////////////////////////////////////////////
//// INTERFACE ICONS ANIMATIONS
/////////////////////////////////////////////////

// var tapIcon = bodymovin.loadAnimation({

//     container: document.getElementById('tap-container'),
//     path: 'icons/tap.json',
//     renderer: 'svg',
//     loop: true,
//     autoplay: true,
// });

// var dragIcon = bodymovin.loadAnimation({

//     container: document.getElementById('drag-container'),
//     path: 'icons/drag-right.json',
//     renderer: 'svg',
//     loop: true,
//     autoplay: false,
// });

//////////////////////////////////////////////////
//// EXPLORE FIRST CAMERA ANIMATION
/////////////////////////////////////////////////
const tlExplore = gsap.timeline();
function exploreAnimation() {

    // if(tapIcon) tapIcon.loop = false;
    // playMusic();
    buttonExplore.classList.remove('ended');

    if (debug == false) {
        introDiv.classList.add('ended');

        
        tlExplore
        .to(controls.target, { x: 10, y: 3.4, z: 14, duration: 3, ease: 'power1.inOut' })
        .to(camera.position, {x: -2, y: 3.4, z: 16, duration: 3, ease: 'power1.inOut'}, "-=3")

        .to(camera.position, {x: 5.5, y: 3.4, z: 13.95, duration: 4, ease: 'power3.inOut' })
        .to(controls.target, { x: 10, y: 3, z: 8.8, duration: 4, ease: 'power3.inOut', onComplete: enableControls }, "-=4");
    }

    // aviao.position.set(-8, 5, -9);
    // helicoptero.position.set(-6, 4, -8);
}

function enableControls(){
    camera.lookAt(controls.target)
    controls.enabled = true;
    controls.minDistance = 0;
    controls.maxDistance = 80;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.3;
    tlExplore.kill();
    canAnimate = true;
}

//////////////////////////////////////////////////
//// GUI
//////////////////////////////////////////////////
var params = {color: light.color.getHex(), 
    color2: ambient.color.getHex(), 
    color3: scene.background.getHex(),} 
    // color4: scene.fog.color.getHex()};
const update = function () {
	var colorObj = new THREE.Color( params.color );
	var colorObj2 = new THREE.Color( params.color2 );
	var colorObj3 = new THREE.Color( params.color3 );
	var colorObj4 = new THREE.Color( params.color4 );
	light.color.set(colorObj);
	ambient.color.set(colorObj2);
    scene.background.set(colorObj3);
	// scene.fog.color.set(colorObj4);
};



if (debug ==true){
    let helper;

    var options = {
        setmaxconfig: function() {
            if (maxConfig) {
                maxConfig = false; 
                // scene.background.set(0xaae1ff);
                // scene.background.set(0xe1f2ff);
                // // scene.fog.color.set(0x91d4ff); 
                // scene.fog.color.set(0xdff5fa); 
                // composer.removePass( bokehPass );

            }else{ 
                maxConfig = true; 

                // scene.background.set(0xaae1ff);
                // scene.background.set(0x90c1e8);
                // // scene.fog.color.set(0x91d4ff); 
                // scene.fog.color.set(0x80b6e8); 
                // console.log('here');
            }
        },
        nightMode: function(){
            mapModeButton();
            // update();
            if (mapMode) {
                // maxConfig = false; 
                // scene.background.set(0xaae1ff);
                // scene.background.set(0xe1f2ff);
                // // scene.fog.color.set(0x91d4ff); 
                // scene.fog.color.set(0xdff5fa); 
                scene.fog.color.set(0x000005);
                scene.background.set(0x000005);

            }else{ 
                // maxConfig = true; 
                // scene.background.set(0xaae1ff);
                scene.background.set(0x90c1e8);
                // scene.fog.color.set(0x91d4ff); 
                scene.fog.color.set(0x80b6e8); 
                // console.log('here');
            }
        }
      };
    const lightFolder = gui.addFolder('Lights')
    const sceneFolder = gui.addFolder('Scene config')
    lightFolder.add(light, 'intensity').min(0).max(10).step(0.0001).name('Dir intensity');
    lightFolder.add(light.position, 'y').min(0).max(100).step(0.00001).name('Dir Y pos');
    lightFolder.add(light.position, 'x').min(-100).max(100).step(0.00001).name('Dir X pos');
    lightFolder.add(light.position, 'z').min(-100).max(100).step(0.00001).name('Dir Z pos');
    lightFolder.addColor(params,'color').name('Main color').onChange(update);
    lightFolder.addColor(params,'color2').name('Amb color').onChange(update);
    lightFolder.add(ambient, 'intensity').min(0).max(10).step(0.001).name('Amb intensity');
    sceneFolder.addColor(params,'color3').name('Bg color').onChange(update);
    // sceneFolder.addColor(params,'color4').name('Fog color').onChange(update);
    // gui.add(renderer.shadowMap, 'enabled').name('Shadows').listen();
    // gui.add(options, 'reset').name('Toggle Shadows');
    const bloomFolder = gui.addFolder('Bloom pass')
    bloomFolder.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
    bloomFolder.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
    bloomFolder.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)
    gui.add(options, 'setmaxconfig').name('Post-effects?');
    gui.add(options, 'nightMode').name('Night mode?');

    // Directional Light Helper
    // helper = new THREE.CameraHelper( light.shadow.camera );
    // scene.add( helper );
}

let focus = {}
focus.value = 0
focus.target = focus.value
focus.easing = 0.08

// const clock = new THREE.Clock()
let previousTime = 0
// let prevTime = performance.now();

//////////////////////////////////////////////////
//// ANIMMATE
/////////////////////////////////////////////////
function animate() {

    // overlay.lookAt(camera.position)


    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    // frame.update( deltaTime ).updateNode( groundMirrorMaterial );
    // frame.update( deltaTime ).updateNode( groundMirrorMaterial2 );
    // frame.update( deltaTime ).updateNode( blurMirror );


    // if (canAnimate){
        
    //     const parallaxY = - cursor.y *2
    //     cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.8 * deltaTime
    // } else{
        const parallaxY = - cursor.y
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 2 * deltaTime

        const parallaxX = cursor.x
        cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 2 * deltaTime
    // }
    
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

    
    // Birds Animation Mixer
    // if ( mixer ) mixer.update( deltaTime *2);
    
    // scene.traverse( function ( child ) {
    //     if ( child.isMesh ) {
    //         const shader = child.material.userData.shader;
    //         if ( shader ) {
    //             child.material.userData.shader.uniforms.time.value = performance.now() / 1000;
    //         }

    //         // if (child.material.userData.shader){
    //         //     child.material.userData.shader.uniforms.uTime.value = performance.now() / 1000; 
    //         // }
    //         // console.log(child.material);
    //     }

    // } );

    // if(scene.getObjectByName('Ocean')){
    // console.log(scene.getObjectByName('Ocean').material)
    // // scene.getObjectByName('Ocean').material.shader.uniforms.time.value = performance.now() / 1000;
    // }

    // materialOcean.uniforms.uTime.value = performance.now() / 1000;
    
    // TWEEN.update();
    
    if (isFocused | document.hidden) {


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

        if (pisoExterno && !isMobile) pisoExterno.material.update();
        if (pisoMadeira && !isMobile) pisoMadeira.material.update();
       

        // Render com efeito de linha
        // effect.render(scene, camera);

        // if (!isMobile) renderer.render(sceneOrtho, cameraOrtho);
        

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

        // if (canAnimate){
        //     // Animacao do Helicoptero
        //     if (helicoptero) {
        //         spotLightHeli.position.copy(new THREE.Vector3(helicoptero.position.x +1, helicoptero.position.y +3, helicoptero.position.z -1))
        //         // spotLightHeli.intensity = Math.cos(clock.getElapsedTime());
        //         // console.log(aviao.position.x)
        //         if (helicoptero.position.z > 35) {
        //             helicoptero.position.x = Math.random() * 2;
        //             helicoptero.position.z = -35;
        //         }
        //         helicoptero.position.z += 0.04;
        //         helice_helicoptero.rotation.y += 0.4;
        //         helice_rotor.rotation.x += 0.4
        //     }

        //     // Birds Animation
        //     if(bird){
        //         if(bird.position.z > 40){
        //             const newBirdPosition = Math.random();
        //         bird.position.z =-40 *newBirdPosition;
        //         bird.position.x =-40 *newBirdPosition; 
        //         }
        //         bird.position.z += 0.01
        //         bird.position.x += 0.01
        //     }

        //     // Car Animation
        //     if (car){
        //         spotLightCar.position.copy(new THREE.Vector3(car.position.x, 0, car.position.z)).add(lightShift)
        //         if (car.position.x > 32){
        //             car.position.x = 0;
        //         }else{
        //             car.position.x += 0.03
        //         }
        //     }

        //     // Set clouds position
        //     cloudsMesh.position.x += 0.01;
        //     // cloudsMesh.position.z = - Math.cos(clock.getElapsedTime()) * 2.2;
            
        //     if (cloudsMesh.position.x > 45){
        //         cloudsMesh.position.x = -45;
        //         cloudsMesh.position.z = Math.random() *10;
                
        //     }
            
            
        //     cloudsMesh2.position.x -= 0.02;
        //     // cloudsMesh2.position.z = Math.cos(clock.getElapsedTime()) * 6.5;
        //     if (cloudsMesh2.position.x < -45){
        //         cloudsMesh2.position.x = 45;
        //     }


        // }

        // // Ferrys Animation
        // if(rodaGigante){
        //     rodaGigante.rotation.y += 0.01
        // }

        // cloudsMesh.lookAt(camera.position)
        // cloudsMesh2.lookAt(camera.position)

        
        // // Wind Energy Animation
        // if (windHeads){
        //     for (const object of windHeads) {
        //         object.rotation.z +=0.1;
        //     }
        // }


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
        // if (loadedAll == true) {
        //     CalculateFPS();
        // }

        // Shot a Raycaster for AutoFocus
        // raycaster2.setFromCamera(new THREE.Vector2(0,0), camera);

        // // Store intersected raycaster objects from the scene
        // const focusIntersects = raycaster2.intersectObjects(intersectableObjects, true);

        // // Check if the there is an object intersected
        // if(focusIntersects.length){
        //     // Store the first intersected object
        //     const focusIntersected = focusIntersects[0];
        //     // Set the distantce from object 
        //     focus.target = Math.fround(focusIntersected.distance);
        // }
        // //Create the easing for the smooth focus
        // focus.value += (focus.target - focus.value ) * focus.easing;
        
        // //Set Bokeh Pass focus value to smooth value
        // bokehPass.uniforms[ "focus" ].value = Math.fround(focus.value);


    }


    // if (debug && stats) 
    stats.update();

  

    // const time = performance.now();

    // if ( controlsGame.isLocked === true ) {

    //     const delta = ( time - prevTime ) / 1000;

    //     velocity.x -= velocity.x * 30.0 * delta;
    //     velocity.z -= velocity.z * 30.0 * delta;

    //     velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    //     direction.z = Number( moveForward ) - Number( moveBackward );
    //     direction.x = Number( moveRight ) - Number( moveLeft );
    //     direction.normalize(); // this ensures consistent movements in all directions

    //     if ( moveForward || moveBackward ) velocity.z -= direction.z * 300.0 * delta;
    //     if ( moveLeft || moveRight ) velocity.x -= direction.x * 300.0 * delta;

    //     controlsGame.moveRight( - velocity.x * delta );
    //     controlsGame.moveForward( - velocity.z * delta );

    //     controlsGame.getObject().position.y += ( velocity.y * delta ); // new behavior

    //     if ( controlsGame.getObject().position.y < 2.9 ) {

    //         velocity.y = 0;
    //         controlsGame.getObject().position.y = 2.9;

    //         canJump = true;

    //     }

    // } else {
        controls.update();
    // }

    // prevTime = time;

   
    //Compass Rotation
    // camera.getWorldDirection(dir);
    // sph.setFromVector3(dir);
    // compass.style.transform = `rotate(${THREE.Math.radToDeg(sph.theta) - 180}deg)`;

    // if (    particles.position.x < -30){
    //     particles.position.x = 30    
    // }
    // particles.position.x -= 0.02
    // particles.position.z = Math.sin(clock.getElapsedTime()/6) 
    

    // PARTICLE SYSTEM
    // for (var i = 0; i < particlesCount; i++) {
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
    
    // if (changedMaterial){
    //     console.log(changedMaterial)
        
    //     changedMaterial.userData.shader.uniforms[ 'viewVector' ].value = camera.position;
    // }
    // materialLambertGreen2.uniforms[ 'time' ].value = .00025 * ( Date.now() );
    requestAnimationFrame(animate);
    
}

//////////////////////////////////////////////////
//// CALCULATE FPS 
/////////////////////////////////////////////////

const clock = new THREE.Clock();

function CalculateFPS() {
    // const elapsedTime = clock.getElapsedTime()
    
    // if (elapsedTime < 8) {
    //     // console.log(elapsedTime);
    //     if (!lastCalledTime) {
    //         lastCalledTime = Date.now();
    //         fps = 0;
    //         return;
    //     }
    //     delta = (Date.now() - lastCalledTime) / 1000;
    //     lastCalledTime = Date.now();
    //     fps = 1 / delta;
    //     // console.log(fps)

    //     if (fps > 50 && !isMobile) {
    //         // console.log(fps + "Half Quality")
    //         // renderer.shadowMap.enabled = true;
    //         // light.shadow.map.dispose();
    //         // materialLambertGreen.needsUpdate = true;
    //         // materialLambertWhite.needsUpdate = true;
    //         // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    //         // renderer.shadowMap.needsUpdate = true;
    //         // maxConfig = true;
    //         scene.background.set(0x90c1e8);
    //         scene.fog.color.set(0x80b6e8); 
    //     }
    // }
    
}


//////////////////////////////////////////////////
//// LOADING IMAGE WITH LOADER
/////////////////////////////////////////////////
// function loadImage(imageUrl, onprogress) {
//   return new Promise((resolve, reject) => {
//     var notifiedNotComputable = false;

//     xhr.open('GET', imageUrl, true);
//     xhr.responseType = 'arraybuffer';

//     xhr.onprogress = function(ev) {
//       if (ev.lengthComputable) {
//         onprogress(parseInt((ev.loaded / ev.total) * 100));
//       } else {
//         if (!notifiedNotComputable) {
//           notifiedNotComputable = true;
//           onprogress(-1);
//         }
//       }
//     }

//     xhr.onloadend = function() {
//       if (!xhr.status.toString().match(/^2/)) {
//         reject(xhr);
//       } else {
//         if (!notifiedNotComputable) {
//           onprogress(100);
//         }

//         var options = {}
//         var headers = xhr.getAllResponseHeaders();
//         var m = headers.match(/^Content-Type\:\s*(.*?)$/mi);

//         if (m && m[1]) {
//           options.type = m[1];
//         }

//         var blob = new Blob([this.response], options);

//         resolve(window.URL.createObjectURL(blob));
//       }
//     }

//     xhr.send();
//   });
// }

//////////////////////////////////////////////////
//// DEBUGGER
/////////////////////////////////////////////////
stats = new Stats();
// document.body.appendChild(stats.dom);
function debuger() {
    // scene.remove(overlay);
    // controls.autoRotate = false;
    controls.enabled = true;
    camera.position.set(7.19, 3.08, 11.67);
    controls.target.set(9.05,3.33,11.09);
    // camera.lookAt(controls.target)
    // camera.updateProjectionMatrix();
    containerTexts.style.opacity = '1';
    // document.getElementById("loading-text-intro").parentNode.removeChild(document.getElementById("loading-text-intro"));
    // loadingBarElement.parentNode.removeChild(loadingBarElement);

}

//////////////////////////////////////////////////
//// MOBILE CONFIG
/////////////////////////////////////////////////
if(isMobile){
    controls.enableZoom = true;
    // scene.fog.near = 200;
    controls.enableRotate = true;
    // camera.fov = 35;
    // controls.maxDistance = 60;
    // camera.position.set(0,400,-80)
    camera.updateProjectionMatrix();
    // controls.maxDistance = 220;
}

animate();