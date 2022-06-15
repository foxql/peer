export const listenerName = 'answer'

export async function listener (data, simulated = false)
{
    const {from, sdp} = data
    
    const targetNode = this.nodes[from] || false

    if(!targetNode) return

    targetNode.p2p.setRemoteDescription({type: "answer", sdp: sdp})
}