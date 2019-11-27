#version 300 es
precision highp float;
precision highp sampler2DArray;

uniform sampler2DArray texColor;

in vec4 vColor;
in vec3 vUV;
in vec2 vSelectedPos;

out vec4 fragColor;

void main() 
{
    float colorScale = 0.7 - max(abs(vSelectedPos.x), abs(vSelectedPos.y));
    colorScale = min(1.0, colorScale * 3.5);

    fragColor = texture(texColor, vUV) * vColor * colorScale;
}
