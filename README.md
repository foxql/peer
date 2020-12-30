# foxql-peer
Simple webrtc implemantation for p2p communication - this project not finished.

## Documentation

#### Install
```
npm i @foxql/foxql-peer
```


#### Simple usage
``` javascript 
import peer from '../index.js';

const network = new peer();
```

#### Change Default Configuration

``` javascript
network.use('socketOptions', {
    host : 'foxql-signal.herokuapp.com',
    port : null,
    protocol : 'https'
});

network.use('iceServers', [
    {'urls': 'stun:stun.your_example_stun_server.org:1111'}
]);
```

#### Create peer data channel listener

``` javascript
network.onPeer('question', async (data)=>{
    console.log(`Getting data by ${data._by}`);
});
```

#### Send data all connected peers

``` javascript
network.broadcast({
    listener : 'question',
    data : {
        message : 'message content!'
    }
});
```


#### Send data spesific peerId

``` javascript
network.send('kumP91ZUJf8FVNOKAACp', {
    listener : 'message',
    data : {
        message : 'A message content!'
    }
})
```


