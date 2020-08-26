var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/bridges.styl');
var core = require('../core');

$(function () {
    var DESTINATION_RADIUS = 30;
    var destinations = {
        A: { x: 400, y: 70 },
        B: { x: 250, y: 160 },
        C: { x: 500, y: 350 },
        D: { x: 200, y: 400 },
    };
    var pathsData = {
        1: {
            bridges: {
                1: { data: ['319',  '524', '22', '68', '8'], translate: 'translate(330.791354, 558.381080) rotate(26.000000) translate(-330.791354, -558.381080)', destinations: ['C', 'D'] },
                2: { data: ['61.5', '158', '22', '55', '8'], translate: 'translate(72.500053, 185.376397) rotate(25.000000) translate(-72.500053, -185.376397)', destinations: ['B', 'D'] },
                3: { data: ['159',  '52',  '22', '44', '8'], translate: 'translate(169.666982, 74.116028) rotate(59.000000) translate(-169.666982, -74.116028)', destinations: ['A', 'B'] },
                4: { data: ['242',  '171', '22', '44', '8'], translate: 'translate(253.259516, 193.362648) rotate(105.000000) translate(-253.259516, -193.362648)', destinations: ['B', 'C'] },
                5: { data: ['252',  '96',  '22', '50', '8'], translate: 'translate(263.934043, 121.463836) rotate(170.000000) translate(-263.934043, -121.463836)', destinations: ['A', 'C'] },
                6: { data: ['10',   '140', '22', '54', '8'], translate: 'translate(21.500053, 167.376397) rotate(25.000000) translate(-21.500053, -167.376397)', destinations: ['B', 'D'] },
                7: { data: ['80',   '3',   '22', '38', '8'], translate: 'translate(91.138656, 22.584937) rotate(25.000000) translate(-91.138656, -22.584937)', destinations: ['A', 'B'] }
            },
            paths: {
                'CD1': { to: [[500,350],[500,385],[480,385],[480,380],[455,380],[455,395],[437,395],[436,420],[473,570],[450,625],[380,572],[360,563],[200,560],[224,430],[200,400]] },
                'BD2': { to: [[250,160],[232,180],[222,200],[195,253],[210,258],[175,400]] },
                'BD6': { to: [[250,160],[233,180],[226,193],[173,175],[146,236],[195,253],[210,258],[175,400]] },
                'AB3': { to: [[400,70],[410,90],[313,48],[296,80],[330,100],[286,130],[278,150],[250,160]] },
                'AB7': { to: [[400,70],[410,90],[313,48],[300,74],[239,42],[195,133],[250,160]] },
                'AC5': { to: [[400,70],[400,90],[383,125],[390,140],[400,140],[430,300],[442,322],[500,315],[500,350]] },
                'CB4': { to: [[500,350],[500,315],[442,322],[430,300],[420,242],[360,223],[290,190],[250,160]] }
            }
        },
        2: {
            bridges: {
                1: { data: ['319',  '524', '22', '68', '8'], translate: 'translate(330.791354, 558.381080) rotate(26.000000) translate(-330.791354, -558.381080)', destinations: ['C', 'D'] },
                2: { data: ['459',  '52',  '22', '64', '8'], translate: 'translate(269.666982, 74.116028) rotate(90) translate(-169.666982, -74.116028)', destinations: ['C', 'D'] },
                3: { data: ['242',  '171', '22', '44', '8'], translate: 'translate(253.259516, 193.362648) rotate(105.000000) translate(-253.259516, -193.362648)', destinations: ['B', 'C'] },
                4: { data: ['252',  '96',  '22', '50', '8'], translate: 'translate(263.934043, 121.463836) rotate(170.000000) translate(-263.934043, -121.463836)', destinations: ['A', 'C'] },
                5: { data: ['10',   '140', '22', '54', '8'], translate: 'translate(21.500053, 167.376397) rotate(25.000000) translate(-21.500053, -167.376397)', destinations: ['B', 'D'] },
                6: { data: ['80',   '3',   '22', '38', '8'], translate: 'translate(91.138656, 22.584937) rotate(25.000000) translate(-91.138656, -22.584937)', destinations: ['A', 'B'] }
            },
            paths: {
                'CD1': { to: [[500,350],[500,385],[480,385],[480,380],[455,380],[455,395],[437,395],[436,420],[473,570],[450,625],[380,572],[360,563],[200,560],[224,430],[200,400]] },
                'CD2': { to: [[500,350],[437,350],[433,415],[200,400]] },
                'BD5': { to: [[250,160],[233,180],[226,193],[173,175],[146,236],[195,253],[210,258],[175,400]] },
                'AB6': { to: [[400,70],[410,90],[313,48],[300,74],[239,42],[180,150],[250,160]] },
                'AC4': { to: [[400,70],[400,90],[383,125],[390,140],[400,140],[430,300],[442,322],[500,315],[500,350]] },
                'CB3': { to: [[500,350],[500,315],[442,322],[430,300],[420,242],[360,223],[290,190],[250,160]] }
            }
        }
    };

    var Bridge = function (targetName, id, cb) {
        this.snap = Snap(targetName).attr({ viewBox: '0 0 544 646' });
        this.snap.image('bridge' + id + '.svg', 0, 0, 544, 646);
        this._id = id;
        this._cb = cb;

        this.flush();
    };

    Bridge.prototype.init = function () {
        this.current;
        this.path = [];

        this.data = pathsData[this._id] || {};
        this._g && this._g.remove();
        this._gp && this._gp.remove();
        this._gp = {};
        this._g = {};
        this._p = {};
        this._currentDestination = undefined;
        this.destinations = undefined;
        this._destinationsGroup = undefined;
    };

    Bridge.prototype.draw = function (cb) {
        this._addBridges();
        this._addPaths();
        this._addDestinations();

        return this;
    };

    Bridge.prototype._addDestinations = function () {
        this.destinations = {};
        this._destinationsGroup = this.snap.g().attr({ id: 'destinations' });

        Object.keys(destinations).forEach(function (key) {
            var destination = destinations[key];
            var circle = this.snap
                .circle(destination.x, destination.y, DESTINATION_RADIUS)
                .attr({
                    fill: '#fff',
                    stroke: '#2771FF',
                    'stroke-width': 2,
                    destinationId: key
                })
                .mousedown(function (event) {
                    event.preventDefault();

                    var destinationId = event.target.getAttribute('destinationId');

                    if (!this._currentDestination) {
                        this.destinations[destinationId].attr({ fill: '#2771FF' });

                        this._currentDestination = destinationId;
                    }
                }.bind(this));

            var text = this.snap
                .text(destination.x - 11, destination.y + 12, key)
                .attr({ 'font-size': 35, 'fill': '#ccc' });

            this.destinations[key] = circle;
            this._destinationsGroup.add(circle, text);
        }.bind(this));

        return this;
    };

    Bridge.prototype._addBridges = function () {
        var bridges = this.data.bridges || {};

        this._b = {};

        Object.keys(bridges).forEach(function (key) {
            var data = bridges[key].data;
            var translate = bridges[key].translate;

            this._b[key] = this.snap
                .rect(data[0], data[1], data[2], data[3], data[4])
                .attr({
                    transform: translate,
                    targetId: key
                })
                .mousedown(function (event) {
                    event.preventDefault();

                    var targetId = event.target.getAttribute('targetId');
                    var destinations = bridges[key].destinations;

                    if (destinations.indexOf(this._currentDestination) !== -1 && (this.path && this.path.indexOf(targetId) === -1) || !this.path) {
                        this.path.push(targetId);
                        var previousDestination = this._currentDestination;
                        this._currentDestination = destinations[0] !== this._currentDestination ? destinations[0] : destinations[1];

                        // change colors of active position
                        this.destinations[previousDestination].attr({ fill: '#fff' });
                        this.destinations[this._currentDestination].attr({ fill: '#2771FF' });
                        this._b[targetId].attr({ fill: '#2771FF' });

                        // draw line
                        this.triggerRenderPath([previousDestination, this._currentDestination, targetId].join(''));

                        if (this.path.length === 6 && this.path.reduce(function(r, a) { return r + Number(a);}, 0) === 21 && this._id === 2) {
                            this._cb(this._id);
                        }
                    }
                }.bind(this))
        }.bind(this));

        this._g = this.snap.g().attr({
            transform: 'translate(137, 39)',
            stroke: '#2771FF',
            'stroke-width': '2',
            fill: '#40a738'
        });

        Object.keys(this._b).forEach(function (b) {
            this._g.add(this._b[b]);
        }.bind(this));
    };

    Bridge.prototype._addPaths = function () {
        var paths = this.data.paths || {};

        this._p = {};

        Object.keys(paths).forEach(function (key) {
            var data = paths[key] || {};

            if (data && data.to) {
                this._p[key] = this.snap.path('M0,0').attr({
                    targetPath: 'M' + data.to.toString(),
                    targetId: key
                });

                var reversedKey = key.concat().split('').splice(0,2).reverse().join('') + key[2];

                this._p[reversedKey] = this.snap.path('M0,0').attr({
                    targetPath: 'M' + data.to.concat().reverse().toString(),
                    targetId: reversedKey
                });
            }
        }.bind(this));

        this._gp = this.snap.g().attr({
            stroke: '#2771FF',
            'stroke-width': '3',
            fill: 'none'
        });

        Object.keys(this._p).forEach(function (p) {
            this._gp.add(this._p[p]);
        }.bind(this));
    };

    Bridge.prototype.triggerRenderPath = function (p) {
        var path = this._p[p];

        if (!path.attr('state')) {
            Snap.animate(
                0,
                Snap.path.getTotalLength(path.attr('targetPath')),
                function (step) {
                    path.attr({
                        path: Snap.path.getSubpath(path.attr('targetPath'), 0, step)
                    });
                }.bind(this),
                2000,
                mina.easeInOut,
                function () {
                    path.attr({ state: 'finished' });
                }
            );
        }
    };

    Bridge.prototype.flush = function () {
        this.init();
        this.draw();

        return this;
    };

    var data = [1, 2];
    var bridges = data.reduce(function(result, item) {
        result.push(new Bridge(
            '#bridge' + item,
            item,
            function () {
                 window.q.successCb(item, data);
            }));
        return result;
    }, []);

    $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;
        bridges[id].flush();
    });

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            var level = e.relatedTarget.getAttribute('data-id');
            if (level == 1) {
                window.q.successCb(level, data);
            }
        }
    });
});
