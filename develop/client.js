import peer from '../index.js';


const network = new peer();

network.use('socketOptions', {
    host : '127.0.0.1',
    port : 1923,
    protocol : 'http'
});


network.onPeer('question', async (data)=>{
    console.log(data._by, 'Tarafından bir soru alındı.');
    network.send(data._by, {
        listener : 'answer',
        data : {
            message : 'Cevap Gönderildi'
        }
    })

    return true;
});

let mm = 0;

network.onPeer('answer', async (data)=>{
    mm++;
    console.log(data._by, 'Tarafından bir cevap alındı.', mm);
});


network.open();


window.p2p = network;