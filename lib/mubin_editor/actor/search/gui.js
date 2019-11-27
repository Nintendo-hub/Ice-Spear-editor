/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const HTML_Loader = require("./../../../html_loader");
const Draggable = require('draggable');

module.exports = class Actor_Search_GUI
{
    constructor(uiNode, actorFinder)
    {
        this.uiNode = uiNode;
        this.actorFinder = actorFinder;
        this.windowNode = undefined;

        this.actorSearchHtml = new HTML_Loader('html/actor_search.html');
        this.isOpen = false;

        this.filter = {};
        this.searchValue = "";

        this._initGlobalActions();
    }

    open()
    {
        if(!this.isOpen)
        {
            this._createView();
            this._initFilters();
            this._initActions();
            this.isOpen = true;
        }
    }

    close()
    {
        this.filter = {};
        this.searchValue = "";

        this.uiNode.innerHTML = "";
        this.isOpen = false;
    }

    /**
     * creates the HTML from the template and appends it
     */
    _createView()
    {
        this.uiNode.appendChild(this.actorSearchHtml.create());

        this.windowNode = this.uiNode.querySelector("#searchWindow-actor");
        
        this.dragObj = new Draggable(this.windowNode, {
            filterTarget: (target) => target.classList.contains("drag-bar"),
            onDragStart: () => this.windowNode.classList.add("isMoving"),
            onDragEnd: () => this.windowNode.classList.remove("isMoving"),
            useGPU: true
        });

        this.dragObj.set(
            (document.body.clientWidth - this.windowNode.clientWidth) * 0.5,
            (document.body.clientHeight - this.windowNode.clientHeight) * 0.5,
        );

        this.resultNode = this.uiNode.querySelector(".data-resultTable");
        this.resultCount = this.uiNode.querySelector(".data-resultCount");
    }

    /**
     * triggers a search action
     */
    _triggerSearch()
    {
        const result = this.actorFinder.search(this.searchValue, this.filter);
        
        let i = 0;
        this.resultNode.innerHTML = result.reduce((resultHtml, actor) => {
            return resultHtml + `<tr data-actorIndex="${i++}" class="${actor.selected ? "active" : ""}">
                <td>${actor.getName()}</td>
                <td>${actor.getHashId()}</td>
                <td>${actor.getSRTHash()}</td>
                <td>${actor.type}</td>
            </tr>`;
        }, "");
    
        this.resultCount.innerHTML = result.length || 0;
    }

    _triggerSelectAll()
    {
        for(let row of this.resultNode.children) 
            row.classList.add("active");

        this.actorFinder.selectAll();
    }

    /**
     * initializes filter callbacks and arrays
     */
    _initFilters()
    {
        this.filter.limit = 100;

        const filterNodes = this.windowNode.querySelectorAll("button[data-filter]");
        for(let node of filterNodes) 
        {
            const filterName = node.getAttribute("data-filter");
            this.filter[filterName] = node.classList.contains("active");

            node.onclick = () => {
                if(this.filter[filterName] = !this.filter[filterName]) {
                    node.classList.add("active");
                }else{
                    node.classList.remove("active");
                }
                this._triggerSearch();
            };
        } 

        const searchInput = this.windowNode.querySelector(".data-searchValue");
        searchInput.onkeyup = ev => {
            this.searchValue = ev.target.value;
            this._triggerSearch();
        };
        searchInput.focus();

        this.windowNode.querySelector(".data-limit").onchange = ev => {
            this.filter.limit = parseInt(ev.target.value);
            this._triggerSearch();
        };
    }

    /**
     * inits actions-buttons
     */
    _initActions()
    {
        this.windowNode.querySelector(".data-tool-selectAll").onclick = () => this._triggerSelectAll();
        this.windowNode.querySelector(".data-tool-close").onclick = () => this.close();

        this.resultNode.onclick = ev => {
            for(const node of ev.path) {
                if(node instanceof HTMLTableRowElement) {

                    const actorIndex = node.getAttribute("data-actorIndex");

                    if(node.classList.contains("active")) {
                        this.actorFinder.deselectIndex(actorIndex);
                        node.classList.remove("active");
                    } else {
                        this.actorFinder.selectIndex(actorIndex);
                        node.classList.add("active");
                    }
                }
            }
        };
    }

    _initGlobalActions()
    {
        const actorSearchBtn = document.querySelector(".data-tool-openActorSearch");
        if(actorSearchBtn) {
            actorSearchBtn.onclick = () => this.open();
        }

        document.addEventListener("keydown", (ev) => {
            if(ev.ctrlKey && ev.key == "f") {
                this.close();
                this.open();
            }
        });
    }
};