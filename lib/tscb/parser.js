/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");
const Binary_File = require('binary-file');

const structureHeader = require("./header.json");
const structureTile   = require("./tile.json");

module.exports = class TSCB_Parser
{
    parse(tscbBuffer)
    {
        const parser = new Binary_File.Parser(tscbBuffer);
        const file = parser.file;

        file.setEndian("big");

        console.time("tscb");

        const header = parser.parse(structureHeader);
        header.tiles = [];
        file.pos(0x9598); // @TODO check why the calc. offset is wrong

        // min/max: [-12,-12] -> [12, 12]
        for(let i=0; i<header.tileTableCount; ++i)
        {
            const tile = parser.parse(structureTile);

            if(tile.hasMoreData)
            {
                tile.extraDataCount = file.read("u32");
                tile.extraData = [];

                for(let e=0; e<tile.extraDataCount; ++e)
                    tile.extraData.push(file.read("u32"));

                if(tile.extraData[tile.extraData.length-1] != 0)
                {
                    file.read("u32");
                }
            }

            header.tiles.push(tile);
        }

        return header;
    }
};
