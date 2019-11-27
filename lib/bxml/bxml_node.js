/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const crc32 = require('crc32');

const CRC_REGEX = /[0-9a-z]{8}/;

/**
 * a BXML node that may contain a value or more nodes.
 * Used for easier traversal and saving the original data types for saving
 */
module.exports = class BXML_Node
{
    constructor(id = 0, type = "root")
    {
        this.id = id;
        this.type = type;

        //this.value = null; // all 3 only set if needed
        //this.children = {};
        //this.name = null;
    }

    /**
     * returns or sets the value of this node
     * Note: this only returns the value and not children nodes
     * @param {Number|String} value 
     */
    val(value = null)
    {
        if(value != null)
            this.value = value;
        
        return this.value;
    }

    /**
     * checks if this node has a value
     */
    hasValue()
    {
        return this.value != null;
    }

    /**
     * adds a child node to the node
     * @param {BXML_Node} node
     */
    addChild(node)
    {
        if(this.children == null)
            this.children = new Map();

        this.children.set(node.id + "", node);
        return node;
    }

    /**
     * returns the number of children elements
     * @returns Int
     */
    getChildCount(deep = false, maxLevel = -1)
    {
        let num = this.children == null ? 0 : this.children.size;

        if(deep && maxLevel != 0 && this.children != null) 
        {
            for(let [id, child] of this.children)
            {
                num += child.getChildCount(deep, maxLevel - 1);
            }
        }
        return num;
    }

    /**
     * executes a function for each node
     * @param {Function} f
     */
    forEach(f)
    {
        f(this);

        if(this.children != null)
        {
            for(let [id, child] of this.children)
                child.forEach(f);
        }
    }

    /**
     * sets the name of the node, nothing happens if the name is null
     * @param {String|null} name 
     */
    setName(name)
    {
        if(name != null)
            this.name = name;
    }

    /**
     * returns a Node-Object found by the set name
     * the name can be multiple levels deep, seperated by a point
     * @param {String} name node name
     * @returns {BXML_Node|null} result, null if nothing was found
     */
    get(name)
    {
        if(typeof(name) == "string")
            name = name.split(".").reverse();

        let currentHash = name.pop();

        if(currentHash == null)
            return this;

        if(!CRC_REGEX.test(currentHash))
            currentHash = crc32(currentHash).padStart(8, "0");

        if(this.children != null && this.children.has(currentHash))
            return this.children.get(currentHash).get(name);

        return null;
    }

    toObject(node = this) {
        if(node.getChildCount() == 0){
            return node.val();
        }else{
            const data = {};   
            node.children.forEach((value, key) => {
                 data[value.name || value.id] = this.toObject(value);
            });
            return data;
        }
    }

    toJSON()
    {
        return JSON.stringify(this.toObject(), null, 4);
    }
};