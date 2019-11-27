/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');
const path = require('path');

const Base = require('./base.js');

/**
 * helper to load and store shaders (aka materials)
 */
module.exports = class Renderer_Helper_Shader extends Base
{
    constructor(threeContext)
    {
        super(threeContext);

        this.shaderPath = path.join(__BASE_PATH, "lib", "3d_renderer", "shader");
        this.shaders = {};
    }

    /**
     * creates a shader instance/clone
     * @param {string} name 
     * @returns {RawShaderMaterial} shader
     */
    async getShader(name)
    {
        if(!this.shaders[name])
        {
            this.shaders[name] = await this._loadShader(name);
        }

        return this.shaders[name].clone();
    }

    /**
     * loads a shader from the glsl files
     * @param {string} name 
     * @returns {RawShaderMaterial} shader
     */
    async _loadShader(name)
    {
        const vertexShader   = await fs.readFile(path.join(this.shaderPath, name + ".glsl.vert"), 'utf8');
        const fragmentShader = await fs.readFile(path.join(this.shaderPath, name + ".glsl.frag"), 'utf8');
        return new THREE.RawShaderMaterial({vertexShader, fragmentShader});
    }
}