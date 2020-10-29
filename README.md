# foxql-peer
Simple webrtc implemantation for p2p communication - this project not finished.

### Documentation


#### Simple usage
``` javascript 
import peer from '../index.js';

const network = new peer();
```

#### Change Default Configuration

``` javascript
network.use('serverOptions', {
    url : '0.0.0.0',
    port : 3000,
    protocol : 'http'
});

network.use('iceServers', [
    {'urls': 'stun:stun.your_example_stun_server.org:1111'}
]);
```