var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

import img from '../../images/piece.png';

$(function () {
    var pieceImageSrc = 'piece.png';

    var PieceOnChessboard = function (targetName, steps, cb) {
        var maxSize = 600;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + (maxSize) + ' ' + (maxSize + 100) });
        this.n = 8;
        this.stepsTarget = steps;
        this.startPosition = [2, 4];
        this.size = maxSize / this.n;
        this._cb = cb || function () {};

        this.flush();
    };

    PieceOnChessboard.prototype.init = function () {
        this.verticesGroup = this.snap.g().attr({ id: 'vertices' });
        this.piecePosition = this.startPosition;

        this.stepsView = this.snap
            .text(0, this._scale(this.n + 1) - 40, '')
            .appendTo(this.verticesGroup)
            .attr({ fontSize: 35 });
        this.stepsView2 = this.snap
            .text(0, this._scale(this.n + 1) + 5, '')
            .appendTo(this.verticesGroup)
            .attr({ fontSize: 35 });

        this.setSteps(0);
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                this.snap
                    .rect(this._scale(i), this._scale(j), this._scale(1), this._scale(1))
                    .appendTo(this.verticesGroup)
                    .attr('fill', !(i % 2) && j % 2 || i % 2 && !(j % 2) ? 'sienna' : 'peachpuff')
                    .mousedown(this.onCellClick([i, j]));
            }
        }

        this.snap
            .rect(
                this._scale(this.piecePosition[0]),
                this._scale(this.piecePosition[1]),
                this._scale(1),
                this._scale(1)
            )
            .appendTo(this.verticesGroup)
            .attr({
                fill: this.snap
                    .path('M 10,-5 L -10,15 M 15,0 L 0,15 M 0,-5 L -20,15')
                    .attr({
                        fill: 'none',
                        stroke: 'black',
                        strokeWidth: 4
                    })
                    .pattern(0, 0, 10, 10),
                opacity: .5,
            })
            .mousedown(this.onCellClick([this.piecePosition[0], this.piecePosition[1]]))


        this.piece = this.snap
            .image(
                pieceImageSrc,
                this._scale(this.piecePosition[0]),
                this._scale(this.piecePosition[1]),
                this._scale(1),
                this._scale(1)
            )
            .appendTo(this.verticesGroup);

        return this;
    };

    PieceOnChessboard.prototype._distance = function (pointA, pointB) {
        return Math.abs(pointA[0] - pointB[0]) + Math.abs(pointA[1] - pointB[1])
    };

    PieceOnChessboard.prototype.setSteps = function (steps) {
        this.steps = steps;
        this.stepsView.attr({ text: 'Steps made: ' + steps  });
        this.stepsView2.attr({ text: 'Steps remaining: ' + (this.stepsTarget - steps) });
    };

    PieceOnChessboard.prototype.goto = function (targetPosition) {
        if (!(this.stepsTarget - this.steps)) {
            return;
        }
        var newPosition = [
            Math.max(Math.min(targetPosition[0], this.n - 1), 0),
            Math.max(Math.min(targetPosition[1], this.n - 1), 0),
        ];
        if (this._distance(this.piecePosition, newPosition) === 1) {
            this.piecePosition = newPosition;
            this.piece.attr({
                x: this._scale(this.piecePosition[0]),
                y: this._scale(this.piecePosition[1])
            });
            this.setSteps(this.steps + 1);

            if (this.steps === this.stepsTarget && !this._distance(this.startPosition, newPosition)) {
                this._cb();
            }
        }
    };

    PieceOnChessboard.prototype.onCellClick = function (newPosition) {

        return function (event) {
            event && event.preventDefault();
            this.goto(newPosition);
        }.bind(this);
    };

    PieceOnChessboard.prototype._scale = function (x) {
        return x * this.size;
    };

    PieceOnChessboard.prototype.delta = function (deltaPosition) {
        this.goto([
            this.piecePosition[0] - deltaPosition[0],
            this.piecePosition[1] - deltaPosition[1],
        ]);
    };


    PieceOnChessboard.prototype.flush = function () {
        if (this.verticesGroup) {
            this.verticesGroup.remove()
        }
        return this;
    };

    var data = [0, 1];
    var levels = [17, 18];
    var games = data.reduce(function (result, item) {
        result.push(new PieceOnChessboard(
            '#pieceOnChessboard' + item,
            levels[item],
            function () {
                window.q.successCb(item, data);
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;
        games[id].flush().init();
    });

    $(document).keydown(function (e) {
        var key = e.keyCode;
        var gameId = $('.tab-pane.active').attr('id').slice(-1);
        var game = games[gameId];
        switch (true) {
            case (key === 38 || key === 87):
                game.delta([0, 1]);
                break;
            case (key === 40 || key === 83):
                game.delta([0, -1]);
                break;
            case (key === 37 || key === 65):
                game.delta([1, 0]);
                break;
            case (key === 39 || key === 68):
                game.delta([-1, 0]);
                break;
            default:
                return;
        }
        e.preventDefault();
    });

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            var level = e.relatedTarget.getAttribute('data-id');

            if (level == 1) {
                window.q.successCb(level - 1, data);
            }
        }
    });
});
