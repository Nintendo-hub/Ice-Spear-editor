/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs   = require('fs-extra');
const PROD = require("./../../prod/prod");

const Actor_Params = require("./../actor/params");
const BYAML_Helper = require("byaml-lib").Helper;

/**
 * Class to load PrOD wannabe "actors" and gives them to the correct handler classes
 */
module.exports = class PROD_Object_Loader
{
    /**
     * loads actors into the handler
     * @param {Actor_Handler} actorHandler 
     * @param {function} generateProdPath
     */
    constructor(actorHandler, generateProdPath)
    {
        this.actorHandler = actorHandler;        
        this.generateProdPath = generateProdPath;
    }

    /**
     * loads dynamic and/or static actors from a shrine/field
     * and adds them to the actor handler
     * @param {string} prodDir base directory
     * @param {string} prodName name
     */
    async load(prodDir, prodName)
    {
        let prodPath;
        for(let prodNum = 0; prodPath = this.generateProdPath(prodNum); ++prodNum)
        {
            this.actorHandler.dataActorProd.push(
                await this._parseProdFile(prodPath, prodNum)
            );
        }
    }

    /**
     * parses a single PrOD file, and adds all object as actors th the handler
     * @param {*} prodPath 
     * @param {*} prodNum 
     */
    async _parseProdFile(prodPath, prodNum)
    {
        const prodParams = [];
        const prodData = await PROD.parse(prodPath);

        for(const mesh of prodData.meshes)
        {
            for(const obj of mesh.objects)
            {
                const param = Actor_Params.createTemplate(mesh.objectName);

                param.Translate[0].value = obj.position[0];
                param.Translate[1].value = obj.position[1];
                param.Translate[2].value = obj.position[2];

                param.Scale = BYAML_Helper.createValue("float32", obj.scale);
                param.Rotate = [
                    BYAML_Helper.createValue("float32", obj.rotation[0]),
                    BYAML_Helper.createValue("float32", obj.rotation[1]),
                    BYAML_Helper.createValue("float32", obj.rotation[2]),
                ];
                
                prodParams.push(param);
                await this._addObjectActor(param, prodNum); // could use Promise.all() but i need the correct order... :(
            }
        }

        return prodParams;
    }

    /**
     * adds a object as actor to the actor handler
     * @param {Object} params param object
     * @param {string} type
     */
    async _addObjectActor(params, prodNum)
    {
        const name = params.UnitConfigName.value;
        await this.actorHandler.addActor(name, params, prodNum, false);
    }
}