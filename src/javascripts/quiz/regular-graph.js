var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/regular-graph.styl');
var core = require('../core');

$(function () {
    var Graph = function (targetName, count, cb) {
        this.maxDimension = 600;
        this.radius = 260;
        this.circleRadius = 40;
        this.successNumber = 5;

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
        this.current = '';

        this.drawCircles();
        this.drawCounters();
        this.drawVertices();

        return this;
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
                .attr({ 'data-id': i, class: 'circle' })
                .mousedown(this._handleCircleClick.bind(this));

            this.circles.push(circle);
            this.circleGroup.add(circle);
        }

        return this;
    };

    Graph.prototype.drawCounters = function () {
        if (this.countersGroup) {
            this.countersGroup.remove();
        }

        this.countersGroup = this.snap.g().attr({ id: 'counters' });

        for (var i = 0; i < this.n; i++) {
            var text = this.counters[i].toString();
            var x = Math.cos(i * this.angle) * this.radius + this.maxDimension / 2 - 10;
            var y = Math.sin(i * this.angle) * this.radius + this.maxDimension / 2 + 12;
            var text = this.snap
                .text(x, y, this.counters[i].toString())
                .attr({ 'font-size': 35, 'fill': '#fff' });

            this.countersGroup.add(text);
        }

        return this;
    };

    Graph.prototype.drawVertices = function () {
        if (this.verticesGroup) {
            this.verticesGroup.remove();
        }

        this.verticesGroup = this.snap.g().prependTo(this.snap).attr({ id: 'vertices' });

        this.vertices.forEach(function(vertice) {
            var ids = vertice.split(',');
            var line = this.snap
                .line(
                    this.circles[ids[0]].getBBox().cx,
                    this.circles[ids[0]].getBBox().cy,
                    this.circles[ids[1]].getBBox().cx,
                    this.circles[ids[1]].getBBox().cy)
                .attr({
                    stroke: '#5bc0de',
                    strokeWidth: '7',
                    class: 'cirle'
                });

            this.verticesGroup.add(line);
        }, this);

        return this;
    };

    Graph.prototype._handleCircleClick = function (event) {
        event.preventDefault();

        var id = event.target.getAttribute('data-id');

        $(this._targetName + ' .circle').removeClass('active');

        if (!this.vertices.length && this.current === id) {
            this.current = '';

            return this;
        }

        if (this.current && this.current !== id) {
            var vertice = this.current + ',' + id;
            var reversedVertice = id + ',' + this.current;
            var indexOfVertice = this.vertices.indexOf(vertice);
            var indexofReversedVertice = this.vertices.indexOf(reversedVertice);

            if (indexOfVertice === -1 && indexofReversedVertice === -1) {
                this.vertices.push(vertice);
                this.changeCounters('+', this.current, id);
            } else {
                if (indexOfVertice !== -1) {
                    this.vertices = (
                        this.vertices.slice(0, indexOfVertice) || []).concat(this.vertices.slice(indexOfVertice + 1)
                    );
                } else {
                    this.vertices = (
                        this.vertices.slice(0, indexofReversedVertice) || []).concat(this.vertices.slice(indexofReversedVertice + 1)
                    );
                }
                this.changeCounters('-', this.current, id);
            }

            this.drawVertices();
            this.drawCounters();

            this.current = '';
        } else {
            this.current = id;
            $(event.target).addClass('active');
        }
    };

    Graph.prototype.changeCounters = function(type, current, id) {
        if (type === '+') {
            this.counters[current]++;
            this.counters[id]++;
        } else {
            this.counters[current]--;
            this.counters[id]--;
        }

        this.checkOnSuccess();
    };

    Graph.prototype.checkOnSuccess = function() {
        var isOk = this.counters.reduce(function(result, counter) {
            return result + (Number(counter) === this.successNumber);
        }.bind(this), 0) === this.counters.length;

        if (isOk) {
            this._cb(this.n);
        }
    };

    var circlesCount = [10, 9];
    var graphs = circlesCount.reduce(function(result, item, i) {
        result.push(new Graph(
            '#graph' + (i + 1),
            item,
            function () {
                window.q.successCb(i + 1, circlesCount);
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;
        graphs[id].init();
    });

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            var level = e.relatedTarget.getAttribute('data-id');
            if (level > 1) {
                window.q.successCb(level, circlesCount);
            }
        }
    });
});
