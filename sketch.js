let columnLines = 10;
let rowLines = 20;
let tetrisBoards = new Map();
let games = 3;
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
let gamemode = "MM";
let timePaused = 0;
let justTetrised = false;
let entryDelay = 100;
let entryDelayStart = 0;
let totalLinesCleared = 0;
let leftTimeStartedHeld = 0;
let leftDidDAS = false;
let rightTimeStartedHeld = 0;
let rightDidDAS = false;
let uIScale = 1377/1900;
let nextPieces = 7;
let softDropScore = 1;
let difficultClearMultiplier = 1.5;
let baseTetrisScore = 800;
let basePCTetrisScore = 2000;
let baseBTBPCTetrisScore = 1200;
let baseLineTSScore = 800;
let baseLineScore = 100;
let baseLineMTSScore = 200;
let basePCScore = 800;
let baseComboBonus = 50;
let baseTSpinScore = 400;
let baseMiniTSpinScore = 100;
let menuButtons = [];
let amountOfMenuButtons = 4;
let availableChoices = [1, 2, 3, 4, 5, 6, 7, 8];
let baseTetrisNextPieces = 6;

// How many frames it should take for the AS to move the active mino at 60FPS.
let aSUpdateDelay = 2;

const HELP_TEXT = "In Tetris, you control falling tetrominoes, \
which are pieces made up of four squares (called minos), \
aiming to create complete horizontal lines without gaps.\n\
\
These tetrominoes fall one at a time from the top of the vertical rectangular grid.\n\
\
You can move the pieces left, right, or down, and rotate them to fit them into place.\n\
\
The controls are available in the OPTIONS menu. When you complete a line, it clears, and you earn points.\n\
\
As you progress, the game speeds up, increasing the challenge.\n\
\
The game ends when the tetrominoes stack up to the top of the board, leaving no room for new pieces to enter.\n\
\
\
\nIn Tetris SWAP!, you play with the same basic mechanics, but with an exciting twist: the \"swap\" action.\n\
\
When it switches to the \"swap\" action in the queue, \
it triggers a swap of your current board with another Tetris board on the left side of the screen.\n\
\
This means your board is exchanged with the one closest to the top left of the screen, \
and you must continue playing on the new board. \n\
\
The \"swap\" can happen at any time, adding an extra layer of strategy.\n\
\
Your goal remains to clear lines and prevent the tetrominoes from stacking to the top, \
but now you must adapt to the changing boards as you play.";

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
  pieceName: I,
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
  pieceName: J,
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
  pieceName: L,
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
  pieceName: O,
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
  pieceName: S,
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
  pieceName: Z,
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
  pieceName: T,
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
    const neighbors = (rowOrColumn, change = 0, secondOperator = "-") => 
      this[rowOrColumn] + change === activeTetromino[`${rowOrColumn}2`] ||
      (secondOperator === "-" ? this[rowOrColumn] - change === activeTetromino[`${rowOrColumn}2`] : false);

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
   * Checks if this mino collides with the active tetromino after moving.
   * @param {object} [options] - The options object.
   * @param {number} [options.columnShift] - How many columns the active tetromino is trying to move, optional.
   * @param {number} [options.rowShift] - How many rows the active tetromino is trying to move, optional.
   * @returns {boolean} If it is safe to move the tetromino.
   */
  collidesWithActive({columnShift = 0, rowShift = 0} = {}) {
    for(let minoNumber of [1, 2, 3, 4]) {
      if (eval(`this.column === activeTetromino.column${minoNumber} + ${columnShift}
      && this.row === activeTetromino.row${minoNumber} + ${rowShift}`)) {
        return true;
      }
    }
    return false;
  }
}

function startTetris() {
  availableChoices.shift();
  bag = [];
  uIScale = uIScale * (rowLines/(rowLines - 1))**(nextPieces - baseTetrisNextPieces);
  nextPieces = baseTetrisNextPieces;
  games = 1;

  // Sets up the coordinates for the next piece board.
  tetrisBoards.set("nextPiece", new TetrisBoard(width/3 * 2, height/rowLines,
    width/3 * 2 + width/3 * uIScale,
    height/rowLines * (rowLines + 1) * uIScale, tetrisBoards.get("nextPiece").minos));

  gamemode = "PT";
}

class Button {
  constructor(text, rowNumber, textWidthScale, onClick, rectangleX, textX, displayHelpText) {
    this.text = text;
    this.rowNumber = rowNumber;
    this.textWidthScale = textWidthScale;
    this.onClick = onClick;
    this.y1 = height*(this.rowNumber - 1)/amountOfMenuButtons + height/amountOfMenuButtons/4;
    this.displayHelpText = displayHelpText;
    this.x1 = rectangleX;
    this.textX = textX;
  }

  display() {
    fill("white");
    rect(eval(this.x1), this.y1, width/3, height/amountOfMenuButtons/2);

    fill("black");
    textAlign(CENTER, CENTER);

    if (74/667 * height < this.textWidthScale * width) {
      textSize(74/667 * height);
    }
  
    else {
      textSize(this.textWidthScale * width);
    }

    text(this.text, eval(this.textX), height*(1 + 2*(this.rowNumber - 1))/2/amountOfMenuButtons);

    if (this.displayHelpText) {
      fill("white");
      textAlign(LEFT, TOP);
      
      if (51/3200 * width < 73/1334 * height) {
        textSize(51/3200 * width);
      }

      else {
        textSize(73/1334 * height);
      }

      text(HELP_TEXT, 0, 0);
    }
  }

