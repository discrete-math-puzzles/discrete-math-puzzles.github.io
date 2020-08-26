var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/clock-game.styl');
var core = require('../core');

$(function () {
    var $modal = $('.clock-game__modal');

    var Clock = function (targetName, k, id, cb) {
        this.targetName = targetName;
        this.id = id;
        this.k = k;
        this.N = Math.pow(2, k) - 1;
        this.count = 0;

        this.lower = 1;
        this.upper = this.N;

        this.$activeTab = $(this.targetName);
        this.$coutner = this.$activeTab.find('.history .counter');
        this.$history = this.$activeTab.find('.history .content');
        this.$input = this.$activeTab.find('.form-control');
        this.$ask = this.$activeTab.find('.ask');
        this.$reset = this.$activeTab.find('.reset');

        this._cb = cb;

        this.$ask.on('click', this.step.bind(this));
        this.$reset.on('click', this.flush.bind(this));

        $modal.on('click', '.btn', this.flush.bind(this));
    }

    Clock.prototype.flush = function () {
        this.lower = 1;
        this.upper = this.N;
        this.m = null;
        this.count = 0;

        this.$history.addClass('gray').text('History is empty. Make your prediction.');
        this.$coutner.text('There are ' + this.k + ' questions left.');
        this.$input.removeAttr('disabled');
        this.$ask.removeAttr('disabled');
    }

    Clock.prototype.step = function () {
        var userSuggestion = this.$input.val();

        if (isNaN(Number(userSuggestion))) {
            this.$input.addClass('error');
            return;
        } else {
            this.$input.removeClass('error');
        }

        userSuggestion = Number(userSuggestion);

        this.count++;
        this.$input.val('');

        if (this.$history.hasClass('gray')) {
            this.$history.removeClass('gray').html('');
        }

        this.$coutner.text('There are ' + (this.k - this.count <= 0 ? 'no' : (this.k - this.count)) + ' questions left.');

        if (this.count >= this.k) {
            this.$input.attr('disabled', 'disabled');
            this.$ask.attr('disabled', 'disabled');
        } else {
            this.$input.removeAttr('disabled');
            this.$ask.removeAttr('disabled');
        }

        if (userSuggestion < this.lower) {
            this.$history.append('<div>x is larger than ' + userSuggestion + '</div>');
        } else if (userSuggestion > this.upper) {
            this.$history.append('<div>x is smaller than ' + userSuggestion + '</div>');
        } else if (userSuggestion === this.lower && userSuggestion === this.upper) {
            this.$history.append('<div>Congratulations! x is equal to ' + userSuggestion + '</div>');

            if (this.count <= this.k) {
                this._cb();
            } else {
                $modal.modal('show');
            }
        } else if (this.upper - userSuggestion >=userSuggestion - this.lower) {
            this.$history.append('<div>x is larger than ' + userSuggestion + '</div>');
            this.lower = Number(userSuggestion) + 1;
            this.lower = this.lower > this.upper ? this.upper : this.lower;
        } else if (this.upper - userSuggestion < userSuggestion - this.lower) {
            this.$history.append('<div>x is smaller than ' + userSuggestion + '</div>');
            this.upper = Number(userSuggestion) - 1;
        }
    }

    var data = [2, 4, 7, 21];
    var clocks = data.map(function (item, i) {
        return new Clock(
            '#level' + (i + 1),
            item,
            i + 1,
            function () {
                window.q.successCb(i + 1, data);
            }
        );
    });
});
