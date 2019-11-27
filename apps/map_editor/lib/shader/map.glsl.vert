#version 300 es
    
layout(location=0) in vec2 position;
layout(location=1) in vec2 uv;
layout(location=2) in vec2 instPos;

layout(std140) uniform globalUniforms {
    vec2 uAspectRatio;
};

layout(std140) uniform cameraUniforms {
    vec2 uPos;
    vec2 uScale;
};

uniform int uSelectedSection;

out vec4 vColor;
out vec3 vUV;
out vec2 vSelectedPos;

void main() 
{
    vColor = vec4(1.0);
    vSelectedPos = vec2(0.0);

    vUV = vec3(uv, float(gl_InstanceID));

    if(gl_InstanceID == uSelectedSection) 
    {
        vSelectedPos = position;
        vColor = vec4(1.2, 1.2, 1.2, 1.0);
    }

    vec2 glPos = (position + instPos + uPos) * uScale * uAspectRatio;

    gl_Position = vec4(glPos, 0.0, 1.0);
}
