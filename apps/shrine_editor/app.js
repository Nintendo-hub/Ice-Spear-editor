/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const fs       = require('fs-extra');
const path     = require('path');
const url      = require('url');
const Split    = require('split.js');

const Notify      = requireGlobal("lib/notify/notify.js");
const Filter      = requireGlobal("lib/filter.js");

const Binary_File_Loader = require("binary-file").Loader;
const SARC          = require("sarc-lib");
const Shrine_Editor = require("./lib/shrine_editor.js");
const ActorParams   = require('../../lib/mubin_editor/actor/params');
const Actor_Templates = require('../../lib/mubin_editor/actor/template');
const String_Table  = requireGlobal("lib/string_table/string_table.js");
const JSON_IPC      = require("./../../lib/json_ipc/json_ipc");

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.dataActorDyn = {};

        this.shrineDir  = null;
        this.shrineFiles = null;

        this.footerNode = footer.querySelector(".data-footer");
        
        this.fileLoader = new Binary_File_Loader();
        this.shrineName = "";

        this.stringTable = new String_Table(this.project.getCachePath());

        Split(['#main-sidebar-1', '#main-sidebar-2', '#main-sidebar-3'], {
            sizes     : [15, 65, 20],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });
    }

    initTools()
    {
        this.node.querySelector(".data-tool-save").onclick = () => this.save(false);
        this.node.querySelector(".data-tool-saveBuild").onclick = () => this.save(true);
        this.node.querySelector(".data-tool-openBuildDir").onclick = () => {
            electron.shell.showItemInFolder(this.shrineEditor.getPackFilePath());
        };
/*
        this.node.querySelector(".data-tool-openLogicEditor").onclick = async () => 
        {
            if(!this.jsonIpc)
            {
                this.jsonIpc = new JSON_IPC("shrine-editor-" + this.shrineName);
                await this.jsonIpc.createServer((name, type, data) => 
                {
                    if(type == "logic-editor-ready")
                    {
                        this.jsonIpc.send(name, "actor-data", {
                            actorsDyn   : this.shrineEditor.actorHandler.dataActorDyn,
                            actorsStatic: this.shrineEditor.actorHandler.dataActorStatic,
                        });
                    }
                });
            }

            this.windowHandler.open("logic_editor", {mapName: this.shrineName});
        };
*/
        this.node.querySelector(".data-tool-addActorStatic").onclick = async () => {
            this.shrineEditor.actorHandler.addFromData(ActorParams.createTemplate("FldObj_HugeMazeTorchStand_A_01"), "Static");
        };

        this.node.querySelector(".data-tool-addActorDyn").onclick = async () => {
            this.shrineEditor.actorHandler.addFromData(ActorParams.createTemplate("FldObj_HugeMazeTorchStand_A_01"), "Dynamic");
        };

        Actor_Templates.getHtmlSelect().then(html => this.node.querySelector(".data-tool-actorTemplate").innerHTML = html);

        this.node.querySelector(".data-tool-addActorTemplate").onclick = async () => {
            const templateName = this.node.querySelector(".data-tool-actorTemplate").value;
            this.shrineEditor.actorHandler.addFromTemplate(templateName);
        };
    }

    /**
     * saves the shrine
     * @param {bool} repack if true, it rebuilds the .pack file
     */
    async save(rebuild = true)
    {
        await this.shrineEditor.save(rebuild);

        Notify.success(`Shrine '${this.shrineName}' saved`);
    }

    async openShrine(shrineDirOrFile = null)
    {
        if(shrineDirOrFile == "" || shrineDirOrFile == null)
        {
            let paths = dialog.showOpenDialog({properties: ['openDirectory']});
            if(paths != null)
                shrineDirOrFile = path[0];
            else 
                return false;
        }

        await this.loader.show();
        await this.loader.setStatus("Loading Shrine");
        try{
            this.stringTable.loader = this.loader;
            //await this.stringTable.load(); // not needed now, yay!

            if(typeof(global.gc) == "function") // free some memory after maybe loading the stringtable
                global.gc();
                
            let fileName = shrineDirOrFile.split(/[\\/]+/).pop();
            this.shrineDir = path.join(this.project.getShrinePath("unpacked"), fileName + ".unpacked");

            this.shrineName = fileName.match(/Dungeon[0-9]+/) || fileName.match(/Remains[A-Za-z]+/);

            if(this.shrineName != null) {
                this.shrineName = this.shrineName[0];
            }

            const alreadyExtracted = await fs.pathExists(this.shrineDir);

            // extract if it's not a directory
            if(!alreadyExtracted && fs.lstatSync(shrineDirOrFile).isFile())
            {
                let sarc = new SARC(this.stringTable);
                this.shrineFiles = sarc.parse(shrineDirOrFile);
                await sarc.extractFiles(this.shrineDir, true);
            }

            await this.shrineEditor.load(this.shrineDir, this.shrineName);

            this.render();

        } catch(e) {
            await this.loader.hide();    
            console.error(e);
            throw e;
        }

        await this.loader.hide();
    }

    render()
    {

        this.footerNode.innerHTML = "Loaded Shrine: " + this.shrineDir;

        this.node.querySelector(".data-shrine-name").innerHTML = this.shrineName;

        this.node.querySelector(".data-actors-staticCount").innerHTML  = this.shrineEditor.actorHandler.dataActorStatic.Objs.length;
        this.node.querySelector(".data-actors-dynamicCount").innerHTML = this.shrineEditor.actorHandler.dataActorDyn.Objs.length;

        this.shrineEditor.start();
    }

    async run()
    {
        await super.run();

        this.shrineEditor = new Shrine_Editor(this.node.querySelector(".shrine-canvas"), this.node, this.project, this.loader, this.stringTable);
        this.initTools();

        // 000 = ivy shrine
        // 006 = physics + guardians
        // 033 = water puzzle, missing polygon in corner
        // 051 = has lava and spikeballs
        // 099 = blessing

        this.shrineName = this.args.shrine ? this.args.shrine : "Dungeon000";
        let shrinePath = path.join(this.config.getValue("game.path"), "content", "Pack", this.shrineName + ".pack");

        this.openShrine(shrinePath);
    }    
};
