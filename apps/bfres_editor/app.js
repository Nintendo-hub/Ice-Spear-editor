/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = require('./../../lib/bfres/parser');
const BFRES_Renderer     = require('./../../lib/bfres/renderer');
const Tab_Manager        = require('./../../lib/tab_manager');

const electron = require('electron');
const fs       = require('fs');
const Split    = require('split.js');

const {dialog} = electron.remote;

const App_Base = require("./../base");

const SESSION_FILE_PATH_KEY = "bfresEditor-filePath";

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.dragDropNode = document;
        this.tabManager = null;
        this.filePath   = "";
        this.fileLoader = new Binary_File_Loader();
        this.footerNode = footer.querySelector(".data-fileName");

        this.bfresParser    = null;
        this.bfresTexParser = null;
        this.bfresRenderer  = null;

        Split(['#main-sidebar-left', '#main-sidebar-right'], {
            sizes     : [50, 50],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.init();
    }

    init()
    {
        this.dragDropNode.ondragover  = (ev) => ev.preventDefault();
        this.dragDropNode.ondragend   = (ev) => {};
        this.dragDropNode.body.ondrop = (ev) =>
        {
            if(ev.dataTransfer.files.length != 0)
                this.openFile(ev.dataTransfer.files[0].path);

            ev.preventDefault();
        }
    }

    openFileDialog()
    {
        let path = dialog.showOpenDialog({properties: ['openFile']});

        if(path != null)
            return path[0];

        return "";
    }

    async scanTextureFile(num = 1)
    {
        if(num > 3)
            return false;

        let fileParts = this.filePath.split(".");
        
        if(fileParts.length >= 2)
        {
            const baseName = fileParts[fileParts.length-2];
            if(baseName.substr(-3, 1) == "-")
            {
                fileParts[fileParts.length-2] = baseName.substr(0, baseName.length - 3);
            }
        }

        fileParts[fileParts.length-1] =  `Tex${num}.` + fileParts[fileParts.length-1];
        let texPath = fileParts.join(".");

        // prevent loading texture if a texture file is already opened
        if(fileParts.length > 2 && fileParts[fileParts.length-2].substr(0, 3) == "Tex")
        {
            return false;
        }

        if (this.filePath != texPath && fs.existsSync(texPath)) {
            await this.openTextureFile(texPath);
            return true;
        }

        return await this.scanTextureFile(num + 1);
    }

    async openTextureFile(texPath)
    {
        console.log("Tex-File: " + texPath);

        let buffer = this.fileLoader.buffer(texPath);
        this.bfresTexParser = new BFRES_Parser(true);
        this.bfresTexParser.setLoader(this.loader);

        await this.bfresTexParser.parse(buffer);
    }

    async openFile(filePath)
    {
        if(!filePath)
        {
            if(filePath = this.openFileDialog())
            {
                sessionStorage.setItem(SESSION_FILE_PATH_KEY, filePath);
                location.reload();
                return false;
            }
        }

        if(!filePath)
            return false;
            
        await this.loader.show();
        await this.loader.setStatus("Buffering File");

        this.clear();

        this.filePath = filePath;
        this.footerNode.innerHTML = "File loaded: " + this.filePath;

        let buffer = this.fileLoader.buffer(filePath);
        this.bfresParser = new BFRES_Parser(true);
        this.bfresParser.setLoader(this.loader);

        await this.scanTextureFile();
        
        if(this.bfresTexParser != null)
            this.bfresParser.setTextureParser(this.bfresTexParser);

        if(await this.bfresParser.parse(buffer))
        {
            this.bfresRenderer = new BFRES_Renderer(bfres_tab_1);
            this.bfresRenderer.render(this.bfresParser);

            await this.loader.hide();
            return true;
        }

        await this.loader.hide();
        return false;
    }

    async run()
    {
        await super.run();
        
        this.tabManager = new Tab_Manager(tab_tabContainer_bfres, tab_contentContainer_bfres);
        this.tabManager.init();

        // default path
        let filePath = this.config.getValue("game.path") + "/content/Model/Animal_Goat.sbfres"; // TEST

        // check if an argument was set
        if(this.args.file != null) {
            filePath = this.args.file;
        }

        // check if a session var is set (done after manually opening a file)
        if(sessionStorage.getItem(SESSION_FILE_PATH_KEY)) {
            filePath = sessionStorage.getItem(SESSION_FILE_PATH_KEY);
        }

        await this.openFile(filePath);
    }

};
