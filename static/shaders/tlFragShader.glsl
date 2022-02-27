#include <color_pars_fragment>

uniform float time;
uniform float progress;
uniform sampler2D sceneMap;
uniform sampler2D sceneRide;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
#define GAMMA 1.

vec2 distort(vec2 olduv, float pr, float expo){
    vec2 p0 = 2.*olduv -1.;
    vec2 p1 = p0/(1. - pr*length(p0)*expo);

    return (p1 + 1.)*0.5;
}

mat4 contrastMatrix( float contrast )
{
	float t = ( 1.0 - contrast ) / 2.0;
    
    return mat4( contrast, 0, 0, 0,
                 0, contrast, 0, 0,
                 0, 0, contrast, 0,
                 t, t, t, 1 );

}

void main() {

    float progress1 = smoothstep(0.25, 1.02, progress);

    vec2 uv1 = distort(vUv, -10.*pow(0.5 +0.5*progress, 4.), progress*2.);
    vec2 uv2 = distort(vUv, -10.*(1. -progress1), progress*2.);
    vec4 s360 = texture2D(sceneRide,uv2);
    vec4 sPlanet = texture2D(sceneMap,uv1);

    float mixer = progress1;
    
    gl_FragColor = vec4(vUv, 0.0, 1.);
    gl_FragColor = s360;

    vec4 finalTexture = mix(sPlanet, s360, mixer);

    gl_FragColor = finalTexture;
    #include <encodings_fragment>
}
