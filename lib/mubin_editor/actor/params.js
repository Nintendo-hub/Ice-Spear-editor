/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const BYAML_Helper = require("byaml-lib").Helper;

module.exports = class Actor_Params
{
    static normalize(params)
    {
        // @TODO investigate more about Rotation (when is it an array, when not, is it always the Y-axis?)
        /*
        if(params.Rotate != null && params.Rotate.length == null)
        {
            params.Rotate = [
                BYAML_Helper.createValue("float32", 0.0),
                params.Rotate,
                BYAML_Helper.createValue("float32", 0.0)
            ];
        }
        */
    }

    /**
     * creates a basic byaml template for actors
     * @param {string} unitName aka UnitConfigName
     * @param {number} hashId 
     * @returns {Object} byaml object
     */
    static createTemplate(unitName, hashId = 0)
    {
       return {
            HashId: BYAML_Helper.createValue("u32", hashId),
            SRTHash: BYAML_Helper.createValue("s32", 0),
            Translate: [
                BYAML_Helper.createValue("float32", 0.0),
                BYAML_Helper.createValue("float32", 0.0),
                BYAML_Helper.createValue("float32", 0.0),
            ],
            UnitConfigName: BYAML_Helper.createValue("string", unitName)
        }; 
    }
}