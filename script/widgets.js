/*jshint laxcomma: true */

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
      // marks[i].clear();
    }

    // Scan through this line and insert widget marks
    var prev, curr, pos, type;
    for (var ch = 0; ch < line.text.length; ch++) {
      pos = {line: line_num, ch: ch};
      token = cm.getTokenAt(pos);
      type = token.type;
      if      (type && type.contains("number"))       curr = "number";
      else if (type && type.contains("color"))        curr = "color";
      else if (type && type.contains("attrval-src"))  curr = "src";
      else if (/spring\([\d\,]*\)/.test(token.string)) curr = "spring";
      else    curr = false;

      if (curr && (curr !== prev)) {
        var insert_pos = {line: line_num, ch: ch - 1};
        var w, widg;
        if (curr == "number") {
          w = get_slider();
          widg = cm.setBookmark(insert_pos, {
            widget: w.el,
            insertLeft: true
          });
        }
        else if (curr == "color") {
          w = get_colorpicker(token.string, line, insert_pos);
          var end_pos = {line: line_num, ch: ch - 1 + token.string.length};
          widg = cm.markText(insert_pos, end_pos, {
            replacedWith: w.el,
          });
        }
        else if (curr == "src") {
          var src = token.string.replace(/["']/g,"");
          w = get_img(src);
          var end_pos = {line: line_num, ch: ch - 1 + token.string.length};
          widg = cm.markText(insert_pos, end_pos, {
            replacedWith: w.el,
            //atomic: true,
          });
        }
        else if (curr == "spring") {
          w = get_spring(token.string);
          var end_pos = {line: line_num, ch: ch - 1 + token.string.length};
          widg = cm.markText(insert_pos, end_pos, {
            replacedWith: w.el,
            //atomic: true,
          });
        }
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
  };


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
    ext = strt_text.replace(/([\-0-9.]*)/ , "");
    strtval = val;

    if (ext == "em") step = 0.05;
    else if (ext === "" && val < 3) step = 0.1; 
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

function Picker(el, color, line, marker) {
  var self = this
    , $el = el;

  $($el).html('<div class="colorpicker-swatch"></div>');
  var swatchEl = $($el).find(".colorpicker-swatch")[0];

  swatchEl.style.backgroundColor = color;

  self.setWidget = function(widget){
    self.widget = widget;
  };

  var strt_text = color;


  var currColor;

  swatchEl.addEventListener('mousedown', function(e){

    var swatch = this;
    var scr = nav.current.panel.querySelector(".CodeMirror-scroll");


    // var textPos = self.widget.find();
    var textPos = marker;

    //var widgs = nav.current.cm.lineInfo(textPos.line).widgets;
    var widgs = nav.current.cm.lineInfo(line).widgets;
    if (widgs && widgs.length) {
      widgs.forEach(function(widg){
        widg.node.classList.remove("active");
        setTimeout(function(){widg.clear();}, 500);
      });
      return;
    }

    var computedColor = window.getComputedStyle(swatch).backgroundColor;
    currColor = strt_text;


    var pos = $(swatch).offset();
    var scrPos = $(scr).offset();

    var x = pos.left - scrPos.left;
    var y = pos.top + $(scr).scrollTop() - 3;// + 15;

    var pickerEl;

    if (swatchEl.getAttribute("data-colorpicker-active")) {

      $(swatchEl).children().removeClass("active");
      setTimeout(function(){
        // $(swatchEl).children().remove();
      }, 500);
      
      swatchEl.removeAttribute("data-colorpicker-active");
      return;
    }

    swatchEl.setAttribute("data-colorpicker-active", true);
    pickerEl = document.querySelector("#templates .c-picker").cloneNode(true);
    $(swatchEl).append(pickerEl);

    var colorPicker = new ColorPicker(pickerEl);

    // On widget change
    colorPicker.onChange(function(newColor){
      // [A] get the range
      var replaceStart = textPos;
      var replaceEnd = { line: textPos.line, ch: (textPos.ch + currColor.length) };
      // [B] replace the text (removing the widget)
      nav.current.cm.replaceRange(
        newColor,
        replaceStart,
        replaceEnd,
        "*fromWidget"
        // ^ let codemirror know that the change came from
        // the widget and therefore not to trigger new widgets
      );
      // [C] restore the widget
      nav.current.cm.markText(replaceStart, replaceEnd, {
        replacedWith: $el,
      });
      // [D] Set the new color and cache the string to measure later
      swatchEl.style.backgroundColor = newColor;
      currColor = newColor;
    });

    // Set and activate widget
    colorPicker.setColor(computedColor);
    colorPicker.el.classList.add("active");

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


function get_colorpicker(color, line, marker) {
  var el = document.createElement('span');
  el.className = 'colorpicker';
  var picker = new Picker(el, color, line, marker);
  return {obj: picker, el: el};
}

function get_spring(text) {
  var el = document.createElement('span');
  el.className = 'springer';
  el.innerText = "SPROINGGGG";
  var picker = {};
  // var picker = new Picker(el, color, line, marker);
  return {obj: picker, el: el};
}


function get_img(path) {
  var el = document.createElement('span');


  var img = new Image();
  img.onerror = function() {
  };
  img.onload = function() {
    el.style.backgroundImage = "url(" + path + ")";
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center center";
    el.className = 'imgwidget';
  }
  img.src = path;
  console.log(img);

  return {obj: {}, el: el};
}




