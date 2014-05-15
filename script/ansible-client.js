var socket = io.connect('/');
var socket_id = parseInt(Math.random() * 10000);


socket.on('message', function(msg) {
  console.log(msg);
  if (msg.ID !== socket_id) {
    if (msg.css) {
      console.log("replacing file:" + msg.cssFile)
      insert_css(msg.css);
    }
    else if (msg.script) {
    }
    else if (msg.reload) {
      window.location.reload(true);
    }
  }
});


// function highlight(s) {
//   var els = document.querySelectorAll(s);
//   console.log(els);
//   for (var i = 0; i < els.length; i++) {
//     els[i].classList.add("_editor-highlight");
//   }
// }

// function unhighlight(s) {
//   var els = document.querySelectorAll(s);
//   console.log(els);
//   for (var i = 0; i < els.length; i++) {
//     els[i].classList.remove("_editor-highlight");
//   }
// }

var stylenode = document.createElement('style');
stylenode.type = 'text/css';
stylenode.id = "ansibleStyle";
document.head.appendChild(stylenode);

function insert_css(css) {
  if (stylenode.styleSheet){
    stylenode.styleSheet.cssText = css;
  } else {
    stylenode.innerHTML = "";
    stylenode.appendChild(document.createTextNode(css));
  }
}