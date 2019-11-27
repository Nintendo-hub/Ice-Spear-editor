/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Theme_Manager
{
    constructor(node, defaultTheme)
    {
        this.node        = node;
        this.NODE_FILTER = "[data-theme]";
        this.themeName   = defaultTheme;

        this.setTheme(defaultTheme);
    }

    _convertThemeString(text)
    {
        if(text == null || text == "")
            return "";

        let parts = text.split(".");
        if(parts.length > 1)
        {
            parts[parts.length - 2] = this.themeName;
        }

        return parts.join(".");
    }

    setTheme(name)
    {
        this.themeName = name;

        let elements = this.node.querySelectorAll(this.NODE_FILTER);
        for(let elem of elements)
        {
            let type = elem.getAttribute("data-theme");
            switch(type)
            {
                case "href":
                    let newName = this._convertThemeString(elem.href);
                    if(newName != elem.href)
                        elem.href = newName;
                break;
                default:
                    console.warn(`Theme_Manager: unknown element type '${type}'`);
                break;
            }
        }
    }
};
