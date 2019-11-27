/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

/**
 * class to cache querySelector results,
 * obviously only works if the element doesn't change
 */
module.exports = class QuerySelector_Cache
{
    /**
     * @param {HTMLElement} baseNode the base node to search from
     */
    constructor(baseNode)
    {
        this.baseNode = baseNode;
        this.cache = {};
    }

    /**
     * performs a cached query search
     * @param {string} queryString query string
     * @returns {HTMLElement|null} html node or null
     */
    get(queryString)
    {
        if(!this.cache[queryString])
        {
            this.cache[queryString] = this.baseNode.querySelector(queryString);
        }
        return this.cache[queryString];
    }
    
    clear()
    {
        this.cache = {};
    }
};
