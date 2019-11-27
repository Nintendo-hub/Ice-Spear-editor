#version 300 es
    
layout(location=0) in vec2 position;
layout(location=1) in vec2 uv;

layout(std140) uniform globalUniforms {
    vec2 uAspectRatio;
};

layout(std140) uniform cameraUniforms {
    vec2 uPos;
    vec2 uScale;
};

uniform vec2 uObjectPos;

out vec4 vColor;
out vec2 vUV;

void main() 
{
    vColor = vec4(0.914, 0.608, 0.408, 1.0);
    vUV = uv;

    vec2 posScaled = position / uScale;
    vec2 glPos = (posScaled + uObjectPos + uPos) * uScale * uAspectRatio;

    gl_Position = vec4(glPos, 0.0, 1.0);
}
