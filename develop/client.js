import network from '../index.js';
import events from './events'

const p2p = new network({
    bridgeServer: {
        host: 'http://127.0.0.1:1923'
    },
    maxNodeCount: 30,
    maxCandidateCallTime: 2000 // ms
});

p2p.setMetaData({
    name: 'test-node',
    description: 'test-desc'
})

p2p.loadEvents(events)

p2p.start()

window.testPOW = async ()=> {
    const aa = await p2p.pow({
        transportPackage: {
            p2pChannelName: 'give-me-your-name',
            message: 'Hello world'
        },
        livingTime: 1500,
        stickyNode: false
    })
    console.log(aa)
}

window.p2p = p2p;