varying vec2 vUv;
varying vec3 vNormal;

void main() {

    float light =
        dot(
            normalize(vNormal),
            normalize(vec3(0.3,1.0,0.5))
        );

    vec3 base =
        vec3(1.0,0.45,0.65);

    vec3 finalColor =
        base * light;

    gl_FragColor =
        vec4(finalColor,1.0);
}
