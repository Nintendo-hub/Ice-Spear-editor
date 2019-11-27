/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Parser = require('binary-file').Parser;
const BFRES_FileTypes    = requireGlobal('./lib/bfres/file_types.js');
const Content_Types      = requireGlobal("lib/bfres/content_types.json");

module.exports = class EMBEDDED_Parser
{
    constructor(parser, entry, contentType)
    {
        this.entry  = entry;
        this.parser = parser;
        this.header = null;
        this.contentType = contentType;

        this.data = null;
    }

    getTextureInfo(index)
    {
        //let totalNum = (this.data.length / 8);
        //index = (totalNum - 1 - index) * 8;
        index *= 8;

        if(index < 0 || (index + 7) >= this.data.length)
            return null;

        return this.data.slice(index, index + 8);
    }

    parse()
    {
        try{
            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));

            this.data = this.parser.file.buffer.slice(this.header.offset, this.header.offset + this.header.length);

        } catch (err) {
            console.warn(`EMBEDED::parse Exception: ${err}`);
            return false;
        }

        return true;
    }
};
