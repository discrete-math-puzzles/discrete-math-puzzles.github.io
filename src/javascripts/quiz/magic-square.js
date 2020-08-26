var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/magic-square.styl');
var core = require('../core');

$(function () {
    function recalc() {
        var values = [];
        var invalide = false;
        $('.magic-square-container .field').map(function (i, el) {
            if (!el.value && ((el.value) === '' || el.value == null)) {
                invalide = true;
            }
            values[i] = ~~(el.value) || 0;
        });
        var rights = $('.magic-square-container .output-right');
        rights.map(function (i) {
            rights[i].value = values[ i * 3 ] + values[ i * 3 + 1] + values[ i * 3 + 2]
        });
        var bottoms = $('.magic-square-container .output-bottom');
        rights.map(function (i) {
            bottoms[i].value = values[ i ] + values[ i + 3 ] + values[ i + 6]
        });
        var diagonalMain = $('.magic-square-container .output-bottom-diagonal-main')[0];
        diagonalMain.value = values[ 0 ] + values[ 4 ] + values[ 8];
        var diagonal = $('.magic-square-container .output-bottom-diagonal')[0];
        diagonal.value = values[ 2 ] + values[ 4 ] + values[ 6];

        for (var j = 0; j < invalide.length; j++) {
            var obj = invalide[j];
        }

        if (
            (diagonalMain.value === diagonal.value)
            && (diagonalMain.value === diagonal.value)
            && (diagonalMain.value === bottoms[0].value)
            && (diagonalMain.value === bottoms[1].value)
            && (diagonalMain.value === bottoms[2].value)
            && (diagonalMain.value === rights[0].value)
            && (diagonalMain.value === rights[1].value)
            && (diagonalMain.value === rights[2].value)
            && isValide(values)
        ) {
            window.q.successCb(1, [1])
        }
    }

    function isValide(values) {
        var used = {};
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            if (used[value] || value > 9 || value <= 0) {
                return false;
            }
            used[value] = true;
        }
        return true;
    }

    function reset() {
        $('.magic-square-container .field').map(function (i, el) {
            el.value = '';
        });
        recalc();
    }

    recalc();

    var inputs = $('.magic-square-container input.field');

    inputs
        .keyup(recalc)
        .keyup(function (event) {
            if (
                ~~event.target.value
                && event.keyCode >= '0'.charCodeAt(0)
                && event.keyCode <= '9'.charCodeAt(0)
            ) {
                for (var i = 0; i < inputs.length; i++) {
                    var input = inputs[i];
                    if (input === event.target) {
                        $(inputs[(i+1) % 9]).focus();
                    }
                }
            }
        })
    ;

    $('.reset').on('click', function() {
        reset();
    });
});
