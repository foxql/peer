const name = 'drop';

async function listener (network, peerId)
{
    if(network.connections[peerId] !== undefined) {
        network.connections[peerId].dataChannel.close();
        delete network.connections[peerId];
    }
}

export default {
    name : name,
    listener : listener
};