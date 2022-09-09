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
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { MeshReflectorMaterial } from '../static/shaders/MeshReflectorMaterial.js';
import glowFragmentShader from '../static/shaders/glowFragmentShader.glsl';
import glowVertexShader from '../static/shaders/glowVertexShader.glsl';
// import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
// import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
// import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';


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
let camera, stats, scene, renderer, light, raycaster, controls, intersects;
let mapMode = false;
let mouse = new THREE.Vector2();
let firstPlay = true;
let listener, backgroundMusic, backgroundMusicFile, backgroundMusicMediaElement, loaderAudio, textureLoader, loader, loadingManager, mixer;
let isMobile = false;
let musicPlay = false;
let lastCalledTime, delta, fps;
let loadedAll = false;
let gui;
let pickableMeshes = [];
let pisoExterno;
let changedMaterial;


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
scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.autoClear = true;
renderer.setPixelRatio(2); //Performance
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.4;
// renderer.gammaFactor = 2.8;
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.gammaOutput = true;

container.appendChild(renderer.domElement);

/////////////////////////////////////////////////////////////////////////
///// FAKE SKY
/////////////////////////////////////////////////////////////////////////
const skyGeometry = new THREE.SphereBufferGeometry( 50, 50, 50 );
const skyTexture = textureLoader.load( 'textures/je_gray_park_2k.jpg' );
skyTexture.flipY = true;
const skyMaterial = new THREE.MeshBasicMaterial( { map: skyTexture, side: THREE.BackSide, depthTest: false } );
const skyMesh = new THREE.Mesh( skyGeometry, skyMaterial );
skyMesh.position.set(13.9,3.3,0)
skyMesh.rotation.set(0, 0.8,0)
scene.add( skyMesh );
// gui.add(mesh.rotation, 'y').min(0).max(Math.PI*2).step(0.1)
// gui.add(mesh.position, 'x').min(0).max(100).step(0.1)
// gui.add(mesh.position, 'y').min(0).max(100).step(0.1)

