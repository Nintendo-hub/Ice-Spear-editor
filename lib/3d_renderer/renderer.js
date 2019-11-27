/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const EventEmitter = require('events');

const Helper_Model    = require("./helper/model.js");
const Helper_Lighting = require("./helper/lighting.js");
const Helper_Camera   = require("./helper/camera.js");
const Helper_Shader   = require("./helper/shader.js");
const Helper_PostProc = require("./helper/post_processing.js");
const Helper_FPS_Controls   = require("./helper/fps_controls.js");
const Helper_Orbit_Controls = require("./helper/orbit_controls.js");
const Helper_Selector       = require("./helper/selector.js");
const NanoTimer = require('nanotimer');

class SelectorEventEmitter extends EventEmitter {}

const SCALING_FRAME_TIME = 1000 / 60; // target fps which is used as a reference for scaling events

module.exports = class Renderer
{
    constructor(canvasNode)
    {
        this.THREE = THREE; // THREE is currently coming from the main html file due to incompatible JS files. @TODO port over to module format

        this.fov = 80;

        this.animFrame  = null;
        this.canvasNode = canvasNode;
        this.glContext  = this.canvasNode.getContext('webgl2');
        this.drawSize   = this.getCanvasNodeSize();
        this.showStats  = false;

        this.targetFrameTime = 0; // target time in ms a single frame should last = 1000 / FPS
        this.setTargetFPS(60);
        this.usesAccurateTimer = false;

        this.timer = new NanoTimer();

        this.timeLastFrameStart = 0;
        this.frameDurationScale = 1.0;

        this.scene    = new this.THREE.Scene();
        this.camera   = new this.THREE.PerspectiveCamera(this.fov, this.drawSize.x / this.drawSize.y, 0.01, 5000 );
        this.renderer = new this.THREE.WebGLRenderer({
            canvas   : this.canvasNode,
            antialias: true,
            context  : this.glContext
        });

        const helperShader = new Helper_Shader(this.THREE);
        this.helper = {
            shader       : helperShader,
            model        : new Helper_Model(         this.THREE, helperShader),
            lighting     : new Helper_Lighting(      this.THREE, this.scene, this.camera),
            camera       : new Helper_Camera(        this.THREE, this.camera),
            selector     : new Helper_Selector(      this.THREE, this.scene, this.camera, this.canvasNode),
            fpsControls  : new Helper_FPS_Controls(  this.THREE, this.scene, this.camera, this.canvasNode, () => this.getFrameDurationScale()),
            orbitControls: new Helper_Orbit_Controls(this.THREE, this.camera, this.canvasNode),
            postProc     : new Helper_PostProc(      this.THREE, this.scene, this.camera, this.renderer),
        };

        this.updateCallbacks = [];

        this._init();
        this.changeCameraType('orbit');

        this.canvasObserver = new MutationObserver(() => this.scheduleUpdateDrawSize());

        this._initStats();
        this.useStats(false);

        // TEST! @TODO pull light sources out of files, with a default as backup
        this.helper.lighting.setAmbientLight(0xEEEEFF);
    }

    clear()
    {
        this.stop();
    }

    _init()
    {
        this.scene.background = new this.THREE.Color(0x282C34);

        this.renderer.setSize(this.drawSize.x,this.drawSize.y);
        this.renderer.sortObjects = false;

        for(let name in this.helper)
            this.helper[name].init();
    }

    _initStats()
    {
        this.stats = new Stats();
        this.stats.showPanel(0);
        this.canvasNode.parentNode.appendChild(this.stats.dom);
        this.stats.dom.style.position = "absolute";
        this.stats.dom.style.left = null;
        this.stats.dom.style.right = 0;
    }

    setTargetFPS(fps)
    {
        this.targetFrameTime = 1000 / fps;

        if(this.usesAccurateTimer)
            this._restartAccurateTimer();
    }

    getFrameDurationScale()
    {
        return this.frameDurationScale;
    }

    /**
     * adds an callback that gets called every frame
     * @param {Function} cb 
     */
    addUpdateCallback(cb)
    {
        this.updateCallbacks.push(cb);
    }

    /**
     * return a event that receives all events while selecting objects
     * @param {function} eventHandler 
     */
    getSelectorEventEmitter(eventHandler)
    {
        const emitter = new SelectorEventEmitter();
        this.helper.selector.addEventEmitter(emitter);
        return emitter;
    }

    getCanvasNodeSize()
    {
        return  {x: this.canvasNode.scrollWidth, y: this.canvasNode.scrollHeight};
    }

    setCanvasNodeSize(x, y)
    {
        this.canvasNode.style.width  = x;
        this.canvasNode.style.height = y;
    }

    useAccurateTime(useTimer)
    {
        if(this.usesAccurateTimer == useTimer)
            return;

        this.usesAccurateTimer = useTimer;

        this.timer.clearInterval();
        clearTimeout(this.animFrame);
        this.animFrame = 0;

        setTimeout(() => {
            if(useTimer) {
               this._restartAccurateTimer();
            }else{
                this._frame();
            }
        }, this.targetFrameTime * 5); // wait 5 frames just to be sure
    }

    _restartAccurateTimer()
    {
        this.timer.clearInterval();
        this.timer.setInterval(() => { this._frame(); }, "", this.targetFrameTime + "m");
    }

    /**
     * enables/disables post processing
     * @param {bool} isActive 
     */
    usePostProcessing(isActive)
    {
        this.helper.postProc.active = isActive;
    }

    /**
     * shows/hides the stats info box
     * @param {boolean} showStats 
     */
    useStats(showStats)
    {
        this.showStats = showStats;
        this.stats.dom.hidden = !this.showStats;
    }

    /**
     * schedules a size change, prevents the canvas to be resized alot of time during resizing
     */
    scheduleUpdateDrawSize()
    {
        if(this.updateSizeTimeout)
            clearTimeout(this.updateSizeTimeout);

        this.updateSizeTimeout = setTimeout(() => this.updateDrawSize(), 100);
    }

    updateDrawSize()
    {
        let oldSize = this.drawSize;
        this.setCanvasNodeSize("100%", "100%");
        this.drawSize = this.getCanvasNodeSize();

        if(this.drawSize.x > 0 && this.drawSize.y > 0)
        {
            for(let name in this.helper)
                this.helper[name].onResize(this.drawSize, oldSize);
        }
    }

    createModel(model)
    {
        return this.helper.model.createModel(model);
    }

    async createInstancedModel(model)
    {
        return await this.helper.model.createInstancedModel(model);
    }

    async createInstancedBox(actorName, scale = 1)
    {
        return await this.helper.model.createInstancedBox(actorName, scale);
    }

    async getShader(name)
    {
        return await this.helper.shader.getShader(name);
    }

    addObject(obj)
    {
        this.scene.add(obj);
    }

    createObjectGroup(name, addToScene = false)
    {
        const group = new THREE.Group();
        group.name = name;

        if(addToScene)
            this.scene.add(group);

        return group;
    }

    changeCameraType(type)
    {
        switch(type) {
            case 'fps':
                this.helper.orbitControls.disable();
                this.helper.fpsControls.enable();
            break;
            default:
            case 'orbit':
                this.helper.fpsControls.disable();
                this.helper.orbitControls.enable();
            break;
        }

        this.helper.camera.reset();
        
    }

    start()
    {
        this.updateDrawSize();
        this._addEventHandler();

        if(this.animFrame == null)
        {
            this.animFrame = 0;
            this._frame();
        }
    }

    stop()
    {
        this._removeEventHandler();
        this.animFrame = null;
    }

    _addEventHandler()
    {
        window.addEventListener('resize', () => this.scheduleUpdateDrawSize());
        this.canvasObserver.observe(this.canvasNode.parentNode, {attributes: true});
    }

    _removeEventHandler()
    {
        this.canvasObserver.disconnect();        
    }

    _frame()
    {
        if(this.animFrame != null)
        {
            let drawTime = window.performance.now();
            this.frameDurationScale = (drawTime - this.timeLastFrameStart) / SCALING_FRAME_TIME;
            this.timeLastFrameStart = drawTime;

            if(this.showStats)this.stats.begin();

            this._update();
            if(this.drawSize.x > 0 && this.drawSize.y > 0)
            {
                this._draw();
            }

            if(this.showStats)this.stats.end();

            drawTime = window.performance.now() - drawTime;
            const timeoutTime = Math.max(this.targetFrameTime - drawTime, 1);

            if(!this.usesAccurateTimer) {
                this.animFrame = setTimeout(() => { this._frame(); }, timeoutTime);
            }
        }
    }

    _update()
    {
        for(const name in this.helper)
            this.helper[name].update();

        for(const cb of this.updateCallbacks)cb();
    }

    _draw()
    {
        for(let name in this.helper)
            this.helper[name].draw();
    }
};
