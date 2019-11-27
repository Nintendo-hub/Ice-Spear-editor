/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File = require("binary-file").File;

module.exports = class FMDL_Parser
{
    constructor(bfresFileParser, entry, contentType, bfresName = "")
    {
        this.entry  = entry;
        this.parser = bfresFileParser;
        this.bfresName = bfresName;

        this.header = null;
        this.primitypeTypes = require("./primitive_types.json");
        this.bufferTypes    = require("./buffer_types.json");
        this.bufferFormat   = require("./buffer_format.json");
        this.indexTypes     = require("./index_types.json");

        this.textureParser = null;

        this.models = {};
        this.materials = [];

        this.loader = null;
    }

    /**
     * set an external texture file parser
     * @param {BFRES_Parser} textureParser 
     */
    setTextureParser(textureParser)
    {
        this.textureParser = textureParser;
    }

    convertType(val, typeIn, typeOut)
    {
        if(typeIn == typeOut)
            return val;

        if(typeOut == "float32")
        {
            switch(typeIn)
            {
                case "u8" : return val / (0xFF);
                case "u16": return val / (0xFFFF);
                case "u32": return val / (0xFFFFFFFF);

                case "s8" : return val / (0xFF       >> 1);
                case "s16": return val / (0xFFFF     >> 1);
                case "s32": return val / (0xFFFFFFFF >> 1);
            }
        }

        return val;
    }

    async parse()
    {
        if(this.loader)await this.loader.setStatus("Loading FMDL Model");
        if(this.loader)await this.loader.setInfo("Parsing Header");
        
        try{
            this.parser.pos(this.entry.dataPointer);
            
            this.parseHeader();
            
            this.models    = {};
            this.materials = [];

            if(this.loader)await this.loader.setInfo("Parsing Vertex Data");

            this.parseVertexData();

            if(this.loader)await this.loader.setInfo("Parsing Shape Data");

            this.parsePolyShape();

            if(this.loader)await this.loader.setInfo("Parsing Material Data");

            this.parseMaterials();


        } catch (err) {
            console.warn(`FMDL::parse Exception: ${err} @ ${err.stack}`);
            return false;
        }

        return true;
    }

    parseHeader()
    {
        this.header = this.parser.parse(require("./header.json"));
    }

    // @TODO extra parser for shape and material
    // @TODO create model entries first

    parseMaterials()
    {
        for(let index of this.header.fmatIndex)
        {
            for(const model of Object.values(this.models))
            {
                const entry = index.entries[model.materialIndex + 1];
                if(!entry || entry.namePointer == 0)
                    continue;

                this.parser.pos(entry.dataPointer);
                let fmatData = this.parser.parse(require("./fmat.json"));
                
                model.name = fmatData.name;

                for(let texRef of fmatData.textureRef)
                {
                    if(texRef.headerOffset == 0 && this.textureParser != null)
                        texRef.texture = this.textureParser.getTextureByName(texRef.name);
                    else
                        console.warn("FMAT: model has own texture!");

                    if(texRef.texture == null) {
                        continue;
                    }

                    let prefix = texRef.name.endsWith("_norm") ? "Nrm" : texRef.name.substr(-3);
                    switch(prefix)
                    {
                        default:
                        case "Alb":
                            if(!model.textureColor) // @TODO check hoe to better handle this
                                model.textureColor = texRef.texture.surface;
                        break;
                        case "Emm":
                            if(!model.textureEmission)
                                model.textureEmission = texRef.texture.surface;
                        break;
                        case "Nrm":
                            if(!model.textureNormal)
                                model.textureNormal = texRef.texture.surface;
                        break;
                    }
                }

                fmatData.matRenderInfo = {};

                for(let renderInfoEntry of fmatData.renderParamsIndex.entries)
                {
                    if(renderInfoEntry.namePointer != 0)
                    {
                        this.parser.pos(renderInfoEntry.dataPointer);
                        let renderInfo = this.parser.parse(require("./render_info_params.json"));
                        let file = this.parser.file;

                        renderInfo.data = [];
                        file.pos(renderInfo.arrayOffset);

                        for(let i=0; i<renderInfo.arrayCount; ++i)
                        {
                            switch(renderInfo.type)
                            {
                                case 0: // vec2(s32, s32)
                                    renderInfo.data.push(file.read("s32"));
                                    renderInfo.data.push(file.read("s32"));
                                break;
                                case 1: // vec2(f32, f32)
                                    renderInfo.data.push(file.read("float32"));
                                    renderInfo.data.push(file.read("float32"));
                                break;
                                case 2: // string
                                    let strOffset = file.pos() + file.read("u32");
                                    let strLen = file.read("u32", strOffset - 4);

                                    if(strLen > 1000)strLen = 100;

                                    renderInfo.data.push(file.readString(strLen, strOffset));
                                break;
                                default:
                                    console.log("FMAT: unknown render info array type: '%d'", renderInfo.type);
                                break;
                            }
                        }

                        renderInfoEntry.data = renderInfo;
                        fmatData.matRenderInfo[renderInfo.name] = renderInfo.data;
                    }
                }

                model.material = fmatData;
                this.materials.push(fmatData);
            }
        }
    }

    parsePolyShape()
    {
        for(let index of this.header.fshpIndex)
        {
            let isFirst = true;
            for(let entry of index.entries)
            {
                if(!isFirst)
                {
                    this.parser.pos(entry.dataPointer);
                    let fshpData = this.parser.parse(require("./fshp.json"));

                    if(fshpData.lodModel.length > 0)
                    {
                        let lodModel = fshpData.lodModel[0];
                        let modelNumber = fshpData.sectionIndex;

                        // get index type info
                        let format = this.indexTypes[lodModel.indexFormat];
                        format.size = this.parser.file.types[format.type].size;

                        let indexCount = lodModel.indexBuffer.buffer.length / format.size;
                        let indexIndex = 0;
                        let indexArray = format.size == 2 ? (new Uint16Array(indexCount)) : (new Uint32Array(indexCount));

                        let primitypeInfo = this.primitypeTypes[lodModel.primitypeType];
                        let bufferReader  = new Binary_File(lodModel.indexBuffer.buffer);

                        bufferReader.setEndian(format.endian);

                        for(let i=0; i<indexCount; ++i)
                            indexArray[i] = bufferReader.read(format.type);

                        // add to model data
                        if(this.models[modelNumber] == null) {
                            this.models[modelNumber] = {};
                        }
                        this.models[modelNumber].indexArray = indexArray;
                        this.models[modelNumber].polyName = fshpData.polyName;
                        this.models[modelNumber].bfresName = this.header.fileName;
                        this.models[modelNumber].materialIndex = fshpData.fmatIndex;
                    }
                }

                isFirst = false;
            }
        }
    }

    parseVertexData()
    {
        for(let fvtxData of this.header.fvtxData)
        {
            for(let attr of fvtxData.attributes)
            {
                let bufferHeader = fvtxData.buffer[attr.bufferIndex];
                this.parser.pos(bufferHeader.dataOffset + attr.bufferOffset);

                let numElements = bufferHeader.size / bufferHeader.stride;

                let formatInfo = this.bufferFormat[attr.format];
                if(formatInfo == null)
                {
                    console.warn(`FMDL: unknown buffer format: ${attr.format}`);
                    continue;
                }

                let bufferType = this.bufferTypes[attr.name];

                if(bufferType == null)
                {
                    console.warn(`FMDL: unknown buffer type: ${attr.name}`);
                    continue;
                }

                if(bufferType.bufferName == null)
                    continue;

                let nameArray  = bufferType.bufferName + "Array";
                let nameIndex  = bufferType.bufferName + "Index";

                if(this.models[fvtxData.sectionIndex] == null) {
                    this.models[fvtxData.sectionIndex] = {};
                }

                let model = this.models[fvtxData.sectionIndex];
                model[nameIndex] = 0;
                model[nameArray] = new Float32Array(fvtxData.vertexCount * bufferType.size);

                for(let elementNum=0; elementNum<numElements; ++elementNum)
                {
                    let sizeRead = this.parser.file.pos();

                    for(let i=0; i<formatInfo.count; ++i)
                    {
                        let rawVal = this.parser.file.read(formatInfo.typeIn);

                        if(i < bufferType.size)
                            model[nameArray][model[nameIndex]++] = this.convertType(rawVal, formatInfo.typeIn, formatInfo.typeOut);
                    }

                    // read padding
                    sizeRead = this.parser.file.pos() - sizeRead;
                    this.parser.pos(this.parser.file.pos() + bufferHeader.stride - sizeRead);
                }
            }
        }
    }
};
