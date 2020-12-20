class Peer{
    channelName = 'foxql_native_channel'

    peer;
    dataChannel;
    socket;

    peerId;

    constructor(options, socket, id)
    {
        this.peerId = id;
        this.socket = socket;

        this.make(options);
    }

    make()
    {
        this.peer = new RTCPeerConnection(this.options)
        this.dataChannel = this.peer.createDataChannel(this.channelName, {negotiated: true, id: 0});
        this.dataChannel.onopen = this.dataChannelOpenHandler;
        this.dataChannel.onmessage = this.dataChannelOnMessage;

        this.peer.oniceconnectionstatechange = e => console.log(this.peer.iceConnectionState);
    }

    dataChannelOpenHandler()
    {
        console.log("Kanal istanbul açıldı");
    }

    dataChannelOnMessage(e)
    {
        console.log(`> ${e.data}`);
    }

    send(message)
    {
        this.dataChannel.send(message);
    }

    async createOffer()
    {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        this.peer.onicecandidate = ({candidate}) => {
            if (candidate) return;
            document.querySelector('#offer').value = this.peer.localDescription.sdp

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
            document.querySelector('#answer').value = this.peer.localDescription.sdp
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