/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");

module.exports = class Renderer_Helper_Lighting extends Base
{
    constructor(threeContext, scene, camera)
    {
        super(threeContext);
        this.scene  = scene;
        this.camera = camera;

        this.ambientLights = [];
        this.cameraLight   = null;
        this.lightId       = 0;
    }

    init()
    {
        this.cameraLight = this.addPointLight(new this.THREE.Vector3(0,0,0), 0xFFFFFF, "camera-light");
        this.cameraLight.power = 5;
    }

    update()
    {
        this.cameraLight.position.copy(this.camera.position);
        this.cameraLight.position.y += 2;
    }

    addPointLight(pos, color, name = null)
    {
        if(name == null)
            name = "point-light-" + (this.lightId++);

        let light = new this.THREE.PointLight(color);
        light.name = name;
        light.position.set(pos.x, pos.y, pos.z);

        this.scene.add(light);
        return light;
    }

    setAmbientLight(color, name)
    {
        if(name == null)
            name = "ambient-light-" + (this.lightId++);

        let light = new this.THREE.AmbientLight(color);
        light.name = name;

        this.scene.add(light);
        this.ambientLights.push(light);
        return light;
    }
};
