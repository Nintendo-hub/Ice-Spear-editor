/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Thread_Helper = require("./thread_helper.js");

module.exports = class Loader
{
    /**
     * @param {Node} contentNode the main node for all content (should have the window class)
     * @param {Node} loaderNode node for the loader itself
     */
    constructor(contentNode, loaderNode)
    {
        this.threadHelper = new Thread_Helper();
        this.contentNode  = contentNode;
        this.loaderNode   = loaderNode;

        this.textStatus = "";
        this.textInfo   = "";
    }

    /**
     * shows the loader
     */    
    async show()
    {   
        this.loaderNode.hidden = false;
        this.contentNode.classList.add("filter-blur");
        await this.threadHelper.pauseNonBlocking();
    }

    /**
     * hides the loader
     */    
    async hide()
    {
        this.loaderNode.hidden = true;
        this.contentNode.classList.remove("filter-blur");
        await this.threadHelper.pauseNonBlocking();
    }

    /**
     * set the main (status) text
     * @param {String} text 
     */
    async setStatus(text)
    {
        if(text != this.textStatus)
        {
            this.textStatus = text;
            this.loaderNode.querySelector(".data-status").innerHTML = this.textStatus;
            this.loaderNode.querySelector(".data-info").innerHTML   = "";
            this.textInfo = "";
            await this.threadHelper.pauseNonBlocking();
        }
    }

    /**
     * sets the sub (info) text
     * @param {String} text 
     */
    async setInfo(text)
    {
        if(text != this.textInfo)
        {
            this.textInfo = text;
            this.loaderNode.querySelector(".data-info").innerHTML = this.textInfo;
            await this.threadHelper.pauseNonBlocking();
        }
    }
}