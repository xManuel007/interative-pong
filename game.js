const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 20;
const paddleHeight = grid * 5; // 100
const paddleWidht = grid
const maxPaddleY = canvas.height - grid - paddleHeight;
const maxPaddleX = canvas.width - grid - 20;


var paddleSpeed = 7;
var ballSpeed = 8;
var LeftScore = 0
var RightScore = 0

const leftPaddle = {
  // Palito apareciendo en medio al inicio
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0,
  dx: 0
};

const rightPaddle = {
  // Palito apareciendo en medio al inicio
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0,
  dx: 0
};

const ball = {
  // Bolita saliendo de enmedio
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
collides = (obj1, obj2) => {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// game loop
loop = () => {
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);
  movePaddles() //move X Y
  movePaddleSystem() //Paddle's mechanic in the walls
  drawLeftPaddle() //draw left paddle
  drawRightPaddle() //draw right paddle
  ballVelocity() //physics to the ball
  scoreSystem() //set the score
  resetSystem() //reset the ball if it got lost
  collideSystem() //ball collide to something
  drawball() //draw the ball
  drawWall() //draw the wall 
  drawWeb() //draw the web
}

movePaddles = () => {
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;
  leftPaddle.x += leftPaddle.dx;
  rightPaddle.x += rightPaddle.dx;
}

movePaddleSystem = () => {
  leftPaddle.y < grid ? leftPaddle.y = grid : null
  leftPaddle.y > maxPaddleY ?  leftPaddle.y = maxPaddleY : null
  
  rightPaddle.y < grid ? rightPaddle.y = grid : null
  rightPaddle.y > maxPaddleY ? rightPaddle.y = maxPaddleY : null 

  leftPaddle.x < grid ? leftPaddle.x = grid : null
  leftPaddle.x > maxPaddleX ? leftPaddle.x = maxPaddleX : null

  rightPaddle.x < grid ? rightPaddle.x = grid : null
  rightPaddle.x > maxPaddleX ? rightPaddle.x = maxPaddleX : null

  leftPaddle.x > maxPaddleX/2 ? leftPaddle.x = maxPaddleX/2 : null
  rightPaddle.x < maxPaddleX/2 ? rightPaddle.x = maxPaddleX/2 : null
}

drawWall = () => {
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }
}

drawWeb = () => {
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

drawball = () => {
  context.fillStyle = 'gray';
  context.fillRect(ball.x, ball.y, ball.width, ball.height);
}

ballVelocity = () => {
  ball.x += ball.dx;
  ball.y += ball.dy;
}
drawLeftPaddle = () =>{
    context.fillStyle = 'grey'; 
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
}

drawRightPaddle = () => {
    context.fillStyle = 'black'; 
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
}

collideSystem = () => {
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }

}

resetSystem = () => {
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }
}

scoreSystem = () => {
  if(ball.x < 0){
    RightScore++
    document.getElementById('LeftScore').innerHTML = 'Score: ' + LeftScore
    document.getElementById('RightScore').innerHTML = 'Score: ' + RightScore
  }else if(ball.x > canvas.width){
    LeftScore++
    document.getElementById('LeftScore').innerHTML = 'Score: ' + LeftScore  
    document.getElementById('RightScore').innerHTML = 'Score: ' + RightScore
  }
}

// Controles para mover el paddle
document.addEventListener('keydown', (e) => {
  // Eje Y
  if (e.key === 'ArrowUp') {
    rightPaddle.dy = -paddleSpeed;
  }
  else if (e.key === 'ArrowDown') {
    rightPaddle.dy = paddleSpeed;
  }
  //Eje X
  else if (e.key === 'ArrowLeft') {
    rightPaddle.dx = -paddleSpeed;
  }
  else if (e.key === 'ArrowRight') {
    rightPaddle.dx = paddleSpeed;
  }


  if (e.key === 'w') {
    leftPaddle.dy = -paddleSpeed;
  }else if (e.key === 's') {
    leftPaddle.dy = paddleSpeed;
  }
  if (e.key === 'a') {
    leftPaddle.dx = -paddleSpeed;
  }else if (e.key === 'd') {
    leftPaddle.dx = paddleSpeed;
  }

  //pause
  if(e.key === 'p'){
    requestAnimationFrame(loop);
  }
});




// Controles, proximamente ver como se pueden mover de diferentes metodos
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    rightPaddle.dy = 0;
    rightPaddle.dx = 0;
  }

  if (e.key === 'w' || e.key === 's' || e.key === 'a' || e.key === 'd') {
    leftPaddle.dy = 0;
    leftPaddle.dx = 0;
  }
});


getMousePos = (evt) => {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

canvas.addEventListener('mousemove', (e) => {
  //comentar lo de abajo para desactivar
  var mousePos = getMousePos(e);
  var cords = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
  console.log(cords)
  rightPaddle.y = mousePos.y;
  rightPaddle.x = mousePos.x;
})


requestAnimationFrame(loop);

/* 
Pendientes:
  Set win
  Set Pause and Play
  If win, play again
  Move with mediaPipe
*/