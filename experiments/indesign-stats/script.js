$(document).ready(function(){



	// modified from http://html5demos.com/file-api
	var holder = document.getElementById('holder'),
	     state = document.getElementById('status');

	if (typeof window.FileReader === 'undefined') {
	    state.className = 'fail';
	} else {
	    state.className = 'success';
	    state.innerHTML = 'Ready';
	}

	holder.ondragover = function() {
	    this.className = 'hover';
	    return false;
	};
	holder.ondragend = function() {
	    this.className = '';
	    return false;
	};
	holder.ondrop = function(e) {
	    this.className = '';
	    e.preventDefault();

	    var file = e.dataTransfer.files[0],
	        reader = new FileReader();
	    reader.onload = function(event) {
	        // console.log(event.target);
	        // holder.innerText = event.target.result;
	        var txt = event.target.result;
	        parse_data(txt);
	    };
	    // console.log(file);
	    reader.readAsText(file);

	    return false;
	};

	function draw_toolbox() {
		tools = {
			box1: [
				{
					name: "SELECTION_TOOL",
					img: "1.png"
				},
				{
					name: "DIRECT_SELECTION_TOOL",
					img: "2.png"
				},
				{
					name: "PAGE_TOOL",
					img: "3.png"
				},
				{
					name: "GAP_TOOL",
					img: "4.png"
				},
				{
					name: "CONTENT_COLLECTOR_TOOL",
					img: "5.png"
				},
				{
					name: "CONTENT_PLACER_TOOL",
					img: "6.png"
				},
			],
			box2: [
				{
					name: "TYPE_TOOL",
					img: "7.png"
				},
				{
					name: "LINE_TOOL",
					img: "8.png"
				},
				{
					name: "PEN_TOOL",
					img: "9.png"
				},
				{
					name: "PENCIL_TOOL",
					img: "10.png"
				},
				{
					name: "RECTANGLE_FRAME_TOOL",
					img: "11.png"
				},
				{
					name: "RECTANGLE_TOOL",
					img: "12.png"
				},
			],
			box3: [
				{
					name: "SCISSORS_TOOL",
					img: "13.png"
				},
				{
					name: "ROTATE_TOOL",
					img: "14.png"
				},
				{
					name: "GRADIENT_TOOL",
					img: "15.png"
				},
				{
					name: "GRADIENT_FEATHER_TOOL",
					img: "16.png"
				},
			],
			box4: [
				{
					name: "NOTE_TOOL",
					img: "17.png"
				},
				{
					name: "EYE_DROPPER_TOOL",
					img: "18.png"
				},
				{
					name: "HAND_TOOL",
					img: "19.png"
				},
				{
					name: "ZOOM_TOOL",
					img: "20.png"
				},
			],
			box_type: [
				{
					name: "TYPE_ON_A_PATH_TOOL",
					img: "21.png"
				},
			],
			box_eyedrop: [
				{
					name: "MEASURE_TOOL",
					img: "22.png"
				},
			],
			box_tform: [
				{
					name: "TRANSFORM_TOOL",
					img: "23.png"
				},
				{
					name: "SCALE_TOOL",
					img: "24.png"
				},
				{
					name: "SHEAR_TOOL",
					img: "25.png"
				},
			],
			box_shape: [
				{
					name: "ELLIPSE_TOOL",
					img: "26.png"
				},
				{
					name: "POLYGON_TOOL",
					img: "27.png"
				},
			],
			box_frame: [
				{
					name: "POLYGON_FRAME_TOOL",
					img: "29.png"
				},
				{
					name: "ELLIPSE_FRAME_TOOL",
					img: "28.png"
				},
			],
			box_pencil: [
				{
					name: "SMOOTH_TOOL",
					img: "30.png"
				},
				{
					name: "ERASE_TOOL",
					img: "31.png"
				},
			],
		}


		function draw_box(name, arr) {
			var html = '<div class="box ' + name +'">';
			for (var i = 0; i < arr.length; i++) {
				html += '<img id="' + arr[i].name + '" src="img/' + arr[i].img + '"/>';
			}
			html += '</div>';
			return html;
		}


		var tbox = document.getElementById("toolbox");
		var html = [
			draw_box("box1", tools.box1),
			draw_box("box2", tools.box2),
			draw_box("box3", tools.box3),
			draw_box("box4", tools.box4),
			draw_box("box-extra box-type", tools.box_type),
			draw_box("box-extra box-eyedrop", tools.box_eyedrop),
			draw_box("box-extra box-tform", tools.box_tform),
			draw_box("box-extra box-shape", tools.box_shape),
			draw_box("box-extra box-frame", tools.box_frame),
			draw_box("box-extra box-pencil", tools.box_pencil),
		].join("");

		tbox.innerHTML = html;

	}

	draw_toolbox();


	function parse_data(data) {

		// var data = document.getElementById("data").innerText;
	    // alert(data);

		var lines = data.split(/\r|\n/);
		var eachtool = {};

		for (var i = 0; i < lines.length; i++) {
			var parts = lines[i].split(", ");
			var toolname = parts[0];
			var timestamp;


			lines[i] = {
				toolname: toolname
			}

			if (parts[1]) {
				lines[i].timestamp = parseInt(parts[1]);
			}

		}

		for (var i = 0; i < lines.length; i++) {

			var toolname = lines[i].toolname;


			if (eachtool[toolname]) {
				eachtool[toolname].count += 1;
			}

			else {
				eachtool[toolname] = {
					count: 1,
					timespent: 0
				}
			}

			
			if (i + 1 < lines.length){
				var timespent = lines[i+1].timestamp - lines[i].timestamp;
				var spent = parseFloat(timespent / 1000);
				if (isNaN(spent)) spent = 0;
				eachtool[toolname].timespent += spent;
			}

		}


		var eachtool_array = [];
		for (t in eachtool) {
			if (t !== "") {
				var tool = eachtool[t];
				tool.name = t;
				if (t.indexOf("-------") !== -1 ) tool.name = "(Restart InDesign)";
				eachtool_array.push(tool);
			}
		}

		eachtool_array = eachtool_array.sort(function(a,b){
			return b.timespent - a.timespent;
		});

		var max_time = Math.pow(eachtool_array[0].timespent, 1/10);

		console.log(eachtool_array);


		var html = "";
		html += "<div>"
		html += "<span class='time'>Seconds</span>";
		html += "<span class='time'>Cube root</span>";
		html += "<span class='count'>Count</span>";
		html += "<span class='name'>Tool</span>";
		html += "</div>";

		for (var i = 0; i < eachtool_array.length; i++) {
			var tool = eachtool_array[i];
			html += "<div>"
			html += "<span class='time'>" + parseInt(tool.timespent) + "</span>";
			html += "<span class='time'>" + parseInt(Math.pow(parseInt(tool.timespent), 1/5))/2 + "</span>";
			html += "<span class='count'>" + tool.count + "</span>";
			html += "<span class='name'>" + tool.name + "</span>";
			html += "</div>";


			var size = (Math.pow(tool.timespent, 1/10) / max_time) + 0.2;
			var icon = document.getElementById(tool.name);
			if (icon) icon.style.webkitTransform = 'scale(' + size +')';
			if (icon) icon.style.opacity = size;
		}

		$("#log").html(html).addClass("loaded");

	}

});
