/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const Config_Manager = require("./../config/manager.js");
var sanitizeFilename = require("sanitize-filename");

const PROJECT_CONFIG_NAME = "project.ice.json";

const PROJECT_DIRECTORIES = [
    "cache", 

    path.join("shrines", "unpacked"),
    path.join("shrines", "build"),
    path.join("shrines", "backup"),

    path.join("field", "data"),
    path.join("field", "backup"),

    path.join("logic"),

    path.join("terrain"),
];

/**
 * Handler for Project directories
 */
module.exports = class Project_Manager
{
    /**
     * @param {Main_Config} mainConfig 
     */
    constructor(mainConfig)
    {
        this.mainConfig = mainConfig;
        this.projectConfig = new Config_Manager();
        this.path = null;
        this.name = "default";
    }

    /**
     * returns the main config
     * @returns {Main_Config}
     */
    getConfig()
    {
        return this.mainConfig;
    }

    /**
     * creates an empty project inside a given directory
     * @param {string} projectPath 
     */
    async create(name)
    {
        const projectPath = path.join(this.mainConfig.getValue("projects.path"), sanitizeFilename(name));

        await this._fixProjectStructure(projectPath);

        const config = new Config_Manager();
        config.load(path.join(__dirname, "config-template.json"));

        config.setValue("name", name);
        config.setValue("ice-spear.version", process.env.npm_package_version);

        config.save(path.join(projectPath, PROJECT_CONFIG_NAME));
    }

    async open(name)
    {
        return await this.openPath(path.join(this.mainConfig.getValue("projects.path"), name));
    }

    async _fixProjectStructure(projectPath)
    {
        const projectDirPromises = [];
        for(const dirPath of PROJECT_DIRECTORIES)
        {
            projectDirPromises.push(fs.ensureDir(path.join(projectPath, dirPath)));
        }
        await Promise.all(projectDirPromises);
    }

    /**
     * opens a project directory
     * @param {String} path 
     */
    async openPath(projectPath)
    {
        if(!await this.isValidProjectPath(projectPath))
            return false;

        await this._fixProjectStructure(projectPath);
        this.projectConfig.load(path.join(projectPath, PROJECT_CONFIG_NAME));

        this.path = projectPath;
        console.log("Project opened: " + this.path);

        localStorage.setItem("current-project", this.path)
        this.mainConfig.pushValue("projects.lastOpened", this.path, true);
        this.mainConfig.save();

        return true;
    }

    async save()
    {
        this.projectConfig.setValue("ice-spear.version", process.env.npm_package_version);
        this.projectConfig.save();
    }

    async openCurrent()
    {
        const currentPath = localStorage.getItem("current-project");      
        if(currentPath) {
            return await this.openPath(currentPath);
        }
        return false;
    }

    /**
     * reopen the last used project
     * @param {Int} num optional index for the last used projects
     */
    async reopenLast(num = 0)
    {
        let lastProjects = this.mainConfig.getValue("projects.lastOpened");
        if(lastProjects[0] != null)
        {
            return await this.openPath(lastProjects[0]);
        }

        return false;
    }

    async listProjectNames()
    {
        const projectPath = this.mainConfig.getValue("projects.path");
        const projectNames = [];
        const files = await fs.readdir(projectPath);

        for(const file of files)
        {
            const fullPath = path.join(projectPath, file);

            if(await this.isValidProjectPath(fullPath))
                projectNames.push(file);
        }
        
        return projectNames.sort((a,b) => {
            a = a.toLowerCase();
            b = b.toLowerCase();
            return a == b ? 0 : (a < b ? -1 : 1);
        });
    }

    async isValidProjectPath(projectPath)
    {
        if(!await fs.exists(projectPath))
            return false;

        const fsStat = await fs.stat(projectPath);
        return (
            fsStat.isDirectory() && 
            await fs.exists(path.join(projectPath, PROJECT_CONFIG_NAME))
        );
    }

    getName()
    {
        return this.name;
    }

    /**
     * returns the cache directory of the current project
     * @returns {string} the full path
     */
    getCachePath()
    {
        return this.path ? path.join(this.path, "cache") : os.tmpdir();
    }

    /**
     * returns the path to shrine-data
     * @param {string} type type, (backup/build/unpacked)
     * @returns {string} the full path
     */
    getShrinePath(type = undefined)
    {
        if(!this.path)
            return os.tmpdir();

        if(["backup", "build", "unpacked"].includes(type))
        {
            return path.join(this.path, "shrines", type);
        }

        return path.join(this.path, "shrines");
    }

    /**
     * returns the path to field-data
     * @param {string} type type, (backup/data)
     * @returns {string} the full path
     */
    getFieldPath(type = undefined)
    {
        if(!this.path)
            return os.tmpdir();

        if(["backup", "data"].includes(type))
        {
            return path.join(this.path, "field", type);
        }

        return path.join(this.path, "field");
    }

    getLogicSavePath()
    {
        return path.join(this.path, "logic");
    }

    getPath()
    {
        return this.path || os.tmpdir();
    }
};