/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const assert = require('assert');
global.requireGlobal = path => require("./../../../../" + path);
global.__BASE_PATH = process.cwd() + "/";

const History = requireGlobal("lib/mubin_editor/history/history");

describe('MubinEditor', () => {
describe('ActorEditor', () => {
describe('History', () =>
{
    describe('init', () => {
        it('should has an empty history, position at zero', () =>
        {
            const history = new History(() => {}, () => {});

            assert.equal(history.count(), 0);
            assert.equal(history.getPosition(), 0);
        });
    });

    describe('positioning', () => {
        it('should not go below zero', () =>
        {
            const history = new History(() => 42, () => {});

            assert.equal(history.getPosition(), 0);
            history.setPosition(-1);
            assert.equal(history.getPosition(), 0);
        });

        it('should not go above the maximum', () =>
        {
            const history = new History(() => 42, () => {});
            history.add();
            history.add();

            history.setPosition(0);
            assert.equal(history.getPosition(), 0);
            history.setPosition(2);
            assert.equal(history.getPosition(), 0);
        });

        it('should always save a number', () =>
        {
            const history = new History(() => 42, () => {});
            history.add();
            history.add();

            history.setPosition("1");
            assert.equal(history.getPosition(), 1);
            assert.equal(typeof history.getPosition(), "number");
        });
    });

    describe('adding history', () => {
        it('should get the new entry from the callback', () =>
        {
            let result = 42;
            const history = new History(() => result + "", () => {});

            history.add();
            result = 43;
            history.add();

            assert.equal(history.history[0], "42");
            assert.equal(history.history[1], "43");
        });

        it('should be ignored if the new entry evaluates to false', () =>
        {
            const history = new History(() => null, () => {});

            history.add();
            assert.equal(history.count(), 0);
        });
    });

    describe('undo history', () => {
        it('should ignore it if the history is empty', () =>
        {
            const history = new History(() => 42, () => {});
            history.restore = () => assert.fail("restore() was called");

            assert.equal(history.getPosition(), 0);
            history.undo();
            assert.equal(history.getPosition(), 0);
        });

        it('should set the position back', () =>
        {
            const history = new History(() => 42, () => {});
            history.restore = () => {};
            
            history.add();
            history.add();
            assert.equal(history.getPosition(), 1);
            history.undo();
            assert.equal(history.getPosition(), 0);
        });
        
        it('should call restore', () =>
        {
            let restoreCount = 0;
            const history = new History(() => 42, () => {});
            history.restore = () => ++restoreCount;
            
            history.add();
            history.add();
            history.undo();
            assert.equal(restoreCount, 1);
        });
    });

    describe('restoring history', () => {
        it('should ignore it if the history is empty', () =>
        {
            const history = new History(() => 42, () => {
                assert.fail("importFunction should not be called");
            });
            history.restore();
        });

        it('should import the current history', () =>
        {
            let importResult;
            let exportVal = 42;
            const history = new History(() => exportVal++, (val) => importResult = val);
            
            history.add(); // 43
            history.add(); // 44

            history.restore();
            assert(importResult, 44);
            history.restore();
            assert(importResult, 44);
        });

        it('should import the current history, with pos change', () =>
        {
            let importResult;
            let exportVal = 42;
            const history = new History(() => exportVal, (val) => importResult = val);
            
            history.add(); // 43
            history.add(); // 44

            history.setPosition(0);
            history.restore();
            assert(importResult, 43);
        });
    });

    describe('dropping history', () => {
        it('should not change the history if empty', () =>
        {
            const history = new History(() => 42, () => {});

            assert.equal(history.count(), 0);
            history.drop();
            assert.equal(history.count(), 0);
        });

        it('should not change the history if the pos. is at the end', () =>
        {
            const history = new History(() => 42, () => {});
            history.add();
            history.add();

            assert.equal(history.count(), 2);
            history.drop();
            assert.equal(history.count(), 2);
        });

        it('should remove the history after the current pos', () =>
        {
            const history = new History(() => 42, () => {});
            history.add();
            history.add();
            history.add();

            assert.equal(history.count(), 3);
            history.setPosition(1);
            history.drop();
            assert.equal(history.count(), 2);
        });

        it('it should never remove the first entry', () =>
        {
            const history = new History(() => 42, () => {});
            history.add(); 
            history.add();

            history.setPosition(0);
            history.drop();

            assert.equal(history.count(), 1);
            assert.equal(history.getPosition(), 0);

            history.drop();

            assert.equal(history.count(), 1);
            assert.equal(history.getPosition(), 0);
        });
    });

    describe('clear history', () => {
        it('should reset the history and pos. without restoring', () =>
        {
            const history = new History(() => 42, () => {});

            history.add();
            history.add();
            history.clear();
            
            assert.equal(history.history.length, 0);
            assert.equal(history.historyPos, 0);
        });
    });
    
    describe('change callback', () => {
        it('should be called 1 time while adding an entry', () =>
        {
            let changeCount = 0;
            const history = new History(() => 42, () => {}, () => ++changeCount);

            assert.equal(changeCount, 0);
            history.add();
            assert.equal(changeCount, 1);
        });

        it('should be called while setting a new pos.', () =>
        {
            let changeCount = 0;
            const history = new History(() => 42, () => {}, () => ++changeCount);

            assert.equal(changeCount, 0);
            history.add();
            history.add();
            assert.equal(changeCount, 2);
            history.setPosition(0);
            assert.equal(changeCount, 3);
        });

        it('should be at undo (if it actually does something)', () =>
        {
            let changeCount = 0;
            const history = new History(() => 42, () => {}, () => ++changeCount);

            assert.equal(changeCount, 0);
            history.undo();
            assert.equal(changeCount, 0);

            history.add();
            history.add();
            assert.equal(changeCount, 2);
            history.undo();
            assert.equal(changeCount, 3);
        });

        it('should called on a restore (if it actually does something)', () =>
        {
            let changeCount = 0;
            const history = new History(() => 42, () => {}, () => ++changeCount);

            assert.equal(changeCount, 0);
            history.restore();
            assert.equal(changeCount, 0);

            history.add();
            history.add();
            assert.equal(changeCount, 2);

            history.setPosition(0);
            assert.equal(changeCount, 3);

            history.restore();
            assert.equal(changeCount, 4);
        });

        it('should be called while dropping history (if it actually does something)', () =>
        {
            let changeCount = 0;
            const history = new History(() => 42, () => {}, () => ++changeCount);

            assert.equal(changeCount, 0);
            history.drop();
            assert.equal(changeCount, 0);

            history.add();
            history.add();
            assert.equal(changeCount, 2);
            history.setPosition(0);
            assert.equal(changeCount, 3);

            history.drop();
            assert.equal(changeCount, 4);
        });
        
        it('should call at reset', () =>
        {
            let changeCount = 0;
            const history = new History(() => 42, () => {}, () => ++changeCount);

            history.add();
            history.add();

            assert.equal(changeCount, 2);

            history.clear();

            assert.equal(changeCount, 3);
        });
    });

});});});