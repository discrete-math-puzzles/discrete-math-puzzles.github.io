var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

$(function () {
    function matrixToPoints(matrix) {
        var points = [];
        matrix.forEach(function (row, i) {
            row.forEach(function (x, j) {
                if (x) {
                    points.push([i, j])
                }
            })
        });
        return points;
    }

    function pointsToMatrix(points) {
        var figure = [];
        points.forEach(function (point) {
            var x = point[0];
            var y = point[1];
            if (!figure[x]) {
                figure[x] = [];
            }
            figure[x][y] = 1;

        });
        return figure;
    }

    function matrixEqual(a, b) {
        for (var i = 0; i < a.length; i++) {
            var row = a[i];
            for (var j = 0; j < row.length; j++) {
                var x = row[j];
                if (x) {
                    if (!b[i] || !b[i][j]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function Figure(points) {
        var xs = points.map(function (t) { return t[1] });
        var ys = points.map(function (t) { return t[0] });
        var minX = Math.min.apply(null, xs);
        var minY = Math.min.apply(null, ys);
        var maxX = Math.max.apply(null, xs);
        var maxY = Math.max.apply(null, ys);

        this.width = maxX - minX + 1;
        this.height = maxY - minY + 1;
        this.points = points.map(function (point) {
            return [point[0] - minY, point[1] - minX]
        });
    }

    Figure.fromMatrix = function (matrix) {
        return new Figure(matrixToPoints(matrix));
    };

    Figure.prototype.transpose = function () {
        this.points = this.points.map(function (t) {
            return [t[1], t[0]];
        });
        var width = this.width;
        this.width = this.height;
        this.height = width;
        return this;
    };

    Figure.prototype.reflectX = function () {
        this.points = this.points.map(function (t) {
            return [t[0], Math.abs(t[1] - this.width) - 1];
        }, this);
        return this;
    };

    Figure.prototype.rotate = function () {
        return this.transpose().reflectX();
    };

    Figure.prototype.isEq = function (figure) {
        var matrA = pointsToMatrix(figure.points);
        var matrB = pointsToMatrix(this.points);
        return matrixEqual(matrA, matrB);
    };

    Figure.prototype.isEqByRotate = function (figure) {
        var equal = false;
        for (var a = 0; a < 4; a++) {
            if (this.isEq(figure)) {
                equal = true;
            }

            figure.rotate();
        }
        return equal;
    };

    Figure.prototype.isCongruent = function (figure) {
        if (this.isEqByRotate(figure)) {
            return true;
        }

        if (this.reflectX().isEqByRotate(figure)) {
            this.reflectX();
            return true;
        }
        this.reflectX();
        return false;
    };

    var figureA = [
        [0, 1, 1],
        [0, 1, 0],
        [1, 1, 0]
    ];
    var figureB = [
        [0, 1, 1, 1, 1],
        [0, 1, 1, 1, 1],
        [0, 1, 1, 1, 1],
        [0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0],
    ];
    var figureC = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
    ];
    var figures = [figureA, figureB, figureC];

    function cloneFigure(figure) {
        return figure.map(function (row) {
            return row.map(function (x) {
                return x;
            })
        })
    }

    var FigureCut = function (targetName, figure, cb) {
        var maxSize = 600;

        this.snap = Snap(targetName).attr({ viewBox: '-30 -30 ' + (maxSize + 60) + ' ' + (maxSize + 60) });
        this.n = figure.length;
        this.figure = figure;
        this.size = maxSize / this.n;
        this._cb = cb || function () {};
        this.blocked = {};
        this.weight = this._calculateWeight();
        this.flush();
    };

    FigureCut.prototype._calculateWeight = function () {
        var weight = 0;
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                if (this.figure[i][j]) {
                    weight += 1;
                }
            }
        }
        return weight;
    };

    FigureCut.prototype._isBlocked = function (pointA, pointB) {
        return this.blocked[pointA + '-' + pointB] || this.blocked[pointB + '-' + pointA];
    };

    FigureCut.prototype._unblock = function (pointA, pointB) {
        this.blocked[pointA + '-' + pointB] = false;
        this.blocked[pointB + '-' + pointA] = false;
    };

    FigureCut.prototype._block = function (pointA, pointB) {
        this.blocked[pointA + '-' + pointB] = true;
        this.blocked[pointB + '-' + pointA] = true;
    };

    FigureCut.prototype._dfs = function dfs(startPoint, figure, points) {
        points = points || [];
        var i = startPoint[0];
        var j = startPoint[1];
        figure[i][j] = 0;
        points.push(startPoint);
        this.mark([i, j]);
        if (
            figure[i] && figure[i][j + 1]
            && !this._isBlocked([i, j], [i, j + 1])
            && !this.isMarked([i, j + 1])
        ) {
            this._dfs([i, j + 1], figure, points);
        }
        if (
            figure[i + 1] && figure[i + 1][j]
            && !this._isBlocked([i, j], [i + 1, j])
            && !this.isMarked([i + 1, j])
        ) {
            this._dfs([i + 1, j], figure, points);
        }
        if (
            figure[i] && figure[i][j - 1]
            && !this._isBlocked([i, j], [i, j - 1])
            && !this.isMarked([i, j - 1])
        ) {
            this._dfs([i, j - 1], figure, points);
        }
        if (
            figure[i - 1] && figure[i - 1][j]
            && !this._isBlocked([i, j], [i - 1, j])
            && !this.isMarked([i - 1, j])
        ) {
            this._dfs([i - 1, j], figure, points);
        }
        return points;
    };

    FigureCut.prototype._scale = function (i) {
        return i * this.size;
    };

    FigureCut.prototype._getEdges = function (i, j) {
        var pointA = [(i), (j)]; // A
        var pointB = [(i), (j + 1)]; // B
        var pointC = [(i + 1), (j + 1)]; // C
        var pointD = [(i + 1), (j)]; // D

        return [
            [pointA, pointB],
            [pointD, pointC],
            [pointA, pointD],
            [pointB, pointC],
        ]
    };

    FigureCut.prototype._isHorizontal = function (edge) {
        var Ax = edge[0][0];
        var Bx = edge[1][0];
        return Ax !== Bx;
    };

    FigureCut.prototype.init = function () {
        var edges = [];
        var cells = [];
        this.verticesGroup = this.snap.g().prependTo(this.snap).attr({ id: 'vertices' });
        this.bgGroup = this.snap.g().prependTo(this.snap).attr({ id: 'bg' });

        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                if (this.figure[i][j]) {
                    edges = edges.concat(this._getEdges(j, i))
                    cells.push([j, i]);
                }
            }
        }

        cells.forEach(function (cell) {
            var i = cell[0];
            var j = cell[1];
            this.bgGroup.add(
                this.snap
                    .rect(i * this.size, j * this.size, this.size, this.size)
                    .attr('fill', '#c3fffd')
            )
        }, this);

        edges.forEach(function (edge) {
            var Ax = edge[0][0];
            var Ay = edge[0][1];
            var Bx = edge[1][0];
            var By = edge[1][1];
            var line = this.snap
                .line(
                    this._scale(Ax),
                    this._scale(Ay),
                    this._scale(Bx),
                    this._scale(By)
                ).attr({
                    stroke: '#5bc0de',
                    strokeWidth: '30',
                    strokeLinecap: 'round',
                    class: 'cirle',
                });
            line.mousedown(this.onEdgeClick(edge, line));

            this.verticesGroup.add(line);
        }, this);

        return this;
    };

    FigureCut.prototype.isSeparatedOnHalf = function () {
        this.markReset();
        var pointsA = this._dfs(this.findUnmarked(), cloneFigure(this.figure));
        if (2 * pointsA.length !== this.weight) {
            return false;
        }
        var pointsB = this._dfs(this.findUnmarked(), cloneFigure(this.figure));
        if (2 * pointsB.length !== this.weight) {
            return false;
        }
        var figureA = new Figure(pointsA);
        var figureB = new Figure(pointsB);
        return figureA.isCongruent(figureB);
    };

    FigureCut.prototype.isMarked = function (point) {
        return this.marked[point[0] + ',' + point[1]]
    };

    FigureCut.prototype.mark = function (point) {
        this.marked[point[0] + ',' + point[1]] = true;
    };

    FigureCut.prototype.markReset = function (point) {
        this.marked = {};
    };

    FigureCut.prototype.findUnmarked = function () {
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                if (this.figure[i][j] && !this.marked[i + ',' + j]) {
                    return [i, j]
                }
            }
        }
        throw new Error('can`t find unmarked point')
    };

    FigureCut.prototype.isInFigure = function (point) {
        var x = point[0];
        var y = point[1];

        return Boolean(this.figure[x] && this.figure[x][y]);
    };

    FigureCut.prototype.onEdgeClick = function (edge, line) {
        var Ax = edge[0][0];
        var Ay = edge[0][1];
        return function (event) {
            event.preventDefault();

            var borderPoints = this._isHorizontal(edge) ?
                [[Ay, Ax], [Ay - 1, Ax]] :
                [[Ay, Ax], [Ay, Ax - 1]];

            if (!this.isInFigure(borderPoints[0]) || !this.isInFigure(borderPoints[1])) {
                return;
            }

            if (this._isBlocked(borderPoints[0], borderPoints[1])) {
                this._unblock(borderPoints[0], borderPoints[1]);
                line.attr({ stroke: '#5bc0de' });
                line.remove();
                line.prependTo(this.verticesGroup);
            } else {
                this._block(borderPoints[0], borderPoints[1]);
                line.attr({ stroke: '#ff0000' });
                line.remove();
                line.appendTo(this.verticesGroup);
            }
            if (this.isSeparatedOnHalf()) {
                this._cb();
            }
        }.bind(this);
    };

    FigureCut.prototype.flush = function () {
        if (this.verticesGroup) {
            this.verticesGroup.remove();
            this.bgGroup.remove();
        }
        return this;
    };

    var data = [0, 1, 2];
    var queens = data.reduce(function (result, item) {
        result.push(new FigureCut(
            '#figureCut' + item,
            figures[item],
            function () {
                window.q.successCb(item, data);
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;
        queens[id].flush().init();
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
