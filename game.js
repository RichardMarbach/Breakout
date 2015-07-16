'use strict';

// ***********************************
// 2D Vector Object
// ***********************************
function Vector2(x, y) {
  this.x = x;
  this.y = y;
}

Vector2.prototype.set = function (x, y) {
  this.x = x;
  this.y = y;

  return this;
};

Vector2.prototype.clone = function () {
  return new Vector2(this.x, this.y);
};

Vector2.prototype.dotProduct = function (vector) {
  return this.x * vector.x + this.y * vector.y;
};

Vector2.prototype.divScalar = function (s) {
  // Make sure s is not 0
  if (s) {
    this.x /= s;
    this.y /= s;
  } else {
    this.set(0, 0);
  }
  return this;
};

Vector2.prototype.multiplyScalar = function (s) {
  this.x *= s;
  this.y *= s;

  return this;
};

Vector2.prototype.normalise = function () {
  return this.clone().divScalar(this.length());
};

Vector2.prototype.add = function (vector) {
  return new Vector2(this.x + vector.x, this.y + vector.y);
};

Vector2.prototype.subtract = function (vector) {
  return new Vector2(vector.x - this.x, vector.y - this.y);
};

Vector2.prototype.length = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector2.prototype.distanceSquared = function (vector) {
  var dx = this.x - vector.x;
  var dy = this.y - vector.y;
  return dx * dx + dy * dy;
};

Vector2.prototype.distanceTo = function (vector) {
  return Math.sqrt(this.distanceSquared(vector));
};

Vector2.prototype.projectX = function (vector) {
  return this.dotProduct(vector) / (vector.x * vector.x + vector.y * vector.y) * vector.x;
};

Vector2.prototype.projectY = function (vector) {
  return this.dotProduct(vector) / (vector.x * vector.x + vector.y * vector.y) * vector.y;
};

Vector2.prototype.reverse = function () {
  this.x = -this.x;
  this.y = -this.y;

  return this;
};

Vector2.prototype.revX = function () {
  this.x = -this.x;

  return this;
};

Vector2.prototype.revY = function () {
  this.y = -this.y;

  return this;
};

Vector2.prototype.normal = function () {
  return this.clone().set(-this.y, this.x);
};

// ***************************
//  Config
// ***************************
var config = {
  // Club
  clubWidth: 50,
  clubHeight: 25,

  // Bricks
  brickLayout: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 0, 0, 2, 0, 0, 3, 0],
    [0, 0, 0, 1, 3, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 2, 3, 0, 2, 0, 3, 2, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 3, 1, 0, 0, 0],
    [0, 3, 0, 0, 2, 0, 0, 3, 0]
  ],
  brickColors: ["#ff2ec2", "#5c2eff", "#2eff44", "#ffd92e"],
  brickPadding: 7,

  // Ball
  ballSpeed: 10,

  // Scoring
  brickScore: 100,
  scorePos: new Vector2(10, 20),

  // GameOver
  gameOverText: "Game Over!",
  winningText: "Winner!",
  restartText: "Press any key to restart",

  gameOverFormat: {
    color: "#2eff44",
    font: "30px Arial",
    align: "center",
  },

  fontSpacing: 40
}

//****************************************
//  Game Object  
//****************************************    
function Game(canvasElement) {
  this.ctx = canvasElement.getContext("2d");

  this.canvasWidth = canvasElement.getAttribute("width");
  this.canvasHeight = canvasElement.getAttribute("height");
  this.blockWidth = config.clubWidth;
  this.blockHeight = config.clubHeight;

  // Create  the club
  this.theClub = new Club(this.canvasWidth / 2,
                          this.canvasHeight - 40,
                          this.blockWidth * 2, this.blockHeight / 2);


  // Create bricks
  this.brickLayout = config.brickLayout;

  this.brickColors = config.brickColors;
  this.brickPadding = config.brickPadding;

  this.brickWidth = this.canvasWidth / 9;
  this.brickHeight = (this.canvasHeight / 2) / this.brickLayout[0].length;

  this.bricks = [];
  // Set for win condition
  this.bricksLeft = 0;

  // Ball object
  // Set also the initial speed with the constructor
  this.theBall;
  this.ballSpeed = config.ballSpeed;

  // States
  this.gameOver = false;

  // Scoring
  this.score = 0;
  this.brickScore = config.brickScore;

  this.scoreOverlay = new TextOverlay(this.ctx, config.scorePos, "Score: " + this.score);

  // GameOver Screen
  this.gameOverScreen = {
    gameOver: new TextOverlay(this.ctx, 
      new Vector2(this.canvasWidth / 2, this.canvasHeight / 2 - config.fontSpacing), 
      config.gameOverText, config.gameOverFormat),

    score: new TextOverlay(this.ctx, 
      new Vector2(this.canvasWidth / 2, this.canvasHeight / 2), 
      "Score:" + this.score, config.gameOverFormat),

    restart: new TextOverlay(this.ctx, 
      new Vector2(this.canvasWidth / 2, this.canvasHeight / 2 + config.fontSpacing), 
      config.restartText, config.gameOverFormat)
  }
}