/////////////////////////////////////////////////////////////////////////
///// ENVMAP LOADER
/////////////////////////////////////////////////////////////////////////
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
let newEnvMap
textureLoader
.load(
    "textures/dreifaltigkeitsberg_1k.jpg",
    function (texture) {
        let exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
        // loadObjectAndAndEnvMap(); // Add envmap once the texture has been loaded
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
}

function play() {
    isFocused = true;
    if (musicPlay){ 
        backgroundMusicMediaElement.play();
        backgroundMusicMediaElement.volume = 0.3;
    }
}

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
/////////////////////////////////////////////////////////////////////////

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(-9.3, 2.8, 19);
cameraGroup.add(camera)

/////////////////////////////////////////////////////////////////////////
///// CONTROLS
/////////////////////////////////////////////////////////////////////////
controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(3.41,2,-10);
// controls.enableRotate = false;
controls.enablePan = true
controls.panSpeed = 3

controls.screenSpacePanning = false;
controls.enabled = false;
let targetDebug;

// if (debug){
//     targetDebug = new THREE.Mesh(
//         new THREE.BoxGeometry(1,1,1,2,2,2), new THREE.MeshBasicMaterial()
//     )
//     scene.add(targetDebug);    
// }

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
const floorTexture = textureLoader.load('textures/normal_floor.png');
let pisoMadeira;




/////////////////////////////////////////////////////////////////////////
///// LOADING MODEL
/////////////////////////////////////////////////////////////////////////
loader.load('models/gltf/art-gallery28.glb', function (gltf) { // load the model
    
    // console.log(gltf.scene) //log the loaded file so you can check the names

    gltf.scene.traverse((o) => { //get each object inside loaded file

        if (o.isMesh) { //check if it is a mesh (cameras, lights, groups are ignored)

            if (o.name.match(/p_Shaders/)) { //check the name of the object matches with the one you want to change

                o.material = new THREE.MeshPhysicalMaterial({ //create a new glass material to replace the imported one
                    roughness: 0, // make it clear or blurry
                    transmission: 0.85, // set the transparency
                    thickness: 0.5, //add refraction!
                    envMap: newEnvMap, //very important to give more realism
                  });
                  
                // add interface tweaks
                // gui.add(o.material, 'roughness').min(0).max(3).step(0.01)
                // gui.add(o.material, 'transmission').min(0).max(1).step(0.01)
                // gui.add(o.material, 'thickness').min(-9).max(9).step(0.01)

            }

            o.frustumCulled = false
            //  o.receiveShadow = true;
            //  o.castShadow = true;

            if (o.name == 'ParedesPrincipais') {
                const paredesPrincipaisOld = o.material;
                o.material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(0xffffff),
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 1,
                    map: paredesPrincipaisOld.map,
                    emissiveMap: paredesPrincipaisOld.emissiveMap
                })
            }

            if (o.name == 'Paredes') {
                const paredes = o.material;
                o.material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(0xffffff),
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 1,
                    map: paredes.map,
                    emissiveMap: paredes.emissiveMap
                })
            }

            if (o.name == 'Chao_entrada001') {
                const chaoEntrada = o.material;
                o.material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(0xffffff),
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 0.4,
                    map: chaoEntrada.map,
                    emissiveMap: chaoEntrada.emissiveMap
                })
            }

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
                        normalScale: new THREE.Vector2(0.3, 9.5),
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
                const pisoMadeiraOriginalMaterial = o.material;
                const pisoMadeiraDifuse = o.material.map;
                // const pisoMadeiraNormal = o.material.normalMap
                pisoMadeira.material = new MeshReflectorMaterial(renderer, camera, scene, pisoMadeira,
                    {
                        resolution: 512,
                        blur: [1,1],
                        mixStrength: 8,
                        planeNormal: new THREE.Vector3(0, 1, 0),
                        mixContrast: 0.26,
                        // bufferSamples: 8,
                        // distortionMap: pisoMadeiraNormal
                    });
                    pisoMadeira.material.setValues({
                        // roughnessMap: pisoMadeiraNormal,
                        map: pisoMadeiraDifuse,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        // normalMap: pisoMadeiraNormal,
                        emissiveMap: pisoMadeiraDifuse,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.62,
                        envMapIntensity: 0.08,
                        roughness:1.13,
                        color: 0xffffff,
                        // metalness: 0.5
                    })
                    pisoMadeiraOriginalMaterial.dispose();
                    renderer.renderLists.dispose();

                    addReflectorGUI2();

            }

            if (o.name.match(/Metais_/)) { // find metals from blender
                o.material.envMap = newEnvMap; // apply envmap
            }

            if (o.name.match(/p_/)) { //find clickable objects from blender
                o.material.envMap = newEnvMap; // apply envmap
                pickableMeshes.push(o); // select the object to be clickable
            }

            if (o.name == "fake_volume001") {// find the object to apply custom shader
                changeMaterialToFakeVolume(o); // calls the function to change the material
            }
        }
    });
  
    scene.add(gltf.scene); // adds loaded model to the scene

});

