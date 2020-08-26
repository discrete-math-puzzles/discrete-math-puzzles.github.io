var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/take-the-last-stone.styl');
var core = require('../core');

$(function () {
    var DELAY = 3000;
    var piles = [10, 10];
    var $history = $('.history');
    var $leftPile = $('.pile.left-pile');
    var $rightPile = $('.pile.right-pile');
    var $modal = $('.take-the-last-stone__modal');

    function render() {
        $leftPile.html(Array(piles[0] + 1).join('<span class="rock"></span>'));
        $rightPile.html(Array(piles[1] + 1).join('<span class="rock"></span>'));
    };

    function addLegend(message, isComputer) {
        $history.prepend('<span class="history-item">' + (!isComputer ? '<span class="label label-success">You</span> ' : '<span class="label label-danger">Your opponent</span> ') + message + '</span>');
    };

    function flush() {
        $('.btn.forever').removeClass('forever').removeClass('disabled');
        $history.html('');
        piles = [10, 10];
        render();
        autostep(true);
    };

    function checkSuccess(isComputer) {
        if (piles[0] === 0 && piles[1] === 0) {
            if (isComputer) {
                $modal.find('.modal-body h4').text('Your opponent has won.');
                $modal.modal('show');
            } else {
                window.q.successCb(1, [1]);
            }

            $('.btn.right-pile, .btn.left-pile, .btn.both-pile').addClass('forever').addClass('disabled');

            return;
        }

        if (!piles[0]) {
            $('.btn.left-pile, .btn.both-pile').addClass('forever').addClass('disabled');
        }

        if (!piles[1]) {
            $('.btn.right-pile, .btn.both-pile').addClass('forever').addClass('disabled');
        }
    };

    function autostep(immediate) {
        var buttons = $('.btn.left-pile:not(.forever), .btn.right-pile:not(.forever), .btn.both-pile:not(.forever)');

        buttons.addClass('disabled');
        setTimeout(function () {
            var left = piles[0] % 2;
            var right = piles[1] % 2;

            if (!left && !right) {
                var targets = ['left', 'right', 'both'];

                if (!piles[0]) {
                    targets = ['right'];
                }
                if (!piles[1]) {
                    targets = ['left'];
                }

                var operation = targets[Math.round(Math.random() / targets.length * 10) % targets.length];

                eval(operation + 'Step(true)');
            } else if (left && right) {
                bothStep(true);
            } else if (left) {
                leftStep(true);
            } else {
                rightStep(true);
            }

            $('.btn.left-pile:not(.forever), .btn.right-pile:not(.forever), .btn.both-pile:not(.forever)').removeClass('disabled');
        }.bind(this), immediate ? 50 : DELAY);
    };

    function step(type, isComputer) {
        addLegend('Take one rock from ' + (type === 'both' ? type : 'the ' + type) + ' pile' + (type === 'both' ? 's': ''), isComputer);
        render();
        checkSuccess(isComputer);

        if (!isComputer) {
            autostep();
        }
    };

    function bothStep(isComputer) {
        piles[0] -= 1;
        piles[1] -= 1;

        step('both', isComputer);
    };

    function rightStep(isComputer) {
        piles[1] -= 1;

        step('right', isComputer);
    };

    function leftStep(isComputer) {
        piles[0] -= 1;

        step('left', isComputer);
    };

    autostep(true);

    $('.text-center').on('click', '.btn.both-pile:not(.forever):not(.disabled)', function () { bothStep(); });
    $('.text-center').on('click', '.btn.left-pile:not(.forever):not(.disabled)', function () { leftStep(); });
    $('.text-center').on('click', '.btn.right-pile:not(.forever):not(.disabled)', function () { rightStep(); });
    $('.btn.reset').on('click', function () { flush(); });
    $('.take-the-last-stone__modal .btn').on('click', function () { flush(); });
});