Game.prototype.initBrickLayout = function () {
  var self = this;
  // Populate bricks array with brick objects
  this.brickLayout.forEach(function (col, y) {
    self.bricks[y] = [];
    col.forEach(function (elem, x) {
      if (elem !== 0) {
        self.bricks[y][x] = new Brick(x * self.brickWidth, y * self.brickHeight,
              self.brickWidth - self.brickPadding, self.brickHeight - self.brickPadding,
              self.brickColors, elem);
      }
    });
  });
};

Game.prototype.endGame = function (text) {
  this.ctx.globalAlpha = 0.8;
  this.ctx.fillStyle = "#000000";
  this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

  this.gameOverScreen.gameOver.text = text;
  this.gameOverScreen.score.text = "Score: " + this.score;

  // Draw out the text elements
  for (var text in this.gameOverScreen) {
    if (this.gameOverScreen[text] instanceof TextOverlay) {
      this.gameOverScreen[text].draw();
    }
  }

  this.score = 0;
};

Game.prototype.updateScore = function () {
  this.scoreOverlay.text = "Score: " + this.score;
  this.scoreOverlay.draw();
};

Game.prototype.update = function () {
  // Execute the update function for the player controlled club
  this.theClub.update(this.canvasWidth);

  // Execute the update function for the ball
  this.theBall.update(this);
};

Game.prototype.render = function () {
  var self = this;
  // Clear the canvas 
  this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

  this.updateScore();

  // Draw the ball 
  this.theBall.draw(this.ctx);

  // Draw the club
  this.theClub.draw(this.ctx);

  // Draw bricks
  this.bricks.forEach(function (col) {
    col.forEach(function (elem) {
      if (elem) {
        elem.draw(self.ctx);
      }
    });
  });
};

Game.prototype.gameLoop = function () {
  if (this.gameOver) {
    if (this.bricksLeft === 0) {
      this.endGame(config.winningText);
    } else {
      this.endGame(config.gameOverText);
    }
  } else {
    // Request a new animation frame from the browser. 
    // Note the use of ECMAScript5 bind() to allow object method to be passed as a callback
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    requestAnimFrame(this.gameLoop.bind(this));

    // Execute the update phase of the animation loop
    this.update();

    // Render everything on the canvas since all positions have just been updated
    this.render();
  }
};

Game.prototype.start = function () {
  // Set paddle to middle
  this.theClub.pos.x = this.canvasWidth / 2 - this.theClub.width / 2;

  // Create the ball
  var ballStartPosX = this.canvasWidth / 2;
  var ballStartPosY = this.canvasHeight - this.canvasHeight / 8 - 50;
  this.theBall = new Ball(this.ballSpeed, ballStartPosX, ballStartPosY);

  // Initialise bricks
  this.initBrickLayout();

  this.render();
  this.gameOver = false;
  // start gameloop
  this.gameLoop();
};

Game.prototype.keyDown = function (event) {
  switch (event.keyCode) {
  case 37:  /* Left arrow was pressed */
    this.theClub.move("LEFT");
    break;
  case 39:  /* Right arrow was pressed */
    this.theClub.move("RIGHT");
    break;
  default:
    if (this.gameOver) {
      this.start();
    }
  }
};

Game.prototype.keyUp = function (event) {
  switch (event.keyCode) {
  case 37:  /* Left arrow was pressed */
  case 39:  /* Right arrow was pressed */
    this.theClub.move("NONE");
    break;
  }
};

//****************************************
//  TextOverlay Object  
//**************************************** 
function TextOverlay (ctx, pos, text, options) {
  this.ctx = ctx;
  this.pos = pos || new Vector2(0, 0);

  options = options || {};

  this.text = text;
  this.color = options.color || "#ffffff";
  this.align = options.align || "start";
  this.font = options.font || "15px Arial";
}

TextOverlay.prototype.draw = function() {
  this.ctx.globalAlpha = 1;
  this.ctx.fillStyle = this.color;
  this.ctx.font = this.font;
  this.ctx.textAlign = this.align;

  this.ctx.fillText(this.text, this.pos.x, this.pos.y);
};

