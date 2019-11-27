/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
module.exports = class GX2_BC1
{
    constructor()
    {
        this.blockSize = [4, 4];
        this.channels = 4;
    }

    interpolateColor(c1, c2, pos)
    {
        let res = new Array(4);

        for(let i=0; i<4; ++i)
            res[i] = c1[i] + (c2[i] - c1[i]) * pos;

        return res;
    }


    getcolorIndex(blockBuffer)
    {
        let colors = new Array(4);
        let colorRaw = [
            (blockBuffer[1] << 8 | blockBuffer[0]),
            (blockBuffer[3] << 8 | blockBuffer[2])
        ];

        for(let c=0; c<2; ++c)
        {
            colors[c] = [
                ((colorRaw[c] >> 11) & 0b11111)  * (255.0 / 0b11111),  // B (5-bits)
                ((colorRaw[c] >>  5) & 0b111111) * (255.0 / 0b111111), // G (6-bits)
                ((colorRaw[c]      ) & 0b11111)  * (255.0 / 0b11111),  // R (5-bits)
                255.0
            ];
        }

        let hasAlpha = (colors[0][0] == 0 && colors[0][1] == 0 && colors[0][2] == 0);

        if(hasAlpha)
        {
            colors[2] = this.interpolateColor(colors[0], colors[1], 1/2);
            colors[3] = [0,0,0,0];
        }else{
            colors[2] = this.interpolateColor(colors[0], colors[1], 1/3);
            colors[3] = this.interpolateColor(colors[0], colors[1], 2/3);
        }


        return colors;
    }

    decode(blockBuffer, blockPos, imgSize)
    {
        let colorBuffer = Buffer.allocUnsafe(this.blockSize[0] * this.blockSize[1] * 4);
        let colorBufferIndex = 0;
        let colors = this.getcolorIndex(blockBuffer);

        for(let i=0; i<4; ++i)
        {
            for(let b=0; b<4; ++b)
            {
                let colorIndex = (blockBuffer[4+i] >> (b*2)) & 0b11;
                let color = colors[colorIndex];

                for(let c=0; c<4; ++c)
                    colorBuffer[colorBufferIndex++] = color[c];
            }
        }

        return colorBuffer;
    }
};
