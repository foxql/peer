class Peer{
    constructor(options, socket, id, emitter)
    {
        this.channelName = 'foxql_native_channel'
        this.options = options;
        this.peerId = id;
        this.socket = socket;

        this.make(emitter);
    }

    make(emitter)
    {
        this.peer = new RTCPeerConnection(this.options)
        this.dataChannel = this.peer.createDataChannel(this.channelName, {negotiated: true, id: 0});
        this.dataChannel.onopen = this.dataChannelOpenHandler.bind(this);
        if(typeof emitter === 'function'){
            this.dataChannel.onmessage = (e)=>{
                const object = JSON.parse(e.data);
        
                const name = object.listener;
                const data = object.data;

                emitter(name, data);
            };
        }
    
        this.peer.oniceconnectionstatechange = e => console.log(this.peer.iceConnectionState);
    }

    dataChannelOpenHandler()
    {
        //console.log(`Data channel is ready ${this.peerId}`);
    }

    async send(message)
    {
        this.dataChannel.send(message);
    }

    async createOffer()
    {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        this.peer.onicecandidate = ({candidate}) => {
            if (candidate) return;

            this.socket.emit('offer', {
                to : this.peerId,
                offer : this.peer.localDescription.sdp
            });
        };
    }

    async createAnswer(offerSdp)
    {
        this.connectionStart = true;
        await this.peer.setRemoteDescription({type: "offer", sdp: offerSdp});
        const answer = await this.peer.createAnswer()
        await this.peer.setLocalDescription(answer);
        this.peer.onicecandidate = ({candidate}) => {
            if (candidate) return;
            this.socket.emit('answer', {
                to : this.peerId,
                offer : this.peer.localDescription.sdp
            });
        };
    }

    async madeAnswer(answerSdp)
    {
        this.peer.setRemoteDescription({type: "answer", sdp: answerSdp});
    }
}


export default Peer;