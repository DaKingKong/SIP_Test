var sip = require('sip');
var digest = require('sip/digest');
var util = require('util');
var fs = require('fs');

var registry = {};

sip.start({
    logger: {
        send: function (message, address) { debugger; util.debug("send\n" + util.inspect(message, false, null)); },
        recv: function (message, address) { debugger; util.debug("recv\n" + util.inspect(message, false, null)); },
        error: function (e) { util.debug(e.stack); }
    },
    tls: {
        key: fs.readFileSync('private-key.pem'),
        cert: fs.readFileSync('certificate.pem')
    }
},
    function (rq) {
        // console.log('------------------')
        // console.log(JSON.stringify(rq, null, 2))
        // console.log('------------------')
        // console.log('\n\n\n');
        console.log(rq.method)
        try {
            switch (rq.method) {
                case 'REGISTER':
                    //looking up user info
                    var username = sip.parseUri(rq.headers.to.uri).user;

                    registry[username] = rq.headers.contact;

                    var rs = sip.makeResponse(rq, 200, 'Ok');
                    rs.headers.contact = rq.headers.contact;
                    console.log(registry)
                    util.debug('sending response');
                    sip.send(rs);
                    break;
                case 'INVITE':
                    // console.log(JSON.stringify(rq, null, 2));
                    var rs = sip.makeResponse(rq, 200, 'OK');
                    var sdp = [
                        'v=0',
                        'o=- 0 0 IN IP4 127.0.0.1',
                        's=No Name',
                        'c=IN IP4 193.34.76.44', // Your public IP address or domain
                        't=0 0',
                        'a=tool:libavformat 61.9.100',
                        'm=audio 5004 RTP/AVP 0', // Your port and codecs
                        'b=AS:64',
                        'a=rtpmap:0 PCMU/8000/1', // Mapping for PCMU codec
                        'a=sendrecv' // Send & Receive 
                    ].join('\r\n');

                    // Include SDP in the response body
                    rs.content = sdp;
                    rs.headers['content-type'] = 'application/sdp';
                    rs.headers['contact'] = [
                        {
                            uri: 'sip:alice@0.tcp.jp.ngrok.io:15348;transport=tls'
                        }
                    ]
                    console.log(JSON.stringify(rs, null, 2));
                    sip.send(rs);
                    break;
                default:
                    sip.send(sip.makeResponse(rq, 405, 'Method Not Allowed'));
                    console.log(rq.method + ' not allowed');
                    break;

            }
        } catch (e) {
            util.debug(e);
            util.debug(e.stack);

            sip.send(sip.makeResponse(rq, 500, "Server Internal Error"));
        }
    }
);