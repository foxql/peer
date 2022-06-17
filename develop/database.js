export const version = 1

export function onerror(e)
{
    console.error("An error occurred with IndexedDB");
    console.error(e);
}

export function onupgradeneeded(){
    //1
    const db = this.request.result;
    console.log(db)
    //2
    const store = db.createObjectStore("entrys", { keyPath: "id" });
  
    //3
    store.createIndex("cars_colour", ["colour"], { unique: false });
  
    // 4
    store.createIndex("colour_and_make", ["colour", "make"], {
      unique: false,
    }); 
  };