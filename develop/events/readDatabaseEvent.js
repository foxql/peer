export const listenerName = 'get-entry-by-id'

export async function listener({reply, id}, simulate = false)
{
    console.log(id, 'aranan id')
    if(simulate) { 
        console.log('Simulate state')
        // work on proof case
        return true 
    }
    
    const transaction = this.indexedDb.transaction('entrys', 'readwrite')
    const store = transaction.objectStore('entrys')
    const request = await store.get(id)
    request.onsuccess = (event) => {
        this.reply(reply, request.result)
    }
}

