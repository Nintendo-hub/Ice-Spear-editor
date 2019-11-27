/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const fs       = require('fs-extra');
const path     = require('path');
const Split    = require('split.js');
const {dialog} = electron.remote;

const Notify      = requireGlobal("lib/notify/notify.js");
const Filter      = requireGlobal("lib/filter.js");

const Field_Editor  = require("./lib/field_editor.js");
const ActorParams   = require('../../lib/mubin_editor/actor/params');
const Actor_Templates = require('../../lib/mubin_editor/actor/template');
const String_Table  = requireGlobal("lib/string_table/string_table.js");
const extractField  = require("./lib/field_extractor");
const extractStaticMubins = require("./lib/static_mubin_extractor");
const TitleBG_Handler = require("./../../lib/titlebg_handler");

const App_Base = requireGlobal("apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.fieldGamePath = path.join(this.config.getValue("game.path"), "content", "Map", "MainField");
        this.fieldStaticGamePath = path.join(this.config.getValue("game.path"), "content", "Physics", "StaticCompound", "MainField");

        this.fieldDir = null;
        this.fieldSection = null;

        this.footerNode = footer.querySelector(".data-footer");
        
        this.stringTable = new String_Table(this.project.getCachePath());

        Split(['#main-sidebar-1', '#main-sidebar-2', '#main-sidebar-3'], {
            sizes     : [15, 65, 20],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.initTools();
    }

    initTools()
    {
        this.node.querySelector(".data-tool-save").onclick = () => this.save();
        this.node.querySelector(".data-tool-openFieldDir").onclick = () => {
            electron.shell.showItemInFolder(this.fieldEditor.getFieldFilePath());
        };

        this.node.querySelector(".data-tool-packTitleBg").onclick = () => this.packTitleBg();
        this.node.querySelector(".data-tool-openTitleBgDir").onclick = () => {
            electron.shell.showItemInFolder(path.join(this.project.getPath(), "TitleBG.pack"));
        };

        this.node.querySelector(".data-tool-addActorStatic").onclick = async () => {
            this.fieldEditor.actorHandler.addFromData(ActorParams.createTemplate("FldObj_HugeMazeTorchStand_A_01"), "Static");
        };

        this.node.querySelector(".data-tool-addActorDyn").onclick = async () => {
            this.fieldEditor.actorHandler.addFromData(ActorParams.createTemplate("FldObj_HugeMazeTorchStand_A_01"), "Dynamic");
        };

        Actor_Templates.getHtmlSelect().then(html => this.node.querySelector(".data-tool-actorTemplate").innerHTML = html);

        this.node.querySelector(".data-tool-addActorTemplate").onclick = async () => {
            const templateName = this.node.querySelector(".data-tool-actorTemplate").value;
            this.fieldEditor.actorHandler.addFromTemplate(templateName);
        };
    }


    /**
     * saves the field
     */
    async save()
    {
        await this.loader.setStatus("Saving Field");
        await this.loader.show();

        await this.fieldEditor.save();

        await this.loader.hide();
        Notify.success(`Field '${this.fieldSection}' saved`);
    }

    async packTitleBg()
    {
        await this.loader.setStatus("Packing TitleBG");
        await this.loader.show();

        await this.fieldEditor.titleBgHandler.pack();

        await this.loader.hide();
        Notify.success(`TitleBG packed`);
    }

    async openField(fieldSection, fieldPos = undefined)
    {
        this.fieldSection = fieldSection;

        await this.loader.show();
        await this.loader.setStatus("Loading Field");
        try{
            this.stringTable.loader = this.loader;
            //await this.stringTable.load(); // not needed now, yay!

            if(typeof(global.gc) == "function") // free some memory after maybe loading the stringtable
                global.gc();
            
            this.fieldDir = path.join(this.project.getFieldPath("data"), this.fieldSection);
            const alreadyOpened = await fs.pathExists(this.fieldDir);
            await fs.ensureDir(this.fieldDir);

            await this.loader.setStatus("Extracting TitleBG and Mubins");
            await extractStaticMubins(this.config.getValue("game.path"), this.project.getPath(), this.fieldDir, this.fieldSection);

            if(!alreadyOpened)
            {
                await extractField(this.fieldGamePath, this.fieldStaticGamePath, this.fieldDir, this.fieldSection);
            }

            await this.loader.setStatus("Loading Field");
            await this.fieldEditor.load(this.fieldDir, this.fieldSection, fieldPos);
        
            this.render();

            // some performance cuts
            this.fieldEditor.setRenderSetting("targetFPS", "number", 30);
            this.fieldEditor.setRenderSetting("camSpeed", "number", 2);
            //this.fieldEditor.setRenderSetting("accurateTimer", "bool", true);

        } catch(e) {
            await this.loader.hide();    
            console.log(e);
            throw e;
        }

        await this.loader.hide();
    }

    render()
    {

        this.footerNode.innerHTML = "Loaded Field-Section: " + this.fieldDir;

        this.node.querySelector(".data-field-section").innerHTML = this.fieldSection;

        if(this.fieldEditor.actorHandler.dataActorStatic && this.fieldEditor.actorHandler.dataActorStatic.Objs)
            this.node.querySelector(".data-actors-staticCount").innerHTML  = this.fieldEditor.actorHandler.dataActorStatic.Objs.length;
            
        if(this.fieldEditor.actorHandler.dataActorDyn && this.fieldEditor.actorHandler.dataActorDyn.Objs)
            this.node.querySelector(".data-actors-dynamicCount").innerHTML = this.fieldEditor.actorHandler.dataActorDyn.Objs.length;

        let prodNum = 0;
        for(const prodSection of this.fieldEditor.actorHandler.dataActorProd)
        {
            this.node.querySelector(".data-actors-prodCount-" + (prodNum++)).innerHTML = prodSection.length;
        }

        this.fieldEditor.start();
    }

    async run()
    {
        await super.run();

        const titleBgHandler = new TitleBG_Handler(this.config.getValue("game.path"), this.project.getPath());
        this.fieldEditor = new Field_Editor(this.node.querySelector(".shrine-canvas"), this.node, this.project, this.loader, this.stringTable, titleBgHandler);

        let fieldSection = this.args.section ? this.args.section : "J-8";
        let fieldPos = this.args.pos ? this.args.pos : undefined;

        if(fieldPos)
        {
            fieldPos[0] = parseFloat(fieldPos[0]);
            fieldPos[1] = parseFloat(fieldPos[1]);
        }

        await this.openField(fieldSection, fieldPos);
    }    
};
