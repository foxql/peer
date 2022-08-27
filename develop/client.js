import network from '../index.js';
import events from './events'
import * as dbConfig from './database'

const p2p = new network({
    maxNodeCount: 30,
    maxCandidateCallTime: 1000, // ms
    powPoolingtime: 500,
    dappAlias: 'test-dapp',
    wssOptions: {
        transport: ['websocket'],
        jsonp: false
    }
})

p2p.setMetaData({
    name: 'test-node',
    description: 'test-desc'
})

p2p.loadEvents(events)

p2p.start()

window.testPOW = async ()=> {
    const answer = await p2p.ask({
        transportPackage: {
            p2pChannelName: 'give-me-your-name',
            message: 'Hello world'
        },
        livingTime: 1500,
        stickyNode: true,
        localWork: false
    })
    console.log(answer)
}

window.addEntry = ()=> {
    const transaction = p2p.indexedDb.transaction('entrys', 'readwrite')
    const store = transaction.objectStore('entrys')
    store.put({
        content: 'My first content in stored indexedDB',
        id: 1
    })

    transaction.oncomplete = (e => {
        console.log(e)
    })
}

window.p2p = p2p;