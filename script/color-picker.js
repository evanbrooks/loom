(function() {
  function halt(e) {
    e.preventDefault();
    e.stopPropagation();
  }


  // ___________________________________________________________
  //
  // C O L O R   P I C K E R
  //
  // This is a mess right now.
  // Should be using some kind of ui framework
  // for sliders but isntead it's a hacked together
  // free-for-all!


  // U T I L I T I E S
  function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    // return [r * 255, g * 255, b * 255];
    return {
      r: parseInt(r * 255, 10),
      g: parseInt(g * 255, 10),
      b: parseInt(b * 255, 10)
    };
  }

  function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
  }

  function rgb2hsv (r,g,b) {
     var computedH = 0;
     var computedS = 0;
     var computedV = 0;

     //remove spaces from input RGB values, convert to int
     var r = parseInt( (''+r).replace(/\s/g,''),10 ); 
     var g = parseInt( (''+g).replace(/\s/g,''),10 ); 
     var b = parseInt( (''+b).replace(/\s/g,''),10 ); 

     if ( r===null || g===null || b===null ||
         isNaN(r) || isNaN(g)|| isNaN(b) ) {
       alert ('Please enter numeric RGB values!');
       return;
     }
     if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
       alert ('RGB values must be in the range 0 to 255.');
       return;
     }
     r=r/255; g=g/255; b=b/255;
     var minRGB = Math.min(r,Math.min(g,b));
     var maxRGB = Math.max(r,Math.max(g,b));

     // Black-gray-white
     if (minRGB==maxRGB) {
      computedV = minRGB;
      return [0,0,computedV];
     }

     // Colors other than black-gray-white:
     var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
     var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
     computedH = 60*(h - d/(maxRGB - minRGB));
     computedS = (maxRGB - minRGB)/maxRGB;
     computedV = maxRGB;
     return [computedH,computedS,computedV];
  }


  // ___________________________________________________________
  // 
  // T H U M B
  //
  // Supposed to be a generic slider element for x,y, or grid slides,
  // but really doesn't work that great yet. Has some
  // dead code in it to support things like wrap-around (a la Asteroids)
  // and looping wheels instead of sliders, but those don't 
  // really work yet.


  function Thumb(el, opts) {
    var self = this;
    var el = el;
    var dad = el.parentNode;
    //var el = document.createElement("div");
    //el.setAttribute("data-el", true);
    //document.body.appendChild(el);

    var pos   = {x: 0, y: 0};
    var size  = {w: 0, h: 0};

    var mdown = {x: 0, y: 0};
    var ppos  = {x: 0, y: 0};

    var xlimit = dad.offsetWidth;
    var ylimit = dad.offsetHeight;

    self.init = function() {
      self.dragging = false;
      el.addEventListener("mousedown", down);
      el.addEventListener("touchstart", down);

      dad.addEventListener("mousedown", snapdown);
      dad.addEventListener("touchstart", snapdown);

      document.addEventListener("mousemove", move);
      document.addEventListener("touchmove", move);

      document.addEventListener("mouseup", end);
      document.addEventListener("touchend", end);


      if (opts.wraparound) {
      	self.pos = wrappos;
      }
      else if (opts.overflow) {
      	self.pos = overpos;
      }
      else {
      	self.pos = contrainpos;
      }
    }


    function contrainpos(x, y) {
      pos.x = opts.scrollx ? Math.min(Math.max(parseInt(x), 0), xlimit) : 0;
      pos.y = opts.scrolly ? Math.min(Math.max(parseInt(y), 0), ylimit) : 0;
      el.style.webkitTransform = "translate3d("+pos.x+"px,"+pos.y+"px,0)";

      signal();
    }

    function wrappos(x, y) {
      pos.x = opts.scrollx ? x % xlimit : 0;
      pos.y = opts.scrolly ? y % ylimit : 0;
      el.style.webkitTransform = "translate3d("+pos.x+"px,"+pos.y+"px,0)";

      signal();
    }

    function overpos(x, y) {
      pos.x = opts.scrollx ? x : 0;
      pos.y = opts.scrolly ? y : 0;
      el.style.webkitTransform = "translate3d("+(x % xlimit)+"px,"+(y % ylimit)+"px,0)";

      signal();
    }



    self.drag = function(x, y) {
      self.pos(
        ppos.x + x - mdown.x, 
        ppos.y + y - mdown.y
      );
    }

    self.setPos = function(percent, dir) {
    	if (dir=="y"){
        self.pos(pos.x, percent * ylimit)
      } else {
        self.pos(percent * xlimit, pos.y)
      }
    }

    self.setAllPos = function(percentX, percentY) {
      self.pos(
        percentX * xlimit,
        percentY * ylimit
      )
    }


    var snapdown = function(e) {
      halt(e);

      var off = $(opts.picker.el).offset();
      var scrTop = $(window).scrollTop();

      // Hacky touch integration
      eventX = e.clientX || e.changedTouches[0].pageX;
      eventY = e.clientY || e.changedTouches[0].pageY;

      self.pos(
        eventX - /*dad.offsetLeft -*/ off.left,
        eventY - /*dad.offsetTop -*/ off.top + scrTop
      );

      down(e);
    }


    var down = function(e) {
      halt(e);
      self.dragging = true;

      eventX = e.clientX || e.changedTouches[0].pageX;
      eventY = e.clientY || e.changedTouches[0].pageY;

      mdown = {x: eventX, y: eventY};

      ppos.x = pos.x;
      ppos.y = pos.y;
    }

    var move = function(e) {
      if (self.dragging) {
        halt(e);
        eventX = e.clientX || e.changedTouches[0].pageX;
        eventY = e.clientY || e.changedTouches[0].pageY;
        self.drag(eventX, eventY);
      }
    }

    var end = function(e) {
      if (self.dragging) {
        halt(e);
        self.dragging = false;
      }
    }

    var signal = function() {
    	 if (opts.cb) {
    	 	opts.cb({
    	 		x: pos.x / xlimit,
    	 		y: pos.y / ylimit
    	 	});
    	 }
    }

    self.init();
  }

  function Slider(picker, container) {
  	var self = this;
    var el = document.createElement("div");
    el.className = "c-thumb";

    var w = container.offsetWidth;
    var h = container.offsetHeight;
    var dir;
    if (w > h) {
      dir = "x";
      container.style.background = rainbowGradH;
    }
    else {
      dir = "y";
      container.style.background = rainbowGradV;
    }

    container.appendChild(el);


    self.change = function(){console.log("hi")};
    self.onChange = function(cb) {
    	self.change = cb;
    }

    self.setHue = function(hue){
    	var amount = (hue / 360);
    	looper.setPos(amount, dir);
    }

    function update(data) {
    	var hue = (1 - data[dir]) * 360; // from center
    	self.change(hue);
    }

    var looper = new Thumb(el, {
      scrollx: (w > h),
      scrolly: (w < h),
      cb: update,
      picker: picker
  	});
  }


  function DetailWheel(picker, container, diff) {
  	var self = this;
    var el = document.createElement("div");
    el.className = "c-looper";


    var w = container.offsetWidth;
    var h = container.offsetHeight;
    el.style.width      = w  + "px";
    el.style.height     = h + "px";

    container.appendChild(el);

    self.change = function(){console.log("hi");};
    self.onChange = function(cb) {
      self.change = cb;
    };

    var last = 0;
    function update(data) {
      var delta = data.y - last; // from center
      self.change(delta);
      last = data.y;
    }

    self.setHue = function(h) {
      last = 0;
      container.style.background = detailGradient(h, diff);
    };

    var looper = new Thumb(el, {
      scrollx: (w > h),
      scrolly: (w < h),
      overflow: true,
      cb: update,
      picker: picker
    });
  }

  function OpacSlider(picker, container) {
    var self = this;
    var el = document.createElement("div");
    el.className = "c-thumb";

    container.appendChild(el);

    var w = container.offsetWidth;
    var h = container.offsetHeight;
    var dir;
    if (w > h) {
      dir = "x";
    }
    else {
      dir = "y";
    }


    self.change = function(){console.log("hi")};
    self.onChange = function(cb) {
      self.change = cb;
    };

    function update(opac) {
      self.change(opac);
    }

    self.setColor = function(rgb) {
      container.style.background = opacGrad(rgb, dir);
    };

    var looper = new Thumb(el, {
      scrollx: (w > h),
      scrolly: (w < h),
      cb: update,
      picker: picker
    });
  }


  function Grid(picker, el) {
    var self = this;
  
    var thumb = new Thumb(el.querySelector(".c-thumb"), {
      scrollx: true,
      scrolly: true,
      cb: update,
      picker: picker
    });

    self.change = function(){console.log("hi")};
    self.onChange = function(cb) {
    	self.change = cb;
    }

    // http://stackoverflow.com/questions/3423214/convert-hsb-color-to-hsl
    function update(data) {
    	self.change(data);
    }

    self.setPos = function(x, y){
      thumb.setAllPos(x, y);
    }

  	self.setHue = function(h) {
  		el.style.background = gridGradient(h);
  	}
  }

  // ---------------

  var blackGradV = "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)";
  var rainbowGradV = "linear-gradient(to top, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)";
  var rainbowGradH = "linear-gradient(to left, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)";

  function gridGradient(hue) {
  	return blackGradV + ", " + hueGrad(hue, "x") + ", white";
  }

  function hueGrad(hue, XorY) {
    var dir = XorY == "x" ? "right" : "top";
  	var start = "hsla(" + hue + ", 100%, 50%, 0)";
  	var end = "hsla(" + hue + ", 100%, 50%, 1)";
  	return "linear-gradient(to " + dir + ", " + start + " 0%, " + end + " 100%)";
  }

  function opacGrad(rgb, XorY) {
    var dir = XorY == "x" ? "right" : "top";
  	var start = "rgba(" + rgb.r + ", " + rgb.g +", " + rgb.b + ", 0)";
  	var end =   "rgba(" + rgb.r + ", " + rgb.g +", " + rgb.b + ", 1)";
  	return "linear-gradient(to " + dir + ", " + start + " 0%, " + end + " 100%)";
  }

  function detailGradient(hue, diff) {
  	var start = "hsla(" + (hue - diff) + ", 100%, 50%, 1)";
  	var mid = "hsla(" + hue + ", 100%, 50%, 1)";
  	var end = "hsla(" + (hue + diff) + ", 100%, 50%, 1)";
  	return "linear-gradient(to top, " + start + " 0%, " + mid + " 50%, " + end + " 100%)";
  }


  function Picker(el) {

    var self = this;

    self.el = el;

    var hue   = 30;
    var sat   = 0.5;
    var black = 0.5;
    var alpha = 1;

    var bgel = el.querySelector(".c-bg");
    var previewel = el.querySelector(".c-preview");
    var gridThumb = el.querySelector(".c-grid .c-thumb");
    var opacThumb = el.querySelector(".c-opacity .c-thumb");
    var hueThumb = el.querySelector(".c-hue .c-thumb");
    var diff = 30;

    var valGrid       = new Grid(self, el.querySelector(".c-grid"));
    var spectrumSlider= new Slider(self, el.querySelector(".c-spectrum"));
    //var detailWheel   = new DetailWheel(self, el.querySelector(".c-precise"), diff);
    var opacSlider    = new OpacSlider(self, el.querySelector(".c-alpha"));


    self.pos = { x: 0, y: 0 };

    self.moveTo = function(x, y) {
      self.pos = {
        x: x,
        y: y
      };
      el.style.left = x + "px";
      el.style.top  = y + "px";
    }

    // _______________
    //
    // Str must be parseable by d3's rgb() method,
    // therefore rgba values are not valid
    //
    // (for demo purposes we now never return rgba values)
    // 
    self.setColor = function(str) {

      console.log("received: " + str);

      var rgb = d3.rgb(str);
      var hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);

      console.log(hsv);

      hue   = 360 - parseInt(hsv[0]);
      sat   = hsv[1];
      black = 1 - hsv[2];

      opacSlider.setColor(rgb);
      valGrid.setHue(hue);
      valGrid.setPos(sat, black);
      spectrumSlider.setHue(hue);
      // detailWheel.setHue(hue);
      update();
    }

    self.receiveRemote = function(str) {
      //
    }

    self.change = function(){};
    self.onChange = function(cb) {
      self.change = cb;
    }

    // Trying to organize my poorly
    // structured code
    var BUSY_RIGHT_NOW = false;
    function update() {

      if (BUSY_RIGHT_NOW) return;
      BUSY_RIGHT_NOW = true;

      var c = hsvToRgb((1-hue)/360, sat, black);

      var rgba = "rgba(" + c.r + "," + c.g + "," + c.b + "," + alpha +")";
      var rgb = "rgb(" + c.r + "," + c.g + "," + c.b + ")";
      opacSlider.setColor(c);
      previewel.style.background  = rgba;
      gridThumb.style.background  = rgb;

      console.log("firing onChange: " + rgb);
      self.change(rgb);

      BUSY_RIGHT_NOW = false;

    }


    spectrumSlider.onChange(function(h){
      hue = h;
      
      valGrid.setHue(hue);
      //detailWheel.setHue(hue);

      update();
    });

    opacSlider.onChange(function(o){
      alpha = parseInt(100*(1 - o.y))/100;
      update();
    });

    // detailWheel.onChange(function(delta){
    //   hue += delta * diff;

    //   valGrid.setHue(hue);
    //   spectrumSlider.setHue(hue);

    //   update();
    // });

    valGrid.onChange(function(val){
      console.log(val);
      black = 1 - val.y;
      sat   = val.x;
      update();
    });

    //self.setColor("blue");
  }

  function ColorController() {
    var self = this;
    var lastPicker;

    self.setPicker = function(picker) {
      lastPicker = picker;
    }
    self.setColor = function(incoming) {
      console.log("controller: " + incoming);
      if (lastPicker) {
        lastPicker.receiveRemote(incoming);
      }
    }
  }

  window.ColorController = new ColorController();
  window.ColorPicker = Picker;


})();
