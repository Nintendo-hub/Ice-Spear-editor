/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const { clipboard } = require('electron');
const ace = require("ace-builds");
const QuerySelector_Cache = require("./../../queryselector_chache");

module.exports = class Actor_GUI
{
    /**
     * @param {Actor} actor 
     * @param {Node} node 
     * @param {Loader} loader 
     */
    constructor(actor, node, history, loader)
    {
        this.actor = actor;
        this.node  = node;
        this.loader = loader;
        this.history = history;

        this.nodeCache = new QuerySelector_Cache(this.node);

        const acePath =  __BASE_PATH + "node_modules/ace-builds/src-noconflict";
        ace.config.set('basePath', acePath);
        ace.config.set('modePath', acePath);
        ace.config.set('themePath', acePath);

        this.editorNode = this.node.querySelector(".byaml-editor");
        
        this._addCallbacks();
    }

    /**
     * updates the ui with the assigned actor
     */
    update()
    {
        this.nodeCache.get(".data-actor-name").innerHTML = this.actor.getName();

        if(["Dynamic", "Static"].includes(this.actor.type)) 
        {
            this.nodeCache.get(".data-actor-type").value = this.actor.type;
        }else{
            this.nodeCache.get(".data-actor-type").hidden = true;
        }

        this.nodeCache.get(".data-actor-params-HashId").value = this.actor.params.HashId.value;
        this.nodeCache.get(".data-actor-params-SRTHash").value = this.actor.params.SRTHash.value;

        this.nodeCache.get(".data-actor-params-FieldCRC32").innerHTML = this.actor.getCRC32("MainField");
    
        const modelTypeImg = this.actor.isInvisible() ? "with-model.png" : "no-model.png";
        this.nodeCache.get("img.actor-model-type").setAttribute("src", "assets/img/icons/actor/" + modelTypeImg);

        this.updateEditor();
    }

    _addClickEvent(dataSelector, action, addHistory = false)
    {
        this.nodeCache.get(".data-" + dataSelector).onclick = async () => {
            await action();

            if(addHistory) {
                this.history.add();
            }
        }
    }

    _addCallbacks()
    {
        this.nodeCache.get(".data-actor-params-SRTHash").onchange = (ev) => { 
            this.actor.params.SRTHash.value = parseInt(ev.target.value);
            this.update();
            this.history.add();
        };

        this.nodeCache.get(".data-actor-params-HashId").onchange = (ev) => { 
            this.actor.params.HashId.value = parseInt(ev.target.value); 
            this.update();
            this.history.add();
        };

        this.nodeCache.get(".data-actor-type").onchange = (ev) => { 
            this.actor.changeType(ev.target.value);
        };

        this._addClickEvent("tool-deselect", () => this.actor.handler.deselectActor(this.actor));
        this._addClickEvent("tool-focus", () => this.actor.handler.focusActor(this.actor));

        this._addClickEvent("tool-copy", () => this.actor.copy());
        this._addClickEvent("tool-delete", () => this.actor.delete(), true);

        this._addClickEvent("tool-addRotScalar", () => this.actor.addRotationParams(false), true);
        this._addClickEvent("tool-addRotVector", () => this.actor.addRotationParams(true), true);

        this._addClickEvent("tool-addScaleScalar", () => this.actor.addScalingParams(false), true);
        this._addClickEvent("tool-addScaleVector", () => this.actor.addScalingParams(true), true);

        this._addClickEvent("tool-removeRot", () => this.actor.removeRotationParams(), true);
        this._addClickEvent("tool-removeScale", () => this.actor.removeScalingParams(), true);

        this._addClickEvent("tool-copyJSON", () => clipboard.writeText(this.actor.getParamJSON()));

        this._addClickEvent("tool-importJSON", () => this._importJSON(clipboard.readText(), true), true);

        this.nodeCache.get(".data-tool-toggleEditor").onclick = () => {

            const iconNode = this.nodeCache.get(".data-tool-toggleEditor span");
            if(this.editor)
            {
                this.hideEditor();
                iconNode.setAttribute("class", "icon icon-right-open");
            }else{
                this.showEditor();
                iconNode.setAttribute("class", "icon icon-down-open");
            }
        };

        this._addClickEvent("tool-byamlToActor", () => this._editorJsonToActor(), true);
        this._addClickEvent("tool-byamlRefresh", () => this.update());
    }

    async _editorJsonToActor()
    {
        if(this.editor)
        {
            const jsonString = this.editor.getValue();
            await this._importJSON(jsonString, false);
        }
    }

    async _importJSON(jsonString, keepPosition) 
    {
        this.loader.show("Loading Actor");
        await this.actor.importParamJSON(jsonString, keepPosition);
        this.loader.hide();
    }

    showEditor()
    {
        if(this.editor)
            this.hideEditor();

        this.editorNode.hidden = false;
        this.editor = ace.edit(this.editorNode);
        this.editor.setTheme("ace/theme/tomorrow_night");
        this.editor.getSession().setMode("ace/mode/json");
        this.editor.setOption("showInvisibles", true);
        this.updateEditor();
    }

    hideEditor()
    {
        if(this.editor)
        {
            this.editor.destroy();
            this.editor = undefined;
        }

        this.editorNode.hidden = true;
        this.editorNode.innerHTML = "";
        this.editorNode.parentNode.replaceChild(this.editorNode.cloneNode(false), this.editorNode);
        this.editorNode = this.node.querySelector(".byaml-editor");
    }

    updateEditor()
    {
        if(this.editor)
        {
            this.editor.setValue(this.actor.getParamJSON());
            this.editor.selection.clearSelection();
        }
    }

    delete()
    {
        this.hideEditor();
    }
}