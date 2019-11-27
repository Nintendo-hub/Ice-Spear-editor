/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs   = require('fs-extra');
const path = require('path');

const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = requireGlobal('lib/bfres/parser.js');
/**
 * Class to load the shrine model and its textures
 */
module.exports = class Shrine_Model_Loader
{
    constructor()
    {
        this.fileLoader = new Binary_File_Loader();
    }

    /**
     * loads the shrine BFRES model, also tries to load the texture file
     * @param {string} shrineDir shrine base directory
     * @param {string} shrineName shrine name
     * @returns {BFRES_Parser|undefined} the main model parser
     */
    async load(shrineDir, shrineName)
    {
        const filesBasePath =  path.join(shrineDir, "Model", "DgnMrgPrt_" + shrineName);
        const shrineModelPath = filesBasePath + ".sbfres";

        if(fs.existsSync(shrineModelPath))
        {
            const modelBuffer = this.fileLoader.buffer(shrineModelPath);

            const shrineBfresParser = new BFRES_Parser(true);
            shrineBfresParser.loader = this.loader;

            const texBfresParser = await this._loadShrineTexture(filesBasePath);
            if(texBfresParser)
                shrineBfresParser.setTextureParser(texBfresParser);

            if(await shrineBfresParser.parse(modelBuffer))
            {
                return shrineBfresParser.getModels();
            }
        }
        return undefined;
    }

    /**
     * tries to load the Tex2 texture file
     * @param {string} filesBasePath base path including name for bfres files
     * @returns {BFRES_Parser|undefined} the texture-bfres parser
     */
    async _loadShrineTexture(filesBasePath)
    {
        //return undefined;
        let shrineTexPath = filesBasePath + ".Tex1.sbfres";
        if(!fs.existsSync(shrineTexPath)) {
            shrineTexPath = filesBasePath + ".Tex2.sbfres";
        }

        if(fs.existsSync(shrineTexPath))
        {
            const texBuffer = this.fileLoader.buffer(shrineTexPath);

            const texBfresParser = new BFRES_Parser(true);
            texBfresParser.loader = this.loader;
            if(await texBfresParser.parse(texBuffer))
            {
                return texBfresParser;
            }
        }

        return undefined;
    }

}