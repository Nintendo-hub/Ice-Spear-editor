/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = (packLoader, tile) =>
{
    try{
        const sarc = packLoader.load(tile.name, "water.extm");
        return sarc.getFile(`${tile.name}.water.extm`);
    }catch(e)
    {}

    return undefined;
};