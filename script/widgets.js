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
    var marksCache = cm.findMarks(
      {line: line_num, ch: 0 },
      {line: line_num, ch: line.text.length }
    );
    for (var i = 0; i < marksCache.length; i++) {
      marksCache[i].clear();
    }

    // Scan through this line and insert widget marks
    var prev, curr, pos, type;
    for (var ch = 0; ch < line.text.length; ch++) {
      pos = {line: line_num, ch: ch};
      token = cm.getTokenAt(pos);
      type = token.type;

      // [1] Detect a condition that triggers a widget
      // --------------
      if      (type && type.contains("number"))       curr = "number";
      else if (type && type.contains("color"))        curr = "color";
      //else if (type && type.contains("attrval-src"))  curr = "src";cm-str-img
      else if (type && type.contains("url-str"))  curr = "src";
      else if (token.string.contains("curveOptions"))   curr = "curve";
      //else if (/spring\([\d\,]*\)/.test(token.string)) curr = "spring";
      else    curr = false;

      // [2] If this is the start of the condition, insert the widget
      // -----------------
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
          console.log(token.string);
          var src = token.string.replace(/["']/g,"");
          w = get_img(src);
          var end_pos = {line: line_num, ch: ch - 1 + token.string.length};
          widg = cm.markText(insert_pos, end_pos, {
            replacedWith: w.el
            //atomic: true,
          });
        }
        else if (curr == "curve") {
          console.log("FOUND CURVE");

          function isFolded() {
            for (var i = 0; i < marksCache.length; ++i)
              if (marksCache[i].__isFold) return true;
            return false;
          }

          console.log(isFolded());

          cm.foldCode(pos.line, {
            rangeFinder: CodeMirror.fold.brace,
            widget: "~~~ Sparkline ~~~"
          }, "fold");
        }
        else if (curr == "spring") {
          w = get_spring(token.string);
          var end_pos = {line: line_num, ch: ch - 1 + token.string.length};
          widg = cm.markText(insert_pos, end_pos, {
            replacedWith: w.el
            //atomic: true,
          });
        }
        if (w && w.obj.setWidget) w.obj.setWidget(widg);
      }

      // So that we don't insert a widget for each character of the token
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
        },
        "*fromWidget"
        // ^ let codemirror know that the change came from
        // the widget and therefore not to trigger new widgets
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
      nav.current.cm.replaceRange(
        (val + ext),
        pos,
        {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        },
        "*fromWidget"
        // ^ let codemirror know that the change came from
        // the widget and therefore not to trigger new widgets
      );
    }
    // DOWN KEY
    else if (e.keyCode == 40) {
      e.preventDefault();
      val = Math.round((val - step) * 100) / 100;
      nav.current.cm.replaceRange(
        (val + ext),
        pos,
        {
          line: pos.line,
          ch: (pos.ch + curr_text.length)
        },
        "*fromWidget"
        // ^ let codemirror know that the change came from
        // the widget and therefore not to trigger new widgets
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
        $(swatchEl).children().remove();
      }, 500);
      
      swatchEl.removeAttribute("data-colorpicker-active");
      return;
    }

    swatchEl.setAttribute("data-colorpicker-active", true);
    pickerEl = document.querySelector("#templates .c-picker").cloneNode(true);
    $(swatchEl).append(pickerEl);

    var colorPicker = new ColorPicker(pickerEl);



    // ________________________________
    // 
    // On widget change
    //
    colorPicker.onChange(function(newColor){

      // Register this picker with the global controller
      ColorController.setPicker(colorPicker);

      var cm = nav.current.cm;

      // [A] get the range
      var replaceStart = textPos;
      var replaceEnd = { line: textPos.line, ch: (textPos.ch + currColor.length) };
      
      // [B] buffer these changes
      cm.operation(function(){
        // [0] remove the widget (this is very important!)
        self.widget.clear();
        // [1] replace the text (removing the widget)
        nav.current.cm.replaceRange(
          newColor,
          replaceStart,
          replaceEnd,
          "*fromWidget" // let codemirror know that the change came from the widget and therefore not to trigger new widgets
        );
        // [2] restore the widget
        nav.current.cm.markText(replaceStart, replaceEnd, {
          replacedWith: $el
        });
      });


      // [C] Set the new color and cache the string to measure later
      swatchEl.style.backgroundColor = newColor;
      currColor = newColor;
    });
    //
    // End widget change
    // 
    // ________________________________


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
  el.className = 'imgwidget';

  var img = new Image();
  img.onerror = function() {
  };
  img.onload = function() {
    el.style.backgroundImage = "url(" + path + ")";
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center center";
  };
  img.src = path;

  return {obj: {}, el: el};
}




