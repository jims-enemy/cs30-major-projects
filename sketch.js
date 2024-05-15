class Mino {
  constructor(row, column, color) {
    this.row = row;
    this.column = column;
    this.color = color;
  }

  display(x1, y1, x2, y2) {
    fill(this.color);
    rect(this.column * (x2 - x1)/columnLines + x1, this.row * (y2 - y1)/rowLines + y1,
      (x2 - x1)/columnLines, (y2 - y1)/rowLines);
  }

  lineCleared(rowCleared, thisIndex) {
    if (this.row === rowCleared) {
      tetrisBoards.get("tetrisGame0").minos.splice(thisIndex, 1);
    }

    else if (this.row < rowCleared) {
      this.row++;
    }
  }

  neighborT() {
    const neighbors = (rowOrColumn, change, secondOperator) => 
      eval(`this.${rowOrColumn} + ${change} === activeTetromino.${rowOrColumn}2 ||
    this.${rowOrColumn} ${secondOperator} ${change} === activeTetromino.${rowOrColumn}2`);

    if (neighbors("row", 0, "-") && neighbors("column", 1, "-") && isRotation(2, 2) ||
    neighbors("column", 0, "-") && neighbors("row", 1, "-") && isRotation(3, 2)) {
      activeTetromino.frontCornerNeighbors++;
    }

    else if (neighbors("row", 2, "+") && neighbors("column", 1, "-") && isRotation(2, 0) || 
    neighbors("row", -2, "+") && neighbors("column", 1, "-") && isRotation(0, 0) ||
  neighbors("column", -2, "+") && neighbors("row", 1, "-") && isRotation(3, 0) || 
  neighbors("column", 2, "+") && neighbors("row", 1, "-") && isRotation(1, 0)) {
      activeTetromino.rearCornerNeighbors++;
    }
  }

  collidesWithActive(shift) {
    for(let minoNumber of [1, 2, 3, 4]) {
      if (eval(`this.column === activeTetromino.column${minoNumber} + ${shift}
      && this.row === activeTetromino.row${minoNumber}`)) {
        return true;
      }
    }
    return false;
  }
}
class TetrisBoard {
  constructor(x1, y1, x2, y2, minos) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    if (minos) {
      this.minos = minos;
    }
    else {
      this.minos = [];
    }
  }
  
  display() {
    stroke("white");

    // Draws the columns.
    for(let currentColumn = 0; currentColumn < columnLines + 1; currentColumn++) {
      let xValue = (this.x2 - this.x1)/columnLines * currentColumn + this.x1;
      line(xValue, this.y1, xValue, this.y2);
    }

    // Draws the rows.
    for(let currentRow = 0; currentRow < rowLines + 1; currentRow++) {
      let yValue =  (this.y2 - this.y1)/rowLines * currentRow + this.y1;
      line(this.x1, yValue, this.x2, yValue);
    }

    // Draws the minos.
    for(let currentMino of this.minos) {
      currentMino.display(this.x1, this.y1, this.x2, this.y2);
    }
  }

  toggleCell() {
    let x = Math.floor(mouseX/(width/(columnLines*3))) - columnLines;
    let y = Math.floor(mouseY/(height/rowLines));

    for (let currentMino = 0; currentMino < this.minos.length; currentMino++) {
      if (this.minos[currentMino].column === x && this.minos[currentMino].row === y) {
        this.minos.splice(currentMino, 1);
        return;
      }
    }

    this.minos.push(new Mino(y, x, "Grey"));
  }
}

let columnLines = 10;
let rowLines = 20;
let tetrisBoards = new Map();
let games = 1;
let bag = [];
let level = 1;
let timer;
let lastUpdate = 0;
let activeTetromino = {isActive: false};
let blockUnder = false;
let obstructionOnLeftSide = false;
let obstructionOnRightSide = false;
let holdDelay = 500/3;
let leftTimeHeld = 0;
let rightTimeHeld = 0;
let softDrop = false;
let softDropSpeed = 25;
let lockDelay = 500;
let safeToDrop = true;
let hardDropped = false;
let hardDrop = false;
let rotatedRight = false;
let rotatedLeft = false;
let invalidRotation = false;
let activeTetrominoOld;
let canHold = true;
let heldPiece;
let score = 0;
let comboCounter = -1;
let difficultClear = false;
let gamemode = "PT";
let timePaused = 0;
let justTetrised = false;
let entryDelay = 100;
let entryDelayStart = 0;
let totalLinesCleared = 0;
let leftTimeStartedHeld = 0;
let didLeftDAS = false;
let rightTimeStartedHeld = 0;
let didRightDAS = false;

