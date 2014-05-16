var opts = {
  tension: 500,
  friction: 10,
  velocity: 0
};

var sliders = document.querySelectorAll("[type=range]");
for (var i = 0; i < sliders.length; i++) {
  sliders[i].addEventListener("input", slide);
}
function slide(e) {
  var id = this.getAttribute("data-spring");
  opts[id] = parseInt(this.value, 10);
  update();
}

setInterval(function() {
  update();
}, 100);

var anim = new hackySpring();
update();

function update() {
  anim.setup(opts);
  
  var step = 0.01; 
  var values = [0]; 
  var max = 1;
  var min = 0;
  var counter = 0;
  while (!anim.finished() && counter < 2000) {
    var val = anim.next(step);
    values.push(val);
    if (val < min) min = val;
    if (val > max) max = val;
    counter++;
  }

  draw(values);

  function draw(vals) {
    var distort = 2;
    var x = d3.scale.linear().domain([0, 1]).range([0, distort]),
        y = d3.scale.linear().domain([min,max]).range([49, 1]);

    var line = d3.svg.line()
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(d); });


    var svg = d3.select("#graph");

    var len = vals.length*distort;
    svg.attr("width", len);

    var axes = svg.selectAll(".start").data([vals[0], vals[vals.length-1]]);
    axes.enter()
      .append("line")
      .attr("class", "start");
    axes
      .attr("x1", 0  )
      .attr("y1", function(d, i) {  return y(d); })
      .attr("x2", len)
      .attr("y2", function(d, i) {  return y(d); });


    var path = svg.selectAll("path").data([vals]);
    path.enter().append("path");
    path.attr("d", function(d) {  return line(d); });
  }
}