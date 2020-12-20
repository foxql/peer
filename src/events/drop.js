const name = 'drop';

async function listener (network, peerId)
{
    if(network.connections[peerId] !== undefined) {
        delete network.connections[peerId];
    }
}

export default {
    name : name,
    listener : listener
};