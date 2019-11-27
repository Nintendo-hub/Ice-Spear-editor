/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor_Raytracer
{
    /**
     * @param {Function} selectedCallback callback for selected actors
     */
    constructor(selectedCallback)
    {
        this.selectedCallback = selectedCallback;
    }

    /**
     * raytraces all objects pass into, 
     * and calls the callback function if anything was hit
     * @param {Object} raycaster 
     * @param {Array} castObjects object array to raycast
     * @param {bool} isMouseUp is the mouse button released
     * @param {bool} mouseMoved has the mouse moved while holding the mouse button
     */
    raytrace(raycaster, castObjects, isMouseUp, mouseMoved)
    {
        let currentDistance = Infinity;
        let hitInstance = undefined;

        for(let obj of castObjects.shrine)
        {
            const intersects = raycaster.intersectObject(obj, true);
            for(let intersect of intersects)
            {
                if(intersect.distance < currentDistance)
                {
                    currentDistance = intersect.distance;
                }
            }
        }

        for(let obj of castObjects.actor)
        {
            if(!obj.visible)
                continue;
            
            if(obj.userData.type == "actor" && obj.userData.actorObject)
            {
                const actorObj = obj.userData.actorObject;
                for(let entry of actorObj.instances)
                {
                    const instance = entry[1];

                    for(let objChild of obj.children)
                    {
                        let raycastMesh = new THREE.Mesh(objChild.geometry, "dummyTexture");
                        raycastMesh.applyMatrix(instance.matrix);
                        raycastMesh.updateMatrix();
                        raycastMesh.updateMatrixWorld();

                        const intersects = raycaster.intersectObject(raycastMesh, true);
                        if(intersects.length > 0 && intersects[0].distance < currentDistance)
                        {
                            currentDistance = intersects[0].distance;
                            hitInstance = instance;
                        }
                    }
                }
            }
        }

        if(isMouseUp || hitInstance)
        {
            this.selectedCallback(hitInstance ? [hitInstance] : [], isMouseUp, mouseMoved);
        }
    }
}
