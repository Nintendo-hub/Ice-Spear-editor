/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const izi = require("izitoast");

const basicSettings = {
    position: 'topRight',
    timeout: 1000 * 2,
    theme: 'light'
};

module.exports = class Notify 
{
    static success(message, title = "") 
    {
        izi.show({
            ...basicSettings,
            message,
            title,
            icon: 'icon icon-check',
            iconColor: '#0f8a0d',
            color: 'green',
            position: 'topRight',
            timeout: 1000 * 2
        });
    }

    static info(message, title = "") 
    {
        izi.show({
            ...basicSettings,
            message,
            title,
            icon: 'icon icon-info-circled',
            iconColor: 'rgb(37, 131, 197)',
            color: 'blue',
            position: 'topRight',
            timeout: 1000 * 2
        });
    }

    static error(message, title = "") 
    {
        izi.show({
            ...basicSettings,
            message,
            title,
            icon: 'icon icon-alert',
            iconColor: 'rgb(226, 77, 77)',
            color: 'red',
            position: 'topRight',
            timeout: 1000 * 4
        });
    }
};