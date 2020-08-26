var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

import img from '../../images/bishop.png';

$(function () {
    var Bishops = function (targetName, count, cb) {
        var maxSize = 600;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + maxSize + ' ' + maxSize });
        this.n = 8;
        this.success = this.n + 6;
        this.size = maxSize / this.n;
        this._cb = cb || function () {};

        this.flush();
    };

    Bishops.prototype.init = function () {
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                this.cells.push(this.snap
                    .rect(i * this.size, j * this.size, this.size, this.size)
                    .attr('fill', !(i % 2) && j % 2 || i % 2 && !(j % 2) ? 'sienna' : 'peachpuff')
                );

                this.bishopImages.push(this.snap
                    .image('/images/bishop.png', i * this.size, j * this.size, this.size, this.size)
                    .attr({ display: 'none' })
                );

                this.invisibleCells.push(this.snap
                    .rect(i * this.size, j * this.size, this.size, this.size)
                    .attr({
                        fill: this.snap
                            .path('M 10,-5 L -10,15 M 15,0 L 0,15 M 0,-5 L -20,15')
                            .attr({
                                fill: 'none',
                                stroke: 'black',
                                strokeWidth: 4
                            })
                            .pattern(0, 0, 10, 10),
                        opacity: 0,
                        i: i,
                        j: j
                    })
                    .mousedown(function (event) {
                        event.preventDefault();

                        var i = Number(event.target.getAttribute('i'));
                        var j = Number(event.target.getAttribute('j'));

                        if (this.attackedCells[i * this.n + j] === 0 && this.bishops[i * this.n + j] === 0) {
                            this.bishops[i * this.n + j] = 1;
                        } else {
                            if (this.bishops[i * this.n + j] == 1) {
                                this.bishops[i * this.n + j] = 0;
                            }
                        }

                        if (this.bishops.reduce(function (result, item) { return result + item; }, 0) === this.success) {
                            this._cb(this.n);
                        } else {
                            var sumOfAttaced = this.attackedCells.reduce(function(a, b) { return a + b; }, 0);
                            var sumOfBishops = this.bishops.reduce(function(a, b) { return a + b; }, 0);

                            if (sumOfAttaced + sumOfBishops === this.n * this.n) {
                                $('#better_solution_modal').modal('show');
                            }
                        }

                        this.redraw();
                    }.bind(this))
                );
            }
        }

        return this;
    };

    Bishops.prototype.redraw = function () {
        this.attackedCells = Array.apply(null, Array(this.n * this.n)).map(Number.prototype.valueOf, 0);

        this.bishopImages.forEach(function (bishop, k) {
            if (this.bishops[k]) {
                bishop.attr({ display: '' });

                var i = (k % this.n);
                var j = Math.floor(k / this.n);

                for (var deltai = -1; deltai < 2; ++deltai) {
                    for (var deltaj = -1; deltaj < 2; ++deltaj) {
                        if (deltai == 0 || deltaj == 0) {
                            continue;
                        }

                        var tmpi = i;
                        var tmpj = j;

                        while (0 <= tmpi && tmpi < this.n && 0 <= tmpj && tmpj < this.n) {
                            this.attackedCells[tmpj * this.n + tmpi] = 1;
                            tmpi += deltai;
                            tmpj += deltaj;
                        }
                    }
                }
            } else {
                bishop.attr({ display: 'none' });
            }
        }.bind(this));

        for (var k = 0; k < this.n * this.n; k++) {
            this.invisibleCells[k].attr({ opacity: this.attackedCells[k] && !this.bishops[k] ? 0.8 : 0 });
        }

        return this;
    };

    Bishops.prototype.flush = function () {
        this.bishops = Array.apply(null, Array(this.n * this.n)).map(Number.prototype.valueOf, 0);
        this.attackedCells = Array.apply(null, Array(this.n * this.n)).map(Number.prototype.valueOf, 0);

        this.invisibleCells = [];
        this.bishopImages = [];
        this.cells = [];

        return this;
    };

    var data = [1]; // for levels
    var bishops = data.reduce(function(result, item) {
        result.push(new Bishops(
            '#bishop' + item,
            item,
            function (n) {
                window.q.successCb(item, data)
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;
        bishops[id].flush().init();
    });
});
