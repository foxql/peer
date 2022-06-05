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
        const socket = io(this.host, {transports : ['websocket']})
        socket.on('connect', ()=> {
            this.signallingStatus = 'connected'
            this.connectionCallback(this.host)
        })
        socket.on('disconnect', this.disconnectListener)

        if(typeof this.eventSimulationListener === 'function') {
            socket.on('eventSimulation', this.eventSimulationListener)
        }
        
        
        this.signallingSocket = socket
    }

    loadEvents(eventList, parent)
    {
        eventList.forEach( ({listener, listenerName}) => {
            this.signallingSocket.on(listenerName, listener.bind(parent))
        });
    }   

    disconnectListener()
    {
        this.signallingStatus = 'disconnect'
    }


}