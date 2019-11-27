/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

//const Binary_File_Parser = require('binary-file').Parser;
const BFRES_FileTypes = requireGlobal("lib/bfres/file_types.js");

module.exports = class Editor_Hex
{
    constructor(node, bfresParser, entry)
    {
        this.info = {
            name: "Hex-Editor"
        };

        this.node = node;
        this.entry = entry;
        this.parser = bfresParser.parser;
        this.file = this.parser.file;

        this.fileOffset = 0;
        this.fileLength = 0x500;

        this.loadData();
    }

    loadData()
    {
        this.file.pos(this.entry.dataPointer);

        this.fileOffset = this.entry.dataPointer;

        if(this.entry.type == BFRES_FileTypes.types.EMBEDDED){
            this.fileOffset = this.file.read("s32") + this.entry.dataPointer;
            this.fileLength = this.file.read("u32");
        }

        this.data = this.file.buffer.slice(this.fileOffset, this.fileOffset + this.fileLength);

        this.renderData(this.fileOffset);
    }

// @TODO start always aligned to 0x16!
//
    renderData(fileOffset)
    {
        this.node.querySelector(".data-header-dataOffset").innerHTML = "0x" + this.fileOffset.toString(16);
        this.node.querySelector(".data-header-dataSize").innerHTML   = "0x" + this.fileLength.toString(16);

        let cellCount = 0;
        let htmlString = "";
        let dataSet = true;
        let pos = 0;
        let numChar = null;

        while(dataSet)
        {
            let textValue = "";

            let fileOffsetText = fileOffset.toString(16).toUpperCase();
            htmlString += "<tr>";
            htmlString += "<td>0x" + fileOffsetText + "</td>";
            fileOffset += 16;

            for(let i=0; i<16; ++i)
            {
                if(dataSet && this.data[pos] != null)
                {
                    numChar = this.data[pos].toString(16);
                    htmlString += "<td>" + (numChar.length == 0 ? "0" : "") + numChar + "</td>";
                    textValue += String.fromCharCode(this.data[pos]);
                }else{
                    htmlString += "<td></td>";
                    textValue += ".";
                    dataSet = false;
                }

                ++pos;
            }

            htmlString += "<td>" + textValue + "</td>";
            htmlString += "</tr>";
        }

        this.node.querySelector(".hex-editor tbody").innerHTML = htmlString;
    }
};
