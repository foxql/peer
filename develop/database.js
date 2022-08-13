export const version = 2

export function onerror(e)
{
    console.error("An error occurred with IndexedDB")
    console.error(e)
}

export function onupgradeneeded(){
    //1
    const db = this.request.result;
    //2
    const store = db.createObjectStore("entrys", { keyPath: "id" })
  
    //3
    store.createIndex("content", ["content"], { unique: true })
}