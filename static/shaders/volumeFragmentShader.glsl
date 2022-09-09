#define DEPTH_R8G8B8A8
#define EDGE_CONSTRAST_SMOOTH

varying vec3		vNormal;
varying vec3		vWorldPosition;

uniform vec3		lightColor;

uniform vec3		spotPosition;
uniform sampler2D	tDepth;

uniform float		attenuation;
uniform float		anglePower;
uniform float		edgeScale;

#ifdef EDGE_CONSTRAST_SMOOTH
    uniform float	edgeConstractPower;
#endif

uniform float 		screenWidth;
uniform float 		screenHeight;

uniform float 		cameraNear;
uniform float 		cameraFar;

#ifdef DEPTH_R8G8B8A8

    // from THREE.ShaderLib[depthRGBA]
    float unpackDepth( const in vec4 rgba_depth ) {
        const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
        float depth = dot( rgba_depth, bit_shift );
        return depth;
    }

    vec4 pack_depth( const in float depth ) {
        const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
        const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
        vec4 res = fract( depth * bit_shift );
        res -= res.xxyz * bit_mask;
    }
#endif


void main(){
    float intensity;

    //////////////////////////////////////////////////////////
    // distance attenuation					//
    //////////////////////////////////////////////////////////
    intensity	= distance(vWorldPosition, spotPosition)/attenuation;
    intensity	= 1.0 - clamp(intensity, 0.0, 1.0);

    //////////////////////////////////////////////////////////
    // intensity on angle					//
    //////////////////////////////////////////////////////////
    vec3 normal	= vec3(vNormal.x, vNormal.y, abs(vNormal.z));
    float angleIntensity	= pow( dot(normal, vec3(0.0, 0.0, 1.0)), anglePower );
    intensity	= intensity * angleIntensity;		
    // gl_FragColor	= vec4( lightColor, intensity );

    //////////////////////////////////////////////////////////
    // SOFT EDGES						//
    //////////////////////////////////////////////////////////
    vec2 depthUV		= vec2(gl_FragCoord.x/screenWidth,gl_FragCoord.y/screenHeight);

    // for depth in texel.r
    #ifdef DEPTH_R8
        float sceneDepth	= texture2D( tDepth, depthUV ).x;
        float fragDepth	= gl_FragCoord.z / gl_FragCoord.w;
        fragDepth		= 1.0 - smoothstep(cameraNear, cameraFar, fragDepth);

        float deltaDepth	= abs(sceneDepth-fragDepth)*edgeScale;
        gl_FragColor	= vec4(vec3(sceneDepth), 1.0);
    #endif

    // for depth packed in texel
    // - https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLShaders.js#L3189
    #ifdef DEPTH_R8G8B8A8
        // float sceneDepth	= unpackDepth( texture2D( tDepth, depthUV ) );
        // // float sceneDepth	= readDepth(depthUV);
        // sceneDepth		= 1.0 - smoothstep(cameraNear, cameraFar, sceneDepth);
        // float fragDepth	= gl_FragCoord.z;
        // fragDepth		= 1.0 - smoothstep(cameraNear, cameraFar, fragDepth);

        // float sceneDepth	= readDepth(depthUV);
        // float fragDepth	= cameraCoef /  (cameraFarPlusNear - gl_FragCoord.z * cameraFarMinusNear);

        // gl_FragColor	= vec4( vec3(fragDepth), 0.5);

        float sceneDepth	= unpackDepth( texture2D( tDepth, depthUV ) );

        float fragDepth	= gl_FragCoord.z / gl_FragCoord.w;
        fragDepth		= 1.0 - smoothstep(cameraNear, cameraFar, fragDepth);

        float deltaDepth	= abs(sceneDepth-fragDepth)*edgeScale;


        gl_FragColor		= vec4(vec3(texture2D(tDepth, depthUV).r), 1.0);
        // gl_FragColor		= vec4(vec3(0.0), 1.0);
        // gl_FragColor		= vec4(vec3(texture2D(tDepth, depthUV)), 1.0);

        // sceneDepth	= unpackDepth(texture2D(tDepth, depthUV));
        // gl_FragColor	= vec4(vec3(sceneDepth), 1.0);

        // if( abs(sceneDepth - 1.0) <= 0.01 ){
        // 	gl_FragColor	= vec4(vec3(0.5), 1.0);
        // }else{
        // 	gl_FragColor	= vec4(vec3(1.0), 1.0);
        // }

        // gl_FragColor	= vec4(vec3(texture2D( tDepth, depthUV ).x), 1.0);
        // gl_FragColor	= vec4(vec3(unpackDepth(texture2D( tDepth, depthUV ))), 1.0);
        // gl_FragColor	= vec4(vec3(1.0), 1.0);

        // if( unpackDepth(texture2D( tDepth, depthUV )) - 0.2 < 0.01 ){
        // 	gl_FragColor	= vec4(vec3(0.0, 1.0, 0.0), 1.0);
        // }else{
        // 	gl_FragColor	= vec4(vec3(1.0, 0.0, 0.0), 1.0);
        // }

        // if( texture2D( tDepth, depthUV ).x - 0.2 < 0.01 ){
        // 	gl_FragColor	= vec4(vec3(0.0, 1.0, 0.0), 1.0);
        // }else{
        // 	gl_FragColor	= vec4(vec3(1.0, 0.0, 0.0), 1.0);
        // }

        // // test that pack_depth and unpackDepth works
        // float originalDepth	= 0.6;
        // vec4 packedDepth	= pack_depth(originalDepth);
        // float unpackedDepth	= unpackDepth(packedDepth);
        // if( unpackedDepth == originalDepth ){
        // 	gl_FragColor	= vec4(vec3(1.0,0.0,0.0), 1.0);
        // }else{
        // 	gl_FragColor	= vec4(vec3(0.0,1.0,0.0), 1.0);
        // }
        
    #endif

    // gl_FragColor		= vec4( vec3(deltaDepth), 1.0);
    // float deltaDepth	= abs(sceneDepth-fragDepth)*400.0;
    // gl_FragColor	= vec4( vec3(deltaDepth), 1.0);
    // gl_FragColor	= vec4( vec3(sceneDepth), 1.0);
    
    // from http://www.gamerendering.com/2009/09/16/soft-particles/
    // - good to understand EDGE_CONSTRAST_SMOOTH 
    //   - http://developer.download.nvidia.com/whitepapers/2007/SDK10/SoftParticles_hi.pdf
    #ifdef EDGE_CONSTRAST_LINEAR
        float edgeIntensity	= clamp(deltaDepth, 0.0, 1.0);
    #endif

    #ifdef EDGE_CONSTRAST_SMOOTH
        // FROM http://developer.download.nvidia.com/whitepapers/2007/SDK10/SoftParticles_hi.pdf
        float edgeIntensity = 0.5*pow(clamp(2.0*((deltaDepth > 0.5) ? 1.0-deltaDepth : deltaDepth), 0.0, 1.0), edgeConstractPower);
        edgeIntensity = ( deltaDepth > 0.5) ? 1.0-edgeIntensity : edgeIntensity;
    #endif

    intensity = intensity * edgeIntensity;


    //////////////////////////////////////////////////////////
    // final color						//
    //////////////////////////////////////////////////////////

    // set the final color
    gl_FragColor	= vec4( lightColor, intensity);
},