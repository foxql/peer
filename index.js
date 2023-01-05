import bridge from './src/bridge.js'
import signallingServer from './src/signalling.js'
import database from './src/database.js'
import sha256 from 'crypto-js/sha256.js'
import { node, sigStore, dataPool, crypto} from './src/utils/index.js'
import { bridgeNode } from './src/bootNodes.js'
import constantEvents from './src/events.js'
import pkg from 'uuid'

const { v4: uuidv4 } = pkg

class p2pNetwork extends bridge{
    constructor({bridgeServer, maxNodeCount, maxCandidateCallTime, powPoolingtime, iceServers, dappAlias, wssOptions})
    {
        super(bridgeServer || bridgeNode, wssOptions || {})
        this.wssOptions = wssOptions || {}
        this.signallingServers = {}
        this.events = {}
        this.replyChannels = {}
        this.status = 'not-ready'
        this.dappAlias = dappAlias
        this.nodeId = 'nothing'
        this.nodeAddress = null
        this.maxNodeCount = maxNodeCount
        this.maxCandidateCallTime = maxCandidateCallTime || 900 // 900 = 0.9 second
        this.powPoolingtime = powPoolingtime || 1000 // ms
        this.constantSignallingServer = null
        this.keyPair = null

        this.indexedDb = new database()

        this.nodeMetaData = {
            name: null,
            description: null
        }

        this.iceServers = iceServers || [
            {urls:'stun:stun.l.google.com:19302'},
            {urls:'stun:stun4.l.google.com:19302'}
        ];

        this.sigStore = new sigStore(maxNodeCount)

        this.nodes = {}
        this.connectedNodeCount = 0
        
    }

    async start({databaseListeners, keyPair})
    {

        if(keyPair == undefined) return false;

        this.connectBridge(
            this.listenSignallingServer,
            this.dappAlias
        )

        this.loadEvents(constantEvents)

        if(databaseListeners !== undefined){
            this.indexedDb.open(databaseListeners)
        }

        this.keyPair = keyPair
        const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
        this.nodeId = publicKey.n
    }

    listenSignallingServer({host}, simulationListener = true)
    {
        if(host === undefined) return false

        const key = sha256(host).toString()
        if(this.existSignallingServer(key)) { // signalling Server is found
            return key
        }
        const signallingServerInstance = new signallingServer(host, ()=> {
            if(this.status === 'not-ready') { // if first signalling server connection
                this.generateNodeAddress(host)
                this.constantSignallingServer = key
            }
            this.upgradeConnection(key)
            this.status = 'ready'
        }, simulationListener ? this.eventSimulation.bind(this) : null, this.wssOptions)

        const self = this

        signallingServerInstance.loadEvents(constantEvents, self)

        this.signallingServers[key] = signallingServerInstance

        return key
    }

    upgradeConnection(key)
    {
        this.signallingServers[key].signallingSocket.emit('upgrade', {
            nodeId: this.nodeId,
            dappAlias: this.dappAlias
        })
    }

    existSignallingServer(key)
    {
        return this.signallingServers[key] !== undefined ? true : false
    }

    loadEvents(events)
    {
        events.forEach( ({listener, listenerName}) => {
            this.on(listenerName, listener)
        });
    }

    on(listenerName, listener)
    {
        this.events[listenerName] = listener.bind(this)
    }

