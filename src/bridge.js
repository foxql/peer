import io from 'socket.io-client'
export default class {

    constructor({host}, options)
    {
        this.host = host
        this.options = options
        this.bridgeStatus = 'not-ready'
        this.bridgeSocket = null
    }

    connectBridge(callback, dappAlias)
    {
        const socket = io(this.host, this.options)
        socket.on('connect', ()=> {
            this.bridgeStatus = 'connected'
            socket.emit('upgrade-dapp', dappAlias)
            socket.emit('find-available-server', true)
        })
        let interval = setInterval(()=> {
            if(this.status == 'ready'){
                clearInterval(interval)
                return
            }
            socket.emit('find-available-server', true)
        }, 700)
        socket.on('find-available-server', callback.bind(this))
        
        this.bridgeSocket = socket
    }

    transportMessage(data)
    {
        this.bridgeSocket.emit('transport', data)
    }


}