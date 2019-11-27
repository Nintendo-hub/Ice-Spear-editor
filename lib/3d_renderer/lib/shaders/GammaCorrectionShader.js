/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * Gamma Correction Shader
 * http://en.wikipedia.org/wiki/gamma_correction
 */

THREE.GammaCorrectionShader = {

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

		"uniform sampler2D tDiffuse;",

		"in vec2 vUv;",

		"void main() {",

			"vec4 tex = texture( tDiffuse, vec2( vUv.x, vUv.y ) );",

			"fragmentColor = LinearToGamma( tex, float( GAMMA_FACTOR ) );",

		"}"

	].join( "\n" )

};