//****************************************
//  Club Object  
//****************************************  
function Club(centerPosX, centerPosY, width, height) {
  this.pos = new Vector2(centerPosX - width / 2, centerPosY - 40);
  this.vel = new Vector2(7, 0);

  this.width = width;
  this.height = height;
  this.moveDir = "NONE";

}

// Define the draw function for the club class
Club.prototype.draw = function (graphCtx) {
  graphCtx.globalAlpha = 1;

  graphCtx.beginPath();
  graphCtx.rect(this.pos.x, this.pos.y, this.width, this.height);

  graphCtx.fillStyle = "blue";
  graphCtx.fill();
  graphCtx.strokeStyle = "gray";
  graphCtx.stroke();
  graphCtx.closePath();
};

// Define the move function for the club class
Club.prototype.move = function (amount) {
  this.moveDir = amount;
};

// Define the update function for the club class
Club.prototype.update = function (canvasWidth) {
  if ((this.moveDir === "LEFT") && (this.pos.x >= -(this.width / 4))) {
    this.pos.x -= this.vel.x;
  } 
  if ((this.moveDir === "RIGHT") && (this.pos.x + this.width * 3 / 4 <= canvasWidth)) {
    this.pos.x += this.vel.x;
  }
};

Club.prototype.getPoint = function (point) {
  switch (point) {
    case 0: // Get center
      return new Vector2(this.pos.x + this.width / 2, this.pos.y + this.height / 2);

    case 1: // Right top
      return new Vector2(this.pos.x + this.width, this.pos.y);

    case 2: // Right bottom
      return new Vector2(this.pos.x + this.width, this.pos.y + this.height);

    case 3: // Left bottom
      return new Vector2(this.pos.x, this.pos.y + this.height);

    case 4: // Left top
      return new Vector2(this.pos.x, this.pos.y);

    default:
      return;
  }
};

Club.prototype.getAxis = function (i) {
  switch (i) {
    case 1: // Right side
      return this.getPoint(1).subtract(this.getPoint(2));

    case 2: // Bottom
      return this.getPoint(2).subtract(this.getPoint(3));

    case 3: // Left
      return this.getPoint(3).subtract(this.getPoint(4));

    case 4: // Top
      return this.getPoint(4).subtract(this.getPoint(1));

    default:
      return;
  }
};

Club.prototype.getNormal = function (i) {
  return this.getAxis(i).normal().normalise();
};

//****************************************
//  Ball Object  
//****************************************  
function Ball(speed, startPosX, startPosY) {
  this.pos = new Vector2(startPosX, startPosY);
  this.dir = new Vector2(0.4, -0.6);
  this.radius = 6;
  this.speed = speed;

  this.futurePos = this.pos.add(new Vector2(this.dir.x * this.speed, this.dir.y * this.speed));
}

// Define the draw function for the ball class
Ball.prototype.draw = function (graphCtx) {
  graphCtx.globalAlpha = 1;

  graphCtx.beginPath();
  graphCtx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
  graphCtx.fillStyle = "rgb(130,130,130)";
  graphCtx.fill();
  graphCtx.strokeStyle = "white";
  graphCtx.stroke();
  graphCtx.closePath();
};

Ball.prototype.checkWallHits = function (canvasWidth) {
  // These checks have been seperated to avoid having
  // the ball get stuck in the walls

  // Has ball hit the right wall
  if (this.pos.x + this.dir.x + this.radius >= canvasWidth) {
    this.pos.x = canvasWidth - this.radius;
    this.dir.revX();
  }
  // Hit left wall
  if (this.pos.x - this.radius <= 0) {
    this.pos.x = this.radius;
    this.dir.revX();
  }

  // Has ball hit the cieling?
  if (this.pos.y + this.dir.y - this.radius <= 0) {
    this.pos.y = this.radius;
    this.dir.revY();
  }
};

Ball.prototype.checkClubHit = function (club) {
  // Check if ball hits the club
  if (this.intersect(club)) {
    this.dir.x = (this.pos.x - (club.pos.x + club.width / 2)) / club.width;
  }
  else if (this.inBox(club)) {
    // Move the ball out of the club
    this.pos.y += club.pos.y - this.pos.y - this.radius;
    this.dir.revY();
  }
};

