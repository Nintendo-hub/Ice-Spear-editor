/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const path = require("path");

const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = requireGlobal('lib/bfres/parser');
const BFRES_Container    = requireGlobal('lib/bfres/container');

//const Actor_Object = require('./../actor_object'); // old
const Actor_Object = require('./object');
const Special_Texture = require('./special_texture');

const BYAML = require("byaml-lib");
const BXML = requireGlobal("lib/bxml/bxml");
const SARC = require("sarc-lib");

module.exports = class Actor_Object_Loader
{
    constructor(actorPath, modelPath, actorCache, mubinRenderer, loader, stringTable = null)
    {
        this.actorPath  = actorPath;
        this.modelPath  = modelPath;
        this.actorCache = actorCache;
        this.mubinRenderer = mubinRenderer;

        this.loader = loader;
        this.stringTable = stringTable;

        this.fileLoader = new Binary_File_Loader();

        this.actorInfo = {};
        this.bfresFiles = {};
        this.objects = {};
    }

    clear()
    {
        this.actorInfo = {};
        this.bfresFiles = {};
    }

    async init()
    {
        await this.loader.setStatus("Loading Actor Database");
        await this.loader.setInfo("Parsing File");

        let byaml = new BYAML.Parser();
        this.actorData = byaml.parse(this.fileLoader.buffer(this.actorPath + "/ActorInfo.product.sbyml"));

        await this.loader.setInfo("Converting Data");

        for(let actor of this.actorData.Actors)
        {
            this.actorInfo[actor.name.value] = actor;
        }

        Special_Texture.getNames();

        for(let actorName of ["__DEFAULT_BOX", ...Special_Texture.getNames()])
        {
            if(actorName == "Area")
                continue;
                
            const objGroup = this.mubinRenderer.renderer.createObjectGroup(actorName);
            objGroup.add(await this.mubinRenderer.renderer.createInstancedBox(actorName));
            objGroup.userData = {type: "actor", visible: false};
            this.objects[actorName] = new Actor_Object(objGroup);
        }

        const areaObjGroup = this.mubinRenderer.renderer.createObjectGroup("Area");
        const areaBoxMesh = await this.mubinRenderer.renderer.createInstancedBox("Area", 2.0);
        areaObjGroup.add(areaBoxMesh);
        areaObjGroup.userData = {type: "actor", visible: false};
        this.objects["Area"] = new Actor_Object(areaObjGroup);
    }

    /**
     * loads (if not already loaded) the actor object and returns a cloned instance of it
     * if no object can be found, a dummy box is returned
     * @param {string} name actor name
     * @returns {Actor_Object}
     */
    async getObject(name)
    {
        let actorObject = await this._getActorObject(name);
        if(!actorObject)
        {
            actorObject = await this._getActorObject("__DEFAULT_BOX", name);
            // @TODO add the special actor model handler here instead
        }

        if(!actorObject)
        {
            console.error("Actor_Object_Loader.getObject(): no model could be created, not even the default box!");
        }

        return actorObject;
    }

    async _getActorObject(name, aliasName = undefined)
    {
        if(!this.objects[name])
        {
            let mainModel = this.actorCache ? await this.actorCache.get(name) : undefined;
            
            if(!mainModel)
            {
                let actorInfo = await this._getActorInfo(name);
                if(!actorInfo)
                {
                    if(name != "DUMMY_BOX")
                        console.warn(`Actor_Handler._getActorData for ${name} returned nothing!`);
                        
                    return undefined;
                }

                if(!actorInfo.bfresContainer || actorInfo.bfresContainer.isEmpty())
                {
                    //console.warn(`Actor_Handler._getActorData for ${name} returned no bfresParser!`);
                    return undefined
                }

                let mainModelName = undefined;
                if(actorInfo.mainModel)
                    mainModelName = actorInfo.mainModel.value;

                mainModel = actorInfo.bfresContainer.getModel(mainModelName);

                if(this.actorCache)
                    await this.actorCache.cache(name, mainModel);
            }        
            
            const objGroup = this.mubinRenderer.renderer.createObjectGroup(name);
            objGroup.userData = {type: "actor", visible: true};
            for(const subModel of Object.values(mainModel))
            {
                objGroup.add(await this.mubinRenderer.renderer.createInstancedModel(subModel));
            }
            
            this.objects[name] = new Actor_Object(objGroup);
        }

        if(aliasName && !this.objects[aliasName])
        {
            this.objects[aliasName] = this.objects[name];
        }
        
        return this.objects[name];
    }

    async _getActorInfo(name)
    {
        const info = this.actorInfo[name];

        if(info == null)
            return undefined;
        
        if(info.bfresContainer == null)
        {            
            if(info.bfres != null)
            {
                try{
                    info.bfresContainer = await this._getActorBfresFiles(info.bfres.value, name);
                }catch(e){
                    console.log("Invalid Actor-Model: " + name);
                    return undefined;
                }
            }else{
                //console.warn("Actor is missing the BFRES setting: " + name);
            }
        }
/*
        let actorPackPath = this.actorPath + "/Pack/" + name + ".sbactorpack";
        if(fs.existsSync(actorPackPath))
        {
            let sarc = new SARC(this.stringTable);
            let files = sarc.parse(actorPackPath);

            let modelListBuff = sarc.getFile(`Actor/ModelList/${name}.bmodellist`);
            if(modelListBuff == null)return null;

            let bxml = new BXML(this.stringTable);
            let bxmlData = bxml.parse(this.fileLoader.buffer(modelListBuff));
            //console.log("bxmlData");
            //console.log(bxmlData);

            //let bfresName = bxmlData.UnitName;
            //if(bfresName == null)return null;

            //return this._loadActorModel(name, bfresName);
        }else{
            console.warn("Actor-Pack not found for: " + name);
        }
*/
        return info;

    }

    /**
     * tries to find and load bfres files that belong to an actor
     * @param {string} bfresName 
     * @returns {BFRES_Container}
     */
    async _getActorBfresFiles(bfresName, actorName)
    {
        const files = new BFRES_Container();

        // check if a normal file exists
        const bfresMainPath = path.join(this.modelPath, `${bfresName}.sbfres`);

        if(this.bfresFiles[bfresMainPath] || fs.existsSync(bfresMainPath))
        {
            files.add(await this._getSingleActorBfresFile(bfresMainPath));
        }else{
            // check until no more sub-files are found
            for(let i=0;;++i)
            {
                const bfresNum = i.toString().padStart(2, "0");
                const bfresSubPath = path.join(this.modelPath, `${bfresName}-${bfresNum}.sbfres`);
                if(this.bfresFiles[bfresSubPath] || fs.existsSync(bfresSubPath)) 
                {
                    files.add(await this._getSingleActorBfresFile(bfresSubPath));
                }else{
                    break;
                }
            }
        }
        return files;
    }

    async _getSingleActorBfresFile(bfresPath)
    {
        if(!this.bfresFiles[bfresPath])
        {
            const bfresParser = new BFRES_Parser(true);
            bfresParser.loader = this.loader;

            let bfresPathNoExt = bfresPath.substr(0, bfresPath.length - "sbfres".length);
            if(bfresPathNoExt.substr(-4, 1) == "-") // this happens when multiple bfres files share one/two texture files
            {
                bfresPathNoExt = bfresPathNoExt.substr(0, bfresPathNoExt.length - 4) + ".";
            }
            
            const texturePath = bfresPathNoExt + "Tex1.sbfres"; // @TODO also handle ".1.bfres" files.... fucking stupid

            if(fs.existsSync(texturePath))
            {
                const texBuffer = this.fileLoader.buffer(texturePath);
                const textureParser = new BFRES_Parser(true);
                textureParser.loader = this.loader;

                if(await textureParser.parse(texBuffer))
                {
                    bfresParser.setTextureParser(textureParser);
                }
            }

            if(await bfresParser.parse(this.fileLoader.buffer(bfresPath))) {
                this.bfresFiles[bfresPath] = bfresParser;
            }else{
                throw "Invalid BFRES-File!";
            }
        }

        return this.bfresFiles[bfresPath];
    }
};
