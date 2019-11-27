/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const GX2_BC1 = require("./bc1.js");
const GX2_BC4 = require("./bc4.js");

module.exports = class GX2_BC3
{
    constructor()
    {
        this.blockSize = [4, 4];
        this.channels = 4;
    }

    decode(blockBuffer, blockPos, imgSize)
    {
        let bc1 = new GX2_BC1();
        let bc4 = new GX2_BC4();

        let colorsAlpha = bc4.decode(blockBuffer.slice(0, 8), blockPos, imgSize);
        let colorsRGB   = bc1.decode(blockBuffer.slice(8, 16), blockPos, imgSize);

        let alphaIndex = 0;
        for(let i=0; i<colorsRGB.length; i+=4)
        {
            colorsRGB[i+3] = colorsAlpha[alphaIndex++];
        }

        return colorsRGB;
    }
};
