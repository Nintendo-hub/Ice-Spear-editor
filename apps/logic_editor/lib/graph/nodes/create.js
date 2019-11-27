/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const COLOR_DEFAULT = "#d8b05f";
const COLOR_LINK    = "#2d7dc4";
const COLOR_EVENT   = "#1f9b2b";

module.exports = class Graph_Node_Creator
{
    constructor()
    {
        this.actorIdMap = {};
    }

    _idToHex(id)
    {
        return id.toString("16").toUpperCase().padStart(8, "0");
    }

    addActors(actors, type)
    {
        for(const actor of actors)
        {
            const id = this._idToHex(actor.HashId.value);
            actor._type = type;

            if(id === undefined)
            {
                console.warn("Actor has no ID:");
                console.log(actor);
                continue;
            }
            
            if(this.actorIdMap[id])
            {
                console.warn("Actor-ID already in use: ", id);
            }

            this.actorIdMap[id] = actor;
        }   
    }

    create(layoutSave)
    {
        const links = [];
        const objects = [];

        for(const id in this.actorIdMap)
        {
            const actor = this.actorIdMap[id];
            const actorName = actor.UnitConfigName.value;

            let actorColor = COLOR_DEFAULT;

            if(actorName.startsWith("LinkTag"))
                actorColor = COLOR_LINK;

            if(actorName.startsWith("Event"))
                actorColor = COLOR_EVENT;

            objects.push({
                "data": {
                    id: id,
                    labelId: id,
                    labelName: actorName + "\n" + (actor._type == "Dynamic" ? "D-" : "S-") + id,
                    bgColor: actorColor
                },
                ...layoutSave.getNodeParams(id),
                "group": "nodes",
                "classes": "actor-name"
            });

            if(actor["!Parameters"])
            {
                for(let paramName in actor["!Parameters"])
                {
                    if(["SharpWeaponJudgeType", "DropTable"].includes(paramName))
                        continue;

                    const param = actor["!Parameters"][paramName];
                    const val = (param.value === undefined) ? "<complex>" : param.value;
                    //console.log(`Param ${paramName} = ${val}`);

                    const paramNameId  = `${id}-${paramName}-name`;
                    const paramValueId = `${id}-${paramName}-value`;

                    objects.push({
                        data: {
                            id: paramNameId,
                            labelName: paramName
                        },
                        ...layoutSave.getNodeParams(paramNameId),
                        group: "nodes",
                        visibility: "hidden",
                        classes: "param-name"
                    });

                    objects.push({
                        data: {
                            id: paramValueId,
                            labelValue: val
                        },
                        ...layoutSave.getNodeParams(paramValueId),
                        group: "nodes",
                        classes: "param-value"
                    });

                    links.push({
                        "data": {
                          id: `link-${id}:${paramNameId}`,
                          source: id,
                          target: paramNameId,
                        },
                        "group": "edges",
                        "classes": "param-edge"
                    });

                    links.push({
                        "data": {
                          id: `link-${paramNameId}:${paramValueId}`,
                          source: paramNameId,
                          target: paramValueId,
                          labelName: param.type,
                        },
                        "group": "edges",
                        "selectable": true,
                        "grabbable": true,
                        "classes": "param-edge"
                    });
                }
            }   

            if(actor.LinksToObj)
            {
                if(!actor.LinksToObj.length)
                    console.warn("actor.LinksToObj is not an array!");

                for(const ref of actor.LinksToObj)
                {
                    const destName = ref.DefinitionName.value;
                    const destId   = this._idToHex(ref.DestUnitHashId.value);
                    if(!this.actorIdMap[destId])
                    {
                        console.warn(`Link: ${id} -> ${destId} (${destName}), destination does not exist!`);
                        continue;
                    }

                    links.push({
                        "data": {
                            id: `link-${id}:${destId}`,
                            source: id,
                            target: destId,
                            labelName: destName,
                            color: actorColor
                        },
                        "group": "edges",
                        "selectable": true,
                        "grabbable": true,
                    });
                }
            }
        }

        return {objects, links};
    }
};