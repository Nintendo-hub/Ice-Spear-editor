/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");

module.exports = class Renderer_Helper_PostProcessing extends Base
{
    constructor(threeContext, scene, camera, renderer)
    {
        super(threeContext);

        this.scene    = scene;
        this.camera   = camera;
        this.renderer = renderer;

        this.active = false;

        this.saoSettings = {
            output            : this.THREE.SAOPass.OUTPUT.Default,
            saoBias           : -0.55,
            saoScale          : 12.0,
            //saoIntensity      : 0.0075, // for shrines? maybe too much
            saoIntensity      : 0.003,
            saoKernelRadius   : 11.5,
            saoMinResolution  : 0.0,
            saoBlur           : true,
            saoBlurRadius     : 2.3,
            saoBlurStdDev     : 4,
            saoBlurDepthCutoff: 0.01
        };
    }

    init()
    {
        // setup render pass
        this.renderPass = new this.THREE.RenderPass(this.scene, this.camera);

        // setup SAO pass
        this.saoPass = new this.THREE.SAOPass(this.scene, this.camera, false, true);
        this.saoPass.renderToScreen = true;
        this.saoPass.params = this.saoSettings;

        /*
        // setup FXAA
        var fxaaMaterial = new THREE.ShaderMaterial( THREE.FXAAShader );
        fxaaMaterial.uniforms.tDiffuse.value = texture;
        fxaaMaterial.uniforms.resolution.value.x = 1 / image.naturalWidth;
        fxaaMaterial.uniforms.resolution.value.y = 1 / image.naturalHeight;
        var basicMaterial = new THREE.MeshBasicMaterial( { map: texture } );
        */

        // setup composer
        this.effectComposer = new this.THREE.EffectComposer(this.renderer);
        this.effectComposer.addPass(this.renderPass);
        this.effectComposer.addPass(this.saoPass);
    }

    draw()
    {
        if(this.active)
            this.effectComposer.render();
        else
            this.renderer.render(this.scene, this.camera);
    }

    onResize(size)
    {
        this.renderer.setSize(size.x, size.y);
        this.effectComposer.setSize(size.x, size.y);
    }
};


/*
this.ppGui = new dat.GUI();
        this.ppGui.add( this.saoPass.params, "output", {
            'Beauty': this.THREE.SAOPass.OUTPUT.Beauty,
            'Beauty+SAO': this.THREE.SAOPass.OUTPUT.Default,
            'SAO': this.THREE.SAOPass.OUTPUT.SAO,
            'Depth': this.THREE.SAOPass.OUTPUT.Depth,
            'Normal': this.THREE.SAOPass.OUTPUT.Normal
        });

        this.ppGui.add( this.saoPass.params, "saoBias", -1, 1 );
        this.ppGui.add( this.saoPass.params, "saoIntensity", 0, 0.5 );
        this.ppGui.add( this.saoPass.params, "saoScale", 0, 20 );
        this.ppGui.add( this.saoPass.params, "saoKernelRadius", 1, 50 );
        this.ppGui.add( this.saoPass.params, "saoMinResolution", 0, 1 );
        this.ppGui.add( this.saoPass.params, "saoBlur" );
        this.ppGui.add( this.saoPass.params, "saoBlurRadius", 0, 10 );
        this.ppGui.add( this.saoPass.params, "saoBlurStdDev", 0.5, 150 );
        this.ppGui.add( this.saoPass.params, "saoBlurDepthCutoff", 0.0, 0.1 );
        */
