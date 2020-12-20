import enums from '../enums/validatorEnum.js';

const helper = {
    min : (min, data)=> {return data.length < min ? false : true},
    max : (max, data)=>{return data.length > max ? false : true},
    size : (size, data) => {return data.length !== size},
    type : (type, data)=> { return typeof data === type}
};

export default function(requirements, obj)
{
    if(!helper.type('object', obj)) return enums.DATA_TYPE;

    let fail = false;

    requirements.fields.forEach(field => {
        if( obj[field] == undefined) fail = true;
    });

    if(fail) return enums.REQUIREMENTS;

    const rules = requirements.rules;

    for(let field in rules){
        
        for(let rule in rules[field]) {

            if(helper[rule] == undefined) continue;

            if(!helper[rule](rules[field][rule], obj[field])) {
                return enums.VALIDATOR_METHOD_NOT_VALID;
            }

        }

    }

    return enums.SUCCESS;
    

    
}