/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require('path');
const fs = require('fs-extra');

const PicoGL = require("picogl");

module.exports = class Marker
{
    constructor(engine)
    {
        this.engine = engine;
        this.glApp = this.engine.getApp();

        this.pos = new Float32Array([3.5, 1.5]);
        this.radius = 0.016;
    }

    setPos(x, y)
    {
        this.pos[0] = x;
        this.pos[1] = y;
        this.drawCall.uniform("uObjectPos", this.pos);
    }

    getPos()
    {
        return this.pos;
    }

    async createDrawCall()
    {    
        this.iconShrineBuffer = await fs.readFile(path.join(__BASE_PATH, "assets", "img", "map", "marker.bin"));
        const iconShrineTexture =  this.engine.createTexture(this.iconShrineBuffer, {x: 128, y:128}, {
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE,
            flipY: true
        });

        this.drawCall = this.engine.createDrawCall("marker", this.engine.meshHelper.createQuad(this.radius), true)
            .texture("texColor", iconShrineTexture)
            .uniform("uObjectPos", this.pos)
            .uniformBlock("globalUniforms", this.engine.getGlobalUniform());

        return this.drawCall;
    }

}