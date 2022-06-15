import { v4 as uuidv4 } from 'uuid'
const localstorageKey = 'foxql-node-id'

function find()
{
    return localStorage.getItem(localstorageKey) || false
}

function set()
{
    localStorage.setItem(localstorageKey, uuidv4())
}

export default ()=> {
    if(!find()){
        set()
    }

    return find()
}