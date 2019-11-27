/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const ROTATION_ORDER = "ZYX";
const MATRIX_SIZE = 4 * 4;

module.exports = class Actor_Object_Instance
{
    constructor(actorObject)
    {
        this.matrix = new THREE.Matrix4();
        this.actorObject = actorObject;
        this.actor = undefined;

        this.pos = new THREE.Vector3(0.0, 0.0, 0.0);
        this.rot = new THREE.Vector3(0.0, 0.0, 0.0);
        this.scale = new THREE.Vector3(1.0, 1.0, 1.0);

        this.bufferColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
        this.bufferMatrix = new Float32Array(MATRIX_SIZE);

        this.needsUpdate();
        
    }

    setActor(actor)
    {
        this.actor = actor;
        this.needsUpdate();
    }

    setPos(pos)
    {
        this.pos.fromArray(pos);
        this.needsUpdate();
    }

    setRot(rot)
    {
        this.rot.fromArray(rot);
        this.needsUpdate();
    }

    setScale(scale)
    {
        this.scale.fromArray(scale);
        this.needsUpdate();
    }

    setColor(color)
    {
        this.bufferColor.set(color);
        this.actorObject.needsUpdate();
    }

    update()
    {
        if(!this.isDirty)return;
        const quat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(this.rot.x, this.rot.y, this.rot.z, ROTATION_ORDER
        ));

        this.matrix.compose(this.pos, quat, this.scale);
        this.bufferMatrix.set(this.matrix.elements);

        this.actorObject.needsUpdate();
        this.isDirty = false;
    }

    needsUpdate()
    {
        this.isDirty = true;
    }

    delete()
    {
        this.needsUpdate();
        this.actorObject.removeInstance(this);
        this.actor = undefined;
        this.actorObject = undefined;
    }
};
