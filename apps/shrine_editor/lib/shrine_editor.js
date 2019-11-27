/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");

const Mubin_Editor = require("./../../../lib/mubin_editor/editor");
const Shrine_Model_Loader = require("./shrine/model_loader");
const Shrine_Creator = require("./shrine/creator");

module.exports = class Shrine_Editor extends Mubin_Editor
{
    /**
     * @param {Node} canvasNode 
     * @param {Node} uiNode
     * @param {Project_Manager} project
     * @param {Loader} loader
     * @param {stringTable} stringTable optional string table object
     */
    constructor(canvasNode, uiNode, project, loader, stringTable = undefined)
    {
        super(canvasNode, uiNode, project, loader, stringTable = undefined);

        this.shrineModelLoader = new Shrine_Model_Loader();
        this.shrineCreator = new Shrine_Creator(this.actorHandler, this.project);

        this.loadActorData = true;
        this.loadProdData  = false;
        this.loadMapMesh   = true;
    }

    /**
     * maps the actory type to the actual mubin location, this will differ between shrines and the main-field
     * @param {string} actorType 
     */
    generateMubinPath(actorType)
    {
        const mapDir = this.mubinName.startsWith("Remains") ? "MainFieldDungeon" : "CDungeon";
        return path.join(this.mubinDir, "Map", mapDir, this.mubinName, `${this.mubinName}_${actorType}.smubin`);
    }

    /**
     * maps the prod type to the actual prod location, this will differ between shrines and the main-field
     * @param {string} prodNum
     * @returns {string|undefined} 
     */
    generateProdPath(prodNum)
    {
        if(prodNum < 1)
        {
            return path.join(this.mubinDir, "Map", "CDungeon", this.mubinName, `${this.mubinName}_Clustering.sblwp`);
        }
        return undefined;
    }

    /**
     * loads the map model (field or shrine)
     */
    async loadMapModel()
    {
        if(this.loadMapMesh)
        {
            this.shrineModelLoader.loader = this.loader;
            const shrineModels = await this.shrineModelLoader.load(this.mubinDir, this.mubinName);
            this.mubinRenderer.setMapModels(shrineModels);
        }
    }

    /**
     * Load a shrine and it's models, textures, actors and other stuff
     * @param {string} directory directory of the shrine
     * @param {string} name name of the shrine
     */
    async load(directory, name)
    {
        await super.load(directory, name);
    }

    getPackFilePath()
    {
        return this.shrineCreator.getPackFilePath();
    }

    /**
     * saves all shrine related data
     * @param {bool} rebuild if true, it rebuilds the .pack file
     */
    async save(rebuild = true)
    {
        return await this.shrineCreator.save(this.mubinDir, this.mubinName, rebuild);
    }
}
