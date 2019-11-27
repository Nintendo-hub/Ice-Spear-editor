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
 * Class to cteate shrines and save/generate all its data
 */
module.exports = class Shrine_Creator
{
    /**
     * @param {Actor_Handler} actorHandler 
     * @param {Project_Manager} project
     */
    constructor(actorHandler, project)
    {
        this.actorHandler = actorHandler;
        this.project = project;
    }
    
    /**
     * returns the path to the packed .pack file
     * note: a path is always returned, even if the file does not exist
     * @param {string} shrineName shrine name
     * @returns {string} full path
     */
    getPackFilePath(shrineName)
    {
        return path.join(this.project.getShrinePath("build"),  shrineName + ".pack");
    }

    /**
     * saves all shrine data, and optionally builds the .pack file
     * if build, it also creates an backup
     * @param {string} shrineDir shrine base directory
     * @param {string} shrineName shrine name
     * @param {bool} packData if true, builds the .pack file
     */
    async save(shrineDir, shrineName, packData)
    {
        const packPath   = this.getPackFilePath(shrineName);
        const backupName = `${shrineName}.${dateformat(new Date(), "yyyy-mm-dd_HH_MM_ss")}.pack`;
        const backupPath = path.join(this.project.getShrinePath("backup"), backupName);

        await Promise.all([
            this.saveActors("Dynamic", shrineDir, shrineName),
            this.saveActors("Static",  shrineDir, shrineName),
        ]);

        if(packData)
        {
            const sarc = new SARC();
            await sarc.fromDirectory(shrineDir);
            await sarc.save(packPath);
            await fs.copy(packPath, backupPath);
        }
    }

    /**
     * @param {string} typeName "Dynamic" or "Static"
     * @param {string} shrineDir shrine base directory
     * @param {string} shrineName shrine name
     */
    async saveActors(typeName, shrineDir, shrineName)
    {
        const mapDir = shrineName.startsWith("Remains") ? "MainFieldDungeon" : "CDungeon";

        const actorPath = path.join(shrineDir, "Map", mapDir, shrineName, `${shrineName}_${typeName}.smubin`); 
        const byaml = new BYAML.Creator();
        
        const byamlData = {...(typeName == "Dynamic" ? this.actorHandler.dataActorDyn : this.actorHandler.dataActorStatic)};
        byamlData.Objs = byamlData.Objs.sort((a, b) => a.HashId.value - b.HashId.value);

        this.actorHandler.dataActorDyn.Objs
        const actorBuffer = byaml.create(typeName == "Dynamic" ? this.actorHandler.dataActorDyn : this.actorHandler.dataActorStatic);
        const actorYaz = yaz0.encode(actorBuffer);

        await fs.writeFile(actorPath, actorYaz);
    }
}