#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D texColor;

in vec4 vColor;
in vec2 vUV;

out vec4 fragColor;

void main() 
{
    fragColor = texture(texColor, vUV) * vColor;
}
