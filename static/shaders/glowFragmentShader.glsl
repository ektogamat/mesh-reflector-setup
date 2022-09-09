uniform vec3 glowColor;
varying float intensity;
varying float opacity;
void main() 
{
	vec3 glow = glowColor * intensity;
    gl_FragColor = vec4( glow, opacity );
}