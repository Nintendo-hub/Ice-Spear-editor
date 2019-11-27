/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
module.exports = class Filter
{
    constructor(inputSearch, nodeSearch, rowSelector = "tr", valueSelector = ".search-value")
    {
        this.inputSearch   = inputSearch;
        this.nodeSearch    = nodeSearch;
        this.rowSelector   = rowSelector;
        this.valueSelector = valueSelector;

        this._initEvents();
    }

    _initEvents()
    {
        var that = this;
        this.inputSearch.onkeyup = function(ev)
        {
            that.filter(this.value);
        };

        this.inputSearch.onkeydown = function(ev)
        {
            if(ev.key == "Enter")
                that._triggerFilteredElement();
        };
    }

    _triggerFilteredElement()
    {
        let items = this.nodeSearch.querySelectorAll(this.rowSelector + ":not([hidden])");
        if(items.length > 0)
        {
            items[0].click();
        }
    }

    filter(text)
    {
        let isRegex = text[0] == "/";
        text = isRegex ? new RegExp(text.substr(1)) : text.toLowerCase();

        let items = this.nodeSearch.querySelectorAll(this.rowSelector);
        for(let item of items)
        {
            item.hidden = text != "";

            if(text == "")
                continue;

            if(this.valueSelector == null)
            {
                const htmlText = item.innerHTML;
                if(isRegex ? text.test(htmlText) : htmlText.toLowerCase().includes(text))
                    item.hidden = false;
            }else{
                let searchItems = item.querySelectorAll(this.valueSelector);
                for(let searchItem of searchItems)
                {
                    const htmlText = searchItem.innerHTML;
                    if(isRegex ? text.test(htmlText) : htmlText.toLowerCase().includes(text))
                    {
                        item.hidden = false;
                        break;
                    }
                }
            }
        }
    }
};
