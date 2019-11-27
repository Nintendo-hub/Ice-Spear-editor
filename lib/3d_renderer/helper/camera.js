/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");

module.exports = class Renderer_Helper_Camera extends Base
{
    constructor(threeContext, camera)
    {
        super(threeContext);

        this.camera = camera;
    }

    init()
    {
        this.reset();
    }

    reset()
    {
        this.camera.position.z = -10;
        //this.tanFOV = Math.tan( ( ( Math.PI / 180 ) * this.camera.fov / 2 ) );
        this.camera.lookAt(new this.THREE.Vector3(0.0));
    }

    onResize(drawSize, oldSize)
    {
        this.camera.aspect = drawSize.x / drawSize.y;
        // @TODO make this more intelligent and now eye-cancer inducing 
        //this.camera.fov = ( 360 / Math.PI ) * Math.atan( this.tanFOV * ( drawSize.y / oldSize.y ) );

        this.camera.updateProjectionMatrix();
        //this.camera.lookAt( this.scene.position );
    }
};
