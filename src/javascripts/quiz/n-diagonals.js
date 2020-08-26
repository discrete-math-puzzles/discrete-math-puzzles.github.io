var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/n-diagonals.styl');
var core = require('../core');

$(function(){
    var Diagonals = function (targetName, index, count, cb) {
        this.n = index;
        this.count = count;
        this.CELL = 100;
        this.MAX_DIMENSION = 500;

        this._lineStyle = {
            strokeWidth: 2,
            stroke: "black",
            strokeLinecap: "round",
        };
        this._ds = {
            strokeWidth: 6,
            stroke: "red",
            strokeLinecap: "round",
            display: "none"
        };

        this._cb = cb || function () {};
        this._targetName = targetName;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + this.MAX_DIMENSION + ' ' + this.MAX_DIMENSION });
        this._text = '#diagnum' + index;

        return this;
    };

    Diagonals.prototype._ij2k = function (i, j) {
        return j * this.n + i;
    };

    Diagonals.prototype._k2ij = function (k) {
        return {
            i: k % this.n,
            j: Math.floor(k / this.n)
        }
    };

    Diagonals.prototype._d = function (i, j) {
        return this.diag_flags[this._ij2k(i, j)];
    };

    Diagonals.prototype.init = function () {
        this.clear();

        this.diags1 = [];
        this.diags2 = [];
        this.occupied_corners = [];
        this.invisible_cells = Array.apply(null, Array(36)).map(Number.prototype.valueOf, 0);
        this.diag_flags = [];

        this.draw();

        return this;
    };

    Diagonals.prototype.clear = function () {
        this.diags1 && this.diags1.length && this.diags1.forEach(function (item) { item.remove(); });
        this.diags2 && this.diags2.length && this.diags2.forEach(function (item) { item.remove(); });
        this.invisible_cells && this.invisible_cells.length && this.invisible_cells.forEach(function (item) { item && item.remove(); });

        $(this._text).text(0);

        return this;
    };

    Diagonals.prototype.draw = function () {
        this.drawGrid();
        this.drawLines();

        return this;
    };

    Diagonals.prototype.drawGrid = function () {
        var size = this.MAX_DIMENSION / this.n;

        for (var i = 1; i < this.n; ++i) {
            this.snap.line(0, i * size, this.MAX_DIMENSION, i * size).attr(this._lineStyle);
            this.snap.line(i * size, 0, i * size, this.MAX_DIMENSION).attr(this._lineStyle);
        }

        return this;
    };

    Diagonals.prototype.drawLines = function () {
        var size = this.MAX_DIMENSION / this.n;

        for (var k = 0; k < this.n * this.n; ++k) {
            var i = this._k2ij(k).i;
            var j = this._k2ij(k).j;
            var d1 = this.snap.line(i * size, j * size, (i + 1) * size, (j + 1) * size).attr(this._ds);
            var d2 = this.snap.line((i + 1) * size, j * size, i * size, (j + 1) * size).attr(this._ds);
            var inv_cell = this.snap.rect(i * size, j * size, size, size)
                .attr({
                    opacity: 0,
                    k: k
                })
                .mousedown(function (event) {
                    event.preventDefault();

                    this.UpdateDiags(Number(event.target.getAttribute('k')));
                }.bind(this));

            this.diag_flags.push(0);

            this.diags1.push(d1);
            this.diags2.push(d2);
            this.invisible_cells.push(inv_cell);
        }

        return this;
    };

    Diagonals.prototype.isConflictDiag = function (k) {
        if (this.diag_flags[k] == 0) {
            return false;
        }

        var i = this._k2ij(k).i;
        var j = this._k2ij(k).j;

        if (this.diag_flags[k] == 1) {
            return ((i > 0 && this._d(i - 1, j) == 2) ||
                (i > 0 && j > 0 && this._d(i - 1, j - 1) == 1) ||
                (j > 0 && this._d(i, j - 1) == 2) ||
                (i < (this.n - 1) && this._d(i + 1, j) == 2) ||
                (i < (this.n - 1) && j < (this.n - 1) && this._d(i + 1, j + 1) == 1) ||
                (j < (this.n - 1) && this._d(i, j + 1) == 2));
        }

        if (this.diag_flags[k] == 2) {
            return ((i > 0 && this._d(i - 1, j) == 1) ||
                (j > 0 && this._d(i, j - 1) == 1) ||
                (i < (this.n - 1) && j > 0 && this._d(i + 1, j - 1) == 2) ||
                (i < (this.n - 1) && this._d(i + 1, j) == 1) ||
                (j < (this.n - 1) && this._d(i, j + 1) == 1) ||
                (i > 0 && j < (this.n - 1) && this._d(i - 1, j + 1) == 2));
        }

        return false;
    };

    Diagonals.prototype.UpdateDiags = function (k) {
        this.diag_flags[k] = (this.diag_flags[k] + 1) % 3;

        while (this.isConflictDiag(k)) {
            this.diag_flags[k] = (this.diag_flags[k] + 1) % 3;
        }

        for (var k = 0; k < this.n * this.n; ++k) {
            this.diags1[k].attr({ display: this.diag_flags[k] == 1 ? '' : 'none' });
            this.diags2[k].attr({ display: this.diag_flags[k] == 2 ? '' : 'none' });
        }

        var num = 0;
        for (var k = 0; k < this.n * this.n; ++k)
            if (this.diag_flags[k] > 0) {
                num += 1;
            }

        if (num === this.count) {
            this._cb();
        }

        $(this._text).text(num);

        return this;
    };

    var data = [3, 4, 5];
    var diagonalsCount = [6, 10, 16];
    var diagonals = data.reduce(function(result, item, i) {
        result.push(new Diagonals(
            '#mySvg' + (i + 1),
            item,
            diagonalsCount[i],
            function () {
                 window.q.successCb(i, data);
            }).init());
        return result;
    }, []);

     $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;
        diagonals[id].init();
    });
});
