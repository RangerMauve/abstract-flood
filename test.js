const {AbstractFlood, Message} = require('./')
const test = require('tape')

const TEST_DATA = Buffer.from('Hello World!')
const TEST_ID = Buffer.from('Example')

test('Should broadcast messages', (t) => {
	t.plan(2)
	const flood = new AbstractFlood()

	flood.on('broadcast', (buffer) => {
		const {from, data} = Message.decode(buffer)

		t.deepEqual(from, flood.id, 'Got expected id')
		t.deepEqual(data, TEST_DATA, 'Got expected data')
		t.end()
	})

	flood.broadcast(TEST_DATA)
})

test('Should rebroadcast with TTL', (t) => {
	t.plan(4)
	const flood = new AbstractFlood()

	flood.on('broadcast', (buffer) => {
		const {from, data, index, ttl} = Message.decode(buffer)

		t.deepEqual(from, TEST_ID, 'Got expected id')
		t.deepEqual(data, TEST_DATA, 'Got expected data')
		t.deepEqual(ttl, 3, 'Got expected TTL')
		t.deepEqual(index, 0, 'Got expected index')
		t.end()
	})

	flood.handleMessage(Message.encode({
		from: TEST_ID,
		data: TEST_DATA,
		index: 0,
		ttl: 4
	}))
})
