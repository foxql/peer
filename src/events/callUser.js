
async function listener(network, payload)
{
    network.user.transferOfferSdp(payload);
}

export default {
    name : 'callUser',
    listener : listener
};