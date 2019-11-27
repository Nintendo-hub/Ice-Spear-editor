/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
const BFRES_FileTypes = requireGlobal('./lib/bfres/file_types.js');

module.exports = class GX2_Block_Handler
{
    constructor(buffer, size, format)
    {
        this.buffer = buffer;
        this.size   = size;
        this.format = format;

        this.colorChannels = 4;
        let textureTypes = requireGlobal("lib/bfres/gx2/texture_types.json");
        if(textureTypes[format] == null)
            throw `GX2: unknown texture format '${format}'!`;

        this.texTypeInfo = textureTypes[format];

        this.blockHandler = new (require(`./block_types/${this.texTypeInfo.handler}.js`));

        this.bytesPerPixel = (this.texTypeInfo.bpp / 8);
        this.bytesPerBlock = (this.texTypeInfo.bpBlock / 8);

        this.numBlocks = [
            this.size[0] / this.blockHandler.blockSize[0],
            this.size[1] / this.blockHandler.blockSize[1]
        ];
    }

    insertBlock(buffer, block, pos)
    {
        let offset = (pos[1] * this.blockHandler.blockSize[1] * this.size[0] * this.colorChannels) 
                   + (pos[0] * this.blockHandler.blockSize[0] * this.colorChannels);

        for(let y=0; y<this.blockHandler.blockSize[1]; ++y)
        {
            let blockOffset = y * this.blockHandler.blockSize[0] * this.colorChannels;
            block.copy(buffer, offset, blockOffset, blockOffset + this.blockHandler.blockSize[0] * this.colorChannels);
            //block.copy(buffer, offset, 0, 4 * 4);
            offset += this.size[0] * this.colorChannels;
        }
    }

    decode()
    {
        if(this.texTypeInfo.handler == "raw")
        {
            return {buffer: this.buffer.slice(0, this.size[0] * this.size[1] * 4), colorChannels: 4};    
        }

        this.colorChannels = this.blockHandler.channels;
        const buffer = new Buffer.allocUnsafe(this.size[0] * this.size[1] * this.colorChannels);

        for(let y=0; y<this.numBlocks[1]; ++y)
        {
            const offsetY = (y * this.size[0] / this.bytesPerPixel);

            for(let x=0; x<this.numBlocks[0]; ++x)
            {
                let bufferOffset = offsetY + (x * this.bytesPerBlock);
                let blockColor = this.blockHandler.decode(this.buffer.slice(bufferOffset, bufferOffset + this.bytesPerBlock), [x,y], this.size);

                this.insertBlock(buffer, blockColor, [x,y]);
            }
        }
        return {buffer, colorChannels: this.colorChannels};
    }

    encode()
    {
        console.log("WIP");
    }

    static getBlockSize(format)
    {
        return {x:4, y:4}; // same for all BCn formats
    }
};
