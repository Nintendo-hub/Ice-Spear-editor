/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs   = require('fs-extra');
const path = require('path');
const TitleBG_Handler = require("./../../../lib/titlebg_handler");

class Static_Mubin_Extractor
{
    /**
     * @param {string} fieldProjectDir path to the field in the project
     * @param {string} fieldSection field section name
     */
    constructor(gamePath, projectPath, fieldProjectDir, fieldSection)
    {
        this.gamePath = gamePath;
        this.projectPath = projectPath;
        this.fieldProjectDir = fieldProjectDir;
        this.fieldSection    = fieldSection;
    }

    /**
     * extracts and copies field data
     */
    async extract()
    {
        const targetFile = path.join(this.fieldProjectDir, this.fieldSection + "_Static.smubin");
        if(await fs.exists(targetFile))
            return;

        const titleBgHandler = new TitleBG_Handler(this.gamePath, this.projectPath);
        await titleBgHandler.extract();

        const staticMubinPath = titleBgHandler.getStaticFieldMubin(this.fieldSection);

        if(await fs.exists(staticMubinPath))
        {
            await fs.copyFile(staticMubinPath, targetFile);
        }
    }
}

module.exports = async (gamePath, projectPath, fieldProjectDir, fieldSection) => 
{
    const extractor = new Static_Mubin_Extractor(gamePath, projectPath, fieldProjectDir, fieldSection);
    return await extractor.extract();
};