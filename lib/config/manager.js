/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const os = require('os');
const fs = require("fs");
const path = require('path');

module.exports = class Config_Manager
{
    constructor()
    {
        this.path;
        this.config = {};
    }

    load(path)
    {
        this.path = path;
        if(fs.existsSync(this.path))
        {
            this.config = JSON.parse(fs.readFileSync(this.path));
            return true;
        }
        return false;
    }

    save(path = undefined)
    {
        fs.writeFileSync(path || this.path, 
            JSON.stringify(this.config, null, 4)
        );
    }

    getConfig()
    {
        return this.config;
    }

    getValue(name)
    {
        let parts = name.split(".");
        let ref = this.config;
        for(let part of parts)
        {
            if(ref == null || ref[part] === null)
                return null;

            ref = ref[part];
        }

        return ref;
    }

    setValue(name, value)
    {
        let parts = name.split(".");
        let lastPart = parts.pop();

        let ref = this.config;
        for(let part of parts)
        {
            if(ref[part] === undefined)
            {
                ref[part] = {};
            }

            ref = ref[part];
        }

        ref[lastPart] = value;
    }

    pushValue(name, value, unique = false)
    {
        const currVal = this.getValue(name);
        if(Array.isArray(currVal))
        {
            const newVal = unique ? currVal.filter(val => val != value) : currVal;
            newVal.push(value);
            this.setValue(name, newVal);
        }
    }
};