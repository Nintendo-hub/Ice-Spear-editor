/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class GX2_BC4
{
    constructor()
    {
        this.blockSize = [4, 4];
        this.channels = 1;
    }

    interpolateColor(c1, c2, pos)
    {
        return c1 + (c2 - c1) * pos;
    }

    getcolorIndex(blockBuffer)
    {
        let colors = new Array(8);

        colors[0] = blockBuffer[0];
        colors[1] = blockBuffer[1];

        if(colors[0] > colors[1])
        {
            for(let c=0; c<6; ++c)
                colors[c+2] = this.interpolateColor(colors[0], colors[1], c / 7.0);
        }else{
            for(let c=0; c<4; ++c)
                colors[c+2] = this.interpolateColor(colors[0], colors[1], c / 5.0);

            colors[6] = 0.0;
            colors[7] = 255.0;
        }

        return colors;
    }

    decode(blockBuffer, blockPos, imgSize)
    {
        let colorBuffer = Buffer.allocUnsafe(this.blockSize[0] * this.blockSize[1]);
        let colorBufferIndex = 0;
        let colors = this.getcolorIndex(blockBuffer);

        let indexBytes = new Uint32Array([
            (blockBuffer[4] << 16) | (blockBuffer[3] << 8) | (blockBuffer[2]),
            (blockBuffer[7] << 16) | (blockBuffer[6] << 8) | (blockBuffer[5])
        ]);

        for(let colByte of indexBytes)
        {
            for(let ct=0; ct<8; ++ct)
            {
                let col = (colByte >> (3 * ct)) & 0b111;
                colorBuffer[colorBufferIndex++] = colors[col];
            }
        }

        return colorBuffer;
    }
};
