/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to:
* @see https://github.com/jam1garner/aamp2xml
*/

const fs = require('fs');

const Binary_File_Parser = require('binary-file').Parser;
const Binary_File_Loader = require("binary-file").Loader;

const BXML_Node = require("./bxml_node.js");

const STRING_PADDING = 4;

module.exports = class BXML
{
    /**
     * @param {String_Table} global string table, can be NULL
     */
    constructor(stringTable = null)
    {
        this.dataTypes   = require("./data_types.json");
        this.stringTable = stringTable;
    }

    /**
     * helper function for reading CRC32 hashes from binary files
     * @param {Binary_File} file 
     * @param {Object} info 
     */
    _parseCRC(file, info = null)
    {
        let hash = "";

        for(let i=0; i<4; ++i)
            hash = file.read("u8").toString(16).padStart(2, "0") + hash;

        return hash;
    }

    /**
     * parses node below the root Node,
     * this will be called recursively
     */
    _parseNode()
    {
        let nodeOffset = this.file.pos();

        let node = new BXML_Node(this._parseCRC(this.file));

        if(this.stringTable != null)
            node.setName(this.stringTable.getString(node.id));

        let dataOffset  = (this.file.read("u16") * 4) + nodeOffset;
        let childCount  = this.file.read("u8");

        node.type = this.file.read("u8");

        this.file.posPush();
        this.file.pos(dataOffset);

        if(childCount > 0)
        {
            for(let i=0; i<childCount; ++i)
                node.addChild(this._parseNode());

        }else{
            let typeInfo = this.dataTypes[node.type];
            if(typeInfo == null)
            {
                console.warn(`BXML: unknown data type: '${node.type}'`);
            }else{

                let count = typeInfo.count == null ? 0 : typeInfo.count;
                
                if(typeInfo.type == "string")
                {
                    node.val(this.file.readString());
                }else{
                    node.val(this.file.read(typeInfo.type));
                }
            }
        }

        this.file.posPop();
        return node;
    }

    /**
     * parses a BXML file and returns it as JSON
     * Note: node names onl work correctly if a string table is provided in the constructor
     * otherwise it can't resolve the hases to their names
     * @param {String|Buffer} pathOrBuffer 
     */
    parse(pathOrBuffer)
    {
        this.parser = new Binary_File_Parser(pathOrBuffer);
        this.parser.setFunction("crc32", this._parseCRC);

        this.file = this.parser.file;
        this.file.setEndian("little");
        this.header = this.parser.parse(require("./header.json"));

        this.header.node = new BXML_Node();
        for(let r=0; r<this.header.rootNodesCount; ++r)
        {
            let nodeData = this.parser.parse(require("./root_node.json"));

            let node = new BXML_Node(nodeData.id);

            if(this.stringTable != null)
                node.setName(this.stringTable.getString(node.id));

            let bxmlNode = this.header.node.addChild(node);

            this.file.posPush();
            this.file.pos((nodeData.dataOffset * 4) + nodeData.nodeOffset);

            for(let c=0; c<nodeData.childCount; ++c)
                bxmlNode.addChild(this._parseNode());

            this.file.posPop();
        }

        return this.header.node;
    }
};