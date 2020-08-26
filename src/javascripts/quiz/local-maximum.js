var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/local-maximum.styl');
var core = require('../core');

$(function() {
    function getRandom(min, max) {
        max = max !== undefined ? max : 10;
        min = min !== undefined ? min : 1;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var Local = function(targetName, index, n, m, cb) {
        this._cellSize = 25;
        this._index = index;
        this._n = n;
        this._m = m;

        this.counter = this._m;

        this.sep = 0;

        this.snap = Snap(targetName).attr({
            viewBox: "0 0 " + this._n * this._cellSize + " " + this._cellSize
        });

        this.A = [];
        this.opened = [];

        this._cb = cb || function() {};

        this.init();

        return this;
    };

    Local.prototype.initData = function() {
        this.A = Array.apply(null, Array(this._n + 2)).map(
            Number.prototype.valueOf,
            0
        );
        this.opened = Array.apply(null, Array(this._n)).map(
            Number.prototype.valueOf,
            0
        );
        this.A[0] = getRandom();
        this.A[this.A.length - 1] = getRandom();

        this.last = 10;
        this.pos = this._n / 2;

        this.counter = this._m;
    };

    Local.prototype.initImage = function() {
        if (this.cells && this.cells.length) {
            this.cells.forEach(function(item) {
                item.remove();
            });
        }

        this.cells = [];

        for (var index = 0; index < this._n; index++) {
            var cell = this.snap
                .rect(
                    index * (this._cellSize + this.sep),
                    0,
                    this._cellSize,
                    this._cellSize
                )
                .attr({
                    stroke: "black",
                    fill: "white",
                    index: index
                })
                .mousedown(
                    function(event) {
                        event.preventDefault();
                        this._openCell(
                            Number(
                                $(
                                    event.target
                                        ? event.target
                                        : event.currentTarget
                                ).attr("index")
                            ) + 1
                        );
                    }.bind(this)
                );

            this.cells.push(cell);
        }

        this._clearAll();

        return this;
    };

    Local.prototype.init = function() {
        this.initData();
        this.initImage();

        return this;
    };

    Local.prototype._clearAll = function() {
        $("#reset").attr("disabled", "disabled");

        $("#probesNum-" + (this._index + 1)).text(this.counter);
        $("#hint")
            .text("")
            .css("color", "black");

        return this;
    };

    Local.prototype._showCell = function(k) {
        this.cells[k].paper.text(
            k * (this._cellSize + this.sep) + 5,
            16,
            this.A[k + 1]
        );
    };

    Local.prototype._updateProbes = function() {
        $("#probesNum-" + (this._index + 1)).text(this.counter);
    };

    Local.prototype._checkSuccess = function(k) {
        if (
            (k === 0 || this.opened[k - 1]) &&
            (k === this.opened.length - 1 || this.opened[k + 1]) &&
            this.A[k + 1] >= this.A[k] &&
            this.A[k + 1] >= this.A[k + 2]
        ) {
            this.cells[k].attr({ fill: "#f00", stroke: "#fff" });
            this._cb();
        }
    };

    Local.prototype._openCell = function(k) {
        if (!this.opened[k - 1] && this.counter > 0) {
            this.opened[k - 1] = 1;

            this.counter--;

            var l = 0;
            var r = this.A.length;

            for (var i = k - 1; i > -1; i--) {
                if (this.A[i]) {
                    l = i;
                    i = -1;
                }
            }

            for (var i = k + 1; i <= this.A.length; i++) {
                if (this.A[i]) {
                    r = i;
                    i = this.A.length + 1;
                }
            }

            if (this.pos >= l && this.pos <= r) {
                var b = getRandom(0, 4);

                this.last = this.last + 10 + b;
                this.A[k] = Math.floor(this.last);

                if (r - k >= k - l) {
                    this.pos = (k + r) / 2;
                } else {
                    this.pos = (l + k) / 2;
                }
            } else {
                this.A[k] = Math.floor(
                    ((this.A[r] - this.A[l]) * (k - l)) / (r - l) + this.A[l]
                );
            }

            this._showCell(k - 1);
            for (var i = 0; i < this.opened.length; i++) {
                if (this.opened[i]) {
                    this._checkSuccess(i);
                }
            }
            this._updateProbes();
        }
    };

    var data = [{ n: 4, m: 3 }, { n: 8, m: 5 }, { n: 16, m: 7 }];
    var locals = data.reduce(function(result, item, i) {
        result.push(
            new Local(
                "#local-maximum-" + (i + 1),
                i,
                item.n,
                item.m,
                function() {
                    window.q.successCb(item, data);
                }
            ).init()
        );
        return result;
    }, []);

    $(".reset").on("click", function() {
        var id = $(this).data("id") - 1;

        locals[id].init();
    });
});
