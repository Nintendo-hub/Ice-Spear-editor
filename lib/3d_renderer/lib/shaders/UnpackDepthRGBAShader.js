/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Unpack RGBA depth shader
 * - show RGBA encoded depth as monochrome color
 */

THREE.UnpackDepthRGBAShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"out vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"in vec2 vUv;",

		"#include <packing>",

		"void main() {",

			"float depth = 1.0 - unpackRGBAToDepth( texture( tDiffuse, vUv ) );",
			"fragmentColor = opacity * vec4( vec3( depth ), 1.0 );",

		"}"

	].join( "\n" )

};