const SWAP = 1;
const I = 2;
const J = 3;
const L = 4;
const O = 5;
const S = 6;
const Z = 7;

const KEY_D = 68;
const KEY_A = 65;
const KEY_S = 83;
const SPACE = 32;
const KEY_X = 88;
const KEY_W = 87;
const KEY_Z = 90;
const KEY_C = 67;

const isRotation = (rotationToCheck, differentRotation) => activeTetromino.rotation === rotationToCheck ||
    activeTetromino.rotation === rotationToCheck - differentRotation;

const miniTSpin = () => activeTetromino.frontCornerNeighbors === 1 && activeTetromino.rearCornerNeighbors >= 2;

const tSpin = () => activeTetromino.frontCornerNeighbors >= 2 && activeTetromino.rearCornerNeighbors >= 1 ||
miniTSpin() && activeTetromino.kickTestsTaken === 4;


function setup() {
  createCanvas(windowWidth, windowHeight);

  // Sets the first board's coordinates.
  tetrisBoards.set("tetrisGame0", new TetrisBoard(width/3, 0, width/3 * 2, height));

  // Sets up every other game's coordinates.
  let currentGame = 1;
  for(let currentGameRow = 0; currentGameRow < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games;
    currentGameRow++) {
    for(let currentGameColumn = 0; currentGameColumn < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games;
      currentGameColumn++) {
      tetrisBoards.set(`tetrisGame${currentGame}`, new TetrisBoard(
        currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1))),
        currentGameRow * height/Math.ceil(Math.sqrt(games - 1)),
        currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1))) +
        width/(3 * Math.ceil(Math.sqrt(games - 1))),
        currentGameRow * height/Math.ceil(Math.sqrt(games - 1)) + height/Math.ceil(Math.sqrt(games - 1))));
      currentGame++;
    }
  }

  fillBag();
}

function draw() {
  background("black");
  
  // Draws each game.
  for(let gameNumber = 0; gameNumber < games; gameNumber++) {
    tetrisBoards.get(`tetrisGame${gameNumber}`).display();
  }

  if (gamemode === "PT") {
    timer = millis() - timePaused;
    controlTetris();
    moveActiveTetromino();
  }

  else {
    timePaused = millis() - timer;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Resets the first board's coordinates.
  tetrisBoards.set("tetrisGame0", new TetrisBoard(width/3, 0, width/3 * 2, height,
    tetrisBoards.get("tetrisGame0").minos));

  // Sets up every other game's coordinates.
  let currentGame = 1;
  for(let currentGameRow = 0; currentGameRow < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games;
    currentGameRow++) {
    for(let currentGameColumn = 0; currentGameColumn < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games;
      currentGameColumn++) {
      tetrisBoards.set(`tetrisGame${currentGame}`, new TetrisBoard(
        currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1))),
        currentGameRow * height/Math.ceil(Math.sqrt(games - 1)),
        currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1))) +
        width/(3 * Math.ceil(Math.sqrt(games - 1))),
        currentGameRow * height/Math.ceil(Math.sqrt(games - 1)) + height/Math.ceil(Math.sqrt(games - 1)),
        tetrisBoards.get(`tetrisGame${currentGame}`).minos));

      currentGame++;
    }
  }
}

function swap() {
  /**Shifts all tetris games' values down one, taking tetrisGame0 and putting it on the last game.*/
  
  let gameZero = tetrisBoards.get("tetrisGame0");
  let numberOfGame = 1;

  // Loops through every tetris game except the first one, giving the previous game it's value.
  for (let [nameOfGame, tetrisInformation] of tetrisBoards) {
    if (nameOfGame !== "tetrisGame0") {
      tetrisBoards.set(`tetrisGame${numberOfGame - 1}`, tetrisInformation);
      numberOfGame++;
    }
  }

  // Sets the last game to the value stored in the first game.
  tetrisBoards.set(`tetrisGame${numberOfGame - 1}`, gameZero);

  // Calls windowResized to recalculate every boards' new position.
  windowResized();
}

function fillBag() {
  /**Populates bag with each possible tetromino's corresponding value + shift, shuffled randomly. */
  let loops = 0;
  let availableChoices = [1, 2, 3, 4, 5, 6, 7, 8];

  // Loops until bag has been refilled.
  while(loops < 8) {
    // Picks a random choice.
    let choice = round(random(0.45, 8.43));

    // Only puts it in the bag if it hasn't already been put in, before incrementing loops.
    if (availableChoices.includes(choice)) {
      bag.push(choice);
      availableChoices.splice(availableChoices.indexOf(choice), 1);
      loops++;
    }
  }
}