    async ask({transportPackage, livingTime = 1000, stickyNode = false, localWork = false})
    {
        if(this.status !== 'ready') return {warning: this.status}
        const tempListenerName = uuidv4()
        const {question} = this.sigStore.generate(this.maxCandidateCallTime)

        let powOffersPool = []

        this.temporaryBridgelistener(tempListenerName, (node)=> {powOffersPool.push(node)})

        this.transportMessage({
            ...transportPackage,
            nodeId: this.nodeId,
            temporaryListener: tempListenerName,
            livingTime: livingTime,
            nodeAddress: this.nodeAddress,
            powQuestion: question
        })

        await this.sleep(livingTime) // wait pool
        
        if(this.connectedNodeCount <= 0) return false

        const pool = new dataPool()

        const poollingListenerName = uuidv4()
        this.events[poollingListenerName] = (data) => {
            pool.listen(data)
            
            if(!stickyNode){
                const node = this.nodes[data.nodeId]
                node.close()
            }
        }

        transportPackage = {
            ...transportPackage,
            sender: {
                listener: poollingListenerName,
                nodeId: this.nodeId
            }
        }        

        let effectedNodes = localWork ? powOffersPool : this.nodes

        for(let nodeId in effectedNodes){
            const node = effectedNodes[nodeId] || false
            node.send(transportPackage)
        }

        await this.sleep(this.powPoolingtime)
        delete this.events[poollingListenerName]
        return pool.export()

    }

    temporaryBridgelistener(tempListenerName, callback)
    {
        this.bridgeSocket.on(tempListenerName, ({nodeAddress, powQuestionAnswer}) => { // listen transport event result

            if(!this.sigStore.isvalid(powQuestionAnswer)){
                return false
            }

            if(this.connectedNodeCount >= this.maxNodeCount) return false
            this.bridgeSocket.emit('pow-is-correct', powQuestionAnswer)
            const {nodeId, signallingServerAddress} = this.parseNodeAddress(nodeAddress)
            const signallHash = this.listenSignallingServer({host: signallingServerAddress}, false)
            const targetNode = this.createNode(signallHash, nodeId)
            targetNode.createOffer(powQuestionAnswer.answer, signallHash)
            callback(targetNode)
        })
    }

    async sleep(ms)
    {
        return new Promise((resolve)=> {
            setTimeout(()=> {
                resolve(true)
            }, ms)
        })
    }

    async eventSimulation(eventObject)
    {
        const {eventPackage, powQuestion} = eventObject
        const {nodeId, p2pChannelName} = eventPackage

        if(nodeId === this.nodeId) return false

        if(this.findNode(nodeId)) return false// node currently connected.

        const listener = this.findNodeEvent(p2pChannelName) // find p2p event listener

        if(!listener) return false

        const simulateProcess = await listener(eventPackage, true)

        if(!simulateProcess) return false

        const powQuestionAnswer = this.sigStore.solveQuestion(powQuestion)
        if(!powQuestionAnswer) return false

        await this.sendSimulationDoneSignall(powQuestionAnswer, eventObject)
    }

    async sendSimulationDoneSignall(powQuestionAnswer, eventObject)
    {
        const {bridgePoolingListener} = eventObject
        
        this.bridgeSocket.emit('transport-pooling', {
            bridgePoolingListener: bridgePoolingListener,
            nodeAddress: this.nodeAddress,
            powQuestionAnswer: powQuestionAnswer
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

    parseNodeAddress(nodeAddress)
    {
        const [nodeId, protocol, host, port] = nodeAddress.split('&')
        
        const signallingServerAddress = `${protocol}://${host}:${port}`

        return {
            nodeId,
            signallingServerAddress
        }

    }

    reply({nodeId, listener}, data)
    {
        const targetNode = this.nodes[nodeId] || false
        if(!targetNode) return false

        targetNode.send({
            p2pChannelName: listener,
            data: data,
            nodeId: this.nodeId
        })

        return true
    }

    createNode(signallHash, nodeId)
    {
        const candidateNode = new node(
            this.iceServers, 
            this.signallingServers[signallHash],
            this
        )

        candidateNode.create(nodeId)

        this.nodes[nodeId] = candidateNode
        this.connectedNodeCount +=1
        return candidateNode
    }

    setMetaData({name, description})
    {
        this.nodeMetaData = {
            name: name,
            description: description
        }
    }

    disconnect(id)
    {
        delete this.nodes[id]
        this.connectedNodeCount -= 1
    }
}


export default p2pNetwork

export const crypto = crypto
