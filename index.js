const LRU = require('lru')
const { Message } = require('./messages')
const debug = require('debug')('abstract-flood')
const crypto = require('crypto')
const EventEmitter = require('events')

const DEFAULT_LRU = 255
const DEFAULT_TTL = 255

class AbstractFlood extends EventEmitter {
  constructor ({
    lruSize = DEFAULT_LRU,
    ttl = DEFAULT_TTL,
    messageIndex = 0,
    id = crypto.randomBytes(32)
  } = {}) {
    super()

    this.id = id
    this.ttl = ttl
    this.messageIndex = messageIndex
    this.lru = new LRU(lruSize)
  }

  handleMessage (buffer) {
    const { from, index, ttl, data } = Message.decode(buffer)

    if (from.equals(this.id)) return debug('Got message from self', from, index)

    const key = from.toString('hex') + index

    if (this.lru.get(key)) return debug('Already seen message', from, index)

    this.lru.set(key, true)

    this.emit('message', data, from, index, ttl)

    if (ttl <= 0) return debug('End of TTL, skip rebroadcast', from, index, ttl)

    this.emit('broadcast', Message.encode({
      from,
      index,
      data,
      ttl: ttl - 1
    }))
  }

  broadcast (data, ttl = this.ttl) {
    const index = this.messageIndex++
    const from = this.id

    this.emit('broadcast', Message.encode({
      from,
      index,
      data,
      ttl
    }))
  }
}

module.exports = {
 AbstractFlood,
 Message
}
