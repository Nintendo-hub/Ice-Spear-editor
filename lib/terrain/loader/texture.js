/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");

const Binary_File = require("binary-file");
const BFRES_Parser = require('./../../bfres/parser');
const fs = require("fs-extra");

const TEXTURE_WITH = 1024;
const TEXTURE_HEIGHT = 1024;
const TEXTURE_SIZE = TEXTURE_WITH * TEXTURE_HEIGHT * 3;
const NUM_TEXTURES = 83;

/**
 * loads the textures directly from the bfres files
 * @param {string} terrainTexPath 
 * @param {Array<Buffer>} array of texture buffers
 */
async function loadTextureFromBfres(terrainTexPath)
{
    const bfresBuffer = (new Binary_File.Loader()).buffer(terrainTexPath);
    const parser = new BFRES_Parser(true);
    await parser.parse(bfresBuffer);

    const ftexSurface = parser.getTextureByName("MaterialAlb").surface;
    return ftexSurface.imageBuffers;
}

/**
 * writes all texture into one single file (always 332MB)
 * @param {Buffer} imageBuffer 
 * @param {string} textureCachePath 
 */
async function generateCache(imageBuffer, textureCachePath)
{
    await fs.writeFile(textureCachePath, imageBuffer);
}

/**
 * loads all textures from the cache file
 * @param {string} textureCachePath 
 * @param {Buffer} buffer of an array-texture
 */
async function loadFromCache(textureCachePath)
{
    return await fs.readFile(textureCachePath);
}

/**
 * creates an actual OpenGL/THREE.js texture from the buffer
 * @param {Buffer} imageBuffer 
 * @returns {WebGLTexture} WebGL2 array-texture
 */
function createTexture(gl, imageBuffer)
{
    const texArray = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texArray);

    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        gl.RGB,
        TEXTURE_WITH,
        TEXTURE_HEIGHT,
        NUM_TEXTURES,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        imageBuffer
    );
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

    return texArray;
}

/**
 * packs all image buffers into one and removes the alpha channel to save space
 * @param {Array<Object>} imageBuffers 
 * @returns {Buffer} combined buffer
 */
function packImageBuffers(imageBuffers)
{
    const buff = Buffer.alloc(TEXTURE_SIZE * NUM_TEXTURES);
    for(let i in imageBuffers)
    {
        buff.set(imageBuffers[i], i * TEXTURE_SIZE);
    }
    return buff;
}

/**
 * loads the terrain-texture files from the bfres file or from cache (if enabled)
 * @param {string} gamePath 
 * @param {string} cachePath if no path is provided, cache is disabled
 * @returns {WebGLTexture} WebGL2 array-texture
 */
module.exports = async (gamePath, cachePath, gl) =>
{
    const cacheEnabled = !!cachePath;
    const textureCachePath = path.join(cachePath, "terrain_textures.bin");

    let imageBuffer;
    if(cacheEnabled && await fs.exists(textureCachePath))
    {
        imageBuffer = await loadFromCache(textureCachePath);
    }else{
        const terrainTexPath = path.join(gamePath, "content", "Model", "Terrain.Tex1.sbfres");
        imageBuffer = await loadTextureFromBfres(terrainTexPath);
        imageBuffer = packImageBuffers(imageBuffer);

        if(cacheEnabled)
        {
            await generateCache(imageBuffer, textureCachePath);
        }
    }

    return createTexture(gl, imageBuffer);
};