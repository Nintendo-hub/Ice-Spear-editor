/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
const fs = require("fs");

const BFRES_Parser    = require("./parser.js");
const HTML_Loader     = requireGlobal("lib/html_loader.js");
const BFRES_FileTypes = require("./file_types.js");

module.exports = class BFRES_Renderer
{
    constructor(tabNode)
    {
        this.tabNode = tabNode;
    }

    render(bfresParser)
    {        
        this.tabNode.querySelector(".list-group-header input").focus();
        this.tabNode.querySelector(".data-header-fileName").innerHTML = bfresParser.header.fileName;
        this.tabNode.querySelector(".data-header-version").innerHTML = bfresParser.header.version.join(".");

        let listGroup = this.tabNode.querySelector("#tab_tabContainer_bfres");
        let listEntryHtml = new HTML_Loader('html/bfres_file_tab.html')
        let typeCounter = new Uint32Array(12);

        for(let type in bfresParser.files)
        {
            for(let entry of bfresParser.files[type].entries)
            {
                if(entry.namePointer == 0)
                    continue;

                let entryNode = listEntryHtml.create();
                let localId = type + "_" + typeCounter[type];

                entryNode.children[0].onclick = function()
                {
                    mainApp.tabManager.open(this, type, localId, bfresParser, entry);
                };

                entryNode.querySelector(".data-fileEntry-type").innerHTML = BFRES_FileTypes.info[type].name;
                entryNode.querySelector(".data-fileType-num").innerHTML = " #" + typeCounter[type];
                entryNode.querySelector(".data-fileEntry-description").innerHTML = entry.fileName != null ? entry.fileName : BFRES_FileTypes.info[type].description;

                try{
                    let imgFilePath = __BASE_PATH + "assets/img/icons/bfres/filetype_" + type + ".png";
                    fs.accessSync(imgFilePath);
                    entryNode.querySelector("img").src = imgFilePath;
                } catch(e){
                }

                ++typeCounter[type];
                listGroup.append(entryNode);
            }
        }
    }
};
