/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

const loadTerrainTextures = require("./../loader/texture");
const getTerrainShader = require("./terrain_shader");

//const MAP_HEIGHT_SCALE = 0.012179;
const MAP_HEIGHT_SCALE = 0.0122075;

const MAP_TILE_LENGTH = 256;
const MAP_TILE_SIZE = MAP_TILE_LENGTH * MAP_TILE_LENGTH;
const INDEX_COUNT_SIDE = MAP_TILE_LENGTH - 1;

const MAP_TILE_LENGTH_WATER = MAP_TILE_LENGTH / 4.0;
const MAP_TILE_SIZE_WATER = MAP_TILE_LENGTH_WATER * MAP_TILE_LENGTH_WATER;
const INDEX_COUNT_SIDE_WATER = MAP_TILE_LENGTH_WATER - 1;

const TEXTURE_INDEX_MAP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 17, 18, 0, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 7, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 0, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82];
const TEXTURE_UV_MAP = [[0.1, 0.1], [0.05, 0.05], [0.1, 0.1], [0.04, 0.04], [0.05, 0.05], [0.1, 0.1], [0.05, 0.05], [0.05, 0.05], [0.1, 0.1], [0.1, 0.1], [0.05, 0.05], [0.09, 0.09], [0.05, 0.05], [0.1, 0.1], [0.2, 0.2], [0.14, 0.14], [0.05, 0.05], [0.05, 0.05], [0.05, 0.05], [0.05, 0.05], [0.05, 0.05], [0.07, 0.07], [0.07, 0.07], [0.05, 0.05], [0.15, 0.15], [0.1, 0.1], [0.1, 0.1], [0.07, 0.07], [0.04, 0.04], [0.05, 0.16], [0.03, 0.03], [0.05, 0.05], [0.05, 0.05], [0.03, 0.03], [0.05, 0.05], [0.45, 0.45], [0.2, 0.2], [0.1, 0.1], [0.59, 0.59], [0.15, 0.15], [0.2, 0.2], [0.35, 0.35], [0.2, 0.2], [0.1, 0.1], [0.15, 0.15], [0.2, 0.2], [0.15, 0.15], [0.2, 0.2], [0.05, 0.05], [0.05, 0.05], [0.05, 0.05], [0.05, 0.05], [0.05, 0.05], [0.1, 0.1], [0.1, 0.1], [0.05, 0.05], [0.05, 0.05], [0.05, 0.05], [0.1, 0.1], [0.08, 0.08], [0.04, 0.04], [0.1, 0.1], [0.05, 0.05], [0.05, 0.05], [0.1, 0.1], [0.25, 0.25], [0.04, 0.05], [0.08, 0.08], [0.08, 0.08], [0.2, 0.2], [0.1, 0.1], [0.15, 0.15], [0.04, 0.04], [0.25, 0.25], [0.05, 0.05], [0.15, 0.15], [0.05, 0.05], [0.08, 0.08], [0.1, 0.1], [0.07, 0.07], [0.05, 0.05], [0.23, 0.23], [0.16, 0.16], [0.16, 0.16], [0.04, 0.04], [0.1, 0.1], [0.05, 0.05], [0.1, 0.1]];

let staticIndexBuffer = undefined;
let staticWaterIndexBuffer = undefined;

