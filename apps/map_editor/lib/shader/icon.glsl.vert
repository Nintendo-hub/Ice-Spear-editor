#version 300 es
    
layout(location=0) in vec2 position;
layout(location=1) in vec2 uv;
layout(location=2) in vec2 instPos;
layout(location=3) in float selected;

layout(std140) uniform globalUniforms {
    vec2 uAspectRatio;
};

layout(std140) uniform cameraUniforms {
    vec2 uPos;
    vec2 uScale;
};

out vec4 vColor;
out vec2 vUV;

void main() 
{
    vColor = mix(
        vec4(0.255, 0.631, 0.882, 1.0), // blue
        vec4(0.388, 0.796, 0.325, 1.0), // green
        selected
    );

    vUV = uv;

    vec2 posScaled = position / uScale * (selected * 0.2 + 1.0);
    vec2 glPos = (posScaled + instPos + uPos) * uScale * uAspectRatio;

    gl_Position = vec4(glPos, 0.0, 1.0);
}
