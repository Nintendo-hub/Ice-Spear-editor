/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Parser = require('binary-file').Parser;
const BFRES_FileTypes    = requireGlobal('./lib/bfres/file_types.js');
const GX2_Block_Handler  = require('./../gx2/block_handler');
const Content_Types      = require("./../content_types.json");

const FTEX_Reducer = require("./reducer");
const FTEX_Cache = require("./cache");
const textureLib = require("texture-lib");

module.exports = class FTEX_Parser
{
    constructor(parser, entry, contentType)
    {
        this.entry  = entry;
        this.parser = parser;
        this.header = null;
        this.contentType = contentType;

        this.pow2 = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
        this.pow2Rev = [32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];

        this.mipmapStartLevel = (this.contentType == Content_Types.MIPMAP) ? 1 : 0;

        this.ftexReducer = new FTEX_Reducer();
        this.textureTypes = requireGlobal("lib/bfres/gx2/texture_types.json");
        this.loader = null;
    }

    isPow2(val)
    {
        for(let p of this.pow2)
        {
            if(p == val)return true;
        }
        return false;
    }

    getNextPow2(val)
    {
        for(let p of this.pow2Rev)
        {
            if(p <= val)
                return p;
        }
        return 0;
    }

    adjustToBlockSize(val, blockSize)
    {
        return Math.ceil(val / blockSize) * blockSize;
    }

    async parse()
    {
        if(this.loader)await this.loader.setStatus("Loading FTEX Texture");

        try{
            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));
            this.entry.fileName = this.header.fileName;
            
            this.header = await FTEX_Cache.getCached(this.entry.fileName, () => this._loadTextureData());

        } catch (err) {
            console.warn(`FTEX::parse Exception: ${err}`);
            return false;
        }

        return true;
    }

    async _loadTextureData()
    {
        if(this.loader)await this.loader.setInfo(this.entry.fileName);

        let img = this.header.surface;
        let texTypeInfo = this.textureTypes[img.textureFormat];

        if(this.mipmapStartLevel > 0)
            this._applyMipmapRules(img);

        const rawBuffer = this.parser.file.buffer.slice(this.header.dataOffset, this.header.dataOffset + this.header.surface.dataSize);

        const imageBuffers = this._generateColorBuffer(img, texTypeInfo, rawBuffer);
        this.header.surface.imageBuffer = imageBuffers[0]; // @TODO change everything to accept arrays and remove this "Altlast"
        this.header.surface.imageBuffers = imageBuffers;

        return this.header;
    }

    /**
     * apply rules to a texture object for mipmap files (like Tex2 files)
     * @param {Object} img 
     */
    _applyMipmapRules(img)
    {
        let mipmapMulti = Math.pow(2, this.mipmapStartLevel);
        let mipmapDiff = img.mipmapCount;

        let mipmapPitchMulti = this.isPow2(img.pitch) ? mipmapMulti : (mipmapMulti-1);
        img.pitch = this.getNextPow2(Math.floor(img.pitch / mipmapPitchMulti)); // mm: 10

        let blockSize = GX2_Block_Handler.getBlockSize(img.textureFormat);

        img.sizeX = this.adjustToBlockSize(img.sizeX >> this.mipmapStartLevel, blockSize.x);
        img.sizeY = this.adjustToBlockSize(img.sizeY >> this.mipmapStartLevel, blockSize.y);

        // here are some weird mipmap rules i found out
        // there must be a definition for this somewhere but i can't find itn
        // @TODO investigate more

        if(img.swizzleValue < 0x20000) // got that number from testing a lot of textures
            img.tileMode = 2;
    }

    /**
     * deswizzles and converts a texture into a raw color buffer
     * @param {Object} img 
     * @param {Buffer} rawBuffer 
     * @returns {Buffer} color buffer
     */
    _generateColorBuffer(img, texTypeInfo, rawBuffer)
    {
        const bufferArray = new Array(img.sizeZ);
        let alphaRemoved = false;

        for(let index=0; index<img.sizeZ; ++index)
        {
            let deSwizzledBuffer = Buffer.alloc(rawBuffer.length);
            if(texTypeInfo.bpBlock > 0)
            {
                textureLib.deswizzle(rawBuffer, deSwizzledBuffer, {
                    sizeX: img.sizeX,
                    sizeY: img.sizeY,
                    sizeZ: img.sizeZ,
                
                    index,
                    format: img.textureFormat,
                    tileMode: img.tileMode,
                    swizzle: img.swizzleValue,
                    pitch: img.pitch,
                    bpp: texTypeInfo.bpBlock
                });
            }else{
                deSwizzledBuffer = rawBuffer;
            }

            let blockHandler = new GX2_Block_Handler(deSwizzledBuffer, [img.sizeX, img.sizeY, img.sizeZ], img.textureFormat);
            const texData = blockHandler.decode(index);

            const orgChannels = texData.colorChannels;
            this.ftexReducer.reduce(texData, alphaRemoved);

            if(img.sizeZ > 1 && texData.colorChannels != orgChannels && !alphaRemoved)
            {
                alphaRemoved = true;
                console.warn("FTEX_Parse: array-texture removed alpha-channel!");
            }

            bufferArray[index] = texData.buffer;
            img.colorChannels = texData.colorChannels;
        }
        return bufferArray;
    }
};
