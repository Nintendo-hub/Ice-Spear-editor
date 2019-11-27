/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Renderer = require("./../../3d_renderer/renderer");
const HTML_Loader = require("./../../html_loader");
const Actor_GUI = require("./../actor/gui");
const Actor_Search_GUI = require("./../actor/search/gui");

module.exports = class Mubin_Renderer
{
    /**
     * @param {Node} canvasNode canvas to draw to
     * @param {Node} uiNode node that contains all ui elements
     * @param {Loader} loader
     */
    constructor(canvasNode, uiNode, loader)
    {
        this.canvasNode = canvasNode;
        this.uiNode = uiNode;
        this.loader = loader;

        this.history = undefined;

        this.renderer = new Renderer(this.canvasNode);
        this.renderer.changeCameraType('fps');
        this.renderer.camera.position.y = 5;
        
        this.selectedActorList = this.uiNode.querySelector(".container-selectedActors");

        this.actorGroup   = this.renderer.createObjectGroup("actors",  true);
        this.shrineGroup  = this.renderer.createObjectGroup("shrine",  true);
        this.terrainGroup = this.renderer.createObjectGroup("terrain",  true);

        this.htmlActorEntry = new HTML_Loader('html/selected_actor.html');

        this.renderer.updateDrawSize();
    }

    init(actorFinder)
    {
        this.actorSearchGui = new Actor_Search_GUI(this.uiNode.querySelector(".window-container"), actorFinder);
    }

    /**
     * returns or queries the uiNode
     * @param {String?} selector querySelector selector
     */
    getUiNode(selector)
    {
        return selector ? this.uiNode.querySelector(selector) : this.uiNode;
    }

    setHistory(history)
    {
        this.history = history;
    }

    /**
     * sets the model for the shrine / field (aka map)
     * @param {Object} models 
     */
    setMapModels(models)
    {
        if(models)
        {
            for(const model of Object.values(models))
            {
                for(const subModel of Object.values(model))
                {
                    this.shrineGroup.add(this.renderer.createModel(subModel));
                }
            }
        }
    }

    setTerrainModel(model)
    {
        this.terrainGroup.add(model);
    }

    addActor(actorObject)
    {
        this.actorGroup.add(actorObject.modelGroup);
    }

    selectActor(actor)
    {
        let actorNode = this.htmlActorEntry.create();
        this.selectedActorList.appendChild(actorNode);
        const addedChild = this.selectedActorList.children[this.selectedActorList.children.length-1]; // only way to get a correct reference
        actor.gui = new Actor_GUI(actor, addedChild, this.history, this.loader);
        actor.gui.update();
    }

    deselectActor(actor)
    {
        if(actor.gui)
            this.selectedActorList.removeChild(actor.gui.node);
    }

    focusPos(pos)
    {
        const cam = this.renderer.camera;

        cam.position.x = pos.x + 5;
        cam.position.y = pos.y + 5;
        cam.position.z = pos.z;

        cam.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z));
    }

    useAccurateTime(useTimer)
    {
        this.renderer.useAccurateTime(useTimer);
    }
    
    start()
    {
        this.renderer.start();
    }

    stop()
    {
        this.renderer.stop();
    }
}
