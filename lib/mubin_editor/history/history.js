/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class History
{  
    /**
     * @param {Function} exportFunction sets the function that runs and returns the export
     * @param {Function} importFunction function to import a state again
     * @param {Function} changeFunction function that gets called when an internal change happened
     */
    constructor(exportFunction, importFunction, changeFunction = () => {})
    {
        this.exportFunction = exportFunction;
        this.importFunction = importFunction;
        this.changeFunction = changeFunction;

        this.history = [];
        this.historyPos = 0;
    }

    /**
     * resets the history
     */
    clear()
    {
        this.history = [];
        this.historyPos = 0;
        this.changeFunction(this);
    }

    /**
     * @returns {Number} number of history entries
     */
    count()
    {
        return this.history.length;
    }

    /**
     * returns the current position in the history, normally the last index
     * @returns {Number} index
     */
    getPosition()
    {
        return this.historyPos;
    }

    /**
     * sets the current history pos, limits are checked
     * @param {Number} pos 
     */
    setPosition(pos)
    {
        pos = parseInt(pos);
        if(pos >= 0 && pos < this.count())
        {
            this.historyPos = pos;
            this.changeFunction(this);
        }
    }

    /**
     * adds a new entry to the history
     */
    add()
    {
        const newEntry = this.exportFunction();

        if(newEntry) {
            this.drop();
            this.history.push(newEntry);    
            this.historyPos = this.history.length - 1;

            this.changeFunction(this);
        }
    }

    /**
     * goes back one entry and restores its state
     */
    undo()
    {
        if(this.historyPos > 0)
        {
            --this.historyPos;
            this.restore();
        }
    }

    /**
     * restores the state at the current position
     * by calling the provided import callback
     */
    restore()
    {
        if(this.historyPos >= 0 && this.history[this.historyPos])
        {
            this.importFunction(this.history[this.historyPos]);
            this.changeFunction(this);
        }
    }

    /**
     * drops all history positions after the current one
     */
    drop()
    {
        if(this.historyPos >= 0 && this.historyPos < this.history.length-1) 
        {  
            this.history.splice(this.historyPos + 1);
            this.changeFunction(this);
        }
    }

    /**
     * gets the size of the history
     * only works if the entry has a length attribute
     */
    getSize()
    {
        return this.history.reduce((size, entry) => size + (entry.length ? entry.length : 0), 0);
    }
};
