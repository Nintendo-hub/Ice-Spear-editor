/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const PicoGL = require("picogl");

module.exports = class Mesh_Helper
{
    constructor(glApp)
    {
        this.glApp = glApp;
    }

    createQuadBuffers(size, uvFlipU = false, uvFlipV = false)
    {
        const bufferPos = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -size, -size,  size, -size,
             size,  size, -size,  size,
        ]));

        const uvStart = {u: uvFlipU ? 1.0 : 0.0, v: uvFlipV ? 1.0 : 0.0 };
        const uvEnd   = {u: uvFlipU ? 0.0 : 1.0, v: uvFlipV ? 0.0 : 1.0 };

        const bufferUv = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            uvStart.u, uvStart.v,   uvEnd.u, uvStart.v,
              uvEnd.u,   uvEnd.v, uvStart.u,   uvEnd.v
        ]));

        const bufferIdx = this.glApp.createIndexBuffer(PicoGL.UNSIGNED_INT, 3, new Uint32Array([
            0, 1, 2, 2, 3, 0
        ]));

        return {bufferPos, bufferUv, bufferIdx};
    }

    createQuad(size, uvFlipU = false, uvFlipV = false)
    {
        const meshData = this.createQuadBuffers(size, uvFlipU, uvFlipV);

        return this.glApp.createVertexArray()
            .indexBuffer(meshData.bufferIdx)
            .vertexAttributeBuffer(0, meshData.bufferPos)
            .vertexAttributeBuffer(1, meshData.bufferUv);
    }
};