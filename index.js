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
    
        this.networkStableConnectionSize = 35;
        this.networkMaxConnectionSize = 70;
        
        this.myPeerId = null;
    
        this.iceServers = [
            {url:'stun:stun.l.google.com:19302'},
            {
                url: 'turn:206.81.16.7:3478',
                credential: 'foxql',
                username: 'foxql'
            }
        ];
    
        this.avaliableUseKeys = [
            'socketOptions',
            'maxConnections'
        ];

        this.simulatedListenerDestroyTime = 650;
        this.simulatedListenerAfterDatachannelTimeout = 1200;

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

                if(!targetMethod) return;
                

                const targettingPeer = eventObject.data._by;

                const process = await targetMethod[0](eventObject.data);

                if(this.connections[targettingPeer] == undefined) { // if not connected.
                    eventObject.data._simulate = true;
                    if(process) {
                        this.simulationIsDone(eventObject);
                    }
                }
            });


            //this.socket.emit('call', this.networkStableConnectionSize);
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
        let currentRetryCount = 0;
        return new Promise((resolve)=>{
            if(this.stableConnectionCount() > 0){
                resolve(true);
                return;
            }
            let timer = setInterval(()=>{
                if(currentRetryCount > 23) {
                    resolve(true)
                    clearInterval(timer)
                    return;
                }
                if(this.stableConnectionCount() > 0) {
                    resolve(true)
                    clearInterval(timer)
                }
                currentRetryCount++;
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
                        this.connections[id]
                        continue
                    }
                    if(channel.readyState !== 'open') {
                        delete this.connections[id]
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

    stableConnectionCount()
    {
        const connections = Object.values(this.connections);
        return [].concat(...connections).filter(connection =>{
            if(connection.dataChannel.readyState == 'open') {
                return true;
            }
        }).length
    }

}


export default foxqlPeer
