var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/primitive-calculator.styl');
var core = require('../core');

$(function () {
    var $reset = $('.reset');
    var $modal = $('.primitive-calculator__modal');
    var $first = $('.first');
    var $second = $('.second');
    var $third = $('.third');

    var levels = [6, 8, 20, 34, 99];
    var answers = [2, 3, 4, 6, 6];
    var presses = [0, 0, 0, 0, 0]

    var errors = {
        wrong: 'You’ve got n, but it is possible to get it in a smaller number of clicks.'
    };

    function handler (e) {
        var $target = $(e.target);
        var $field = $('.tab-pane.active .field');
        var id = $target.data('id') - 1;
        var value = 0;

        if ($target.hasClass('first')) {
            value = Number($('.tab-pane.active .field').text()) + 1;
        } else if ($target.hasClass('second')) {
            value = Number($('.tab-pane.active .field').text()) * 2;
        } else if ($target.hasClass('third')) {
            value = Number($('.tab-pane.active .field').text()) * 3;
        }

        $field.text(value);
        presses[id] += 1;

        $('.tab-pane.active .statistics').text('Press count: ' + presses[id]);

        if (levels[id] === value) {
            if (answers[id] === presses[id]) {
                window.q.successCb(id, levels);
            } else {
                $modal.find('.modal-body h4').text(errors.wrong);
                $modal.modal('show');
            }
        }
    }

    $first.on('click', handler);
    $second.on('click', handler);
    $third.on('click', handler);

    $reset.on('click', function (e) {
        presses[$(e.target).data('id') - 1] = 0;
        $('.tab-pane.active .field').text('1');
        $('.tab-pane.active .statistics').text('Press count: 0');
    });
})
