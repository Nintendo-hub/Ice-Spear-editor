/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const QuerySelector_Cache = require("./../../../../lib/queryselector_chache");

const FIELD_SECTION_REGEX = /[A-J]-[1-9]/;
const SHRINE_REGEX = /(Dungeon[0-9]{3})|(Remains.+)/;

module.exports = class World_Map_UI
{
    constructor(uiNode)
    {
        this.uiNode = uiNode;
        this.nodeSelector = new QuerySelector_Cache(this.uiNode);

        this.shrineName = "";
        this.fieldSection = "";
        this.fieldPos = [0.0, 0.0];

        this._initEvents();
    }

    _initEvents()
    {
        this.uiNode.onclick = (ev) => {
            console.log("e");
            ev.preventDefault();
            ev.stopPropagation();
        };

        this.nodeSelector.get(".tool-fieldSection-open").onclick = () => {
            if(!FIELD_SECTION_REGEX.test(this.fieldSection))return;

            mainApp.windowHandler.open("field_editor", {
                section: this.fieldSection,
                pos: this.fieldPos
            });
        };

        this.nodeSelector.get(".tool-shrine-open").onclick = () => {
            if(!SHRINE_REGEX.test(this.shrineName))return;
            
            mainApp.windowHandler.open("shrine_editor", {
                shrine: this.shrineName
            });
        };
    }

    _formatFloat(val)
    {
        return val.toFixed(4);
    }

    update(data)
    {
        this.updatePos(data.pos.x, data.pos.y);
        this.updateMarker(data.marker.x, data.marker.y);
        this.updateFieldSection(data.fieldSection);
        this.updateShrine(data.shrine);
    }

    updatePos(x, y)
    {
        this.nodeSelector.get(".data-pos-x").innerHTML = this._formatFloat(x);
        this.nodeSelector.get(".data-pos-y").innerHTML = this._formatFloat(y);
    }

    updateMarker(x, y)
    {
        this.fieldPos = [x,y];
        this.nodeSelector.get(".data-marker-x").innerHTML = this._formatFloat(x);
        this.nodeSelector.get(".data-marker-y").innerHTML = this._formatFloat(y);
    }

    updateFieldSection(sectionData)
    {
        this.fieldSection = `${sectionData.x || '?'}-${sectionData.y || '?'}`;
        this.nodeSelector.get(".data-fieldSection").innerHTML = this.fieldSection;
        this.nodeSelector.get(".tool-fieldSection-open").disabled = !FIELD_SECTION_REGEX.test(this.fieldSection);
    }

    updateShrine(shrineName)
    {
        this.shrineName = shrineName || "Dungeon???";
        this.nodeSelector.get(".data-shrine").innerHTML = this.shrineName;
        this.nodeSelector.get(".tool-shrine-open").disabled = !SHRINE_REGEX.test(this.shrineName);
    }
};