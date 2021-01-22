import 'regenerator-runtime/runtime'
import io from 'socket.io-client';
import eventList from './src/events.js';
import Peer from './src/untils/peer.js';
import RandomString from './src/untils/random.js';

import dataModel from './src/models/dataModel.js';

class foxqlPeer {
    constructor()
    {

        this.socketOptions = {
            host : 'foxql-signal.herokuapp.com',
            port : null,
            protocol : 'https'
        };
    
        this.networkStableConnectionSize = 50;
        this.networkMaxConnectionSize = 100;
        
        this.myPeerId = null;
    
        this.iceServers = [
            {'urls': 'stun:stun.stunprotocol.org:3478'},
            {'urls': 'stun:stun.l.google.com:19302'}
        ];
    
        this.avaliableUseKeys = [
            'socketOptions',
            'maxConnections'
        ];

        this.simulatedListenerDestroyTime = 400;
        this.simulatedListenerAfterDatachannelTimeout = 400;

        this.connections = {};
        
    
        this.peerEvents = {};

    }

    open()
    {
        if(typeof this.socketOptions.port == 'number') {
            this.socketOptions.port = ':'+this.socketOptions.port 
        }else{
            this.socketOptions.port = '';
        }
        this.socket = io(`${this.socketOptions.protocol}://${this.socketOptions.host}${this.socketOptions.port}`);   

        this.loadEvents();

        this.socket.on('connect', ()=>{
            this.myPeerId = this.socket.id;

            this.socket.on('eventSimulation', async (eventObject)=>{
                const targetMethod = this.peerEvents[eventObject.listener] || false;
                const targettingPeer = eventObject.data._by;

                const process = await targetMethod[0](eventObject.data);

                if(this.connections[targettingPeer] == undefined) { // if not connected.
                    eventObject.data._simulate = true;
                    if(process) {
                        this.simulationIsDone(eventObject);
                    }
                }
            });


            this.socket.emit('call', this.networkStableConnectionSize);
        });
    }


    simulationIsDone(eventObject)
    {
        this.socket.emit('simulationDone', {
            to : eventObject.data._by,
            targetListener : eventObject.answerWaitingListener
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

    async waitPeer()
    {
        return new Promise((resolve)=>{
            let connectionLength = Object.keys(this.connections).length;
            if(connectionLength > 0){
                resolve(true);
                return;
            }
            let timer = setInterval(()=>{
                if(Object.keys(this.connections).length > 0) {
                    resolve(true)
                    clearInterval(timer)
                }
            }, 50);
        }); 
    }
    
    async broadcast(data)
    {
        const validate = dataModel(data);
        if(validate.error) {return validate}

        await this.waitPeer();

        data.data._by = this.myPeerId;

        const simulatedPeerListener = RandomString();

        data.answerWaitingListener = simulatedPeerListener;

        this.socket.emit('eventSimulation', data);

        let peerPool = [];
        this.socket.on(simulatedPeerListener, (peer)=>{
            peerPool.push(peer);
        })

        setTimeout(()=>{
            delete this.socket._callbacks['$'+simulatedPeerListener];

            if(peerPool.length <= 0) return;

            peerPool.forEach(peerId => {
                if(this.connections[peerId] == undefined) {
                    const peer = this.newPeer(peerId);
                    peer.createOffer();
                    this.connections[peerId] = peer;
                }
            });

            const currentConnections = this.connections;
            const dataPackage = JSON.stringify(data);

            setTimeout(()=>{
                for(let id in currentConnections) {
                    const peer = currentConnections[id];
                    const channel = peer.dataChannel;
                    if(channel == undefined) {
                        continue
                    }
                    if(channel.readyState !== 'open') {
                        continue;
                    }
                    peer.send(dataPackage)
                }
            }, this.simulatedListenerAfterDatachannelTimeout);
        }, this.simulatedListenerDestroyTime);

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
