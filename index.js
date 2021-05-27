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
    
        this.networkMaxConnectionSize = 40;
        this.socketConnection = false;
        this.maxSocketConnectionCheckInterval = 30;
        
        this.myPeerId = null;
    
        this.iceServers = [
            {urls:'stun:stun.l.google.com:19302'},
            {urls:'stun:stun4.l.google.com:19302'},
            {
                urls: 'turn:206.81.16.7:3478',
                credential: 'foxql',
                username: 'foxql'
            }
        ];
    
        this.avaliableUseKeys = [
            'socketOptions',
            'maxConnections'
        ];

        this.simulatedListenerDestroyTime = 450;

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
        this.socket = io(`${this.socketOptions.protocol}://${this.socketOptions.host}${this.socketOptions.port}`, {
            transports : ['websocket']
        });   

        this.loadEvents();

        this.socket.on('connect', ()=>{
            this.myPeerId = this.socket.id;
            this.socketConnection = true;

            this.socket.on('eventSimulation', async (eventObject)=>{
                const targetMethod = this.peerEvents[eventObject.listener] || false;

                if(!targetMethod) return;
                

                const targettingPeer = eventObject.data._by;

                if(this.connections[targettingPeer] == undefined) { // if not connected.
                    eventObject.data._simulate = true;
                    const process = await targetMethod[0](eventObject.data);
                    if(process) {
                        this.simulationIsDone(eventObject);
                    }
                }
            });
           // this.socket.emit('call', this.networkStableConnectionSize);
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

    async waitSocketConnection()
    {
        let retryCount = 0;

        return new Promise((resolve)=>{
            let interval = setInterval(()=>{
                if(retryCount > this.maxSocketConnectionCheckInterval){
                    resolve(false)
                    clearInterval(interval)
                    return false;
                }
                if(this.socketConnection) {
                    resolve(true)
                    clearInterval(interval)
                }
            },50);
        });
    }


    async broadcast(data)
    {
        if(!this.socketConnection){
            await this.waitSocketConnection();
        }

        const validate = dataModel(data);
        if(validate.error) {return validate}

        data.data._by = this.myPeerId;

        const simulatedPeerListener = RandomString();

        data.answerWaitingListener = simulatedPeerListener;

        this.socket.emit('eventSimulation', data);

        const dataPackage = JSON.stringify(data);

        let simulatedPeerIdList = [];

        this.socket.on(simulatedPeerListener, async (peerId)=>{
            const connectionList = Object.keys(this.connections);

            if(connectionList.length >= this.networkMaxConnectionSize) {
                this.closePeer(connectionList.shift())
            }

            const activePeerConnection = this.connections[peerId] || false;
            if(!activePeerConnection) {
                const peer = this.newPeer(peerId);
                peer.dataChannelQueue.push(dataPackage);
                peer.createOffer();
                this.connections[peerId] = peer;
                simulatedPeerIdList.push(peerId);
            }
        })

        return new Promise((resolve)=>{
            setTimeout(()=>{
                delete this.socket._callbacks['$'+simulatedPeerListener];
                const currentConnections = this.connections;
    
                for(let id in currentConnections) {
                    const peer = currentConnections[id];
                    const channel = peer.dataChannel;
                    if(channel == undefined) {
                        this.closePeer(id)
                        continue
                    }
                    peer.send(dataPackage)
                }  

                resolve(true)
            }, this.simulatedListenerDestroyTime);
        });
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


    async closePeer(id)
    {
        if(this.connections[id] == undefined) {return false;}

        this.connections[id].dataChannel.close();
        delete this.connections[id];
    }

}


export default foxqlPeer
