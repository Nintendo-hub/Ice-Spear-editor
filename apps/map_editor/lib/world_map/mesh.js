/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const PicoGL = require("picogl");

module.exports = (engine, mapTilesX, mapTilesY) =>
{
    const mapTileOffsetX = ((mapTilesX-1) / 2.0);
    const mapTileOffsetY = ((mapTilesY-1) / 2.0);

    const instancedPosBuff = new Float32Array(mapTilesX * mapTilesY * 2);
    let buffPos = 0;
    for(let y=0; y<mapTilesY; ++y) 
    {
        for(let x=0; x<mapTilesX; ++x)
        {
            instancedPosBuff[buffPos++] = x - mapTileOffsetX;
            instancedPosBuff[buffPos++] = y - mapTileOffsetY;
        }
    }

    const instancedPos = engine.getApp().createVertexBuffer(PicoGL.FLOAT, 2, instancedPosBuff);

    return engine.meshHelper.createQuad(-0.5, true)
        .instanceAttributeBuffer(2, instancedPos);
}