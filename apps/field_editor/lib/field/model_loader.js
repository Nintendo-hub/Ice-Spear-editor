/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs   = require('fs-extra');
const path = require('path');

const Binary_File_Loader = require("binary-file").Loader;

/**
 * Class to load the shrine model and its textures
 */
module.exports = class Field_Model_Loader
{
    /**
     * loads an array of section meshes
     * @param {string} fieldPath shrine base directory
     * @param {string} fieldSection shrine name
     * @param {Terrain} terrain terrain handler
     * @returns {Array} the main model parser
     */
    async load(fieldPath, fieldSection, terrain)
    {
        const lodLevel = 6;
        terrain.loadTerrainTscb();
        return await terrain.loadSectionMesh(fieldSection, lodLevel) || [];
    }
}