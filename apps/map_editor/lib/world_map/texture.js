/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs       = require('fs-extra');
const path     = require('path');

const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = require('./../../../../lib/bfres/parser');

const NUM_TO_LETTER = ["Z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

const COLOR_CHANNELS = 3;
const DETAIL_DIMENSION = {
    "0": 2000,
    "1": 560
};

module.exports = class World_Map_Texture
{
    constructor(basePath, cachePath, mapTilesX, mapTilesY, loader)
    {
        this.basePath = basePath;
        this.texCachePath = path.join(cachePath, "map_textures.bin");
        this.mapTilesX = mapTilesX;
        this.mapTilesY = mapTilesY;

        this.loader = loader;

        this.fileLoader = new Binary_File_Loader();
        this.textureSize = {x: 0, y: 0, z: 0};
    }

    _getTextureName(x, y, detailLevel)
    {
        const sectionName = NUM_TO_LETTER[x] + "-" + (this.mapTilesY - y - 1);
        return `MapTex${detailLevel == "0" ? "" : detailLevel}_${sectionName}`;
    }

    async _loadSingleTexture(texPath, textureName)
    {
        let buffer = this.fileLoader.buffer(texPath);
        const bfresTexParser = new BFRES_Parser(true);

        if(await bfresTexParser.parse(buffer))
        {
            const bfresTex = bfresTexParser.getTextureByName(textureName);
            if(bfresTex && bfresTex.surface && bfresTex.surface.imageBuffer)
            {
                return bfresTex.surface.imageBuffer;
            }
        }
        return undefined;
    }

    async _loadTexturesFromBfres(detailLevel)
    {
        const singleImageSize =  this.textureSize.x * this.textureSize.y * COLOR_CHANNELS;
        const imageBuffer = Buffer.alloc(this.textureSize.z * singleImageSize);
        let imageBuffPos = 0;

        for(let y=0; y<this.mapTilesY; ++y) 
        {
            for(let x=0; x<this.mapTilesX; ++x)
            {
                const textureName = this._getTextureName(x, y, detailLevel);
                const texPath = path.join(this.basePath, textureName + ".sbmaptex");

                await this.loader.setInfo("Load & Cache " + textureName);
                const sectionBuffer = await this._loadSingleTexture(texPath, textureName);
                if(sectionBuffer)
                {
                    sectionBuffer.copy(imageBuffer, imageBuffPos);
                }       

                imageBuffPos += singleImageSize;
            }
        }

        return imageBuffer;
    }

    async load(detailLevel = "1")
    {
        this.textureSize.x = DETAIL_DIMENSION[detailLevel];
        this.textureSize.y = this.textureSize.x;
        this.textureSize.z = this.mapTilesX * this.mapTilesY;

        let imageBuffer = undefined;

        if(await fs.exists(this.texCachePath))
        {
            imageBuffer = await fs.readFile(this.texCachePath);
        }else{
            imageBuffer = await this._loadTexturesFromBfres(detailLevel);
            await fs.writeFile(this.texCachePath, imageBuffer);
        }

        return imageBuffer;
    }

    getSize()
    {
        return this.textureSize;
    }
}