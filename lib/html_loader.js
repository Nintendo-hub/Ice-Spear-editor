/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const path = require("path");

module.exports = class HTML_Loader
{
    constructor(filePath)
    {
        this.htmlText = fs.readFileSync(path.join(__BASE_PATH, filePath), 'utf8');
    }

    create()
    {
        return document.createRange().createContextualFragment(this.htmlText);
    }
}
