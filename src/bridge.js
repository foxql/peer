import io from 'socket.io-client'
export default class {

    constructor({host})
    {
        this.host = host
        this.bridgeStatus = 'not-ready'
        this.bridgeSocket = null
    }

    connectBridge(callback)
    {
        const socket =  io(this.host)
        socket.on('connect', ()=> {
            this.bridgeStatus = 'connected'
            socket.emit('find-available-server', true)
        })

        socket.on('find-available-server', callback.bind(this))
        this.bridgeSocket = socket
    }

    transportMessage(data)
    {
        this.bridgeSocket.emit('transport', data)
    }


}