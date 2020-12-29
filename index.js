import 'regenerator-runtime/runtime'
import io from 'socket.io-client';
import eventList from './src/events.js';
import Peer from './src/untils/peer.js';

import dataModel from './src/models/dataModel.js';

class foxqlPeer {
    constructor()
    {

        this.socketOptions = {
            host : '127.0.0.1',
            port : 1923,
            protocol : 'http'
        };
    
        this.maxConnections = 5;
        this.myPeerId = null;
    
        this.iceServers = [
            {'urls': 'stun:stun.stunprotocol.org:3478'},
            {'urls': 'stun:stun.l.google.com:19302'}
        ];
    
        this.avaliableUseKeys = [
            'serverOptions',
            'maxConnections'
        ];

        this.connections = {};
    
        this.peerEvents = [];

        this.socket = io(`${this.socketOptions.protocol}://${this.socketOptions.host}:${this.socketOptions.port}`, {
            reconnection : false
        });   
        this.loadEvents();

        this.socket.on('connect', ()=>{
            /** Find a not connected users. */
            this.myPeerId = this.socket.id;
            this.socket.emit('call', this.maxConnections);
        });

    }

    onPeer(name, listener)
    {
        if(this.peerEvents[name] == undefined) this.peerEvents[name] = [];
        this.peerEvents[name].push(listener.bind(this));
    }

    emitPeer(name, data)
    {
        if(this.peerEvents[name] == undefined) return false;

        const callbackMethod = (callback) => {
            callback(data);
        };

        this.peerEvents[name].forEach(callbackMethod);
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
        data.data._by = this.myPeerId;
        const dataPackage = JSON.stringify(data);

        for(let id in currentConnections) {
            const peer = currentConnections[id];
            peer.send(dataPackage)
        }

    }

    send(id, data)
    {
        const validate = dataModel(data);

        if(validate.error) {return validate}

        const connection = this.connections[id] || false;
        if(!connection) return false;

        data.data._by = this.myPeerId;
        const dataPackage = JSON.stringify(data);

        connection.send(dataPackage);
    }

    newPeer(userId)
    {
        return new Peer(
            this.iceServers,
            this.socket,
            userId,
            this.emitPeer.bind(this)
        );
    }

}


export default foxqlPeer