function moveActiveTetromino() {
  if (activeTetromino.isActive) {
    updatePosition();
    entryDelayStart = timer;
  }
  else {
    if (timer - entryDelayStart >= entryDelay) {
      grabNextFromBag();
      entryDelayStart = timer;
    }
  }
  if (bag.length < 7) {
    fillBag();
  }
}

function grabNextFromBag() {
  if (bag[0] === SWAP) {
    swap();
  }
  else if (bag[0] === I) {
    activeTetromino = {color: "cyan",
      isActive: true,
      rotation: 0,
      column1: Math.floor(columnLines/2) - 2,
      row1: -1,
      column2: Math.floor(columnLines/2) - 1,
      row2: -1,
      column3: Math.floor(columnLines/2),
      row3: -1,
      column4: Math.floor(columnLines/2) + 1,
      row4: -1,
      blockChange1: [2, -1],
      blockChange2: [1, 0],
      blockChange3: [0, 1],
      blockChange4: [-1, 2]
    };
  }
  else if (bag[0] === J) {
    activeTetromino = {color: "blue",
      isActive: true,
      rotation: 0,
      column1: Math.floor(columnLines/2) - 2,
      row1: -1,
      column2: Math.floor(columnLines/2) - 2,
      row2: 0,
      column3: Math.floor(columnLines/2) - 1,
      row3: 0,
      column4: Math.floor(columnLines/2),
      row4: 0,
      blockChange1: [2, 0],
      blockChange2: [1, -1],
      blockChange3: [0, 0],
      blockChange4: [-1, 1]
    };
  }
  else if (bag[0] === L) {
    activeTetromino = {color: "orange",
      isActive: true,
      rotation: 0,
      column1: Math.floor(columnLines/2) - 2,
      row1: 0,
      column2: Math.floor(columnLines/2) - 1,
      row2: 0,
      column3: Math.floor(columnLines/2),
      row3: 0,
      column4: Math.floor(columnLines/2),
      row4: -1,
      blockChange1: [1, -1],
      blockChange2: [0, 0],
      blockChange3: [-1, 1],
      blockChange4: [0, 2]
    };
  }
  else if (bag[0] === O) {
    activeTetromino = {color: "yellow",
      isActive: true,
      rotation: 0,
      column1: Math.floor(columnLines/2) - 1,
      row1: -1,
      column2: Math.floor(columnLines/2) - 1,
      row2: 0,
      column3: Math.floor(columnLines/2),
      row3: -1,
      column4: Math.floor(columnLines/2),
      row4: 0,
      blockChange1: [0, 0],
      blockChange2: [0, 0],
      blockChange3: [0, 0],
      blockChange4: [0, 0]
    };
  }
  else if (bag[0] === S) {
    activeTetromino = {color: "green",
      isActive: true,
      rotation: 0,
      column1: Math.floor(columnLines/2) - 2,
      row1: 0,
      column2: Math.floor(columnLines/2) - 1,
      row2: 0,
      column3: Math.floor(columnLines/2) - 1,
      row3: -1,
      column4: Math.floor(columnLines/2),
      row4: -1,
      blockChange1: [1, -1],
      blockChange2: [0, 0],
      blockChange3: [1, 1],
      blockChange4: [0, 2]
    };
  }
  else if (bag[0] === Z) {
    activeTetromino = {color: "red",
      isActive: true,
      rotation: 0,
      column1: Math.floor(columnLines/2) - 2,
      row1: -1,
      column2: Math.floor(columnLines/2) - 1,
      row2: -1,
      column3: Math.floor(columnLines/2) - 1,
      row3: 0,
      column4: Math.floor(columnLines/2),
      row4: 0,
      blockChange1: [2, 0],
      blockChange2: [1, 1],
      blockChange3: [0, 0],
      blockChange4: [-1, 1]
    };
  }
  else { //T
    activeTetromino = {color: "purple",
      isActive: true,
      rotation: 0,
      column1: Math.floor(columnLines/2) - 2,
      row1: 0,
      column2: Math.floor(columnLines/2) - 1,
      row2: -1,
      column3: Math.floor(columnLines/2) - 1,
      row3: 0,
      column4: Math.floor(columnLines/2),
      row4: 0,
      blockChange1: [1, -1],
      blockChange2: [1, 1],
      blockChange3: [0, 0],
      blockChange4: [-1, 1],
      frontCornerNeighbors: 0,
      rearCornerNeighbors: 0
    };
  }
  bag.shift();
}


