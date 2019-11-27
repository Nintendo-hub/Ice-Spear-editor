/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const cytoscape = require("cytoscape");
const coseBilkent = require('cytoscape-cose-bilkent');

const Layout = require("./layout/layout");
const Layout_Save = require("./layout/save");
const Node_Creator = require("./nodes/create");
const CY_STYLE = require("./layout/style.json");

module.exports = class Graph
{
    constructor(logicName, saveDirectory)
    {
        this.logicName = logicName;
        this.saveDirectory = saveDirectory;

        cytoscape.use(coseBilkent);

        this.layout = new Layout();
        this.layoutSave = new Layout_Save(this.saveDirectory);
        this.nodeCreator = new Node_Creator();
    }

    async build(actorsDyn, actorsStatic)
    {
        const that = this;

        this.nodeCreator.addActors(actorsDyn, "Dynamic");
        this.nodeCreator.addActors(actorsStatic, "Static");

        await this.layoutSave.load(this.logicName);

        const {objects, links} = this.nodeCreator.create(this.layoutSave);

        this.cy = cytoscape({
            container: cytoscapeContainer,
            boxSelectionEnabled: false,
            animate: false,
            //autounselectify: true,
            wheelSensitivity: 0.125,
            layout: {
                name: 'cose-bilkent',
                animate: "end",
                nodeDimensionsIncludeLabels: true,
                tilingPaddingVertical: 30,
                tilingPaddingHorizontal: 30,
                idealEdgeLength: 50,
                padding: 50
            },
            style: CY_STYLE,
            elements: {
                nodes: objects,
                edges: links
            }
        });

        this.cy.on('layoutstop', () => {
            const mainNodes = this.cy.nodes(".actor-name");
            mainNodes.forEach(mainNode => {
                this.layout.alignValueNodes(mainNode, this.layoutSave);
            });
        });

        this.cy.on('click', 'node', function(ev)
        {
            const nodes = this.connectedEdges().connectedNodes(".param-name,.param-value")
                              .connectedEdges().connectedNodes(".param-name,.param-value");

            if(nodes.length > 0)
            {
                const isHidden = nodes[0].hidden();
                isHidden ? nodes.show() : nodes.hide();
            }
        });

        this.cy.on('drag', 'node', function(ev) {

            if(this.hasClass("param-value"))
                return;

            const pos = this.position();
            const lastPos = this.data("lastPos") || {...pos};
            const posDiff = {x: pos.x - lastPos.x, y: pos.y - lastPos.y };

            this.data("lastPos", {...pos});

            const children = this.connectedEdges().connectedNodes(".param-name,.param-value")
                                 .connectedEdges().connectedNodes(".param-name,.param-value");

            children.forEach(childNode => 
            {
                if(childNode != this)
                {
                    const childPos = childNode.position();
                    childNode.position({
                        x: childPos.x + posDiff.x,
                        y: childPos.y + posDiff.y,
                    });
                }
            });
        }); 
    }

    async save()
    {
        return await this.layoutSave.save(this.cy, this.logicName);
    }
}