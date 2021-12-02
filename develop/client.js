import network from '../index.js';
import events from './events'

const p2p = new network({
    bridgeServer: {
        host: 'http://127.0.0.1:1923'
    }
});

p2p.loadEvents(events)

p2p.start()



window.p2p = p2p;