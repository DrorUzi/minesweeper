'use strict'
// CR: inline

// mine sweeper
var SMILEYWIN = '😎'
var SMILEYLOSE = '🤯'
var EMPTY = '';
var MINE = '💥';
var FLAG = '🚩';
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    hints: 1,
    gLevel: 0
}
var gTimerBegin;
var gBoard;
var gTime;
var gIsFirstClick;
var gElRestartBtn = document.querySelector('.restart');
var gLives=1;

var gLevel = [{
    SIZE: 4,
    MINES: 2
},
{
    SIZE: 8,
    MINES: 12
},
{
    SIZE: 12,
    MINES: 30
}]

var gSelectedLevel = gLevel[0];

function init() {
    gElRestartBtn.innerText = SMILEYWIN;
    gIsFirstClick = true;
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.hints = 1;
    gSelectedLevel = gLevel[gGame.gLevel];
    if (gGame.gLevel == 0) {
        gLives = 1;
    } else {
        gLives = 3;
    }
    gTimerBegin = 0;
    gTime = 0;

    gGame.isOn = true;
    var elWin = document.querySelector('.win');
    elWin.style.display = 'none';

    gBoard = buildBoard();
    renderBoard(gBoard);
};



function buildBoard() {
    var board = [];
    for (var i = 0; i < gSelectedLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gSelectedLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            };
        }
    }
    console.log(board)
    return board;
}



function cellClick(event, ellcel, i, j) { //// CR: ellcel is declared but not used, and name is unclear too
    if (!gGame.isOn) return;
    if (gIsFirstClick) {
        gBoard = putMines(gBoard);
        while (gBoard[i][j].isMine) {
            gBoard = putMines(gBoard);
        }
        setMinesNegsCount(gBoard)
        gTimerBegin = 1;
        timer()
        gIsFirstClick = false;
    }
    var cell = gBoard[i][j]
    if (event.type === 'click') {
        if (cell.isMarked || cell.isShown) return;
        // cell.isShown = true;
        if (cell.isMine) {
            gLives--;
            if (gLives === 0) {
                revealMines();
                gameOver('LOSE');
            } else renderCell({ i, j });
            return;
        } else {
            showNegs(i, j);
            checkVictory();
        }
    } else if (event.type === 'contextmenu') {
        event.preventDefault()
        if (cell.isShown) return;
        if (cell.isMarked) {
            cell.innerText = EMPTY;
        } else {
            cell.innerText = FLAG
        }
        cell.isMarked = !cell.isMarked;
        renderCell({ i, j });
    }
}


function putMines(board) {
    var minesCount = 0;
    //// CR: This loop is unneccesary here if you would have first initialize the board
    //// You wanted a clean board with no mines for the first click, 
    //// but you could have just send a param(i,j) of the clicked cell to this func and make sure the random idx doesnt hit it
    for (var i = 0; i < board.length; i++) { 
        for (var j = 0; j < board.length; j++) { 
            board[i][j].isMine = false;
        }
    }
    while (minesCount < gSelectedLevel.MINES) {
        var randIdxI = getRandomIntIn(0, gSelectedLevel.SIZE - 1);
        var randIdxJ = getRandomIntIn(0, gSelectedLevel.SIZE - 1);
        var currCell = board[randIdxI][randIdxJ];
        if (!currCell.isMine) {
            currCell.innerText = MINE;
            currCell.isMine = true;
            minesCount++;
        }
    }
    return board;
}



function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var negsAreMines = countNegs(board, i, j);
            board[i][j].minesAroundCount = negsAreMines;
        }
    }
}


function countNegs(board, posI, posJ) {
    var negsMinesCount = 0;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === posI && j === posJ) continue;
            var currCell = board[i][j];
            if (currCell.isMine === true) negsMinesCount++;
        }
    }
    return negsMinesCount;
}

function showNegs(posI, posJ) {
    if (gBoard[posI][posJ].minesAroundCount === 0 ) {
      for (var i = posI - 1; i <= posI + 1; i++) {
          if (i < 0 || i > gBoard.length - 1) continue;
          for (var j = posJ - 1; j <= posJ + 1; j++) {
              if (j < 0 || j > gBoard[0].length - 1) continue;
              var currCell = gBoard[i][j];
              if (currCell.isShown) continue;
              if (currCell.isMarked || currCell.isMine) continue;
              var elCurrCell = document.querySelector(`.cell-${i}-${j}`);
              elCurrCell.style.background = 'rgba(240, 199, 218, 0.87)'
              currCell.isShown = true;
              if (currCell.minesAroundCount !== 0) {
                  elCurrCell.innerText = currCell.minesAroundCount;
              } else {
                elCurrCell.innerText = '';
                showNegs(i,j);
              }
          }
      }
    } else {
      var currCell = gBoard[posI][posJ];
      var elCurrCell = document.querySelector(`.cell-${posI}-${posJ}`);
      elCurrCell.style.background = 'rgba(240, 199, 218, 0.87)'
      elCurrCell.innerText = currCell.minesAroundCount;
      currCell.isShown = true;
    }
}


function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                renderCell({ i, j });
            }
        }
    }
}




function renderBoard(board) {
    var strHTML = '<table border="0" class="board"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board.length; j++) {
            var className = `cell-${i}-${j}`;
            var negsMinesCount = board[i][j].minesAroundCount;
            strHTML += `<td class="${className}" `;
            if (!board[i][j].isMine) strHTML += `.data-num="${negsMinesCount}" `;
            strHTML += `onclick="cellClick(event, this,${i},${j})" oncontextmenu ="cellClick(event, this,${i},${j})"> </td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elBoardContainer = document.querySelector('.board-container');
    elBoardContainer.innerHTML = strHTML;
}



function setLevel(elBtn) {
    if (elBtn.innerText === 'Easy') {
        gGame.gLevel = 0;
    } else if (elBtn.innerText === 'Medium') {
        gGame.gLevel = 1;
    } else if (elBtn.innerText === 'Hard') {
        gGame.gLevel = 2;
    }
    init();
}

function setSafeClick() {
    var cellsNotMines = [];
    var safeClick = document.querySelector('.safe-btn');
    if (gGame.hints >= 0) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                var cell = gBoard[i][j];
                if (!cell.isMine && !cell.isShown) {
                    cellsNotMines.push({ i, j });
                }
            }
        }
        var rndPos = cellsNotMines[getRandomIntIn(0, gBoard.length - 1)];
        var elCurrCell = document.querySelector(`.cell-${rndPos.i}-${rndPos.j}`);
        safeClick.innerText = `You have ${gGame.hints + 1} hints left`;
        elCurrCell.style.border = '5px lightcoral solid';
        setTimeout(() => {
            elCurrCell.style.border = 'none';
        }, 3000)
        gGame.hints--;
    }
    else {
        safeClick.style.display = 'none';
    }
}




function gameOver(res) {
    gTimerBegin = 0;
    timer()
    gGame.isOn = false;
    if (res === 'WON') {
        gElRestartBtn.innerText = SMILEYWIN;
        var elWin = document.querySelector('.win');
        elWin.style.display = 'block';
    }
    else gElRestartBtn.innerText = SMILEYLOSE;
}


function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isMine && !cell.isShown) {
                return;
            }
        }
    }
    return gameOver('WON');
}