function controlTetris() {
  moveLeft();
  moveRight();
  drop();
  rotateIt();
  hold();
}

function rotateTetromino(clockwise) {
  activeTetromino.rotatedLast = true;
  invalidRotation = true;
  activeTetrominoOld = {...activeTetromino};

  initialRotation(clockwise);

  activeTetromino.kickTestsTaken = performKickTests(clockwise);

  if (clockwise) {
    activeTetromino.rotation++;
    if (activeTetromino.rotation > 3) {
      activeTetromino.rotation = 0;
    }
  }
  else {
    activeTetromino.rotation--;
    if (activeTetromino.rotation < 0) {
      activeTetromino.rotation = 3;
    }
  }

  if (invalidRotation) {
    activeTetromino = activeTetrominoOld;
  }
}

function performKickTests(clockwise) {
  for (let kickTests = 0; invalidRotation === true && kickTests < 5; kickTests++) {
    invalidRotation = false;
    for (let checkMino of tetrisBoards.get("tetrisGame0").minos) {
      for (let tetrominoMino of [[activeTetromino.column1, activeTetromino.row1],
        [activeTetromino.column2, activeTetromino.row2],
        [activeTetromino.column3, activeTetromino.row3],
        [activeTetromino.column4, activeTetromino.row4]]) {
        if (tetrominoMino[0] === checkMino.column && tetrominoMino[1] === checkMino.row) {
          invalidRotation = true;
        }
      }
    }

    for (let tetrominoMino of [[activeTetromino.column1, activeTetromino.row1],
      [activeTetromino.column2, activeTetromino.row2],
      [activeTetromino.column3, activeTetromino.row3],
      [activeTetromino.column4, activeTetromino.row4]]) {
      if (tetrominoMino[1] >= rowLines ||
    tetrominoMino[0] < 0 ||
    tetrominoMino[0] >= columnLines) {
        invalidRotation = true;
      }
    }

    if (invalidRotation) {
      if (activeTetromino.color === "cyan" && 
      ((activeTetromino.rotation !== 1 &&
        activeTetromino.rotation !== 3 ||
        ! clockwise) && 
      (activeTetromino.rotation !== 0 &&
        activeTetromino.rotation !== 2 || 
        clockwise) || 
        kickTests !== 0) &&
        (kickTests !== 4 ||
        (activeTetromino.rotation === 0 || 
        activeTetromino.rotation === 2) &&
      ! clockwise ||
      (activeTetromino.rotation === 1 || 
      activeTetromino.rotation === 3) &&
      clockwise)
      ) {
        if (activeTetromino.rotation === 0 && (clockwise || kickTests !== 0 && kickTests !== 2) && kickTests !== 2 || activeTetromino.rotation === 3 && (!clockwise || kickTests === 2) || activeTetromino.rotation === 1 && (clockwise && kickTests !== 2 || kickTests === 2 && ! clockwise) || activeTetromino.rotation === 2 && kickTests === 2) {
          if (kickTests === 0 || kickTests === 4) {
            shiftActiveTetromino(true, 0, -2);
          }
          else {
            shiftActiveTetromino(true, 0, 3);
          }
        }
        else {
          if (kickTests === 0) {
            shiftActiveTetromino(true, 0, 2);
          }
          else if (kickTests === 1 || kickTests === 2) {
            shiftActiveTetromino(true, 0, -3);
          }
        }
      }
      else if (kickTests !== 1) {
        if (((activeTetromino.rotation === 0 ||
              activeTetromino.rotation === 3 &&
              activeTetromino.color !== "cyan" ||
              activeTetromino.rotation === 1 &&
              activeTetromino.color === "cyan") &&
            clockwise ||
            (activeTetromino.rotation === 2 &&
              activeTetromino.color !== "cyan" ||
              activeTetromino.rotation === 3 ||
              activeTetromino.rotation === 0 &&
              activeTetromino.color === "cyan") &&
            ! clockwise) &&
          kickTests === 0 ||
          kickTests === 2 &&
          (activeTetromino.rotation === 1 ||
            activeTetromino.rotation === 3 ||
            activeTetromino.rotation === 2 &&
            clockwise) ||
          kickTests === 3 &&
          (activeTetromino.rotation === 3 ||
            activeTetromino.rotation === 0 &&
            clockwise ||
            activeTetromino.rotation === 2 &&
            ! clockwise) ||
          kickTests === 3 &&
          (activeTetromino.rotation !== 3 &&
          (activeTetromino.rotation !== 0 ||
          ! clockwise) && 
          (activeTetromino.rotation !== 2 ||
          clockwise) ||
          activeTetromino.color === "cyan" &&
          activeTetromino.rotation !== 1
          )
        ) {
          shiftActiveTetromino(true, 0, -1);
        }
        else {
          shiftActiveTetromino(true, 0, 1);
        }
      }

      if (kickTests === 1 && activeTetromino.color !== "cyan" || kickTests === 2 && activeTetromino.color === "cyan" && ((activeTetromino.rotation === 0 || activeTetromino.rotation === 2) && clockwise || (activeTetromino.rotation === 1 || activeTetromino.rotation === 3) && ! clockwise) || kickTests === 4 && activeTetromino.color === "cyan" && ((activeTetromino.rotation === 0 || activeTetromino.rotation === 2) && ! clockwise || (activeTetromino.rotation === 1 || activeTetromino.rotation === 3) && clockwise)) {
        if (activeTetromino.rotation === 0 &&
          (activeTetromino.color !== "cyan" ||
          kickTests === 4) ||
          activeTetromino.rotation === 2 && 
          kickTests !== 4 || 
          activeTetromino.rotation === 1 &&
          activeTetromino.color === "cyan") {
          shiftActiveTetromino(true, -1);
        }
        else {
          shiftActiveTetromino(true, 1);
        }
      }

      else if (kickTests === 2 && activeTetromino.color === "cyan" || kickTests === 4) {
        if (activeTetromino.rotation === 0 && 
          (kickTests !== 4 ||
          activeTetromino.color !== "cyan") ||
          activeTetromino.rotation === 1 &&
          activeTetromino.color === "cyan" ||
          activeTetromino.rotation === 2 &&
          kickTests === 4 &&
          activeTetromino.color !== "cyan") {
          shiftActiveTetromino(true, -2);
        }
        else {
          shiftActiveTetromino(true, 2);
        }
      }

      else if (kickTests === 2 || kickTests === 3 && activeTetromino.color === "cyan") {
        if (activeTetromino.rotation === 0 &&
          (activeTetromino.color !== "cyan" ||
          ! clockwise) || 
          activeTetromino.rotation === 2 &&
          (clockwise ||
            kickTests !== 3) ||
          activeTetromino.rotation === 1 &&
          activeTetromino.color === "cyan" &&
          kickTests === 3) {
          shiftActiveTetromino(true, 3);
        }
        else {
          shiftActiveTetromino(true, -3);
        }
      }
    }
    if (!invalidRotation) {
      return kickTests;
    }
  }
}


