import sha256 from 'crypto-js/sha256'
export default class {

    constructor(maxCandidateCount)
    {
        this.candidatesMap = {}
        this.candidateCount = 0
        this.maxCandidateCount = maxCandidateCount || 35
    }

    push(nodeAddress)
    {
        const {nodeId, signallingServerAddress} = this.parseNodeAddress(nodeAddress)
        
        const signallingServerAddressHash = sha256(signallingServerAddress)

        let target = this.exist(signallingServerAddressHash)
        if(target) { // exist key
            target.push(nodeId, nodeId)
            this.candidateCount++
            return true
        }

        this.create(nodeId, signallingServerAddress, signallingServerAddressHash)

    }

    create(nodeId, signallingServerAddress, hash)
    {
        this.candidatesMap[hash] = {
            candidates : [nodeId],
            uri: signallingServerAddress
        }
        this.candidateCount++
    }

    exist(key)
    {
        return this.candidatesMap[key] || false
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





}