/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Orbit_Controls = require('three-orbit-controls')(THREE);
const Base = require("./base.js");

module.exports = class Renderer_Helper_Orbit_Controls extends Base
{
    constructor(threeContext, camera, canvasNode)
    {
        super(threeContext);
        this.camera = camera;
        this.canvasNode = canvasNode;
    }

    init()
    {
        this.controls = new Orbit_Controls(this.camera, this.canvasNode);
    }

    enable()
    {
        super.enable();
        this.controls.enabled = true;
    }

    disable()
    {
        super.disable();
        this.controls.enabled = false;
    }
};
