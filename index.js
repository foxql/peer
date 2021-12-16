import 'regenerator-runtime/runtime'
import bridge from './src/bridge'
import signallingServer from './src/signalling'
import sha256 from 'crypto-js/sha256'
import { nodeId } from './src/utils'
import { v4 as uuidv4 } from 'uuid'
class p2pNetwork extends bridge{
    constructor({bridgeServer})
    {
        super(bridgeServer)
        this.signallingServers = {}
        this.events = {}
        this.status = 'not-ready'
        this.nodeId = nodeId()
    }

    start()
    {
        this.connectBridge(
            this.listenSignallingServer
        )
    }

    listenSignallingServer({host})
    {
        if(host === undefined) return false

        const key = sha256(host)
        if(this.existSignallingServer(key)) { // signalling Server is found
            return false 
        }

        this.signallingServers[key] = new signallingServer(host, ()=> {
            this.status = 'ready'
        })

    }

    existSignallingServer(key)
    {
        return this.signallingServers[key] !== undefined ? true : false
    }

    loadEvents(events)
    {
        events.forEach( ({listener, listenerName}) => {
            this.events[listenerName] = listener
        });
    }

    async pow({transportPackage, livingTime, ...params})
    {
        if(this.status !== 'ready') return {warning: this.status}

        const tempListenerName = uuidv4()
        
        this.bridgeSocket.on(tempListenerName, data => { // listen transport event result
            // todo p2p connection starting...
        })

        this.transportMessage({
            ...transportPackage,
            nodeId: this.nodeId,
            answerPool: tempListenerName
        })

    
    }



}


export default p2pNetwork
