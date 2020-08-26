var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

var currentLevel;
var s = Snap('#svg').attr({ viewBox: '0 0 600 600' });

var chessboardCells = [];
var gChessboardCells = s.g();

var horDominos = [];
var gHorDominos = s.g();
var verDominos = [];
var gVerDominos = s.g();

var highlighterCells = [];
var gHighlighterCells = s.g();
var overlayCells = [];
var gOverlayCells = s.g();

var styleDomino = {
    fill: 'dimgray',
    stroke: '#000',
    strokeWidth: 3
};

var styleWhiteChessboardCell = {
    fill: '#fff',
    stroke: 'none'
};

var styleBlackChessboardCell = {
    fill: '#000',
    stroke: 'none'
};

var styleDisabledChessboardCell = {
    fill: '#f00',
    stroke: 'none'
};

var styleInvisible = {
    opacity: 0
};

var styleVisible = {
    opacity: 1
};

var p = s.path("M 10,-5 L -10,15 M 15,0 L 0,15 M 0,-5 L -20,15").attr({
    fill: "none",
    stroke: "blue",
    strokeWidth: 3
}).pattern(0, 0, 10, 10);

var p2 = s.path("M 10,15 L -10,-5 M 15,10 L 0,-5 M 0,15 L -20,-5").attr({
    fill: "none",
    stroke: "green",
    strokeWidth: 3
}).pattern(0, 0, 10, 10);


var covered = [];
var nCovered = 0;
var chosenCell = null;

for (var i = 0; i < 8; ++i) {
    covered.push([]);
    for (var j = 0; j < 8; ++j) {
        covered[i].push(false)
    }
}

for (var i = 0; i < 8; ++i) {
    chessboardCells.push([]);
    overlayCells.push([]);
    highlighterCells.push([]);

    horDominos.push([]);
    if (i < 8 - 1)
        verDominos.push([]);

    for (var j = 0; j < 8; ++j) {
        var currentChessboardCellStyle =
            (i + j) % 2 == 0
                ? styleWhiteChessboardCell
                : styleBlackChessboardCell;

        chessboardCells[i].push(
            s
                .rect(600 * j / 8, 600 * i / 8, 600 / 8, 600 / 8)
                .attr(currentChessboardCellStyle)
                .appendTo(gChessboardCells)
        );
        highlighterCells[i].push(
            chessboardCells[i][j].clone()
                .attr({fill: p, opacity: 0})
                .appendTo(gHighlighterCells)
        );
        overlayCells[i].push(
            chessboardCells[i][j].clone()
                .attr({opacity: 0})
                .appendTo(gOverlayCells)
        );
    }
}

for (i = 0; i < 8; ++i)
    for (j = 0; j < 8; ++j) {
        if (i < 8 - 1)
            verDominos[i].push(
                s
                    .rect(600 * j / 8 + 1, 600 * i / 8 + 1, 600 / 8 - 1, 600 / 4 - 1)
                    .attr(styleDomino)
                    .attr(styleInvisible)
                    .appendTo(gVerDominos)
            );
        if (j < 8 - 1)
            horDominos[i].push(
                s
                    .rect(600 * j / 8 + 1, 600 * i / 8 + 1, 600 / 4 - 1, 600 / 8 - 1)
                    .attr(styleDomino)
                    .attr(styleInvisible)
                    .appendTo(gHorDominos)
            );
    }

setTimeout(function () {
    gChessboardCells.animate({opacity: 0.2}, 500)
}, 1000);
gOverlayCells.appendTo(s);

function visualReset() {
    for (i = 0; i < 8; i += 1) {
        for (j = 0; j < 8; j += 1) {
            highlighterCells[i][j].attr(styleInvisible);

            if (i < 7)
                verDominos[i][j].attr(styleInvisible);
            if (j < 7)
                horDominos[i][j].attr(styleInvisible);

            chessboardCells[i][j].attr(
                covered[i][j] === true
                    ? styleDisabledChessboardCell
                    :
                        (i + j) % 2 == 0
                            ? styleWhiteChessboardCell
                            : styleBlackChessboardCell);
        }
    }
}


