import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
const localstorageKey = 'foxql-node-id'



function find()
{
    try {
        return localStorage.getItem(localstorageKey) || false
    }catch(e){
        return false
    }
    
}

function set()
{
    try {
        localStorage.setItem(localstorageKey, uuidv4())
    }catch(e){
        return uuidv4()
    }
}

export default (cache)=> {
    if(!cache) {
        return uuidv4()
    }

    if(!find()){
        return set()
    }

    return find()
}