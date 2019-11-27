/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = (packLoader, tile) =>
{
    const sarc = packLoader.load(tile.name, "mate");
    const mapBuffer = sarc.getFile(`${tile.name}.mate`);

    const materialBuffer = new Uint8Array(mapBuffer.length);
    for(let i=0; i<mapBuffer.length; ++i)
    {
        materialBuffer[i] = mapBuffer[i];
    }

    return materialBuffer;
};
