/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const os = require('os');
const fs = require("fs-extra");
const path = require('path');

const Config_Manager = require("./manager.js");

const CONFIG_NAME     = "config.json";
const CONFIG_DEF_NAME = "config.default.json";
const CONFIG_DIR      = path.join(os.homedir(), ".ice-spear");

module.exports = class Main_Config extends Config_Manager
{
    constructor()
    {
        super();
        this.load();
    }

    load()
    {
        const defaultConfBuffer = fs.readFileSync(path.join(__BASE_PATH, CONFIG_DEF_NAME));
        const defaultConf = JSON.parse(defaultConfBuffer.toString("utf8"));

        if(!super.load(path.join(CONFIG_DIR, CONFIG_NAME)))
        {
            fs.ensureDirSync(CONFIG_DIR);
            fs.writeFileSync(path.join(CONFIG_DIR, CONFIG_NAME), defaultConfBuffer);

            super.load(path.join(CONFIG_DIR, CONFIG_NAME));
            this.setDefaultValues();
            this.save();
        }

        this.addMissingSettings(this.config, defaultConf);
    }

    addMissingSettings(userConfig, defaultConf)
    {
        for(let i in defaultConf)
        {
            if(userConfig[i] instanceof Object)
            {
                if(userConfig[i] === undefined)
                {
                    userConfig[i] = defaultConf[i];
                }else{
                    this.addMissingSettings(userConfig[i], defaultConf[i]);
                }
            }else if(userConfig[i] === undefined){
                userConfig[i] = defaultConf[i];
            }
        }
    }

    setDefaultValues()
    {
        this.setValue("projects.path", path.join(os.homedir(), ".ice-spear-projects"));
    }
};