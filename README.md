# abstract-flood
Abstract module for flooding network packets.

This is useful for swarms of peers which are sparsely connected and enables you to ensure that everyone in the network will get a particular message.

This module encodes packets for broadcasting as well as making sure your application doesn't see a packet more than once and avoiding loops.

You should use this in combination with some sort of swarming network logic.

Each node should have a unique id and can broadcast arbitrary buffers over the network.

You should consider using public keys for IDs and signing data / verifying it.

## API

### `const flood = AbstractFlood({id, ttl, lruSize, messageIndex})`

Initialize a new abstract flood instance.

- `id`: Default: `crypto.randomBytes(32)` Should be a buffer uniquely identifying your node in the flood swarm.
- `ttl`: Default: `255` Is the time to live for a packet. Each hop in the network decreases the TTL until it hits 0 and stops being propogated.
- `lruSize`: Default: `255` Is the number of messages the node should keep track of to avoid re-broadcasting messages it has seen before.
- `messageIndex`: Default: `0` Is the index to start at when sending out new messages. With each message the index increases and is used to uniquely identify a message from a peer. You should only set this if you're resuming from a previous session.

### `flood.on('message', (data, from, index, ttl) => {})`

Emitted when a new message has been detected.

- `data` Is the buffer containing the message payload. Most of the time this is the only thing you'll want to use.
- `from` is the ID of the peer that sent the message
- `index` is the message index for that peer
- `ttl` is the current TTL left on this packet

### `flood.on('broadcast', (buffer) => {})`

Emitted when there is data that should be broadcasted. This is either a packet that originated from this peer, or a packet that's being re-broadcast from another peer.

You should take the `buffer` and send it to every peer you're connected to.

- `buffer` is a Node.js Buffer object containing a packet that should be sent out to the swarm.

### `flood.broadcast(data, ttl)`

Use this to broadcast a packet to all peers.

- `data` should be a Node.js Buffer object with whatever payload you want to send to peers.
- `ttl` Default: `this.ttl` is an optional TTL value to specify in this broadcast. If you want to only send messages to directly connected peers, set this to `0`.
