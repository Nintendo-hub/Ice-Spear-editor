/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to: handsomematt
* @see https://github.com/handsomematt/botw-modding/blob/master/docs/file_formats/blwp.md
*/

const Binary_File = require('binary-file');

/**
 * simple parser for PrOD files
 */
module.exports = class PROD_Parser
{
    constructor()
    {
        this.structureJson = require("./structure.json");
    }

    /**
     * parses a PrOD file
     * @param {string|Buffer} filePathOrBuffer 
     */
    parse(filePathOrBuffer)
    {
        const fileLoader = new Binary_File.Loader();
        const blwpBuffer =  fileLoader.buffer(filePathOrBuffer);

        this.parser = new Binary_File.Parser(blwpBuffer);
        this.file = this.parser.file;
        this.file.setEndian("big");

        return this.parser.parse(this.structureJson);
    }
}