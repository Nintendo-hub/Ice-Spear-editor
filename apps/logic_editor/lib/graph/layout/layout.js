/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Layout
{
    _createCirclePos(center, radius, num) {
        const posArray = [];
        for(let i=0; i<num; i++)
        {
            const alpha = i * (2 * Math.PI) / num + (Math.PI / 2);
            const x = center.x + radius * Math.cos(alpha);
            const y = center.y - radius * Math.sin(alpha);
            posArray.push({x,y});
        }

        return posArray;
    };

    alignValueNodes(mainNode, layoutSave)
    {
        const children = mainNode.connectedEdges().connectedNodes(".param-name");
        const nodePos = mainNode.position();
        mainNode.data("lastPos", {...nodePos});
        mainNode.unlock();
        const paramCount = children.length;

        if(paramCount == 0)
            return;

        let avgNodeWidth = 0;
        children.forEach(childNode => avgNodeWidth += childNode.width());
        avgNodeWidth /= paramCount;

        let radius = (mainNode.width() * 0.5) + (avgNodeWidth * 0.5) + 20;
        if(children.length <= 2)
        {
            radius = mainNode.height() + 10;
        }

        const childNamePos = this._createCirclePos(nodePos, radius, children.length);
        
        children.forEach((childNode, idx) => 
        {
            if(childNode.hasClass("param-name"))
            {
                const id = childNode.data("id");

                if(!childNode.locked())
                    childNode.position(childNamePos[idx]);
                else
                    childNode.unlock();

                const valueNodes = childNode.connectedEdges().targets();
                valueNodes.forEach(valueNode => 
                {
                    if(valueNode != childNode && !valueNode.locked())
                    {
                        const valPos = {...childNamePos[idx]};
                        const distanceY = valueNode.height() + 20;
                        valPos.y += (valPos.y > nodePos.y) ? distanceY : -distanceY;
                        valueNode.positions(valPos);
                    }
                    valueNode.unlock();
                });

                if(!layoutSave.hasSave() || layoutSave.isNodeHidden(id))
                {
                    childNode.connectedEdges().connectedNodes(".param-name,.param-value").hide();
                }
            }
        }); 
    }
};