Ball.prototype.checkBrickCollisions = function (game) {
  var self = this;
  game.bricksLeft = 0;

  game.bricks.forEach(function (col, y) {
    col.forEach(function (brick, x) {
      // Brick isn't removed yet
      if (brick) {
        game.bricksLeft++;

        // Brick destroy flag isn't set
        if (!brick.destroyed) {
          if (self.intersect(brick)) {
            game.score += game.brickScore * brick.life;

            // Decrement brick life 
            if (--brick.life === 0) {
              brick.destroyed = true;
            }
          }
        }

        // Destroy animation has finished playing so remove it
        if (brick.deleted) {
          game.bricks[y][x] = null;
        }
      }
    });
  });

  // Win condition
  if (game.bricksLeft === 0) {
    game.gameOver = true;
  }
};

Ball.prototype.intersect = function (box) {
  var self = this;

  // Iterator
  var i = 1;

  // Cache radius
  var radius = this.radius;

  var CurrentCirclePosition = this.pos;
  var futureBallPosition = this.futurePos;

  // Point of the square
  var currentPoint;
  var normalAxis;

  // Distance between point and circle centers
  var currentPoint2CurrentCirclePosition, currentPoint2futureBallPosition;

  var dotProductFromCurrentBall, dotProductFromFutureBall;

  // Time to collision
  var timeStep;

  // Ball cordinates at collision position
  var collisionPos;

  var collisionPoints = [];

  for ( ; i < 5; i++) {
    currentPoint = box.getPoint(i);

    normalAxis = box.getNormal(i);

    // Calculate distance between line and circle center
    currentPoint2CurrentCirclePosition = this.pos.clone().subtract(currentPoint);
    currentPoint2futureBallPosition = futureBallPosition.subtract(currentPoint);

    // distance between ball and axis
    dotProductFromCurrentBall = normalAxis.dotProduct(currentPoint2CurrentCirclePosition);
    dotProductFromFutureBall = normalAxis.dotProduct(currentPoint2futureBallPosition);

    // Time step derived from distance radius = dotProductFromCurrentBall + (dotProductFromFutureBall - dotProductFromCurrentBall) * timeStep
    timeStep = (radius - dotProductFromCurrentBall) / (dotProductFromFutureBall - dotProductFromCurrentBall);

    // Collision if time step is between 0 and 1 from the line
    // As the distance of the ball is then less than 1 radius away
    if (timeStep > 0 && timeStep < 1) {
      var collisionPos = CurrentCirclePosition.clone().subtract(futureBallPosition).multiplyScalar(timeStep).add(CurrentCirclePosition);

      // Collision info for reaction
      collisionPoints.push({
        collisionPos: collisionPos,
        timeStep: 1 - timeStep, 
        normal: normalAxis,
        dotProduct: dotProductFromCurrentBall
      });
    }
  }

  // There can be multiple collisions in a single frame so check each of those
  for (i = 0; i < collisionPoints.length; i++) {
    var collision = collisionPoints[i];
    // If the ball is within the boundaries of the box
    if (collision.collisionPos.x - radius <= box.getPoint(1).x && collision.collisionPos.x - radius <= box.getPoint(2).x // Right
        && collision.collisionPos.y - radius <= box.getPoint(2).y && collision.collisionPos.y - radius <= box.getPoint(3).y // Bottom
        && collision.collisionPos.x + radius >= box.getPoint(3).x && collision.collisionPos.x + radius >= box.getPoint(4).x // Left
        && collision.collisionPos.y + radius >= box.getPoint(4).y && collision.collisionPos.y + radius >= box.getPoint(1).y // Top
        ) {

      self.react(collisionPoints);

      return true;
    }
  };

  return false;
};

Ball.prototype.react = function(collisionPoints) {
  var self = this;

  console.log(collisionPoints);

  // furthest from Normal
  var furthest = {dotProduct: 0};


  /*
   * Using the collision point furthest to the normal of the ball to the
   * surface of the obj seems to be bouncing correctly most of the time.
   * The ball no longer seems to bounce into bricks.
   */
  collisionPoints.forEach(function (collision) {
    furthest = Math.abs(collision.dotProduct) > Math.abs(furthest.dotProduct) ? collision : furthest;
  });

  var normal = furthest.normal;
    // Set Ball pos to collision pos
  self.pos.set(furthest.collisionPos.x, furthest.collisionPos.y);

  var bounceVector = self.futurePos.clone().subtract(self.pos);

  if (normal.x === 1 // Left
      || normal.x === -1 // Right
    ) {
    self.dir.revX();
    bounceVector.revX();
  }
  
  if ( normal.y === -1 // Bottom
    || normal.y === 1 // Top
    ) {
    self.dir.revY();
    bounceVector.revY();
  }

  self.pos = self.pos.add(bounceVector);
};

