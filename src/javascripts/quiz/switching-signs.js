var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

import plus from '../../images/plus.png';
import minus from '../../images/minus.png';
import right from '../../images/right.png';
import down from '../../images/down.png';

$(function () {
    var plusSrc = 'plus.png';
    var minusSrc = 'minus.png';
    var rightSrc = 'right.png';
    var downSrc = 'down.png';

    var a1 = [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
    var a2 = [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 1, 1],
        [0, 0, 1, 1],
    ];
    var a3 = [
        [0, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
    ];

    var a4 = [
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
    ];

    var a5 = [
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 1, 1],
        [1, 0, 1, 0],
    ];

    var a6 = [
        [1, 0, 1, 1],
        [0, 1, 0, 0],
        [1, 0, 1, 1],
        [0, 1, 0, 0],
    ];

    var a7 = [
        [0, 1, 1, 0],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [0, 1, 1, 0],
    ];

    var SwitchingSigns = function (targetName, field, cb) {
        var maxSize = 600;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + (maxSize) + ' ' + (maxSize - 100) });
        this.n = 6;
        this.size = maxSize / this.n;
        this._cb = cb || function () {};
        this.initialField = field;

        this.flush();
    };

    SwitchingSigns.prototype.init = function () {
        this.verticesGroup = this.snap.g().attr({ id: 'vertices' });
        this.images = [[], [], [], []];
        this.field = this.initialField.map(function (row) {
            return row.map(function (x) {
                return x;
            })
        });

        this.drawField();
        this.drawSigns();
        this.drawControls();
        this.drawLines();

        return this;
    };

    SwitchingSigns.prototype.drawField = function () {
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                this.snap
                    .rect(this._scale(i), this._scale(j), this._scale(1), this._scale(1))
                    .appendTo(this.verticesGroup)
                    .attr('fill', '#fefefe')
            }
        }
    };

    SwitchingSigns.prototype.drawControls = function () {
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                if ((i || j) && i < this.n - 1 && j < this.n - 1) {
                    if (!i) {
                        this.snap
                            .image(rightSrc, this._scale(i), this._scale(j), this._scale(1), this._scale(1))
                            .appendTo(this.verticesGroup)
                            .click(this.onRowClick.bind(this, j - 1));
                    }

                    if (!j) {
                        this.snap
                            .image(downSrc, this._scale(i), this._scale(j), this._scale(1), this._scale(1))
                            .appendTo(this.verticesGroup)
                            .click(this.onColumnClick.bind(this, i - 1));
                    }
                }
            }
        }
    };

    SwitchingSigns.prototype.drawSigns = function () {
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.n; j++) {
                if ((i || j) && i < this.n - 1 && j < this.n - 1) {
                    if (i && j) {
                        var sign = this.snap
                            .image(this.field[j - 1][i - 1] ? plusSrc : minusSrc, this._scale(i), this._scale(j), this._scale(1), this._scale(1))
                            .appendTo(this.verticesGroup);
                        this.images[j - 1][i - 1] = sign;
                    }
                }
            }
        }
    };


    SwitchingSigns.prototype.drawLines = function () {
        for (var i = 0; i < this.n - 1; i++) {
            this.snap
                .line(
                    this._scale(1),
                    this._scale(i + 1),
                    this._scale(this.n - 1),
                    this._scale(i + 1)
                )
                .appendTo(this.verticesGroup)
                .attr({
                    stroke: '#eeeeee',
                    strokeWidth: '10',
                    strokeLinecap: 'round',
                    class: 'cirle',
                });

            this.snap
                .line(
                    this._scale(i + 1),
                    this._scale(this.n - 1),
                    this._scale(i + 1),
                    this._scale(1)
                )
                .appendTo(this.verticesGroup)
                .attr({
                    stroke: '#eeeeee',
                    strokeWidth: '10',
                    strokeLinecap: 'round',
                    class: 'cirle',
                });
        }
    };

    SwitchingSigns.prototype.onRowClick = function (row) {
        for (var i = 0; i < 4; i++) {
            var isPlus = this.images[row][i].attr().href === plusSrc;
            this.images[row][i].attr({
                href: isPlus ? minusSrc : plusSrc
            });
            this.field[row][i] = !isPlus;
        }
        this.check();
    };

    SwitchingSigns.prototype.onColumnClick = function (column) {
        for (var i = 0; i < 4; i++) {
            var isPlus = this.images[i][column].attr().href === plusSrc;
            this.images[i][column].attr({
                href: isPlus ? minusSrc : plusSrc
            });
            this.field[i][column] = !isPlus;
        }
        this.check();
    };

    SwitchingSigns.prototype.check = function () {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (!this.field[i][j]) {
                    return false;
                }
            }
        }
        setTimeout(this._cb, 100);
    };

    SwitchingSigns.prototype._scale = function (x) {
        return x * this.size;
    };


    SwitchingSigns.prototype.flush = function () {
        if (this.verticesGroup) {
            this.verticesGroup.remove()
        }
        return this;
    };

    var data = [0, 1, 2, 3, 4, 5, 6];
    var levels = [a1, a2, a3, a4, a5, a6, a7];
    var games = data.reduce(function (result, item) {
        result.push(new SwitchingSigns(
            '#switchingSigns' + item,
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

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            var level = e.relatedTarget.getAttribute('data-id');

            if (level == 3 || level == 5 || level == 7) {
                window.q.successCb(level - 1, data);
            }
        }
    });
});
