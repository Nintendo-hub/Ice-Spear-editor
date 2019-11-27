/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const BYAML = require("byaml-lib");

class Actor_Handler_Importer 
{
    constructor(actorHandler)
    {
        this.actorHandler = actorHandler;
    }

    /**
     * imports data from the actor handler again
     * @param {Object} data 
     */
    async import(data) 
    {
        this.actorHandler.clear();

        this._setDataObjects(BYAML.Helper.fromJSON(data));
        this._addAllActors();
    }

    /**
     * fill the handlers data array again (Dynamic, Static, ProD)
     * @param {Object} data 
     */
    _setDataObjects(data)
    {
        if(data.dataActorDyn)
            this.actorHandler.dataActorDyn = data.dataActorDyn;

        if(data.dataActorStatic)
            this.actorHandler.dataActorStatic = data.dataActorStatic;

        if(data.dataActorProd)
            this.actorHandler.dataActorProd = data.dataActorProd;
    }

    /**
     * check all data array and add every actor back
     */
    async _addAllActors()
    {
        const dataDyn    = this.actorHandler.dataActorDyn;
        const dataStatic = this.actorHandler.dataActorStatic;

        if(dataDyn && dataDyn.Objs)
            await this._addActorArray(dataDyn.Objs, "Dynamic");
        
        if(dataDyn && dataStatic.Objs)
            await this._addActorArray(dataStatic.Objs, "Static");

        for(let i in this.actorHandler.dataActorProd)
            await this._addActorArray(this.actorHandler.dataActorProd[i], i);
    }

    /**
     * adds a single actor array back using addActor()
     * @param {Array<Object>} actorObjectArray 
     */
    async _addActorArray(actorObjectArray, type)
    {
        if(actorObjectArray == null)
            return;

        for(let params of actorObjectArray)
        {
            const name = params.UnitConfigName.value;
            await this.actorHandler.addActor(name, params, type, false);
        }
    }
};

module.exports = async (actorHandler, data) => {
    const importer = new Actor_Handler_Importer(actorHandler);
    return await importer.import(data);
};
