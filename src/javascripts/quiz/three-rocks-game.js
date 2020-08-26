var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/three-rocks-game.styl');
var core = require('../core');

$(function () {
    var DELAY = 3000;
    var piles = [10, 10];
    var $history = $('.history');
    var $leftPile = $('.pile.left-pile');
    var $rightPile = $('.pile.right-pile');
    var $modal = $('.three-rocks-game__modal');
    var pileIndexes = [[0, 1], [0, 2], [0, 3], [1,0], [1, 1], [1, 2], [2, 0], [2, 1], [3, 0]];
    var availableIndexes = pileIndexes;

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
        availableIndexes = pileIndexes;
        render();
        autostep(true);
    };

    function checkSuccess(isComputer) {
        availableIndexes = [];

        if (piles[0] === 0 && piles[1] === 0) {
            if (isComputer) {
                $modal.find('.modal-body h4').text('Your opponent has won.');
                $modal.modal('show');
            } else {
                window.q.successCb(1, [1]);
            }

            pileIndexes.forEach(function (item) {
                $('.btn.take' + item[0] + item[1]).addClass('forever').addClass('disabled');
            });

            return;
        }

        pileIndexes.forEach(function (item) {
            if (piles[0] - item[0] < 0 || piles[1] - item[1] < 0) {
                $('.btn.take' + item[0] + item[1]).addClass('forever').addClass('disabled');
            } else {
                availableIndexes.push(item);
            }
        });
    };

    function autostep(immediate) {
        var classes = pileIndexes.reduce(function(res, item) { res.push('.btn.take' + item[0] + item[1] + ':not(.forever)'); return res }, []).join(', ');
        var buttons = $(classes);

        buttons.addClass('disabled');

        setTimeout(function () {
            var stepWasMade = false;

            availableIndexes.forEach(function(item) {
                if ((piles[0] + piles[1] - item[0] - item[1]) % 4 === 0 && !stepWasMade) {
                    eval('take' + item[0] + item[1] + '(true)')
                    stepWasMade = true
                }
            })

            if (!stepWasMade) {
                var item = availableIndexes[Math.round(Math.random() / availableIndexes.length * 10) % availableIndexes.length];
                eval('take' + item[0] + item[1] + '(true)')
            }

            buttons.removeClass('disabled');
        }.bind(this), immediate ? 50 : DELAY);
    };

    function getPileLegend(count, type) {
        return (count !== 0 ? count === 1 ? 'a rock from the ' + type + ' pile' : count + ' rock (s) from the ' + type + ' pile' : '');
    }

    function step(left, right, isComputer) {
        var llegend = getPileLegend(left, 'left');
        var rlegend = getPileLegend(right, 'right');
        var legend = 'Take ' + (llegend !== '' && rlegend !== '' ? llegend + ' and ' + rlegend : llegend + rlegend);

        addLegend(legend, isComputer);
        render();
        checkSuccess(isComputer);

        if (!isComputer) {
            autostep();
        }
    };

    function take01(isComputer) { piles[1] -= 1;                step(0, 1, isComputer); }
    function take02(isComputer) { piles[1] -= 2;                step(0, 2, isComputer); }
    function take03(isComputer) { piles[1] -= 3;                step(0, 3, isComputer); }
    function take10(isComputer) { piles[0] -= 1;                step(1, 0, isComputer); }
    function take11(isComputer) { piles[0] -= 1; piles[1] -= 1; step(1, 1, isComputer); }
    function take12(isComputer) { piles[0] -= 1; piles[1] -= 2; step(1, 2, isComputer); }
    function take20(isComputer) { piles[0] -= 2;                step(2, 0, isComputer); }
    function take21(isComputer) { piles[0] -= 2; piles[1] -= 1; step(2, 1, isComputer); }
    function take30(isComputer) { piles[0] -= 3;                step(3, 0, isComputer); }

    autostep(true);

    $('.text-center').on('click', '.btn.take01:not(.forever):not(.disabled)', function () { take01(); });
    $('.text-center').on('click', '.btn.take02:not(.forever):not(.disabled)', function () { take02(); });
    $('.text-center').on('click', '.btn.take03:not(.forever):not(.disabled)', function () { take03(); });
    $('.text-center').on('click', '.btn.take10:not(.forever):not(.disabled)', function () { take10(); });
    $('.text-center').on('click', '.btn.take11:not(.forever):not(.disabled)', function () { take11(); });
    $('.text-center').on('click', '.btn.take12:not(.forever):not(.disabled)', function () { take12(); });
    $('.text-center').on('click', '.btn.take20:not(.forever):not(.disabled)', function () { take20(); });
    $('.text-center').on('click', '.btn.take21:not(.forever):not(.disabled)', function () { take21(); });
    $('.text-center').on('click', '.btn.take30:not(.forever):not(.disabled)', function () { take30(); });
    $('.btn.reset').on('click', function () { flush(); });
    $('.three-rocks-game__modal .btn').on('click', function () { flush(); });
});
