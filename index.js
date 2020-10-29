import io from 'socket.io-client';
class foxqlPeer {

    serverOptions = {
        host : '127.0.0.1',
        port : 1923,
        protocol : 'http'
    };

    iceServers = [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ];

    avaliableUseKeys = [
        'serverOptions'
    ];

    clientId;
    serverConnection;

    constructor()
    {
        this.serverConnection = io(`${this.serverOptions.protocol}://${this.serverOptions.host}:${this.serverOptions.port}`);    
        this.clientId = this.serverConnection.id;

        this.serverConnection.on('connect', ()=>{
            this.serverConnection.emit('get-offer', 20);
            console.log('Connected!');
        });

        this.serverConnection.on('get-offer', (data)=>{
            console.log(data);
        });
        
    }

    use(nameSpace, values)
    {
        if(this.avaliableUseKeys.includes(nameSpace)) this[nameSpace] = {...this[nameSpace], ...values};
    }


}


export default foxqlPeer
