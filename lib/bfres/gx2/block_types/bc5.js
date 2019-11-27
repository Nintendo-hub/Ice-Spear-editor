/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const GX2_BC4 = require("./bc4.js");

module.exports = class GX2_BC5
{
    constructor()
    {
        this.blockSize = [4, 4];
        this.channels = 2;
    }

    decode(blockBuffer, blockPos, imgSize)
    {
        let bc4 = new GX2_BC4();
        let colorBuffer = Buffer.alloc(this.blockSize[0] * this.blockSize[1] * 2);

        let colorsRed   = bc4.decode(blockBuffer.slice(0, 8), blockPos, imgSize);
        let colorsGreen = bc4.decode(blockBuffer.slice(8, 16), blockPos, imgSize);

        let bc4Index = 0;
        for(let i=0; i<colorBuffer.length; i+=2)
        {
            colorBuffer[i+0] = colorsRed[bc4Index];
            colorBuffer[i+1] = colorsGreen[bc4Index];
            ++bc4Index;
        }

        return colorBuffer;
    }
};
