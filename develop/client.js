import network from '../index.js';
import events from './events'
import * as dbConfig from './database'

const p2p = new network({
    maxNodeCount: 30,
    maxCandidateCallTime: 2000 // ms
});

p2p.setMetaData({
    name: 'test-node',
    description: 'test-desc'
})

p2p.loadEvents(events)

p2p.start(dbConfig)

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