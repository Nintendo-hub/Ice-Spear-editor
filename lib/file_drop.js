/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const {dialog} = electron.remote;

/**
 * helper for file darg&drop with input fields
 */
module.exports = class File_Drop
{
    constructor(dragNode, fileCallback)
    {
        let fileInput = dragNode.querySelector("input");
        dragNode.ondrop = (ev) => 
        {
            if(ev.dataTransfer.files.length > 0)
            {
                let filePath = ev.dataTransfer.files[0].path;
                fileInput.value = filePath;

                if(typeof(fileCallback) == "function")
                    fileCallback(fileInput.value);
            }
            ev.preventDefault();
        }

        let dragBtn = dragNode.querySelector("button");
        dragBtn.onclick = () => 
        {
            let path = dialog.showOpenDialog({properties: ['openDirectory']});
            if(path != null && path[0] != null)
            {
                fileInput.value = path[0];

                if(typeof(fileCallback) == "function")
                    fileCallback(fileInput.value);
            }
        };
    }

    static create(dragNode, fileCallback)
    {
        return new File_Drop(dragNode, fileCallback);
    }
};