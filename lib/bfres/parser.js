/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Parser = require('binary-file').Parser;
const BFRES_FileTypes    = requireGlobal('./lib/bfres/file_types.js');

const Content_Types = require("./content_types.json");

module.exports = class BFRES_Parser
{
    constructor(autoLoad = false)
    {
        this.parser = null;
        this.header = null;
        this.files  = {};

        this.contentType = Content_Types.MODEL;
        this.autoLoad    = (autoLoad === true);
        this.loader      = null;
    }

    setLoader(loader)
    {
        this.loader = loader;
    }

    /**
     * returns an array of all models, every entry may contain multiple models
     */
    getModels()
    {
        let models = {};

        let fmdlFiles = this.files[BFRES_FileTypes.types.FMDL];
        if(fmdlFiles)
        {
            for(let entry of fmdlFiles.entries)
            {
                if(entry.parser != null && entry.parser.models != null)
                {
                    models[entry.parser.header.fileName] = entry.parser.models;
                }
            }
        }

        return models;
    }

    getTextureByName(name)
    {
        let ftexFiles = this.files[BFRES_FileTypes.types.FTEX];
        if(ftexFiles)
        {
            for(let entry of ftexFiles.entries)
            {
                if(entry.parser && entry.parser.header)
                {
                    if(entry.parser.header.fileName == name)
                    {
                        return entry.parser.header;
                    }
                }
            }
        }
        return null;
    }

    getFileParser(type, index)
    {
        if(this.files[type] != null && this.files[type].entries[index] != null && this.files[type].entries[index].parser != null)
        {
            return this.files[type].entries[index].parser;
        }
        return null;
    }

    async parseFileTable()
    {
        for(let type=0; type<this.header.fileOffsets.length; ++type)
        {
            let tablePos = this.header.fileOffsets[type];
            if(tablePos == 0 || this.header.fileCounts[type] == 0)
                continue;

            this.parser.pos(tablePos);
            this.files[type] = this.parser.parse(require("./index_entries.json"));

            let i=0;
            for(let entry of this.files[type].entries)
            {
                let fileInfo = BFRES_FileTypes.info[type];
                entry.type = type;
                entry.fileIndex = i;

                if(this.autoLoad && fileInfo.preload === true && entry.namePointer != 0)
                {
                    const Parser_Class = requireGlobal(fileInfo.parser);
                    entry.parser = new Parser_Class(this.parser, entry, this.contentType);
                    entry.parser.loader = this.loader;

                    if(typeof(entry.parser.setTextureParser) == "function")
                        entry.parser.setTextureParser(this.textureParser);

                    if(!await entry.parser.parse()) {
                        throw "Invalid BFRES-File!";
                    }
                }

                ++i;
            }
        }

        return true;
    }

    /**
     * BFRES may contain models, textures or texture-mipmaps
     * depending on what is the content, certain parser may behave differently
     * @author Max Bebök
     */
    detectContentType()
    {
        let name = this.header.fileName;
        this.contentType = Content_Types.MODEL;

        if(name.endsWith("Tex1"))
            this.contentType = Content_Types.TEXTURE;
        else if(name.endsWith("Tex2"))
            this.contentType = Content_Types.MIPMAP;
    }

    /**
     * set an external texture file parser
     * @param {BFRES_Parser} textureParser 
     */
    setTextureParser(textureParser)
    {
        this.textureParser = textureParser;
    }

    async parse(filePath)
    {
        try{

            if(this.loader)await this.loader.setStatus("Loading BFRES File");

            this.parser = new Binary_File_Parser(filePath);
            this.header = this.parser.parse(require("./header.json"));

            this.detectContentType();
            await this.parseFileTable();

            this.parser.clearBuffer();

        } catch (err) {
            console.warn(`BFRES::parse Exception: ${err}`);
            console.log(err.stack);
            return false;
        }

        return true;
    }
};
