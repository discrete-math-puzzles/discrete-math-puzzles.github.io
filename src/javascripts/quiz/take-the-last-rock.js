var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/take-the-last-rock.styl');
var core = require('../core');

$(function () {
    var $modal = $('.take-the-last-rock__modal');

    var DELAY = 3000;
    var data = [2,3,4,5,6,7,11];

    var Rock = function (targetName, rocksCount, id, cb) {
        this.targetName = targetName;
        this.id = id;
        this.rocksCount = rocksCount;
        this.currentCount = this.rocksCount;

        this.$activeTab = $(this.targetName);
        this.$history = this.$activeTab.find('.history');
        this.$pile = this.$activeTab.find('.pile');
        this.$onePile = this.$activeTab.find('.one-rock-pile');
        this.$twoPile = this.$activeTab.find('.two-rocks-pile');
        this.$computerPile = this.$activeTab.find('.computer-pile');

        this._cb = cb;

        this.$activeTab.on('click', '.one-rock-pile:not(.forever):not(.disabled)', this._oneStep.bind(this, false));
        this.$activeTab.on('click', '.two-rocks-pile:not(.forever):not(.disabled)', this._twoStep.bind(this, false));
        this.$activeTab.on('click', '.computer-pile:not(.forever):not(.disabled)', this._computerStep.bind(this, false));
        this.$activeTab.on('click', '.reset:not(.forever):not(.disabled)', this.flush.bind(this));
        $modal.on('click', '.btn', this.flush.bind(this));

        this.flush();
    }

    Rock.prototype.render = function () {
        this.$pile.html(Array(this.currentCount + 1).join('<span class="rock"></span>'));
    }

    Rock.prototype.addLegend = function (message, isComputer) {
        this.$history.prepend('<span class="history-item">' + (!isComputer ? '<span class="label label-success">You</span> ' : '<span class="label label-danger">Your opponent</span> ') + message + '</span>')
    }

    Rock.prototype.flush = function () {
        $('.btn.forever').removeClass('forever').removeClass('disabled');
        this.$history.html('');
        this.currentCount = this.rocksCount;
        this.render();
    }

    Rock.prototype.checkSuccess = function (isComputer) {
        if (this.currentCount <= 0) {
            if (isComputer) {
                $modal.find('.modal-body h4').text('Your opponent has won.');
                $modal.modal('show');
            } else {
                this._cb();
            }

            this.$activeTab.find('.one-rock-pile, .two-rocks-pile, .computer-pile').addClass('forever').addClass('disabled');

            return;
        }

        if (this.currentCount < 2) {
            this.$twoPile.addClass('forever').addClass('disabled');
        }
    }

    Rock.prototype.autostep = function () {
        if (this.currentCount <= 0) {
            return;
        }

        var buttons = $('.one-rock-pile:not(.forever), .two-rocks-pile:not(.forever), .computer-pile:not(.forever), .reset:not(.forever)');

        buttons.addClass('disabled');

        setTimeout(function () {
            var operations = {
                1: 'one',
                2: 'two'
            };
            var shouldTake = this.currentCount % 3;

            if (!shouldTake) {
                shouldTake = Math.random() < 0.5 ? 1 : 2
            }

            if (operations[shouldTake]) {
                eval('this._' + operations[shouldTake] + 'Step(true)');
            }

            buttons.removeClass('disabled');
        }.bind(this), DELAY);
    }

    Rock.prototype.step = function (type, isComputer) {
        this.addLegend('Take ' + type + ' rock' + (type === 'two' ? 's': ''), isComputer);
        this.render();
        this.checkSuccess(isComputer);

        if (!isComputer) {
            this.autostep();
        }
    }

    Rock.prototype._oneStep = function (isComputer) {
        this.currentCount -=1;

        this.step('one', isComputer);
    }

    Rock.prototype._twoStep = function (isComputer) {
        this.currentCount -=2;

        this.step('two', isComputer);
    }

    Rock.prototype._computerStep = function () {
        if (this.rocksCount === 3 || this.rocksCount === 6) {
            this._cb();
            return;
        }

        $('#possible_modal').modal('show');
    }

    var rocks = data.map(function (item, i) {
        return new Rock(
            '#level' + (i + 1),
            item,
            i + 1,
            function () {
                window.q.successCb(i + 1, data);
            }
        );
    });
});
