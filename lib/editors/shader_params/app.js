/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs       = require("fs");
const {dialog} = require('electron').remote;
const Split    = require('split.js');

const BFRES_FileTypes = requireGlobal("lib/bfres/file_types.js");

module.exports = class Editor_ShaderParams
{
    constructor(node, bfresParser, entry)
    {
        this.info = {
            name: "Shader-Parameter-Editor"
        };

        this.node   = node;
        this.entry  = entry;
        this.bfres  = bfresParser;
        this.parser = bfresParser.parser;
        this.file   = this.parser.file;

        this.fshuParser =  mainApp.bfresParser.getFileParser(BFRES_FileTypes.types.FSHU_SHADER, 1);

        Split([this.node.querySelector(".sidebar-1"), this.node.querySelector(".sidebar-2")], {
            sizes     : [25, 75],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.loadData();
    }

    loadData()
    {
        if(this.entry.parser == null)
        {
            let fileInfo = BFRES_FileTypes.info[this.entry.type];
            const Parser_Class = requireGlobal(fileInfo.parser);

            this.entry.parser = new Parser_Class(this.parser, this.entry, this.bfres.contentType);
            this.entry.parser.parse();
        }

        this.render();
    }

    render()
    {

    }
};
