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


    var PUBLIC = '/Users/evan/Developer/loom/';
    
    app.use(require('connect-inject')({
      snippet: "<script>alert('hello world');</script>",
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