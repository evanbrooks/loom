function widgetize(cm, start, end) {
  var start_line = start;
  var end_line = end;


  for (var j = start_line; j <= end_line; j++ ) {
    // Identify line that was changed
    var line_num = j;
    var line = cm.getLineHandle(line_num);
    
    if (!line) return;

    // Find all widget marks on this line and clear them
    var marks = cm.findMarks(
      {line: line_num, ch: 0 },
      {line: line_num, ch: line.text.length }
    );
    for (var i = 0; i < marks.length; i++) {
      marks[i].clear();
    }

    // Scan through this line and insert widget marks
    var prev, curr, pos, type;
    for (var ch = 0; ch < line.text.length; ch++) {
      pos = {line: line_num, ch: ch}
      token = cm.getTokenAt(pos);
      type = token.type;
      if      (type && type.contains("number"))       curr = "number";
      else if (type && type.contains("color"))        curr = "color";
      //else if (type && type.contains("attrval-src"))  curr = "src";
      else    curr = false;

      if (curr && (curr !== prev)) {
        var insert_pos = {line: line_num, ch: ch - 1};
        var w;
        if (curr == "number") {
          var w = get_slider();
        }
        else if (curr == "color") {
          var w = get_colorpicker(token.string);
        }
        else if (curr == "src") {
          var w = get_img();
        }
        // console.log(w);
        var widg = cm.setBookmark(
          insert_pos,
          {
            widget: w.el,
            insertLeft: true
          }
        );
        if (w.obj.setWidget) w.obj.setWidget(widg);
      }
      prev = curr;
    }
  }
}



// ================

var mousedowns = 0;

function Slider(el) {
  var self = this;
  var $el = $(el);

  $el.html('<div class="slider-thumb"></div>');

  var $thumb = $el.find(".slider-thumb");
  $thumb.attr("tabindex", "0");
  var $val = $el.next();
  var dragging = false;
  var start = {x:0, y:0};
  var delt = {x:0, y:0};
  var val = 0;
  var ext = "";
  var strtval = 0;
  var step = 1;
  var curr_text = "";
  var strt_text = "";
  var pos;

  self.setWidget = function(widget) {
    self.widget = widget;
  }


  $el.mousedown(function(e){

    dragging = true;
    $val = $el.parent().next();
    $el.addClass("dragging");
    $("body").addClass("dragging");
    start.x = e.clientX;
    start.y = e.clientY;
    delt.x = 0;
    delt.y = 0;
    strt_text = $val.html();
    val = parseFloat(strt_text);
    ext = strt_text.replace(/([-0-9.]*)/ , "");
    strtval = val;

    if (ext == "em") step = 0.05;
    else if (ext == "" && val < 3) step = 0.1; 
    else step = 1;

    curr_text = strt_text;
    pos = self.widget.find();

    var offset = $thumb.offset();
  });

  $("html").mousemove(function(e){
    if (dragging) {

      delt.x = e.clientX - start.x;
      delt.y = e.clientY - start.y;

      val = Math.round((strtval - parseInt(delt.y * 0.3) * step) * 100) / 100;


      nav.current.cm.replaceRange(
        (val + ext),
        pos,
        {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        }
      );
      curr_text = val + ext;

    }
  });
  $("html").mouseup(function(){
    dragging = false;
    $(".dragging").removeClass("dragging");
  });

  $el.keydown(function(e){
    // UP KEY
    if (e.keyCode == 38) {
      e.preventDefault();
      val = Math.round((val + step) * 100) / 100;
      curr_tab.cm.replaceRange(
        (val + ext),
        pos,
        {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        }
      );
    }
    // DOWN KEY
    else if (e.keyCode == 40) {
      e.preventDefault();
      val = Math.round((val - step) * 100) / 100;
      curr_tab.cm.replaceRange(
        (val + ext),
        pos,
        {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        }
      );
    }

  });
}



// ==========

function Picker(el, color) {
  var self = this
    , $el = el;

  $($el).html('<div class="colorpicker-swatch"></div>');
  var $sw = $($el).find(".colorpicker-swatch")[0];

  $sw.style.backgroundColor = color;

  self.setWidget = function(widget){
    self.widget = widget;
  }

  $sw.addEventListener('mousedown', function(e){

    var self = this;
    // pos = self.widget.find();

    var scr = nav.current.panel.querySelector(".CodeMirror-scroll");

    colorPicker.el.classList.remove("active");

    var color = window.getComputedStyle(self).backgroundColor;

    setTimeout(function(){
      $(scr).append(colorPicker.el);

      var pos = $(self).offset();
      var scrPos = $(scr).offset();

      var x = pos.left - scrPos.left;
      var y = pos.top + $(scr).scrollTop() - 3;// + 15;

      colorPicker.setColor(color);
      colorPicker.position(x, y);
      colorPicker.el.classList.add("active");
    }, 0);

  });
}






// ==========


function get_slider() {
  var val = 0;
  var el = document.createElement('span');
  el.className = 'slider';
  var slider = new Slider(el);
  return {obj: slider, el: el};
}


function get_colorpicker(color) {
  var el = document.createElement('span');
  el.className = 'colorpicker';
  var picker = new Picker(el, color);
  return {obj: picker, el: el};
}

function get_img() {
  var el = document.createElement('span');
  el.className = 'imgwidget';
  return {obj: {}, el: el};
}




