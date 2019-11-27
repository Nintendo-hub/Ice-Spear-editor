/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs   = require('fs-extra');
const path = require('path');
const SARC = require("sarc-lib");
const yaz0 = require("yaz0-lib");

const Binary_File_Loader = require("binary-file").Loader;

class Field_Extractor
{
    /**
     * @param {string} fieldGamePath path of the field in the game
     * @param {string} fieldStaticGamePath path of the static field data
     * @param {string} fieldProjectDir path to the field in the project
     * @param {string} fieldSection field section name
     */
    constructor(fieldGamePath, fieldStaticGamePath, fieldProjectDir, fieldSection)
    {
        this.fieldGamePath   = fieldGamePath;
        this.fieldStaticGamePath = fieldStaticGamePath;
        this.fieldProjectDir = fieldProjectDir;
        this.fieldSection    = fieldSection;
    }

    /**
     * extracts and copies field data
     */
    async extract()
    {
        const filePromises = [
            fs.copy(path.join(this.fieldGamePath, this.fieldSection), this.fieldProjectDir)
        ];

        for(let i=0; i<4; ++i)
        {
            const staticName = `${this.fieldSection}-${i}.shksc`;
            filePromises.push(this._copyAndUnpackStaticPack(staticName));
        }

        await Promise.all(filePromises);
    }

    /**
     * copies and unpacks a static sblwp file
     * @param {string} path 
     */
    async _copyAndUnpackStaticPack(staticName)
    {
        const localPath = path.join(this.fieldProjectDir, staticName);
        await fs.copy(path.join(this.fieldStaticGamePath, staticName), localPath);

        // @TODO remove after collision works
        /*
        await fs.writeFile(localPath + ".bin", yaz0.decode(
            await fs.readFile(localPath)
        ));
        */
    }
}

module.exports = async (fieldGamePath, fieldStaticGamePath, fieldProjectDir, fieldSection) => 
{
    const extractor = new Field_Extractor(fieldGamePath, fieldStaticGamePath, fieldProjectDir, fieldSection)
    return await extractor.extract();
};