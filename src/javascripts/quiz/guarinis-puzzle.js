var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

$(function () {
    var whiteKnightUrl = 'knight.svg';
    var blackKnightUrl = 'knight-black.svg';
    var EMPTY_CELL = 0;
    var WHITE_KNIGHT = 1;
    var BLACK_KNIGHT = 2;

    function clone(field) {
        return field.map(function (row) {
            return row.map(function (x) {
                return x;
            })
        })
    }

    function isBlackCell(i, j) {
        return !(i % 2) && j % 2 || i % 2 && !(j % 2);
    }

    function isInversion(fieldA, fieldB) {
        for (var i = 0; i < fieldA.length; i++) {
            var row = fieldA[i];
            for (var j = 0; j < row.length; j++) {
                var figureA = fieldA[i][j];
                var figureB = fieldB[fieldB.length - 1 - i][j];
                if (figureA !== figureB) {
                    return false;
                }
            }
        }
        return true;
    }

    function GuarinisPuzzle(selector, field, cb) {
        this.size = 200;
        this._cb = cb;
        var svg = $(selector).find('svg').get(0)
        this.width = field[0].length * this.size;
        this.height = field.length * this.size;
        this.initialField = field;
        this.snap = Snap(svg).attr({ viewBox: [0, 0, this.width, this.height].join(' ') });
        this.size = 200;
        this.cells = [];
        this.figures = [];
        this.placeCells(field);
        this.init(field);

    }

    GuarinisPuzzle.prototype.placeCells = function (field) {
        if (this.cellsGroup) {
            this.cellsGroup.remove();
        }
        this.cellsGroup = this.snap.g();
        for (var i = 0; i < field.length; i++) {
            var row = field[i];
            for (var j = 0; j < row.length; j++) {
                this.cells.push(
                    this.snap
                        .rect(j * this.size, i * this.size, this.size, this.size)
                        .attr({
                            fill: isBlackCell(i, j) ? 'sienna' : 'peachpuff',
                            'data-id': [i, j].join(',')
                        })
                        .appendTo(this.cellsGroup)
                );
            }
        }

        return this;
    };

    GuarinisPuzzle.prototype.placeKnights = function (field) {
        if (this.figuresGroup) {
            this.figuresGroup.remove();
        }
        this.figuresGroup = this.snap.g().appendTo(this.snap.node);
        for (var i = 0; i < field.length; i++) {
            var row = field[i];
            for (var j = 0; j < row.length; j++) {
                var figure = row[j];
                if (figure !== EMPTY_CELL) {
                    var figureImage = figure === WHITE_KNIGHT ? whiteKnightUrl : blackKnightUrl;
                    var knight = this.snap
                        .image(figureImage, j * this.size, i * this.size, this.size, this.size)
                        .attr({ 'data-type': figure })
                        .click(this.onKnightClick.bind(this, [i, j]))
                        .appendTo(this.figuresGroup);
                    this.figures.push(knight);
                }
            }
        }

        return this;
    };

    GuarinisPuzzle.prototype.getPossibleMoves = function (position) {
        var knightMoves = [-1, -2, 1, 2];
        var movesVectors = [];
        for (var t = 0; t < knightMoves.length; t++) {
            var a = knightMoves[t];
            for (var k = 0; k < knightMoves.length; k++) {
                var b = knightMoves[k];
                if (Math.abs(a) !== Math.abs(b)) {
                    movesVectors.push([a, b]);
                }
            }
        }
        var i = position[0];
        var j = position[1];
        return movesVectors
            .map(function (moveVector) {
                var a = moveVector[0];
                var b = moveVector[1];
                var newI = i + a;
                var newJ = j + b;
                if (this.gameField[newI] && this.gameField[newI][newJ] === EMPTY_CELL) {
                    return [newI, newJ];
                }

            }.bind(this))
            .filter(Boolean);

    };

    GuarinisPuzzle.prototype.showPossibleMove = function (from, to) {
        var i = to[0];
        var j = to[1];
        this.snap
            .rect((j) * this.size, (i) * this.size, this.size, this.size)
            .attr({
                fill: this.snap
                    .path('M 10,-5 L -10,15 M 15,0 L 0,15 M 0,-5 L -20,15')
                    .attr({
                        fill: 'none',
                        stroke: isBlackCell(i, j) ? 'green' : 'darkgreen',
                        strokeWidth: isBlackCell(i, j) ? 4 : 4
                    })
                    .pattern(0, 0, 10, 10),
            })
            .click(this.goto.bind(this, from, [i, j]))
            .appendTo(this.possibleMoveGroup)
    };

    GuarinisPuzzle.prototype.showPossibleMoves = function (position) {
        this.clearPossibleMoves();
        this.getPossibleMoves(position).forEach(this.showPossibleMove.bind(this, position));

    };

    GuarinisPuzzle.prototype.onKnightClick = function (position) {
        this.showPossibleMoves(position);
    };

    GuarinisPuzzle.prototype.goto = function (from, to) {
        var knight = this.gameField[from[0]][from[1]];
        this.gameField[from[0]][from[1]] = this.gameField[to[0]][to[1]]
        this.gameField[to[0]][to[1]] = knight;
        this.init(this.gameField);
        if (isInversion(this.gameField, this.initialField)) {
            this._cb();
        }
    };

    GuarinisPuzzle.prototype.clearPossibleMoves = function () {
        if (this.possibleMoveGroup) {
            this.possibleMoveGroup.remove();
        }
        this.possibleMoveGroup = this.snap.g();
        return this;
    };

    GuarinisPuzzle.prototype.init = function (field) {
        this.clearPossibleMoves();
        this.gameField = clone(field);
        this.placeKnights(field);
        return this;
    };


    GuarinisPuzzle.prototype.flush = function (field) {
        this.init(this.initialField);
        return this;
    };

    var data = [0, 1, 2];
    var fields = [
        [
            [1, 0, 1],
            [0, 0, 0],
            [2, 0, 2]
        ],
        [
            [1, 0, 2],
            [0, 0, 0],
            [2, 0, 1]
        ],
        [
            [1, 1, 1],
            [0, 0, 0],
            [0, 0, 0],
            [2, 2, 2]
        ]
    ];
    var summing = data.map(function (item) {
        return new GuarinisPuzzle(
            '#level' + (item + 1),
            fields[item],
            function () {
                window.q.successCb(item, data);
            }
        )
    });

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;
        summing[id].flush();
    });

    $('#impossible').click(function (e) {
        e.preventDefault();
        if (e.target) {
            var level = e.target.getAttribute('data-id') - 1;
            if (level == 1) {
                window.q.successCb(level, data);
            } else {
                $('#possible_modal').modal('show');
            }
        }
    });
});
