/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const BYAML = require("byaml-lib");
const crc32 = require("crc-32");

module.exports = class Actor
{
    constructor(params, type, id, objInstance)
    {
        this.id = id;
        this.params = params;
        this.type = type;
        this.gui = null;

        this.objInstance = objInstance;
        this.objInstance.setActor(this);

        this.selected = false;
        this.links = [];
    }

    getName()
    {
        return (this.params.UnitConfigName && this.params.UnitConfigName.value) ? this.params.UnitConfigName.value : "";
    }

    getHashId()
    {
        return (this.params.HashId && this.params.HashId.value) ? this.params.HashId.value : 0;
    }

    setHashId(id)
    {
        this.params.HashId.value = id;
    }

    getSRTHash()
    {
        return (this.params.SRTHash && this.params.SRTHash.value) ? this.params.SRTHash.value : 0;
    }

    getCRC32(prefix)
    {
        const idPadded = this.getHashId().toString().padStart(10, '0');
        return crc32.str(prefix + "_" + this.getName() + "_" + idPadded);
    }

    setHandler(handler)
    {
        this.handler = handler;
    }

    copy()
    {
        if(this.handler)
            this.handler.copyActor(this);
    }

    getParamJSON() 
    {
        return BYAML.Helper.toJSON(this.params);
    }

    async importParamJSON(jsonString, keepPosition = false) 
    {
        const oldParams = this.params;

        let newParams;
        try{
            newParams = BYAML.Helper.fromJSON(jsonString);
        } catch(e) {
            console.warn("Import Actor JSON, invalid JSON!");  
            console.warn(jsonString);
        }

        const oldName = this.getName();
        this.handler.assignNewActorParams(this, newParams);

        if(this.getName() != oldName)
        {
            await this.updateObject();
        }

        this.params.HashId.value = oldParams.HashId.value;

        if(keepPosition && this.params.Translate && oldParams.Translate)
        {
            this.setPos({
                x: oldParams.Translate[0].value,
                y: oldParams.Translate[1].value,
                z: oldParams.Translate[2].value,
            });
        }

        this.update();
    }

    /**
     * fetches a new Actor_Object via the handler and a name
     * should be called after changing name aka UnitConfigName in the params
     */
    async updateObject()
    {
        if(this.handler)
        {
            this.objInstance.delete();
            this.objInstance = await this.handler.actorObjHandler.createInstance(this.getName());
            this.objInstance.setActor(this);
            this.objInstance.needsUpdate();
        }
    }

    /**
     * changes the actor type ("Dynamic" or "Static")
     * by deleting and re-adding it to the scene
     * @param {String} type "Dynamic" or "Static"
     */
    async changeType(type) {
        this.handler.changeActorType(this, type);
        this.type = type;
    }

    async delete()
    {
        if(this.gui)
            this.gui.delete();

        if(this.handler)
            await this.handler.deleteActor(this);

        this.links.forEach(link => link.parent.remove(link));
        this.links = [];

        this.objInstance.delete();
        this.objInstance = undefined;
    }

    update()
    {
        const {Rotate, Translate, Scale} = this.params;

        if(Translate)
        {
            this.objInstance.setPos(
                [Translate[0].value, Translate[1].value, Translate[2].value]
            );
        }
        
        if(Rotate)
        {
            this.objInstance.setRot(
                Array.isArray(Rotate) ?
                    [Rotate[0].value, Rotate[1].value, Rotate[2].value] :
                    [0.0, Rotate.value, 0.0]
            );
        }

        if(Scale)
        {
            this.objInstance.setScale(
                Array.isArray(Scale) ? 
                    [Scale[0].value, Scale[1].value, Scale[2].value] :
                    [Scale.value, Scale.value, Scale.value]
            );
        }

        this.objInstance.update();
        this.handler.updateLinks();

        if(this.gui)
        {
            this.gui.update();
        }
    }

    addRotationParams(asVector = true)
    {
        if(asVector)
        {
            this.params.Rotate = BYAML.Helper.fromJSON(`[
                {"type": 210, "value": 0},
                {"type": 210, "value": 0},
                {"type": 210, "value": 0}
            ]`);
        }else{
            this.params.Rotate = BYAML.Helper.fromJSON(`{"type": 210, "value": 0}`);
        }

        this.update();
    }

    addScalingParams(asVector)
    {
        if(asVector)
        {
            this.params.Scale = BYAML.Helper.fromJSON(`[
                {"type": 210, "value": 1},
                {"type": 210, "value": 1},
                {"type": 210, "value": 1}
            ]`);
        }else{
            this.params.Scale = BYAML.Helper.fromJSON(`{"type": 210, "value": 1}`);
        }

        this.update();
    }

    removeRotationParams()
    {
        delete this.params.Rotate;
        this.update();
    }

    removeScalingParams()
    {
        delete this.params.Scale;
        this.update();
    }

    move({x = 0.0, y = 0.0, z = 0.0})
    {
        if(this.params.Translate)
        {
            this.params.Translate[0].value += x;
            this.params.Translate[1].value += y;
            this.params.Translate[2].value += z;
        }
        this.update();
    }

    getPos()
    {
        if(this.params.Translate)
        {
            return {
                x: this.params.Translate[0].value,
                y: this.params.Translate[1].value,
                z: this.params.Translate[2].value,
            };
        }   
        return {x: 0.0, y: 0.0, z:0.0};
    }

    setPos({x = 0.0, y = 0.0, z = 0.0})
    {
        if(this.params.Translate)
        {
            this.params.Translate[0].value = x;
            this.params.Translate[1].value = y;
            this.params.Translate[2].value = z;
        }
        this.update();
    }

    rotate({x = 0.0, y = 0.0, z = 0.0})
    {
        if(this.params.Rotate)
        {
            if(Array.isArray(this.params.Rotate))
            {
                this.params.Rotate[0].value += x;
                this.params.Rotate[1].value += y;
                this.params.Rotate[2].value += z;
            }else{
                this.params.Rotate.value += y;
            }
        }
        this.update();
    }

    scale({x = 1.0, y = 1.0, z = 1.0})
    {
        if(this.params.Scale)
        {
            if(Array.isArray(this.params.Scale))
            {
                this.params.Scale[0].value *= x;
                this.params.Scale[1].value *= y;
                this.params.Scale[2].value *= z;
            }else{
                this.params.Scale.value *= y;
            }
        }
        this.update();
    }

    setColor(color)
    {
        this.objInstance.setColor(color);
        this.objInstance.update();

    }

    isInvisible()
    {
        this.objInstance.actorObject.modelGroup.name == "__DEFAULT_BOX";
    }
}
