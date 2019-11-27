/**
* @copyright 2019 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');

const templateCache = {};

module.exports = class Actor_Templates
{
    static async getHtmlSelect(params)
    {
        const list = await Actor_Templates.getList();
        return list.map(entry => `<option value='${entry.id}'>${entry.name}</option>`).join("\n");
    }

    static async getList(params)
    {
        const files = await fs.readdir(__dirname + '/templates');
        const list = [];
        for(let file of files) 
        {
            const id = file.split('.')[0];
            const data = await Actor_Templates.getData(id);
            list.push({id, name: data.name});
        }
        return list;
    }

    static async getData(name)
    {
        if(!templateCache[name]) {
            templateCache[name] = await fs.readJSON(__dirname + `/templates/${name}.json`);
        }
        return templateCache[name];
    }
}