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
let uIScale = 1377/1900;
let nextPieces = 7;

const SWAP = 1;
const I = 2;
const J = 3;
const L = 4;
const O = 5;
const S = 6;
const Z = 7;
const T = 8;

const KEY_D = 68;
const KEY_A = 65;
const KEY_S = 83;
const SPACE = 32;
const KEY_X = 88;
const KEY_W = 87;
const KEY_Z = 90;
const KEY_C = 67;

const TETROMINO_I = {color: "cyan",
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

const TETROMINO_J = {color: "blue",
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

const TETROMINO_L = {color: "orange",
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

const TETROMINO_O = {color: "yellow",
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

const TETROMINO_S = {color: "green",
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

const TETROMINO_Z = {color: "red",
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

const TETROMINO_T = {color: "purple",
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

const TETROMINO_SWAP = {color: "black",
  column1: columnLines**2,
  row1: rowLines**2,
  column2: columnLines**2,
  row2: rowLines**2,
  column3: columnLines**2,
  row3: rowLines**2,
  column4: columnLines**2,
  row4: rowLines**2,
};

/**
 * Checks if the rotation is a specific value.
 * @param {number} rotationToCheck - What rotation to check for. 
 * @param {number} [differentRotation] - Optionally, check another rotation that is this amount less.
 * @returns {boolean} - If it is either rotation.
 */
const isRotation = (rotationToCheck, differentRotation = 0) => activeTetromino.rotation === rotationToCheck ||
    activeTetromino.rotation === rotationToCheck - differentRotation;

/**
 * Represents a single mino on any board.
 */
class Mino {

  /**
   * Creates a new mino. 
   * @param {number} row - The row to create a mino on.
   * @param {number} column - The column to create a mino on.
   * @param {string} color - The P5JS built-in color of the mino.
  */
  constructor(row, column, color) {
    this.row = row;
    this.column = column;
    this.color = color;
  }

  /**
   * Draws this mino.
   * @param {number} x1 - The lowest x value on the board. 
   * @param {number} y1 - The lowest y value on the board.
   * @param {number} x2 - The highest x value on the board.
   * @param {number} y2 - The highest y value on the board.
   */
  display(x1, y1, x2, y2) {
    fill(this.color);
    rect(this.column * (x2 - x1)/columnLines + x1, this.row * (y2 - y1)/rowLines + y1,
      (x2 - x1)/columnLines, (y2 - y1)/rowLines);
  }

  /**
   * Removes this mino if it's row is cleared, and moves it down if it's row is above.
   * @param {number} rowCleared - The row that has been cleared.
   * @param {number} thisIndex - The index of the current mino.
   */
  lineCleared(rowCleared, thisIndex) {

    // If this row is cleared, remove this mino.
    if (this.row === rowCleared) {
      tetrisBoards.get("tetrisGame0").minos.splice(thisIndex, 1);
    }

    // If a row below this mino has been cleared, move it down.
    else if (this.row < rowCleared) {
      this.row++;
    }
  }

  /**
   * Checks if this mino is a neighbor of the front corner or rear corners of the active T tetromino.
   */
  neighborT() {

    /**
     * Checks if this mino's row/column is some amount of distance away from the sticky-out bit of the t tetromino.
     * @param {string} rowOrColumn - Either row or column, depending on what you want to check. 
     * @param {number} [change] - How many rows/columns away it should be (optional, defaults to 0).
     * @param {string} [secondOperator] - After adding change to the row/column, optionally check another operator. 
     * @returns {boolean} If it is or isn't that amount of distance away.
     */
    const neighbors = (rowOrColumn, change = 0, secondOperator = "-",) => 
      eval(`this.${rowOrColumn} + ${change} === activeTetromino.${rowOrColumn}2 ||
    this.${rowOrColumn} ${secondOperator} ${change} === activeTetromino.${rowOrColumn}2`);

    // If it is on the right/left of the sticky-out bit of the t tetromino, increment the amount of front neighbors.
    if (neighbors("row") && neighbors("column", 1) && isRotation(2, 2) ||
    neighbors("column") && neighbors("row", 1) && isRotation(3, 2)) {
      activeTetromino.frontCornerNeighbors++;
    }

    // If it is directly below the bottom row of the t tetromino, increment the amount of rear neighbors.
    else if (neighbors("row", 2, "+") && neighbors("column", 1) && isRotation(2) || 
    neighbors("row", -2, "+") && neighbors("column", 1) && isRotation(0) ||
  neighbors("column", -2, "+") && neighbors("row", 1) && isRotation(3) || 
  neighbors("column", 2, "+") && neighbors("row", 1) && isRotation(1)) {
      activeTetromino.rearCornerNeighbors++;
    }
  }

  /**
   * Checks if this mino collides with the active tetromino after moving across columns.
   * @param {number} shift - How many columns the active tetromino is trying to move.
   * @returns {boolean} If it is safe to move the tetromino.
   */
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

/**
 * Converts values in the bag or being held into their proper forms.
 * @param {number} currentIndex - The index in the bag that is being checked. 
 * @param {boolean} wantHeldPiece - Whether or not to instead look at the piece being held.
 * @returns {object} - The starting values of the tetromino or "swap".
 */
function whatIsInTheBag(currentIndex, wantHeldPiece) {
  // Returns "swap" if that is at currentIndex.
  if (bag[currentIndex] === SWAP && !wantHeldPiece) {
    return "swap";
  }

  // Returns the I values if they are at currentIndex.
  else if (bag[currentIndex] === I && !wantHeldPiece || heldPiece === I && wantHeldPiece) {
    return {...TETROMINO_I};
  }

  // Returns the J values if they are at currentIndex.
  else if (bag[currentIndex] === J && !wantHeldPiece || heldPiece === J && wantHeldPiece) {
    return {...TETROMINO_J};
  }

  // Returns the L values if they are at currentIndex.
  else if (bag[currentIndex] === L && !wantHeldPiece || heldPiece === L && wantHeldPiece) {
    return {...TETROMINO_L};
  }

  // Returns the O values if they are at currentIndex.
  else if (bag[currentIndex] === O && !wantHeldPiece || heldPiece === O && wantHeldPiece) {
    return {...TETROMINO_O};
  }

  // Returns the S values if they are at currentIndex.
  else if (bag[currentIndex] === S && !wantHeldPiece || heldPiece === S && wantHeldPiece) {
    return {...TETROMINO_S};
  }

  // Returns the Z values if they are at currentIndex.
  else if (bag[currentIndex] === Z && !wantHeldPiece || heldPiece === Z && wantHeldPiece) {
    return {...TETROMINO_Z};
  }

  // Otherwise, returns the T values.
  return {...TETROMINO_T};
}

/**
 * Either represents a game board or the board used for the UI.
 */
class TetrisBoard {

  /**
   * Creates a new tetris board.
   * @param {number} x1 - The minimum value for x on this board.
   * @param {number} y1 - The minimum value for y on this board.
   * @param {number} x2 - The maximum value for x on this board.
   * @param {number} y2 - The maximum value for y on this board.
   * @param {Array} [minos] An array holding all the minos for this board (optional, defaults to an empty array).
   */
  constructor(x1, y1, x2, y2, minos = []) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.minos = minos;
  }
  
  /**
   * Draws this tetris board.
   * @param {Object} [options] - The options object.
   * @param {number} [options.gameNumber] This board's number, optional. 
   * @param {boolean} [options.drawGrid] Whether or not to draw the board, defaults to true. 
   */
  display({gameNumber, drawGrid = true} = {}) {
    stroke("white");

    if (drawGrid) {
    // Draws the vertical lines of the grid.
      for(let currentColumn = 0; currentColumn < columnLines + 1; currentColumn++) {
        let xValue = (this.x2 - this.x1)/columnLines * currentColumn + this.x1;
        line(xValue, this.y1, xValue, this.y2);
      }

      // Draws the horizontal lines of the grid.
      for(let currentRow = 0; currentRow < rowLines + 1; currentRow++) {
        let yValue =  (this.y2 - this.y1)/rowLines * currentRow + this.y1;
        line(this.x1, yValue, this.x2, yValue);
      }
    }

    // Draws the minos.
    for(let currentMino of this.minos) {
      currentMino.display(this.x1, this.y1, this.x2, this.y2);
    }

    // Only draw the UI for the primary game.
    if (gameNumber === 0) {
      this.drawUI();
    }
  }

  /**\
   * Enables or disables the mino the mouse is hovering over.
   */
  toggleCell() {
    // Set the x and y values to where the mouse is on the grid's columns and rows.
    let x = Math.floor(mouseX/(width/(columnLines*3))) - columnLines;
    let y = Math.floor(mouseY/(height/rowLines));

    // Loops through every mino.
    for (let currentMino = 0; currentMino < this.minos.length; currentMino++) {
      // If the mino you are clicking on exists already, remove it and end the loop.
      if (this.minos[currentMino].column === x && this.minos[currentMino].row === y) {
        this.minos.splice(currentMino, 1);
        return;
      }
    }

    // Since there is no mino where the mouse is, add one there.
    this.minos.push(new Mino(y, x, "Grey"));
  }

  /**
   * Resizes the text to be as large as it can, within bounds.
   * @param {number} newWidth - The largest possible value the text can be without going over the width. 
   */
  resizeText(newWidth) {

    // If it is limited by the width, scale it to newWidth.
    if (newWidth < height/667 * 30 * uIScale) {
      textSize(newWidth);
    }

    // Otherwise, scale it to the height of one mino.
    else {
      textSize(height/667 * 30 * uIScale);
    }
  }

  /**
   * Draws all of the UI, except for the minos that are part of the UI.
   */
  drawUI() {
    textAlign(CENTER, TOP);
    fill("white");

    // Draws NEXT and HOLD at the same size.
    this.resizeText(width/80 * 3 * uIScale);
    text("NEXT", this.x2 + width/(3*rowLines) * 4 * uIScale, this.y1 * uIScale);
    text("HOLD", this.x2 + width/(3*rowLines) * 4 * uIScale, (this.y2 - height/rowLines * 2) * uIScale);
    
    // Draws SCORE, LEVEL, and LINES at the same size.
    this.resizeText(width/1280 * 27 * (uIScale + 3/20));
    text("SCORE", this.x2 + width/(3*rowLines) * 4 * uIScale, (this.y2 + height/rowLines) * uIScale);
    text("LEVEL", this.x2 + width/(3*rowLines) * 4 * uIScale, (this.y2 + height/rowLines * 3) * uIScale);
    text("LINES", this.x2 + width/(3*rowLines) * 4 * uIScale, (this.y2 + height/rowLines * 5) * uIScale);

    // Draws the score number, automatically resizing based on it's length.
    this.resizeText(width/80 * 3/(4 - score.length + 1));
    text(score, this.x2 + width/(3*rowLines) * 4 * uIScale, (this.y2 + 2 * height/rowLines) * uIScale);

    // Draws the level number, automatically resizing based on it's length.
    this.resizeText(width/80 * 3/(4 - level.length + 1));
    text(level, this.x2 + width/(3*rowLines) * 4 * uIScale, (this.y2 + 4 * height/rowLines) * uIScale);

    // Draws the amount of lines cleared, automatically resizing based on it's length.
    this.resizeText(width/80 * 3/(4 - totalLinesCleared.length + 1));
    text(totalLinesCleared, this.x2 + width/(3*rowLines) * 4 * uIScale,
      (this.y2 + 6 * height/rowLines) * uIScale);
  }

  /**
   * Draws the minos representing the next pieces.
   */
  drawNextPieces() {
    let currentHeight = 1;
    let textHeight = this.y1;

    // Loops through all the tetrominos/SWAP to be displayed next.
    for (let bagIndex = 0; bagIndex < nextPieces; bagIndex++) {

      // Draws the word SWAP if swap is at bagIndex.
      if (whatIsInTheBag(bagIndex) === "swap") {
        textAlign(CENTER, TOP);
        fill("white");

        this.resizeText(width/80 * 3 * uIScale);
        text("SWAP", this.x1 + width/(3*rowLines) * 4 * uIScale, textHeight * uIScale);
      }

      else {
        // Loops through each mino in the tetromino at bagIndex.
        for (let minoNumber = 1; minoNumber <= 4; minoNumber++) {

          // Draws O and I, 3 to the left of their starting position.
          if (bag[bagIndex] === I || bag[bagIndex] === O) {
            eval(`this.minos.push(new Mino(whatIsInTheBag(bagIndex).row${minoNumber} + ${currentHeight},
            whatIsInTheBag(bagIndex).column${minoNumber} - 3, whatIsInTheBag(bagIndex).color))`);
          }

          // Draws everything else 2.5 to the left of their starting position.
          else {
            eval(`this.minos.push(new Mino(whatIsInTheBag(bagIndex).row${minoNumber} + ${currentHeight},
            whatIsInTheBag(bagIndex).column${minoNumber} - 2.5, whatIsInTheBag(bagIndex).color))`);
          }
        }
      }

      // Sets the next piece to be drawn 1.5 rows down if it is an I or SWAP.
      if (bag[bagIndex] === SWAP || bag[bagIndex] === I) {
        currentHeight += 1.5;
        textHeight += 1.5*height/rowLines;
      }

      // Otherwise, sets the next piece to be drawn 2.5 rows down.
      else {
        currentHeight += 2.5;
        textHeight += 2.5*height/rowLines;
      }
    }
  }

  /**
   * Draws all the UI elements that contain minos.
   */
  updateMinoUIElements() {
    let rowOffset;
    let columnOffset;
    
    // Clears the previous minos.
    this.minos = [];

    this.drawNextPieces();
     
    // If an I is being held, moves it down 19.5 rows.
    if (heldPiece === I) {
      rowOffset = 19.5;
    }
    
    // Otherwise, if any piece is being held, moves it down 19 rows.
    else if (heldPiece) {
      rowOffset = 19;
    }

    // If an I or O is being held, move it 3 columns to the left.
    if (heldPiece === I || heldPiece === O) {
      columnOffset = -3;
    }

    // Otherwise, move it 2.5 columns to the left.
    else {
      columnOffset = -2.5;
    }

    // Loops through every mino of the held tetromino, adding it to the UI.
    for (let minoNumber = 1; minoNumber <= 4; minoNumber++) {
      eval(`this.minos.push(new Mino(whatIsInTheBag(0, true).row${minoNumber} + rowOffset, whatIsInTheBag(0, true).column${minoNumber} + columnOffset, whatIsInTheBag(0, true).color))`);
    }
  }
}

/**
 * Checks for a mini T spin.
 * @returns If it is or isn't a mini T spin.
 */
const miniTSpin = () => activeTetromino.frontCornerNeighbors === 1 && activeTetromino.rearCornerNeighbors >= 2;

/**
 * Checks for a T spin.
 * @returns If it is or isn't a T spin.
 */
const tSpin = () => activeTetromino.frontCornerNeighbors >= 2 && activeTetromino.rearCornerNeighbors >= 1 ||
miniTSpin() && activeTetromino.kickTestsTaken === 4;

/**
 * Refills the bag.
 */
function fillBag() {
  let loops = 0;
  let availableChoices = [1, 2, 3, 4, 5, 6, 7, 8];

  // Loops until bag has been refilled.
  while(loops < 8) {
    // Picks a random choice.
    let choice = Math.floor(random(1, 9));

    // If it hasn't been picked yet, add it to the bag, remove it from possible choices, and increment the loop.
    if (availableChoices.includes(choice)) {
      bag.push(choice);
      availableChoices.splice(availableChoices.indexOf(choice), 1);
      loops++;
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Sets the first board's coordinates.
  tetrisBoards.set("tetrisGame0", new TetrisBoard(width/3, 0, width/3 * 2, height));

  let currentGame = 1;

  // Loops through each row of extra game boards.
  for(let currentGameRow = 0; currentGameRow < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games;
    currentGameRow++) {
    // Loops through each column of extra game boards.
    for(let currentGameColumn = 0; currentGameColumn < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games;
      currentGameColumn++) {
      let x1 = currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1)));
      let y1 = currentGameRow * height/Math.ceil(Math.sqrt(games - 1));

      // Creates the current board.
      tetrisBoards.set(`tetrisGame${currentGame}`, new TetrisBoard(x1, y1,
        x1 + width/(3 * Math.ceil(Math.sqrt(games - 1))), y1 + height/Math.ceil(Math.sqrt(games - 1))));

      // Moves on to the next board.
      currentGame++;
    }
  }

  // Sets up the coordinates for the next piece board.
  tetrisBoards.set("nextPiece", new TetrisBoard(width/3 * 2, height/rowLines,
    width/3 * 2 + width/3 * uIScale, height/rowLines * (rowLines + 1) * uIScale));

  fillBag();
}

/**
 * Moves the active tetromino.
 * @param {Object} [options] - The options object.
 * @param {boolean} [options.fullShift = true] - Whether or not to move the entire tetromino rowChange1 rows and columnChange1 columns. Defaults to true.
 * @param {number} [options.rowChange1 = 0] - How many rows to move either the first mino if not fullShift, or the entire mino if fullShift (optional).
 * @param {number} [options.columnChange1 = 0] - How many columns to move either the first mino if not fullShift, or the entire mino if fullShift (optional).
 * @param {number} [options.rowChange2 = 0] - How many rows to move the second mino, defaults to 0.
 * @param {number} [options.columnChange2 = 0] - How many columns to move the second mino, defaults to 0.
 * @param {number} [options.rowChange3 = 0] - How many rows to move the third mino, defaults to 0.
 * @param {number} [options.columnChange3 = 0] - How many columns to move the third mino, defaults to 0.
 * @param {number} [options.rowChange4 = 0] - How many rows to move the fourth mino, defaults to 0.
 * @param {number} [options.columnChange4 = 0] - How many columns to move the fourth mino, defaults to 0.
 */
function shiftActiveTetromino({fullShift = true, rowChange1 = 0, columnChange1 = 0, rowChange2 = 0,
  columnChange2 = 0, rowChange3 = 0, columnChange3 = 0, rowChange4 = 0, columnChange4 = 0} = {}) {
  // Loops through all minos.
  for (let minoNumber = 1; minoNumber <= 4; minoNumber++) {
    // If fullShift, add the value stored to rowChange1 and columnChange1 to the current mino.
    if (fullShift) {
      eval(`activeTetromino.row${minoNumber} += rowChange1`);
      eval(`activeTetromino.column${minoNumber} += columnChange1`);
    }

    // Otherwise, add this minos rowChange and columnChange.
    else {
      eval(`activeTetromino.row${minoNumber} += rowChange${minoNumber}`);
      eval(`activeTetromino.column${minoNumber} += columnChange${minoNumber}`);
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
      shiftActiveTetromino({columnChange1: -1});
      if (leftTimeHeld !== 0) {
        if (didLeftDAS) {
          leftTimeStartedHeld += 100/3;
          if (timer - leftTimeStartedHeld >= 100/3 + holdDelay) {
            moveLeft();
          }
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

function controlTetris() {
  moveLeft();
  moveRight();
  drop();
  rotateIt();
  hold();
}

function draw() {
  background("black");

  // Draws each game.
  for(let gameNumber = 0; gameNumber < games; gameNumber++) {
    tetrisBoards.get(`tetrisGame${gameNumber}`).display({gameNumber: gameNumber});
  }

  tetrisBoards.get("nextPiece").display({drawGrid: false});

  if (gamemode === "PT") {
    timer = millis() - timePaused;
    controlTetris();
    moveActiveTetromino();
  }

  else {
    timePaused = millis() - timer;
  }
  tetrisBoards.get("nextPiece").updateMinoUIElements();
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

  // Sets up the coordinates for the next piece board.
  tetrisBoards.set("nextPiece", new TetrisBoard(width/3 * 2, height/rowLines,
    width/3 * 2 + width/3 * uIScale,
    height/rowLines * (rowLines + 1) * uIScale, tetrisBoards.get("nextPiece").minos));
}

function swap() {
  /**Shifts all tetris games' values down one, taking tetrisGame0 and putting it on the last game.*/
  
  let gameZero = tetrisBoards.get("tetrisGame0");
  let numberOfGame = 1;

  // Loops through every tetris game except the first one, giving the previous game it's value.
  for (let [nameOfGame, tetrisInformation] of tetrisBoards) {
    if (nameOfGame !== "tetrisGame0" && nameOfGame !== "nextPiece") {
      tetrisBoards.set(`tetrisGame${numberOfGame - 1}`, tetrisInformation);
      numberOfGame++;
    }
  }

  // Sets the last game to the value stored in the first game.
  tetrisBoards.set(`tetrisGame${numberOfGame - 1}`, gameZero);

  // Calls windowResized to recalculate every boards' new position.
  windowResized();
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
  if (whatIsInTheBag(0) === "swap") {
    swap();
  }
  else {
    activeTetromino = whatIsInTheBag(0);
  }

  bag.shift();
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
            shiftActiveTetromino({columnChange1: -2});
          }
          else {
            shiftActiveTetromino({columnChange1: 3});
          }
        }
        else {
          if (kickTests === 0) {
            shiftActiveTetromino({columnChange1: 2});
          }
          else if (kickTests === 1 || kickTests === 2) {
            shiftActiveTetromino({columnChange1: -3});
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
          shiftActiveTetromino({columnChange1: -1});
        }
        else {
          shiftActiveTetromino({columnChange1: 1});
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
          shiftActiveTetromino({rowChange1: -1});
        }
        else {
          shiftActiveTetromino({rowChange1: 1});
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
          shiftActiveTetromino({rowChange1: -2});
        }
        else {
          shiftActiveTetromino({rowChange1: 2});
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
          shiftActiveTetromino({rowChange1: 3});
        }
        else {
          shiftActiveTetromino({rowChange1: -3});
        }
      }
    }
    if (!invalidRotation) {
      return kickTests;
    }
  }
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
      shiftActiveTetromino({columnChange1: 1});
      if (rightTimeHeld !== 0) {
        if (didRightDAS) {
          rightTimeStartedHeld += 100/3;
          if (timer - rightTimeStartedHeld >= 100/3 + holdDelay) {
            moveRight();
          }
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
  let multiplier = 1;

  if (difficultClear) {
    let multiplier = 1.5;
  }

  if (linesCleared === 1) {
    scoreClearTSpins(800, 200, 100, multiplier);
    if (tetrisBoards.get("tetrisGame0").minos.length === 0) {
      score += 800 * level;
    }
  }
  
  else if (linesCleared === 2) {
    scoreClearTSpins(1200, 400, 300, multiplier);
    if (tetrisBoards.get("tetrisGame0").minos.length === 0) {
      score += 1200 * level;
    }
  }

  else if (linesCleared === 3) {
    scoreClearTSpins(1600, 0, 500, multiplier);
    if (tetrisBoards.get("tetrisGame0").minos.length === 0) {
      score += 1800 * level;
    }
  }

  if (linesCleared === 4) {
    score += 800 * level * multiplier;
    difficultClear = true;
    if (tetrisBoards.get("tetrisGame0").minos.length === 0) {
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

function scoreClearTSpins(tSpinScore, miniScore, defaultScore, multiplier) {
  if (activeTetromino.color === "purple" && (tSpin() || miniTSpin())) {
    if (tSpin()) {
      score += tSpinScore * level * multiplier;
      difficultClear = true;
    }

    else if (miniTSpin()) {
      score += miniScore * level * multiplier;
      difficultClear = true;
    }
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

function updatePosition(secondCheck) {
  if (activeTetromino.row1 >= 0 &&
    activeTetromino.row2 >= 0 &&
    activeTetromino.row3 >= 0 &&
    activeTetromino.row4 >= 0 && !secondCheck) {
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
  if (hardDrop === "movePiece") {
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

function goDownAndScore() {
  shiftActiveTetromino({rowChange1: 1});
  lastUpdate = timer;
  activeTetromino.rotatedLast = false;

  if (softDrop) {
    score++;
  }
}

function initialRotation(clockwise) {
  if (activeTetromino.rotation === 0 && clockwise || activeTetromino.rotation === 3 && !clockwise) {
    shiftActiveTetromino({fullShift: false, rowChange1: activeTetromino.blockChange1[1],
      columnChange1: activeTetromino.blockChange1[0], rowChange2: activeTetromino.blockChange2[1],
      columnChange2: activeTetromino.blockChange2[0], rowChange3: activeTetromino.blockChange3[1],
      columnChange3: activeTetromino.blockChange3[0], rowChange4: activeTetromino.blockChange4[1], 
      columnChange4: activeTetromino.blockChange4[0]});
  }

  else if (activeTetromino.rotation === 1 && clockwise || activeTetromino.rotation === 0 && !clockwise) {
    shiftActiveTetromino({fullShift: false, rowChange1: activeTetromino.blockChange1[0],
      columnChange1: -activeTetromino.blockChange1[1], rowChange2: activeTetromino.blockChange2[0],
      columnChange2: -activeTetromino.blockChange2[1], rowChange3: activeTetromino.blockChange3[0],
      columnChange3: -activeTetromino.blockChange3[1], rowChange4: activeTetromino.blockChange4[0],
      columnChange4: -activeTetromino.blockChange4[1]});
  }

  else if (activeTetromino.rotation === 2 && clockwise || activeTetromino.rotation === 1 && !clockwise) {
    shiftActiveTetromino({fullShift: false, rowChange1: -activeTetromino.blockChange1[1],
      columnChange1: -activeTetromino.blockChange1[0], rowChange2: -activeTetromino.blockChange2[1],
      columnChange2: -activeTetromino.blockChange2[0], rowChange3: -activeTetromino.blockChange3[1],
      columnChange3: -activeTetromino.blockChange3[0], rowChange4: -activeTetromino.blockChange4[1],
      columnChange4: -activeTetromino.blockChange4[0]});
  }

  else {
    shiftActiveTetromino({fullShift: false, rowChange1: -activeTetromino.blockChange1[0],
      columnChange1: activeTetromino.blockChange1[1], rowChange2: -activeTetromino.blockChange2[0],
      columnChange2: activeTetromino.blockChange2[1], rowChange3: -activeTetromino.blockChange3[0],
      columnChange3: activeTetromino.blockChange3[1], rowChange4: -activeTetromino.blockChange4[0],
      columnChange4: activeTetromino.blockChange4[1]});
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