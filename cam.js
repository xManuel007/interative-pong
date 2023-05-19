const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

// Dimensiones y posición de los paddles
const paddleWidth = 20;
const paddleHeight = 100;
const paddleMargin = 50;
let leftPaddleY = canvasElement.height / 2 - paddleHeight / 2;
let rightPaddleY = canvasElement.height / 2 - paddleHeight / 2;

// Dimensiones y posición de la bolita
const ballSize = 10;
let ballX = canvasElement.width / 2 - ballSize / 2;
let ballY = canvasElement.height / 2 - ballSize / 2;
let ballSpeedX = 3;
let ballSpeedY = 3;

//AI
let singlePlayerMode = false;

function moveAIPaddle() {
  const aiPaddleCenter = rightPaddleY + paddleHeight / 2;
  const ballCenter = ballY + ballSize / 2;

  // Ajusta la velocidad de movimiento de la IA
  const aiSpeed = 3;

  if (aiPaddleCenter < ballCenter) {
    rightPaddleY += aiSpeed;
  } else if (aiPaddleCenter > ballCenter) {
    rightPaddleY -= aiSpeed;
  }

  // Limita la posición vertical del paddle derecho dentro del canvas
  rightPaddleY = Math.max(0, Math.min(canvasElement.height - paddleHeight, rightPaddleY));
}


const drawPaddles = () => {
  canvasCtx.fillStyle = 'grey';

  // Dibujar paddle izquierdo
  const leftPaddleX = paddleMargin;
  canvasCtx.fillStyle = 'blue';
  canvasCtx.fillRect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight);

  // Dibujar paddle derecho
  const rightPaddleX = canvasElement.width - paddleMargin - paddleWidth;
  canvasCtx.fillStyle = 'red';
  canvasCtx.fillRect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight);

  // Dibujar línea en medio
  const middleLineX = canvasElement.width / 2;
  const middleLineYStart = 0;
  const middleLineYEnd = canvasElement.height;
  canvasCtx.strokeStyle = 'black';
  canvasCtx.lineWidth = 2;
  canvasCtx.beginPath();
  canvasCtx.setLineDash([5, 5]); // Opcional: establece un patrón de guiones
  canvasCtx.moveTo(middleLineX, middleLineYStart);
  canvasCtx.lineTo(middleLineX, middleLineYEnd);
  canvasCtx.stroke();
}



const drawBall = () => {
  canvasCtx.fillStyle = 'red';
  canvasCtx.fillRect(ballX, ballY, ballSize, ballSize);
}

const updateBall = () => {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Comprobar colisiones con los bordes del canvas
  if (ballY <= 0 || ballY + ballSize >= canvasElement.height) {
    ballSpeedY *= -1;
  }

  // Comprobar colisiones con los paddles
  if (
    ballX <= paddleMargin + paddleWidth &&
    ballY + ballSize >= leftPaddleY &&
    ballY <= leftPaddleY + paddleHeight
  ) {
    ballSpeedX *= -1;
  }

  if (
    ballX + ballSize >= canvasElement.width - paddleMargin - paddleWidth &&
    ballY + ballSize >= rightPaddleY &&
    ballY <= rightPaddleY + paddleHeight
  ) {
    ballSpeedX *= -1;
  }
}

const onResults = (results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  drawPaddles(); // Dibujar los paddles en cada frame
  drawBall(); // Dibujar la bolita en cada frame
  updateBall(); // Actualizar la posición de la bolita

  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const landmarks = results.multiHandLandmarks[i];
      const hand = results.multiHandedness[i].label;

      // Puedes utilizar los landmarks de cada mano para controlar la posición de los paddles
      const indexFinger = landmarks[8]; // Usaremos la posición del dedo índice
      if (hand === 'Left') {
        leftPaddleY = canvasElement.height * indexFinger.y - paddleHeight / 2;
        // Limitar la posición vertical del paddle izquierdo dentro del canvas
        leftPaddleY = Math.max(0, Math.min(canvasElement.height - paddleHeight, leftPaddleY));
      } else if (hand === 'Right') {
        rightPaddleY = canvasElement.height * indexFinger.y - paddleHeight / 2;
        // Limitar la posición vertical del paddle derecho dentro del canvas
        rightPaddleY = Math.max(0, Math.min(canvasElement.height - paddleHeight, rightPaddleY));
      }

      //drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
      //drawLandmarks(canvasCtx, landmarks, { color: 'blue', lineWidth: 2 });
    }
  }

  canvasCtx.restore();
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});

const gameLoop = () => {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  drawPaddles();
  drawBall();
  updateBall();

  if (singlePlayerMode) {
    moveAIPaddle(); // Mueve el paddle de la IA en modo de un jugador
  }

  requestAnimationFrame(gameLoop);
}

const singlePlayerButton = document.getElementById('singlePlayerButton');

singlePlayerButton.addEventListener('click', () => {
  singlePlayerMode = !singlePlayerMode;
});

camera.start();
gameLoop();