function moveLeft() {
  // Checks if the player is trying to move left, if they aren't at the edge, and the player hasn't just hard-dropped.
  const willNotHitLeftWall = (columnNumber) => eval(`activeTetromino.column${columnNumber} - 1 >= 0`);
  
  if ((keyIsDown(LEFT_ARROW) || keyIsDown(KEY_A)) && willNotHitLeftWall(1) && willNotHitLeftWall(2)
    && willNotHitLeftWall(3) && willNotHitLeftWall(4) && hardDrop === false) {
    
    // Checks if the player is trying to move the tetromino inside another tetromino.
    for (let minoToCheck of tetrisBoards.get("tetrisGame0").minos) {
      obstructionOnLeftSide = minoToCheck.collidesWithActive(-1);
      if (obstructionOnLeftSide) {
        break;
      }
    }
    if (!obstructionOnLeftSide && ((leftTimeHeld === 0 || leftTimeHeld >= holdDelay) && !didLeftDAS
      || leftTimeHeld >= 100/3 + holdDelay && didLeftDAS)) {
      shiftActiveTetromino(true, 0, -1);
      if (leftTimeHeld !== 0) {
        if (didLeftDAS) {
          leftTimeStartedHeld += 100/3;
        }
        didLeftDAS = true;
      }
    }
    obstructionOnLeftSide = false;
    leftTimeHeld = timer - leftTimeStartedHeld;
  }
  else {
    leftTimeHeld = 0;
    leftTimeStartedHeld = timer;
    didLeftDAS = false;
  }
  activeTetromino.rotatedLast = false;
}
  
