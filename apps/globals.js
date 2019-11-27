/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

// This files contains super-globals

const electron = require('electron');
const querystring = require("querystring");

const __BASE_PATH = electron.remote.app.getAppPath() + "/";

function requireGlobal(path)
{
    //if(path == "lib/sarc/sarc.js")
        //throw "ewweffe SARC";

    return require.main.require(__BASE_PATH + path);
}

// THREE.js is not compatible with the normal includes
var THREE = requireGlobal("lib/3d_renderer/three.min.js");
var mainApp = null;

document.addEventListener('DOMContentLoaded', () =>
{
    let args = querystring.parse(global.window.location.search.substr(1));
    let window = electron.remote.getCurrentWindow();

    let App = require("./app.js");
    mainApp = new App(window, args);
    
    mainApp.run();
},
false);