// Simple registrar - redirector
//

var sip = require('sip');
var digest = require('sip/digest');
var util = require('util');
var fs = require('fs');

var registry = {};

sip.start({
  address: '127.0.0.1',
  tls_port: 5061,
  publicAddress: 'k7llpejlgsw6lquq.l.tunwg.com',
  logger: { 
    send: function(message, address) { debugger; util.debug("send\n" + util.inspect(message, false, null)); },
    recv: function(message, address) { debugger; util.debug("recv\n" + util.inspect(message, false, null)); },
    error: function(e) { util.debug(e.stack); }
  },
  tls: {
    // key: fs.readFileSync('pkey.pem'),
    // cert: fs.readFileSync('certificate.pem')
  }
},
function(rq) {
  console.log(0) 
  try {
    if(rq.method === 'REGISTER') {       
      //looking up user info
      var username = sip.parseUri(rq.headers.to.uri).user;
      console.log(1111)
      console.log(username)
      
      registry[username] = rq.headers.contact;
      
      var rs = sip.makeResponse(rq, 200, 'Ok');
      rs.headers.contact = rq.headers.contact;
      util.debug('sending response');
      sip.send(rs);
    }
    else if(rq.method === 'INVITE') {
      var username = sip.parseUri(rq.uri).user;
      console.log(2222)
      console.log(username)
      var contacts = registry[username];
      
      if(contacts && Array.isArray(contacts) && contacts.length > 0) {
        var rs = sip.makeResponse(rq, 302, 'Moved');
        rs.headers.contact = contacts;
        sip.send(rs);
      }
      else {
        sip.send(sip.makeResponse(rq, 404, 'Not Found'));
      }
    }
    else {
      sip.send(sip.makeResponse(rq, 405, 'Method Not Allowed'));
    }
  } catch(e) {
    util.debug(e);
    util.debug(e.stack);

    sip.send(sip.makeResponse(rq, 500, "Server Internal Error"));
  }
});
