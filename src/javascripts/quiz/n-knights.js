var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

import img from '../../images/knight.svg';

$(function () {
    var Knights = function (targetName, count, cb) {
        var maxSize = 600;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + maxSize + ' ' + maxSize });
        this.n = 8;
        this.success = this.n * 4;
        this.size = maxSize / this.n;
        this._cb = cb || function () {};

        this.flush();
    };

    Knights.prototype.init = function () {
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                this.cells.push(this.snap
                    .rect(i * this.size, j * this.size, this.size, this.size)
                    .attr('fill', !(i % 2) && j % 2 || i % 2 && !(j % 2) ? 'sienna' : 'peachpuff')
                );

                this.knightImages.push(this.snap
                    .image('knight.svg', i * this.size, j * this.size, this.size, this.size)
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

                        if (this.attackedCells[i * this.n + j] === 0 && this.knights[i * this.n + j] === 0) {
                            this.knights[i * this.n + j] = 1;
                        } else {
                            if (this.knights[i * this.n + j] == 1) {
                                this.knights[i * this.n + j] = 0;
                            }
                        }

                        if (this.knights.reduce(function (result, item) { return result + item; }, 0) === this.success) {
                            this._cb(this.n);
                        } else {
                            var sumOfAttaced = this.attackedCells.reduce(function(a, b) { return a + b; }, 0);
                            var sumOfKnights = this.knights.reduce(function(a, b) { return a + b; }, 0);

                            if (sumOfAttaced + sumOfKnights === this.n * this.n) {
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

    Knights.prototype.redraw = function () {
        this.attackedCells = Array.apply(null, Array(this.n * this.n)).map(Number.prototype.valueOf, 0);

        this.knightImages.forEach(function (knight, k) {
            if (this.knights[k]) {
                knight.attr({ display: '' });

                var i = (k % this.n);
                var j = Math.floor(k / this.n);

                for (var dx = -2; dx <= 2; dx++) {
                    for (var dy = -2; dy <=2; dy++) {
                        if (
                            dx === 0 || dy === 0 ||
                            dx === dy || dx === -dy ||
                            j + dy < 0 || i + dx < 0 ||
                            j + dy >= this.n || i + dx >= this.n
                        ) {
                            continue;
                        }

                        var index = k + dx + dy * this.n;

                        if (index > -1 && index < this.n * this.n) {
                            this.attackedCells[index] = 1;
                        }
                    }
                }
            } else {
                knight.attr({ display: 'none' });
            }
        }.bind(this));

        for (var k = 0; k < this.n * this.n; k++) {
            this.invisibleCells[k].attr({ opacity: this.attackedCells[k] && !this.knights[k] ? 0.8 : 0 });
        }

        return this;
    };

    Knights.prototype.flush = function () {
        this.knights = Array.apply(null, Array(this.n * this.n)).map(Number.prototype.valueOf, 0);
        this.attackedCells = Array.apply(null, Array(this.n * this.n)).map(Number.prototype.valueOf, 0);

        this.invisibleCells = [];
        this.knightImages = [];
        this.cells = [];

        return this;
    };

    var data = [1]; // for levels
    var knights = data.reduce(function(result, item) {
        result.push(new Knights(
            '#knight' + item,
            item,
            function () {
               window.q.successCb(item, data);
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;
        knights[id].flush().init();
    });
});
