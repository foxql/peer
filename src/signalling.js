import io from 'socket.io-client'
export default class {

    constructor(host, connectionCallback, eventSimulationListener)
    {
        this.host = host
        this.signallingStatus = 'not-ready'
        this.signallingSocket = null
        this.connectionCallback = connectionCallback
        this.eventSimulationListener = eventSimulationListener
        this.connectSignallingServer()
    }

    connectSignallingServer()
    {
        const socket = io(this.host)
        socket.on('connect', ()=> {
            this.signallingStatus = 'connected'
            this.connectionCallback(this.host)
        })
        socket.on('disconnect', this.disconnectListener)
        socket.on('eventSimulation', this.eventSimulationListener)
        this.signallingSocket = socket
    }

    disconnectListener()
    {
        this.signallingStatus = 'disconnect'
    }


}