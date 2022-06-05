export const listenerName = 'offer'

export async function listener(data, simulate = false)
{
    const {signature, from, sdp} = data
    const access = this.sigStore.find(signature)

    if(!access) return
    const offerNode = this.createNode(this.constantSignallingServer, from)
    offerNode.createAnswer(signature, sdp)
    
   /* const offerPeer = network.newPeer(payload.from);
    offerPeer.createAnswer(payload.sdp);
    network.connections[payload.from] = offerPeer;*/
}