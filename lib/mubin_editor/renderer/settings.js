/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const HTML_Loader = require("./../../html_loader");

module.exports = class Renderer_Settings
{
    constructor(mubinEditor, node)
    {
        this.mubinEditor = mubinEditor;

        const settingsHtml = new HTML_Loader('html/renderer_settings.html');
        this.node = node.querySelector("#renderSettings-container");
        this.node.appendChild(settingsHtml.create());

        this._addEvents();
    }

    _getToolNode(name)
    {
        return this.node.querySelector(".data-tool-renderer-" + name);
    }

    _addEvents()
    {
        const actorVisibleNode = this._getToolNode("actorsVisible");
        actorVisibleNode.onchange = () => this.mubinEditor.showVisibleActors(actorVisibleNode.checked);

        const actorInvisibleNode = this._getToolNode("actorsInvisible");
        actorInvisibleNode.onchange = () => this.mubinEditor.showInvisibleActors(actorInvisibleNode.checked);

        const actorFarLODNode = this._getToolNode("actorsFarLOD");
        actorFarLODNode.onchange =() => {
            const actorGroup = this.mubinEditor.getRenderer().scene.getObjectByName("actors");
            if(!actorGroup || !actorGroup.children)
                return;

            for(let obj of actorGroup.children)
            {
                if(obj.name.endsWith("_Far"))
                {
                    obj.visible = actorFarLODNode.checked;
                }
            }
        };

        const actorLinksNode = this._getToolNode("actorLinks");
        actorLinksNode.onchange = () => {
            this.mubinEditor.actorHandler.showLinks = actorLinksNode.checked;
        };

        const mapModelNode = this._getToolNode("mapModel");
        mapModelNode.onchange = () => this.mubinEditor.showMapModel(mapModelNode.checked);

        const accurateTimerNode = this._getToolNode("accurateTimer");
        accurateTimerNode.onchange = () => this.mubinEditor.mubinRenderer.useAccurateTime(accurateTimerNode.checked);

        const postProcNode = this._getToolNode("postProc");
        postProcNode.onchange = () => this.mubinEditor.getRenderer().usePostProcessing(postProcNode.checked);

        const camLightNode = this._getToolNode("camLight");
        camLightNode.onchange = () => {
            this.mubinEditor.getRenderer().helper.lighting.cameraLight.visible = camLightNode.checked;
        };

        const showStatsNode = this._getToolNode("showStats");
        showStatsNode.onchange = () => this.mubinEditor.getRenderer().useStats(showStatsNode.checked);

        const targetFpsNode = this._getToolNode("targetFPS");
        targetFpsNode.onchange = () => this.mubinEditor.getRenderer().setTargetFPS(parseInt(targetFpsNode.value));

        const camSpeedNode = this._getToolNode("camSpeed");
        camSpeedNode.onchange = () => {
            this.mubinEditor.getRenderer().helper.fpsControls.camSpeed = camSpeedNode.value;
        };
    }

    setValue(name, type, value)
    {
        const node = this._getToolNode(name);

        switch(type)
        {
            case 'bool':
                node.checked = !!value;
            break;
            case 'number':
                node.value = parseFloat(value);
            break;
        }

        node.dispatchEvent(new Event("change"));
    }
}