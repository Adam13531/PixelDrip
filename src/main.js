const urlParams = new URLSearchParams(window.location.search);

const canvasWidth = defaultTo(parseInt(urlParams.get("w"), 10), 800);
const canvasHeight = defaultTo(parseInt(urlParams.get("h"), 10), 600);
const bpp = 4;

function defaultTo(val, defaultVal) {
  return val == null || isNaN(val) ? defaultVal : val;
}

function main() {
  setupCanvas();
  setupDrawLoop();
}

function getCanvasCtx() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  return ctx;
}

function setupCanvas() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.setAttribute("width", canvasWidth);
  canvas.setAttribute("height", canvasHeight);
  canvas.addEventListener("click", onMouseDown);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "white";
  ctx.font = "60px Arial";
  ctx.fillText("Click for colors", 5, 50);
}

function onMouseDown(e) {
  const { clientX } = e;
  const canvas = document.getElementById("canvas");

  const rect = canvas.getBoundingClientRect();
  const scaledX = Math.floor((clientX / rect.width) * canvasWidth);

  const size = canvasWidth * 2;

  const ctx = getCanvasCtx();
  const imgd = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imgd.data;

  drawSquareGradient(pixels, scaledX, size);

  ctx.putImageData(imgd, 0, 0);
}

function setupDrawLoop() {
  requestAnimationFrame(drawFrame);
}

function randInt(lowerBound, upperBound) {
  if (lowerBound > upperBound) {
    var temp = lowerBound;
    lowerBound = upperBound;
    upperBound = temp;
  }

  return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
}

function drawFrame() {
  const ctx = getCanvasCtx();
  const imgd = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imgd.data;

  for (let x = 0; x < canvasWidth; ++x) {
    for (let y = canvasHeight; y > 0; --y) {
      const colorAbove = getPixel(pixels, x, y - 1);
      if (Math.random() < 0.15) {
        // Get closer to white based on the color above
        if (colorAbove.r > 0 && colorAbove.g > 0 && colorAbove.b > 0) {
          colorAbove.r += Math.random() / 100;
          colorAbove.g += Math.random() / 100;
          colorAbove.b += Math.random() / 100;
        }
        setPixel(pixels, x, y, colorAbove);
      } else if (Math.random() < 0.25) {
        // Get closer to black
        const delta = 0.65;
        colorAbove.r -= delta;
        colorAbove.g -= delta;
        colorAbove.b -= delta;
        setPixel(pixels, x, y, colorAbove);
      } else if (Math.random() < 0.005) {
        if (Math.random() < 0.7) {
          colorAbove.r += 43;
        }
        if (Math.random() < 0.7) {
          colorAbove.g += 43;
        }
        if (Math.random() < 0.7) {
          colorAbove.b += 43;
        }
        setPixel(pixels, x, y, colorAbove);
      }
    }
  }

  // Draw the ImageData at the given (x,y) coordinates.
  ctx.putImageData(imgd, 0, 0);

  requestAnimationFrame(drawFrame);
}

function getIndexInPixels(x, y) {
  return (y * canvasWidth + x) * bpp;
}

function getPixel(pixels, x, y) {
  const index = getIndexInPixels(x, y);
  return new Color(pixels[index], pixels[index + 1], pixels[index + 2]);
}

function setPixel(pixels, x, y, color) {
  const index = getIndexInPixels(x, y);
  pixels[index] = color.r;
  pixels[index + 1] = color.g;
  pixels[index + 2] = color.b;
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  static random() {
    return new Color(randInt(0, 255), randInt(0, 255), randInt(0, 255));
  }
}

function drawSquare(pixels, x, y, size, color) {
  const halfSize = Math.floor(size / 2);
  const minX = Math.max(0, x - halfSize);
  const maxX = Math.min(canvasWidth, x + halfSize);
  const minY = Math.max(0, y - halfSize);
  const maxY = Math.min(canvasHeight, y + halfSize);
  for (let drawX = minX; drawX <= maxX; ++drawX) {
    for (let drawY = minY; drawY <= maxY; ++drawY) {
      setPixel(pixels, drawX, drawY, color);
    }
  }
}

function drawSquareGradient(pixels, x, size) {
  let r = Math.random() * 255;
  let g = Math.random() * 255;
  let b = Math.random() * 255;
  const endR = Math.random() * 255;
  const endG = Math.random() * 255;
  const endB = Math.random() * 255;
  const incR = (endR - r) / size;
  const incG = (endG - g) / size;
  const incB = (endB - b) / size;

  const halfSize = Math.floor(size / 2);
  const minX = Math.max(0, x - halfSize);
  const maxX = Math.min(canvasWidth, x + halfSize);
  const minY = 0;
  const maxY = Math.ceil(canvasHeight / 20);
  for (let drawX = minX; drawX <= maxX; ++drawX) {
    for (let drawY = minY; drawY <= maxY; ++drawY) {
      setPixel(pixels, drawX, drawY, new Color(r, g, b));
    }

    r += incR;
    g += incG;
    b += incB;
  }
}

window.onload = main;
