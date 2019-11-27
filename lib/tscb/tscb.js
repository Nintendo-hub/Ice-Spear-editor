/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File = require('binary-file');
const TSCB_Parser = require("./parser");

module.exports = class TSCB
{
    static parseTSCB(filePath)
    {
        const fileLoader = new Binary_File.Loader();
        const tscbBuffer = fileLoader.buffer(filePath);

        const parser = new TSCB_Parser();
        return parser.parse(tscbBuffer);
    }

    static getSectionTilesByPos(tiles, lodScale, sectionMidpoint, sectionWidth)
    {
        const sectionWidthHalf = 0.5 + 0.50; // add an bit of size to get a edge around the section
        const lodScaleHalf = lodScale / 2.0;
        const sPos = [
            (sectionMidpoint.x / sectionWidth) / 6 * 12,
            (sectionMidpoint.z / sectionWidth) / 6 * 12,
        ];

        const resultTiles = [];
        for(let tile of tiles)
        {
            if(tile.lodScale == lodScale)
            {
                const tPos = tile.center;

                if((tPos[0] - lodScaleHalf) <= (sPos[0] + sectionWidthHalf) // X
                && (tPos[0] + lodScaleHalf) >= (sPos[0] - sectionWidthHalf)
                && (tPos[1] - lodScaleHalf) <= (sPos[1] + sectionWidthHalf) // Y
                && (tPos[1] + lodScaleHalf) >= (sPos[1] - sectionWidthHalf))
                {
                    resultTiles.push(tile);
                }
            }
        }

        return resultTiles;
    }

    static getTileGridRect(tiles, lodScale)
    {
        const lodScaleHalf = lodScale / 2.0;
        const tileGridRect = {
            min: [Infinity ,  Infinity],
            max: [-Infinity , -Infinity],
        }

        for(let tile of tiles)
        {
            if(tile.lodScale == lodScale)
            {
                if((tile.center[0] - lodScaleHalf) < tileGridRect.min[0]) // Min - X
                    tileGridRect.min[0] = (tile.center[0] - lodScaleHalf);

                if((tile.center[1] - lodScaleHalf) < tileGridRect.min[1]) // Min - Y
                    tileGridRect.min[1] = (tile.center[1] - lodScaleHalf);

                if((tile.center[0] + lodScaleHalf) > tileGridRect.max[0]) // Max - X
                    tileGridRect.max[0] = (tile.center[0] + lodScaleHalf);

                if((tile.center[1] + lodScaleHalf) > tileGridRect.max[1]) // Max - Y
                    tileGridRect.max[1] = (tile.center[1] + lodScaleHalf);
            }
        }

        return tileGridRect;
    }
};