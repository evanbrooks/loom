// First tell ansible to ignore received messages
// about auto-refresh. Instead, we'll just act
// as the color picker
window.LOOM_PART = true;



// This part is left over from the colorthief demo
// that this is based on. Still important though.

var desiredWidth;

$(document).ready(function() {
    console.log('onReady');
	$("#takePictureField").on("change",gotPic);
	$("#yourimage").load(getSwatches);
	desiredWidth = window.innerWidth;
    
    if(!("url" in window) && ("webkitURL" in window)) {
        window.URL = window.webkitURL;   
    }
	
	window.colorThief = new ColorThief();

	var pickerEl = document.querySelector(".c-picker");
	window.picker = new ColorPicker(pickerEl);

	picker.onChange(function(newColor){
		console.log(newColor);
	  socket.emit('message', {
	    remoteColor: newColor
	  });
	});

});

function getSwatches(){
	var colorArr = colorThief.getPalette($("#yourimage")[0], 5);

	for (var i = 0; i < Math.min(5, colorArr.length); i++) {
		$("#swatch"+i).css("background-color","rgb("+colorArr[i][0]+","+colorArr[i][1]+","+colorArr[i][2]+")");
		$("#swatch"+i).on("touchstart", function(e){
			var clrStr = $(this).css("background-color");
			window.picker.setColor(clrStr);
		});
		if (i == 0) {
			var clrStr = $("#swatch"+i).css("background-color");
			window.picker.setColor(clrStr);
		}
	}
}	

//Credit: https://www.youtube.com/watch?v=EPYnGFEcis4&feature=youtube_gdata_player
function gotPic(event) {
    if(event.target.files.length == 1 && 
       event.target.files[0].type.indexOf("image/") == 0) {
        $("#yourimage").attr("src",URL.createObjectURL(event.target.files[0]));
    }
}