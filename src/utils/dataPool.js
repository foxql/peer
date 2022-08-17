import sha256 from 'crypto-js/sha256.js'

export default class {

    constructor()
    {
        this.results = []
        this.nodes = {}
        this.nodeCount = 0
        this.currentResultIndex = 0

        this.hashMap = new Map()
    }

    encrypt(data)
    {
        return sha256(JSON.stringify(data)).toString()
    }

    push(data, nodeId)
    {
        const hash = this.encrypt(data)
        const currentIndex = this.currentResultIndex
        if(this.hashMap.has(hash)){
            let currentWeight = this.hashMap.get(hash)
            this.hashMap.set(hash,  {
                currentIndex: currentIndex - 1,
                weight: currentWeight.weight + 1
            })
            this.nodes[nodeId].push(currentIndex - 1)
            return true
        }

        this.results.push(data)
        this.nodes[nodeId].push(currentIndex)

        this.hashMap.set(hash, {
            weight: 0,
            resultIndex: currentIndex
        })
        this.currentResultIndex++
    }

    export()
    {
        return {
            results: {
                count: this.results.length,
                data: this.results,
                weight: this.hashMap.entries()
            },
            senders: {
                nodes: this.nodes,
                count: this.nodeCount
            }
        }
    }

    listen({data, nodeId})
    {
        this.createNode(nodeId)

        if(Array.isArray(data)){
            data.forEach(item => {
                this.push(item, nodeId)
            })

            return true
        }

        this.push(data, nodeId)
    }

    createNode(nodeId)
    {
        if(this.nodes[nodeId] === undefined) {
            this.nodes[nodeId] = []
            this.nodeCount++
        }
    }



}