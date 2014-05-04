// ______________________________________

// Tab object

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


  var init = function() {
  }

  self.initWithFile = function(path, content) {
    init();
    setFile(path);
    makeInterface();
    self.cm = makeMirror(content);
  }

  var setFile = function(path) {
    self.path  = path;
    self.title = path.replace(/^.*[\\\/]/, '');
    self.ext = self.title.split(".")[1];
    self.mode = modeFromExtension(self.ext);
  }

  self.save = function() {
    file.save(self.path, self.cm.getValue());
  }

  self.close = function() {
    nav.removeTab(self);
    self.flap.parentNode.removeChild(self.flap);
    self.panel.parentNode.removeChild(self.panel);
  }

  var makeInterface = function() {


    // ________________________
    // Build tab flap
    self.flap = document.createElement("li");
    self.flap.setAttribute("data-tabname", self.path); 
    self.flap.innerText = self.title;
    self.flap.addEventListener("click",function(e){e.preventDefault();});
    self.flap.addEventListener("mousedown", clickTab, false);

    // ________________________
    // Build X
    self.ex = document.createElement("span");
    self.ex.innerText = "— X";
    self.ex.addEventListener("click", self.close);
    self.flap.appendChild(self.ex);

    // ________________________
    // Build tab body
    self.panel = document.createElement("div");
    self.panel.className = "cm-mode-" + self.ext +" tab";
    self.panel.setAttribute("data-tabpanel", self.path); 

  }

  var makeMirror = function(content) {

    var editor = CodeMirror(function(elt) {
        self.panel.appendChild(elt);
    },
    {
      mode: self.mode,
      tabSize: 2,
      lineNumbers: false,
      lineWrapping: true,
      gutters: ["CodeMirror-lint-markers"],
      lint: (self.mode == "javascript"),
      keyMap: "sublime",
      theme: "loop-light",
      extraKeys: {
        "Tab": function(cm) {
          var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
          cm.replaceSelection(spaces);
        }
      },
    });


    editor.on("change", function(cm, change) {
      widgetize(cm, change.from.line, change.to.line);
    });

    editor.setValue(content);
    setTimeout(function(){
      widgetize(editor, 0, editor.lineCount()-1);
    }, 100);

    return editor;
  }

  var modeFromExtension = function(ext) {
    if (ext == "html") return "text/html";
    else if (ext == "css") return ext;
    else if (ext == "scss") return "text/x-scss";
    else if (ext == "styl") return "text/x-scss";
    else if (ext == "js") return "javascript";
  }


  var clickTab = function(e) {
    nav.setTab(self);
  }


  // var timeout;
  // var hinter = "";

  // if (ext == "js") hinter = "javascript";
  // // else if (ext == "html") hinter = "html";
  // else if (ext == "css" || ext=="scss") hinter = "css";

  // editor.on("inputRead", function(cm) {
  //     if(timeout) clearTimeout(timeout);

  //     var cursor = cm.getCursor();
  //     var ltr = cm.getRange({line: cursor.line, ch: cursor.ch - 1}, cursor);

  //     if (hinter && /^[A-Za-z]/.test(ltr)) {
  //       timeout = setTimeout(function() {
  //           CodeMirror.showHint(cm, CodeMirror.hint[hinter], {completeSingle: false});
  //       }, 150);
  //     }
  // });

  // editor.on("renderLine", function(cm, line, el) {
  //   // var nums = el.querySelectorAll(".cm-number");
  // });
  // editor.on("focus", function(cm) {
  //   var tabname = cm.display.wrapper.parentNode.getAttribute("data-tabpanel");
  //   if (curr_tab && cm !== curr_tab.cm) {
  //     set_tab_by_name(tabname);
  //   }
  // });
  // editor.on("change", function(cm, change) {

  //   widgetize(cm, change.from.line, change.to.line);
  // });

  // // open(filename, function(cm, data){
  // //   editor.setValue(data);
  // //   setTimeout(function(cm){widgetize(cm, 0, 25);}, 300);
  // // });

  // editor.setValue(content);
  // setTimeout(function(){
  //   widgetize(editor, 0, editor.lineCount()-1);
  // }, 100);


  // // var left = index * 700;
  // // tab_panel.style.webkitTransform = "translate3d(" + left + "px,0,0)";

  // nav[filename] = {
  //   cm: editor,
  //   // left: left,
  //   flap: tab_flap, 
  //   panel: tab_panel,
  //   title: title,
  //   filename: filename,
  //   save_state: "Just opened"
  // }



  // // ========================

  // // L I V E  R E L O A D

  // if (mode == "css") {
  //   editor.on("inputRead", function(cm) {
  //     send_css(cm.getValue());
  //   });
  //   editor.on("change", function(cm) {
  //     send_css(cm.getValue());
  //   });
  // }
  // else if (mode == "text/x-scss") {
  //   if (ext == "scss") {
  //     editor.on("change", function(cm) {
  //       send_scss(cm.getValue());
  //     });
  //   }
  //   else if (ext == "styl") {
  //     editor.on("change", function(cm) {
  //       send_styl(cm.getValue());
  //     });
  //   }
  // }
  // else if (mode == "javascript") {
  //   editor.on("change", function(cm) {
  //     send_script(cm.getValue(), "http://localhost:3000/sketch/script.js");
  //   });
  // }


  // return editor;
}

// module.exports = Tab;