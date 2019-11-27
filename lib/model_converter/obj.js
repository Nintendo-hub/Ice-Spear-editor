/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs");
const MTL = require("./mtl.js");

module.exports = class ModelConverter_OBJ
{
    constructor()
    {
        this.objFile = "";
        this.newLine = "\n";

        this.indexOffset = 1;

        this.mtl = new MTL();
    }

    addLine(text = "")
    {
        this.objFile += text + this.newLine;
    }

    addHeader(modelName)
    {
        this.addLine("# Created by Ice-Spear");
        this.addLine("# https://gitlab.com/ice-spear-tools");
        this.addLine("# Version: " + electron.remote.app.getVersion());
        this.addLine("# Model-Name: " + modelName);
        this.addLine();
    }

    addVertexArray(vertices)
    {
        for(let i=0; i<vertices.length; i+=3)
            this.addLine(`v ${vertices[i]} ${vertices[i+1]} ${vertices[i+2]}`);
    }

    addUVArray(uvs)
    {
        for(let i=0; i<uvs.length; i+=2)
            this.addLine(`vt ${uvs[i]} ${1.0 - uvs[i+1]}`);
    }

    addIndexArray(indicies)
    {
        for(let i=0; i<indicies.length; i+=3)
        {
            let idx = [indicies[i]+this.indexOffset, indicies[i+1]+this.indexOffset, indicies[i+2]+this.indexOffset];
            this.addLine(`f ${idx[0]}/${idx[0]} ${idx[1]}/${idx[1]} ${idx[2]}/${idx[2]}`);
        }
    }

    addModel(model)
    {
        this.addLine();
        this.addLine(`# Model: ${model.name}`);
        this.addLine(`o ${model.name}`);

        if(model.material != null)
            this.addLine(`usemtl ${model.material.name}`);

        this.addVertexArray(model.vertexArray);
        this.addUVArray(model.uv0Array);
        this.addIndexArray(model.indexArray);
        this.addLine();

        this.indexOffset += model.vertexArray.length / 3;
    }

    convert(models, path, modelName)
    {
        this.mtl.convert(models, path, modelName);

        this.objFile = "";
        this.addHeader(modelName);

        this.addLine(`mtllib ${modelName}.mtl`);

        for(let modelIndex in models)
            this.addModel(models[modelIndex]);

        this.addLine();
        fs.writeFileSync(path + "/" + modelName + ".obj", this.objFile);
    }
};
