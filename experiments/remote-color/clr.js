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

});

function getSwatches(){
	var colorArr = colorThief.getPalette($("#yourimage")[0], 5);
	for (var i = 0; i < Math.min(5, colorArr.length); i++) {
		$("#swatch"+i).css("background-color","rgb("+colorArr[i][0]+","+colorArr[i][1]+","+colorArr[i][2]+")");
		console.log($("#swatch"+i).css("background-color"));
	}
}	

//Credit: https://www.youtube.com/watch?v=EPYnGFEcis4&feature=youtube_gdata_player
function gotPic(event) {
    if(event.target.files.length == 1 && 
       event.target.files[0].type.indexOf("image/") == 0) {
        $("#yourimage").attr("src",URL.createObjectURL(event.target.files[0]));
    }
}