$('#btnVer').click(function (evt) {
    visualReset();
    for (i = 0; i < 7; i += 2) {
        for (j = 0; j < 8; j += 1) {
            setTimeout(function (c) {
                return function () {
                    c.animate({opacity: 1}, 100);
                }
            }(verDominos[i][j]), 50 + 40 * (4 * i + j));
        }
    }
});

$('#btnHor').click(function (evt) {
    visualReset();
    for (i = 0; i < 8; i += 1) {
        for (j = 0; j < 7; j += 2) {
            setTimeout(function (c) {
                return function () {
                    c.animate({opacity: 1}, 100);
                }
            }(horDominos[i][j]), 50 + 40 * (4 * i + j));
        }
    }
});

$('#btnSpiral').click(function (evt) {
    visualReset();
    var spiral = [
        [0, 0, 'h'], [0, 2, 'h'], [0, 4, 'h'], [0, 6, 'h'], [1, 7, 'v'], [3, 7, 'v'], [5, 7, 'v'], [7, 6, 'h'], [7, 4, 'h'], [7, 2, 'h'], [7, 0, 'h'],
        [5, 0, 'v'], [3, 0, 'v'], [1, 0, 'v'], [1, 1, 'h'], [1, 3, 'h'], [1, 5, 'h'], [2, 6, 'v'], [4, 6, 'v'], [6, 5, 'h'], [6, 3, 'h'], [6, 1, 'h'],
        [4, 1, 'v'], [2, 1, 'v'], [2, 2, 'h'], [2, 4, 'h'], [3, 5, 'v'], [5, 4, 'h'], [5, 2, 'h'], [3, 2, 'v'], [3, 3, 'h'], [4, 3, 'h']];
    for (var k = 0; k < 32; ++k) {
        if (spiral[k][2] == 'h')
            setTimeout(function (c) {
                return function () {
                    c.animate({opacity: 1}, 100);
                }
            }(horDominos[spiral[k][0]][spiral[k][1]]), k * 40);
        else
            setTimeout(function (c) {
                return function () {
                    c.animate({opacity: 1}, 100);
                }
            }(verDominos[spiral[k][0]][spiral[k][1]]), k * 40);
    }
});

function setLevel(level) {
    currentLevel = level;
    chosenCell = null;
    for (var i = 0; i < 8; ++i)
        for (var j = 0; j < 8; ++j)
            covered[i][j] = false;

    switch (level) {
        case 0:
            nCovered = 0;
            break;
        case 1:
            covered[0][0] = true;
            nCovered = 1;
            break;
        case 2:
            covered[0][0] = covered[0][7] = true;
            nCovered = 2;
            break;
        case 3:
            covered[0][0] = covered[7][7] = true;
            nCovered = 2;
            break;
        case 4:
            //var row = Math.floor(Math.random() * 8);
            //var column = Math.floor(Math.random() * 8);
            var row = 3;
            var column = 4;
            covered[row][column] = covered[(row + 3) % 8][(column + 4) % 8] = true;
            nCovered = 2;
            break;
        case 5:
            //var row = Math.floor(Math.random() * 8);
            //var column = Math.floor(Math.random() * 8);
            var row = 2;
            var column = 3;
            covered[row][column] = covered[(row + 4) % 8][(column + 2) % 8] = true;
            nCovered = 2;
            break;
    }
    visualReset();
}

function clearHighlighterCells(clearAll) {
    for (var i = 0; i < 8; ++i)
        for (var j = 0; j < 8; ++j)
            if(clearAll || !chosenCell || chosenCell.i != i || chosenCell.j != j)
                if(covered[i][j] !== true)
                    highlighterCells[i][j].attr(styleInvisible);
}