function changeMaterialToFakeVolume(objectToBeChanged){ // change the material to fake volume
    
    changedMaterial =  new THREE.MeshBasicMaterial({ //create a basic material
        side: THREE.DoubleSide, //define the side
        blending: THREE.AdditiveBlending, // use blend mode. Very important!
        transparent: true, // set it to be transparent
        depthWrite:  false, // don't write depth so it can't be visible by mesh reflector
    })

    changedMaterial.onBeforeCompile = function(shader) { //call the method to use custom shader
        shader.uniforms.c = { type: "f", value: 1 };
        shader.uniforms.p = { type: "f", value: 0.7 };
        shader.uniforms.glowColor = { type: "c", value: new THREE.Color('#fcfcdd') }; //#fcfcdd
        shader.uniforms.viewVector =  { type: "v3", value: camera.position };
        shader.uniforms.op =  { type: "f", value: 0.01 };
        shader.vertexShader= glowVertexShader
        shader.fragmentShader = glowFragmentShader
        changedMaterial.userData.shader = shader;
        // gui.add(shader.uniforms["c"], 'value').min(-1).max(1).step(0.01)
        // gui.add(shader.uniforms["p"], 'value').min(-1).max(6).step(0.01)
        // gui.add(shader.uniforms["op"], 'value').min(-1).max(1).step(0.01)
    };
    objectToBeChanged.material = changedMaterial;
    objectToBeChanged.needsUpdate = true;

}



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
// buttonMapa.addEventListener('click', mapModeButton);
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


    // console.log("Camera position: ",camera.position.x , camera.position.y, camera.position.z)
    // console.log("Target position: ",controls.target.x, controls.target.y, controls.target.z )
    // console.log(controls.target)

    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(pickableMeshes);

    // console.log(intersects.length)
    if (intersects.length > 0 & controls.enabled & document.getElementById('body').style.cursor != 'grabbing') {
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

/////////////////////////////////////////////////
//// CAMERA LOOT AT TURN
/////////////////////////////////////////////////
const tlCameraLook = gsap.timeline()
function cameraTurnAndLook(target) {
    // controls.enabled = false;
        
    if (target.name == "p_Shaders"){
        tlCameraLook
        .to(controls.target, { x: 29, y: 3, z: 18, duration: 2, ease: 'power1.inOut' })
        .to(camera.position, { x: 28, y: 4, z: 13, duration: 3, ease: 'power2.inOut'}, "-=2")
    }

    if (target.name == "p_3d_Models"){
        tlCameraLook
        .to(controls.target, { x: 24, y: 3, z: 18, duration: 2, ease: 'power1.inOut' })
        .to(camera.position, { x: 22, y: 3.3, z: 13.2, duration: 3, ease: 'power2.inOut'}, "-=2")
    }

    if (target.name == "p_Windland_Project"){
        tlCameraLook
        .to(controls.target, { x: 29.11, y: 3.3, z: -4.2, duration: 2, ease: 'power1.inOut' })
        .to(camera.position, { x: 27.7, y: 5.11, z: 9.9, duration: 3, ease: 'power2.inOut', onUpdate: ()=> {camera.lookAt(controls.target)}}, "-=2")
    }

    if (target.name == "p_Real_Estate_Project"){
        tlCameraLook
        .to(controls.target, { x: 23.4, y: 3.3, z: -4.3, duration: 2, ease: 'power1.inOut' })
        .to(camera.position, { x: 23.7, y: 3.3, z: 3.2, duration: 3, ease: 'power2.inOut', onUpdate: ()=> {camera.lookAt(controls.target)}}, "-=2")
    }

    if (target.name == "p_DNA_Project"){
        tlCameraLook
        .to(controls.target, { x: 18.9, y: 3.3, z: -5.5, duration: 2, ease: 'power1.inOut' })
        .to(camera.position, { x: 19.9, y: 3.3, z: 3.6, duration: 3, ease: 'power2.inOut', onUpdate: ()=> {camera.lookAt(controls.target)}}, "-=2")
    }

    if (target.name == "p_Threejs_Favorites"){
        tlCameraLook
        .to(controls.target, { x: -30.1, y: 3.5, z: 7.8, duration: 2, ease: 'power1.inOut' })
        .to(camera.position, { x: -17.06, y: 3.5, z: 8.2, duration: 3, ease: 'power2.inOut', onUpdate: ()=> {camera.lookAt(controls.target)}}, "-=2")
    }

    // console.log(target.name)
    buttonContinue.classList.add('visible');    
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
    .to(camera.position, {x: camera.position.x, y: 3.4, z: (controls.target.z >0) ? camera.position.z-6 : camera.position.z+6, duration: 2, ease: 'power1.inOut' })
    .to(controls.target, { x: controls.target.x, y: controls.target.y, z: controls.target.z, duration: 2, ease: 'power1.inOut', onComplete: enableControls }, "-=2");

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
//// TEXT ANIMATIONS
/////////////////////////////////////////////////

let nomeDiv = document.getElementById("nome")   
function animarTexto() {
    gsap.to(nomeDiv, {yPercent: -50, duration: 0.8, opacity: 1, ease: 'power4.easeInOut'})
}

function animarTextoOut() {
    gsap.to(nomeDiv, {yPercent: 0, duration: 0.8, opacity: 0, ease: 'power3.easeIn'})
}

//////////////////////////////////////////////////
//// EXPLORE FIRST CAMERA ANIMATION
/////////////////////////////////////////////////
const tlExplore = gsap.timeline();
function exploreAnimation() {

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

}

function enableControls(){
    camera.lookAt(controls.target)
    controls.enabled = true;
    controls.minDistance = 0;
    controls.maxDistance = 80;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.1;
    tlExplore.kill();
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
    gui.closed = true;

    // Directional Light Helper
    // helper = new THREE.CameraHelper( light.shadow.camera );
    // scene.add( helper );
}

let focus = {}
focus.value = 0
focus.target = focus.value
focus.easing = 0.08

let previousTime = 0

//////////////////////////////////////////////////
//// FAKE VOLUMETRICS 2
/////////////////////////////////////////////////

// let mesh;

// // Texture
// const size = 128;
// const data = new Uint8Array( size * size * size );

// let i = 0;
// const scale = 0.05;
// const perlin = new ImprovedNoise();
// const vector = new THREE.Vector3();

// for ( let z = 0; z < size; z ++ ) {

//     for ( let y = 0; y < size; y ++ ) {

//         for ( let x = 0; x < size; x ++ ) {

//             const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
//             data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
//             i ++;

//         }

//     }

// }

// const textureFog = new THREE.DataTexture3D( data, size, size, size );
// textureFog.format = THREE.RedFormat;
// textureFog.minFilter = THREE.LinearFilter;
// textureFog.magFilter = THREE.LinearFilter;
// textureFog.unpackAlignment = 1;
// textureFog.needsUpdate = true;


// // Material

// const vertexShader = /* glsl */`
//     in vec3 position;
//     uniform mat4 modelMatrix;
//     uniform mat4 modelViewMatrix;
//     uniform mat4 projectionMatrix;
//     uniform vec3 cameraPos;
//     out vec3 vOrigin;
//     out vec3 vDirection;
//     void main() {
//         vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
//         vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
//         vDirection = position - vOrigin;
//         gl_Position = projectionMatrix * mvPosition;
//     }
// `;

// const fragmentShader = /* glsl */`
//     precision highp float;
//     precision highp sampler3D;
//     uniform mat4 modelViewMatrix;
//     uniform mat4 projectionMatrix;
//     in vec3 vOrigin;
//     in vec3 vDirection;
//     out vec4 color;
//     uniform vec3 base;
//     uniform sampler3D map;
//     uniform float threshold;
//     uniform float range;
//     uniform float opacity;
//     uniform float steps;
//     uniform float frame;
//     uint wang_hash(uint seed)
//     {
//             seed = (seed ^ 61u) ^ (seed >> 16u);
//             seed *= 9u;
//             seed = seed ^ (seed >> 4u);
//             seed *= 0x27d4eb2du;
//             seed = seed ^ (seed >> 15u);
//             return seed;
//     }
//     float randomFloat(inout uint seed)
//     {
//             return float(wang_hash(seed)) / 4294967296.;
//     }
//     vec2 hitBox( vec3 orig, vec3 dir ) {
//         const vec3 box_min = vec3( - 0.5 );
//         const vec3 box_max = vec3( 0.5 );
//         vec3 inv_dir = 1.0 / dir;
//         vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
//         vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
//         vec3 tmin = min( tmin_tmp, tmax_tmp );
//         vec3 tmax = max( tmin_tmp, tmax_tmp );
//         float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
//         float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
//         return vec2( t0, t1 );
//     }
//     float sample1( vec3 p ) {
//         return texture( map, p ).r;
//     }
//     float shading( vec3 coord ) {
//         float step = 0.01;
//         return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
//     }
//     void main(){
//         vec3 rayDir = normalize( vDirection );
//         vec2 bounds = hitBox( vOrigin, rayDir );
//         if ( bounds.x > bounds.y ) discard;
//         bounds.x = max( bounds.x, 0.0 );
//         vec3 p = vOrigin + bounds.x * rayDir;
//         vec3 inc = 1.0 / abs( rayDir );
//         float delta = min( inc.x, min( inc.y, inc.z ) );
//         delta /= steps;
//         // Jitter
//         // Nice little seed from
//         // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
//         uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
//         vec3 size = vec3( textureSize( map, 0 ) );
//         float randNum = randomFloat( seed ) * 2.0 - 1.0;
//         p += rayDir * randNum * ( 1.0 / size );
//         //
//         vec4 ac = vec4( base, 0.0 );
//         for ( float t = bounds.x; t < bounds.y; t += delta ) {
//             float d = sample1( p + 0.5 );
//             d = smoothstep( threshold - range, threshold + range, d ) * opacity;
//             float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;
//             ac.rgb += ( 1.0 - ac.a ) * d * col;
//             ac.a += ( 1.0 - ac.a ) * d;
//             if ( ac.a >= 0.95 ) break;
//             p += rayDir * delta;
//         }
//         color = ac;
//         if ( color.a == 0.0 ) discard;
//     }
// `;



// //

// const parameters = {
//     threshold: 0.25,
//     opacity: 0.25,
//     range: 0.1,
//     steps: 100
// };

// function updateFog() {

//     materialFog.uniforms.threshold.value = parameters.threshold;
//     materialFog.uniforms.opacity.value = parameters.opacity;
//     materialFog.uniforms.range.value = parameters.range;
//     materialFog.uniforms.steps.value = parameters.steps;

// }

// gui.add( parameters, 'threshold', 0, 1, 0.01 ).onChange( updateFog );
// gui.add( parameters, 'opacity', 0, 1, 0.01 ).onChange( updateFog );
// gui.add( parameters, 'range', 0, 1, 0.01 ).onChange( updateFog );
// gui.add( parameters, 'steps', 0, 200, 1 ).onChange( updateFog );


// let geometryFog = new THREE.BoxGeometry( 10, 10, 10 );
// let materialFog = new THREE.RawShaderMaterial( {
//     glslVersion: THREE.GLSL3,
//     uniforms: {
//         base: { value: new THREE.Color( 0x798aa0 ) },
//         map: { value: textureFog },
//         cameraPos: { value: new THREE.Vector3() },
//         threshold: { value: 0.25 },
//         opacity: { value: 0.25 },
//         range: { value: 0.1 },
//         steps: { value: 100 },
//         frame: { value: 0 }
//     },
//     vertexShader,
//     fragmentShader,
//     side: THREE.DoubleSide,
//     transparent: true
// } );

// mesh = new THREE.Mesh( geometryFog, materialFog );
// scene.add( mesh );

// let finalFogMesh;
// function changeMaterialVolume(objectToBeChanged){

//     objectToBeChanged.material = materialFog;
//     objectToBeChanged.needsUpdate = true;
//     finalFogMesh = objectToBeChanged;
// }


//////////////////////////////////////////////////
//// ANIMMATE
/////////////////////////////////////////////////
function animate() {

    // if (finalFogMesh)
    // {
    //     finalFogMesh.material.uniforms.cameraPos.value.copy( camera.position );
    //     // finalFogMesh.rotation.y = - performance.now() / 7500;
    //     finalFogMesh.material.uniforms.frame.value ++;
    // }

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime


    if (!debug){
  
        const parallaxY = - cursor.y
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 2 * deltaTime

        const parallaxX = cursor.x
        cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 2 * deltaTime
    }
    
    
    if (isFocused | document.hidden) {

        if (!debug) {

            if (maxConfig){
                // default renderer
                composer.render();
            } else {
                //Complex effetcs renderer
                renderer.render(scene, camera);
            }
        }else{
            if (maxConfig){
                //Complex effetcs renderer
                composer.render();
            } else {
                renderer.render(scene, camera);
            }
        }

        if (pisoExterno && !isMobile) pisoExterno.material.update();
        if (pisoMadeira && !isMobile) pisoMadeira.material.update();
    
        // Performance degradation
        if (loadedAll == true) {
            CalculateFPS();
        }

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

    if (debug && stats) stats.update();

  

    controls.update();
    // if (debug) targetDebug.position.copy(controls.target)

    // prevTime = time;

    
    if (changedMaterial){    
        changedMaterial.userData.shader.uniforms[ 'viewVector' ].value = camera.position;
    }

    requestAnimationFrame(animate);
    
}

//////////////////////////////////////////////////
//// CALCULATE FPS 
/////////////////////////////////////////////////

const clock = new THREE.Clock();

function CalculateFPS() {
    const elapsedTime = clock.getElapsedTime()
    
    if (elapsedTime < 8) {
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

        if (fps > 50 && !isMobile) {

        }
        // console.log("Scene polycount:", renderer.info.render.triangles)
        // console.log("Active Drawcalls:", renderer.info.render.calls)
        // console.log("Textures in Memory", renderer.info.memory.textures)
        // console.log("Geometries in Memory", renderer.info.memory.geometries)
        // console.log("Scene objects", scene)
        // console.log("Scene Geometries", scene.children)
        // console.log("Scene", renderer.info )
    }
    
}

//////////////////////////////////////////////////
//// DEBUGGER
/////////////////////////////////////////////////
stats = new Stats();
// document.body.appendChild(stats.dom);
function debuger() {
    // scene.remove(overlay);
    // controls.autoRotate = false;
    controls.enabled = true;
    controls.minDistance = 0;
    controls.maxDistance = 80;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.1;
    camera.position.set(7.19, 3.08, 11.67);
    controls.target.set(11.5,3.33,5.2);
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