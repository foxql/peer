import validate from "../untils/validator.js";

const requirements = {
    fields : [
        'listener',
        'data'
    ],
    rules : {
        listener : {
            type : 'string',
            max : 30,
            min : 3
        },
        data : {
            type : 'object',
            min : 3,
            max : 1000
        }
    }
};


export default function(obj)
{
    return validate(requirements, obj);
}