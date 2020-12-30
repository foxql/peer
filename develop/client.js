import peer from '../index.js';


const network = new peer();

network.use('socketOptions', {
    host : 'foxql-signal.herokuapp.com',
    port : null,
    protocol : 'https'
});

network.open();

network.onPeer('question', async (data)=>{
    console.log(data._by, 'Tarafından bir soru alındı.');
    network.send(data._by, {
        listener : 'answer',
        data : {
            message : 'Cevap Gönderildi'
        }
    })
});

network.onPeer('answer', async (data)=>{
    console.log(data._by, 'Tarafından bir cevap alındı.');
});



window.p2p = network;