/*jshint laxcomma: true */

// ______________________________________

// Q U I C K   S E R V E R

(function(){

  var express   = require('express')
    , http      = require('http')
    , ngrok     = require('ngrok')
    , fs        = require('fs')
    ;


  function Server() {
    var self = this;

    // ________________________________

    var app          = express()
      , socketServer = http.createServer(app)
      , io           = require('socket.io').listen(socketServer)
      ;

    window.io = io;

    var PUBLIC = '/Users/evan/Developer/loom/experiments/rk4-spring';
    
    var socketScript  = "<script>" + fs.readFileSync('/Users/evan/Developer/loom/script/socketio-client.min.js') + "</script>";
    var ansibleScript = "<script>" + fs.readFileSync('/Users/evan/Developer/loom/script/ansible-client.js') + "</script>";

    app.use(require('connect-inject')({
      snippet: (socketScript + ansibleScript),
      ignore: ['.js', '.svg']
    }));
    app.use(express.static(PUBLIC));


    var server = socketServer.listen(process.env.PORT || 3000, function() {
      var port = server.address().port;
      console.log('Listening on port ' + port );
    });

    io.sockets.on('connection', function (socket) {
      socket.on('message', function(msg) {
        console.log(msg);
      });
    });

    // ________________________________

    self.publish = function() {
      var port = server.address().port;
      ngrok.connect(port, function (err, url) {
        if (err) console.log(err);
        console.log('Ngrok running online at ' + url);
      });
    };

    // ________________________________

    self.unPublish = function() {
      ngrok.disconnect();
    }
  }

  window.quickServer = new Server();

})();