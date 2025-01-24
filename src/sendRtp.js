const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const message = Buffer.from('Hello RTP');

client.send(message, 0, message.length, 34258, 'rnvlt-110-80-21-210.a.free.pinggy.link', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('RTP packet sent');
    }
    client.close();
});