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
            {
                urls: ["turn:173.194.72.127:19305?transport=udp",
                "turn:[2404:6800:4008:C01::7F]:19305?transport=udp",
                "turn:173.194.72.127:443?transport=tcp",
                "turn:[2404:6800:4008:C01::7F]:443?transport=tcp"
                ],
                username:"CKjCuLwFEgahxNRjuTAYzc/s6OMT",
                credential:"u1SQDR/SQsPQIxXNWQT7czc/G4c="
            },
            {url:'stun:stun01.sipphone.com'},
            {url:'stun:stun.ekiga.net'},
            {url:'stun:stun.fwdnet.net'},
            {url:'stun:stun.ideasip.com'},
            {url:'stun:stun.iptel.org'},
            {url:'stun:stun.rixtelecom.se'},
            {url:'stun:stun.schlund.de'},
            {url:'stun:stun.l.google.com:19302'},
            {url:'stun:stun1.l.google.com:19302'},
            {url:'stun:stun2.l.google.com:19302'},
            {url:'stun:stun3.l.google.com:19302'},
            {url:'stun:stun4.l.google.com:19302'},
            {url:'stun:stunserver.org'},
            {url:'stun:stun.softjoys.com'},
            {url:'stun:stun.voiparound.com'},
            {url:'stun:stun.voipbuster.com'},
            {url:'stun:stun.voipstunt.com'},
            {url:'stun:stun.voxgratia.org'},
            {url:'stun:stun.xten.com'},
            {
                url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },
            {
                url: 'turn:192.158.29.39:3478?transport=udp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            },
            {
                url: 'turn:192.158.29.39:3478?transport=tcp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            }
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
            if(this.stableConnectionCount() > 0){
                resolve(true);
                return;
            }
            let timer = setInterval(()=>{
                if(this.stableConnectionCount() > 0) {
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
