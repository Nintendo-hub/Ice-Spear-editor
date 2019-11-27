/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to:
* @see https://github.com/jam1garner/aamp2xml
*/

const fs = require('fs');
const Binary_File_Creator = require('binary-file').Creator;
const BXML_Node = require("./bxml_node.js");

const STRING_PADDING = 4;

const SIZE_HEADER    = 52;
const SIZE_ROOT_NODE = 12;
const SIZE_NODE      = 8;

module.exports = class BXML_Creator
{
    constructor()
    {
        this.stringTable = new Map();
        this.dataTable   = new Map();

        this.headerData = {};

        this.offsetDataTable   = 0;
        this.offsetStringTable = 0;

        this.fileCreator = new Binary_File_Creator();

        this.headerStructure = require("./header.json");
        this.dataTypes = require("./data_types.json");
    }

    _bufferSortFunction(bufferA, bufferB)
    {
        let len = Math.max(bufferA.length, bufferB.length);
        for(let i=len-1; i>=0; --i)
        {
            let a = bufferA[i] || 0;
            let b = bufferB[i] || 0;

            let diff = a - b;
            if(diff != 0)
                return diff;
        }
    }       

    _createStringAndDataTable(bxmlNode)
    {
        let sortedDataTable = [];
 
        bxmlNode.forEach( node => 
        {
            let dataTypeInfo = this.dataTypes[node.type];
            if(dataTypeInfo != null && node.hasValue())
            {
                let dataType = dataTypeInfo.type;
                if(dataType == "string")
                {
                    let str = node.val();
                    if(!this.stringTable.has(str))
                    {
                        this.stringTable.set(str, this.headerData.stringBufferSize);

                        this.headerData.stringBufferSize += Buffer.byteLength(str, "utf8") + 1; // +1 = ending zero
                        this.headerData.stringBufferSize = Math.ceil(this.headerData.stringBufferSize / STRING_PADDING) * STRING_PADDING;
                    }
                }else{
                    let rawValues = this.fileCreator.file.convert(dataType, node.val());

                    if(sortedDataTable[node.type] == null)
                        sortedDataTable[node.type] = [];
                    
                    sortedDataTable[node.type].push(rawValues);
                }
            }
        });

        // resort values by data type, that's my best guess for the sorting in original
        for(let dataMap of sortedDataTable)
        {
            if(dataMap != null)
            {
                dataMap.sort(this._bufferSortFunction);

                for(let rawValues of dataMap)
                {
                    let hexVal = rawValues.toString("hex");
                    if(!this.dataTable.has(hexVal))
                    {
                        this.dataTable.set(hexVal, rawValues);
                        this.headerData.dataBufferSize += hexVal.length / 2;
                    }
                }
            }
        }
    }

    _saveTables()
    {
        // write data table
        this.fileCreator.pos(this.offsetDataTable);
        for(let [hexVal, dataBuffer] of this.dataTable)
        {
            this.fileCreator.file.writeBuffer(dataBuffer);
        }

        // write string table
        this.fileCreator.pos(this.offsetStringTable);
        for(let [str, offset] of this.stringTable)
        {
            this.fileCreator.file.writeString(str);
            this.fileCreator.file.alignTo(4);
        }
    }

    _saveNodes(bxmlNode)
    {
        let file = this.fileCreator.file;
        file.pos(SIZE_HEADER);

        for(let [id, rootNode] of bxmlNode.children)
        {
            file.write("u32", parseInt(id, 16));

            file.write("u16", 3);
            file.write("u16", 0);

            file.write("u16", 0);
            file.write("u16", rootNode.getChildCount());
            console.log(id);
        }
    }

    _calcOffsets()
    {
        this.offsetDataTable = SIZE_HEADER + 
            (SIZE_ROOT_NODE * this.headerData.rootNodesCount) +
            (SIZE_NODE      * (this.headerData.nodesCount + this.headerData.rootChildNodesCount));

        this.offsetStringTable = this.offsetDataTable + this.headerData.dataBufferSize;
    }

    _getFileSize()
    {
        return this.offsetDataTable +
            this.headerData.dataBufferSize +
            this.headerData.stringBufferSize;
    }

    /**
     * creates a BXML file from a JSON object
     * @param {BXML_Node} bxmlNode input data
     * @returns a Buffer Object with the binary data
     */
    create(bxmlNode = null)
    {  
        if(bxmlNode == null)
            bxmlNode = this.header.node;

        this.headerData = {
            rootNodesCount: bxmlNode.getChildCount(),
            rootChildNodesCount: bxmlNode.getChildCount(true, 1),
            stringBufferSize: 0,
            dataBufferSize: 0
        };

        this.headerData.nodesCount = bxmlNode.getChildCount(true) - this.headerData.rootChildNodesCount;
        this.headerData.rootChildNodesCount -= this.headerData.rootNodesCount;

        this._calcOffsets();
        this._createStringAndDataTable(bxmlNode);

        this.offsetStringTable = this.offsetDataTable + this.headerData.dataBufferSize;
        this.headerData.fileSize = this._getFileSize();

        this._saveTables();
        this._saveNodes(bxmlNode);

        this.fileCreator.pos(0);
        let buffer = this.fileCreator.write(this.headerStructure, this.headerData);
        return buffer;
    }
};