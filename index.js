import 'regenerator-runtime/runtime'
import io from 'socket.io-client';
import eventList from './src/events.js';
import Peer from './src/untils/peer.js';

import dataModel from './src/models/dataModel.js';

class foxqlPeer {
    
    socketOptions = {
        host : '127.0.0.1',
        port : 1923,
        protocol : 'http'
    };

    maxConnections = 5;
    connectionListenerIterval = 100;

    iceServers = [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ];

    avaliableUseKeys = [
        'serverOptions',
        'maxConnections'
    ];
    socket;
    connections = {};

    constructor()
    {
        this.socket = io(`${this.socketOptions.protocol}://${this.socketOptions.host}:${this.socketOptions.port}`);   
        this.loadEvents();

        this.socket.on('connect', ()=>{
            /** Find a not connected users. */
            this.socket.emit('call', this.maxConnections);
        });

    }

    loadEvents()
    {
        eventList.forEach(event => {   
            this.socket.on(event.name, data => {event.listener(this, data)});
        });
    }

    use(nameSpace, values)
    {
        if(this.avaliableUseKeys.includes(nameSpace)) this[nameSpace] = {...this[nameSpace], ...values};
    }
    
    broadcast(data)
    {

        const validate = dataModel(data);

        if(validate.error) {return validate}

        const currentConnections = this.connections;
        const dataPackage = JSON.stringify(data);

        for(let id in currentConnections) {
            const peer = currentConnections[id];
            peer.send(dataPackage)
        }

    }

    newPeer(userId)
    {
        return new Peer(
            this.iceServers,
            this.socket,
            userId
        );
    }

}


export default foxqlPeer
