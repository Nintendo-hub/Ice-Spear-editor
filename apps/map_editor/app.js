/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const App_Base = requireGlobal("./apps/base.js");
const World_Map = require("./lib/world_map/world_map");
const World_Map_UI = require("./lib/world_map/ui");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);
    }

    async run()
    {
        await super.run();

        this.mapUi = new World_Map_UI(mapOverlay);

        this.map = new World_Map(
            this.mapUi,
            this.config.getValue("game.path"),
            this.project.getCachePath(),
            this.loader
        );

        await this.loader.show();
        await this.map.load();
        await this.loader.hide();

        this.map.start();
    }
};
