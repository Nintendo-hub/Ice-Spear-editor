/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");
const fs = require("fs-extra");

const SARC = require("sarc-lib");
const yaz0 = require("yaz0-lib");

module.exports = class TitleBG_Handler
{
    constructor(gamePath, projectPath)
    {
        this.gamePath = gamePath;
        this.projectPath = projectPath;

        this.titleBgPath = path.join(this.projectPath, "TitleBG.unpacked");
        this.mainFieldPath = path.join(this.titleBgPath, "Map", "MainField");
    }

    async extract()
    {
        if(!await fs.exists(this.titleBgPath))
        {
            const titleBgGamePath = path.join(this.gamePath, "content", "Pack", "TitleBG.pack");
            const sarc = new SARC();
            sarc.parse(titleBgGamePath);
            await sarc.extractFiles(this.titleBgPath);
        }
    }

    async pack()
    {
        const sarc = new SARC();
        await sarc.fromDirectory(this.titleBgPath);
        const sarcBuffer = sarc.create();
        await fs.writeFile(this.titleBgPath.replace(".unpacked", ".pack"), sarcBuffer);
    }

    getStaticFieldMubin(fieldSection)
    {
        return path.join(this.mainFieldPath, fieldSection, fieldSection + "_Static.smubin");
    }
};