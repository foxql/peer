import peer from '../index.js';


const network = new peer();

network.use('socketOptions', {
    host : 'localhost',
    port : 1923,
    protocol : 'http'
});

network.use('peerInformation', {
    alias : 'FoxQL - Custom Node Name',
    avatar : 'https://foxql.com/media/logo.png',
    explanation : 'My node custom object!'
})

network.onPeer('question', async (data)=>{
    console.log(data._by, 'Tarafından bir soru alındı.');

    if(data._simulate) { // simulation case dedected.
        /** Simulate event and return boolean */
        return true;
    }

    network.send(data._by, {
        listener : 'answer',
        data : {
            message : 'Cevap Gönderildi'
        }
    })

    return true;
});

network.onPeer('answer', async (data)=>{
    console.log(data, 'Tarafından bir cevap alındı.');
});


network.open();


network.broadcast({
    listener : 'question',
    data : {
        message : 'message content!'
    }
});

window.p2p = network;