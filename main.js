/**
*    ██╗ ██████╗███████╗    ███████╗██████╗ ███████╗ █████╗ ██████╗ 
*    ██║██╔════╝██╔════╝    ██╔════╝██╔══██╗██╔════╝██╔══██╗██╔══██╗
*    ██║██║     █████╗█████╗███████╗██████╔╝█████╗  ███████║██████╔╝
*    ██║██║     ██╔══╝╚════╝╚════██║██╔═══╝ ██╔══╝  ██╔══██║██╔══██╗
*    ██║╚██████╗███████╗    ███████║██║     ███████╗██║  ██║██║  ██║
*    ╚═╝ ╚═════╝╚══════╝    ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝                                                             
*              ~~~~ Ice-Spear Tools - 2018 Max Bebök ~~~~
*
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
* @see https://gitlab.com/ice-spear-tools/
*/

const app = require('electron').app;
const packageJson    = require("./package.json");
const Window_Handler = require("./lib/window_handler.js");

var windowHandler = new Window_Handler();

app.on('ready', function()
{
    windowHandler.open(packageJson["ice-spear"]["default-app"]);
});

app.on('window-all-closed', function()
{
    if(process.platform !== 'darwin')
        app.quit();
});

app.on('activate', function()
{
    if(windowHandler.countWindows() == 0)
        windowHandler.open(packageJson["ice-spear"]["default-app"]);
});

app.on('browser-window-created', function(e, window)
{
    windowHandler.onWindowCreated(e, window);
});