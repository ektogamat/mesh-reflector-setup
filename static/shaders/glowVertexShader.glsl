uniform vec3 viewVector;
uniform float c;
uniform float p;
uniform float op;
varying float opacity;
varying float intensity;
void main() 
{
    opacity = 1.0;
    vec3 vNormal = normalize( normalMatrix * normal *2.0 );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), p );
    opacity = op;
	
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}