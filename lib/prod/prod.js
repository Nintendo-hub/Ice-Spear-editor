/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to:
* @see https://github.com/jam1garner/aamp2xml
*/

const Parser = require("./parser");

module.exports =
{
    /**
     * parses a PrOD file
     * @param {string|Buffer} filePathOrBuffer 
     */
    parse: async (filePathOrBuffer) =>
    {
        const parser = new Parser();
        return parser.parse(filePathOrBuffer);
    }
}