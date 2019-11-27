/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs       = require("fs");
const {dialog} = require('electron').remote;
const Split    = require('split.js');
const PNG      = require("png-lib");

const BFRES_FileTypes = requireGlobal("lib/bfres/file_types.js");

module.exports = class Editor_Texture
{
    constructor(node, bfresParser, entry)
    {
        this.info = {
            name: "Texture-Editor"
        };

        this.node   = node;
        this.entry  = entry;
        this.bfres  = bfresParser;
        this.parser = bfresParser.parser;
        this.file   = this.parser.file;

        this.indexSelect = this.node.querySelector(".data-tool-index");
        this.buttonExportPNG = this.node.querySelector(".data-tool-exportPNG");
        this.embededParser =  mainApp.bfresParser.getFileParser(BFRES_FileTypes.types.EMBEDDED, 1);

        Split([this.node.querySelector(".sidebar-1"), this.node.querySelector(".sidebar-2")], {
            sizes     : [25, 75],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.loadData();
    }

    loadData()
    {
        if(this.entry.parser == null)
        {
            let fileInfo = BFRES_FileTypes.info[this.entry.type];
            const Parser_Class = requireGlobal(fileInfo.parser);

            this.entry.parser = new Parser_Class(this.parser, this.entry, this.bfres.contentType);
            this.entry.parser.parse();

        }

        if(this.entry.parser.header.surface.imageBuffer != null)
            this.renderImage();

        if(this.entry.parser.header.surface != null)
            this.renderData();

        this.setToolFunctions();
    }

    exportImage(format, index)
    {
        let ftex  = this.entry.parser.header;
        let img   = this.entry.parser.header.surface;

        // get new file path
        let filePath = dialog.showSaveDialog({
            title: "Export PNG",
            buttonLabel: "Export",
            defaultPath: ftex.fileName + ".png",
            filters: [
                {name: 'PNG', extensions: ['png']},
            ]
        });

        if(filePath == null || filePath == "")
            return;

        this.buttonExportPNG.disabled = true;
        this.buttonExportPNG.style.opacity = 0.5;

        const ctx = this.node.querySelector("canvas").getContext('2d');
        const imgBuffer = ctx.getImageData(0,0, ftex.surface.sizeX, ftex.surface.sizeY).data;

        // save to individual format
        if(format == "png")
        {
            let pngBuffer = PNG.encode(imgBuffer, ftex.surface.sizeX, ftex.surface.sizeY);

            fs.writeFile(filePath, pngBuffer, (err) =>
            {
                this.buttonExportPNG.disabled = false;
                this.buttonExportPNG.style.opacity = 1.0;
            });
        }
    }

    renderData(fileOffset)
    {
        let ftex = this.entry.parser.header;

        this.node.querySelector(".data-header-fileName").innerHTML = ftex.fileName;
        this.node.querySelector(".data-header-filePath").innerHTML = ftex.filePath;
        this.node.querySelector(".data-header-sizeX").innerHTML    = ftex.surface.sizeX;
        this.node.querySelector(".data-header-sizeY").innerHTML    = ftex.surface.sizeY;
        this.node.querySelector(".data-header-sizeZ").innerHTML    = ftex.surface.sizeZ;

        this.node.querySelector(".data-header-mipmapCount").innerHTML   = ftex.surface.mipmapCount;
        this.node.querySelector(".data-header-textureFormat").innerHTML = this.entry.parser.textureTypes[ftex.surface.textureFormat].name;
        this.node.querySelector(".data-header-colorChannels").innerHTML   = ftex.surface.colorChannels;

        if(this.embededParser != null)
        {
            let buff = this.embededParser.getTextureInfo(this.entry.fileIndex - 1);

            this.node.querySelector(".data-header-embededInfo").innerHTML = buff.toString("hex").toUpperCase().match(/[0-9A-Z]{2}/g).join(" ");
            this.node.querySelector(".data-header-embededInfo").innerHTML += "<br/>";

            for(let i=0; i<4; ++i)
            {
                let e = buff[i];
                this.node.querySelector(".data-header-embededInfo").innerHTML += e.toString(2).padStart(8, "0") + " ";
            }
        }

        let selectHtml = "";
        for(let i=0; i<ftex.surface.imageBuffers.length; ++i)
        {
            selectHtml += `<option value="${i}">${i}</option>`;
        }

        this.indexSelect.innerHTML = selectHtml;
        this.indexSelect.onchange = () => this.renderImage(this.indexSelect.value);
    }

    setToolFunctions()
    {
        this.buttonExportPNG.onclick = () => {
            let index = parseInt(this.indexSelect.value);
            this.exportImage("png", index);
        };
    }

    renderImage(index = 0)
    {
        const canvas = this.node.querySelector("canvas");
        const ctx = canvas.getContext('2d');

        const img = this.entry.parser.header.surface;
        const imageBuffer = img.imageBuffers[index];

        canvas.width = img.sizeX;
        canvas.height = img.sizeY;

        const pixels = img.sizeX * img.sizeY;
        const idata = ctx.createImageData(img.sizeX, img.sizeY);

        if(img.colorChannels == 4)
        {
            idata.data.set(imageBuffer);
        }else{
            let bufferPos = 0;
            let imgPos = 0;
            for(let p=0; p<pixels; ++p)
            {
                for(let c=0; c<4; ++c)
                {
                    idata.data[imgPos++] = c >= img.colorChannels ? 255 : imageBuffer[bufferPos++];
                }
            }
        }

        ctx.putImageData(idata, 0, 0);
    }
};
