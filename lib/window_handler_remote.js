/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const uuid = require("uuid/v4");
const path = require('path');
const url  = require('url');

const electron = require('electron');
var ipc = electron.ipcRenderer;
/**
 * Handler class for electron-windows
 * it can open windows, and handle their events including closing them
 */
module.exports = class Window_Handler_Remote
{
    constructor()
    {
    }

    /**
     * returns the number of opened windows
     */
    countWindows()
    {
        return 0; // TODO
    }

    /**
     * opens a new window/app
     * @param {String} name name of the app
     * @param {Object|NULL} params optional params
     * @return {String} generated and unique window id
     */
    open(name, params = {})
    {
        ipc.send("open-app", name, params);
    }

};
