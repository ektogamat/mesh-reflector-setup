uniform float time;

float N (vec2 st) { 
    return fract( sin( dot( st.xy, vec2(12.9898,78.233 ) ) ) *  43758.5453123);
}

float smoothNoise( vec2 ip ){
    vec2 lv = fract( ip );
    vec2 id = floor( ip );
    
    lv = lv * lv * ( 3. - 2. * lv );
    
    float bl = N( id );
    float br = N( id + vec2( 1, 0 ));
    float b = mix( bl, br, lv.x );
    
    float tl = N( id + vec2( 0, 1 ));
    float tr = N( id + vec2( 1, 1 ));
    float t = mix( tl, tr, lv.x );
    
    return mix( b, t, lv.y );
}


#define LAMBERT
    // instanced
    attribute vec3 offset;
    // attribute vec3 instanceColor;
    // attribute float instanceScale;
    varying vec3 vLightFront;
    varying vec3 vIndirectFront;
    //varying vec3 slicePosition;

    #ifdef DOUBLE_SIDED
        varying vec3 vLightBack;
        varying vec3 vIndirectBack;
    #endif

    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <envmap_pars_vertex>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>

    void main() {

        #include <uv_vertex>
        #include <uv2_vertex>
        #include <color_vertex>

        // vertex colors instanced
        // #ifdef USE_COLOR
        //  vColor.xyz = instanceColor.xyz;
        // #endif

        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>

        #include <begin_vertex>

        // position instanced
        // transformed *= instanceScale;
        // transformed = transformed + instanceOffset;
        transformed = transformed + offset;
        //slicePosition = transformed;

        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>

        #include <worldpos_vertex>
        #include <envmap_vertex>
        #include <lights_lambert_vertex>
        #include <shadowmap_vertex>
        #include <fog_vertex>

        float t = time * 1.4;

        // VERTEX POSITION
        
        vec4 movPosition = vec4( position, 1.0 );
        #ifdef USE_INSTANCING
        movPosition = instanceMatrix * movPosition;
        #endif
        
        // DISPLACEMENT
        
        float noise = smoothNoise(movPosition.xy * 0.3 + vec2(0., t));
        noise = pow(noise * 0.9, 2.) * 2.;
        
        // here the displacement is made stronger on the blades tips.
        float dispPower = .6 - cos( uv.x * 1.1416 );
        
        float displacement = noise /0.8 * ( dispPower * .12 );
        movPosition.xz -= displacement;
        
        //
        
        vec4 modelViewPosition = modelViewMatrix * movPosition;
        gl_Position = projectionMatrix * modelViewPosition;
    }