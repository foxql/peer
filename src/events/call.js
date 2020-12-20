const name = 'call';

async function listener (network, peerList)
{
    peerList.forEach(peerId => {
        const peer = network.newPeer(peerId);
        peer.createOffer();

        network.connections[peerId] = peer;
    });
}

export default {
    name : name,
    listener : listener
};