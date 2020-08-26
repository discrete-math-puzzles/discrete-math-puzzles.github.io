var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/antivirus-system.styl');
var core = require('../core');

import computer from '../../images/computer.png';

$(function () {
    var $modal = $('.antivirus-system__modal');

    var AntivirusSystem = function (targetName, index, data, cb) {
        this.data = data || {
            circles: {},
            vertices: [],
            success: []
        };

        this.initVars();

        this.COMPUTER_SIZE = 30;
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

        this.snap = Snap(targetName).attr({
            viewBox: '0 0 ' + (this.MAX_DIMENSION + 2 * this.COMPUTER_SIZE) + ' ' + (this.MAX_DIMENSION + 2 * this.COMPUTER_SIZE) });

        return this;
    };

    AntivirusSystem.prototype.initVars = function () {
        this._nodes = [];
        this._vertices = [];

        this.circles = this.data.circles;
        this.points = Object.keys(this.circles);

        this.vertices = this.data.vertices;
        this.success = this.data.success;

        this.path = [];

        return this;
    };

    AntivirusSystem.prototype.init = function () {
        this.initVars();
        this.draw();

        return this;
    };

    AntivirusSystem.prototype.draw = function () {
        this.drawVertices();
        this.drawCircles();

        return this;
    };

    AntivirusSystem.prototype.drawCircles = function () {
        if (this.circleGroup) {
            this.circleGroup.remove();
        }

        if (this.backGroup) {
            this.backGroup.remove();
        }

        this.backGroup = this.snap.g().attr({ id: 'back' });
        this.circleGroup = this.snap.g().attr({ id: 'circles' });

        this.points.forEach(function (point, i) {
            var coords = this.circles[point];

            var back = this.snap
                .circle(coords[0], coords[1], this.COMPUTER_SIZE / 2 + 2)
                .attr({
                    fill: '#fff',
                    stroke: this.path.indexOf(point) !== -1 ? '#000' : '#fff',
                    'stroke-width': '2',
                });

            var circle = this.snap
                .image(
                    '/images/computer.png',
                    coords[0] - this.COMPUTER_SIZE / 2,
                    coords[1]  - this.COMPUTER_SIZE / 2,
                    this.COMPUTER_SIZE, this.COMPUTER_SIZE
                )
                .attr({ 'data-id': point, class: 'circle' })
                .mousedown(this.handleCircleClick.bind(this));

            this._nodes[i] = circle;
            this.circleGroup.add(circle);
            this.backGroup.add(back);
        }.bind(this));

        return this;
    };

    AntivirusSystem.prototype.handleCircleClick = function (e) {
        e.preventDefault;

        var id = e.target.getAttribute('data-id');
        var index = this.path.indexOf(id);

        if (index !== -1) {
            this.path = [].concat(this.path.slice(0, index), this.path.slice(index + 1));
        } else {
            this.path.push(id);
        }

        this.draw();
    } ;

    AntivirusSystem.prototype.drawVertices = function () {
        if (this.verticesGroup) {
            this.verticesGroup.remove();
        }

        if (this.vertices.length) {
            this.verticesGroup = this.snap.g().attr({ id: 'vertices' });

            this.vertices.forEach(function (p, i) {
                var A = p[0];
                var B = p[1];
                var coordsA = this.circles[A];
                var coordsB = this.circles[B];

                this.verticesGroup.add(this.snap
                    .path('M' + [coordsA[0], coordsA[1], coordsB[0], coordsB[1]].toString())
                    .attr({
                        'data-id': p,
                        stroke: '#000',
                        'stroke-width': '2',
                        fill: 'none'
                    })
                );
            }.bind(this));
        }

        return this;
    };

    AntivirusSystem.prototype.handleVerticeClick = function (e) {
        e.preventDefault();

        var id = e.target.getAttribute('data-id');
        var index = this.path.indexOf(id);

        if (index !== -1) {
            this.path = [].concat(this.path.slice(0, index), this.path.slice(index + 1));
        } else {
            this.path.push(id);
        }

        this.draw();
    };

    AntivirusSystem.prototype.checkValid = function (e) {
        var sortedPath = this.path.sort().join('');
        var currentVertices = this.vertices.concat();

        this.path.forEach(function (point) {
            currentVertices = currentVertices.map(function (vertex) {
                if (vertex.indexOf(point) === -1) {
                    return vertex;
                }

                return false;
            }).filter(Boolean);
        });

        if (currentVertices.length) {
            $modal.find('.modal-body h4').text(errors.empty);
            $modal.modal('show');

            currentVertices.forEach(function (vertex) {
                debugger;
                $(this._targetName + ' path[data-id=' + vertex + ']').attr('stroke', '#f00');
            }, this);
        } else {
            if (this.path.length === this.success) {
                this._cb();
            } else {
                $modal.find('.modal-body h4').text(errors.cheaper);
                $modal.modal('show');
            }
        }
    };

    var levels = [0, 1, 2];
    var dataForLevels = {
        0: {
            circles: {
                A: [30, 300],
                B: [180, 30],
                C: [330, 300],
                D: [180, 180],
                E: [180, 120],
                F: [130, 235],
                G: [230, 235]
            },
            vertices: ['AB', 'AE', 'AG', 'AC', 'CF', 'CE', 'CB', 'FD', 'FB', 'DE', 'DG', 'GB'],
            success: 4
        },
        1: {
            circles: {
                A: [30, 180],
                B: [120, 30],
                C: [120, 330],
                D: [280, 180],
                E: [350, 30],
                F: [350, 330],
                G: [430, 180],
            },
            vertices: ['BC', 'EF', 'EG', 'DF', 'AB', 'AC', 'AD', 'DG', 'CE'],
            success: 4
        },
        2: {
            circles: {
                A: [547, 218],
                B: [454, 509],
                C: [148, 511],
                D: [52, 221],
                E: [298, 40],
                F: [414, 262],
                G: [371, 397],
                H: [230, 397],
                I: [185, 263],
                J: [299, 180]
            },
            vertices: ['DC', 'CB', 'BA', 'AE', 'DE', 'CH', 'DI', 'EJ', 'AF', 'BG', 'JH', 'JG', 'IF', 'IG', 'FH'],
            success: 6
        }
    };
    var errors = {
        empty: 'Some network connection is not covered.',
        cheaper: 'Try to find a smaller set of computers!'
    };

    var graphs = levels.reduce(function(result, item, i) {
        result.push(new AntivirusSystem(
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
