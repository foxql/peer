import { v4 as uuidv4 } from 'uuid'

export default class {

    constructor(maxCount)
    {
        this.maxSignatureCount = maxCount
        this.signatures = {}
    }

    generate(destroyTime)
    {
        const key = uuidv4()
        this.signatures[key] = 0

        setTimeout(()=> this.dropSignature(key), destroyTime)
        return key
    }

    dropSignature(key)
    {
        delete this.signatures[key]
    }

    find(key)
    {
        return this.signatures[key] || false
    }


}