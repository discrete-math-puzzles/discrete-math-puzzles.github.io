var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/three-hotels.styl');
var core = require('../core');

$(function () {
    var Hotels = function (targetName, data, id, cb) {
        this.targetName = targetName;
        this.id = id;
        this.data = data || {
            weights: {},
            sum: 0,
            isPossible: false
        };

        this.$hotels = $(this.targetName)
        this.$hotel = this.$hotels.find('.hotel-item');
        this.$statistics = {
            path: this.$hotels.parent().find('.path'),
            probes: this.$hotels.parent().find('.probes'),
        };

        this._cb = cb;

        this.init();
        this.addHandlers();

        return this;
    };

    Hotels.prototype.init = function () {
        this.path = [];
        this.weights = Object.assign({}, this.data.weights);

        this.renderResults();
        this.$hotel.removeClass('current').removeClass('wrong');

        return this;
    };

    Hotels.prototype.addHandlers = function () {
        var self = this;

        this.$hotels.on('click', '.hotel-item', function () {
            var name = $(this).data('name');

            if (self.path[self.path.length - 1] === name) {
                $(this).removeClass('current').addClass('wrong');
            } else {
                if (self.weights[name] > 0) {
                    self.$hotel.removeClass('wrong').removeClass('current');
                    $(this).addClass('current');
                    self.path.push(name);
                    self.weights[name]--;
                }
            }

            self.checkOnEnd();
            self.renderResults();
        });

        return this;
    };

    Hotels.prototype.checkOnEnd = function () {
        if (this.weights.A + this.weights.B + this.weights.C === 0) {
            this._cb();
        }
    };

    Hotels.prototype.renderResults = function () {
        this.$statistics.path.text(this.path.join(', ') || '–');
        this.$statistics.probes.text(this.weights.A + ' + ' + this.weights.B + ' + ' + this.weights.C + ' = ' + (this.weights.A + this.weights.B + this.weights.C));
    };


    var data = {
        1: {
            weights: {
                A: 10,
                B: 15,
                C: 20
            },
            sum: 45,
            isPossible: true
        },
        2: {
            weights: {
                A: 10,
                B: 15,
                C: 30
            },
            sum: 55,
            isPossible: false
        },
    };
    var hotels = Object.keys(data).map(function (id) {
        return new Hotels(
            '#level' + id + ' .hotels',
            data[id],
            id,
            function () {
                window.q.successCb(id - 1, Object.keys(data));
            }
        );
    })

    $('.reset').on('click', function (e) {
        var id = $(e.currentTarget).data('id');
        hotels[id - 1] && hotels[id - 1].init();
    });

    $('.impossible').on('click', function (e) {
        if (e.currentTarget) {
            var level = $(e.currentTarget).data('id');

            if (!data[level].isPossible) {
                window.q.successCb(level - 1, Object.keys(data));
            } else {
                $('#possible_modal').modal('show');
            }
        }
    });

    $('.undo').on('click', function (e) {
        if (e.currentTarget) {
            var level = $(e.currentTarget).data('id');
            var hotel = hotels[level - 1];

            if (hotel) {
                var lastStep = hotel.path.pop();

                hotel.weights[lastStep]++;
                hotel.$hotel.removeClass('wrong').removeClass('current');
                $('.hotel-item[data-name="' + hotel.path[hotel.path.length - 1] + '"]').addClass('current');

                hotel.renderResults();
            }
        }
    });
});
