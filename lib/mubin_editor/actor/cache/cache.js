/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

const Cache_Writer = require("./writer");
const Cache_Reader = require("./reader");

/**
 * class to load and save actors to/from cache
 */
module.exports = class Actor_Cache
{
    constructor(cachePath, enabled = true)
    {
        this.enabled = enabled;
        this.cachePath = path.join(cachePath, "actors");
        fs.ensureDirSync(this.cachePath);
    }

    _getPaths(actorName)
    {
        return {
            cache: path.join(this.cachePath, `${actorName}.cache.bin`),
            json: path.join(this.cachePath, `${actorName}.cache.json`),
        }
    }

    /**
     * writes an actor to its cache file
     * @param {string} actorName 
     * @param {Array<Object>} mainModels 
     */
    async cache(actorName, mainModels)
    {
        if(this.enabled)
        {
            const paths = this._getPaths(actorName);
            const writer = new Cache_Writer(paths.cache, paths.json);
            return await writer.write(mainModels);
        }
    }

    /**
     * reads an actor from its cache file
     * @param {string} actorName 
     * @returns {Array<Object>} mainModels 
     */
    async get(actorName)
    {
        if(this.enabled)
        {
            const paths = this._getPaths(actorName);
            const reader = new Cache_Reader(paths.cache, paths.json);
            return await reader.read(actorName);
        }
    }
};