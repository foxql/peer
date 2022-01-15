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
        this.appName = window.location.hostname
        this.nodeAddress = null

        this.nodes = {}
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

        const signallingServerInstance = new signallingServer(host, ()=> {
            if(this.status === 'not-ready') { // if first signalling server connection
                this.generateNodeAddress(host)
            }
            this.status = 'ready'
        }, this.eventSimulation.bind(this))

        this.signallingServers[key] = signallingServerInstance

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

        const candidates = []
        
        this.bridgeSocket.on(tempListenerName, nodeId => { // listen transport event result
           
        })

        this.transportMessage({
            ...transportPackage,
            nodeId: this.nodeId,
            temporaryListener: tempListenerName,
            livingTime: livingTime
        })
    }

    async eventSimulation(eventObject)
    {
        const {eventPackage} = eventObject

        const {nodeId, p2pChannelName} = eventPackage
        
        if(nodeId === this.nodeId) return false

        if(this.findNode(nodeId)) return false // node currently connected.

        const listener = this.findNodeEvent(p2pChannelName) // find p2p event listener

        if(!listener) return false

        const simulateProcess = await listener(eventPackage, true)

        if(!simulateProcess) return false

        await this.sendSimulationDoneSignall(eventObject)
    }

    async sendSimulationDoneSignall(eventObject)
    {
        const {bridgePoolingListener} = eventObject
        this.bridgeSocket.emit('transport-pooling', {
            bridgePoolingListener: bridgePoolingListener,
            nodeId: this.nodeId
        })
    }

    findNodeEvent(listenerName)
    {
        return this.events[listenerName] || false
    }

    findNode(nodeId)
    {
        return this.nodes[nodeId] ? true : false
    }

    generateNodeAddress(signallingHostAddress)
    {
        const {protocol, hostname, port = 80} = new URL(signallingHostAddress)
        this.nodeAddress = `${this.nodeId}&${protocol.slice(0, -1)}&${hostname}&${port}`
    }



}


export default p2pNetwork
