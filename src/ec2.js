// Simple registrar - redirector
//

var sip = require('sip');
var digest = require('sip/digest');
var util = require('util');
var fs = require('fs');
const net = require('net');

function ipv6ToIpv4(ipv6) {
  if (net.isIPv6(ipv6)) {
    const ipv4 = ipv6.split(':').pop();
    if (ipv4.includes('.')) {
      return ipv4;
    }
  }
  throw new Error('Invalid IPv6 address');
}

var registry = {};

sip.start({
  port: 5060,
  logger: {
    send: function (message, address) { debugger; util.debug("send\n" + util.inspect(message, false, null)); },
    recv: function (message, address) { debugger; util.debug("recv\n" + util.inspect(message, false, null)); },
    error: function (e) { util.debug(e.stack); }
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
          console.log(JSON.stringify(rq, null, 2));
          var rs = sip.makeResponse(rq, 200, 'OK');
          var sdp = [
            'v=0',
            'o=- 0 0 IN IP4 18.214.210.103',
            's=No Name',
            'c=IN IP4 18.214.210.103', // Your public IP address or domain
            't=0 0',
            'a=tool:libavformat 61.9.100',
            `m=audio 5060 RTP/AVP 0`, // Your port and codecs
            'b=AS:64',
            'a=rtpmap:0 PCMU/8000/1', // Mapping for PCMU codec
            'a=sendrecv' // Send & Receive 
          ].join('\r\n');

          // Include SDP in the response body
          rs.content = sdp;
          rs.headers['content-type'] = 'application/sdp';
          rs.headers['contact'] = [{
            uri: 'sip:da@18.214.210.103:5060;transport=tcp'
          }]
          rs.headers['to']['params'].tag = 'daTestTag';
          rs.headers['x-bot-session-id'] = rq.headers['x-bot-session-id'];
          rs.headers['x-bot-context'] = rq.headers['x-bot-context'];
          rs.headers['allow'] = 'INVITE, ACK, CANCEL, OPTIONS, BYE, REFER, NOTIFY, MESSAGE, SUBSCRIBE, INFO, UPDATE';
          rs.headers['via'][0]['params']['received'] = rs.headers['via'][0]['params']['received'].split('ffff:')[1];
          // console.log(JSON.stringify(rs, null, 2));
          sip.send(rs);
          break;
        case 'ACK':
          console.log(JSON.stringify(rq, null, 2));
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
  });
