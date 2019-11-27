/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const App_Base = requireGlobal("./apps/base.js");
const JSON_IPC = require("./../../lib/json_ipc/json_ipc");

const Graph = require("./lib/graph/graph");

/*
LinkTagNAnd
LinkTagNOr
LinkTagCount
LinkTagNAnd
LinkTagNone
LinkTagOr
LinkTagNOr
LinkTagXOr
LinkTagAnd
LinkTagCount
LinkTagPulse

SoleTag
ComplexTag
EventTag
SpotBgmTag
 */

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.graph = undefined;
        this.mapName = "";

        this._addActions();
    }

    async load(data)
    {
        const actorsDyn = data.actorsDyn.Objs;
        const actorsStatic = data.actorsStatic.Objs;

        await this.graph.build(actorsDyn, actorsStatic);
    }

    _addActions()
    {
        const saveLayoutBtn = this.node.querySelector(".data-tool-saveLayout");
        saveLayoutBtn.onclick = async () => {
            saveLayoutBtn.disabled = true;
            await this.graph.save();
            saveLayoutBtn.disabled = false;
        };
    }

    async run()
    {
        await super.run();

        await this.loader.setStatus("Connecting to the Editor");
        await this.loader.show();

        this.mapName = this.args.mapName;
        document.title = "Ice-Spear - Logic Editor - " + this.mapName;

        this.graph = new Graph(this.mapName, this.project.getLogicSavePath());

        this.jsonIpc = new JSON_IPC("logic-editor-" + this.mapName);
        await this.jsonIpc.createServer(async (name, type, data) => {
            if(type == "actor-data")
            {
                await this.loader.setStatus("Process Data");
                setTimeout(async () => {
                    this.load(data);
                    await this.loader.hide();
                }, 50);
            }
        });        

        this.jsonIpc.send("shrine-editor-" + this.mapName, "logic-editor-ready", {a:7});
    }
};

