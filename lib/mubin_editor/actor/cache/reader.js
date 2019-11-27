/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

module.exports = class Actor_Cache_Reader
{
    constructor(actorCachePath, actorJsonPath)
    {
        this.actorCachePath = actorCachePath;
        this.actorJsonPath = actorJsonPath;

        this.cacheBuffer = undefined;
    }

    async read(actorName)
    {
        try{
            const [jsonBuffer, cacheBuffer] = await Promise.all([
                fs.readFile(this.actorJsonPath),
                fs.readFile(this.actorCachePath),
            ]);
            this.cacheBuffer = cacheBuffer;

            const jsonDataArray = JSON.parse(jsonBuffer);
            for(const jsonData of Object.values(jsonDataArray))
            {
                jsonData.vertexArray = this._readBuffer(jsonData.vertexArray, "f32");
                jsonData.indexArray = this._readBuffer(jsonData.indexArray, "u16");

                if(jsonData.color0Array)
                    jsonData.color0Array = this._readBuffer(jsonData.color0Array, "f32");

                if(jsonData.uv0Array) 
                    jsonData.uv0Array = this._readBuffer(jsonData.uv0Array, "f32");

                if(jsonData.uv1Array) 
                    jsonData.uv1Array = this._readBuffer(jsonData.uv1Array, "f32");

                if(jsonData.textureColor)
                    jsonData.textureColor = this._readTexture(jsonData.textureColor);

                if(jsonData.textureNormal)
                    jsonData.textureNormal = this._readTexture(jsonData.textureNormal);

                if(jsonData.textureEmission)
                    jsonData.textureEmission = this._readTexture(jsonData.textureEmission);
            }
            return jsonDataArray;
            
        }catch(e){
            //console.warn(e);
            return undefined; // this is totally fine, it just means there is no cache
        }
    }

    _readTexture(info)
    {
        info.imageBuffer = this._readBuffer(info);
        info.imageBuffers = [info.imageBuffer];

        delete info.pos;
        delete info.size;
        return info;
    }

    _readBuffer(info, type = undefined)
    {
        const buff = this.cacheBuffer.slice(info.pos, info.pos + info.size);
        switch(type)
        {
            case "f32":
                return new Float32Array(buff.buffer, buff.byteOffset, Math.floor(buff.length /  Float32Array.BYTES_PER_ELEMENT));
                /*for(let f of a)
                {
                    if(isNaN(f) || !isFinite(f))
                        throw "edewef";
                }
                return a;*/
            case "u16":
                return new Uint16Array(buff.buffer, buff.byteOffset, Math.floor(buff.length /  Uint16Array.BYTES_PER_ELEMENT));
            case "buffer":
            default:
                return buff;
            
        }
    }
};
