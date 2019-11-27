/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');
const PicoGL = require("picogl");
const NanoTimer = require('nanotimer');

const Shader_Handler = require("./shader_handler");
const Mesh_Helper = require("./mesh_helper");

const DEFAULT_CLEAR_COLOR = [0.0, 0.0, 0.0, 1.0];
const SCREEN_SCALE = 0.0005;

const BUFFER_TYPES_FLOAT = [
    undefined, PicoGL.FLOAT,
    PicoGL.FLOAT_VEC2,
    PicoGL.FLOAT_VEC3,
    PicoGL.FLOAT_VEC4,
];

/**
 * Experimental prototype engine to replace THREE.js for the main editors... in the far future
 */
module.exports = class Ice_Engine
{
    constructor(canvasNode, clearColor = DEFAULT_CLEAR_COLOR)
    {
        this.glApp = PicoGL.createApp(canvasNode)
            .blend()
            .blendFunc(PicoGL.SRC_ALPHA, PicoGL.ONE_MINUS_SRC_ALPHA)
            .clearColor(...clearColor)
        ;

        this.meshHelper = new Mesh_Helper(this.getApp());

        this.canvasNode = canvasNode;
        this.canvasSize = [0,0];
        this.aspectRatio = new Float32Array([1.0, 1.0]);

        this.cbOnUpdate = undefined;
        this.cbOnDraw = undefined;
        this.showStats = false;
        
        this.shaderHandler = new Shader_Handler(this.glApp);

        this.targetFPS = 60.0;
        this.targetFrameTime = (1000.0 / this.targetFPS);
        this.lastFrameTime = 0;

        this.timer = this.glApp.createTimer();
        this.nanoTimer = new NanoTimer();

        this.objects = new Map();


        this._init();
    }

    _init()
    {
        this.globalUniform = this.createUniformBuffer([this.aspectRatio]);

        if(this.showStats)
        {
            this.stats = new Stats();
            this.stats.showPanel(0);
            this.canvasNode.parentNode.appendChild(this.stats.dom);
            this.stats.dom.style.position = "absolute";
            this.stats.dom.style.left = 0;
            this.stats.dom.style.right = null;
            this.stats.dom.style.top = 0;
            this.stats.dom.style.bottom = null;
        }
    }

    /**
     * returns the PicoGL app
     * @returns App
     */
    getApp()
    {
        return this.glApp;
    }

    /**
     * returns the global uniform data used for:
     * aspect ratio
     */
    getGlobalUniform()
    {
        return this.globalUniform;
    }

    /**
     * returns a scaling value relative to the time difference between actual and target frame time.
     * multiplying any value with it makes it independent of the actual frame time
     * @returns {number}
     */
    getFrameScale()
    {
        return this.frameScale;
    }

    /**
     * creates a named shader from its source, if a path is set, it tries to load the shader first
     * @param {String} name unique shader name
     * @param {String} vertexSourceOrPath vertex shader source or path
     * @param {String} fragmentSourceOrPath fragment shader source or path
     * @returns Ice_Engine this
     */
    async createShader(name, vertexSourceOrPath, fragmentSourceOrPath)
    {
        if(vertexSourceOrPath.endsWith(".vert"))
            vertexSourceOrPath = await fs.readFile(vertexSourceOrPath, 'utf8');

        if(fragmentSourceOrPath.endsWith(".frag"))
            fragmentSourceOrPath = await fs.readFile(fragmentSourceOrPath, 'utf8');

        this.shaderHandler.create(name, vertexSourceOrPath, fragmentSourceOrPath);
        return this;
    }

    /**
     * creates a 2D or Array-Texture
     * @param {Buffer} buffer image buffer
     * @param {Object} size {x,y,z}, if z is set, it's a array texture
     * @param {Object} options additional options for PicoGL
     * @returns Texture
     */
    createTexture(buffer, size, options)
    {
        if(size.z === undefined)
        {
            return this.glApp.createTexture2D(buffer, size.x, size.y, options);
        }else{
            return this.glApp.createTextureArray(buffer, size.x, size.y, size.z, options);
        }
    }

    /**
     * creates a uniform buffer based on an array of buffers.
     * data-types are automatically detected
     * @param {Array<TypedArray>} buffers 
     * @returns UniformBuffer
     */
    createUniformBuffer(buffers)
    {
        const typeArray = [];
        for(let buffer of buffers)
        {
            if(buffer instanceof Float32Array)
            {
                typeArray.push(BUFFER_TYPES_FLOAT[buffer.length]);
            }else{
                console.warn("@TODO Ice_Engine.createUniformBuffer data not float32");
            }
        }

        const uniformBuffer = this.glApp.createUniformBuffer(typeArray);

        let i=0;
        for(let buffer of buffers)
            uniformBuffer.set(i++, buffer);

        return uniformBuffer.update();
    }

    /**
     * creates a draw call for a vertex array
     * @param {String} shaderName name of the shader created with createShader
     * @param {VertexArray} vertexArray array to draw
     * @param {boolean} addToObjects, if true, addObject() is automatically called
     * @returns DrawCall
     */
    createDrawCall(shaderName, vertexArray, addToObjects = false)
    {
        const shader = this.shaderHandler.get(shaderName);
        if(!shader) 
        {
            console.error(`Unknown shader '${shaderName}'`);
            return undefined;
        }

        const drawCall = this.glApp.createDrawCall(shader, vertexArray);
        if(addToObjects)
        {
            this.addObject(drawCall);
        }
        return drawCall;
    }

    /**
     * adds an object to render
     * @param {Object} obj
     */
    addObject(obj)
    {
        this.objects.set(obj, obj);
        return this;
    }

    /**
     * removes an object from the renderer
     * @param {Object} obj 
     */
    removeObject(obj)
    {
        this.objects.delete(obj);
        return this;
    }

    /**
     * sets the update function
     * @param {Function} cb 
     */
    onUpdate(cb)
    {
        if(typeof(cb) == "function")
            this.cbOnUpdate = cb;
    }

    /**
     * sets the draw function
     * @param {Function} cb 
     */
    onDraw(cb)
    {
        if(typeof(cb) == "function")
            this.cbOnDraw = cb;
    }

    /**
     * starts rendering at the given target FPS
     */
    start()
    {
        //this.nanoTimer.setInterval(() => {
            try{
                this.lastFrameTime = performance.now() - this.targetFrameTime;
                this._frame();
            } catch(e) {
                console.error("Ice-Engine frame exception:");
                console.log(e);
                //this.nanoTimer.clearInterval();
            }
        //}, "", this.targetFrameTime + "m");

        return this;
    }

    /**
     * called once per frame, this will trigger the callbacks for update and draw
     */
    _frame()
    {
        const frameStart = performance.now();
        this.frameScale = (frameStart - this.lastFrameTime) / this.targetFrameTime;

        this.lastFrameTime = frameStart;
        if(this.showStats)this.stats.begin();

        this._checkCanvasSize();

        if(this.cbOnUpdate)this.cbOnUpdate();

        this.glApp.clear();

        for(const obj of this.objects)
            obj[1].draw();

        if(this.cbOnDraw)this.cbOnDraw();

        if(this.showStats)this.stats.end();

        const waitTime = Math.max(this.targetFrameTime - (performance.now() - frameStart), 1.0);
        //setTimeout(() => this._frame(), waitTime);
        requestAnimationFrame(() => this._frame());   
    }

    _checkCanvasSize()
    {
        // @TODO make this event based, rather than every frame
        this.canvasSize = [this.canvasNode.clientWidth, this.canvasNode.clientHeight];
        if(this.canvasNode.width != this.canvasSize[0] || this.canvasNode.height != this.canvasSize[1])
        {
            this.canvasNode.width = this.canvasSize[0];
            this.canvasNode.height = this.canvasSize[1];

            /*const screenLength = Math.sqrt(
                (this.canvasSize[0] * this.canvasSize[0]) +
                (this.canvasSize[1] * this.canvasSize[1])
            );*/

            this.aspectRatio[0] = 1.0 / (this.canvasSize[0] * SCREEN_SCALE);
            this.aspectRatio[1] = 1.0 / (this.canvasSize[1] * SCREEN_SCALE);

            this.globalUniform.set(0, this.aspectRatio).update();

            this.glApp.resize(this.canvasSize[0], this.canvasSize[1]);
        }
    }
}