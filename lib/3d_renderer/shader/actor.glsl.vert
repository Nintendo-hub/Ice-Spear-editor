#version 300 es
precision highp float;

// mesh attributes
layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;

// instanced attributes
in vec4 objMatrix0;
in vec4 objMatrix1;
in vec4 objMatrix2;
in vec4 objMatrix3;
in vec4 objColor; // per object

in vec4 color; // per vertex

// THREE.js uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// custom uniforms
uniform float colorBlendFactor;

out vec2 vUv;
out vec4 vColor;
//out mat4 testMatrix;

void main() 
{
    vUv = uv;
    vColor = objColor;

    if(colorBlendFactor > 0.0)
    {
        vColor = mix(vColor, color, colorBlendFactor);
    }

    mat4 testMatrix = mat4(
        objMatrix0,
        objMatrix1,
        objMatrix2,
        objMatrix3
    );

    vec4 vPosition = testMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition.xyz, 1.0 );
}