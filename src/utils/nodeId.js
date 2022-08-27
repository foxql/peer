import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
const localstorageKey = 'foxql-node-id'

function find()
{
    return localStorage.getItem(localstorageKey) || false
}

function set()
{
    localStorage.setItem(localstorageKey, uuidv4())
}

export default (cache)=> {
    if(!cache) {
        return uuidv4()
    }

    if(!find()){
        set()
    }

    return find()
}