function moveRight() {
// Checks if the player is trying to move right, if they aren't at the edge, and the player hasn't just hard-dropped.
  const willNotHitRightWall = (columnNumber) => eval(`activeTetromino.column${columnNumber} + 1 < columnLines`);
  
  if ((keyIsDown(RIGHT_ARROW) || keyIsDown(KEY_D)) && willNotHitRightWall(1) && willNotHitRightWall(2)
  && willNotHitRightWall(3) && willNotHitRightWall(4) && hardDrop === false) {
  
    // Checks if the player is trying to move the tetromino inside another tetromino.
    for (let minoToCheck of tetrisBoards.get("tetrisGame0").minos) {
      obstructionOnRightSide = minoToCheck.collidesWithActive(1);
      if (obstructionOnRightSide) {
        break;
      }
    }
    if (!obstructionOnRightSide && ((rightTimeHeld === 0 || rightTimeHeld >= holdDelay) && !didRightDAS
    || rightTimeHeld >= 100/3 + holdDelay && didRightDAS)) {
      shiftActiveTetromino(true, 0, 1);
      if (rightTimeHeld !== 0) {
        if (didRightDAS) {
          rightTimeStartedHeld += 100/3;
        }
        didRightDAS = true;
      }
    }
    obstructionOnRightSide = false;
    rightTimeHeld = timer - rightTimeStartedHeld;
  }
  else {
    rightTimeHeld = 0;
    rightTimeStartedHeld = timer;
    didRightDAS = false;
  }
  activeTetromino.rotatedLast = false;
}
    
function drop() {
  // Checks if the player is trying to soft-drop, speeding up the tetromino's drop speed.
  if (keyIsDown(DOWN_ARROW) || keyIsDown(KEY_S)) {
    softDrop = true;
  }
  else {
    softDrop = false;
  }
      
  // Checks if the player is trying to hard-drop, allowing it if they tapped rather than held the space bar.
  if (keyIsDown(SPACE)) {
    if (!hardDropped) {
      hardDropped = true;
      hardDrop = "movePiece";
      activeTetromino.rotatedLast = false;
    }
  }
  else {
    hardDropped = false;
  }
}
    
function rotateIt () {
  // Checks if the player is trying to rotate the tetromino clockwise and that they pressed the key rather than held.
  if (keyIsDown(UP_ARROW) || keyIsDown(KEY_X) || keyIsDown(KEY_W)){
    if (!rotatedRight && !rotatedLeft) {
      rotateTetromino(true);
      rotatedRight = true;
    }
  }
  else {
    rotatedRight = false;
  }
  
  // Checks if the player is trying to rotate the tetromino counter-clockwise and that they pressed the key rather than held.
  if (keyIsDown(CONTROL) || keyIsDown(KEY_Z)){
    if (!rotatedLeft && !rotatedRight) {
      rotateTetromino(false);
      rotatedLeft = true;
    }
  }
  else {
    rotatedLeft = false;
  }
}

function hold() {
  if ((keyIsDown(SHIFT) || keyIsDown(KEY_C)) && canHold) {
    if (heldPiece) {
      bag.unshift(heldPiece);
    }
    
    for(let [color, pieceName] of [["cyan", 2], ["blue", 3], ["orange", 4], ["yellow", 5], ["green", 6], ["red", 7], ["purple", 8]]) {
      if (activeTetromino.color === color) {
        heldPiece = pieceName;
      }
    }
    
    activeTetromino.isActive = false;
    canHold = false;
  }
}

function clearLines() {
  let linesCleared = 0;
  let minosInRow = countMinosInRow();
  
  while([...minosInRow.values()].some(value => value >= columnLines)) {
    for (let [rowToCheck, amountInRow] of minosInRow) {
      if (amountInRow >= columnLines) {
        for (let currentMino = tetrisBoards.get("tetrisGame0").minos.length - 1; currentMino >= 0; currentMino--) {
          tetrisBoards.get("tetrisGame0").minos[currentMino].lineCleared(rowToCheck, currentMino);
        }
        linesCleared++;
        break;
      }
    }
    minosInRow = countMinosInRow();
  }

  if (activeTetromino.color === "purple") {
    for (let currentMino of tetrisBoards.get("tetrisGame0").minos) {
      currentMino.neighborT();
    }

    if (isRotation(3, 2) && (activeTetromino.rotation - 1) * 4.5 === activeTetromino.column1) {
      activeTetromino.rearCornerNeighbors++;
    }
  }

  if (linesCleared) {
    scoreClearLines(linesCleared);
  }

  else {
    if (tSpin()) {
      score += 400 * level;
    }
    
    else if (miniTSpin()) {
      score += 100 * level;
    }

    else {
      difficultClear = false;
    }

    comboCounter = -1;
    justTetrised = false;
  }

  totalLinesCleared += linesCleared;
  if (totalLinesCleared >= 10 * level) {
    level++;
  }
}

