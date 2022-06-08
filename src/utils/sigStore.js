import { v4 as uuidv4 } from 'uuid'
import sha256 from 'crypto-js/sha256'

export default class {

    constructor(maxCount)
    {
        this.maxNonce = 99999
        this.minNonce = 1
        this.letterCountForClue = 6
        this.maxSignatureCount = maxCount
        this.signatures = {}
        
        this.whiteList = {}
    }

    generate(destroyTime)
    {
        const uuidKey = uuidv4()
        const nonce = this.randomNonce()
        const key = sha256(uuidKey + nonce).toString()
        this.signatures[key] = nonce
        setTimeout(()=> {
            this.dropSignature(key)
        }, destroyTime)
        return {
            question: {
                uuid: uuidKey,
                startWith: key.substring(0, this.letterCountForClue)
            }
        }
    }

    dropSignature(key)
    {
        delete this.signatures[key]
    }

    find(key)
    {
        return this.signatures[key] || false
    }

    randomNonce()
    {
        return Math.floor(Math.random() * this.maxNonce) + this.minNonce
    }

    solveQuestion({uuid, startWith})
    {
        for(let nonce = this.minNonce; nonce <= this.maxNonce; nonce++){
            const key = sha256(uuid + nonce).toString()
            if(key.substring(0, this.letterCountForClue) == startWith){
                this.whiteList[key] = nonce
                this.dropWhiteList(key)
                console.log({
                    answer: key,
                    nonce: nonce
                })
                return {
                    answer: key,
                    nonce: nonce
                }
            }
        }
        return false
    }

    isvalid({answer, nonce})
    {
        const findNonce = this.signatures[answer] || false
        if(!findNonce) return false

        return findNonce === nonce
    }

    dropWhiteList(key)
    {
        setTimeout(() => {
            this.whiteList[key] = undefined
        }, 1000)
    }

    existWhiteList(key)
    {
        return this.whiteList[key] || false
    }


}