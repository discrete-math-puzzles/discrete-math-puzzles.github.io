var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/road-repair.styl');
var core = require('../core');

$(function () {
    var RoadRepair = function (targetName, index, data, cb) {
        this.data = data || {
            circles: {},
            weights: {},
            success: 0
        };

        this.initVars();

        this.RADIUS = 15;
        this.MAX_DIMENSION = this.points.reduce(function (max, current) {
            if (max < this.circles[current][0]) {
                max = this.circles[current][0];
            }
            if (max < this.circles[current][1]) {
                max = this.circles[current][1];
            }
            return max;
        }.bind(this), -1);

        this._cb = cb || function () {};
        this._targetName = targetName;
        this._id = index;

        this.snap = Snap(targetName).attr({ viewBox: '0 0 ' + (this.MAX_DIMENSION + 2 * this.RADIUS) + ' ' + (this.MAX_DIMENSION + 2 * this.RADIUS) });

        return this;
    };

    RoadRepair.prototype.initVars = function () {
        this._nodes = [];
        this._vertices = [];

        this.circles = this.data.circles;
        this.weights = this.data.weights;
        this.success = this.data.success;
        this.points = Object.keys(this.circles);
        this.backPath = Object.keys(this.weights)
        this.path = [];

        return this;
    };

    RoadRepair.prototype.init = function () {
        this.initVars();
        this.draw();

        return this;
    };

    RoadRepair.prototype.draw = function () {
        this.drawBackVertices();
        this.drawVertices();
        this.drawCircles();
        this.drawWeights();

        return this;
    };

    RoadRepair.prototype.drawCircles = function () {
        if (this.circleGroup) {
            this.circleGroup.remove();
        }

        this.circleGroup = this.snap.g().attr({ id: 'circles' });

        this.points.forEach(function (point, i) {
            var coords = this.circles[point];

            var circle = this.snap
                .circle(coords[0], coords[1], this.RADIUS)
                .attr({ 'data-id': point, class: 'circle' });

            this._nodes[i] = circle;
            this.circleGroup.add(circle);
        }.bind(this));

        return this;
    };

    RoadRepair.prototype.drawWeights = function () {
        if (this.textGroup) {
            this.textGroup.remove();
        }

        if (this.points.length) {
            this.textGroup = this.snap.g().attr({ id: 'weights' });

            this.points.forEach(function (point, i) {
                var coords = this.circles[point];

                var text = this.snap
                    .text((coords[0] - 4), (coords[1] + 5), point)
                    .attr({ 'font-size': 15, 'fill': '#fff' });

                this.textGroup.add(text);
            }.bind(this));
        }

        return this;
    };

    RoadRepair.prototype.drawBackVertices = function () {
        if (this.backVerticesGroup) {
            this.backVerticesGroup.remove();
        }
        if (this.backVerticesText) {
            this.backVerticesText.remove();
        }

        if (this.backPath.length) {
            this.backVerticesGroup = this.snap.g().attr({ id: 'vertices' });
            this.backVerticesText = this.snap.g().attr({ id: 'vertices-text' });

            this.backPath.forEach(function (p, i) {
                var A = p[0];
                var B = p[1];
                var coordsA = this.circles[A];
                var coordsB = this.circles[B];

                this.backVerticesGroup.add(this.snap
                    .path('M' + [coordsA[0], coordsA[1], coordsB[0], coordsB[1]].toString())
                    .attr({
                        'data-id': p,
                        stroke: '#f0f0f0',
                        'stroke-width': '5',
                        fill: 'none'
                    })
                    .mousedown(this.handleBackVerticeClick.bind(this))
                );

                this.backVerticesText.add(this.snap
                    .text((coordsA[0] + (coordsA[0] + coordsB[0]) / 2) / 2, (coordsA[1] + (coordsA[1] + coordsB[1]) / 2) / 2, this.weights[p])
                    .attr({ 'font-size': 15, color: '#f0f0f0' })
                );
            }.bind(this));
        }

        return this;
    };

    RoadRepair.prototype.drawVertices = function () {
        if (this.verticesGroup) {
            this.verticesGroup.remove();
        }
        if (this.verticesText) {
            this.verticesText.remove();
        }

        if (this.path.length) {
            this.verticesGroup = this.snap.g().attr({ id: 'vertices' });
            this.verticesText = this.snap.g().attr({ id: 'vertices-text' });

            this.path.forEach(function (p, i) {
                var A = p[0];
                var B = p[1];
                var coordsA = this.circles[A];
                var coordsB = this.circles[B];

                this.verticesGroup.add(this.snap
                    .path('M' + [coordsA[0], coordsA[1], coordsB[0], coordsB[1]].toString())
                    .attr({
                        'data-id': p,
                        stroke: '#5bc0de',
                        'stroke-width': '5',
                        fill: 'none'
                    })
                    .mousedown(this.handleVerticeClick.bind(this))
                );

                this.verticesText.add(this.snap
                    .text((coordsA[0] + (coordsA[0] + coordsB[0]) / 2) / 2, (coordsA[1] + (coordsA[1] + coordsB[1]) / 2) / 2, this.weights[p])
                    .attr({ 'font-size': 15 })
                );
            }.bind(this));
        }

        return this;
    };

    RoadRepair.prototype.handleVerticeClick = function (e) {
        e.preventDefault();

        var id = e.target.getAttribute('data-id');
        var index = this.path.indexOf(id);

        if (index !== -1) {
            this.path = [].concat(this.path.slice(0, index), this.path.slice(index + 1));
            this.draw();
        }
    };

    RoadRepair.prototype.handleBackVerticeClick = function (e) {
        e.preventDefault();

        var id = e.target.getAttribute('data-id');

        this.path.push(id);
        this.draw();
    };

    RoadRepair.prototype.checkValid = function (e) {
        var $modal = $('.road-repair__modal');
        var result = {};

        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            var path = this.path.join('');

            for (var j = 0; j < path.length; j++) {
                if (path[j] === point) {
                    if (result[path[j]]) {
                        result[path[j]] += 1;
                    } else {
                        result[path[j]] = 1;
                    }
                }
            }
        }

        var isValid = 1; //valid

        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];

            if (!result[point] || result[point] < 1) {
                isValid = -2;
            }

            if (result[point] === 1) {
                var section = this.path.filter(function(p) { return p.indexOf(point) !== -1; })[0];
                if (result[section[0]] === 1 && result[section[1]] === 1) {
                    isValid = -2;
                }
            }
        }

        if (isValid > 0) {
            var sum = this.path.reduce(function (result, segment) {
                return result + this.weights[segment];
            }.bind(this), 0);

            if (sum === this.success) {
                this._cb();
            } else {
                $modal.find('.modal-body h4').text(errors.cheaper);
                $modal.modal('show');
            }
        } else if (isValid === -1) {
            $modal.find('.modal-body h4').text(errors.cheaper);
            $modal.modal('show');
        } else {
            $modal.find('.modal-body h4').text(errors.empty);
            $modal.modal('show');
        }
    };

    var levels = [0, 1, 2];
    var dataForLevels = {
        0: {
            circles: {
                A: [30, 300],
                B: [30, 30],
                C: [300, 30],
                D: [300, 300]
            },
            weights: {
                'AC': 2,
                'AB': 3,
                'AD': 2,
                'CD': 3,
                'BC': 1,
                'BD': 3
            },
            success: 5
        },
        1: {
            circles: {
                A: [30, 300],
                B: [180, 30],
                C: [330, 300],
                D: [180, 180],
                E: [180, 120],
                F: [130, 235],
                G: [230, 235]
            },
            weights: {
                'AB': 3,
                'AE': 5,
                'AG': 4,
                'AC': 1,
                'CF': 2,
                'CE': 5,
                'CB': 3,
                'FD': 4,
                'FB': 2,
                'DE': 2,
                'DG': 4,
                'GB': 2
            },
            success: 13
        },
        2: {
            circles: {
                A: [30, 165],
                B: [145, 30],
                C: [365, 30],
                D: [500, 165],
                E: [365, 300],
                F: [145, 300],
                G: [255, 165]
            },
            weights: {
                'AB': 3,
                'AF': 4,
                'BC': 3,
                'BG': 1,
                'FG': 3,
                'FE': 4,
                'GE': 7,
                'GC': 2,
                'CE': 5,
                'CD': 5,
                'ED': 4
            },
            success: 17
        },
    };
    var errors = {
        cheaper: 'Try to find a cheaper way!',
        empty: 'Not all pairs of cities are connected'
    };

    var graphs = levels.reduce(function(result, item, i) {
        result.push(new RoadRepair(
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

    $('.check').on('click', function() {
        var id = $(this).data('id') - 1;
        graphs[id].checkValid();
    });

    $('.impossible').on('click', function() {
        $('#possible_modal').modal('show');
    });
});
