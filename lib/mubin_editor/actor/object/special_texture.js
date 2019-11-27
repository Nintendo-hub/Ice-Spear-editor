/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

let textures = undefined;

/**
 * handles special textures for actors such as event tags (And, Or, ...)
 */
class Special_Texture
{
    static load()
    {
        if(!textures) 
        {
            textures = {};

            const files = fs.readdirSync(path.join(__BASE_PATH, 'assets', 'img', 'special'));
            for(let file of files)
            {
                const fileName = file.split(".")[0];
                textures[fileName] = new THREE.TextureLoader().load("assets/img/special/" + file);
            }
        }
    }

    static getNames() 
    {
        return Object.keys(textures);
    }

    static get(name) 
    {
        return textures[name];
    }
};

Special_Texture.load();

module.exports = Special_Texture;