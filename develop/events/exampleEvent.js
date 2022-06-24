export const listenerName = 'give-me-your-name'

export async function listener({reply, message}, simulate = false)
{
    if(simulate) { 
        console.log('Simulate state')
        // work on proof case
        return true 
    }
    
    this.reply(reply, {
        my_name: 'bora' + this.nodeId
    })
}

