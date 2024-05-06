class TetrisBoard {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
  
  drawGrid() {
    stroke("white");

    // Draws the columns.
    for(let currentColumn = 0; currentColumn < columnLines + 1; currentColumn++) {
      line((this.x2 - this.x1)/columnLines * currentColumn + this.x1, this.y1, (this.x2 - this.x1)/columnLines * currentColumn + this.x1, this.y2);
    }

    // Draws the rows.
    for(let currentRow = 0; currentRow < rowLines + 1; currentRow++) {
      line(this.x1,(this.y2 - this.y1)/rowLines * currentRow + this.y1, this.x2, (this.y2 - this.y1)/rowLines * currentRow + this.y1);
    }
  }
}

let columnLines = 10;
let rowLines = 20;
let tetrisBoards = new Map();
let games = 9; // Does NOT work with 2 or less.
let bag = [];
let level = 1;
let timer;
let lastUpdate = 0;
let activeTetromino = {isActive: false};
let blockUnder = false;
let obstructionOnLeftSide = false;
let obstructionOnRightSide = false;
let holdDelay = 10;
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

// Sets up each game.
for (let board = 0; board < games; board++) {
  let boardMap = new Map();
  boardMap.set("minos", []);
  tetrisBoards.set(`tetrisGame${board}`, boardMap);
}

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

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Sets the first board's coordinates.
  for(let coordinatePair of [["x1", width/3], ["y1", 0], ["x2", width/3 * 2], ["y2", height]]) {
    tetrisBoards.get("tetrisGame0").set(coordinatePair[0], coordinatePair[1]);
  }

  // Sets all the other games' coordinates.
  let currentGame = 1;
  for(let currentGameRow = 0; currentGameRow < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games; currentGameRow++) {
    for(let currentGameColumn = 0; currentGameColumn < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games; currentGameColumn++) {
      for(let keyValuePair of [["x1", currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1)))],
        ["y1", currentGameRow * height/Math.ceil(Math.sqrt(games - 1))],
        ["x2", currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1))) + width/(3 * Math.ceil(Math.sqrt(games - 1)))],
        ["y2", currentGameRow * height/Math.ceil(Math.sqrt(games - 1)) + height/Math.ceil(Math.sqrt(games - 1))]]) {
        tetrisBoards.get(`tetrisGame${currentGame}`).set(keyValuePair[0], keyValuePair[1]);
      }
      currentGame++;
    }
  }
  fillBag();
}

function draw() {
  timer = millis();
  background("black");

  // Draws each game.
  for(let gameNumber = 0; gameNumber < games; gameNumber++) {
    drawGrid(tetrisBoards.get(`tetrisGame${gameNumber}`));
  }

  drawMinos();
  controlTetris();
  moveActiveTetromino();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Sets the first board's new coordinates.
  for(let coordinatePair of [["x1", width/3], ["y1", 0], ["x2", width/3 * 2], ["y2", height]]) {
    tetrisBoards.get("tetrisGame0").set(coordinatePair[0], coordinatePair[1]);
  }
  let currentGame = 1;

  // Sets all the other games' new coordinates.
  for(let currentGameRow = 0; currentGameRow < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games; currentGameRow++) {
    for(let currentGameColumn = 0; currentGameColumn < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games; currentGameColumn++) {
      for(let coordinatePair of [["x1", currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1)))], ["y1", currentGameRow * height/Math.ceil(Math.sqrt(games - 1))], ["x2", currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1))) + width/(3 * Math.ceil(Math.sqrt(games - 1)))], ["y2", currentGameRow * height/Math.ceil(Math.sqrt(games - 1)) + height/Math.ceil(Math.sqrt(games - 1))]]) {
        tetrisBoards.get(`tetrisGame${currentGame}`).set(coordinatePair[0], coordinatePair[1]);
      }
      currentGame++;
    }
  }
}

function drawGrid(currentTetrisGame) {
  /**Draws the grid for currentTetrisGame.*/

  stroke("white");

  // Draws the columns.
  for(let currentColumn = 0; currentColumn < columnLines + 1; currentColumn++) {
    line((currentTetrisGame.get("x2") - currentTetrisGame.get("x1"))/columnLines * currentColumn + currentTetrisGame.get("x1"), currentTetrisGame.get("y1"), (currentTetrisGame.get("x2") - currentTetrisGame.get("x1"))/columnLines * currentColumn + currentTetrisGame.get("x1"), currentTetrisGame.get("y2"));
  }

  // Draws the rows.
  for(let currentRow = 0; currentRow < rowLines + 1; currentRow++) {
    line(currentTetrisGame.get("x1"),(currentTetrisGame.get("y2") - currentTetrisGame.get("y1"))/rowLines * currentRow + currentTetrisGame.get("y1"), currentTetrisGame.get("x2"), (currentTetrisGame.get("y2") - currentTetrisGame.get("y1"))/rowLines * currentRow + currentTetrisGame.get("y1"));
  }
}

