// "toolbar": false,
// "frame": false,

// ______________________________________

// Declarations

var gui   = require('nw.gui')
  , filer = require('file.js')
  , nav   = new Nav
  , async = require('async')
  , win   = gui.Window.get();
  ;



var file_arr = [
  "/Users/evan/Developer/htmloutput/public/sketch/style.styl",
  "/Users/evan/Developer/htmloutput/public/sketch/index.html",
  "/Users/evan/Developer/htmloutput/public/sketch/script.js",
  "/Users/evan/Developer/htmloutput/public/sketch/style.scss",
  "/Users/evan/Developer/_sharedaccount/htmloutput/README.md",
];


// ______________________________________

// Open previously stored files

nav.setDocument(document);

// for (var i = 0; i < file_arr.length; i++) {
//   var path = file_arr[i];
//   makeTab(path);
// }

async.map(file_arr, filer.open, function(err, files) {
  files.forEach(function(f) {
    if (f.error) return;
    nav.addTab(f.path, f.content);
  });
});


// ______________________________________


var saveCurrent = function() {
  nav.saveCurrent();
}


// ______________________________________

// Keyboard shortcuts

var commandKey = false;

document.addEventListener('keydown', function (e) {
    if (e.keyCode == 'O'.charCodeAt(0) && commandKey) {
        clickInput('open');
        commandKey = false;
    } else if (e.keyCode == 'S'.charCodeAt(0) && commandKey) {
        // clickInput('save');
        saveCurrent();
        commandKey = false;
    } else if (e.keyCode == 91) {
        commandKey = true;
    }
});
document.addEventListener('keyup', function (e) {
  if (e.keyCode == 91) {
    commandKey = false;
  }
});



// ______________________________________

// T H E M E


function toggleTheme(e) {

  var newtheme;
  if (document.body.classList.contains("dark-theme")) {
    document.body.classList.remove("dark-theme");
    newtheme = "loop-light";
  }
  else {
    document.body.classList.add("dark-theme");
    newtheme = "loop-dark";
  }
  nav.setTheme(newtheme);
}


// ______________________________________

// Bind to actions


var actions = document.querySelectorAll("[data-action]");
for (var i = 0; i < actions.length; i++ ) {
  var action = actions[i];
  var attr = action.getAttribute("data-action");

  if (attr == "theme") {
    action.addEventListener("click", toggleTheme, false);
  }
  else if (attr == "save") {
    // action.addEventListener("mousedown",function(e){
    //   save(curr_tab.title, curr_tab.cm.getValue());
    // }, false);
  }
  else if (attr == "reload") {
    // action.addEventListener("mousedown",function(e){
    //   reload_browser();
    // }, false);
  }
  else if (attr == "devtools") {
    action.addEventListener("click", function(e) {
      win.showDevTools();
    }, false);
  }
  else if (attr == "refresh") {
    action.addEventListener("click", function(e) {
      location.reload();
    }, false);
  }
  else if (attr == "window-close") {
    action.addEventListener("click", function(e) {
      win.close();
    }, false);
  }
  else if (attr == "window-minim") {
    action.addEventListener("click", function(e) {
      win.minimize();
    }, false);
  }
  else if (attr == "window-maxim") {
    action.addEventListener("click", function(e) {
      win.maximize();
    }, false);
  }

  // action.addEventListener("click",function(e){
  //   e.preventDefault();
  // });
}


// ______________________________________

// Workarounds for file I/O restrictions

function clickInput(id) {
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click');
    document.getElementById(id).dispatchEvent(event);
}
 

document.getElementById('open').addEventListener('change', function (e) {
  console.log(this.value);
  filer.open(this.value, function(err, file) {
    if (file.error) return;
    nav.addTabAndFocus(file.path, file.content);
  });
});
 
document.getElementById('save').addEventListener('change', function (e) {
    filer.save(this.value, document);
});




// ______________________________________

// Top Menu - TODO

// var menu = new gui.Menu({ type: 'menubar' });
// menu.append(new gui.MenuItem({
//     label: 'File',
//     submenu: new gui.Menu()
// }));
// menu.items[0].submenu.append(new gui.MenuItem({
//     label: 'New',
//     click: function () {
//         gui.Window.open('index.html');
//     }
// }));
// menu.items[0].submenu.append(new gui.MenuItem({
//     type: 'separator'
// }));
// menu.items[0].submenu.append(new gui.MenuItem({
//     label: 'Close',
//     click: function () {
//         gui.Window.get().close();
//     }
// }));

// gui.Window.get().menu = menu;



