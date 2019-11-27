/**
 * @author tapio / http://tapio.github.com/
 *
 * Hue and saturation adjustment
 * https://github.com/evanw/glfx.js
 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.HueSaturationShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"hue":        { value: 0 },
		"saturation": { value: 0 }

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
		"uniform float hue;",
		"uniform float saturation;",

		"in vec2 vUv;",

		"void main() {",

			"fragmentColor = texture( tDiffuse, vUv );",

			// hue
			"float angle = hue * 3.14159265;",
			"float s = sin(angle), c = cos(angle);",
			"vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;",
			"float len = length(fragmentColor.rgb);",
			"fragmentColor.rgb = vec3(",
				"dot(fragmentColor.rgb, weights.xyz),",
				"dot(fragmentColor.rgb, weights.zxy),",
				"dot(fragmentColor.rgb, weights.yzx)",
			");",

			// saturation
			"float average = (fragmentColor.r + fragmentColor.g + fragmentColor.b) / 3.0;",
			"if (saturation > 0.0) {",
				"fragmentColor.rgb += (average - fragmentColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));",
			"} else {",
				"fragmentColor.rgb += (average - fragmentColor.rgb) * (-saturation);",
			"}",

		"}"

	].join( "\n" )

};
