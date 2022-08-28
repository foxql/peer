const databaseName = 'foxql-app-storage'

export default class {

    constructor()
    {
        this.status = 'waiting'
        this.request = null
        this.ready = false
        this.db = null
    }

    open({version, onupgradeneeded, onerror})
    {
        const indexedDb = indexedDB || window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB ||
        window.shimIndexedDB
        
        if(!indexedDb){
            this.status = 'IndexedDB could not be found in this browser.'
            return false
        }

        this.request = indexedDb.open(databaseName, version || 1)
        this.request.onerror = onerror.bind(this)
        this.request.onupgradeneeded = onupgradeneeded.bind(this)
        this.request.onsuccess = (e)=> {
            this.status = 'connected'
            this.ready = true
            this.db = e.target.result
        }
    }

    transaction(storeName, operation)
    {
        return this.db.transaction(storeName, operation)
    }
}