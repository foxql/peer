const name = 'offer';

async function listener (network, payload)
{
    const offerPeer = network.newPeer(payload.from);
    offerPeer.createAnswer(payload.sdp);
    network.connections[payload.from] = offerPeer;
}

export default {
    name : name,
    listener : listener
};