function scoreClearLines(linesCleared) {
  if (linesCleared === 1) {
    scoreClearTSpins(800, 200, 100);
    if (tetrisBoards.get("tetrisGame0").minos) {
      score += 800 * level;
    }
  }
  
  else if (linesCleared === 2) {
    scoreClearTSpins(1200, 400, 300);
    if (tetrisBoards.get("tetrisGame0").minos) {
      score += 1200 * level;
    }
  }

  else if (linesCleared === 3) {
    scoreClearTSpins(1600, 0, 500);
    if (tetrisBoards.get("tetrisGame0").minos) {
      score += 1800 * level;
    }
  }

  if (linesCleared === 4) {
    score += 800 * level * (1.5 * difficultClear);
    difficultClear = true;
    if (tetrisBoards.get("tetrisGame0").minos) {
      score += (2000 + 1200 * justTetrised) * level;
    }
    justTetrised = true;
  }
  
  else {
    justTetrised = false;
  }

  comboCounter++;
  score += 50 * comboCounter * level;
}

function scoreClearTSpins(tSpinScore, miniScore, defaultScore) {
  if (tSpin) {
    score += tSpinScore * level * (1.5 * difficultClear);
    difficultClear = true;
  }

  else if (miniTSpin) {
    score += miniScore * level * (1.5 * difficultClear);
    difficultClear = true;
  }
  
  else {
    score += defaultScore * level;
    difficultClear = false;
  }
}

function countMinosInRow() {
  let minosInRow = new Map();
  for (let currentMino of tetrisBoards.get("tetrisGame0").minos) {
    if (minosInRow.has(currentMino.row)) {
      minosInRow.set(currentMino.row, minosInRow.get(currentMino.row) + 1);
    }
    else {
      minosInRow.set(currentMino.row, 1);
    }
  }
  return minosInRow;
}

function updatePosition() {
  if (activeTetromino.row1 >= 0 &&
    activeTetromino.row2 >= 0 &&
    activeTetromino.row3 >= 0 &&
    activeTetromino.row4 >= 0) {
    fill(activeTetromino.color);
    for (let columnRow of [[activeTetromino.column1, activeTetromino.row1], [activeTetromino.column2, activeTetromino.row2], [activeTetromino.column3, activeTetromino.row3], [activeTetromino.column4, activeTetromino.row4]]) {
      rect(columnRow[0] * (tetrisBoards.get("tetrisGame0").x2 - tetrisBoards.get("tetrisGame0").x1)/columnLines + tetrisBoards.get("tetrisGame0").x1,
        columnRow[1] * (tetrisBoards.get("tetrisGame0").y2 - tetrisBoards.get("tetrisGame0").y1)/rowLines + tetrisBoards.get("tetrisGame0").y1, 
        (tetrisBoards.get("tetrisGame0").x2 - tetrisBoards.get("tetrisGame0").x1)/columnLines,
        (tetrisBoards.get("tetrisGame0").y2 - tetrisBoards.get("tetrisGame0").y1)/rowLines);
    }
  }
  
  if ((timer - lastUpdate >= (0.8 - (level - 1) * 0.007)**(level - 1) * 1000 || softDrop && timer - lastUpdate >= softDropSpeed) && hardDrop !== "movePiece") {
    moveActiveDownSlowly();
  }
  else if (hardDrop === "movePiece") {
    let spacesToDrop = 0;
    while (activeTetromino.row1 + spacesToDrop < rowLines &&
      activeTetromino.row2 + spacesToDrop < rowLines &&
      activeTetromino.row3 + spacesToDrop < rowLines &&
      activeTetromino.row4 + spacesToDrop < rowLines &&
      safeToDrop) {
      spacesToDrop++;
      for (let minoToCheck of tetrisBoards.get("tetrisGame0").minos) {
        if (minoToCheck.row === activeTetromino.row1 + spacesToDrop && minoToCheck.column === activeTetromino.column1 || 
          minoToCheck.row === activeTetromino.row2 + spacesToDrop && minoToCheck.column === activeTetromino.column2 ||
          minoToCheck.row === activeTetromino.row3 + spacesToDrop && minoToCheck.column === activeTetromino.column3 || 
          minoToCheck.row === activeTetromino.row4 + spacesToDrop && minoToCheck.column === activeTetromino.column4) {
          safeToDrop = false;
        }
      }
    }
    activeTetromino.row1+= spacesToDrop - 1;
    activeTetromino.row2+= spacesToDrop - 1;
    activeTetromino.row3+= spacesToDrop - 1;
    activeTetromino.row4+= spacesToDrop - 1;
    score += (spacesToDrop - 1) * 2;
    hardDrop = true;
    safeToDrop = true;
    lastUpdate = 0;
  }
}