  buttonClicked() {
    if (mouseY > this.y1 && mouseY < this.y1 + height/amountOfMenuButtons/2) {
      eval(this.onClick);
    }
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
 * Determines how many spaces down the tetromino can safely drop.
 * @returns {number} - How many minos the tetromino can drop.
 */
function drawGhostPiece() {
  let spacesToDrop = 0;
  let safeToDrop = true;

  /**
     * Makes sure the active tetromino doesn't go under the board.
     * @param {number} minoNumber - The number of the mino to check
     * @returns {boolean} - Whether or not the active tetromino will go under.
     */
  const doesNotEscape = (minoNumber) => eval(`activeTetromino.row${minoNumber}`) + spacesToDrop < rowLines;

  // Loops until something is underneath the tetromino.
  while (doesNotEscape(1) && doesNotEscape(2) && doesNotEscape(3) && doesNotEscape(4) && safeToDrop) {
    spacesToDrop++;

    // Loops through every mino.
    for (let minoToCheck of tetrisBoards.get("tetrisGame0").minos) {
      // Checks if the active tetromino would collide with the current mino.
      if (minoToCheck.collidesWithActive({rowShift: spacesToDrop})) {
        safeToDrop = false;
        break;
      }
    }
  }

  return spacesToDrop - 1;
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
    text("HOLD", this.x2 + width/(3*rowLines) * 4 * uIScale,
      (this.y2 - height/rowLines*2*(8 - nextPieces)) * uIScale);
    
    // Draws SCORE, LEVEL, and LINES at the same size.
    this.resizeText(width/1280 * 27 * (uIScale + 3/20));
    text("SCORE", this.x2 + width/(3*rowLines) * 4 * uIScale,
      (this.y2 + height/rowLines * (nextPieces - 6)) * uIScale);
    text("LEVEL", this.x2 + width/(3*rowLines) * 4 * uIScale,
      (this.y2 + height/rowLines * (nextPieces - 4)) * uIScale);
    text("LINES", this.x2 + width/(3*rowLines) * 4 * uIScale,
      (this.y2 + height/rowLines * (nextPieces - 2)) * uIScale);

    // Draws the score number, automatically resizing based on it's length.
    this.resizeText(width/80 * 3/(4 - score.length + 1));
    text(score, this.x2 + width/(3*rowLines) * 4 * uIScale,
      (this.y2 + height/rowLines * (nextPieces - 5)) * uIScale);

    // Draws the level number, automatically resizing based on it's length.
    this.resizeText(width/80 * 3/(4 - level.length + 1));
    text(level, this.x2 + width/(3*rowLines) * 4 * uIScale,
      (this.y2 + height/rowLines * (nextPieces - 3)) * uIScale);

    // Draws the amount of lines cleared, automatically resizing based on it's length.
    this.resizeText(width/80 * 3/(4 - totalLinesCleared.length + 1));
    text(totalLinesCleared, this.x2 + width/(3*rowLines) * 4 * uIScale,
      (this.y2 + height/rowLines * (nextPieces - 1)) * uIScale);
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
     
    // If an I is being held, moves it down 12.5 rows added to the amount of next pieces.
    if (heldPiece === I) {
      rowOffset = 12.5 + nextPieces;
    }
    
    // Otherwise, if any piece is being held, moves it down 12 rows added to the amount of next pieces.
    else if (heldPiece) {
      rowOffset = 12 + nextPieces;
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

  /**
   * Displays the currently active piece.
   */
  drawActivePiece() {
    // Checks if the entire tetromino is visible.
    if (activeTetromino.row1 >= 0 && activeTetromino.row2 >= 0 && activeTetromino.row3 >= 0 &&
      activeTetromino.row4 >= 0) {
      let transparentColor = color(activeTetromino.color);
      transparentColor.setAlpha(125);

      // Loops through every mino of the active tetromino, drawing it.
      for (let minoNumber of [1, 2, 3, 4]) {
        fill(transparentColor);
        rect(eval(`activeTetromino.column${minoNumber}`) * (this.x2 - this.x1)/columnLines + this.x1,
          (eval(`activeTetromino.row${minoNumber}`) + drawGhostPiece()) * (this.y2 - this.y1)/rowLines + this.y1, 
          (this.x2 - this.x1)/columnLines, (this.y2 - this.y1)/rowLines);

        fill(activeTetromino.color);
        rect(eval(`activeTetromino.column${minoNumber}`) * (this.x2 - this.x1)/columnLines + this.x1,
          eval(`activeTetromino.row${minoNumber}`) * (this.y2 - this.y1)/rowLines + this.y1, 
          (this.x2 - this.x1)/columnLines, (this.y2 - this.y1)/rowLines);

      }
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
  let remainingChoices = [...availableChoices];

  // Loops until bag has been refilled.
  while(loops < availableChoices.length) {
    // Picks a random choice.
    let choice = Math.floor(random(1, 9));

    // If it hasn't been picked yet, add it to the bag, remove it from possible choices, and increment the loop.
    if (remainingChoices.includes(choice)) {
      bag.push(choice);
      remainingChoices.splice(remainingChoices.indexOf(choice), 1);
      loops++;
    }
  }
}

function subMenu(wantsOptions, wantsControls, wantsGameplay) {
  if (wantsControls || wantsGameplay) {
    menuButtons = [new Button("RETURN", 4, 27/320, "subMenu(true)",
      "width/3", "width/2", false)];
  }

  else {
    menuButtons = [new Button("RETURN", 4, 27/320, "mainMenuButtons()",
      "width/3", "width/2", !wantsOptions)];
  }

  if (wantsOptions) {
    let currentRow = 0;
    for (let currentButton of [["GAMEPLAY", 79/1280, "subMenu(false, false, true)"],
      ["CONTROLS", 77/1280, "subMenu(false, true)"], ["AUDIO", 27/256, ""]]) {
      currentRow++;
      menuButtons.push(new Button(currentButton[0], currentRow,
        currentButton[1], currentButton[2], "width/3", "width/2"));
    }
  }

  if (wantsControls) {
    let currentColumn = 0;
    for (let currentButton of [["MOVE LEFT", 57/1280, ""], ["MOVE RIGHT", 51/1280, ""],
      ["ROTATE CLOCKWISE", 1/40, ""], ["ROTATE COUNTER-CLOCKWISE", 21/1280, ""]]) {
      menuButtons.push(new Button(currentButton[0], 1, currentButton[1],
        currentButton[2], `${currentColumn} * width/4`, `width/8 + width/4*${currentColumn}`));
      
      currentColumn++;
    }

    currentColumn = 0;

    for (let currentButton of [["DROP: SOFT", 71/1280, ""], ["DROP: HARD", 17/320, ""],
      ["HOLD PIECE", 71/1280, ""]]) {
      menuButtons.push(new Button(currentButton[0], 2, currentButton[1],
        currentButton[2], `${currentColumn} * width/3`, `width/6 + width/3*${currentColumn}`));
      
      currentColumn++;
    }

    menuButtons.push(new Button("SWAP TO ALTERNATE BINDS", 3, 31/1280, "", width/3, width/2, false));
  }
}

function mainMenuButtons() {
  let currentRow = 0;
  menuButtons = [];
  for (let currentButton of [["PLAY TETRIS", 7/128, "startTetris()"],
    ["PLAY TETRIS SWAP!", 23/640, "gamemode = \"PT\""], ["OPTIONS", 51/640, "subMenu(true)"],
    ["HELP", 171/1280, "subMenu(false)"]]) {
    currentRow++;
    menuButtons.push(new Button(currentButton[0], currentRow,
      currentButton[1], currentButton[2], "width/3", "width/2"));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  mainMenuButtons();

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

/**
 * Moves the active tetromino, after a delay, and only if it doesn't collide with a wall.
 * @param {number} distanceToMove - How far the player is trying to move left or right.
 * @param {number} keyToCheck1 - The primary key checked to move.
 * @param {number} keyToCheck2 - The secondary key checked to move.
 * @param {string} leftOrRight - The direction moved, must be "left" or "right".
 * @param {number} maxDistance - The biggest value the active mino can go.
 */
function moveLeftOrRight(distanceToMove, keyToCheck1, keyToCheck2, leftOrRight, maxDistance) {
  let obstructionOnSide;

  // Loops through every mino.
  for (let minoToCheck of tetrisBoards.get("tetrisGame0").minos) {

    // Checks if there is a mino to the side moved of the active tetromino, and if there is, ends the loop.
    obstructionOnSide = minoToCheck.collidesWithActive({columnShift: distanceToMove});
    if (obstructionOnSide) {
      break;
    }
  }

  // Is there not something to the left/right, has delay been finished or just started, and is the correct frame.
  if (!obstructionOnSide && ((eval(`${leftOrRight}TimeHeld`) === 0 ||
    eval(`${leftOrRight}TimeHeld`) >= holdDelay) && !eval(`${leftOrRight}didDAS`) ||
    eval(`${leftOrRight}TimeHeld`) >= aSUpdateDelay * 50/3 + holdDelay && eval(`${leftOrRight}didDAS`))) {

    shiftActiveTetromino({columnChange1: distanceToMove});

    // If this isn't the movement pre-DAS, add the milliseconds that it should have taken in-between updates.
    if (eval(`${leftOrRight}TimeHeld`) !== 0) {
      if (eval(`${leftOrRight}didDAS`)) {
        eval(`${leftOrRight}TimeStartedHeld += aSUpdateDelay * 50/3;`);

        // If the conditions to move left haven't been satisfied, then try moving left again.
        if (timer - eval(`${leftOrRight}TimeStartedHeld`) >= aSUpdateDelay * 50/3 + holdDelay) {
          checkIfMoveLeftOrRight(distanceToMove, keyToCheck1, keyToCheck2, leftOrRight, maxDistance);
        }
      }

      eval(`${leftOrRight}didDAS = true;`);
    }
  }

  eval(`${leftOrRight}TimeHeld = timer - ${leftOrRight}TimeStartedHeld;`);
}

/**
 * Checks if the player is holding a key and won't hit the wall, then moves the active tetromino.
 * @param {number} distanceToMove - How far the player is trying to move left or right.
 * @param {number} keyToCheck1 - The primary key checked to move.
 * @param {number} keyToCheck2 - The secondary key checked to move.
 * @param {string} leftOrRight - The direction moved, must be "left" or "right".
 * @param {string} maxDistance - The range the active mino can go.
 */
function checkIfMoveLeftOrRight(distanceToMove, keyToCheck1, keyToCheck2, leftOrRight, maxDistance) {
  /**
   * Checks if a specific mino would hit the wall if it moved.
   * @param {number} minoNumber - The number of the mino to be checked on the active tetromino.
   * @returns {boolean} - Whether or not it is safe to move.
   */
  const willNotHitWall = (minoNumber) => 
    eval(`activeTetromino.column${minoNumber} + ${distanceToMove} ${maxDistance}`);
  
  // If the user is holding left and wouldn't hit the left wall, attempt to move left.
  if ((keyIsDown(keyToCheck1) || keyIsDown(keyToCheck2)) && willNotHitWall(1) && willNotHitWall(2)
    && willNotHitWall(3) && willNotHitWall(4) && hardDrop === false) {
    moveLeftOrRight(distanceToMove, keyToCheck1, keyToCheck2, leftOrRight, maxDistance);
  }

  else {
    eval(`${leftOrRight}TimeHeld = 0;`);
    eval(`${leftOrRight}TimeStartedHeld = timer;`);
    eval(`${leftOrRight}didDAS = false;`);
  }
  
  activeTetromino.rotatedLast = false;
}

/**
 * Checks if the player is trying to soft or hard drop and sets variables accordingly.
 */
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

/**
 * Rotates the active tetromino.
 * @param {boolean} clockwise - Whether or not the rotation is clockwise.
 */
function initialRotation(clockwise) {
  // Starting rotation to rotation right, or rotation left to 2 rotation position.
  if (activeTetromino.rotation === 0 && clockwise || activeTetromino.rotation === 3 && !clockwise) {
    shiftActiveTetromino({fullShift: false, rowChange1: activeTetromino.blockChange1[1],
      columnChange1: activeTetromino.blockChange1[0], rowChange2: activeTetromino.blockChange2[1],
      columnChange2: activeTetromino.blockChange2[0], rowChange3: activeTetromino.blockChange3[1],
      columnChange3: activeTetromino.blockChange3[0], rowChange4: activeTetromino.blockChange4[1], 
      columnChange4: activeTetromino.blockChange4[0]});
  }

  // Rotation right to 2 rotations, or starting roation to left rotation.
  else if (activeTetromino.rotation === 1 && clockwise || activeTetromino.rotation === 0 && !clockwise) {
    shiftActiveTetromino({fullShift: false, rowChange1: activeTetromino.blockChange1[0],
      columnChange1: -activeTetromino.blockChange1[1], rowChange2: activeTetromino.blockChange2[0],
      columnChange2: -activeTetromino.blockChange2[1], rowChange3: activeTetromino.blockChange3[0],
      columnChange3: -activeTetromino.blockChange3[1], rowChange4: activeTetromino.blockChange4[0],
      columnChange4: -activeTetromino.blockChange4[1]});
  }

  // 2 rotations to rotation left, or rotation right to starting rotation.
  else if (activeTetromino.rotation === 2 && clockwise || activeTetromino.rotation === 1 && !clockwise) {
    shiftActiveTetromino({fullShift: false, rowChange1: -activeTetromino.blockChange1[1],
      columnChange1: -activeTetromino.blockChange1[0], rowChange2: -activeTetromino.blockChange2[1],
      columnChange2: -activeTetromino.blockChange2[0], rowChange3: -activeTetromino.blockChange3[1],
      columnChange3: -activeTetromino.blockChange3[0], rowChange4: -activeTetromino.blockChange4[1],
      columnChange4: -activeTetromino.blockChange4[0]});
  }

  // Rotation left to starting rotation, or 2 rotation to rotation right.
  else {
    shiftActiveTetromino({fullShift: false, rowChange1: -activeTetromino.blockChange1[0],
      columnChange1: activeTetromino.blockChange1[1], rowChange2: -activeTetromino.blockChange2[0],
      columnChange2: activeTetromino.blockChange2[1], rowChange3: -activeTetromino.blockChange3[0],
      columnChange3: activeTetromino.blockChange3[1], rowChange4: -activeTetromino.blockChange4[0],
      columnChange4: activeTetromino.blockChange4[1]});
  }
}

function performKickTests(clockwise) {
  for (let kickTests = 0; invalidRotation === true && kickTests < 5; kickTests++) {
    invalidRotation = false;

    for (let activeMino of [1, 2, 3, 4]) {
      for (let checkMino of tetrisBoards.get("tetrisGame0").minos) {
        if (eval(`activeTetromino.column${activeMino}`) === checkMino.column &&
        eval(`activeTetromino.row${activeMino}`) === checkMino.row) {
          invalidRotation = true;
          break;
        }
      }

      if (eval(`activeTetromino.column${activeMino}`) < 0 ||
      eval(`activeTetromino.column${activeMino}`) >= columnLines ||
      eval(`activeTetromino.row${activeMino}`) >= rowLines) {
        invalidRotation = true;
      }

      if (invalidRotation) {
        break;
      }
    }

    if (invalidRotation) {
      if (activeTetromino.pieceName === I && ((activeTetromino.rotation !== 1 &&
        activeTetromino.rotation !== 3 || !clockwise) && (activeTetromino.rotation !== 0 &&
        activeTetromino.rotation !== 2 || clockwise) || kickTests !== 0) && (kickTests !== 4 ||
        (activeTetromino.rotation === 0 || activeTetromino.rotation === 2) && !clockwise ||
        (activeTetromino.rotation === 1 || activeTetromino.rotation === 3) && clockwise)
      ) {
        if (activeTetromino.rotation === 0 && (clockwise || kickTests !== 0 && kickTests !== 2) &&
        kickTests !== 2 || activeTetromino.rotation === 3 && (!clockwise || kickTests === 2) ||
        activeTetromino.rotation === 1 && (clockwise && kickTests !== 2 || kickTests === 2 && ! clockwise) ||
        activeTetromino.rotation === 2 && kickTests === 2) {
          if (kickTests === 0 || kickTests === 4) {
            shiftActiveTetromino({columnChange1: -2});
          }

          else {
            shiftActiveTetromino({columnChange1: 3});
          }
        }

        else if (kickTests === 0) { 
          shiftActiveTetromino({columnChange1: 2});
        }

        else if (kickTests === 1 || kickTests === 2) {
          shiftActiveTetromino({columnChange1: -3}); 
        }
      }

      else if (kickTests !== 1) {
        if (((activeTetromino.rotation === 0 || activeTetromino.rotation === 3 &&
              activeTetromino.pieceName !== I || activeTetromino.rotation === 1 &&
              activeTetromino.pieceName === I) && clockwise || (activeTetromino.rotation === 2 &&
              activeTetromino.pieceName !== I || activeTetromino.rotation === 3 ||
              activeTetromino.rotation === 0 && activeTetromino.pieceName === I) &&
            !clockwise) && kickTests === 0 || kickTests === 2 && (activeTetromino.rotation === 1 ||
            activeTetromino.rotation === 3 || activeTetromino.rotation === 2 && clockwise) || kickTests === 3 &&
          (activeTetromino.rotation === 3 || activeTetromino.rotation === 0 && clockwise ||
            activeTetromino.rotation === 2 && !clockwise) || kickTests === 3 && (activeTetromino.rotation !== 3 &&
          (activeTetromino.rotation !== 0 || !clockwise) && (activeTetromino.rotation !== 2 || clockwise) ||
          activeTetromino.pieceName === I && activeTetromino.rotation !== 1)) {
          shiftActiveTetromino({columnChange1: -1});
        }

        else {
          shiftActiveTetromino({columnChange1: 1});
        }
      }

      if (kickTests === 1 && activeTetromino.pieceName !== I || kickTests === 2 &&
      activeTetromino.pieceName === I && ((activeTetromino.rotation === 0 || activeTetromino.rotation === 2) &&
      clockwise || (activeTetromino.rotation === 1 || activeTetromino.rotation === 3) && ! clockwise) ||
      kickTests === 4 && activeTetromino.pieceName === I && ((activeTetromino.rotation === 0
        || activeTetromino.rotation === 2) && ! clockwise || (activeTetromino.rotation === 1
          || activeTetromino.rotation === 3) && clockwise)) {
        if (activeTetromino.rotation === 0 && (activeTetromino.pieceName !== I || kickTests === 4) ||
          activeTetromino.rotation === 2 && kickTests !== 4 || activeTetromino.rotation === 1 &&
          activeTetromino.pieceName === I) {
          shiftActiveTetromino({rowChange1: -1});
        }

        else {
          shiftActiveTetromino({rowChange1: 1});
        }
      }

      else if (kickTests === 2 && activeTetromino.pieceName === I || kickTests === 4) {
        if (activeTetromino.rotation === 0 && (kickTests !== 4 || activeTetromino.pieceName !== I) ||
          activeTetromino.rotation === 1 && activeTetromino.pieceName === I || activeTetromino.rotation === 2 &&
          kickTests === 4 && activeTetromino.pieceName !== I) {
          shiftActiveTetromino({rowChange1: -2});
        }

        else {
          shiftActiveTetromino({rowChange1: 2});
        }
      }

      else if (kickTests === 2 || kickTests === 3 && activeTetromino.pieceName === I) {
        if (activeTetromino.rotation === 0 && (activeTetromino.pieceName !== I || !clockwise) || 
          activeTetromino.rotation === 2 && (clockwise || kickTests !== 3) || activeTetromino.rotation === 1 &&
          activeTetromino.pieceName === I && kickTests === 3) {
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

/**
 * Rotates the active tetromino.
 * @param {boolean} clockwise - Whether or not to rotate it clockwise. 
 */
function rotateTetromino(clockwise) {
  activeTetromino.rotatedLast = true;
  invalidRotation = true;
  activeTetrominoOld = {...activeTetromino};

  // Updates the tetrominos position, if possible.
  initialRotation(clockwise);
  activeTetromino.kickTestsTaken = performKickTests(clockwise);

  // In the event that no rotation could have been made, set the active tetromino back to what it used to be.
  if (invalidRotation) {
    activeTetromino = activeTetrominoOld;
    return;
  }

  // If rotated clockwise, increment the rotation counter.
  if (clockwise) {
    activeTetromino.rotation++;


    if (activeTetromino.rotation > 3) {
      activeTetromino.rotation = 0;
    }
  }

  // Otherwise, decrement the rotation counter.
  else {
    activeTetromino.rotation--;

    if (activeTetromino.rotation < 0) {
      activeTetromino.rotation = 3;
    }
  }
}

/**
 * Detects if the player is trying to rotate the active tetromino.
 */
function rotateIt () {

  // For clockwise rotations.
  if (keyIsDown(UP_ARROW) || keyIsDown(KEY_X) || keyIsDown(KEY_W)){
    if (!rotatedRight && !rotatedLeft) {
      rotateTetromino(true);
      rotatedRight = true;
    }
  }

  // Only allow rotations on press, rather than holding the key down.
  else {
    rotatedRight = false;
  }
  
  // For counter-clockwise rotations.
  if (keyIsDown(CONTROL) || keyIsDown(KEY_Z)){
    if (!rotatedLeft && !rotatedRight) {
      rotateTetromino(false);
      rotatedLeft = true;
    }
  }

  // Only allow rotations on press, rather than holding the key down.
  else {
    rotatedLeft = false;
  }
}

/**
 * Swaps the current piece with whatever is held.
 */
function hold() {
  // Checks if the hold keys are pressed, you haven't held already this turn, and the tetromino is active.
  if ((keyIsDown(SHIFT) || keyIsDown(KEY_C)) && canHold && activeTetromino.isActive) {
    // If there is already a piece held, put it at the start of the bag.
    if (heldPiece) {
      bag.unshift(heldPiece);
    }
    
    // Replaces the held piece with the active piece and disables the active piece.
    heldPiece = activeTetromino.pieceName;
    activeTetromino.isActive = false;

    // Prevents holding multiple times without locking in a tetromino.
    canHold = false;
  }
}

/**
 * Calls all the functions responsible for checking if keys are pressed.
 */
function controlTetris() {
  checkIfMoveLeftOrRight(-1, LEFT_ARROW, KEY_A, "left", ">= 0");
  checkIfMoveLeftOrRight(1, RIGHT_ARROW, KEY_D, "right", "< columnLines");
  drop();
  rotateIt();
  hold();
}

/**
 * Moves the active tetromino down, updates the timer, and adds to the score if soft-dropping.
 */
function goDownAndScore() {
  shiftActiveTetromino({rowChange1: 1});
  lastUpdate = timer;
  activeTetromino.rotatedLast = false;

  if (softDrop) {
    score += softDropScore;
  }
}

/**
 * Counts all the minos in each row.
 * @returns {Map<number, number>} A map with keys being row numbers, and values being the minos in the row.
 */
function countMinosInRow() {
  let minosInRow = new Map();

  // Loops through every mino in the active board.
  for (let currentMino of tetrisBoards.get("tetrisGame0").minos) {

    // If a mino has already been found in that row, increment the amount attached to the key.
    if (minosInRow.has(currentMino.row)) {
      minosInRow.set(currentMino.row, minosInRow.get(currentMino.row) + 1);
    }

    // Otherwise, create a new key-value pair with the key being the row and a value of one.
    else {
      minosInRow.set(currentMino.row, 1);
    }
  }

  return minosInRow;
}

/**
 * Only adds the score for clearing lines.
 * @param {number} tSpinScore - The score to add if the line(s) was cleared with a t-spin.
 * @param {number} defaultScore - The score to add if the line(s) was cleared regularly.
 * @param {number} multiplier - How much to multiply the score to be added by.
 * @param {number} [miniScore] - The score to add if the line(s) were cleared with a mini-t-spin, optional.
 */
function addLineClearScore(tSpinScore, defaultScore, multiplier, miniScore = 0) {
  // Checks if a t-spin was performed.
  if (tSpin()) {
    // Adds the t-spin score multiplied by the level and the multiplier.
    score += tSpinScore * level * multiplier;

    // Marks it as a difficult clear and ends the function.
    difficultClear = true;
    return;
  }

  // Checks if a mini-t-spin was performed instead.
  else if (miniTSpin()) {
    // Adds the mini-t-spin score multiplied by the level and the multiplier.
    score += miniScore * level * multiplier;

    // Marks it as a difficult clear and ends the function.
    difficultClear = true;
    return;
  }
  
  
  // Otherwise, add the default score multiplied by the level, marking it as not a difficult clear.
  score += defaultScore * level;
  difficultClear = false;
}

/**
 * Adds the score for clearing lines, perfect clears, back-to-back tetrises/difficult clears, and combos.
 * @param {number} linesCleared - The amount of lines cleared. 
 */
function scoreClearLines(linesCleared) {
  let multiplier = 1;

  // If the last action was a "difficult" clear, adds a multiplier to the score of this one if also difficult.
  if (difficultClear) {
    multiplier = difficultClearMultiplier;
  }

  // Handles the score gained by tetrises.
  if (linesCleared === 4) {
    // Adds the score from the tetris multiplied by the level and multiplier.
    score += baseTetrisScore * level * multiplier;

    // Checks if this was a perfect clear.
    if (tetrisBoards.get("tetrisGame0").minos.length === 0) {
      // Adds base score with score if the last action was also a tetris multiplied by the level and multiplier.
      score += (basePCTetrisScore + baseBTBPCTetrisScore * justTetrised) * level * multiplier;
    }

    // Marks this action as "difficult" and that it was a tetris.
    difficultClear = true;
    justTetrised = true;
  }

  // Handles the score from clearing 1-3 lines.
  else {
    addLineClearScore(baseLineTSScore + 400*(linesCleared - 1), baseLineScore + 200*(linesCleared - 1), multiplier,
      baseLineMTSScore + 200*(linesCleared - 1));

    // Checks if this was a perfect clear.
    if (tetrisBoards.get("tetrisGame0").minos.length === 0) {
      // Adds the base score for the amount of lines multiplied by the level.
      score += (basePCScore + 400*(linesCleared - 1) + 100*(linesCleared - 1)*(linesCleared - 2)) * level;
    }

    // Mark this action as not resulting in a tetris.
    justTetrised = false;
  }

  // Increments the combo counter and adds the base bonus multiplied by the counter and the level.
  comboCounter++;
  score += baseComboBonus * comboCounter * level;
}

/**
 * Adds all the score gained after locking-in a tetromino.
 * @param {number} linesCleared - How many lines were cleared, if any. 
 */
function addTurnEndScore(linesCleared) {
  if (activeTetromino.pieceName === T) {
    // Loops through every mino and counts the minos used to determine t-spins, both mini and regular.
    for (let currentMino of tetrisBoards.get("tetrisGame0").minos) {
      currentMino.neighborT();
    }

    // Checks if the t is up against a wall, counting the wall as minos on it's rear.
    if (isRotation(3, 2) && (activeTetromino.rotation - 1) * (columnLines - 1)/2 === activeTetromino.column1) {
      activeTetromino.rearCornerNeighbors = 3;
    }
  }

  if (linesCleared) {
    scoreClearLines(linesCleared);
  }

  else {
    // If there was a t-spin, add base score multiplied by the level not altering if it was a difficult line clear.
    if (tSpin()) {
      score += baseTSpinScore * level;
    }
    
    // Otherwise, if it was a mini-t-spin, do the same but with it's base score.
    else if (miniTSpin()) {
      score += baseMiniTSpinScore * level;
    }

    // Otherwise, mark this as not a difficult line clear.
    else {
      difficultClear = false;
    }

    // Reset the combo counter and mark this as not a tetris.
    comboCounter = -1;
    justTetrised = false;
  }
}

/**
 * Clears lines if needed and updates score/level.
 */
function clearLines() {
  let linesCleared = 0;
  let minosInRow = countMinosInRow();
  
  // Loops until there are no full rows.
  while([...minosInRow.values()].some(value => value >= columnLines)) {
    // Loops through every row and the amount in them.
    for (let [rowToCheck, amountInRow] of minosInRow) {
      // If current row is full loop through every mino, removing them, dropping them, or doing nothing with them.
      if (amountInRow >= columnLines) {
        for (let currentMino = tetrisBoards.get("tetrisGame0").minos.length - 1; currentMino >= 0; currentMino--) {
          tetrisBoards.get("tetrisGame0").minos[currentMino].lineCleared(rowToCheck, currentMino);
        }

        // Increment the amount of lines cleared and stop looping through the rows.
        linesCleared++;
        break;
      }
    }
 
    // Updates to the new amount of minos in every row.
    minosInRow = countMinosInRow();
  }

  addTurnEndScore(linesCleared);
  totalLinesCleared += linesCleared;

  // Goes to the next level if the amount of lines cleared is bigger than 10 of the current level.
  if (totalLinesCleared >= 10 * level) {
    level++;
  }
}

/**
 * Moves the active tetromino down on a timer.
 */
function moveActiveDownSlowly() {
  // Loops through every mino.
  for (let minoToCheck of tetrisBoards.get("tetrisGame0").minos) {
    /**
     * Checks if this mino is below one of the active tetromino's minos.
     * @param {number} currentMino - Which mino to check on the active tetromino. 
     * @returns {boolean} - If it is or isn't underneath.
     */
    let isBelow = (currentMino) => minoToCheck.row === eval("activeTetromino.row" + currentMino) + 1 &&
    minoToCheck.column === eval("activeTetromino.column" + currentMino);

    // If this mino is directly underneath, mark it down and end the loop.
    if (isBelow(1) || isBelow(2) || isBelow(3) || isBelow(4)) {
      blockUnder = true;
      break;
    }
  }

  /**
   * Checks if a mino of the active tetromino is touching the bottom. 
   * @param {number} currentRow - The mino to check.
   * @returns {boolean} Whether or not it is at the bottom.
   */
  const notBottom = (currentRow) => eval(`activeTetromino.row${currentRow}`) + 1 < rowLines;

  // If there is space underneath, move the tetromino down.
  if (notBottom(1) && notBottom(2) && notBottom(3) && notBottom(4) && ! blockUnder) {
    goDownAndScore();
  }

  // Otherwise, waits for the lock delay.
  else if (timer - lastUpdate >= lockDelay) {
    // Loops through every active mino, pushing it onto the board.
    for (let minoNumber = 1; minoNumber <= 4; minoNumber++) {
      eval(`tetrisBoards.get("tetrisGame0").minos.push(new Mino(activeTetromino.row${minoNumber},
        activeTetromino.column${minoNumber}, activeTetromino.color))`);
    }

    // Disable the active tetromino, stops hard dropping if occuring, and enables holding.
    activeTetromino.isActive = false;
    hardDrop = false;
    canHold = true;

    clearLines();
  }

  blockUnder = false;
}

/**
 * Moves the tetromino down either with time or immediately with a hard drop.
 */
function updatePosition() {
  tetrisBoards.get("tetrisGame0").drawActivePiece();
  
  // Checks if enough time has passed, calculating using either the official formula or softDropSpeed.
  if ((timer - lastUpdate >= (0.8 - (level - 1) * 0.007)**(level - 1) * 1000 ||
  softDrop && timer - lastUpdate >= softDropSpeed) && hardDrop !== "movePiece") {
    moveActiveDownSlowly();
  }

  // Checks if hard-dropping.
  if (hardDrop === "movePiece") {

    let spacesToDrop = drawGhostPiece();
    shiftActiveTetromino({fullShift: true, rowChange1: spacesToDrop});

    // Updates the score and resets values.
    score += (spacesToDrop - 1) * 2;
    hardDrop = true;
    lastUpdate = 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  let newButtons = [];

  for (let currentButton of menuButtons) {
    newButtons.push(new Button(currentButton.text, currentButton.rowNumber, currentButton.textWidthScale,
      currentButton.onClick, currentButton.x1, currentButton.textX, currentButton.displayHelpText));
  }
  menuButtons = newButtons;

  // Resets the first board's coordinates.
  tetrisBoards.set("tetrisGame0", new TetrisBoard(width/3, 0, width/3 * 2, height,
    tetrisBoards.get("tetrisGame0").minos));

  let currentGame = 1;

  // Loops through every row of games.
  for(let currentGameRow = 0; currentGameRow < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games;
    currentGameRow++) {
    // Loops through every column of games.
    for(let currentGameColumn = 0; currentGameColumn < Math.ceil(Math.sqrt(games - 1)) && currentGame !== games;
      currentGameColumn++) {
      // Resets the current game's coordinates.
      tetrisBoards.set(`tetrisGame${currentGame}`, new TetrisBoard(
        currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1))),
        currentGameRow * height/Math.ceil(Math.sqrt(games - 1)),
        currentGameColumn * width/(3 * Math.ceil(Math.sqrt(games - 1))) +
        width/(3 * Math.ceil(Math.sqrt(games - 1))),
        currentGameRow * height/Math.ceil(Math.sqrt(games - 1)) + height/Math.ceil(Math.sqrt(games - 1)),
        tetrisBoards.get(`tetrisGame${currentGame}`).minos));

      // Goes to the next game.
      currentGame++;
    }
  }

  // Sets up the coordinates for the next piece board.
  tetrisBoards.set("nextPiece", new TetrisBoard(width/3 * 2, height/rowLines,
    width/3 * 2 + width/3 * uIScale,
    height/rowLines * (rowLines + 1) * uIScale, tetrisBoards.get("nextPiece").minos));
}

/**
 * Shifts all tetris games' values down one, taking tetrisGame0 and putting it on the last game.
 */
function swap() {
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

/**
 * Updates the active tetromino to what is next in the bag.
 */
function grabNextFromBag() {
  if (whatIsInTheBag(0) === "swap") {
    swap();
  }

  else {
    activeTetromino = whatIsInTheBag(0);
  }

  bag.shift();
}

/**
 * Moves the tetromino down, grabs the next tetromino, and refills the bag.
 */
function moveActiveTetromino() {

  // Checks if the current tetromino still exists.
  if (activeTetromino.isActive) {
    updatePosition();
    entryDelayStart = timer;
  }

  // Otherwise, after a delay, grab the next tetromino from the bag.
  else {
    if (timer - entryDelayStart >= entryDelay) {
      grabNextFromBag();
      entryDelayStart = timer;
    }
  }

  // Refill the bag if it gets too small.
  if (bag.length < nextPieces) {
    fillBag();
  }
}

function draw() {
  background("black");

  // Draw everything related to gameplay when not on the main menu.
  if (gamemode !== "MM") {
  // Draws each game.
    for(let gameNumber = 0; gameNumber < games; gameNumber++) {
      tetrisBoards.get(`tetrisGame${gameNumber}`).display({gameNumber: gameNumber});
    }

    tetrisBoards.get("nextPiece").display({drawGrid: false});

    // If the game is being played, run the associated functions.
    if (gamemode === "PT") {
      timer = millis() - timePaused;
      controlTetris();
      moveActiveTetromino();
    }

    // Otherwise, just update the amount of time paused to not break timings of things when unpaused.
    else {
      timePaused = millis() - timer;
    }

    tetrisBoards.get("nextPiece").updateMinoUIElements();
  }

  else {
    for (let currentButton of menuButtons) {
      currentButton.display();
    }
  }
}

function keyPressed() {
  // Upon pressing p, either pause or unpause the game.
  if (key === "p" && gamemode !== "MM") {
    if (gamemode === "PT") {
      gamemode = "TM";
    }

    else {
      gamemode = "PT";
    }
  }
}

function mousePressed() {
  // Checks if the mouse is in the middle third of the board.
  if (mouseX > width/3 && mouseX < width*2/3) {
    // If the game is paused, toggle the cell the mouse is hovering over.
    if (gamemode === "TM") {
      tetrisBoards.get("tetrisGame0").toggleCell();
    }

    else if (gamemode === "MM") {
      for (let currentButton of menuButtons) {
        currentButton.buttonClicked();
      }
    }
  }
}