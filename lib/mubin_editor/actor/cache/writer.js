/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

module.exports = class Actor_Cache_Writer
{
    constructor(actorCachePath, actorJsonPath)
    {
        this.actorCachePath = actorCachePath;
        this.actorJsonPath = actorJsonPath;

        this.offset = 0;
        this.cacheBuffer = undefined;
    }

    async write(mainModels)
    {
        let totalSize = 0;
        for(const modelInfo of Object.values(mainModels))
        {
            /*delete modelInfo.textureColor;
            delete modelInfo.textureNormal;
            delete modelInfo.textureEmission;*/

            totalSize += this._getTotalSize(modelInfo);
        }
        this.cacheBuffer = Buffer.alloc(totalSize);

        const modelInfo = {};
        for(const i in mainModels)
        {
            modelInfo[i] = this._cacheSingleModel(mainModels[i]);
        }
        
        await fs.writeFile(this.actorCachePath, this.cacheBuffer);
        await fs.writeFile(this.actorJsonPath, JSON.stringify(modelInfo, null, 4));
        //console.log(`Done writing cache file '${this.actorJsonPath}'`);

        this.cacheBuffer = undefined;
    }

    _cacheSingleModel(modelEntry)
    {
        const modelInfo = {...modelEntry};
        delete modelInfo.normalArray;
        delete modelInfo.material;

        modelInfo.vertexArray = this._writeSingleBuffer(modelInfo.vertexArray);
        modelInfo.indexArray = this._writeSingleBuffer(modelInfo.indexArray);

        if(modelInfo.color0Array)
            modelInfo.color0Array = this._writeSingleBuffer(modelInfo.color0Array);

        if(modelInfo.uv0Array) 
            modelInfo.uv0Array = this._writeSingleBuffer(modelInfo.uv0Array);

        if(modelInfo.uv1Array) 
            modelInfo.uv1Array = this._writeSingleBuffer(modelInfo.uv1Array);

        if(modelInfo.textureColor && modelInfo.textureColor.imageBuffer)
            modelInfo.textureColor = this._writeTexture(modelInfo.textureColor);

        if(modelInfo.textureNormal && modelInfo.textureNormal.imageBuffer)
            modelInfo.textureNormal = this._writeTexture(modelInfo.textureNormal);

        if(modelInfo.textureEmission && modelInfo.textureEmission.imageBuffer)
            modelInfo.textureEmission = this._writeTexture(modelInfo.textureEmission);

        return modelInfo;
    }

    _writeTexture(tex)
    {
        return {
            ...this._writeSingleBuffer(tex.imageBuffer),
            sizeX: tex.sizeX,
            sizeY: tex.sizeY,
            colorChannels: tex.colorChannels
        };
    }

    _writeSingleBuffer(buff)
    {
        const bufferView = Buffer.from(buff.buffer);
        bufferView.copy(this.cacheBuffer, this.offset);

        const info = {pos: this.offset, size: bufferView.byteLength};
        info.size += this._getAlignmentSize(info.size);
        
        this.offset += info.size;
        return info;
    }

    _getAlignmentSize(bytes, alignTo = 4)
    {
        return (alignTo - (bytes % alignTo)) % alignTo;
    }

    _getSizeWithAlignment(bytes, alignTo = 4)
    {
        return bytes + this._getAlignmentSize(bytes, alignTo);
    }

    _getTotalSize(modelInfo)
    {
        let totalSize = 0;
        totalSize += this._getSizeWithAlignment(modelInfo.vertexArray.byteLength);
        totalSize += this._getSizeWithAlignment(modelInfo.indexArray.byteLength);

        if(modelInfo.color0Array)
            totalSize += this._getSizeWithAlignment(modelInfo.color0Array.byteLength);

        if(modelInfo.uv0Array) 
            totalSize += this._getSizeWithAlignment(modelInfo.uv0Array.byteLength);

        if(modelInfo.uv1Array) 
            totalSize += this._getSizeWithAlignment(modelInfo.uv1Array.byteLength);

        if(modelInfo.textureColor && modelInfo.textureColor.imageBuffer)
            totalSize += this._getSizeWithAlignment(modelInfo.textureColor.imageBuffer.byteLength);

        if(modelInfo.textureNormal && modelInfo.textureNormal.imageBuffer)
            totalSize += this._getSizeWithAlignment(modelInfo.textureNormal.imageBuffer.byteLength);

        if(modelInfo.textureEmission && modelInfo.textureEmission.imageBuffer)
            totalSize += this._getSizeWithAlignment(modelInfo.textureEmission.imageBuffer.byteLength);

        return totalSize;
    }
};