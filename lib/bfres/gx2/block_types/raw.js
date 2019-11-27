/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class GX2_RAW
{
    constructor()
    {
        this.blockSize = [1, 1];
        this.channels = 4;
    }

    decode(blockBuffer, blockPos, imgSize)
    {
        console.warn("GX2_RAW is a dummy handler!");
    }
};
