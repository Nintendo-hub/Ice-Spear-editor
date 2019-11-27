/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require('path');

const Ice_Engine = require("./../ice_engine/engine");

const World_Map_Texture = require('./texture');
const createMapMesh = require('./mesh');
const Camera = require("./camera");
const Locations = require("./location");
const Icon = require("./icon");
const Marker = require("./marker");
const Selector = require("./select");

const PicoGL = require("picogl");

const mapTilesX = 12;
const mapTilesY = 10;

module.exports = class World_Map
{
    constructor(ui, gamePath, cachePath, loader)
    {
        this.ui = ui;
        this.gamePath = gamePath;
        this.cachePath = cachePath;
        this.loader = loader;

        this.mapCanvas = mapCanvas; // global node
        this.engine = new Ice_Engine(this.mapCanvas);
        this.engine.onUpdate(() => this._update());

        const texBasePath = path.join(this.gamePath, "content", "UI", "MapTex", "MainField");
        this.textureHandler = new World_Map_Texture(texBasePath, this.cachePath, mapTilesX, mapTilesY, this.loader);

        this.camera = new Camera(this.engine);
        this.locations = new Locations(this.gamePath, this.cachePath);
        this.icons = new Icon(this.engine);
        this.marker = new Marker(this.engine);

        this.mapDrawCall = undefined;
        this.highlightedSection = "?-?";

        this.selector = new Selector(
            this.mapCanvas, this.engine.aspectRatio, this.camera, this.marker, this.icons, 
            (data) => {
                this.highlightSection(data.fieldSection);
                this.ui.update(data)
            }
        );

        this.shaderPath = path.join(__BASE_PATH, "apps", "map_editor", "lib", "shader");
    }

    _addEvents()
    {
        document.onmouseup   = ev => this.selector.onMouseUp(ev);
        this.mapCanvas.onmousedown = ev => this.selector.onMouseDown(ev);
        document.onwheel     = ev => this.camera.onScroll(ev);
        document.onmousemove = ev => {
            this.selector.onMove(ev);
            this.camera.onMove(ev);
        };
    }

    async load()
    {
        await this.loader.setStatus("Loading Locations");
        await this.locations.load();

        await this.loader.setStatus("Loading Textures");
        const mapImageBuffer = await this.textureHandler.load();

        await this.engine.createShader("map",    path.join(this.shaderPath, "map.glsl.vert"),    path.join(this.shaderPath, "map.glsl.frag"));
        await this.engine.createShader("icon",   path.join(this.shaderPath, "icon.glsl.vert"),   path.join(this.shaderPath, "icon.glsl.frag"));
        await this.engine.createShader("marker", path.join(this.shaderPath, "marker.glsl.vert"), path.join(this.shaderPath, "marker.glsl.frag"));

        const mapTexture = this.engine.createTexture(mapImageBuffer, this.textureHandler.getSize(), {
            format: PicoGL.RGB,
            generateMipmaps: false,
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE,
        });

        const mapVertexArray = createMapMesh(this.engine, mapTilesX, mapTilesY);
        this.mapDrawCall = this.engine.createDrawCall("map", mapVertexArray, true)
            .texture("texColor", mapTexture)
            .uniformBlock("globalUniforms", this.engine.getGlobalUniform())
            .uniformBlock("cameraUniforms", this.camera.getUniformBuffer())
            .uniform("uSelectedSection", 9999);

        (await this.marker.createDrawCall()).uniformBlock("cameraUniforms", this.camera.getUniformBuffer());
        (await this.icons.createDrawCall(this.locations.getLocations())).uniformBlock("cameraUniforms", this.camera.getUniformBuffer());

        this.selector.forceCallback();

        this._addEvents();
    }

    highlightSection(posData)
    {
        const highlightedSection = `${posData.x}-${posData.y}`;
        if(highlightedSection != this.highlightedSection)
        {
            let tileNum = 9999;
            if(posData.x !== undefined && posData.y !== undefined)
            {
                const tileX = posData.x.charCodeAt() - 65 + 1;
                const tileY = 9 - posData.y;
                tileNum = (tileY * mapTilesX) + tileX;
            }

            this.mapDrawCall.uniform("uSelectedSection", tileNum);
            this.highlightedSection = highlightedSection;
        }
    }

    start()
    {
        this.engine.start();
    }

    _update()
    {
        this.camera.update();
        this.selector.update();
    }
}