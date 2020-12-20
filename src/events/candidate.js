const name = 'candidate';

async function listener (network, payload)
{
    const to = payload.to;

    const exist = network.peers.existConnection(to);
    if(!exist) {return false}

    const targettedPeer = network.peers.findConnectionById(to);
    if(!targettedPeer) {return false}

    targettedPeer.addIceCandidate(
        new RTCIceCandidate(payload.candidate)
    );

}

export default {
    name : name,
    listener : listener
};