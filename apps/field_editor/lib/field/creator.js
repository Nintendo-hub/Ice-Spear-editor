/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs   = require('fs-extra');
const path = require('path');
const dateformat = require("dateformat");

const BYAML = require("byaml-lib");
const SARC  = require("sarc-lib");
const yaz0  = require("yaz0-lib");

/**
 * Class to create field data and save/generate all its data
 */
module.exports = class Field_Creator
{
    /**
     * @param {Actor_Handler} actorHandler 
     * @param {Project_Manager} project
     */
    constructor(actorHandler, project, titleBgHandler)
    {
        this.actorHandler = actorHandler;
        this.project = project;
        this.titleBgHandler = titleBgHandler;
    }
    
    /**
     * saves all field data
     * if build, it also creates an backup
     * @param {string} fieldDir field base directory
     * @param {string} fieldSection section name
     */
    async save(fieldDir, fieldSection)
    {
        await this.saveActors("Dynamic", fieldDir, fieldSection);

        if(this.actorHandler.dataActorStatic)
        {
            await this.saveActors("Static", fieldDir, fieldSection);
        }
    }

    /**
     * @param {string} typeName "Dynamic" or "Static"
     * @param {string} fieldDir field base directory
     * @param {string} fieldSection section name
     */
    async saveActors(typeName, fieldDir, fieldSection)
    {
        const actorPath = path.join(fieldDir, `${fieldSection}_${typeName}.smubin`); 
        const byaml = new BYAML.Creator();
        const actorBuffer = byaml.create(typeName == "Dynamic" ? this.actorHandler.dataActorDyn : this.actorHandler.dataActorStatic);
        const actorYaz = yaz0.encode(actorBuffer);

        await fs.writeFile(actorPath, actorYaz);

        if(typeName == "Static")
        {
            const titleStaticPath = this.titleBgHandler.getStaticFieldMubin(fieldSection);
            await fs.writeFile(titleStaticPath, actorYaz);
        }
    }
}