function drawMinos() {
  /**Draws each tetris games' individual minos.*/
  
  for (let [gameName, gameOfTetris] of tetrisBoards) {
    for(let currentMino of gameOfTetris.get("minos")) {
      fill(currentMino.color);
      rect(currentMino.column * (gameOfTetris.get("x2") - gameOfTetris.get("x1"))/columnLines + gameOfTetris.get("x1"),
        currentMino.row * (gameOfTetris.get("y2") - gameOfTetris.get("y1"))/rowLines + gameOfTetris.get("y1"), 
        (gameOfTetris.get("x2") - gameOfTetris.get("x1"))/columnLines,
        (gameOfTetris.get("y2") - gameOfTetris.get("y1"))/rowLines);
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
/**Moves the tetromino down, either relative to the current level, to softDropSpeed in milliseconds, or all the way down if hard-dropping. Also, grabs the next tetromino, and repopulates the bag if needed. */

  if (activeTetromino.isActive) {
    if (activeTetromino.row1 >= 0 &&
      activeTetromino.row2 >= 0 &&
      activeTetromino.row3 >= 0 &&
      activeTetromino.row4 >= 0) {
      fill(activeTetromino.color);
      for (let columnRow of [[activeTetromino.column1, activeTetromino.row1], [activeTetromino.column2, activeTetromino.row2], [activeTetromino.column3, activeTetromino.row3], [activeTetromino.column4, activeTetromino.row4]]) {
        rect(columnRow[0] * (tetrisBoards.get("tetrisGame0").get("x2") - tetrisBoards.get("tetrisGame0").get("x1"))/columnLines + tetrisBoards.get("tetrisGame0").get("x1"),
          columnRow[1] * (tetrisBoards.get("tetrisGame0").get("y2") - tetrisBoards.get("tetrisGame0").get("y1"))/rowLines + tetrisBoards.get("tetrisGame0").get("y1"), 
          (tetrisBoards.get("tetrisGame0").get("x2") - tetrisBoards.get("tetrisGame0").get("x1"))/columnLines,
          (tetrisBoards.get("tetrisGame0").get("y2") - tetrisBoards.get("tetrisGame0").get("y1"))/rowLines);
      }
    }
    if ((timer - lastUpdate >= (0.8 - (level - 1) * 0.007)**(level - 1) * 1000 || softDrop && timer - lastUpdate >= softDropSpeed) && hardDrop !== "movePiece") {
      for (let minoToCheck of tetrisBoards.get("tetrisGame0").get("minos")) {
        if (minoToCheck.row === activeTetromino.row1 + 1 && minoToCheck.column === activeTetromino.column1 || 
          minoToCheck.row === activeTetromino.row2 + 1 && minoToCheck.column === activeTetromino.column2 ||
          minoToCheck.row === activeTetromino.row3 + 1 && minoToCheck.column === activeTetromino.column3 || 
          minoToCheck.row === activeTetromino.row4 + 1 && minoToCheck.column === activeTetromino.column4) {
          blockUnder = true;
        }
      }
      if (activeTetromino.row1 + 1 < rowLines &&
        activeTetromino.row2 + 1 < rowLines &&
        activeTetromino.row3 + 1 < rowLines &&
        activeTetromino.row4 + 1 < rowLines &&
        ! blockUnder) {
        activeTetromino.row1++;
        activeTetromino.row2++;
        activeTetromino.row3++;
        activeTetromino.row4++;
        lastUpdate = timer;
      }
      else if (timer - lastUpdate >= lockDelay) {
        for (let currentBlock of [[activeTetromino.row1, activeTetromino.column1],
          [activeTetromino.row2, activeTetromino.column2],
          [activeTetromino.row3, activeTetromino.column3],
          [activeTetromino.row4, activeTetromino.column4]]) {
          tetrisBoards.get("tetrisGame0").get("minos").push({color: activeTetromino.color,
            row: currentBlock[0],
            column: currentBlock[1]});
        }
        activeTetromino.isActive = false;
        hardDrop = false;
      }
      blockUnder = false;
    }
    else if (hardDrop === "movePiece") {
      let spacesToDrop = 0;
      while (activeTetromino.row1 + spacesToDrop < rowLines &&
        activeTetromino.row2 + spacesToDrop < rowLines &&
        activeTetromino.row3 + spacesToDrop < rowLines &&
        activeTetromino.row4 + spacesToDrop < rowLines &&
        safeToDrop) {
        spacesToDrop++;
        for (let minoToCheck of tetrisBoards.get("tetrisGame0").get("minos")) {
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
      hardDrop = true;
      safeToDrop = true;
      lastUpdate = 0;
    }
  }
  else {
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
        blockChange4: [-1, 1]
      };
    }
    bag.shift();
  }
  if (bag.length < 7) {
    fillBag();
  }
}

function controlTetris() {
  /**Handles the controls for tetris, checking if any relevant keys are pressed and calling the relevant functions.*/

  // Checks if the player is trying to move left, if they aren't at the edge, and the player hasn't just hard-dropped.
  if ((keyIsDown(LEFT_ARROW) || keyIsDown(KEY_A)) && 
  activeTetromino.column1 - 1 >= 0 &&
  activeTetromino.column2 - 1 >= 0 &&
  activeTetromino.column3 - 1 >= 0 &&
  activeTetromino.column4 - 1 >= 0 &&
  hardDrop === false) {

    // Checks if the player is trying to move the tetromino inside another tetromino.
    for (let minoToCheck of tetrisBoards.get("tetrisGame0").get("minos")) {
      if (minoToCheck.column === activeTetromino.column1 - 1 && minoToCheck.row === activeTetromino.row1 || 
        minoToCheck.column === activeTetromino.column2 - 1 && minoToCheck.row === activeTetromino.row2 ||
        minoToCheck.column === activeTetromino.column3 - 1 && minoToCheck.row === activeTetromino.row3 || 
        minoToCheck.column === activeTetromino.column4 - 1 && minoToCheck.row === activeTetromino.row4) {
        obstructionOnLeftSide = true;
      }
    }

    // Shifts the tetromino left if it is possible. Also, includes a delay for precision.
    if(!obstructionOnLeftSide && (leftTimeHeld === 0 || leftTimeHeld >= holdDelay)) {
      activeTetromino.column1--;
      activeTetromino.column2--;
      activeTetromino.column3--;
      activeTetromino.column4--;
    }
    obstructionOnLeftSide = false;
    leftTimeHeld++;
  }
  else {
    leftTimeHeld = 0;
  }

  // Checks if the player is trying to move right, if they aren't at the edge, and the player hasn't just hard-dropped.
  if ((keyIsDown(RIGHT_ARROW) || keyIsDown(KEY_D)) &&
  activeTetromino.column4 + 1 < columnLines && 
  activeTetromino.column3 + 1 < columnLines && 
  activeTetromino.column2 + 1 < columnLines && 
  activeTetromino.column1 + 1 < columnLines &&
  hardDrop === false) {

    // Checks if the player is trying to move the tetromino inside another tetromino.
    for (let minoToCheck of tetrisBoards.get("tetrisGame0").get("minos")) {
      if (minoToCheck.column === activeTetromino.column1 + 1 && minoToCheck.row === activeTetromino.row1 || 
        minoToCheck.column === activeTetromino.column2 + 1 && minoToCheck.row === activeTetromino.row2 ||
        minoToCheck.column === activeTetromino.column3 + 1 && minoToCheck.row === activeTetromino.row3 || 
        minoToCheck.column === activeTetromino.column4 + 1 && minoToCheck.row === activeTetromino.row4) {
        obstructionOnRightSide = true;
      }
    }

    // Shifts the tetromino right if it is possible. Also, includes a delay for precision.
    if(!obstructionOnRightSide && (rightTimeHeld === 0 || rightTimeHeld >= holdDelay)) {
      activeTetromino.column1++;
      activeTetromino.column2++;
      activeTetromino.column3++;
      activeTetromino.column4++;
    }
    obstructionOnRightSide = false;
    rightTimeHeld++;
  }
  else {
    rightTimeHeld = 0;
  }

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
    }
  }
  else {
    hardDropped = false;
  }

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

function rotateTetromino(clockwise) {
/**Rotates the active tetromino according to official guideline tetris SRS. Also, handles wall-kicks, if they are possible. */

  invalidRotation = true;
  activeTetrominoOld = {...activeTetromino};

  if (activeTetromino.rotation === 0 && clockwise || activeTetromino.rotation === 3 && !clockwise) {
    activeTetromino.column1 += activeTetromino.blockChange1[0];
    activeTetromino.row1 += activeTetromino.blockChange1[1];
    activeTetromino.column2 += activeTetromino.blockChange2[0];
    activeTetromino.row2 += activeTetromino.blockChange2[1];
    activeTetromino.column3 += activeTetromino.blockChange3[0];
    activeTetromino.row3 += activeTetromino.blockChange3[1];
    activeTetromino.column4 += activeTetromino.blockChange4[0];
    activeTetromino.row4 += activeTetromino.blockChange4[1];
  }

  else if (activeTetromino.rotation === 1 && clockwise || activeTetromino.rotation === 0 && !clockwise) {
    activeTetromino.column1 -= activeTetromino.blockChange1[1];
    activeTetromino.row1 += activeTetromino.blockChange1[0];
    activeTetromino.column2 -= activeTetromino.blockChange2[1];
    activeTetromino.row2 += activeTetromino.blockChange2[0];
    activeTetromino.column3 -= activeTetromino.blockChange3[1];
    activeTetromino.row3 += activeTetromino.blockChange3[0];
    activeTetromino.column4 -= activeTetromino.blockChange4[1];
    activeTetromino.row4 += activeTetromino.blockChange4[0];
  }

  else if (activeTetromino.rotation === 2 && clockwise || activeTetromino.rotation === 1 && !clockwise) {
    activeTetromino.column1 -= activeTetromino.blockChange1[0];
    activeTetromino.row1 -= activeTetromino.blockChange1[1];
    activeTetromino.column2 -= activeTetromino.blockChange2[0];
    activeTetromino.row2 -= activeTetromino.blockChange2[1];
    activeTetromino.column3 -= activeTetromino.blockChange3[0];
    activeTetromino.row3 -= activeTetromino.blockChange3[1];
    activeTetromino.column4 -= activeTetromino.blockChange4[0];
    activeTetromino.row4 -= activeTetromino.blockChange4[1];
  }

  else {
    activeTetromino.column1 += activeTetromino.blockChange1[1];
    activeTetromino.row1 -= activeTetromino.blockChange1[0];
    activeTetromino.column2 += activeTetromino.blockChange2[1];
    activeTetromino.row2 -= activeTetromino.blockChange2[0];
    activeTetromino.column3 += activeTetromino.blockChange3[1];
    activeTetromino.row3 -= activeTetromino.blockChange3[0];
    activeTetromino.column4 += activeTetromino.blockChange4[1];
    activeTetromino.row4 -= activeTetromino.blockChange4[0];
  }
  for (let kickTests = 0; invalidRotation === true && kickTests < 5; kickTests++) {
    invalidRotation = false;
    for (let checkMino of tetrisBoards.get("tetrisGame0").get("minos")) {
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
            activeTetromino.column1 -= 2;
            activeTetromino.column2 -= 2;
            activeTetromino.column3 -= 2;
            activeTetromino.column4 -= 2;
          }
          else {
            activeTetromino.column1 += 3;
            activeTetromino.column2 += 3;
            activeTetromino.column3 += 3;
            activeTetromino.column4 += 3;
          }
        }
        else {
          if (kickTests === 0) {
            activeTetromino.column1 += 2;
            activeTetromino.column2 += 2;
            activeTetromino.column3 += 2;
            activeTetromino.column4 += 2;
          }
          else if (kickTests === 1 || kickTests === 2) {
            activeTetromino.column1 -= 3;
            activeTetromino.column2 -= 3;
            activeTetromino.column3 -= 3;
            activeTetromino.column4 -= 3;
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
          activeTetromino.column1 -= 1;
          activeTetromino.column2 -= 1;
          activeTetromino.column3 -= 1;
          activeTetromino.column4 -= 1;
        }
        else {
          activeTetromino.column1 += 1;
          activeTetromino.column2 += 1;
          activeTetromino.column3 += 1;
          activeTetromino.column4 += 1;
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
          activeTetromino.row1 -= 1;
          activeTetromino.row2 -= 1;
          activeTetromino.row3 -= 1;
          activeTetromino.row4 -= 1;
        }
        else {
          activeTetromino.row1 += 1;
          activeTetromino.row2 += 1;
          activeTetromino.row3 += 1;
          activeTetromino.row4 += 1;
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
          activeTetromino.row1 -= 2;
          activeTetromino.row2 -= 2;
          activeTetromino.row3 -= 2;
          activeTetromino.row4 -= 2;
        }
        else {
          activeTetromino.row1 += 2;
          activeTetromino.row2 += 2;
          activeTetromino.row3 += 2;
          activeTetromino.row4 += 2;
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
          activeTetromino.row1 += 3;
          activeTetromino.row2 += 3;
          activeTetromino.row3 += 3;
          activeTetromino.row4 += 3;
        }
        else {
          activeTetromino.row1 -= 3;
          activeTetromino.row2 -= 3;
          activeTetromino.row3 -= 3;
          activeTetromino.row4 -= 3;
        }
      }
    }
  }

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