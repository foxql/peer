import io from 'socket.io-client'
export default class {

    constructor(host)
    {
        this.host = host
        this.signallingStatus = 'not-ready'
        this.signallingSocket = null
        this.connectSignallingServer()
    }

    connectSignallingServer()
    {
        const socket = io(this.host)
        socket.on('connect', ()=> {
            this.signallingStatus = 'connected'
        })
        socket.on('disconnect', this.disconnectListener)
        this.signallingSocket = socket
    }

    disconnectListener()
    {
        this.signallingStatus = 'disconnect'
    }


}