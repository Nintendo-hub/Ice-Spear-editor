/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require('path');

const Binary_File = require("binary-file");
const SARC = require("sarc-lib");
const BYAML = require("byaml-lib");

module.exports = class Location
{
    constructor(gamePath, cachePath)
    {
        this.gamePath = gamePath;
        this.cachePath = cachePath;

        this.locationData = {};
    }

    _loadFromFile()
    {
        const fileLoader = new Binary_File.Loader();
        const sarcBuffer = fileLoader.buffer(path.join(this.gamePath, "content", "Pack", "Bootup.pack"));

        const sarc = new SARC();
        sarc.parse(sarcBuffer);

        const byamlBuffer = fileLoader.buffer(sarc.getFile("Map/MainField/Static.smubin"));
        const byaml = new BYAML.Parser();
        this.locationData = byaml.parse(byamlBuffer);
    }

    async load()
    {   
        const cacheFile = path.join(this.cachePath, "map_locations.json");
        if(!await fs.exists(cacheFile))
        {
            this._loadFromFile();
            await fs.writeJSON(cacheFile, this.locationData);
        }else{
            this.locationData = await fs.readJSON(cacheFile);
        }
    }

    getLocations()
    {
        return this.locationData.LocationMarker;
    }
}