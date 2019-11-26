/*

The Chaos Game.
Simple canvas-based web page developed by Chris Long for a YouTube video.
November 2019.

You are free to use and modify this web page (comprising the HTML, the CSS and the JavaScript) for any purpose.

*/

// Define a class to represent a 2D point.
// It's easier to pass a Point around than to keep passing separate X and Y coordinates.
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// A few global state variables.
var points;
var pointSize = 4;
var pointCount;
var currentPoint = new Point(0, 0);
var ctx;
var elapsedTime;
var pointsPerSecond;

// Draws the next N points. Called directly from the buttons on the UI.
function drawPoints(n) {
  var start = new Date();
  var numPoints = n;
  while (n > 0) {
    drawNextPoint();
    n--;
  }
  var end = new Date();
  elapsedTime = end - start;
  // Elapsed time is an integer number of milliseconds so this calculation is inaccurate for low values.
  // Let's just calculate it for times over 25ms for now.
  if (elapsedTime > 25) {
    pointsPerSecond = Math.floor(numPoints * 1000 / elapsedTime);
  } else {
    pointsPerSecond = -1;
  }
  updateTextPanel();
}

// Draw a single point on the canvas.
// Defaults to a 0.4 pixel point in black, unless overridden.
// All modern browsers support sub-pixel rendering to a canvas, so drawing with a size
// less than one alters the shading of the affected pixel, rather than setting the whole
// pixel to the specified colour.
function drawPoint(p, size = 0.4, style = "#000000") {

  ctx.fillStyle = style;
  
  if (size < 4) {
    // Draw the point as a square - simple, fast?
    ctx.fillRect(p.x, p.y, size, size);
  } else {
    // Draw the point as a circle - slower?
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, 2*Math.PI);
    ctx.fill();
  }

}

// Called once on page load.
function init() {
  ctx = document.getElementById("displayCanvas").getContext("2d");
  reset('triangle');
}

// Helper for getting random integers.
function randomIntegerLessThan(n) {
  return Math.floor(Math.random() * n);
}

// Callback to update the size of the canvas whenever the window is resized.
// This probably isn't the best way to do this but it works.
function resize() {
  var el = document.getElementById('extra');
  h = el.clientHeight * 0.98;
  ctx.canvas.style.height = h + 'px';
}

// Register the callback.
window.addEventListener('resize', resize, false);

// Clears the canvas and sets up a new set of starting points.
function reset(pattern) {
  
  var el = document.getElementById('extra');

  var w = el.clientWidth;
  var h = el.clientHeight * 0.98;

  ctx.canvas.width = w;
  ctx.canvas.height = h;

  // Clear the canvas.
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  
  // Set up a suitable font.
  ctx.font = "1.0em Arial";
  
  // Initialise the vertices.
  if (pattern == 'triangle') {
    points = [ new Point(w/2, h * 0.05), new Point(w * 0.05, h * 0.95), new Point(w * 0.95, h * 0.95) ];
  } else if (pattern == 'random triangle') {
    // Set the vertices up in a regular triangle.
    points = [ new Point(w/2, h * 0.2), new Point(w * 0.2, h * 0.8), new Point(w * 0.8, h * 0.8) ];
    // Move each one by a random amount so that we end up with a slightly distorted triangle
    // rather than a completely random set of vertices.
    points.forEach(function(p) {
      p.x = p.x + randomIntegerLessThan(w * 0.2) - (w * 0.1);
      p.y = p.y + randomIntegerLessThan(h * 0.2) - (h * 0.1);
    });
  } else if (pattern == 'rectangle') {
    points = [ new Point(w * 0.05, h * 0.05), new Point(w * 0.95, h * 0.05), new Point(w * 0.05, h * 0.95), new Point(w * 0.95, h * 0.95) ];
  } else if (pattern == 'quad') {
    // Set the vertices up in a regular rectangle.
    points = [ new Point(w * 0.20, h * 0.20), new Point(w * 0.20, h * 0.80), new Point(w * 0.80, h * 0.20), new Point(w * 0.80, h * 0.80) ];
    // Move each one by a random amount so that we end up with a slightly distorted rectangle
    // rather than a completely random set of vertices.
    points.forEach(function(p) {
      p.x = p.x + randomIntegerLessThan(w * 0.2) - (w * 0.1);
      p.y = p.y + randomIntegerLessThan(h * 0.2) - (h * 0.1);
    });
    
  }
  
  // Draw markers for the vertices.
  points.forEach(function(p) { drawPoint(p, 6, "#3300ff"); });
 
  // Reset stats.
  pointCount = 0;
  elapsedTime = -1;
  pointsPerSecond = -1;
  
  // Draw starting text.
  updateTextPanel();
}

// Draws the next point according to the Chaos Game algorithm:
//  - Select one of the vertices at random;
//  - Move the current point to be halfway between its current location and the selected vertex;
//  - Draw the new current point.
function drawNextPoint() {
  
  // Pick one of the vertices at random.
  var nextPoint = randomIntegerLessThan(points.length);
  
  // Move the current point halfway to the chosen point.
  // No rounding here because the canvas supports sub-pixel
  // positioning, so we want to keep as much precision as possible.
  // The divisor doesn't have to be 2, here - interesting things happen if you vary it.
  currentPoint.x = currentPoint.x + ((points[nextPoint].x - currentPoint.x) / 2); 
  currentPoint.y = currentPoint.y + ((points[nextPoint].y - currentPoint.y) / 2);
  
  // Draw a point at the updated position.
  drawPoint(currentPoint, pointSize);
  
  // Keep count.
  pointCount++;
  
}

// Called from the UI buttons - updates the point size to be used when drawing subsequent points on screen.
function setPointSize(s) {
  pointSize = s;
  updateTextPanel();
}

// Update the text panel under the canvas with the latest statistics etc.
function updateTextPanel() {
  
  var infoPanel = document.getElementById("infoPanel");
  
  var text = "";
  
  text += "Point size: " + pointSize + " pixels; ";
  text += "Points drawn: " + pointCount + "<br>";

  text += "Elapsed time: ";
    
  if (elapsedTime == 0) {
    text += "< 1 ms; ";
  } else if (elapsedTime > 0) {
    text += elapsedTime + " ms; ";
  } else {
    text += "- ms; ";
  }
  
  text += "Drawing rate: ";
  
  if (pointsPerSecond > 0) {
    text += pointsPerSecond + " points/sec.";
  } else {
    text += " - points/sec.";
  }

  infoPanel.innerHTML = text;
  
}