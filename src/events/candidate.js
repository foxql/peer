export const listenerName = 'candidate';

export async function listener (data, simulate = false)
{
    const {to, candidate, signature} = data

    console.log('candidate sinyali')

    return false
}