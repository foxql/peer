import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
const localstorageKey = 'foxql-node-id'

function find()
{
    if(localStorage == undefined){
        return false
    }
    return localStorage.getItem(localstorageKey) || false
}

function set()
{
    const id = uuidv4()
    if(localStorage == undefined) {
        return id
    }
    localStorage.setItem(localstorageKey, id)
}

export default ()=> {
    if(!find()){
        set()
    }

    return find()
}