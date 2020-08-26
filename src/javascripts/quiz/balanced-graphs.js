var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/balanced-graphs.styl');
var core = require('../core');

$(function () {
    var $modal = $('.balanced-graphs__modal');

    var Graph = function (targetName, id, count, cb) {
        this.maxDimension = 600;
        this.radius = 260;
        this.circleRadius = 40;
        this.successNumber = 5;
        this.targetName = targetName;
        this.id = id;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + this.maxDimension + ' ' + this.maxDimension });
        this.angle = (360 / count) * (Math.PI / 180);
        this.n = count;

        this._cb = cb || function () {};
        this._targetName = targetName;
    };

    Graph.prototype.init = function () {
        this.circles = [];
        this.vertices = [];
        this.counters = Array.apply(null, Array(this.n)).map(Number.prototype.valueOf, 0);
        this.path = [];

        this.draw();

        return this;
    };

    Graph.prototype.draw = function () {
        this.drawCircles();
        this.drawVertices();
    };

    Graph.prototype.drawCircles = function () {
        if (this.circleGroup) {
            this.circleGroup.remove();
        }

        this.circleGroup = this.snap.g().attr({ id: 'circles' });

        for (var i = 0; i < this.n; i++) {
            var x = Math.cos(i * this.angle) * this.radius + this.maxDimension / 2;
            var y = Math.sin(i * this.angle) * this.radius + this.maxDimension / 2;
            var circle = this.snap
                .circle(x, y, this.circleRadius)
                .attr({ 'data-id': i, fill: '#5bc0de' });

            this.circles.push(circle);
            this.circleGroup.add(circle);
        }

        return this;
    };

    Graph.prototype.drawVertices = function () {
        var exists = [];

        if (this.verticesGroup) {
            this.verticesGroup.remove();
        }

        this.verticesGroup = this.snap.g().prependTo(this.snap).attr({ id: 'vertices' });

        for (var i = 0; i < this.n - 1; i++) {
            for (var j = 1; j < this.n; j++) {
                var coods = [
                    this.circles[i].getBBox(),
                    this.circles[j].getBBox()
                ];
                var point = (i < j ? [i, j] : [j, i]).join(',');

                if (exists.indexOf(point) === -1) {
                    exists.push(point);

                    var line = this.snap
                        .line(
                            coods[0].cx,
                            coods[0].cy,
                            coods[1].cx,
                            coods[1].cy
                        )
                        .attr({
                            stroke: this.path.indexOf([i, j].join(',')) === -1 ? '#f0f0f0' : '#5bc0de',
                            strokeWidth: '7',
                            'data-id': point,
                            class: 'vertex'
                        })
                        .mousedown(this.handleVertexClick.bind(this));

                    this.verticesGroup.add(line);
                }
            }
        }
    };

    Graph.prototype.handleVertexClick = function (event) {
        event.preventDefault();

        var id = event.target.getAttribute('data-id');
        var indexInPath = this.path.indexOf(id);

        if (indexInPath !== -1) {
            this.path = [].concat(this.path.slice(0, indexInPath), this.path.slice(indexInPath + 1));
        } else {
            this.path.push(id);
        }

        this.draw();
    };

    Graph.prototype.checkPoints = function () {
        this.isMessageShowed = false;

        var path = this.path;
        var n = this.n;
        var isValid = true;

        for (var i = 0; i < n; i++) {
            for (var j = i; j < n - 2 + i; j++) {
                var a = i;
                var b = j + 1 >= n ? j + 1 - n : j + 1;
                var c = j + 2 >= n ? j + 2 - n : j + 2;

                if (a !== b && a !== b && b !== c) {
                    if ((this.processSum(a, b, c) === 3 || this.processSum(a, b, c) === 0) || !data[this.id].isPossible) {
                        isValid = false;
                    }
                }
            }

            for (var k = 1; k <= n - 4; k++) {
                var a = i;
                var b = i + k >= n ? i + k - n : i + k;
                var c = i - k < 0 ? n - k : i - k;

                if ((this.processSum(a, b, c) === 3 || this.processSum(a, b, c) === 0) || !data[this.id].isPossible) {
                    isValid = false;
                }
            }
        }

        if (isValid && this.path.length) {
            this._cb();
        }
    };

    Graph.prototype.checkPoint = function (x, y) {
        var _x = x <= y ? x : y;
        var _y = x <= y ? y : x;

        return this.path.indexOf([_x, _y].join(',')) !== -1;
    };

    Graph.prototype.processSum = function (a, b, c) {
        var sum = this.checkPoint(a, b) + this.checkPoint(a, c) + this.checkPoint(b, c);

        switch(sum) {
            case 0:
                this.showMessage(a, b, c, sum);
                return sum;
            case 1:
            case 2:
                return sum;
            case 3:
            default: {
                this.showMessage(a, b, c, sum);
                return sum;
            }
        }
    };

    Graph.prototype.showMessage = function (a, b, c, sum) {
        if (!this.isMessageShowed) {
            this.isMessageShowed = true;
            this.highlightCircle(a, b, c);

            $modal.find('.modal-body h4').text(errors[sum]);
            $modal.modal('show');
        }
    };

    Graph.prototype.highlightCircle = function (a, b, c) {
        var $a = $(this.targetName + ' circle[data-id=' + a + ']');
        var $b = $(this.targetName + ' circle[data-id=' + b + ']');
        var $c = $(this.targetName + ' circle[data-id=' + c + ']');

        $a.attr('fill') !== '#f00' ? $a.attr('fill', '#f00') : '';
        $b.attr('fill') !== '#f00' ? $b.attr('fill', '#f00') : '';
        $c.attr('fill') !== '#f00' ? $c.attr('fill', '#f00') : '';
    };

    var errors = {
        3: 'You have a clique of size 3.',
        0: 'You have an independent set of size 3'
    };

    var data = {
        0: { circlesCount: 5, isPossible: true },
        1: { circlesCount: 6, isPossible: false }
    };
    var graphs = Object.keys(data).map(Number).reduce(function(result, i) {
        result.push(new Graph(
            '#graph' + (i + 1),
            i,
            data[i].circlesCount,
            function () {
                window.q.successCb(i + 1, Object.keys(data));
            }).init());
        return result;
    }, []);

    $('.check').on('click', function () {
        var id = $(this).data('id') - 1;

        graphs[id].checkPoints();
    });

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;

        graphs[id].init();
    });

    $('.impossible').on('click', function () {
        var id = $(this).data('id') - 1;

        if (!data[id].isPossible) {
            window.q.successCb(id + 1, Object.keys(data));
        } else {
            $('#possible_modal').modal('show');
        }
    });
});
