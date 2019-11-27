/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* special thanks to:
* @see http://mk8.tockdom.com/wiki/BFRES_(File_Format)
*/

module.exports = new (class BFRES_FileTypes
{
    constructor()
    {
        this.types = {
            FMDL         : 0,
            FTEX         : 1,
            FSKA         : 2,
            FSHU_SHADER  : 3,
            FSHU_COLOR   : 4,
            FSHU_TEXTURE : 5,
            FTXP         : 6,
            FVIS_BONE    : 7,
            FVIS_MATERIAL: 8,
            FSHA         : 9,
            FSCN         : 10,
            EMBEDDED     : 11
        };

        this.info = {};
        this.info[this.types.FMDL] = {
            name       : "FMDL",
            description: "Model data",
            editor     : "model",
            preload    : true,
            parser     : "./lib/bfres/fmdl/parser.js"
        };
        this.info[this.types.FTEX]= {
           name       : "FTEX",
           description: "Texture data",
           editor     : "texture",
           preload    : true,
           parser     : "./lib/bfres/ftex/parser.js"
        };
        this.info[this.types.FSKA]= {
           name       : "FSKA",
           description: "Skeleton animation",
           editor     : "hex"
        };
        this.info[this.types.FSHU_SHADER]= {
           name       : "FSHU",
           description: "Shader parameters",
           preload    : true,
           editor     : "shader_params",
           parser     : "./lib/bfres/fshu/parser.js"
        };
        this.info[this.types.FSHU_COLOR]= {
           name       : "FSHU",
           description: "Color animation",
           editor     : "hex"
        };
        this.info[this.types.FSHU_TEXTURE]= {
           name       : "FSHU",
           description: "Texture SRT animation",
           editor     : "hex"
        };
        this.info[this.types.FTXP]= {
           name       : "FTXP",
           description: "Texture pattern animation",
           editor     : "hex"
        };
        this.info[this.types.FVIS_BONE]= {
           name       : "FVIS",
           description: "Bone visibility animation",
           editor     : "hex"
        };
        this.info[this.types.FVIS_MATERIAL]= {
           name       : "FVIS",
           description: "Material visibility animation",
           editor     : "hex"
        };
        this.info[this.types.FSHA]= {
           name       : "FSHA",
           description: "Shape animation",
           editor     : "hex"
        };
        this.info[this.types.FSCN]= {
           name       : "FSCN",
           description: "Scene animation",
           editor     : "hex"
        };
        this.info[this.types.EMBEDDED]= {
           name       : "EMBEDDED",
           description: "Embedded file",
           editor     : "hex",
           preload    : true,
           parser     : "./lib/bfres/embeded/parser.js"
        };
    }
});
