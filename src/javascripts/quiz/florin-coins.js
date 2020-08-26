var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/florins-coins.styl');
var core = require('../core');

import man1Img from '../../images/man1.png';
import man2Img from '../../images/man2.jpg';
import arrow from '../../images/man-arrow.png';

$(function () {
    var $inputs = $('.florin__man-first input, .florin__man-second input');
    var $reset = $('.reset');
    var $result = $('.result');

    var handleCheck = function (e) {
        var $inputA = $($inputs[0]);
        var $inputB = $($inputs[1]);
        var a = $inputA.val() || 0;
        var b = $inputB.val() || 0;

        if (!Number(a)) {
            $inputA.addClass('error');
            $result.text('Got: ' + 13 * Number(b) + ' florins');
            return;
        } else {
            $inputA.removeClass('error');
        }
        if (!Number(b)) {
            $inputB.addClass('error');
            $result.text('Paid: ' + 7 * Number(a) + ' florins');
            return;
        } else {
            $inputB.removeClass('error');
        }

        var result = 7 * Number(a) - 13 * Number(b);

        if (result === 5) {
            window.q.successCb(1, [1]);
        } else if (e.currentTarget.innerText === 'Check') {
            $('#better_solution_modal').modal('show');
        }

        var resultText = result >= 0 ?
            'Paid: ' + result + ' florins' :
            'Got: ' + (-1 * result) + ' florins';

        $result.text(resultText);
    };

    $inputs.on('keyup', handleCheck);

    $reset.on('click', function () {
        $inputs.val('');
        $result.text('Paid: 0 florins');
    });
});
