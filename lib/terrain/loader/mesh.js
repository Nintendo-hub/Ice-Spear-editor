/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = (packLoader, tile) =>
{
    const sarc = packLoader.load(tile.name, "hght");
    return sarc.getFile(`${tile.name}.hght`);
};