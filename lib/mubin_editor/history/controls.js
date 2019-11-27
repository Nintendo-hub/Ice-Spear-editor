/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const HTML_Loader = require("./../../html_loader");
const QuerySelector_Cache = require("./../../queryselector_chache");
const formatFilesize = require("filesize");

module.exports = class History_Controls
{
    constructor(history, uiNode)
    {
        this.history = history;
        this.uiNode = uiNode;
        this.uiNodeCache = new QuerySelector_Cache(this.uiNode);
        this.ready = false;
    }

    /**
     * loads and attaches the HTML view
     * @private
     */
    _attachView()
    {
        const historyControlsNode = new HTML_Loader('html/history_controls.html').create();
        this.uiNode.appendChild(historyControlsNode);
    }

    _attachEvents()
    {
        this.uiNodeCache.get(".data-history-posSlider").oninput = ev => {
            this.history.setPosition(ev.target.value);
            this.history.restore();
        };

        this.uiNodeCache.get(".data-history-undo").onclick = ev => this.undo();
        this.uiNodeCache.get(".data-history-redo").onclick = ev => this.redo();

        this.uiNodeCache.get(".data-history-clear").onclick = ev => {
            this.history.clear();
            this.history.add();
        };

        document.addEventListener("keydown", (ev) => {
            if(ev.ctrlKey) {
                switch(ev.key) {
                    case "z": this.undo(); break;
                    case "y": this.redo(); break;
                }
            }
        });
    }

    undo()
    {
        this.history.setPosition(this.history.getPosition() - 1);
        this.history.restore();
    }

    redo()
    {
        this.history.setPosition(this.history.getPosition() + 1);
        this.history.restore();
    }

    /**
     * creates the history view and adds controls
     */
    create()
    {
        this._attachView();
        this._attachEvents();
        this.ready = true;

        this.update(this.history);
    }

    update(history)
    {
        if(!this.ready)
            return;

        const posSlider = this.uiNodeCache.get(".data-history-posSlider");
        posSlider.max = this.history.count() - 1;
        posSlider.value = this.history.getPosition();

        this.uiNodeCache.get(".data-history-posCurrent").innerHTML = this.history.getPosition() + 1;
        this.uiNodeCache.get(".data-history-posTotal").innerHTML = this.history.count();
        this.uiNodeCache.get(".data-history-memSize").innerHTML = formatFilesize(this.history.getSize());
    }
};