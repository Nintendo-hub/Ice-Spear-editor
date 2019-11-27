/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const PicoGL = require("picogl");

module.exports = class Shader_Handler
{
    constructor(glApp)
    {
        this.glApp = glApp;
        this.shader = {};
    }

    create(name, vertexShaderSource, fragmentShaderSource)
    {
        const prog = this.glApp.createProgram(vertexShaderSource, fragmentShaderSource);
        this.shader[name] = prog;
        return prog;
    }

    get(name)
    {
        return this.shader[name];
    }
}