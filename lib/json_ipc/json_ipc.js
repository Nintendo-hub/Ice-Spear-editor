/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const net = require('net');
const freePort = require("find-free-port");

const PORT_RANGE = [29400, 29900];
const DEFAULT_HOST = "127.0.0.1";

const MESSAGE_END_MARKER = "\x00\x00\xFF\xFF";

module.exports = class JSON_IPC
{
    constructor(name)
    {
        this.name = name;

        this.server = undefined;
        this.port = 0;
        this.callback = () => {};

        this.clients = {};
    }

    _savePortName(name, port)
    {
        localStorage.setItem("jsonIpc-portMapping-" + name, port);
    }

    _removePortName(name)
    {
        localStorage.removeItem("jsonIpc-portMapping-" + name);
    }

    _getPortName(name)
    {
        return localStorage.getItem("jsonIpc-portMapping-" + name);
    }

    async createServer(callback)
    {
        this.callback = callback;
        [this.port] = await freePort(PORT_RANGE[0], PORT_RANGE[1]);
        //this.port = 29401;

        console.log("JSON-IPC create server at port: " + this.port);
        this._savePortName(this.name, this.port);

        return new Promise((resolve, reject) => 
        {
            this.server = net.createServer((sock) =>
            {
                let completeData = '';
                sock.setEncoding('utf-8');

                sock.on('data', (data) => {
                    completeData += data;

                    if(completeData.includes(MESSAGE_END_MARKER))
                    {
                        const parts = completeData.split(MESSAGE_END_MARKER);
                        completeData = parts.pop();
                        for(let part of parts)
                        {
                            if(part.trim() == "")continue;

                            try{
                                const cmdData = JSON.parse(part);
                                this.callback(cmdData.name, cmdData.type, cmdData.data);
                            }catch(e){
                                console.error(`JSON-IPC data error: ${part}`);
                                console.error(e);
                            }
                        }   
                    }
                });

                sock.on('end', () => {});
                sock.on('close', () => {});
            });
            
            try{
                this.server.listen(this.port, DEFAULT_HOST, () => resolve());
            }catch(e){
                reject(e);
            }
        });
    }

    async _createClient(port)
    {
        return new Promise((resolve, reject) => 
        {
            const client = new net.Socket();

            client.connect(port, DEFAULT_HOST, () => {
                console.log(`JSON_IPC connected to: ${DEFAULT_HOST}:${port}`);
                resolve(client);
            });

            client.on('close', () => {
                console.log(`JSON-IPC client closed (Port: ${port})`);
            });

            client.on('error', (e) => {
                console.error(`JSON-IPC client error (Port: ${port})`);
                console.error(e);
                reject();
            });
        });
    }

    async send(name, type, data)
    {
        let client = this.clients[name];
        if(!client || !client.writable) // also check if closed
        {
            const port = this._getPortName(name);
            if(!port)return false;

            try{
                client = await this._createClient(port);
                this.clients[name] = client;
            }catch(e){
                console.error(e);
                return false;
            }
        }

        const cmdData = {type, name: this.name, data};
        client.write(JSON.stringify(cmdData));
        client.write(MESSAGE_END_MARKER);

        return true;
    }
}