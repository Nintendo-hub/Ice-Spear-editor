/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const swal = require('sweetalert2');

/**
 * class to check if all features for the renderer are available
 */
class Renderer_Check
{
    /**
     * Performs all checks and returns the status.
     * I addition to that, it will also show a message on any error
     * @returns {boolean} true on success
     */
    check()
    {
        const context = this.checkWebGL2();

        if(!context) {
            swal({
                title: "WebGL2 is not supported", 
                html: "Ice-Spear requires OpenGL 3.3 or higher.<br/>" 
                     +"You can continue using it,<br/>"
                     + "but most features won't work.",
                type: "warning" 
            });
            return false;
        }

        return true;
    }

    /**
     * tries to create a WebGL2 context
     * @returns {?WebGL2RenderingContext} context
     */
    checkWebGL2()
    {
        try{
            const canvas = document.createElement("canvas");
            return canvas.getContext("webgl2");
        } catch (e) {
            console.warn(e);
        }

        return undefined;
    }
}

module.exports = () => {
    const check = new Renderer_Check();
    return check.check();
};