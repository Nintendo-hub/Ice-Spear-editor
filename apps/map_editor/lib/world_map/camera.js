/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const PicoGL = require("picogl");

const UNIFORM_INDEX_POS   = 0;
const UNIFORM_INDEX_SCALE = 1;

const moveScale = 0.0002;

const scaleLimitMin = 0.075;
const scaleLimitMax = 42.0;
const posLimit = {
    x: [-5, 6],
    y: [-5, 4.5]
};

const velocityMinVal = 0.00001;
const velocityReduce = 0.85; // 0.75;

const scaleBaseMulti = 0.025;
const scaleVelocityMinVal = 0.00001;
const scaleVelocityReduce = 0.85; // 0.75;

function clamp(val, min, max)
{
    return Math.min(max, Math.max(min, val));
}

module.exports = class Camera
{
    constructor(engine)
    {
        this.engine = engine;

        this.posBuffer   = new Float32Array([0.0, 0.0]);
        this.scaleBuffer = new Float32Array([scaleLimitMin, scaleLimitMin]);
        this.velocity = [0.0, 0.0];
        this.scaleVelocity = 0.0;

        this.cameraUniform = this.engine.createUniformBuffer([this.posBuffer, this.scaleBuffer]);
    }

    getUniformBuffer()
    {
        return this.cameraUniform;
    }

    getScale()
    {
        return this.scaleBuffer;
    }

    getPos()
    {
        return this.posBuffer;
    }

    onScroll(ev) 
    {
        let scaleMulti = ev.deltaY < 0.0 ? 1.0 : -1.0;
        this.scaleVelocity += scaleMulti * scaleBaseMulti;
    }

    onMove(ev)
    {
        if(ev.which == 0)return;

        const addCamVelocity = [
            ev.movementX *  moveScale,
            ev.movementY * -moveScale
        ];

        this.velocity[0] += addCamVelocity[0] / this.scaleBuffer[0];
        this.velocity[1] += addCamVelocity[1] / this.scaleBuffer[1];
    }

    update()
    {
        const frameScalar = this.engine.getFrameScale();

        if(Math.abs(this.velocity[0]) > velocityMinVal || Math.abs(this.velocity[1]) > velocityMinVal)
        {
            this.velocity[0] *= velocityReduce;
            this.velocity[1] *= velocityReduce;

            this.posBuffer[0] += this.velocity[0] * frameScalar;
            this.posBuffer[1] += this.velocity[1] * frameScalar;

            this.posBuffer[0] = clamp(this.posBuffer[0], posLimit.x[0], posLimit.x[1]);
            this.posBuffer[1] = clamp(this.posBuffer[1], posLimit.y[0], posLimit.y[1]);

            this.cameraUniform.set(UNIFORM_INDEX_POS, this.posBuffer).update();
        }

        if(Math.abs(this.scaleVelocity) > scaleVelocityMinVal)
        {
            this.scaleBuffer[0] += this.scaleBuffer[0] * this.scaleVelocity * frameScalar;
            this.scaleBuffer[1] += this.scaleBuffer[1] * this.scaleVelocity * frameScalar;
    
            this.scaleBuffer[0] = clamp(this.scaleBuffer[0], scaleLimitMin, scaleLimitMax);
            this.scaleBuffer[1] = clamp(this.scaleBuffer[1], scaleLimitMin, scaleLimitMax);
    
            this.cameraUniform.set(UNIFORM_INDEX_SCALE, this.scaleBuffer).update();

            this.scaleVelocity *= scaleVelocityReduce;
        }
    }
};