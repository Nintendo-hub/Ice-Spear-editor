/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs    = require('fs-extra');
const BYAML = require("byaml-lib");
const Binary_File_Loader = require("binary-file").Loader;

/**
 * Class to load actors in a mubin and give them to the correct handler classes
 */
module.exports = class Actor_Loader
{
    /**
     * loads actors into the handler
     * @param {Actor_Handler} actorHandler 
     * @param {function} generateMubinPath
     */
    constructor(actorHandler, generateMubinPath)
    {
        this.actorHandler = actorHandler;        
        this.generateMubinPath = generateMubinPath;
        this.fileLoader = new Binary_File_Loader();
    }

    /**
     * loads dynamic and/or static actors from a shrine/field
     * and adds them to the actor handler
     * @param {string} mubinDir base directory
     * @param {string} mubinName name
     */
    async load(mubinDir, shrineDir)
    {
        this.actorHandler.dataActorDyn = await this._loadActors("Dynamic");
        this.actorHandler.dataActorStatic = await this._loadActors("Static");

        const { dataActorDyn, dataActorStatic } = this.actorHandler;

        if(dataActorDyn != null && dataActorDyn.Objs != null)
            await this._addAllActors(dataActorDyn.Objs, "Dynamic");

        if(dataActorStatic != null && dataActorStatic.Objs != null)
            await this._addAllActors(dataActorStatic.Objs, "Static");
    }

    /**
     * loads dynamic or static actors from the shrine actor BYAML files
     * @param {string} typeName "Dynamic" or "Static"
     * @returns undefined or an object with the parsed BYAML
     */
    async _loadActors(typeName)
    {
        const fileActors = this.generateMubinPath(typeName);
        if(await fs.exists(fileActors))
        {
            const byaml = new BYAML.Parser();
            return byaml.parse(this.fileLoader.buffer(fileActors));
        }

        return undefined;
    }

    /**
     * adds all actors to the actor handler
     * @param {Object} actorObjectArray 
     * @param {string} type
     */
    async _addAllActors(actorObjectArray, type)
    {
        for(let params of actorObjectArray)
        {
            const name = params.UnitConfigName.value;
            await this.actorHandler.addActor(name, params, type, false);
        }
    }
}