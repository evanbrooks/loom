var socket = io.connect('/');
var socket_id = parseInt(Math.random() * 10000);

socket.on('connect', function(){
  console.log("LOOM — Ansible online");
});
socket.on('disconnect', function(){
  console.log("LOOM — Ansible disconnected");
  // setTimeout(function(){
  //   socket = io.connect('/');
  // }, 200);
});

socket.on('message', function(msg) {
  // console.log(msg);

  if (!window.LOOM_PART) {
    if (msg.css) {
      // console.log("replacing file:" + msg.cssFile)
      console.log("replacing css!");
      insert_css(msg.css);
    }
    else if (msg.script) {
    }
    else if (msg.reload) {
      window.location.reload(true);
    }
  }
});

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