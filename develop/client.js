import network from '../index.js';
import events from './events'

const p2p = new network({
    bridgeServer: {
        host: 'http://127.0.0.1:1923'
    },
    discoverySettings: {
        isolated: false
    }
});

p2p.loadEvents(events)

p2p.start()

setTimeout(()=> {
    p2p.pow({
        transportPackage: {
            p2pChannelName: 'give-me-your-name'
        },
        livingTime: 1000
    })
}, 1000)

window.p2p = p2p;