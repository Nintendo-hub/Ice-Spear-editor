/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const path = require("path");

function getStat(filePath)
{
    return new Promise(function(resolve, reject){
        fs.lstat(filePath, function(err, stat){
            if(err) return reject(err);
            resolve(stat);
        });
    });
}

function getFiles(dir)
{
    return new Promise(function(resolve, reject){
        fs.readdir(dir, function(err, stat){
            if(err) return reject(err);
            resolve(stat);
        });
    });  
}
  
async function getSize(dirPath) 
{
    const stat = await getStat(dirPath);
    if(stat.isFile())
    { 
        return stat.size;
    }
    
    const files = await getFiles(dirPath);
    const promises = files.map(file => path.join(dirPath, file)).map(getSize);
    const childElementSizes = await Promise.all(promises);   

    let dirSize = 0;
    childElementSizes.forEach(size => dirSize += size);
    return dirSize;
}

module.exports = getSize;