var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/hamiltonian-cycle.styl');
var core = require('../core');

$(function () {
    var HamiltonianGraph = function (targetName, index, pointsForLevel, cb) {
        pointsForLevel = pointsForLevel || {
            points: [],
            ways: {},
            offset: [],
            step: [],
            type: ''
        };

        this.MAX_DIMENSION = 600;
        this.MAX_RADIUS = 260;
        this.POINT_RADIUS = 15;

        this.successNumber = pointsForLevel.points.reduce(function (sum, count) { return sum + count; }, 0);
        this.levels = pointsForLevel.points;
        this.ways = pointsForLevel.ways;
        this.offsets = pointsForLevel.offset;
        this.diffRadius = pointsForLevel.step;
        this.type = pointsForLevel.type;

        this.angles = [];
        this.n = [];
        this.radius = [];
        this.calculateAngles();

        this._cb = cb || function () {};
        this._targetName = targetName;
        this._id = index;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + this.MAX_DIMENSION + ' ' + this.MAX_DIMENSION });
    };

    HamiltonianGraph.prototype.calculateAngles = function () {
        if (this.levels.length) {
            (this.levels || []).forEach(function (dots, i) {
                this.angles[i] = (360 / dots) * (Math.PI / 180);
                this.n[i] = dots;
                this.radius[i] = this.MAX_RADIUS - this.diffRadius[i] * i;
            }.bind(this));
        }
    };

    HamiltonianGraph.prototype.init = function () {
        this.circles = {};
        this.vertices;
        this.path = [];

        this.draw();

        return this;
    };

    HamiltonianGraph.prototype.drawCircles = function (isDummy) {
        if (this.circleGroup) {
            this.circleGroup.remove();
        }

        if (this.levels && this.levels.length) {
            this.circleGroup = this.snap.g().attr({ id: 'circles' });

            for (var i = 0; i < this.levels.length; i++) {
                for (var j = 0; j < this.levels[i]; j++) {
                    var x = Math.cos(j * this.angles[i] + this.offsets[i]) * (this.MAX_RADIUS - this.diffRadius[i] * i) + this.MAX_DIMENSION / 2;
                    var y = Math.sin(j * this.angles[i] + this.offsets[i]) * (this.MAX_RADIUS - this.diffRadius[i] * i) + this.MAX_DIMENSION / 2;
                    var id = i + '' + j;

                    var circle = this.snap
                        .circle(x, y, this.POINT_RADIUS)
                        .attr({ 'data-id': id, class: 'circle' })
                        .mousedown(isDummy ? function () {} : this._handleCircleClick.bind(this));

                    this.circles[id] = circle;
                    this.circleGroup.add(circle);
                }
            }
        }

        return this;
    };

    HamiltonianGraph.prototype._handleCircleClick = function (event) {
        event.preventDefault();

        var id = event.target.getAttribute('data-id');

        var isFirstPoint = !this.path.length;
        var isPossibleWayFromPoint = !isFirstPoint && Object.keys(this.ways).length &&
            this.ways[this.path[this.path.length - 1]].indexOf(id) !== -1 &&
            this.path.indexOf(id) === -1;
        var isClosingPoint = this.type === 'cycle' &&
            this.path.length === this.successNumber &&
            this.path.indexOf(id) === 0 &&
            this.ways[this.path[this.path.length - 1]].indexOf(id) !== -1;
        var isUndo = this.path.length && this.path[this.path.length - 1] === id;

        if (isFirstPoint || isPossibleWayFromPoint || isClosingPoint || isUndo) {
            if (this.path.indexOf(id) !== -1) {
                if (this.path.indexOf(id) === this.path.length - 1) {
                    this._spliceVertex();
                } else if (this.type === 'cycle') {
                    if (this.path.length === this.successNumber) {
                        if (this.path.indexOf(id) === 0) {
                            this._addVertex(id);

                            this._cb(this._id);
                        }
                    } else {
                        this._addVertex(id);
                    }
                }
            } else {
                this._addVertex(id);

                if (this.type === 'path') {
                    if (this.path.length === this.successNumber) {
                        this._cb(this._id);
                    }
                }
            }
        }
    };

    HamiltonianGraph.prototype._spliceVertex = function () {
        this.path.splice(this.path.length - 1);

        this.draw();
    };

    HamiltonianGraph.prototype._addVertex = function (id) {
        this.path.push(id);

        this.draw();
    }

    HamiltonianGraph.prototype.draw = function () {
        this.drawCircles(true);
        this.drawBackVerticles();
        this.drawVertices();
        this.drawCircles();
        this.drawActive();
        this.drawWeights();
    }

    HamiltonianGraph.prototype.drawWeights = function () {
        if (this.textGroup) {
            this.textGroup.remove();
        }

        if (this.path.length) {
            this.textGroup = this.snap.g().attr({ id: 'weights' });

            this.path.forEach(function (id, i) {
                var x = Number(this.circles[id].attr('cx'));
                var y = Number(this.circles[id].attr('cy'));

                var text = this.snap
                    .text((x - 4), (y + 5), i + 1)
                    .attr({ 'font-size': 15, 'fill': '#fff' });

                this.textGroup.add(text);
            }.bind(this));
        }
    }

    HamiltonianGraph.prototype.drawBackVerticles = function () {
        if (this.backVerticlesGroup) {
            this.backVerticlesGroup.remove();
        }

        if (this.ways && Object.keys(this.ways).length) {
            this.backVerticlesGroup = this.snap.g().attr({ id: 'back-verticles' });

            var a = Object.keys(this.ways);

            a.forEach(function (i) {
                var x1 = this.circles[i].attr('cx');
                var y1 = this.circles[i].attr('cy');

                if (this.ways[i] && this.ways[i].length) {
                    this.ways[i].forEach(function (j) {
                        var x2 = this.circles[j].attr('cx');
                        var y2 = this.circles[j].attr('cy');

                        this.backVerticlesGroup.add(this.snap
                            .path('M' + [x1, y1, x2, y2].toString())
                            .attr({
                                stroke: '#f0f0f0',
                                'stroke-width': '5',
                                fill: 'none'
                            })
                        );
                    }.bind(this));
                }
            }.bind(this));
        }

        return this;
    }

    HamiltonianGraph.prototype.drawActive = function () {
        var lastCircle = this.circles[this.path[this.path.length - 1]];

        Object.keys(this.circles).forEach(function (key) {
            this.circles[key].removeClass('active');
        }.bind(this));

        lastCircle && lastCircle.addClass('active');
    };

    HamiltonianGraph.prototype.drawVertices = function () {
        var path = [];
        var firstIndex = String((Object.keys(this.circles) || [])[0]);

        if (this.path.length > 1) {
            this.path.forEach(function (key) {
                var x = this.circles[key].attr('cx');
                var y = this.circles[key].attr('cy');

                path.push(x, y);
            }.bind(this));

            if (this.vertices) {
                this.vertices.remove();
            }

             this.vertices = this.snap
                .path('M' + path.toString())
                .attr({
                    stroke: '#5bc0de',
                    'stroke-width': '5',
                    fill: 'none'
                });
        }
    };

    var levels = [0, 1, 2];
    var dataForLevels = {
        0: {
            points: [5, 10, 5],
            ways: {
                '00': ['04', '01', '10'],
                '01': ['00', '02', '12'],
                '02': ['01', '03', '14'],
                '03': ['02', '04', '16'],
                '04': ['03', '00', '18'],
                '10': ['11', '19', '00'],
                '11': ['10', '12', '20'],
                '12': ['11', '13', '01'],
                '13': ['12', '14', '21'],
                '14': ['13', '15', '02'],
                '15': ['14', '16', '22'],
                '16': ['15', '17', '03'],
                '17': ['16', '18', '23'],
                '18': ['17', '19', '04'],
                '19': ['18', '10', '24'],
                '20': ['21', '24', '11'],
                '21': ['20', '22', '13'],
                '22': ['21', '23', '15'],
                '23': ['22', '24', '17'],
                '24': ['23', '20', '19']
            },
            offset: [-.32, -.32, .32],
            step: [100, 100, 90],
            type: 'cycle'
        },
        1: {
            points: [5, 5],
            ways: {
                '00': ['04', '01', '10'],
                '01': ['00', '02', '11'],
                '02': ['01', '03', '12'],
                '03': ['02', '04', '13'],
                '04': ['03', '00', '14'],
                '10': ['00', '12', '13'],
                '11': ['01', '13', '14'],
                '12': ['02', '10', '14'],
                '13': ['03', '10', '11'],
                '14': ['04', '11', '12']
            },
            offset: [-.32, -.32],
            step: [140, 140],
            type: 'cycle'
        },
        2: {
            points: [5, 5],
            ways: {
                '00': ['04', '01', '10'],
                '01': ['00', '02', '11'],
                '02': ['01', '03', '12'],
                '03': ['02', '04', '13'],
                '04': ['03', '00', '14'],
                '10': ['00', '12', '13'],
                '11': ['01', '13', '14'],
                '12': ['02', '10', '14'],
                '13': ['03', '10', '11'],
                '14': ['04', '11', '12']
            },
            offset: [-.32, -.32],
            step: [140, 140],
            type: 'path'
        }
    };
    var graphs = levels.reduce(function(result, item, i) {
        result.push(new HamiltonianGraph(
            '#graph' + (i + 1),
            item,
            dataForLevels[item],
            function () {
                window.q.successCb(i + 1, levels);
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

            if (level == 2) {
                window.q.successCb(level, levels);
            }
        }
    });
});
