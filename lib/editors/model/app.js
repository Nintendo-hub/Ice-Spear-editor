/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const {dialog} = electron.remote;

const Split       = require('split.js');
const FMDL_Parser = requireGlobal('./lib/bfres/fmdl/parser.js');
const Renderer    = requireGlobal("lib/3d_renderer/renderer.js");
const Filter      = requireGlobal("lib/filter.js");
const Converter_OBJ = requireGlobal("lib/model_converter/obj.js");

module.exports = class Editor_Model
{
    constructor(node, bfresParser, entry)
    {
        var that = this;

        this.info = {
            name: "3D-Model Editor"
        };

        this.node       = node;
        this.entry      = entry;

        this.bfresParser = bfresParser;
        this.parser      = bfresParser.parser;

        this.buttonExportOBJ = this.node.querySelector(".data-tool-exportOBJ");
        this.buttonExportOBJ.onclick = () => this.exportOBJ();

        this.threeJsRenderer = new Renderer(this.node.querySelector(".canvasWindow canvas"));

        Split([this.node.querySelector(".sidebar-1"), this.node.querySelector(".sidebar-2"), this.node.querySelector(".sidebar-3")], {
            sizes     : [20, 70, 10],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.filterMaterial = new Filter(this.node.querySelector("input.search-material"), this.node.querySelector(".data-fmat-names"));

        this.cameryTypeNode = this.node.querySelector("select.data-renderSettings-cameraType");
        this.cameryTypeNode.onchange = (ev) => { 
            this.threeJsRenderer.changeCameraType(ev.target.value);
         };

        this.loadData();
    }

    exportOBJ()
    {
        let path = dialog.showOpenDialog({properties: ['openDirectory']});
        let name   = this.bfresParser.header.fileName;
        let models = this.entry.parser.models;

        if(path != null && Object.keys(models).length > 0)
        {
            let converter = new Converter_OBJ();
            converter.convert(models, path, name);
        }
    }

    clear()
    {
        if(this.observerCanvas)
        {
            this.observerCanvas.disconnect();
            this.observerCanvas = null;
        }

        if(this.observerApp)
        {
            this.observerApp.disconnect();
            this.observerApp = null;
        }
    }

    loadData()
    {
        this.parser.pos(this.entry.dataPointer);

        if(this.entry.parser == null)
        {
            this.entry.parser = new FMDL_Parser(this.parser, this.entry);

            if(this.entry.parser.parse())
            {
                return false;
            }
        }

        this.renderData();
    }

    renderData()
    {
        var that = this;

        this.node.querySelector(".data-header-fileName").innerHTML = this.entry.parser.header.fileName;
        this.node.querySelector(".data-header-filePath").innerHTML = this.entry.parser.header.filePath;

        this.node.querySelector(".data-header-fvtxCount").innerHTML = this.entry.parser.header.fvtxCount;
        this.node.querySelector(".data-header-fshpCount").innerHTML = this.entry.parser.header.fshpCount;
        this.node.querySelector(".data-header-fmatCount").innerHTML = this.entry.parser.header.fmatCount;
        this.node.querySelector(".data-header-userDataCount").innerHTML = this.entry.parser.header.userDataCount;

        this.threeJsRenderer.start();

        for(let i in this.entry.parser.models)
        {
            const subModel = this.threeJsRenderer.createModel(this.entry.parser.models[i]);
            this.threeJsRenderer.addObject(subModel);
        }

        let fmatNameTbody = this.node.querySelector(".data-fmat-names");
        let fmatNameHtml = "";
        for(let mat of this.entry.parser.materials)
        {
            let names = [];
            for(let texRef of mat.textureRef)
            {
                names.push(texRef.name + (texRef.headerOffset == 0 ? " (*)" : ""));
            }

            let renderInfoHtml = `<table class="renderInfo-table">
                                        <thead><tr>
                                            <th>Name (click to show)</th>
                                            <th>Value</th>
                                        </tr></thead>
                                        <tbody hidden='hidden'>`;
            if(mat.matRenderInfo != null)
            {
                for(let infoName in mat.matRenderInfo)
                {
                    renderInfoHtml += `<tr>
                        <td>${infoName}</td>
                        <td>${mat.matRenderInfo[infoName].join(', ')}</td>
                    </tr>`;
                }
            }
            renderInfoHtml += "</tbody></table>";

            fmatNameHtml += `<tr data-modelName="${mat.name}" data-active="1" class="active data-row">
                <td class="search-value">${mat.sectionIndex}</td>
                <td class="search-value">${mat.name}</td>
                <td class="search-value">${names.join("<br/>")}</td>
                <td class="search-value">${renderInfoHtml}</td>
            </tr>`;
        }
        fmatNameTbody.innerHTML = fmatNameHtml;

        let trArray = fmatNameTbody.querySelectorAll("tr.data-row");
        for(let tr of trArray)
        {
            tr.ondblclick = function()
            {
                let modelName = this.getAttribute("data-modelName");
                let isActive  = this.getAttribute("data-active") != "1";

                that.threeJsRenderer.scene.getObjectByName(modelName).visible = isActive;
                this.setAttribute("data-active", isActive ? "1" : "0");

                if(isActive)
                    this.classList.add("active");
                else
                    this.classList.remove("active");
            };
        }

        let tableRenderInfo = fmatNameTbody.querySelectorAll("table.renderInfo-table");
        for(let table of tableRenderInfo)
        {
            table.onclick = function()
            {
                let tbody = this.querySelector("tbody");
                tbody.hidden = !tbody.hidden;
            };
        }

    }
};
