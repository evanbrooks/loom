// ______________________________________

// Tab object

var stylus     = require('stylus');

function Tab(nav) {

  var self = this;

  self.title     = null; // display title
  self.path      = null; // path to file
  self.filename  = null; // name of file
  self.mode      = null; // name of file
  self.ext       = null; // name of file
  self.state     = null; // whether file matches disk

  self.cm        = null; // primary CodeMirror
  self.flap      = null; // element in tab bar
  self.panel     = null; // wrapper for content
  self.ex        = null; // Close/status button



  self.initWithFile = function(path, content) {
    setFile(path);
    makeInterface();
    self.cm = makeMirror(content);
  };

  var setFile = function(path) {
    self.path  = path;
    self.title = path.replace(/^.*[\\\/]/, '');
    self.ext = self.title.split(".")[1];
    self.mode = modeFromExtension(self.ext);
  };

  self.save = function() {
    filer.save(self.path, self.cm.getValue());
    ansible.reload();
  };

  self.close = function(e) {
    e.preventDefault();
    nav.removeTab(self);
    self.flap.parentNode.removeChild(self.flap);
    self.panel.parentNode.removeChild(self.panel);
  };

  var makeInterface = function() {
    self.flap = makeFlap();
    self.panel = makePanel();
  };

  var makeFlap = function() {
    var f = document.createElement("li");
    f.setAttribute("data-tabname", self.path); 
    f.addEventListener("click",function(e){
      e.preventDefault();
    });
    f.addEventListener("mousedown", clickTab, false);

    self.ex = document.createElement("span");
    self.ex.classList.add("tab-btn-x");
    self.ex.addEventListener("click", self.close);
    self.ex.addEventListener("mousedown", function(e){
      e.stopPropagation();// prevent mousdown on X from setting current tab
    }); 

    var tabname = document.createElement("span");
    tabname.classList.add("tab-title");
    tabname.innerText = self.title;

    f.appendChild(self.ex);
    f.appendChild(tabname);

    return f;
  };

  var makePanel = function() {
    // ________________________
    // Build tab body
    var p = document.createElement("div");
    p.className = "cm-mode-" + self.ext +" tab";
    p.setAttribute("data-tabpanel", self.path); 
    return p;
  };

  var makeMirror = function(content) {

    var editor = CodeMirror(function(elt) {
        self.panel.appendChild(elt);
    },
    {
      mode: self.mode,
      tabSize: 2,
      lineNumbers: false,
      //lineWrapping: true,
      gutters: ["CodeMirror-lint-markers"],
      lint: (self.mode == "javascript"),
      keyMap: "sublime",
      theme: "loop-light",
      extraKeys: {
        "Tab": function(cm) {
          var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
          cm.replaceSelection(spaces);
        }
      }
    });


    editor.on("change", function(cm, change) {
      var fromWidget = (change.origin && change.origin == "*fromWidget");
      if (!fromWidget) {
        //cm.operation(function(){
          widgetize(cm, change.from.line, change.to.line);
          //});
      }
    });

    editor.setValue(content);
    setTimeout(function(){
      widgetize(editor, 0, editor.lineCount()-1);
    }, 100);

    ansibleize(editor);

    return editor;
  };

  var modeFromExtension = function(ext) {
    if (ext == "html")      return "text/html";
    else if (ext == "css")  return ext;
    else if (ext == "scss") return "text/x-scss";
    else if (ext == "styl") return "text/x-scss";
    else if (ext == "md")   return "text/x-markdown";
    else if (ext == "js")   return "javascript";
  };


  var clickTab = function(e) {
    nav.setTab(self);
  };

  var ansibleize = function(cm, mode) {
    if (self.ext == "css") {
      cm.on("inputRead", function(cm) {
      });
      cm.on("change", function(cm) {
        ansible.send({
          css: cm.getValue(),
        });
      });
    }
    else if (self.ext == "scss") {
      // cm.on("change", function(cm) {
      //   ansible.send({
      //     css: self.cm.getValue().
      //   });
      // });
    }
    else if (self.ext == "styl") {
      cm.on("change", function(cm) {
        var val = cm.getValue();
        stylus(val).set('filename', '.css').render(function(err, css){
          // if (err) throw err;
          if (err) {
            console.log(err);
            return;
          }
          ansible.send({
            css: css,
          });
        });
      });     
    }
    else if (self.ext == "js") {
      cm.on("change", function(cm) {
        console.log("try to swap script");
        ansible.send({
          swapscript: true,
          script: cm.getValue(),
          url: "http://localhost:3000/script.js",
        });
      });
    }
  }

  var ansible = {};

  ansible.send = function(msg) {
    io.sockets.volatile.emit('message', msg);
  }

  ansible.reload = function() {
    io.sockets.volatile.emit('message', {reload: true,});
  }


}

