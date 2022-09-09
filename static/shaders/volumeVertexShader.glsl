varying vec3 vNormal;
varying vec3 vWorldPosition;

void main(){
    // compute intensity
    vNormal		= normalize( normalMatrix * normal );

    vec4 worldPosition	= modelMatrix * vec4( position, 1.0 );
    vWorldPosition		= worldPosition.xyz;

    // set gl_Position
    gl_Position	= projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}