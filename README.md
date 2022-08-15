# FoxQL

FoxQL used for create decentralized applications over WEB 2 technologies.

- FoxQL applications have a chaotic environment by its nature.
- The availabilty of the data depends on the accessbility of the node. In other words, the query may happen at _t_ time.
- You can use tokens as a reward to proof the accessbility and availabilty of the data.
- FoxQL is _relatively_ centralized while signaling. Since signaling is a cheap solution, it's not a big deal. Communication keep happening as long as you wish.
- Every action you take is going to produce a new hash query. The time you take to answer the question and cryptographic nonce is going to determine the difficulty of the action.
- FoxQL doesn't interact with other nodes unless it is needed. Nodes terminate the connection when they are done, and wait for the next connection. This means there is no issue with performance and limitations at WebRTC.
- End-users can transfer their data to other platforms. This blocks platform owners from have bad decisions.
- FoxQL doesn't store any action. It does not track any data transaction between nodes. It is only responsible for the delivery of the data and ensuring the new connection race begins.

## Installation

```js
import foxql from "@foxql/foxql-peer";

const node = new foxql({
  maxNodeCount: 30, // max connection limit
  maxCandidateCallTime: 2000, // how long to wait for a response from a candidate node
  bridgeServer: {
    host: "{YOUR_SELECTED_BRIDGE_URI}", // which bridge server to use
  },
});
```

### Node meta data

```js
node.setMetaData({
  name: "test-node",
  description: "test-desc",
});
```

### Event Definition

Event definition is used to establish p2p communication and data transactions. Every event has two phases. _simulate_ means that the event is fetched over webSocket.

```js
node.on("hello-world", async ({ sender, message }, simulate = false) => {
  if (simulate) {
    console.log("Simulate state");
    // work on proof case
    return true; // accept webRTC connection.
  }
  // webRTC
  this.reply(sender, {
    hi: this.nodeId,
  });
});
```

### Node Discovery

```js
async function broadcast() {
  const answer = await node.ask({
    transportPackage: {
      p2pChannelName: "hello-world",
      message: "Hello world",
    },
  });
  return answer;
}
```

### Local Discovery

<!-- needs info -->

```js
node.ask({
  transportPackage: {
    p2pChannelName: "hello-world",
    message: "Hello world",
  },
  localWork: true,
});
```

### Sticky Nodes

_stickyNode_ option is used to establish constant connection between nodes. This option is useful when you want to establish a permanent connection between nodes.
FoxQL will terminate the connection after every discovery.

```js
node.ask({
  transportPackage: {
    p2pChannelName: "hello-world",
    message: "Hello world",
  },
  stickyNode: true,
});
```

### Starting a Node

```js
node.start();
```

## Contribute

If you'd like to contribute, please fork the repository and make changes as you'd like. Pull requests are warmly welcome.

## Lisence

[MIT](https://github.com/foxql/peer/blob/main/LICENSE)
