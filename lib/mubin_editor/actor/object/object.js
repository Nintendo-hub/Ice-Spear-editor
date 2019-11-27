/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const MATRIX_SIZE = 4 * 4;
const MATRIX_NAMES = ['objMatrix0', 'objMatrix1', 'objMatrix2', 'objMatrix3'];
let totalTime = 0;
/**
 * class to hold actors models and the instanced data
 */
module.exports = class Actor_Object
{
    constructor(modelGroup)
    {
       this.modelGroup = modelGroup;
       this.modelGroup.userData.actorObject = this;

       this.modelMatrixArray = undefined;
       this.instances = new Map();

       // why is it 4 different buffers? because for some reason i can't send instanced matrix data to the shader
       this.bufferMatrix = new Array(4);
       this.bufferColor = undefined;
       this._updateBufferSize(0);

       this.attrMatrix = new Array(4);
       this.attrColor = undefined;
       this._updateAttributes(true);

       this.instanceCount = 0; // real amount of instances
       this.bufferInstances = 0; // size the buffer has reserved, can be bigger than currentInstances
       this.nextExtraBuffer = 0; // extra size for the next buffer, increases with every addition

       this.isDirty = false;
    }

    addInstance(instance)
    {
        this.instances.set(instance, instance);
        this.needsUpdate();
    }

    removeInstance(instance)
    {
        this.instances.delete(instance);
        this.needsUpdate();
    }

    _updateBufferSize(newSize)
    {
        this.bufferInstances = newSize + this.nextExtraBuffer;
        
        //if(this.nextExtraBuffer < 50)
        //  this.nextExtraBuffer += 5;

        this.bufferColor = new Float32Array(this.bufferInstances * 4);

        for(let i=0; i<4; ++i)
            this.bufferMatrix[i] = new Float32Array(this.bufferInstances * 4); // @TODO use one array with 4 views
    }

    _updateAttributes(sizeChanged)
    {
        for(let i=0; i<4; ++i)
        {
            const mat = this.bufferMatrix[i];
            if(sizeChanged)
            {
                this.attrMatrix[i] = new THREE.InstancedBufferAttribute(
                    new Float32Array(mat.buffer, mat.byteOffset, this.instanceCount * 4),
                4);
            }else{
                this.attrMatrix[i].needsUpdate = true;
            }
        }

        if(sizeChanged)
        {
            this.attrColor = new THREE.InstancedBufferAttribute(this.bufferColor, 4);
        }else{
            this.attrColor.needsUpdate = true;
        }
    }

    needsUpdate()
    {
        this.isDirty = true;
    }

    /**
     * updates the model-matrices based on the actor array
     * @param {Array<Actor>} actors 
     */
    update()
    {   
        if(!this.isDirty)return;

        let sizeChanged = false;
        this.instanceCount = this.instances.size;

        if(this.instanceCount != this.bufferInstances || this.instanceCount == 0)
        {
            this._updateBufferSize(this.instanceCount);
            sizeChanged = true;
        }

        let i=0;
        for(const instance of this.instances.values())
        {
            let m = 0;
            for(let r=0; r<16; r+=4) {
                this.bufferMatrix[m++].set(instance.bufferMatrix.slice(r, r+4), i);
            }

            this.bufferColor.set(instance.bufferColor, i);

            i += 4;
        }

        this._updateAttributes(sizeChanged);

        for(let child of this.modelGroup.children)
        {
            for(let i=0; i<4; ++i)
                child.geometry.addAttribute(MATRIX_NAMES[i], this.attrMatrix[i]);

            child.geometry.addAttribute("objColor", this.attrColor);
            child.maxInstancedCount = this.instanceCount;
            child.geometry.maxInstancedCount = this.instanceCount;
        }

        this.modelGroup.visible = (this.instanceCount > 0);

        this.isDirty = false;
    }

    /**
     * check if this object has any instances or not
     * @returns {boolean}
     */
    isEmpty()
    {
        return this.instances.size == 0;
    }
};