module.exports = class Terrain_Mesh_Creator
{
    constructor(gamePath, cachePath, gl, loader)
    {
        this.gamePath = gamePath;
        this.cachePath = cachePath;
        this.gl = gl;
        this.loader = loader;

        this.textureArray = undefined;
    }

    async loadTerrainTexture()
    {
        this.textureArray = await loadTerrainTextures(this.gamePath, this.cachePath, this.gl);
    }

    async createTileMesh(meshBuffer, waterBuffer, materialBuffer)
    {
        const meshArray = [];

        const vertexBuffer = this._createVertexBuffer(meshBuffer);
        const uvBuffer = this._createUvBuffer(materialBuffer);
        const texIndexBuffer = this._createTexIndexBuffer(materialBuffer);
        const terrainShader = await getTerrainShader(this.textureArray);
        staticIndexBuffer = staticIndexBuffer || this._createIndexBuffer();
        meshArray.push(await this._createSingleMesh(vertexBuffer, staticIndexBuffer, uvBuffer, texIndexBuffer, terrainShader));

        if(waterBuffer)
        {
            const vertexWaterBuffer = this._createWaterVertexBuffer(waterBuffer, 1);
            staticWaterIndexBuffer = staticWaterIndexBuffer || this._createIndexBuffer(INDEX_COUNT_SIDE_WATER, MAP_TILE_LENGTH_WATER);
            const waterShader = new THREE.MeshNormalMaterial( { transparent: true, opacity: 0.3 } );
            meshArray.push(await this._createSingleMesh(vertexWaterBuffer, staticWaterIndexBuffer, uvBuffer, texIndexBuffer, waterShader));
        }

        return meshArray;
    }

    async _createSingleMesh(vertexBuffer, indexBuffer, uvBuffer, texIndexBuffer, shader)
    {
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3 ));
        geometry.addAttribute('materialMap', new THREE.BufferAttribute(texIndexBuffer, 3, false));
        geometry.addAttribute('uvMap', new THREE.BufferAttribute(uvBuffer, 4));

        geometry.setIndex(new THREE.BufferAttribute(indexBuffer, 1));

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh( geometry, shader );
        mesh.name = "field-tile";
        return mesh;
    }

    _createWaterVertexBuffer(meshBuffer)
    {
        const vertexBuffer = new Float32Array(MAP_TILE_SIZE_WATER * 3);
        const h = [];
        let vertexIndex = 0;
        let bufferIndex = 0;
        for(let y=0; y<MAP_TILE_LENGTH_WATER; ++y)
        {
            const normY = y / INDEX_COUNT_SIDE_WATER;
    
            for(let x=0; x<MAP_TILE_LENGTH_WATER; ++x)
            {
                //const heightValue = meshBuffer[bufferIndex++] * MAP_HEIGHT_SCALE;
                const heightValue = meshBuffer.readUInt16LE(bufferIndex) * MAP_HEIGHT_SCALE;
                h.push(heightValue);
                bufferIndex += 8;
    
                vertexBuffer[vertexIndex++] = x / INDEX_COUNT_SIDE_WATER - 0.5;
                vertexBuffer[vertexIndex++] = heightValue;
                vertexBuffer[vertexIndex++] = normY - 0.5;
            }
        }

        return vertexBuffer;
    }

    _createVertexBuffer(meshBuffer)
    {
        const vertexBuffer = new Float32Array(MAP_TILE_SIZE * 3);
    
        let vertexIndex = 0;
        let bufferIndex = 0;
        for(let y=0; y<MAP_TILE_LENGTH; ++y)
        {
            const normY = y / INDEX_COUNT_SIDE;
    
            for(let x=0; x<MAP_TILE_LENGTH; ++x)
            {
                const heightValue = meshBuffer.readUInt16LE(bufferIndex) * MAP_HEIGHT_SCALE;
                bufferIndex += 2;
    
                vertexBuffer[vertexIndex++] = x / INDEX_COUNT_SIDE - 0.5;
                vertexBuffer[vertexIndex++] = heightValue;
                vertexBuffer[vertexIndex++] = normY - 0.5;
            }
        }

        return vertexBuffer;
    }

    _createUvBuffer(materialBuffer)
    {
        const uvBuffer = new Float32Array(MAP_TILE_SIZE * 4);
        let matIndex = 0;
        let uvIndex = 0;
        const uvBaseScale = 100;

        for(let y=0; y<MAP_TILE_LENGTH; ++y)
        {
            const normY = y / INDEX_COUNT_SIDE;
    
            for(let x=0; x<MAP_TILE_LENGTH; ++x)
            {
                const normX =  x / INDEX_COUNT_SIDE;
                const uvScaleA = TEXTURE_UV_MAP[materialBuffer[matIndex]];
                const uvScaleB = TEXTURE_UV_MAP[materialBuffer[matIndex+1]];

                uvBuffer[uvIndex++] = uvBaseScale * normX * uvScaleA[0];
                uvBuffer[uvIndex++] = uvBaseScale * normY * uvScaleA[1];

                uvBuffer[uvIndex++] = uvBaseScale * normX * uvScaleB[0];
                uvBuffer[uvIndex++] = uvBaseScale * normY * uvScaleB[1];

                matIndex += 4;
            }
        }

        return uvBuffer;
    }

    _createIndexBuffer(indexCountSide = INDEX_COUNT_SIDE, tileLength = MAP_TILE_LENGTH)
    {
        const indiceCount = (indexCountSide) * (indexCountSide) * 2 * 3; // x*y, 2 triangles per square, 3 points per triangle
        const indexBuffer = new Uint32Array(indiceCount);

        let i = 0;
        for(let y=0; y<indexCountSide; ++y)
        {
            let indexTop    = (y  ) * tileLength;
            let indexBottom = (y+1) * tileLength;
                
            for(let x=0; x<indexCountSide; ++x)
            {
                indexBuffer[i++] = indexTop;
                indexBuffer[i++] = indexBottom;
                indexBuffer[i++] = indexBottom + 1;

                indexBuffer[i++] = indexBottom + 1;
                indexBuffer[i++] = indexTop + 1;
                indexBuffer[i++] = indexTop;

                ++indexTop;
                ++indexBottom;
            }
        }

        return indexBuffer;
    }

    _createTexIndexBuffer(materialBuffer)
    {
        const texIndexBuffer = new Uint32Array(materialBuffer.length / 4 * 3);
        let texIndexBufferIndex = 0;
        for(let i=0; i<materialBuffer.length; i+=4)
        {
            texIndexBuffer[texIndexBufferIndex++] = TEXTURE_INDEX_MAP[materialBuffer[i]]; // texture index 0
            texIndexBuffer[texIndexBufferIndex++] = TEXTURE_INDEX_MAP[materialBuffer[i+1]]; // texture index 1
            texIndexBuffer[texIndexBufferIndex++] = materialBuffer[i+2]; // texture weight
        }
        
        return texIndexBuffer;
    }
};