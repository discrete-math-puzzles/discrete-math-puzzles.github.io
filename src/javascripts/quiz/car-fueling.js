var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/car-fueling.styl');
var core = require('../core');

var DISTANCE_ON_TANK = 3;
var FULLTANK = 3;
var DELAY = 500;
var DELTA = 0.5;
var LENGTHS = [7, 8, 8, 13, 13];
var SUCCESSES = [1, 2, false, 4, 4];

$(function() {
    var Road = function(targetName, id, roadDistance, cb) {
        this.$car = $(targetName + " .car");
        this.$tank = $(targetName + " .tank .inner");
        this.$reset = $(targetName + " .reset");
        this.$check = $(targetName + " .check");
        this.$gasolines = $(targetName + " .station img");

        this.$reset.on("click", this.init.bind(this));
        this.$check.on("click", this.start.bind(this));

        this._id = id;
        this._cb = cb || function() {};
        this.interval = null;

        this.roadDistance = roadDistance;
        this.success = SUCCESSES[id - 1];
        this.position = 0;
        this.tank = FULLTANK;
        this.stations = [];

        this.init();
    };

    Road.prototype.init = function() {
        this.position = 0;
        this.stations = [];
        this.tank = FULLTANK;
        this.$car.css({
            left: this.position,
            transition: "left 0s linear",
            marginLeft: 0
        });
        this.$tank.css({ height: "100%" });

        Array.from(this.$gasolines).forEach(function(gasoline) {
            $(gasoline)
                .parent()
                .removeClass("active");
        });

        this.$gasolines.on("click", this.toggleStation(this));

        clearInterval(this.interval);
    };

    Road.prototype.start = function() {
        this.$gasolines.off("click");

        var totalPosition = FULLTANK;
        this.stations.forEach(
            function(station) {
                if (totalPosition >= station) {
                    totalPosition = Math.min(
                        station + FULLTANK,
                        this.roadDistance
                    );
                }
            }.bind(this)
        );

        var carPosition = Math.min(
            (totalPosition / (this.roadDistance - 1)) * 100,
            100
        );
        this.$car.css({
            left: carPosition + "%",
            marginLeft: (-85 * carPosition) / 100 + "px",
            transition: "all " + totalPosition + "s linear"
        });

        this.interval = setInterval(
            function() {
                if (this.tank && this.position + DELTA < this.roadDistance) {
                    this.position += DELTA;
                    this.tank -= DELTA;

                    if (this.stations.includes(this.position)) {
                        this.tank = FULLTANK;
                    }

                    this.render();
                } else {
                    clearInterval(this.interval);

                    if (this.position >= this.roadDistance - 1) {
                        if (this.stations.length === this.success) {
                            this._cb();
                        } else {
                            $(".car-fueling__better__modal").modal("show");
                        }
                    } else {
                        $(".car-fueling__stopped__modal").modal("show");
                    }
                }
            }.bind(this),
            DELAY,
            this
        );
    };

    Road.prototype.toggleStation = function(that) {
        return function() {
            var id = $(this).data("id");
            var index = that.stations.indexOf(id);

            if (index !== -1) {
                that.stations.splice(index, 1);
            } else {
                that.stations.push(id);
            }

            this.stations = that.stations.sort(function(a, b) {
                return a - b;
            });

            $(this)
                .parent()
                .toggleClass("active");
        };
    };

    Road.prototype.render = function() {
        var tankHeight = Math.ceil((this.tank / FULLTANK) * 100);
        this.$tank.css({ height: tankHeight + "%" });
    };

    LENGTHS.reduce(function(result, item, i) {
        result.push(
            new Road("#level" + (i + 1), i + 1, item, function() {
                window.q.successCb(i, LENGTHS);
            })
        );
        return result;
    }, []);

    $(".impossible").on("click", function(e) {
        if (e.currentTarget) {
            var level = $(e.currentTarget).data("id");

            if (!SUCCESSES[level - 1]) {
                window.q.successCb(level - 1, LENGTHS);
            } else {
                $("#possible_modal").modal("show");
            }
        }
    });
});
