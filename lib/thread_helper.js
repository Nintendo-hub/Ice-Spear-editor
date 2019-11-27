/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Thread_Helper
{
    /**
     * pauses the current thread without blocking it,
     * can be used to manually let the DOM renderer do it's work
     * @param {int} time 
     */
    pauseNonBlocking(time = 0)
    {
        time = parseInt(time);

        return new Promise((resolve) =>
        {
            if(time <= 0)
                setImmediate(() => resolve(true));
            else
                setTimeout(() => resolve(true), time);
        });
    }
};