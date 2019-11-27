/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const MAX_ALPHA_PERCENTAGE = 1.0; // max. percentage of alpha-pixel that allow the removal of that channel
const MAX_ALPHA_VALUE = 240;

/**
 * reduces any unwanted/unused data like un-utilized alpha channels
 * from FTEX texture buffers
 */
module.exports = class FTEX_Reducer
{
    getAlphaUsage(buffer)
    {
        let alphaCount = 0;
        for(let i=3; i<buffer.length; i+=4)
        {
            if(buffer[i] < MAX_ALPHA_VALUE)
                ++alphaCount;
        }
        return alphaCount / (buffer.length / 4) * 100;
    }

    removeAlphaChannel(buffer)
    {
        const newSize = buffer.length / 4 * 3;
        let bufferPos = 0;
        const newBuffer = Buffer.alloc(newSize);

        for(let i=0; i<buffer.length; ++i)
        {
            if((i % 4) != 3)
                newBuffer[bufferPos++] = buffer[i];
        }

        return newBuffer;
    }

    reduce(texData, forceRemoval)
    {
        if(texData.colorChannels != 4)
            return;
        
        const alphaPerc = forceRemoval ? 0.0 : this.getAlphaUsage(texData.buffer);
        if(alphaPerc < MAX_ALPHA_PERCENTAGE)
        {
            texData.buffer = this.removeAlphaChannel(texData.buffer);
            texData.colorChannels = 3;
        }
    }
};