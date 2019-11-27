/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

// static chache object
const cache = {};

/**
 * helper to store and load textures across multiple instances of FTEX objects
 */
module.exports = class FTEX_Cache
{
    /**
     * returns an item from the cache
     * @param {string} name 
     */
    static get(name)
    {
        return cache[name];
    }

    /**
     * sets an object to the cache
     * @param {string} name 
     * @param {Object} data 
     * @returns Object object that was set
     */
    static set(name, data)
    {
        cache[name] = data;
        return data;
    }

    /**
     * set a name and callback that provides data 
     * to automatically create and read cache data when necessary
     * @param {string} name
     * @param {Function} dataProvider, can be async 
     */
    static async getCached(name, dataProvider)
    {
        return FTEX_Cache.get(name) || await FTEX_Cache.set(name, dataProvider());
    }
}