function highlightPossibilities(i, j) {
    clearHighlighterCells();

    if(covered[i][j])
        return;

    var styleHighlight = {opacity: 0.3};
    if (chosenCell) {
        if (chosenCell.i == i - 1 && chosenCell.j == j)
            highlighterCells[i][j].attr(styleHighlight);
        if (chosenCell.i == i && chosenCell.j == j - 1)
            highlighterCells[i][j].attr(styleHighlight);
        if (chosenCell.i == i + 1 && chosenCell.j == j)
            highlighterCells[i][j].attr(styleHighlight);
        if (chosenCell.i == i && chosenCell.j == j + 1)
            highlighterCells[i][j].attr(styleHighlight);
    }
    else {
        highlighterCells[i][j].attr(styleHighlight);
        if (i > 0 && !covered[i - 1][j])
            highlighterCells[i - 1][j].attr(styleHighlight);
        if (j > 0 && !covered[i][j - 1])
            highlighterCells[i][j - 1].attr(styleHighlight);
        if (i < 7 && !covered[i + 1][j])
            highlighterCells[i+1][j].attr(styleHighlight);
        if (j < 7 && !covered[i][j + 1])
            highlighterCells[i][j+1].attr(styleHighlight);
    }
}

for (var i = 0; i < 8; ++i) {
    for (var j = 0; j < 8; ++j) {
        overlayCells[i][j].hover(function (i, j) { return function(){ highlightPossibilities(i, j) } }(i,j))
    }
}

function cellClickHandler(i,j) {
    if(chosenCell && chosenCell.i == i && chosenCell.j == j) {
        chosenCell = null;
        clearHighlighterCells(true);
        return;
    }

    if (covered[i][j]) {
        chosenCell = null;
        var domino = covered[i][j];
        if(domino === true) {
            clearHighlighterCells(true);
            return;
        }

        domino.attr(styleInvisible);
        nCovered -= 2;
        for(var di = i-1; di <= i+1; ++di)
            for(var dj = j-1; dj <= j+1; ++dj)
                if (di >= 0 && di <= 7 && dj>=0 && dj <= 7 && covered[di][dj] == domino)
                    covered[di][dj] = false;
        clearHighlighterCells(true);
        return;
    }
    if (!chosenCell) {
        chosenCell = {'i': i, 'j': j};
        highlighterCells[i][j].attr({opacity: 0.5});
        highlightPossibilities(i, j);
        return;
    }

    if (chosenCell.i == i - 1 && chosenCell.j == j) {
        verDominos[i - 1][j].attr(styleVisible);
        covered[chosenCell.i][chosenCell.j] = covered[i][j] = verDominos[i - 1][j];
        nCovered += 2;
        chosenCell = null;
        clearHighlighterCells(true);
    }
    else if (chosenCell.i == i + 1 && chosenCell.j == j) {
        verDominos[i][j].attr(styleVisible);
        covered[chosenCell.i][chosenCell.j] = covered[i][j] = verDominos[i][j];
        nCovered += 2;
        chosenCell = null;
        clearHighlighterCells(true);
    }
    else if (chosenCell.i == i && chosenCell.j == j - 1) {
        horDominos[i][j - 1].attr(styleVisible);
        covered[chosenCell.i][chosenCell.j] = covered[i][j] = horDominos[i][j - 1];
        nCovered += 2;
        chosenCell = null;
        clearHighlighterCells(true);
    }
    else if (chosenCell.i == i && chosenCell.j == j + 1) {
        horDominos[i][j].attr(styleVisible);
        covered[chosenCell.i][chosenCell.j] = covered[i][j] = horDominos[i][j];
        nCovered += 2;
        chosenCell = null;
        clearHighlighterCells(true);
    }
    else {
        chosenCell = {'i': i, 'j': j};
        highlighterCells[i][j].attr({opacity: 0.5});
        clearHighlighterCells();
    }

    if (nCovered == 64) {
        $('#congratulations_modal').modal('show');
    }
}

for (var i = 0; i < 8; ++i) {
    for (var j = 0; j < 8; ++j) {
        overlayCells[i][j].click(function (i, j) { return function(){ cellClickHandler(i, j) } }(i,j))
    }
}

for(var i = 0; i < 6; ++i){
    $('#tab' + i).on('show.bs.tab', function (i) {
        return function () { setLevel(i); }
    }(i));
}

$('button.reset').click(function (evt) {
    setLevel(currentLevel);
});

setLevel(0);
