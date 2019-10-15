'use strict'


function getRandomIntIn(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function renderCell({ i, j }) {
    var elCell = document.querySelector(`.cell-${i}-${j}`);
    var cell = gBoard[i][j];
    elCell.innerHTML = cell.innerText;
}


function getSelector(pos) {
    return '.cell-' + pos.i + '-' + pos.j;
}

function timer() {
    if (gTimerBegin === 1) {
        setTimeout(function () {
            gTime++;
            var min = Math.floor(gTime / 100 / 60);
            var sec = Math.floor(gTime / 100);
            var mSec = gTime % 100;

            if (min < 10) {
                min = "0" + min;
            }
            if (sec >= 60) {
                sec = sec % 60;
            }
            if (sec < 10) {
                sec = "0" + sec;
            }
            if (mSec < 10) {
                mSec = "0" + mSec;
            }
            document.querySelector(".timer").innerHTML = min + ":" + sec + ":" + mSec;
            timer();
        }, 10)
    }
}
