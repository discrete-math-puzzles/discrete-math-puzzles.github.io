var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/numbers-in-boxes.styl');
var core = require('../core');

$(function () {
    var fields = $('.numbers-on-chessboard-content .field');
    var fieldsMatrix = [];
    for (var i = 0; i < 8; i++) {
        fieldsMatrix[i] = [];
        for (var j = 0; j < 8; j++) {
            fieldsMatrix[i][j] = fields[8 * i + j];
        }
    }

    $('.reset').on('click', function () {
        fields.val('').removeClass('invalid');
    });

    function isValid(input) {
        var $input = $(input);
        var value = ~~input.value;
        return value > 0 && value < 64 && !$input.hasClass('invalid');
    }

    fields.keyup(function (e) {
        var used = {};
        fields.removeClass('invalid');
        fields.toArray().forEach(function (input, i) {
            var $input = $(input);
            var value = ~~input.value;
            if (input.value === '') {
                return;
            }
            if (!isValid(input) || used[value]) {
                if (used[value]) {
                    used[value].addClass('invalid');
                }
                $input.addClass('invalid');
                return;
            }
            used[value] = $input;
            getNeighbors(Math.floor(i / 8), i % 8).forEach(function (neighbor) {
                if (!isValid(input)) {
                    return;
                }
                var neighborValue = ~~neighbor.value;
                if (neighborValue - value > 4) {
                    $input.addClass('invalid');
                    $(neighbor).addClass('invalid');
                }
            });
        });

    });

    function getNeighbors(i, j) {
        var neighbors = [];

        if (fieldsMatrix[i - 1]) {
            neighbors.push(fieldsMatrix[i - 1][j]);
        }
        if (fieldsMatrix[i][j - 1]) {
            neighbors.push(fieldsMatrix[i][j - 1]);
        }
        if (fieldsMatrix[i][j + 1]) {
            neighbors.push(fieldsMatrix[i][j + 1]);
        }
        if (fieldsMatrix[i + 1]) {
            neighbors.push(fieldsMatrix[i + 1][j]);
        }
        return neighbors;
    }

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            window.q.successCb(1, [1]);
        }
    });
});
