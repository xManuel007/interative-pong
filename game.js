const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

// Dimensiones y posición de los paddles
const paddleWidth = 20;
const paddleHeight = 100;
const paddleMargin = 50;
let leftPaddleY = canvasElement.height / 2 - paddleHeight / 2;
let rightPaddleY = canvasElement.height / 2 - paddleHeight / 2;

//score
var leftScore = 0;
var rightScore = 0;


// Dimensiones y posición de la bolita
const ballSize = 15;
let ballX = canvasElement.width / 2 - ballSize / 2;
let ballY = canvasElement.height / 2 - ballSize / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;


//Pausa
const pauseButton = document.getElementById('pause-button');
const playButton = document.getElementById('play-button');


const showHands = document.getElementById('cCB1')

let isPaused = true;
let handsShowing = false;

const handleShowHands = () => {
  handsShowing = !handsShowing
}

showHands.addEventListener('click', () => {
  handleShowHands()
})

pauseButton.addEventListener('click', () => {
  isPaused = true;
  resetBall()
});

playButton.addEventListener('click', () => {
  isPaused = false;
});


//score
const drawScores = () => {
  const leftScoreElement = document.getElementById('left-score');
  const rightScoreElement = document.getElementById('right-score');

  leftScoreElement.textContent = `Score: ${leftScore}`;
  rightScoreElement.textContent = `Score: ${rightScore}`;
}

const winner = () => {
  const winnerText = document.getElementById('winner-text')
  if(leftScore == 10){
    isPaused = true
    resetBall();
    winnerText.textContent = `Right Winner winner chicken dinner`
  }else if (rightScore == 10){
    isPaused = true
    resetBall();
    winnerText.textContent = `Left Winner winner chicken dinner`
  }
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

const resetBall = () => {
    ballX = canvasElement.width / 2 - ballSize / 2;
    ballY = canvasElement.height / 2 - ballSize / 2;
    ballSpeedX *= 1; // Cambia la dirección de la bola
}

const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', () => {
  leftScore = 0;
  rightScore = 0;
  drawScores();
  isPaused = true;
  resetBall()
});

const updateBall = () => {
  if (!isPaused) {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
  }
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

  // Comprobar colisiones con las paredes derecha e izquierda
  if (ballX <= 0) {
    rightScore++; // Incrementar el puntaje del lado derecho
    resetBall();
  } else if (ballX + ballSize >= canvasElement.width) {
    leftScore++; // Incrementar el puntaje del lado izquierdo
    resetBall();
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


        //Mano derecha

        if(handsShowing) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
          drawLandmarks(canvasCtx, landmarks, { color: 'blue', lineWidth: 2 });
        }
        //Mano derecha 

      } else if (hand === 'Right') {
        rightPaddleY = canvasElement.height * indexFinger.y - paddleHeight / 2;
        // Limitar la posición vertical del paddle derecho dentro del canvas
        rightPaddleY = Math.max(0, Math.min(canvasElement.height - paddleHeight, rightPaddleY));

        //Mano izquierda
        if(handsShowing) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
          drawLandmarks(canvasCtx, landmarks, { color: 'red', lineWidth: 2 });
        }
        //Mano izquierda
      }
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
  if (!isPaused) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    drawPaddles();
    drawBall();
    updateBall();
    drawScores();
    winner();
  }

    requestAnimationFrame(gameLoop);
}


camera.start();
gameLoop();
