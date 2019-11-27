/**
 * @author tapio / http://tapio.github.com/
 *
 * Brightness and contrast adjustment
 * https://github.com/evanw/glfx.js
 * brightness: -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * contrast: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.BrightnessContrastShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"brightness": { value: 0 },
		"contrast":   { value: 0 }

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
		"uniform float brightness;",
		"uniform float contrast;",

		"in vec2 vUv;",

		"void main() {",

			"fragmentColor = texture( tDiffuse, vUv );",

			"fragmentColor.rgb += brightness;",

			"if (contrast > 0.0) {",
				"fragmentColor.rgb = (fragmentColor.rgb - 0.5) / (1.0 - contrast) + 0.5;",
			"} else {",
				"fragmentColor.rgb = (fragmentColor.rgb - 0.5) * (1.0 + contrast) + 0.5;",
			"}",

		"}"

	].join( "\n" )

};
