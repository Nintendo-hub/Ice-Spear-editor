/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

THREE.ColorifyShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"color":    { value: new THREE.Color( 0xffffff ) }

	},

	vertexShader: [

		"out vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",

		"in vec2 vUv;",

		"void main() {",

			"vec4 texel = texture( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
			"float v = dot( texel.xyz, luma );",

			"fragmentColor = vec4( v * color, texel.w );",

		"}"

	].join( "\n" )

};
