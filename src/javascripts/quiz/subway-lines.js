var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

$(function () {
    function toRadians (angle) {
        return angle * (Math.PI / 180);
    }
    function shuffle(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
        return a;
    }

    function range(n) {
        return Array.apply(null, new Array(n)).map(function (_, i) { return i });
    }

    function SubwayLibes(selector, parameters) {
        this.panel = $(selector);
        this.width = $(selector).find('.subway-lines-container').width();
        this.scope = new paper.PaperScope();
        var width = this.width;
        this.canvas = $(selector).find('canvas');
        this.canvas[0].width  = this.width;
        this.canvas[0].height = this.width;
        this.scope.setup(this.canvas[0]);
        this.offset = width * .1;
        this.circlesCount = parameters.size;
        this.pairsMissing = parameters.pairsMissing;
        this.rotate = parameters.rotate;
        this.icon = this.scope.project.importSVG(
            $(selector).find('svg').get(0),
            function (icon) {
                this.icon = icon;
                icon.visible = false;
                this.circles = this.placeCircles();
                this.circleLayer = new this.scope.Group(this.circles);
                this.stopBlinking();
            }.bind(this)
        );

        this.subwayLine = null;
        this.lines = [];
        this.activeStyle = {
            fillColor: 'rgb(91, 192, 222)',
        };
        this.inactiveStyle = {
            fillColor: 'black',
        };
        this.blinkAStyle = this.activeStyle;
        this.blinkBStyle = this.inactiveStyle;
        this.blinking = false;

        paper.view.onMouseDown = this.onMouseDown.bind(this);
        paper.view.onMouseUp = this.onMouseUp.bind(this);
        paper.view.onMouseMove = this.onMouseMove.bind(this);

    }

    SubwayLibes.prototype.point = function (center) {
        var words = this.icon.clone();
        words.visible = true;
        words.position = center;
        words.scale(0.15);
        return words;
    };

    SubwayLibes.prototype.placeCircles = function () {
        var center = [this.width / 2, this.width / 2];
        var radius = this.width * .5 / 2;
        var step = 360 / this.circlesCount;
        var circles = [];
        for (var i = 0; i < this.circlesCount; i++) {
            var angle = toRadians(step * ( i+1 ) - this.rotate);
            circles.push(
                this.point([
                    center[0] + radius * Math.cos(angle),
                    center[1] + radius * Math.sin(angle)
                ])
            )
        }
        return circles;
    };

    SubwayLibes.prototype.activateScope = function () {
        this.scope.activate();
    };

    SubwayLibes.prototype.checkHitStation = function checkHitStation(point) {
        for (var i = 0; i < this.circles.length; i++) {
            var circle = this.circles[i];
            if (circle.hitTest(point)) {
                return i;
            }
        }
        return -1;
    };

    SubwayLibes.prototype.removeLine = function removeLine() {
        if (this.subwayLine) {
            this.stopBlinking();
            this.subwayLine.remove();
            this.subwayLine = null;
        }
    };

    SubwayLibes.prototype.applyLine = function applyLine() {
        if (this.subwayLine) {
            this.stopBlinking();
            this.subwayLine.simplify();
            this.lines.push(this.subwayLine);
            this.subwayLine = null;
        }
    };

    SubwayLibes.prototype.createLine = function createLine(stationId) {
        var station = this.circles[stationId];
        station.style = this.activeStyle;
        this.subwayLine = new SubwayLine(stationId, this.width, this.scope, station.position);
    };



    SubwayLibes.prototype.check = function () {
        var edges = this.lines.reduce(function (edges, line) {
            edges[line.getId().join(',')] = true;
            return edges;
        }, {});
        var missing = 0;
        var shuffled = shuffle(range(this.circlesCount));
        for (var i=0; i < this.circlesCount; i++) {
            for (var j=i+1; j < this.circlesCount; j++) {
                var a = shuffled[i];
                var b = shuffled[j];
                if (!edges[[a, b].sort().join(',')]) {
                    if (!missing) {
                        this.blink(this.circles[a]);
                        this.blink(this.circles[b]);
                    }
                    missing++;
                }
            }
        }
        return missing <= this.pairsMissing;
    };

    SubwayLibes.prototype.stopBlinking = function () {
        this.blinking = false;
        this.circles.forEach(function (circle) {
            circle.style = this.inactiveStyle;
        }.bind(this))
    };


    SubwayLibes.prototype.reset = function () {
        this.stopBlinking();
        this.lines.forEach(function (line) {
            line.remove();
        });
        this.lines = [];
    };

    SubwayLibes.prototype.blink = function (circle, blinkCount) {
        blinkCount = blinkCount === undefined ? 11 : blinkCount;
        this.blinking = !!blinkCount;
        if (!this.blinking) {
            circle.style = this.inactiveStyle;
        }
        if (blinkCount % 2) {
            circle.style = this.blinkAStyle;
        } else {
            circle.style = this.blinkBStyle;
        }
        setTimeout(function () {
            if (!this.blinking) {
                this.stopBlinking();
                return;
            }
            this.blink(circle, blinkCount -1)
        }.bind(this), 300);
    };

    SubwayLibes.prototype.onMouseDown = function onMouseDown(event) {
        this.stopBlinking();
        var hitStationId = this.checkHitStation(event.point);
        if (hitStationId >= 0) {
            this.createLine(hitStationId)
        }
        return true;
    };

    SubwayLibes.prototype.onMouseUp = function onMouseUp() {
        this.circleLayer.bringToFront();
        if (this.subwayLine && this.subwayLine.valid()) {
            this.applyLine();
        } else {
            this.removeLine();
        }
        return true;
    };

    SubwayLibes.prototype.onMouseMove = function onMouseMove(event) {

        if (!this.subwayLine) {
            return false;
        }
        var hitStationId = this.checkHitStation(event.point);


        if (!this.subwayLine.valid()) {
            var cross = false;
            for (var i = 0; i < this.lines.length && !cross; i++) {
                var line = this.lines[i];
                if (line.intersects(this.subwayLine)) {
                    cross = true;
                }
            }
            if (cross && this.subwayLine.isStarted()) {
                this.removeLine();
                return;
            }
        }
        if (this.subwayLine.isStarted() && !this.subwayLine.valid()) {
            this.subwayLine.add(event.point);
        }

        if (hitStationId >= 0) {
            var station = this.circles[hitStationId];
            if (this.subwayLine.end(hitStationId, station.position)) {
                station.style = this.activeStyle;
                if (!this.subwayLine.valid()) {
                    this.removeLine();
                }
            }
        } else {
            if (this.subwayLine.valid()) {
                this.removeLine();
            } else {
                this.subwayLine.start();
            }
        }
    };


    function SubwayLine(start, width, scope, startPosition) {
        this.path = new scope.Path({
            strokeColor: 'rgb(91, 192, 222)',
            strokeWidth: Math.min(Math.max(width * .01, 2), 8),
            strokeCap: 'round'
        });
        this.add(startPosition);
        this.startStationId = start;
    }

    SubwayLine.prototype.start = function () {
        this.started = true;
    };

    SubwayLine.prototype.isStarted = function () {
        return this.started;
    };

    SubwayLine.prototype.getId = function () {
        if (this.valid()) {
            return [this.startStationId, this.endStationId].sort();
        }
        return null;
    };

    SubwayLine.prototype.remove = function () {
        this.path.removeSegments();
    };

    SubwayLine.prototype.valid = function () {
        return this.started
            && this.endStationId !== undefined
            && this.startStationId !== this.endStationId;
    };

    SubwayLine.prototype.end = function (stationId, endPosition) {
        if (!this.started) {
            return false
        }
        this.add(endPosition);
        this.endStationId = stationId;
        return true;
    };

    SubwayLine.prototype.simplify = function (stationId) {
        if (this.valid()) {
            this.path.simplify(10);
        }
        return this;
    };

    SubwayLine.prototype.add = function (point) {
        this.path.add(point);
        return this;
    };

    SubwayLine.prototype.intersects = function (subwayLine) {
        var intersects = subwayLine.path.getIntersections(this.path);
        if (intersects.length === 1) {
            var intersect = (intersects[0].point);
            var startA = this.path.getPointAt(0);
            var startB = subwayLine.path.getPointAt(0);
            if (startA.equals(intersect) || startB.equals(intersect)) {
                return false;
            }
        }
        return intersects.length;
    };
    var data = [0, 1, 2];
    var parameters = [
        { size: 4, pairsMissing: 0 , rotate: 0},
        { size: 5, pairsMissing: 0 , rotate: 18},
        { size: 5, pairsMissing: 1 , rotate: 18}
    ];
    var instances = data.map(function (id) {
        var instance = new SubwayLibes('#level' + (id + 1), parameters[id]);
        if (id !== 0) {
            instance.panel.removeClass('active');
        }
        return instance;

    });
    instances[0].activateScope();

    $('.nav-tabs a').click(function () {
        var id = $(this).data('id') - 1;
        if (instances[id]) {
            instances[id].activateScope();
        }
    });

    $('.submit-subway-lines').on('click', function () {
        var id = $(this).data('id') - 1;
        if (instances[id]) {
            if (instances[id].check()) {
                window.q.successCb(id, data);
            };
        }
    });


    $('.impossible-button').click(function (e) {
        if (e.target) {
            var level = e.target.getAttribute('data-id') - 1;
            if (level == 1) {
                window.q.successCb(level, data);
            }
        }
    });

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;
        if (instances[id]) {
            instances[id].reset();
        }
    });
});
