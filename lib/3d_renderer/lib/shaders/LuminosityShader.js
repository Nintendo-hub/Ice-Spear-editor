/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityShader = {

	uniforms: {

		"tDiffuse": { value: null }

	},

	vertexShader: [

		"out vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",

		"uniform sampler2D tDiffuse;",

		"in vec2 vUv;",

		"void main() {",

			"vec4 texel = texture( tDiffuse, vUv );",

			"float l = linearToRelativeLuminance( texel.rgb );",

			"fragmentColor = vec4( l, l, l, texel.w );",

		"}"

	].join( "\n" )

};