function moveActiveDownSlowly() {
  for (let minoToCheck of tetrisBoards.get("tetrisGame0").minos) {
    let isBelow = (currentMino) => minoToCheck.row === eval("activeTetromino.row" + currentMino) + 1 &&
    minoToCheck.column === eval("activeTetromino.column" + currentMino);

    if (isBelow("1") || isBelow("2") || isBelow("3") || isBelow("4")) {
      blockUnder = true;
    }
  }

  const notBottom = (currentRow) => currentRow + 1 < rowLines;
  if (notBottom(activeTetromino.row1) && notBottom(activeTetromino.row2) && notBottom(activeTetromino.row3)
    && notBottom(activeTetromino.row4) && ! blockUnder) {
    goDownAndScore();
  }

  else if (timer - lastUpdate >= lockDelay) {
    for (let minoNumber = 1; minoNumber <= 4; minoNumber++) {
      eval(`tetrisBoards.get("tetrisGame0").minos.push(new Mino(activeTetromino.row${minoNumber}, activeTetromino.column${minoNumber}, activeTetromino.color))`);
    }
    activeTetromino.isActive = false;
    hardDrop = false;
    canHold = true;

    clearLines();
  }
  blockUnder = false;
}

function shiftActiveTetromino(fullShift, rowChange1, columnChange1, rowChange2, columnChange2,
  rowChange3, columnChange3, rowChange4, columnChange4) {
  for (let minoNumber = 1; minoNumber <= 4; minoNumber++) {
    if (fullShift) {
      if (rowChange1) {
        eval(`activeTetromino.row${minoNumber} += rowChange1`);
      }

      if (columnChange1) {
        eval(`activeTetromino.column${minoNumber} += columnChange1`);
      }
    }

    else {
      eval(`activeTetromino.row${minoNumber} += rowChange${minoNumber}`);
      eval(`activeTetromino.column${minoNumber} += columnChange${minoNumber}`);
    }
  }
}

function goDownAndScore() {
  shiftActiveTetromino(true, 1);
  lastUpdate = timer;
  activeTetromino.rotatedLast = false;

  if (softDrop) {
    score++;
  }
}

function initialRotation(clockwise) {
  if (activeTetromino.rotation === 0 && clockwise || activeTetromino.rotation === 3 && !clockwise) {
    shiftActiveTetromino(false, activeTetromino.blockChange1[1], activeTetromino.blockChange1[0],
      activeTetromino.blockChange2[1], activeTetromino.blockChange2[0], activeTetromino.blockChange3[1],
      activeTetromino.blockChange3[0], activeTetromino.blockChange4[1], activeTetromino.blockChange4[0]);
  }

  else if (activeTetromino.rotation === 1 && clockwise || activeTetromino.rotation === 0 && !clockwise) {
    shiftActiveTetromino(false, activeTetromino.blockChange1[0], -activeTetromino.blockChange1[1],
      activeTetromino.blockChange2[0], -activeTetromino.blockChange2[1], activeTetromino.blockChange3[0],
      -activeTetromino.blockChange3[1], activeTetromino.blockChange4[0], -activeTetromino.blockChange4[1]);
  }

  else if (activeTetromino.rotation === 2 && clockwise || activeTetromino.rotation === 1 && !clockwise) {
    shiftActiveTetromino(false, -activeTetromino.blockChange1[1], -activeTetromino.blockChange1[0],
      -activeTetromino.blockChange2[1], -activeTetromino.blockChange2[0], -activeTetromino.blockChange3[1],
      -activeTetromino.blockChange3[0], -activeTetromino.blockChange4[1], -activeTetromino.blockChange4[0]);
  }

  else {
    shiftActiveTetromino(false, -activeTetromino.blockChange1[0], activeTetromino.blockChange1[1],
      -activeTetromino.blockChange2[0], activeTetromino.blockChange2[1], -activeTetromino.blockChange3[0],
      activeTetromino.blockChange3[1], -activeTetromino.blockChange4[0], activeTetromino.blockChange4[1]);
  }
}

function keyPressed() {
  if (key === "p") {
    if (gamemode === "PT") {
      gamemode = "TM";
    }

    else {
      gamemode ="PT";
    }
  }
}

function mousePressed() {
  if (gamemode === "TM" && mouseX > width/3 && mouseX < width*2/3) {
    tetrisBoards.get("tetrisGame0").toggleCell();
  }
}