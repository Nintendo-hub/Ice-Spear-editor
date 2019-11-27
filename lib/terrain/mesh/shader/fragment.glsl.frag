/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

precision highp sampler2DArray;

uniform sampler2DArray texTerrain;

in vec4 vUv;
in float weight;
flat in vec2 texIndex;

void main(void)
{
    vec4 color0 = texture(texTerrain, vec3(vUv.xy, texIndex[0]));
    vec4 color1 = texture(texTerrain, vec3(vUv.zw, texIndex[1]));

    fragmentColor = mix(color0, color1, weight);
}