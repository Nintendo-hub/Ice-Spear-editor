/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");

const COLOR_FORMATS = [
    undefined,
    THREE.AlphaFormat,
    THREE.LuminanceAlphaFormat, // ?
    THREE.RGBFormat,
    THREE.RGBAFormat,
];

module.exports = class Renderer_Helper_Texture extends Base
{
    createTexture(buffer, sizeX, sizeY, channels = 4)
    {
        if(channels == 2)
        {
            console.warn("weighiuwerhgiuwheghiwh");
        }

        if(channels <= 0 || channels > 4)
            return undefined;

        let texture = new this.THREE.DataTexture(buffer, sizeX, sizeY, COLOR_FORMATS[channels]);

        texture.wrapS = this.THREE.RepeatWrapping; // @TODO read from FTEX/GX surface
        texture.wrapT = this.THREE.RepeatWrapping;

        texture.magFilter = this.THREE.LinearFilter; // @TODO read from FTEX/GX surface
        texture.minFilter = this.THREE.LinearFilter;

        //texture.magFilter = this.THREE.NearestFilter; // @TODO read from FTEX/GX surface
        //texture.minFilter = this.THREE.NearestFilter;

        return texture;
    }
};
