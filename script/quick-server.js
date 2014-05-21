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

    window.staticRoot = '/Users/evan/Developer/loom/experiments/sample';
    
    var socketScript  = fs.readFileSync('/Users/evan/Developer/loom/script/socketio-client.min.js');
    var ansibleScript = fs.readFileSync('/Users/evan/Developer/loom/script/ansible-client.js');

    app.use(require('connect-inject')({
      snippet: ("<script type='text/javascript'>" + socketScript + "</script><script type='text/javascript'>" + ansibleScript + "</script>"),
      ignore: ['.js', '.svg']
    }));

    var staticHandler = swappy(window.staticRoot)
    app.use(staticHandler);
    app.use('/clr', express.static('/Users/evan/Developer/loom/experiments/remote-color'));
    app.use('/staticstyle', express.static('/Users/evan/Developer/loom/style'));
    app.use('/staticscript', express.static('/Users/evan/Developer/loom/script'));


    var server = socketServer.listen(process.env.PORT || 3000, function() {
      var port = server.address().port;
      console.info('Local servet running at ' + port );
      self.publish();
    });

    io.sockets.on('connection', function (socket) {
      socket.on('message', function(msg) {
        console.log(msg);

        // ====================
        // CONSOLE LOGGER
        if (msg.console) {
          var parsed = JSON.parse(msg.msg)
          var text = parsed.text;
          var cm = nav.current.cm;
          console.log("received message!");

          if (parsed.level == "error") {
            text = text.split(":")[1];
            cm.markText(
              {ch: parsed.column - 1, line: parsed.line-1},
              {ch: parsed.column + 2, line: parsed.line-1},
              {className: "logged-error"}
            );

          }

          var el = document.createElement("div");
          el.className = "console-log-marker console-" + parsed.level;
          el.innerText = text;

          cm.setGutterMarker(
            parsed.line - 1, // zero-indexed
            "CodeMirror-lint-markers",
            el
          );
        }
        // ==================



      });
    });

    // ________________________________

    self.publish = function() {
      var port = server.address().port;
      ngrok.connect({
        authtoken: 'JohZPmCzR0QKuvzDiUoc',
        port: port,
        subdomain: 'ev'
      }, function (err, url) {
        if (err) console.log(err);
        console.info('Ngrok running online at ' + url);
      });
    };

    // ________________________________

    self.unPublish = function() {
      ngrok.disconnect();
    }

    // ________________________________

    self.setStatic = function(path) {
      // Set new middleware to this path
      window.staticRoot = path;
    }


  }

  window.quickServer = new Server();

})();