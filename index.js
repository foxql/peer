import 'regenerator-runtime/runtime'
import bridge from './src/bridge'
import signallingServer from './src/signalling'
import sha256 from 'crypto-js/sha256'
class p2pNetwork extends bridge{
    constructor({bridgeServer})
    {
        super(bridgeServer)
        this.signallingServers = {}
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
        if(this.existSignallingServer(key)) { // signalling Server not found
            return false 
        }

        this.signallingServers[key] = new signallingServer(host)

    }

    existSignallingServer(key)
    {
        return this.signallingServers[key] !== undefined ? true : false
    }
}


export default p2pNetwork
