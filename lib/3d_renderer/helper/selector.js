/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");
const KEYCODES = require("./../../keycodes.js");

module.exports = class Renderer_Helper_Selector extends Base
{
    constructor(threeContext, scene, camera, canvasNode)
    {
        super(threeContext);

        this.camera    = camera;
        this.scene     = scene;
        this.canvasNode  = canvasNode;
        this.eventNode = this.canvasNode;

        this.eventEmitter = [];
        this.raycaster = new THREE.Raycaster();    

        this.selectButtonLeft = true;
        this.selectButtonMiddle = false;

        this.eventNamesMouse = ["mousemove", "mousedown", "mouseup", "wheel"];
        this._handlerMouseWrapper = e => this._handlerMouse(e);

        this.mousePosNorm = new this.THREE.Vector2(0.0, 0.0);
        this.mouseDown = false;
        this.mouseMoved = false;
    }

    init()
    {
        for(let eventName of this.eventNamesMouse)
            this.eventNode.addEventListener(eventName, this._handlerMouseWrapper);
    }

    update()
    {
        if(this.disabled)return;

        if(!this.actorGroup)
            this.actorGroup = this.scene.getObjectByName("actors");

        if(!this.shrineGroup)
            this.shrineGroup = this.scene.getObjectByName("shrine");
    }

    /**
     * sets the buttons to use for selecting actors
     * @param {boolean} useLeft 
     * @param {boolean} useMiddle
     */
    setSelectButtons(useLeft, useMiddle) 
    {
        this.selectButtonLeft = !!useLeft;
        this.selectButtonMiddle = !!useMiddle;
    }

    /**
     * adds a handler function that recieves all events while selecting objects
     * @param {function} eventEmitter 
     */
    addEventEmitter(eventEmitter)
    {
        this.eventEmitter.push(eventEmitter);
    }

    _sendEvent(name, ...data)
    {
        for(const handler of this.eventEmitter)
        {
            handler.emit(name, ...data);
        }
    }

    _handlerMouse(e)
    {
        if(!this.actorGroup)
            return;

        if((e.buttons & KEYCODES.MOUSE.RIGHT) || e.type == "mouseup")
        {
            switch(e.type)
            {
                case "mousedown":
                    this.mouseDown = true;
                    this.mouseMoved = false;

                    this._sendEvent("start");

                    if(this.selectButtonLeft) {
                        this._raycast(e, false);
                    }
                break;

                case "mouseup":

                    if(e.button == 1 && this.selectButtonMiddle) 
                    {
                        this.mouseDown = true;
                        this.mouseMoved = false;
                        this._raycast(e, false);
                    }
                    else if(this.mouseDown)
                    {
                        this._raycast(e, true);
                        this._sendEvent("end");
                    }

                    this.mouseDown = false;
                break;

                case "wheel":
                case "mousemove":
                    if(this.mouseDown)
                    {
                        this.mouseMoved = true;
                        this._sendEvent("move", e, this.camera);
                    }
                break;
            }
        }
    }

    _getCameraVec()
    {
        const lookAtVector = new THREE.Vector3(0,0, -1);
        lookAtVector.applyQuaternion(this.camera.quaternion);
        const planeVec = new this.THREE.Vector2(lookAtVector.x, lookAtVector.z);
        planeVec.normalize();
        return planeVec;
    }

    _raycast(e, isMouseUp)
    {
        const canvasRect = this.canvasNode.getBoundingClientRect();
        this.mousePosNorm.x = e.clientX - canvasRect.left;
        this.mousePosNorm.y = e.clientY - canvasRect.top;
        
        if(this.mousePosNorm.x >= 0 && this.mousePosNorm.x <= canvasRect.width &&
            this.mousePosNorm.y >= 0 && this.mousePosNorm.y <= canvasRect.height)
        {
            this.mousePosNorm.x =  (this.mousePosNorm.x / canvasRect.width)  * 2 - 1;
            this.mousePosNorm.y = -(this.mousePosNorm.y / canvasRect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mousePosNorm, this.camera);
            const castObjects = {
                shrine: this.shrineGroup.children, 
                actor: this.actorGroup.children
            };

            this._sendEvent("select", this.raycaster, castObjects, isMouseUp, this.mouseMoved);
        }
    }

    enable()
    {
        super.enable();
        this.init();
    }

    disable()
    {
        super.disable();
        this.clear();
    }

    clear()
    {
        for(let eventName of this.eventNamesMouse)
            this.eventNode.removeEventListener(eventName, this._handlerMouseWrapper);

        this.eventEmitter = [];
        this.actorGroup = null;
    }
};

