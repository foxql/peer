export const listenerName = 'give-me-your-name'

export async function listener(data, simulate = false)
{
    if(simulate) { 
        console.log('Simulate state')
        // work on proof case
        return true 
    }

    console.log('RTC Channel message', data)

}