Ball.prototype.inBox = function(box) {
  var radius = this.radius;

  if (this.pos.x - radius <= box.getPoint(1).x && this.pos.x - radius <= box.getPoint(2).x // Right
      && this.pos.y - radius <= box.getPoint(2).y && this.pos.y - radius <= box.getPoint(3).y // Bottom
      && this.pos.x + radius >= box.getPoint(3).x && this.pos.x + radius >= box.getPoint(4).x // Left
      && this.pos.y + radius >= box.getPoint(4).y && this.pos.y + radius >= box.getPoint(1).y // Top
      ) {
    return true;
  }

  return false;
};

Ball.prototype.update = function (game) {
  // Check if the end of the screen is reached - eg. ball missed the club
  if (this.pos.y + this.radius >= game.canvasHeight) {
    this.dir.y = 0;
    this.dir.x = 0;
    game.gameOver = true;
  }

  this.futurePos = this.pos.clone().add(new Vector2(this.dir.x * this.speed, this.dir.y * this.speed));

  // Check if the ball hits an edge wall
  this.checkWallHits(game.canvasWidth);

  // Check if the ball hits the club
  this.checkClubHit(game.theClub);

  // Check for brick collisions
  this.checkBrickCollisions(game);

  // Update the ball position 
  this.pos.x += this.dir.x * this.speed;
  this.pos.y += this.dir.y * this.speed;
};

// ******************************
//  Brick Object
// ******************************
function Brick(x, y, w, h, colors, life) {
  this.pos = new Vector2(x, y);
  this.width = w || 50;
  this.height = h || 50;

  this.colors = colors;
  this.life = life;

  this.alpha = 1;

  this.destroyed = false;
  this.deleted = false;
  this.frameCounter = 0;
}

Brick.prototype.draw = function (ctx) {
  if (this.destroyed) {
    this.destroy();
    this.frameCounter++;
  }

  if (this.frameCounter >= 20) {
    this.deleted = true;
  }

  ctx.fillStyle = this.colors[this.life];
  ctx.strokeStyle = "#ffffff";
  ctx.globalAlpha = this.alpha;

  ctx.beginPath();
  ctx.rect(this.pos.x, this.pos.y, 
    this.width, this.height);

  ctx.stroke();
  ctx.fill();
};

Brick.prototype.destroy = function () {
  // Some arbitary numbers that seem to animate semi nicely
  this.pos.x += this.width / 10;
  this.pos.y += this.height / 10;
  this.width -= this.width * 0.2;
  this.height -= this.height * 0.2;
  this.alpha = this.alpha <= 0 ? 0 : this.alpha - 0.1;
};

Brick.prototype.getPoint = function (point) {
  switch (point) {
    case 0: // Get center
      return new Vector2(this.pos.x + this.width / 2, this.pos.y + this.height / 2);

    case 1: // Right top
      return new Vector2(this.pos.x + this.width, this.pos.y);

    case 2: // Right bottom
      return new Vector2(this.pos.x + this.width, this.pos.y + this.height);

    case 3: // Left bottom
      return new Vector2(this.pos.x, this.pos.y + this.height);

    case 4: // Left top
      return new Vector2(this.pos.x, this.pos.y);

    default:
      return;
  }
};

Brick.prototype.getAxis = function (i) {
  switch (i) {
    case 1: // Right side
      return this.getPoint(1).subtract(this.getPoint(2));

    case 2: // Bottom
      return this.getPoint(2).subtract(this.getPoint(3));

    case 3: // Left
      return this.getPoint(3).subtract(this.getPoint(4));

    case 4: // Top
      return this.getPoint(4).subtract(this.getPoint(1));

    default:
      return;
  }
};

Brick.prototype.getNormal = function (i) {
  return this.getAxis(i).normal().normalise();
};

/* Set the requestAnimFrame function to use the correct function per the browser. 
   If the browser is not supporting requestAnimationFrame function at all, then the backup
   is to use regular timer to achieve more or less the same. */
window.requestAnimFrame = (function () {
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function (callback) {
            window.setTimeout(callback, 1000 / 60);
          };
}());

// Create the game object
var game = new Game(document.getElementById("canvasTarget"));

var slider = document.querySelector("#speed");

window.addEventListener('keydown', function (event) { game.keyDown(event); });
window.addEventListener('keyup', function (event) { game.keyUp(event); });

slider.addEventListener('change', function (event) { 
  game.ballSpeed = game.theBall.speed = this.value;
})

document.addEventListener('onload', game.start());
