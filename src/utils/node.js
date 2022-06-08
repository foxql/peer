const defaultDataChannelName = 'foxql-native-channel'

class node {

    constructor(iceServers, signallingServer, container)
    {
        this.iceServers = iceServers
        this.socket = signallingServer.signallingSocket
        this.id = null
        this.p2p = null
        this.channel = null
        this.waitingMessage = false
        this.container = container
    }

    async create(id)
    {   
        this.id = id
        const p2p = new RTCPeerConnection({
            iceServers : this.iceServers,
            sdpSemantics: "unified-plan"
        })

        this.channel = p2p.createDataChannel(defaultDataChannelName, {negotiated: true, id: 0})

        this.channel.onopen = this.handleDataChannelOpen.bind(this)
        this.channel.onmessage = this.handleDataChannelMessage.bind(this)
        p2p.oniceconnectionstatechange = e => console.log(p2p.iceConnectionState)
    
        this.p2p = p2p
    }

    handleDataChannelOpen()
    {
        console.log('Datachannel is ready', this.id)
    }

    async handleDataChannelMessage({data})
    {
        const parsedPackage = this.parsePackage(data)
        if(!parsedPackage) return false

        const {p2pChannelName} = parsedPackage

        const listener = this.container.findNodeEvent(p2pChannelName)

        if(!listener) return false

        await listener(parsedPackage, false)
    }   

    parsePackage(data)
    {
        try{
            return JSON.parse(data)
        }catch(e){
            return false
        }
    }

    send(message)
    {
        if(this.channel.readyState !== 'open') return false
        this.channel.send(JSON.stringify(message))
    }

    async createOffer(signature)
    {
        const offer = await this.p2p.createOffer()
        await this.p2p.setLocalDescription(offer)
        this.p2p.onicecandidate = ({candidate}) => {
            if (candidate) {
                this.sendCandidateSignall(signature, candidate)
                return;
            }
            this.socket.emit('offer', {
                to : this.id,
                offer : this.p2p.localDescription.sdp,
                signature: signature
            });
        }
    }

    async sendCandidateSignall(signature, candidate)
    {
        this.socket.emit('candidate', {
            candidate : candidate,
            to : this.id,
            signature: signature
        });
    }

    async createAnswer(signature, offerSdp)
    {
        await this.p2p.setRemoteDescription({type: "offer", sdp: offerSdp});
        const answer = await this.p2p.createAnswer()
        await this.p2p.setLocalDescription(answer);
        this.p2p.onicecandidate = ({candidate}) => {
            if (candidate) {
                this.sendCandidateSignall(signature, candidate)
                return
            }
            this.socket.emit('answer', {
                to : this.id,
                answer : this.p2p.localDescription.sdp,
                signature: signature
            })
        }
    }
}


export default node