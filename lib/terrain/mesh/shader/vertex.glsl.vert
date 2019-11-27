/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

in vec3 materialMap;
in vec4 uvMap;

out vec4 vUv;
out float weight;
flat out vec2 texIndex;


void main()
{
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    texIndex = materialMap.rg;
    weight   = materialMap.b / 255.0;

    vUv = uvMap;

    gl_Position = projectionMatrix * mvPosition;
}