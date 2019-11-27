/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Section_Helper
{
    static sectionNameToCoords(sectionName)
    {
        const nums = sectionName.split("-");
        nums[0] = nums[0].charCodeAt() - "A".charCodeAt() - 1;
        nums[1] = parseInt(nums[1]);
        return nums;
    }

    static getSectionMidpoint(sectionName)
    {
        const [x,y] = Section_Helper.sectionNameToCoords(sectionName);
        return new THREE.Vector3(
            (x - 3.5) * 1000,
            300,
            (y - 4.5) * 1000
        );
    }
};