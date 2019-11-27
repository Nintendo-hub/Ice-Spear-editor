/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");
const SARC = require("sarc-lib");

/**
 * loader for terrain pack files
 */
module.exports = class Pack_Loader
{
    /**
     * @param {string} pathMainField
     */
    constructor(pathMainField)
    {
        this.pathMainField = pathMainField;
        this.packCache = {};
    }

    /**
     * loads a pack from disk or, if already loaded, from cache
     * @param {string} tileName 
     * @returns {SARC} sarc object
     */
    load(tileName, type)
    {
        const packName = this._getTilePackName(tileName) + `.${type}.sstera`;
        let sarc = this.packCache[packName];

        if(!sarc)
        {
            const ssteraPackPath = path.join(this.pathMainField, packName);
            sarc = new SARC();
            sarc.parse(ssteraPackPath);
            this.packCache[packName] = sarc;
        }

        return sarc;
    }

    /**
     * returns the pack name where the requested file is located in
     * @param {string} tileName 
     * @returns {string} package name
     */
    _getTilePackName(tileName)
    {
        return (Math.floor(parseInt(tileName, 16) / 4) * 4)
                .toString(16).toUpperCase();
    }
};