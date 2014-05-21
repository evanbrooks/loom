// Test javascript functions
// Evan Brooks, 2014

window.addEventListener(
  "mousemove", moveMouse
);

var positionX, positionY;

function moveMouse(evt) {
  positionX = evt.clientX;
  positionY = evt.clientY;
  console.log(positionX);
}