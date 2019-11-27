/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

module.exports = class Layout_Save
{
    constructor(saveDirectory)
    {
        this.saveDirectory = saveDirectory;
        this.saveData = {};
    }

    _getSaveFilePath(logicName)
    {
        return path.join(this.saveDirectory, `${logicName}.logic.json`);
    }

    async save(cy, logicName)
    {
        const saveData = {
            nodes: {}
        };

        cy.nodes().forEach(actor => 
        {
            saveData.nodes[actor.data("id")] = {
                pos: actor.position(),
                hidden: actor.hidden()
            };
        });

        await fs.writeJSON(this._getSaveFilePath(logicName), saveData);
    }

    async load(logicName)
    {
        try{
            this.saveData = await fs.readJSON(this._getSaveFilePath(logicName));
            return this.saveData;
        }catch(e){}

        return {};
    }

    getNodeParams(id)
    {
        if(!this.saveData.nodes)
            return {};

        return {
            position: this.saveData.nodes[id] ? this.saveData.nodes[id].pos : undefined,
            locked: this.saveData.nodes[id] ? true : false,
        };
    }

    isNodeHidden(id)
    {
        if(!this.saveData.nodes)
            return false;

        return this.saveData.nodes[id] ? this.saveData.nodes[id].hidden : false;
    }

    hasSave()
    {
        return !!this.saveData.nodes;
    }
};