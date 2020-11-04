class Peer{

    options = {
        iceServers : {}
    };

    userId;
    peer;
    socket;

    connections = {};
    connectionLength = 0;

    events = {};
    connectionListenerIterval = 100;

    constructor({userId, options, socket})
    {
        this.socket = socket;
        this.options = {...this.options, ...options}

        this.userId = userId;
        this.peer = new RTCPeerConnection(this.options);
    }

    on(name, listener)
    {
        if(this.events[name] == undefined) this.events[name] = [];
        this.events[name].push(listener);
    }

    emit(name, data)
    {
        if(this.events[name] == undefined) return false;

        const callback = (callback) => {
            callback(data);
        };

        this.events[name].forEach(callback);
    }

    call(userList)
    {
        userList.forEach(async userId => {

            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));

            this.connections[userId] = {
                ready : false
            };

            this.connectionLength += 1;

            this.socket.emit('callUser',{
                offer : offer,
                to : userId
            });

        });
    }


    async transferOfferSdp(payload)
    {
        try {
            await this.peer.setRemoteDescription(
                new RTCSessionDescription(payload.offer)
            );

            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(answer));

            this.socket.emit('makeAnswer',{
                answer : answer,
                to : payload.socket
            });
        }catch(e)
        {
            console.log(e);
        }
    }

    async answerMade(payload)
    {
        try {

            await this.peer.setRemoteDescription(
                new RTCSessionDescription(payload.answer)
            );
            
            if(this.connections[payload.socket] === undefined){
                 this.call([payload.socket]);
            }else{
                this.connections[payload.socket] = {
                    ready : true
                };
            }

           

        }catch(e)
        {
            this.connectionLength -= 1;
            console.log(e);
        }
    }

}


export default Peer;