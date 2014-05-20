/*jshint laxcomma: true */

// ______________________________________

// Q U I C K   S E R V E R

(function(){

  var express   = require('express')
    , swappy    = require('loom-swappablestatic')
    , fs        = require('fs')
    , http      = require('http')
    , ngrok     = require('ngrok')
    ;


  function Server() {
    var self = this;

    // ________________________________

    var app          = express()
      , socketServer = http.createServer(app)
      , io           = require('socket.io').listen(socketServer)
      ;

    window.io = io;

    window.staticRoot = '/Users/evan/Developer/loom/experiments/rk4-spring';
    
    var socketScript  = fs.readFileSync('/Users/evan/Developer/loom/script/socketio-client.min.js')
    var ansibleScript = fs.readFileSync('/Users/evan/Developer/loom/script/ansible-client.js');

    app.use(require('connect-inject')({
      snippet: ("<script type='text/javascript'>" + socketScript + ansibleScript + "</script>"),
      ignore: ['.js', '.svg']
    }));

    var staticHandler = swappy(window.staticRoot)
    app.use(staticHandler);


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

    // ________________________________

    self.setStatic = function(path) {

      // Remove previous STATIC middleware
      server.close();
      // Set new middleware to this path
      window.staticRoot = path;
      var newStaticHandler = express.static(window.staticRoot);
      app.use(newStaticHandler);
    }


  }

  window.quickServer = new Server();

})();