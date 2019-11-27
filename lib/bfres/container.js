/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class BFRES_Container
{
    constructor()
    {
        this.files = [];
    }

    add(file)
    {
        this.files.push(file);
    }

    isEmpty()
    {
        return this.files.length == 0;
    }

    getModels()
    {
        const models = {};
        for(const file of this.files)
        {
            Object.assign(models, file.getModels());
        }
        return models;
    }

    /**
     * return a model by its name,
     * if no name is set, it returns the first model
     * @param {strin} name 
     * @returns {Object|undefined}
     */
    getModel(name = undefined)
    {
        for(const file of this.files)
        {
            const models = file.getModels();
            for(let modelName in models)
            {
                if(modelName == name || name == undefined)
                    return models[modelName];
            }
        }

        return undefined;
    }
}