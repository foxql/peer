export const listenerName = 'give-me-your-name'

export async function listener(data, simulate = false)
{
    console.log('Event is fired!', simulate)

    if(simulate) { 
        // work on proof case
        return true 
    }



}

