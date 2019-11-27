/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Renderer_Helper_Base
{
    constructor(threeContext)
    {
        this.THREE = threeContext;
        this.enabled = true;
    }

    init()
    {
    }

    update()
    {
    }

    draw()
    {
    }

    onResize(drawSize, oldSize)
    {
    }

    enable()
    {
        this.enabled = true;
    }

    disable()
    {
        this.enabled = false;
    }
};
