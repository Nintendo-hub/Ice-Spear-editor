/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs  = require("fs");
const PNG = require("png-lib");

/**
 * Helper class for creating MTL mateiral files, used by the OBJ class
 */
module.exports = class ModelConverter_MTL
{
    constructor()
    {
        this.mtlFile = "";
        this.newLine = "\n";

        this.basePath = ".";
        this.indexOffset = 1;
    }

    addLine(text = "")
    {
        this.mtlFile += text + this.newLine;
    }

    /**
     * adds the MTL header
     * @param {String} modelName 
     */
    addHeader(modelName)
    {
        this.addLine("# Created by Ice-Spear");
        this.addLine("# https://gitlab.com/ice-spear-tools");
        this.addLine("# Version: " + electron.remote.app.getVersion());
        this.addLine("# Model-Name: " + modelName);
        this.addLine();
    }

    /**
     * converts and saves a texture as PNG to a file
     * @param {Object} surface surface object from the texture
     * @param {String} fileName file name (not path) including the file extension
     */
    saveTextureAsPNG(surface, fileName)
    {
        return;
        if(surface.imageBuffer != null)
        {
            let pngBuffer = PNG.encode(surface.imageBuffer, surface.sizeX, surface.sizeY);
            fs.writeFileSync(this.basePath + "/" + fileName, pngBuffer);
        }
    }

    /**
     * converts and adds a texture to the MTL file
     * @param {Object} material 
     */
    addTexture(material)
    {
        this.addLine("newmtl " + material.name);

        // Color settings, @TODO check if i can get these from the model data
        this.addLine("Ka 1.0 1.0 1.0");
        this.addLine("Kd 1.0 1.0 1.0");
        this.addLine("Ks 0.0 0.0 0.0");
        this.addLine("d 1.0");
        this.addLine("illum 2");

        // texture files
        for(let texRef of material.textureRef)
        {
            if(texRef.texture == null || texRef.texture.surface == null)
                continue;

            let texName = texRef.name;
            let fileName = texName + ".png";
            let type = texName.substr(-3).toLowerCase();
            switch(type)
            {
                case "alb":
                    this.addLine("map_Ka " + fileName);
                    this.addLine("map_Kd " + fileName);
                break;

                /* @NOTE: normal maps may have different UV coordinates, which OBJ/MTL can't handle
                case "nrm":
                    this.addLine("map_Bump " + fileName);
                break;
                */

                default:
                    continue; // don't save the texture file
                break;
            }

            this.saveTextureAsPNG(texRef.texture.surface, fileName);
        }

        this.addLine();
    }

    /**
     * Converts and saves a MTL file created from an object of models
     * it also converts and saves the included textures as PNG
     * @param {Object} models 
     * @param {String} path 
     * @param {String} modelName 
     */
    convert(models, path, modelName)
    {
        this.mtlFile = "";
        this.basePath = path;

        this.addHeader(modelName);

        for(let modelIndex in models)
        {
            if(models[modelIndex].material != null)
                this.addTexture(models[modelIndex].material);
        }

        this.addLine();
        fs.writeFileSync(this.basePath + "/" + modelName + ".mtl", this.mtlFile);
    }
}