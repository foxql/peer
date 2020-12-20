const name = 'answer';

async function listener (network, payload)
{
    const targetPeer = network.connections[payload.from];
    if(targetPeer){
        targetPeer.madeAnswer(payload.sdp);
    }
}

export default {
    name : name,
    listener : listener
};