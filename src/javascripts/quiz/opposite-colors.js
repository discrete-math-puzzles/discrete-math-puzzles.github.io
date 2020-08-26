var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/opposite-color.styl');
var core = require('../core');

$(function () {
    var Colors = function (targetName, index, count, successCount, cb) {
        this._cellSize = 25;
        this._index = index;
        this._count = count || 20;
        this._successCount = successCount || 5;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + this._count * this._cellSize + ' ' + this._cellSize });

        this.sep = 0;
        this.undefinedColor = -1;

        this._cb = cb || function () {};

        this.init();

        return this;
    };

    Colors.prototype.init = function () {
        if (this.cells && this.cells.length || this.colors && this.colors.length) {
            this.cells.forEach(function(item) {
                item.remove();
            });
        }

        this.cells = [];
        this.colors = [];
        this.requests = [];

        for (var k = 0; k < this._count; ++k) {
            var cell = this.snap.rect(k * (this._cellSize + this.sep), 0, this._cellSize, this._cellSize)
                .attr({
                    stroke: 'black',
                    fill: 'grey',
                    k: k,
                })
                .mousedown(function (event) {
                    event.preventDefault();
                    this._openCell(Number($(event.target ? event.target : event.currentTarget).attr('k')));
                }.bind(this));

            this.cells.push(cell);
            this.colors.push(this.undefinedColor);
        }

        this._clearAll();

        return this;
    };


    Colors.prototype._clearAll = function () {
        for (var k = 0; k < this._count; ++k) {
            this.cells[k].attr({fill: 'grey'});
            this.colors[k] = this.undefinedColor;
        }

        this.cells[0].attr({fill: 'white'});
        this.colors[0] = 0;

        this.cells[this._count - 1].attr({fill: 'black'});
        this.colors[this._count - 1] = 1;

        $('#reset').attr('disabled', 'disabled');

        $('#probesNum').text(5);
        $('#hint').text("").css('color', 'black');

        return this;
      }

    Colors.prototype._computeShortestAchromaticBlock = function () {
        var block = 20;
        var i = 0;
        var j = 1;

        while (j < this._count) {
            while (this.colors[j] == this.undefinedColor) {
                j += 1;
            }

            if (this.colors[i] != this.colors[j]) {
                block = Math.min(block, j - i);
            }
            i = j;
            j = j + 1;
        }

        return block;
    };

    Colors.prototype._openCell = function (k) {
        if (this.colors[k] !== this.undefinedColor) {
            return;
        }

        if (this.requests.length >= 5) {
            return;
        }

        this.requests.push(k);

        $('#reset').removeAttr('disabled');

        this.colors[k] = 0;
        var block0 = this._computeShortestAchromaticBlock();

        this.colors[k] = 1;
        var block1 = this._computeShortestAchromaticBlock();

        this.colors[k] = (block0 >= block1 ? 0 : 1);

        this.cells[k].attr({
            fill: (this.colors[k] === 0 ? 'white' : 'black'),
        });

        $('#probesNum').text(5 - this.requests.length);

        if (Math.max(block0, block1) === 1) {
            if (this.colors[k] !== (this.colors[k - 1] && this.colors[k - 1] !== -1)) {
                this.cells[k].attr({stroke: 'red', 'stroke-width': 2});
                this.cells[k - 1].attr({stroke: 'red', 'stroke-width': 2});
            } else if (this.colors[k] !== (this.colors[k + 1] && this.colors[k + 1] !== -1)) {
                this.cells[k].attr({stroke: 'red', 'stroke-width': 2});
                this.cells[k + 1].attr({stroke: 'red', 'stroke-width': 2});
            }

            window.q.successCb(this._index, data);
        }

        return this;
    };

    var data = [{
        count: 20,
        successCount: 5
    }];
    var colors = data.reduce(function(result, item, i) {
        result.push(new Colors(
            '#opposite-color-' + (i + 1),
            i,
            item.count,
            item.successCount,
            function () {
                window.q.successCb(item, data);
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;

        colors[id].init();
    });
});
