
async function listener(network, payload)
{
    network.user.answerMade(payload);
}

export default {
    name : 'answerMade',
    listener : listener
};