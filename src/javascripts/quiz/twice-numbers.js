var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/twice-numbers.styl');
var core = require('../core');

$(function() {
    var result = [];
    var $numbers = $('.numbers');
    var $path = $('.path');
    var $bestPath = $('.path-best');
    var ANSWER = 33;

    var getPath = function () {
        return window.q.getCookie('numbers-best-path');
    };
    var setPath = function (number) {
        window.q.setCookie('numbers-best-path', number);

        return number;
    };

    var bestPath = getPath();

    if (Boolean(bestPath)) {
        $bestPath.text(bestPath);
    }

    $numbers.on('click', '.numbers__item', function () {
        if (!$(this).hasClass('faded') || $(this).hasClass('checked')) {
            var id = Number($(this).data('id'));
            var index = result.indexOf(id);
            var isExist = index !== -1;
            var operation = isExist ? 'removeClass' : 'addClass';

            $('[data-id="' + id / 2 + '"], [data-id="' + id + '"], [data-id="' + id * 2 + '"]')[operation]('faded');
            $('[data-id="' + id + '"]')[operation]('checked');

            if (isExist) {
                result = result.splice(0, index).concat(result.splice(index + 1));
            } else {
                result.push(id);
            }

            $path.text(result.length);

            if (!bestPath || getPath() < result.length) {
                $bestPath.text(setPath(result.length));
            }

            if ($numbers.find('.numbers__item').length === $numbers.find('.faded').length) {
                if (result.length === ANSWER) {
                    window.q.successCb(1, [1]);
                } else {
                    $('#improve_modal').modal('show');
                }
            }

            result.forEach(function (item) {
                $('[data-id="' + item / 2 + '"], [data-id="' + item + '"], [data-id="' + item * 2 + '"]')
                    .removeClass('faded')
                    .addClass('faded');
            });
        }
    });

    $('.reset').on('click', function () {
        result = [];

        $path.text(result.length);
        $bestPath.text(bestPath);

        $numbers.find('.numbers__item').removeClass('faded').removeClass('checked');
    });
})
