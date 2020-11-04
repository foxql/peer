
function listener(network, userList)
{
    network.user.call(userList);
}

export default {
    name : 'findNewNodes',
    listener : listener
};