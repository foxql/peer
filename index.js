import 'regenerator-runtime/runtime'
import io from 'socket.io-client';
import eventList from './src/events.js';
import Peer from './src/untils/peer.js';

class foxqlPeer {

    socketOptions = {
        host : '127.0.0.1',
        port : 1923,
        protocol : 'http'
    };

    maxConnections = 100;

    iceServers = [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ];

    avaliableUseKeys = [
        'serverOptions',
        'maxConnections'
    ];
    socket;

    user;

    constructor()
    {
        this.socket = io(`${this.socketOptions.protocol}://${this.socketOptions.host}:${this.socketOptions.port}`);   
        this.loadEvents();

        this.socket.on('connect', ()=>{
            const userId = this.socket.id;

            this.user = new Peer({
                userId : userId,
                options : {
                    iceServers : this.iceServers
                },
                socket : this.socket
            });

            /** Find a not connected users. */
            this.socket.emit('findNewNodes', this.maxConnections);
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


}


export default foxqlPeer
